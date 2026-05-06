#!/bin/bash
set -e

# =============================================
# 长程智能体编排脚本
# 根据 .agent-state/ 中的状态决定运行哪个 Agent
# =============================================

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# 检查 API Key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "ERROR: ANTHROPIC_API_KEY not set"
    echo "Run: export ANTHROPIC_API_KEY=sk-ant-your-key"
    exit 1
fi

mkdir -p .agent-state/session_log

# 判断运行哪个 Agent
if [ ! -f ".agent-state/progress.json" ]; then
    # ===== 首次运行 → Initializer =====
    ROLE="initializer"
    PROMPT="使用 initializer agent 角色初始化项目。需求：开发一个贪吃蛇游戏，使用 React + Vite，Canvas API 绘制，要求有计分、暂停（空格键）、难度递增（每吃 5 个食物加速）、游戏结束和重新开始功能。"
else
    # ===== 检查是否全部完成 =====
    TOTAL=$(python3 -c "import json; print(len(json.load(open('.agent-state/feature_list.json'))))" 2>/dev/null || echo "0")
    DONE=$(python3 -c "import json; print(sum(1 for x in json.load(open('.agent-state/feature_list.json')) if x['passes']))" 2>/dev/null || echo "0")

    if [ "$TOTAL" -gt 0 ] && [ "$DONE" -eq "$TOTAL" ]; then
        echo "=== ALL FEATURES COMPLETED ($DONE/$TOTAL) ==="
        exit 0
    fi

    # ===== 后续运行 → Worker =====
    ROLE="worker"
    PROMPT="使用 worker agent 角色。读取进度文件，选择下一个未完成的特性，实现它。"
fi

SESSION_ID="S$(date +%Y%m%d%H%M%S)"
LOG_FILE=".agent-state/session_log/${SESSION_ID}.md"

echo "=========================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting ${ROLE} session"
echo "Session ID: ${SESSION_ID}"
echo "=========================================="

# 运行 Claude Code
claude -p "$PROMPT" 2>&1 | tee "$LOG_FILE"

echo ""
echo "=========================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Session ${SESSION_ID} completed"
echo "=========================================="

# 显示进度
if [ -f ".agent-state/progress.json" ] && [ -f ".agent-state/feature_list.json" ]; then
    python3 -c "
import json
p = json.load(open('.agent-state/progress.json'))
f = json.load(open('.agent-state/feature_list.json'))
done = sum(1 for x in f if x['passes'])
print(f'Progress: {done}/{len(f)} features completed')
print(f'Status: {p[\"current_status\"]}')
"
fi
