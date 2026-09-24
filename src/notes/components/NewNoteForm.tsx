import { useState } from "react";
import type { Cue } from "../types";

interface NewNoteFormProps {
  cues: Cue[];
  defaultCueId?: string;
  onSubmit: (input: { cueId: string; content: string; author: string }) => void;
}

/** 排练现场快速留批注：选 Cue、写内容、记提出人 */
export function NewNoteForm({ cues, defaultCueId, onSubmit }: NewNoteFormProps) {
  const [cueId, setCueId] = useState(defaultCueId ?? cues[0]?.id ?? "");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");

  const canSubmit = cueId !== "" && content.trim() !== "" && author.trim() !== "";

  return (
    <form
      className="new-note panel"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({ cueId, content, author });
        setContent("");
      }}
    >
      <div className="heading">
        <div>
          <p>排练进行中</p>
          <h2>留下临时批注</h2>
        </div>
      </div>
      <div className="new-note-grid">
        <label>
          <span>挂到哪条 Cue</span>
          <select value={cueId} onChange={(e) => setCueId(e.target.value)}>
            {cues.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} · {c.summary}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>提出人</span>
          <input
            value={author}
            placeholder="如：导演 林姐 / 灯光 小王"
            onChange={(e) => setAuthor(e.target.value)}
          />
        </label>
        <label className="wide">
          <span>批注内容</span>
          <textarea
            value={content}
            rows={2}
            placeholder="如：Q3 追光起手位置偏左，等走位再定"
            onChange={(e) => setContent(e.target.value)}
          />
        </label>
      </div>
      <div className="new-note-foot">
        <button type="submit" className="primary" disabled={!canSubmit}>
          添加批注
        </button>
        {!canSubmit && <span className="hint">Cue、提出人、内容都填好才能记录</span>}
      </div>
    </form>
  );
}
