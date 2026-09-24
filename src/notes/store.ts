import { useCallback, useEffect, useRef, useState } from "react";
import type { DeskState, NoteStatus } from "./types";
import { initialState } from "./initialData";
import {
  addNote as addNoteRule,
  attachNote,
  moveCue as moveCueRule,
  removeCue as removeCueRule,
  setStatus as setStatusRule,
} from "./rules";

/**
 * 数据层：批注数据的唯一来源。
 * 只负责状态存取与持久化（localStorage），不包含任何界面逻辑；
 * 具体的「跟随 / 失联 / 重挂」规则全部在 rules.ts 中。
 */

const STORAGE_KEY = "rehearsal-note-desk:v1";

function loadState(): DeskState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(initialState);
    const parsed = JSON.parse(raw) as DeskState;
    if (!Array.isArray(parsed.cues) || !Array.isArray(parsed.notes)) {
      return structuredClone(initialState);
    }
    return parsed;
  } catch {
    return structuredClone(initialState);
  }
}

let noteSeq: number | null = null;

function makeId(prefix: string): string {
  if (noteSeq === null) noteSeq = Math.floor(Math.random() * 1e6);
  noteSeq += 1;
  return `${prefix}-${Date.now().toString(36)}-${noteSeq}`;
}

export interface NewNoteInput {
  cueId: string;
  content: string;
  author: string;
}

export function useNoteDesk() {
  const [state, setState] = useState<DeskState>(loadState);
  const writeTimer = useRef<number | null>(null);

  // 重开浏览器后继续处理：每次状态变化都落盘
  useEffect(() => {
    if (writeTimer.current !== null) window.clearTimeout(writeTimer.current);
    writeTimer.current = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 120);
    return () => {
      if (writeTimer.current !== null) window.clearTimeout(writeTimer.current);
    };
  }, [state]);

  const addNote = useCallback((input: NewNoteInput) => {
    setState((s) =>
      addNoteRule(s, {
        ...input,
        id: makeId("note"),
        now: Date.now(),
      }),
    );
  }, []);

  const setStatus = useCallback((noteId: string, status: NoteStatus) => {
    setState((s) => setStatusRule(s, noteId, status));
  }, []);

  /** Cue 调序：批注不搬移，只靠 cueId 跟着原 Cue */
  const moveCue = useCallback((cueId: string, direction: -1 | 1) => {
    setState((s) => moveCueRule(s, cueId, direction));
  }, []);

  /** Cue 移走：挂在它上面的批注整体进入失联区 */
  const removeCue = useCallback((cueId: string) => {
    setState((s) => removeCueRule(s, cueId));
  }, []);

  /** 失联批注重新挂到别的 Cue */
  const attach = useCallback((noteId: string, cueId: string) => {
    setState((s) => attachNote(s, noteId, cueId));
  }, []);

  const resetDemo = useCallback(() => {
    const fresh = structuredClone(initialState);
    setState(fresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  }, []);

  return { state, addNote, setStatus, moveCue, removeCue, attach, resetDemo };
}
