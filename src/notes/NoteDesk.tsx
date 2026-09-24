import { useMemo, useState } from "react";
import { useNoteDesk } from "./store";
import { orphanNotes, pendingCount } from "./rules";
import type { NoteStatus, StatusFilter } from "./types";
import { NewNoteForm } from "./components/NewNoteForm";
import { CueColumn } from "./components/CueColumn";
import { OrphanZone } from "./components/OrphanZone";

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待处理" },
  { key: "in-progress", label: "处理中" },
  { key: "done", label: "已处理" },
];

/** 列表界面：只负责展示与交互，数据来自 store，绑定规则来自 rules */
export function NoteDesk() {
  const { state, addNote, setStatus, moveCue, removeCue, attach, resetDemo } =
    useNoteDesk();
  const [filter, setFilter] = useState<StatusFilter>("all");

  const pending = useMemo(() => pendingCount(state), [state]);
  const orphanCount = useMemo(() => orphanNotes(state).length, [state]);
  const visibleCueCount = useMemo(
    () =>
      state.cues.filter((c) =>
        state.notes.some(
          (n) =>
            n.cueId === c.id &&
            (filter === "all" || n.status === filter),
        ),
      ).length,
    [state, filter],
  );
  const statusCount = useMemo(() => {
    const map: Record<NoteStatus, number> = {
      pending: 0,
      "in-progress": 0,
      done: 0,
    };
    for (const n of state.notes) map[n.status] += 1;
    return map;
  }, [state]);

  return (
    <main className="app">
      <section className="hero">
        <p>hxyfront-62002 · 排练批注台</p>
        <h1>{state.showTitle}</h1>
        <span>
          灯光师在 Cue 上留下的临时批注统一在这里跟进。批注绑定 Cue 身份而非列表位置：
          Cue 调序时批注跟着原 Cue 走；Cue 被移走后批注进入失联区，保留原顺序，可重新挂接。
          数据自动保存在本机，重开页面继续处理。
        </span>
      </section>

      <section className="metrics">
        <article>
          <small>Cue 数量</small>
          <strong>{state.cues.length}</strong>
        </article>
        <article>
          <small>批注总数</small>
          <strong>{state.notes.length}</strong>
        </article>
        <article>
          <small>待处理</small>
          <strong className={pending > 0 ? "metric-alert" : ""}>{pending}</strong>
        </article>
        <article>
          <small>失联待重挂</small>
          <strong className={orphanCount > 0 ? "metric-alert" : ""}>
            {orphanCount}
          </strong>
        </article>
      </section>

      <NewNoteForm cues={state.cues} onSubmit={addNote} />

      <section className="panel list-panel">
        <div className="heading">
          <div>
            <p>复排检查</p>
            <h2>Cue 批注列表</h2>
          </div>
          <button
            type="button"
            className="ghost"
            title="清空本机数据并恢复示例"
            onClick={() => {
              window.confirm("确定恢复示例数据？当前批注将被清空。") &&
                resetDemo();
            }}
          >
            恢复示例
          </button>
        </div>

        <div className="filter-bar" role="tablist" aria-label="按处理状态筛选">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const count =
              f.key === "all" ? state.notes.length : statusCount[f.key];
            return (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={active}
                className={`filter-chip ${active ? "active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                <span className="filter-count">{count}</span>
              </button>
            );
          })}
          {filter === "pending" && (
            <span className="filter-tip">复排前只看待处理条目，逐条销项</span>
          )}
        </div>

        <div className="cue-list">
          {state.cues.map((cue, index) => (
            <CueColumn
              key={cue.id}
              state={state}
              cue={cue}
              position={index}
              total={state.cues.length}
              filter={filter}
              onStatus={setStatus}
              onMove={moveCue}
              onRemove={removeCue}
            />
          ))}
          {visibleCueCount === 0 && (
            <p className="empty-hint">
              当前筛选下没有挂在 Cue 上的批注
              {filter === "pending" ? "，可以安心复排。" : "。"}
            </p>
          )}
        </div>
      </section>

      <OrphanZone
        state={state}
        filter={filter}
        onStatus={setStatus}
        onAttach={attach}
      />
    </main>
  );
}
