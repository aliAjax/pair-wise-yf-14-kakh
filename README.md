# hxyfront-62002 剧场灯光 · 排练批注台

源提示词编号：2

排练中灯光师会在某个 Cue 上留下临时批注（内容、提出人、处理状态），散排后统一在本页跟进，复排前可一键只看「待处理」条目。

## 核心规则

- **批注绑定 Cue 身份（cueId），不绑定列表位置**：Cue 调序（↑/↓）只重排 Cue 数组，批注数据一条不动，渲染时仍按 cueId 找到原 Cue，因此批注跟着原 Cue 移动，绝不会串到相邻条目。
- **Cue 移走 → 失联区**：删除某条 Cue 后，挂在它上面的批注整体进入「失联区」，保留原顺序（seq）、内容、提出人、状态以及原 Cue 编号。
- **重新挂接**：失联区的每条批注可选择任意现存 Cue 挂回；重挂只改绑定，不新建批注，并在新 Cue 组里继续按原记录顺序排队。不允许挂到不存在的 Cue。
- **持久化**：所有数据自动存入 localStorage，重开浏览器继续处理；可随时「恢复示例」。

## 代码分层

| 位置 | 职责 |
| --- | --- |
| `src/notes/types.ts` | 数据模型（Cue / RehearsalNote / 状态） |
| `src/notes/initialData.ts` | 首开示例数据 |
| `src/notes/rules.ts` | **重挂规则层**：跟随 / 失联 / 重挂 / 排序，纯函数，不依赖 React 与存储 |
| `src/notes/store.ts` | **数据层**：`useNoteDesk` 状态与 localStorage 持久化 |
| `src/notes/components/*`、`src/notes/NoteDesk.tsx` | **列表界面层**：筛选、Cue 列表、批注卡片、失联区、新增表单 |

## 技术栈

React 19 + Vite 7 + TypeScript（严格模式）

## 本地运行

```bash
npm install
npm run dev
```

开发端口：62002

构建校验：`npm run build`（含 `tsc --noEmit` 类型检查）
