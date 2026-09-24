import type { Cue, DeskState, NoteStatus, RehearsalNote } from "./types";

/**
 * 规则层：批注与 Cue 的跟随 / 失联 / 重挂规则。
 * 全部为纯函数，不碰 localStorage、不碰 React，便于单独推演与测试。
 *
 * 核心不变量：
 * 1. 批注通过 cueId 锁定「原 Cue」，Cue 调序只重排 cues 数组，
 *    notes 一条都不动 —— 因此批注不会串到相邻条目；
 * 2. Cue 被移走（删除）时，cueId 指向它的批注置空并保留
 *    seq / 内容 / 提出人 / 状态 / 原编号，进入失联区；
 * 3. 重挂只改 cueId，不新建批注；同 Cue 下以及失联区内一律按 seq 升序，
 *    即保留排练现场记录的原顺序；
 * 4. 不允许重挂到不存在的 Cue（防止再次凭空失联）。
 */

export function sortNotesInPlace(notes: RehearsalNote[]): RehearsalNote[] {
  return notes.sort((a, b) => a.seq - b.seq);
}

/** 取出挂在某 Cue 上的批注，按记录原顺序（seq）排列 */
export function notesOfCue(state: DeskState, cueId: string): RehearsalNote[] {
  return state.notes
    .filter((n) => n.cueId === cueId)
    .sort((a, b) => a.seq - b.seq);
}

/** 失联区：cueId 为 null（原 Cue 已移走），保留原顺序 */
export function orphanNotes(state: DeskState): RehearsalNote[] {
  return state.notes
    .filter((n) => n.cueId === null)
    .sort((a, b) => a.seq - b.seq);
}

export interface AddNoteArgs {
  id: string;
  cueId: string;
  content: string;
  author: string;
  now: number;
}

export function addNote(state: DeskState, args: AddNoteArgs): DeskState {
  const { content, author } = args;
  const trimmedContent = content.trim();
  const trimmedAuthor = author.trim();
  if (!trimmedContent || !trimmedAuthor || !state.cues.some((c) => c.id === args.cueId)) {
    return state;
  }
  const note: RehearsalNote = {
    id: args.id,
    cueId: args.cueId,
    content: trimmedContent,
    author: trimmedAuthor,
    status: "pending",
    seq: state.nextSeq,
    createdAt: args.now,
    orphanFromLabel: null,
  };
  return {
    ...state,
    notes: sortNotesInPlace([...state.notes, note]),
    nextSeq: state.nextSeq + 1,
  };
}

export function setStatus(
  state: DeskState,
  noteId: string,
  status: NoteStatus,
): DeskState {
  return {
    ...state,
    notes: state.notes.map((n) => (n.id === noteId ? { ...n, status } : n)),
  };
}

/**
 * Cue 调序：只交换 cues 数组中的位置，notes 完全不参与计算。
 * 批注下一次渲染时仍按 cueId 找到同一条 Cue，天然跟着移动。
 */
export function moveCue(
  state: DeskState,
  cueId: string,
  direction: -1 | 1,
): DeskState {
  const index = state.cues.findIndex((c) => c.id === cueId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= state.cues.length) return state;
  const cues = [...state.cues];
  [cues[index], cues[target]] = [cues[target], cues[index]] as [Cue, Cue];
  return { ...state, cues };
}

/**
 * Cue 移走：删掉 Cue，挂在它上面的批注逐条脱离（保留全部原始信息），
 * 其余 Cue 与批注不受影响。
 */
export function removeCue(state: DeskState, cueId: string): DeskState {
  const cue = state.cues.find((c) => c.id === cueId);
  if (!cue) return state;
  return {
    ...state,
    cues: state.cues.filter((c) => c.id !== cueId),
    notes: sortNotesInPlace(
      state.notes.map((n) =>
        n.cueId === cueId
          ? { ...n, cueId: null, orphanFromLabel: cue.label }
          : n,
      ),
    ),
  };
}

/**
 * 失联批注重新挂接：只改 cueId 并清掉失联标记；seq 不动，
 * 所以在新 Cue 的批注组里它仍按「原记录时刻」排队。
 */
export function attachNote(
  state: DeskState,
  noteId: string,
  cueId: string,
): DeskState {
  const note = state.notes.find((n) => n.id === noteId);
  if (!note || note.cueId !== null) return state;
  if (!state.cues.some((c) => c.id === cueId)) return state;
  return {
    ...state,
    notes: sortNotesInPlace(
      state.notes.map((n) =>
        n.id === noteId ? { ...n, cueId, orphanFromLabel: null } : n,
      ),
    ),
  };
}

/** 待处理统计：复排前一眼看到还有几条没处理完 */
export function pendingCount(state: DeskState): number {
  return state.notes.filter((n) => n.status === "pending").length;
}
