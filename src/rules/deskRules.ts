import type {
  Annotation,
  AnnStatus,
  Cue,
  DeskState,
} from "../data/types";
import { createId } from "../data/storage";

// 规则层：Cue 调序 / 删除 / 批注重挂的全部规则，纯函数，不依赖 React。
// 关键约定：
// - 批注通过 cueId 跟随原 Cue，Cue 调序只动 Cue 数组，批注绝不串位；
// - Cue 被移走（删除）后，其批注进入失联区（cueId = null），
//   保留原顺序、原内容，并快照原 Cue 名称；
// - 失联批注可整体或单条重新挂到现存的任意 Cue 末尾。

function nextOrderFor(annotations: Annotation[], cueId: string): number {
  let max = -1;
  for (const a of annotations) {
    if (a.cueId === cueId && a.order > max) max = a.order;
  }
  return max + 1;
}

// ── Cue 操作 ──────────────────────────────────────────────

export function addCue(
  state: DeskState,
  input: { name: string; scene: string },
): DeskState {
  const cue: Cue = {
    id: createId("cue"),
    name: input.name.trim() || `Cue ${state.cues.length + 1}`,
    scene: input.scene.trim(),
  };
  return { ...state, cues: [...state.cues, cue] };
}

/** 把 Cue 在触发顺序中上移 / 下移；批注不做任何改动，天然跟随原 Cue */
export function moveCue(
  state: DeskState,
  cueId: string,
  direction: -1 | 1,
): DeskState {
  const index = state.cues.findIndex((c) => c.id === cueId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= state.cues.length) return state;

  const cues = [...state.cues];
  [cues[index], cues[target]] = [cues[target], cues[index]];
  return { ...state, cues };
}

/**
 * 移走 Cue：Cue 从表中删除，其批注进入失联区。
 * 失联序号按“被删 Cue 在原顺序中的位置 → Cue 内批注顺序”连续分配，
 * 因此失联区保留了原始先后次序，且不会与已有失联批注冲突。
 */
export function removeCue(state: DeskState, cueId: string): DeskState {
  const cue = state.cues.find((c) => c.id === cueId);
  if (!cue) return state;

  let orphanBase = state.annotations.reduce(
    (max, a) => (a.orphanOrder !== null && a.orphanOrder > max ? a.orphanOrder : max),
    -1,
  );

  const annotations = state.annotations.map((a) => {
    if (a.cueId !== cueId) return a;
    orphanBase += 1;
    return {
      ...a,
      cueId: null,
      originCueName: cue.name,
      orphanOrder: orphanBase,
    };
  });

  return {
    ...state,
    cues: state.cues.filter((c) => c.id !== cueId),
    annotations,
  };
}

export function renameShow(state: DeskState, showName: string): DeskState {
  return { ...state, showName: showName.trim() || state.showName };
}

// ── 批注操作 ──────────────────────────────────────────────

export function addAnnotation(
  state: DeskState,
  input: { cueId: string; content: string; author: string },
): DeskState {
  if (!state.cues.some((c) => c.id === input.cueId)) return state;
  const content = input.content.trim();
  if (!content) return state;

  const annotation: Annotation = {
    id: createId("ann"),
    cueId: input.cueId,
    content,
    author: input.author.trim() || "匿名",
    status: "pending",
    order: nextOrderFor(state.annotations, input.cueId),
    orphanOrder: null,
    originCueName: null,
    createdAt: Date.now(),
  };
  return { ...state, annotations: [...state.annotations, annotation] };
}

export function updateAnnotationContent(
  state: DeskState,
  annotationId: string,
  content: string,
): DeskState {
  const text = content.trim();
  if (!text) return state;
  return {
    ...state,
    annotations: state.annotations.map((a) =>
      a.id === annotationId ? { ...a, content: text } : a,
    ),
  };
}

export function setAnnotationStatus(
  state: DeskState,
  annotationId: string,
  status: AnnStatus,
): DeskState {
  return {
    ...state,
    annotations: state.annotations.map((a) =>
      a.id === annotationId ? { ...a, status } : a,
    ),
  };
}

/** 删除批注（无论是否失联） */
export function removeAnnotation(
  state: DeskState,
  annotationId: string,
): DeskState {
  return {
    ...state,
    annotations: state.annotations.filter((a) => a.id !== annotationId),
  };
}

/**
 * 重新挂载：把失联批注挂到现存 Cue 的末尾。
 * 内容、提出人、处理状态、创建时间原样保留，只改挂载关系与顺序；
 * 若该失联 Cue 名下的多条批注一起重挂，则保持它们彼此之间的原顺序。
 */
export function reattachAnnotation(
  state: DeskState,
  annotationId: string,
  targetCueId: string,
): DeskState {
  if (!state.cues.some((c) => c.id === targetCueId)) return state;
  const target = state.annotations.find((a) => a.id === annotationId);
  if (!target || target.cueId !== null) return state;

  let cursor = nextOrderFor(state.annotations, targetCueId);
  return {
    ...state,
    annotations: state.annotations.map((a) => {
      if (a.id !== annotationId) return a;
      const next = {
        ...a,
        cueId: targetCueId,
        orphanOrder: null,
        originCueName: null,
        order: cursor,
      };
      cursor += 1;
      return next;
    }),
  };
}

/** 把某条失联批注“原 Cue 名”下的全部失联批注按原顺序一起重挂 */
export function reattachOrphanGroup(
  state: DeskState,
  originCueName: string,
  targetCueId: string,
): DeskState {
  if (!state.cues.some((c) => c.id === targetCueId)) return state;

  const group = state.annotations
    .filter(
      (a) => a.cueId === null && a.originCueName === originCueName,
    )
    .sort((a, b) => (a.orphanOrder ?? 0) - (b.orphanOrder ?? 0));
  if (group.length === 0) return state;

  let cursor = nextOrderFor(state.annotations, targetCueId);
  const groupIds = new Set(group.map((a) => a.id));
  return {
    ...state,
    annotations: state.annotations.map((a) => {
      if (!groupIds.has(a.id)) return a;
      const next = {
        ...a,
        cueId: targetCueId,
        orphanOrder: null,
        originCueName: null,
        order: cursor,
      };
      cursor += 1;
      return next;
    }),
  };
}
