import { useEffect, useState } from "react";
import "./styles.css";
import { useDeskStore } from "./state/useDeskStore";
import type { StatusFilter } from "./data/types";
import { FilterBar } from "./components/FilterBar";
import { CueCard } from "./components/CueCard";
import { OrphanZone } from "./components/OrphanZone";
import { AddCueForm } from "./components/AddCueForm";

const AUTHOR_KEY = "rehearsal-annotation-desk:lastAuthor";

function App() {
  const { state, actions, views } = useDeskStore();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [lastAuthor, setLastAuthor] = useState<string>(() => {
    try {
      return localStorage.getItem(AUTHOR_KEY) ?? "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      if (lastAuthor) localStorage.setItem(AUTHOR_KEY, lastAuthor);
    } catch {
      // ignore
    }
  }, [lastAuthor]);

  const totalAnnotations = state.annotations.length;

  return (
    <main className="app">
      <section className="hero">
        <p>排练批注台 · Rehearsal Annotation Desk</p>
        <h1>
          <input
            className="show-name-input"
            value={state.showName}
            onChange={(e) => actions.renameShow(e.target.value)}
            aria-label="演出 / 排练名称"
          />
        </h1>
        <span>
          灯光师在 Cue 上留下的临时批注都登记在此：记录批注内容、提出人与处理状态；
          Cue 调序批注跟随原 Cue，Cue 移走后批注进入失联区，可重新挂到别的 Cue。数据自动保存在本机，重开继续处理。
        </span>
        <div className="hero__footer">
          <span className="save-hint">✓ 已自动保存到本机</span>
          <button
            className="ghost-btn"
            onClick={() => {
              if (window.confirm("恢复为示例数据？当前所有批注与 Cue 都会被清空。")) {
                actions.resetToSeed();
              }
            }}
          >
            重置为示例
          </button>
        </div>
      </section>

      <section className="metrics">
        <article>
          <small>Cue 数量</small>
          <strong>{state.cues.length}</strong>
        </article>
        <article>
          <small>批注总数</small>
          <strong>{totalAnnotations}</strong>
        </article>
        <article className="metrics--pending">
          <small>待处理</small>
          <strong>{views.counts.pending}</strong>
        </article>
        <article>
          <small>失联区</small>
          <strong>{views.orphans.length}</strong>
        </article>
      </section>

      <FilterBar
        filter={filter}
        onChange={setFilter}
        counts={views.counts}
        total={totalAnnotations}
      />

      <section className="cue-list">
        {views.cueViews.length === 0 && (
          <section className="panel">
            <p className="empty-line">Cue 表为空，先在下方新增一个 Cue。</p>
          </section>
        )}
        {views.cueViews.map((view, index) => {
          const shown = views.filter(view.annotations, filter);
          // 非“全部”筛选时，没有匹配批注的 Cue 折叠隐藏，复排更聚焦
          if (filter !== "all" && shown.length === 0) return null;
          return (
            <section key={view.cue.id} className="panel">
              <CueCard
                cue={view.cue}
                index={index}
                total={state.cues.length}
                annotations={shown}
                filter={filter}
                onMove={(direction) => actions.moveCue(view.cue.id, direction)}
                onRemoveCue={() => actions.removeCue(view.cue.id)}
                onAddAnnotation={(content, author) =>
                  actions.addAnnotation({ cueId: view.cue.id, content, author })
                }
                onStatusChange={actions.setAnnotationStatus}
                onContentChange={actions.updateAnnotationContent}
                onRemoveAnnotation={actions.removeAnnotation}
                lastAuthor={lastAuthor}
                onAuthorChange={setLastAuthor}
              />
            </section>
          );
        })}
      </section>

      <OrphanZone
        orphans={views.filter(views.orphans, filter)}
        cueViews={views.cueViews}
        filter={filter}
        onReattach={actions.reattach}
        onReattachGroup={actions.reattachGroup}
        onStatusChange={actions.setAnnotationStatus}
        onContentChange={actions.updateAnnotationContent}
        onRemoveAnnotation={actions.removeAnnotation}
      />

      <AddCueForm onAdd={actions.addCue} />
    </main>
  );
}

export default App;
