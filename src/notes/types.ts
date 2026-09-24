/**
 * 排练批注台 —— 数据模型
 *
 * 批注通过 cueId 与 Cue 建立绑定关系：
 * - cueId 指向某条现存 Cue 时，批注随该 Cue 走（Cue 调序只动 cues 数组顺序，
 *   批注不做任何搬移，因此绝不会串到相邻条目）；
 * - cueId 为 null 时，批注位于「失联区」，等待重新挂接。
 */

/** 批注处理状态 */
export type NoteStatus = "pending" | "in-progress" | "done";

/** 列表筛选：全部 / 仅待处理 / 处理中 / 已处理 */
export type StatusFilter = "all" | NoteStatus;

export interface Cue {
  /** 稳定身份：调序、重编号都不变，批注靠它锁定「原 Cue」 */
  id: string;
  /** Cue 编号（如 12、Q2.5），可与数组顺序不同 */
  label: string;
  /** Cue 内容描述，如灯光变化名称 */
  summary: string;
}

export interface RehearsalNote {
  id: string;
  /** 所挂 Cue；Cue 被移走时置为 null，批注进入失联区 */
  cueId: string | null;
  content: string;
  /** 提出人，如「灯光 小王」「导演」 */
  author: string;
  status: NoteStatus;
  /** 全局递增序号，决定同 Cue 内与失联区内的原顺序 */
  seq: number;
  createdAt: number;
  /** 进入失联区时记录原 Cue 编号，仅作展示与追溯 */
  orphanFromLabel: string | null;
}

export interface DeskState {
  showTitle: string;
  cues: Cue[];
  notes: RehearsalNote[];
  nextSeq: number;
}
