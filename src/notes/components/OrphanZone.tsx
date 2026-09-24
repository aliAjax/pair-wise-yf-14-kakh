import { useState } from "react";
import type {
  Cue,
  DeskState,
  NoteStatus,
  RehearsalNote,
  StatusFilter,
} from "../types";
import { orphanNotes } from "../rules";
import { NoteCard } from "./NoteCard";

interface OrphanZoneProps {
  state: DeskState;
  filter: StatusFilter;
  onStatus: (noteId: string, status: NoteStatus) => void;
  onAttach: (noteId: string, cueId: string) => void;
}

/**
 * 失联区：原 Cue 已移走的批注。顺序、内容、提出人、状态全部原样保留，
 * 每条可选择现存的任意 Cue 重新挂回。
 */
export function OrphanZone({ state, filter, onStatus, onAttach }: OrphanZoneProps) {
  const all = orphanNotes(state);
  const visible = filter === "all" ? all : all.filter((n) => n.status === filter);

  if (visible.length === 0) return null;

  return (
    <section className="orphan-zone panel">
      <header className="orphan-head">
        <div>
          <h2>📡 失联区（{all.length}）</h2>
          <p>
            这些批注原来挂在已移走的 Cue 上，顺序与内容保持原样。选择一条现存
            Cue 即可重新挂回，不会新建批注。
          </p>
        </div>
      </header>
      <div className="orphan-list">
        {visible.map((note) => (
          <OrphanCard
            key={note.id}
            note={note}
            cues={state.cues}
            onStatus={onStatus}
            onAttach={onAttach}
          />
        ))}
      </div>
    </section>
  );
}

function OrphanCard({
  note,
  cues,
  onStatus,
  onAttach,
}: {
  note: RehearsalNote;
  cues: Cue[];
  onStatus: (noteId: string, status: NoteStatus) => void;
  onAttach: (noteId: string, cueId: string) => void;
}) {
  const [target, setTarget] = useState("");

  return (
    <NoteCard
      note={note}
      onStatus={onStatus}
      dimmed
      action={
        <div className="reattach">
          <span className="orphan-from">原挂 {note.orphanFromLabel ?? "未知 Cue"}</span>
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="">选择 Cue…</option>
            {cues.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} · {c.summary}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="primary"
            disabled={!target}
            onClick={() => {
              if (target) {
                onAttach(note.id, target);
                setTarget("");
              }
            }}
          >
            重新挂接
          </button>
        </div>
      }
    />
  );
}
