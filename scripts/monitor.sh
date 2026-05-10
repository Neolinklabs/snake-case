#!/bin/bash
set -euo pipefail

# =============================================
# Issue 监控脚本（整合版）
# 发现 claude-pending 的 Issue 后调用 processor.sh 处理
# =============================================

# 倒计时函数：逐秒显示剩余时间
countdown() {
    local remaining=$1
    while [ "$remaining" -gt 0 ]; do
        local mins=$((remaining / 60))
        local secs=$((remaining % 60))
        printf "\r⏳ 下次轮询: %02d:%02d " "$mins" "$secs"
        sleep 1
        remaining=$((remaining - 1))
    done
    echo ""
}

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="${REPO_DIR}/.agent-state/automation-log"
MAX_CONCURRENT=${MAX_CONCURRENT:-1}
POLL_INTERVAL=${POLL_INTERVAL:-300}

mkdir -p "$LOG_DIR"

cd "$REPO_DIR"

# 确保自动化标签存在（幂等，已存在不会报错）
for LABEL_ARGS in \
  "claude-pending 0E8A16 等待 Claude Agent 处理" \
  "claude-in-progress FBCA04 Claude Agent 处理中" \
  "claude-testing 1D76DB Claude Agent 正在跑测试" \
  "claude-failed E11D48 Claude Agent 处理失败" \
  "claude-skipped 6E7781 Claude Agent 跳过处理" \
  "claude-ready-for-review 8B5CF6 Claude Agent 已完成，等待人工 Review"; do
  gh label create $LABEL_ARGS 2>/dev/null || true
done

echo "============================================"
echo "Issue Monitor 启动"
echo "仓库: $(git remote get-url origin)"
echo "轮询间隔: ${POLL_INTERVAL}s"
echo "最大并发: ${MAX_CONCURRENT}"
echo "============================================"

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

    # 查询 claude-pending 的 Issue
    PENDING_ISSUES=$(gh issue list \
        --label "claude-pending" \
        --state open \
        --json number,title,labels,body \
        --limit 10 2>/dev/null || echo "[]")

    COUNT=$(echo "$PENDING_ISSUES" | python3 -c "
import sys, json
issues = json.load(sys.stdin)
print(len(issues))
" 2>/dev/null || echo "0")

    if [ "$COUNT" -eq 0 ]; then
        echo "[${TIMESTAMP}] 无待处理 Issue，${POLL_INTERVAL}s 后重试"
        countdown "$POLL_INTERVAL"
        continue
    fi

    echo "[${TIMESTAMP}] 发现 ${COUNT} 个待处理 Issue"

    # 处理每个 Issue（调用 Processor）
    echo "$PENDING_ISSUES" | python3 -c "
import sys, json
issues = json.load(sys.stdin)
for i in issues:
    print(f\"{i['number']}|||{i['title']}\")
" | while IFS='|||' read -r ISSUE_NUM ISSUE_TITLE; do
        echo ""
        echo "--- 处理 Issue #${ISSUE_NUM}: ${ISSUE_TITLE} ---"

        # 标记为 in-progress
        gh issue edit "$ISSUE_NUM" --add-label "claude-in-progress" --remove-label "claude-pending"
        gh issue comment "$ISSUE_NUM" --body "🤖 Claude Agent 已接管此 Issue，正在分析..."

        # 调用 Processor
        LOG_FILE="${LOG_DIR}/issue-${ISSUE_NUM}-$(date +%Y%m%d%H%M%S).log"
        if bash "${REPO_DIR}/scripts/processor.sh" "$ISSUE_NUM" > "$LOG_FILE" 2>&1; then
            echo "Issue #${ISSUE_NUM} 处理成功"
        else
            echo "Issue #${ISSUE_NUM} 处理失败，查看日志: ${LOG_FILE}"
            gh issue edit "$ISSUE_NUM" --add-label "claude-failed" --remove-label "claude-in-progress"
            gh issue comment "$ISSUE_NUM" --body "❌ Claude Agent 处理失败，已转人工处理。日志见 \`${LOG_FILE}\`"
        fi
    done

    countdown "$POLL_INTERVAL"
done
