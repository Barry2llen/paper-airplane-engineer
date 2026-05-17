# Paper Airplane Engineer｜纸飞机工程师

## 项目简介

一个面向航空科普教育的纸飞机设计沙盒游戏。玩家通过调整机翼面积、重心位置、翼梢小翼、上反角、投掷力度和投掷角度等参数，设计并试飞纸飞机，在 3D 风洞环境中完成远航、滞空和鸡蛋空投任务。

## 核心功能

- 参数化纸飞机设计
- 3D 物理试飞
- 实时遥测数据
- 任务挑战与评分
- AI 工程师反馈
- 航空知识解释

## 技术栈

- Next.js
- React
- TypeScript
- Three.js / React Three Fiber
- Zustand
- Gemini API，可选

## 本地运行

```bash
npm install
npm run dev
```

## 构建与检查

```bash
npm run lint
npm run build
```

## 环境变量

`GEMINI_API_KEY` 可选。没有配置时，系统会使用本地规则生成工程师反馈，现场演示不依赖远程 AI。
