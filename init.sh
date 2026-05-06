#!/bin/bash
# init.sh - 验证开发环境可正常启动
set -e

echo "=== 贪吃蛇项目初始化验证 ==="

# 检查 node_modules
if [ ! -d "node_modules" ]; then
  echo "[1/3] 安装依赖..."
  npm install
else
  echo "[1/3] 依赖已安装 ✓"
fi

# 检查关键文件
echo "[2/3] 检查项目结构..."
required_files=(
  "package.json"
  "vite.config.js"
  "index.html"
  "src/main.jsx"
  "src/App.jsx"
  "src/index.css"
  "src/App.css"
  "feature_list.json"
)
for f in "${required_files[@]}"; do
  if [ ! -f "$f" ]; then
    echo "  ✗ 缺少文件: $f"
    exit 1
  fi
done
echo "  ✓ 所有必需文件存在"

# 启动 dev server 并验证
echo "[3/3] 启动开发服务器验证..."
npx vite --host 0.0.0.0 --port 5173 &
VITE_PID=$!

# 等待 server 就绪
for i in $(seq 1 15); do
  if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "  ✓ 开发服务器启动成功 (PID: $VITE_PID)"
    break
  fi
  if [ $i -eq 15 ]; then
    echo "  ✗ 开发服务器启动超时"
    kill $VITE_PID 2>/dev/null
    exit 1
  fi
  sleep 1
done

# 停止 server
kill $VITE_PID 2>/dev/null
wait $VITE_PID 2>/dev/null

echo ""
echo "=== 验证通过 ==="
echo "运行 'npm run dev' 启动开发服务器"
