import { useState } from "react";
import type { Annotation, Cue, StatusFilter } from "../data/types";
import { AnnotationItem } from "./AnnotationItem";

interface CueCardProps {
  cue: Cue;
  index: number;
  total: number;
  annotations: Annotation[];
  filter: StatusFilter;
  onMove: (direction: -1 | 1) => void;
  onRemoveCue: () => void;
  onAddAnnotation: (content: string, author: string) => void;
  onStatusChange: (annotationId: string, status: Annotation["status"]) => void;
  onContentChange: (annotationId: string, content: string) => void;
  onRemoveAnnotation: (annotationId: string) => void;
  lastAuthor: string;
  onAuthorChange: (author: string) => void;
}

export function CueCard({
  cue,
  index,
  total,
  annotations,
  filter,
  onMove,
  onRemoveCue,
  onAddAnnotation,
  onStatusChange,
  onContentChange,
  onRemoveAnnotation,
  lastAuthor,
  onAuthorChange,
}: CueCardProps) {
  const [draft, setDraft] = useState("");
  const [author, setAuthor] = useState(lastAuthor);
  const pendingCount = annotations.filter((a) => a.status === "pending").length;

  const submit = () => {
    if (!draft.trim()) return;
    onAddAnnotation(draft, author);
    onAuthorChange(author);
    setDraft("");
  };

  return (
    <article className="cue-card">
      <header className="cue-card__head">
        <div className="cue-card__title">
          <span className="cue-card__index">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <h3>{cue.name}</h3>
            <p>{cue.scene || "未填写场景说明"}</p>
          </div>
          <span className="cue-card__badges">
            <span className="badge badge--count" title="批注总数">
              {annotations.length} 条批注
            </span>
            {pendingCount > 0 && (
              <span className="badge badge--pending">{pendingCount} 待处理</span>
            )}
          </span>
        </div>
        <div className="cue-card__controls">
          <button
            className="icon-btn"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            title="上移（批注跟随本 Cue）"
          >
            ↑
          </button>
          <button
            className="icon-btn"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            title="下移（批注跟随本 Cue）"
          >
            ↓
          </button>
          <button
            className="ghost-btn ghost-btn--danger"
            onClick={onRemoveCue}
            title="移走该 Cue，其批注进入失联区"
          >
            移走 Cue
          </button>
        </div>
      </header>

      <div className="cue-card__anns">
        {annotations.length === 0 ? (
          <p className="empty-line">
            {filter === "all" ? "本 Cue 还没有批注" : "当前筛选下没有批注"}
          </p>
        ) : (
          annotations.map((a) => (
            <AnnotationItem
              key={a.id}
              annotation={a}
              onStatusChange={(status) => onStatusChange(a.id, status)}
              onContentChange={(content) => onContentChange(a.id, content)}
              onRemove={() => onRemoveAnnotation(a.id)}
            />
          ))
        )}
      </div>

      <div className="composer">
        <input
          className="composer__author"
          value={author}
          placeholder="提出人"
          onChange={(e) => setAuthor(e.target.value)}
          aria-label="提出人"
        />
        <input
          className="composer__content"
          value={draft}
          placeholder="写下这条 Cue 上的临时批注，回车添加…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        <button className="primary" onClick={submit} disabled={!draft.trim()}>
          记批注
        </button>
      </div>
    </article>
  );
}
