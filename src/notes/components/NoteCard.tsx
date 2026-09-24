import type { NoteStatus, RehearsalNote } from "../types";

/** 状态元数据：徽标文案与配色集中在这里，列表与失联区共用 */
export const STATUS_META: Record<
  NoteStatus,
  { label: string; badge: string; next: NoteStatus | null }
> = {
  pending: { label: "待处理", badge: "status-pending", next: "in-progress" },
  "in-progress": {
    label: "处理中",
    badge: "status-progress",
    next: "done",
  },
  done: { label: "已处理", badge: "status-done", next: "pending" },
};

const STATUS_OPTIONS: NoteStatus[] = ["pending", "in-progress", "done"];

interface NoteCardProps {
  note: RehearsalNote;
  onStatus: (noteId: string, status: NoteStatus) => void;
  /** 失联区重挂控件由父组件提供，挂在批注卡片尾部 */
  action?: React.ReactNode;
  dimmed?: boolean;
}

export function NoteCard({ note, onStatus, action, dimmed }: NoteCardProps) {
  const time = new Date(note.createdAt).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className={`note-card ${dimmed ? "is-dimmed" : ""}`}>
      <header className="note-head">
        <span className={`status-badge ${STATUS_META[note.status].badge}`}>
          {STATUS_META[note.status].label}
        </span>
        <span className="note-meta">
          {note.author} · {time} · #{note.seq}
        </span>
      </header>
      <p className="note-content">{note.content}</p>
      <footer className="note-foot">
        <label className="status-select">
          <span>处理状态</span>
          <select
            value={note.status}
            onChange={(e) => onStatus(note.id, e.target.value as NoteStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </label>
        {action}
      </footer>
    </article>
  );
}
