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

## Issue 处理规则

当你的任务是处理 GitHub Issue 时，遵守以下规则：

### 通用规则
- 仔细阅读 Issue 的完整描述，理解用户遇到的问题
- 如果 Issue 中提到了相关文件，优先阅读这些文件
- 如果 Issue 中有"实现思路"或"涉及文件"，参考这些信息

### Bug 修复
- 先复现 Bug（按照 Issue 中的复现步骤）
- 找到根因后再修复，不要猜测
- 修复要精确：只改需要改的地方
- 添加回归测试防止 Bug 再次出现

### 功能实现
- 先阅读现有代码理解架构
- 按照验收标准逐条实现
- 为新功能编写测试
- 保持与现有代码风格一致

### 代码变更规范
- 不要做与 Issue 无关的改动
- 不要修改 lint/format 配置
- 不要添加新的依赖（除非 Issue 明确要求）
- git commit message 格式：[fix/feat #N] 简要描述

## 跳过条件

如果 Issue 满足以下任一条件，不要处理，标记为 claude-skipped：
- 涉及安全漏洞或认证/授权
- 需要修改数据库 schema 或迁移
- 需要添加新的外部依赖
- Issue 描述不清晰，无法确定具体要做什么
- 标记了 "help-wanted" 或 "good-first-issue"