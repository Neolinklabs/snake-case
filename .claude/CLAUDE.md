# 贪吃蛇游戏项目

## 项目概述
一个使用 React 开发的贪吃蛇游戏，具备计分、暂停、难度递增功能。

## 技术栈
- React 18 + Vite
- 纯 CSS 样式（不用 UI 框架）
- 使用 Canvas API 绘制游戏画面

## Agent 行为规则

### 双角色模式
- 如果 .agent-state/progress.json 不存在 → 你是 Initializer Agent
- 如果存在且有 passes: false 的特性 → 你是 Worker Agent
- 如果所有特性都 passes: true → 报告项目完成

### Initializer Agent 职责
1. 分析需求，拆解为 10-15 个具体特性
2. 创建 feature_list.json（所有特性 passes: false）
3. 创建 React 项目脚手架（npx create-react-app 或 vite）
4. 创建 init.sh 启动脚本
5. 初始化 Git 并首次提交
6. 写入 progress.json

### Worker Agent 职责
1. 读取 progress.json 和 git log，了解上次进度
2. 读取 feature_list.json，选优先级最高的未完成特性
3. 运行 init.sh 确认现有功能正常
4. 只实现一个特性
5. 端到端测试（启动 dev server，验证功能）
6. git commit（格式：[F###] 简要描述）
7. 更新 progress.json
8. 只能在通过测试后才能将 passes 改为 true

### 禁止事项
- 绝不能删除或修改 feature_list.json 中的特性描述
- 绝不能在没有测试的情况下标记 passes: true
- 绝不能一次实现多个特性
- 绝不能跳过 init.sh 验证步骤
