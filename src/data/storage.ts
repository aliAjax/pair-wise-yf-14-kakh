import type { DeskState } from "./types";
import { createSeedState } from "./seed";

// 持久化：只负责读写存档，不包含任何业务规则。
const STORAGE_KEY = "rehearsal-annotation-desk:v1";

function isState(value: unknown): value is DeskState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.showName === "string" &&
    Array.isArray(v.cues) &&
    Array.isArray(v.annotations)
  );
}

export function loadState(): DeskState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed: unknown = JSON.parse(raw);
    if (isState(parsed)) return parsed;
    return createSeedState();
  } catch {
    return createSeedState();
  }
}

export function saveState(state: DeskState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 隐私模式或存储已满时静默降级，界面仍可继续使用
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}
