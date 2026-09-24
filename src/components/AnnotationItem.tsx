import { useEffect, useRef, useState } from "react";
import type { Annotation } from "../data/types";
import { STATUS_META, STATUS_ORDER } from "../data/status";

interface AnnotationItemProps {
  annotation: Annotation;
  /** 失联条目展示原 Cue 名；挂载条目不展示 */
  orphan?: boolean;
  /** 失联条目重挂时可选择的现存 Cue */
  reattachTargets?: { id: string; name: string }[];
  onStatusChange: (status: Annotation["status"]) => void;
  onRemove: () => void;
  onContentChange: (content: string) => void;
  onReattach?: (targetCueId: string) => void;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AnnotationItem({
  annotation,
  orphan = false,
  reattachTargets = [],
  onStatusChange,
  onRemove,
  onContentChange,
  onReattach,
}: AnnotationItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(annotation.content);
  const [target, setTarget] = useState(reattachTargets[0]?.id ?? "");
  const editRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) editRef.current?.focus();
  }, [editing]);

  const meta = STATUS_META[annotation.status];

  const commitEdit = () => {
    if (draft.trim()) onContentChange(draft);
    else setDraft(annotation.content);
    setEditing(false);
  };

  return (
    <article className={`ann ann--${meta.tone}${orphan ? " ann--orphan" : ""}`}>
      <div className="ann__body">
        {orphan && annotation.originCueName && (
          <span className="ann__origin">来自已移走的 {annotation.originCueName}</span>
        )}
        {editing ? (
          <textarea
            ref={editRef}
            className="ann__editor"
            value={draft}
            rows={2}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commitEdit();
              }
              if (e.key === "Escape") {
                setDraft(annotation.content);
                setEditing(false);
              }
            }}
          />
        ) : (
          <p
            className="ann__content"
            title="点击修改批注内容"
            onClick={() => {
              setDraft(annotation.content);
              setEditing(true);
            }}
          >
            {annotation.content}
          </p>
        )}
        <div className="ann__meta">
          <span className="ann__author">{annotation.author}</span>
          <time>{formatTime(annotation.createdAt)}</time>
        </div>
      </div>

      <div className="ann__actions">
        <div className="ann__status" role="group" aria-label="处理状态">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              className={`status-btn status-btn--${STATUS_META[s].tone}${
                annotation.status === s ? " is-active" : ""
              }`}
              onClick={() => onStatusChange(s)}
              title={STATUS_META[s].hint}
            >
              {STATUS_META[s].label}
            </button>
          ))}
        </div>
        {orphan && onReattach && (
          <div className="ann__reattach">
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              {reattachTargets.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              className="link-btn"
              disabled={!target}
              onClick={() => onReattach(target)}
            >
              重新挂上
            </button>
          </div>
        )}
        <button className="ghost-btn ann__delete" onClick={onRemove} title="删除批注">
          删除
        </button>
      </div>
    </article>
  );
}
