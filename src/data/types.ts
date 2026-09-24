// 数据层：排练批注台的数据结构定义
// Cue 与批注均以稳定 id 关联，Cue 调序只改 Cue 数组顺序，批注不会串位。

export type AnnStatus = "pending" | "doing" | "done";

export interface Cue {
  id: string;
  /** Cue 编号，如 Cue 12 */
  name: string;
  /** 场景说明，如“二幕开场 · 冷蓝侧光” */
  scene: string;
}

export interface Annotation {
  id: string;
  /** 所挂载的 Cue；null 表示已进入失联区 */
  cueId: string | null;
  /** 批注内容 */
  content: string;
  /** 提出人 */
  author: string;
  /** 处理状态 */
  status: AnnStatus;
  /** 挂在同一 Cue 下时的先后顺序，创建时按追加序号分配 */
  order: number;
  /** 进入失联区后的先后顺序；仍挂载时为 null */
  orphanOrder: number | null;
  /** 失联时快照原 Cue 名称，便于在失联区辨认来处 */
  originCueName: string | null;
  createdAt: number;
}

export interface DeskState {
  showName: string;
  /** 按触发顺序排列的 Cue */
  cues: Cue[];
  annotations: Annotation[];
}

export type StatusFilter = "all" | AnnStatus;
