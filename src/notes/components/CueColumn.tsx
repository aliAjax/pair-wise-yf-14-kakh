import type { Cue, DeskState, NoteStatus, StatusFilter } from "../types";
import { notesOfCue } from "../rules";
import { NoteCard } from "./NoteCard";

interface CueColumnProps {
  state: DeskState;
  cue: Cue;
  position: number;
  total: number;
  filter: StatusFilter;
  onStatus: (noteId: string, status: NoteStatus) => void;
  onMove: (cueId: string, direction: -1 | 1) => void;
  onRemove: (cueId: string) => void;
}

/** 一条 Cue 及其批注：批注按 cueId 从同一数据源取出，调序时随整条 Cue 移动 */
export function CueColumn({
  state,
  cue,
  position,
  total,
  filter,
  onStatus,
  onMove,
  onRemove,
}: CueColumnProps) {
  const all = notesOfCue(state, cue.id);
  const visible =
    filter === "all" ? all : all.filter((n) => n.status === filter);

  // 非「全部」视图下，没有命中批注的 Cue 整条隐藏，复排前只看相关条目
  if (visible.length === 0) return null;
  const hiddenDone = all.length - visible.length;

  return (
    <article className="cue-card">
      <header className="cue-head">
        <div className="cue-title">
          <span className="cue-order">{String(position + 1).padStart(2, "0")}</span>
          <div>
            <h3>{cue.label}</h3>
            <p>{cue.summary}</p>
          </div>
        </div>
        <div className="cue-actions">
          <button
            type="button"
            title="上移（批注跟随本 Cue）"
            disabled={position === 0}
            onClick={() => onMove(cue.id, -1)}
          >
            ↑
          </button>
          <button
            type="button"
            title="下移（批注跟随本 Cue）"
            disabled={position === total - 1}
            onClick={() => onMove(cue.id, 1)}
          >
            ↓
          </button>
          <button
            type="button"
            className="danger"
            title="移走 Cue，批注进入失联区"
            onClick={() => {
              if (all.length > 0) {
                window.confirm(
                  `「${cue.label}」上有 ${all.length} 条批注，移走后它们将进入失联区，可重新挂接。确定移走？`,
                ) && onRemove(cue.id);
              } else {
                onRemove(cue.id);
              }
            }}
          >
            移走
          </button>
        </div>
      </header>
      <div className="cue-notes">
        {visible.map((note) => (
          <NoteCard key={note.id} note={note} onStatus={onStatus} />
        ))}
      </div>
      {hiddenDone > 0 && (
        <p className="cue-hint">另有 {hiddenDone} 条不在当前筛选中的批注</p>
      )}
    </article>
  );
}
