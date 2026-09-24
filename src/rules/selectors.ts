import type {
  Annotation,
  Cue,
  DeskState,
  StatusFilter,
} from "../data/types";

// 派生视图：从原始状态中取出“按 Cue 分组、保持顺序”的批注，
// 以及失联区条目。界面只消费这些视图，不直接操作数据结构。

export interface CueView {
  cue: Cue;
  annotations: Annotation[];
}

/** 按 Cue 触发顺序返回分组视图；同一 Cue 内按追加顺序排列 */
export function selectCueViews(state: DeskState): CueView[] {
  return state.cues.map((cue) => ({
    cue,
    annotations: state.annotations
      .filter((a) => a.cueId === cue.id)
      .sort((a, b) => a.order - b.order),
  }));
}

/** 失联区：进入失联的先后顺序（保留各原 Cue 内部原序） */
export function selectOrphans(state: DeskState): Annotation[] {
  return state.annotations
    .filter((a) => a.cueId === null)
    .sort((a, b) => (a.orphanOrder ?? 0) - (b.orphanOrder ?? 0));
}

export function filterAnnotations(
  annotations: Annotation[],
  filter: StatusFilter,
): Annotation[] {
  if (filter === "all") return annotations;
  return annotations.filter((a) => a.status === filter);
}

export function statusCounts(
  state: DeskState,
): Record<"pending" | "doing" | "done", number> {
  const counts = { pending: 0, doing: 0, done: 0 };
  for (const a of state.annotations) counts[a.status] += 1;
  return counts;
}

export function cueAnnotationCount(state: DeskState, cueId: string): number {
  return state.annotations.filter((a) => a.cueId === cueId).length;
}
