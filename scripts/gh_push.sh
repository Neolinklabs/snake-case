#!/bin/bash
set -euo pipefail

# =============================================
# 通过 GitHub Git Database API 推送代码
# 用法: gh_push.sh <branch_name> <base_sha>
# 当 git push 因网络问题失败时作为回退方案
# =============================================

BRANCH_NAME="$1"
BASE_SHA="$2"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$REPO_DIR"

# 从 git remote URL 提取 owner/repo
REPO=$(git remote get-url origin | sed 's|https://github.com/||' | sed 's|.git$||')

echo "通过 GitHub API 推送到 ${REPO} 分支 ${BRANCH_NAME}"

export REPO BRANCH_NAME BASE_SHA

python3 << 'PYTHON_EOF'
import subprocess, json, sys, base64, os

repo = os.environ["REPO"]
branch = os.environ["BRANCH_NAME"]
base_sha = os.environ["BASE_SHA"]

def gh_api(endpoint, method="GET", input_data=None):
    cmd = ["gh", "api", f"repos/{repo}/{endpoint}", "--method", method]
    if input_data is not None:
        cmd.extend(["--input", "-"])
    result = subprocess.run(
        cmd,
        input=input_data.encode("utf-8") if input_data else None,
        capture_output=True
    )
    stdout = result.stdout.decode("utf-8")
    stderr = result.stderr.decode("utf-8")
    if result.returncode != 0:
        raise Exception(f"gh api {endpoint} failed: {stderr}")
    return json.loads(stdout)

def git_cmd(*args):
    result = subprocess.run(list(args), capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(f"git {' '.join(args)} failed: {result.stderr}")
    return result.stdout.strip()

# Step 1: 获取 base commit 的 tree SHA
print(f"获取 base commit {base_sha} 的 tree...")
base_commit = gh_api(f"git/commits/{base_sha}")
base_tree_sha = base_commit["tree"]["sha"]

# Step 2: 枚举变更文件
print("枚举变更文件...")
diff_output = git_cmd("git", "diff", "--name-status", base_sha, "HEAD")
changed_files = []
for line in diff_output.split("\n"):
    if not line.strip():
        continue
    parts = line.split("\t")
    status = parts[0][0]  # 取首字母，兼容 R100 等格式
    path = parts[-1]
    changed_files.append((status, path))

if not changed_files:
    print("没有变更文件")
    sys.exit(1)

print(f"发现 {len(changed_files)} 个变更文件")

# Step 3: 构建 tree entries 并上传 blob
tree_entries = []
for status, path in changed_files:
    if status == "D":
        tree_entries.append({
            "path": path, "mode": "100644",
            "type": "blob", "sha": None
        })
        print(f"  删除: {path}")
    else:
        # 获取文件 mode 和 SHA
        ls_output = git_cmd("git", "ls-tree", "HEAD", "--", path)
        parts = ls_output.split()
        mode = parts[0]
        # blob sha = parts[2]

        # 上传 blob
        with open(path, "rb") as f:
            content_b64 = base64.b64encode(f.read()).decode()

        blob = gh_api("git/blobs", method="POST",
                      input_data=json.dumps({"content": content_b64, "encoding": "base64"}))
        tree_entries.append({
            "path": path, "mode": mode,
            "type": "blob", "sha": blob["sha"]
        })
        print(f"  上传: {path}")

# Step 4: 创建 tree
print("创建 tree...")
tree_payload = {
    "base_tree": base_tree_sha,
    "tree": tree_entries
}
new_tree = gh_api("git/trees", method="POST", input_data=json.dumps(tree_payload))

# Step 5: 获取本地 commit 元信息并创建 commit
print("创建 commit...")
commit_msg = git_cmd("git", "log", "--format=%B", "-1", "HEAD").rstrip("\n")
author = {
    "name": git_cmd("git", "log", "--format=%an", "-1", "HEAD"),
    "email": git_cmd("git", "log", "--format=%ae", "-1", "HEAD"),
    "date": git_cmd("git", "log", "--format=%aI", "-1", "HEAD"),
}
committer = {
    "name": git_cmd("git", "log", "--format=%cn", "-1", "HEAD"),
    "email": git_cmd("git", "log", "--format=%ce", "-1", "HEAD"),
    "date": git_cmd("git", "log", "--format=%cI", "-1", "HEAD"),
}

commit_payload = {
    "message": commit_msg,
    "tree": new_tree["sha"],
    "parents": [base_sha],
    "author": author,
    "committer": committer,
}
new_commit = gh_api("git/commits", method="POST", input_data=json.dumps(commit_payload))
print(f"commit: {new_commit['sha']}")

# Step 6: 创建或更新分支 ref
print(f"创建分支 {branch}...")
try:
    gh_api("git/refs", method="POST",
           input_data=json.dumps({"ref": f"refs/heads/{branch}", "sha": new_commit["sha"]}))
except Exception:
    # 分支已存在，更新引用
    print("分支已存在，更新引用...")
    gh_api(f"git/refs/heads/{branch}", method="PATCH",
           input_data=json.dumps({"sha": new_commit["sha"], "force": True}))

print(f"成功推送 {new_commit['sha'][:7]} 到 {branch}")
PYTHON_EOF

echo "API 推送完成"
