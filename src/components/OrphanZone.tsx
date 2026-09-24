import { useMemo, useState } from "react";
import type { Annotation, StatusFilter } from "../data/types";
import type { CueView } from "../rules/selectors";
import { AnnotationItem } from "./AnnotationItem";

interface OrphanZoneProps {
  orphans: Annotation[];
  cueViews: CueView[];
  filter: StatusFilter;
  onReattach: (annotationId: string, targetCueId: string) => void;
  onReattachGroup: (originCueName: string, targetCueId: string) => void;
  onStatusChange: (annotationId: string, status: Annotation["status"]) => void;
  onContentChange: (annotationId: string, content: string) => void;
  onRemoveAnnotation: (annotationId: string) => void;
}

interface OrphanGroup {
  origin: string;
  items: Annotation[];
}

// 失联区：Cue 移走后的批注在此保留原顺序与内容，可重新挂回别的 Cue
export function OrphanZone({
  orphans,
  cueViews,
  filter,
  onReattach,
  onReattachGroup,
  onStatusChange,
  onContentChange,
  onRemoveAnnotation,
}: OrphanZoneProps) {
  const targets = cueViews.map((v) => ({ id: v.cue.id, name: v.cue.name }));
  const [groupTarget, setGroupTarget] = useState(targets[0]?.id ?? "");

  const groups = useMemo<OrphanGroup[]>(() => {
    const map = new Map<string, OrphanGroup>();
    for (const a of orphans) {
      const key = a.originCueName ?? "未知 Cue";
      let group = map.get(key);
      if (!group) {
        group = { origin: key, items: [] };
        map.set(key, group);
      }
      group.items.push(a);
    }
    return [...map.values()];
  }, [orphans]);

  if (orphans.length === 0 && filter === "all") return null;

  return (
    <section className="panel orphan-zone">
      <div className="heading">
        <div>
          <p>失联区</p>
          <h2>找不到 Cue 的批注</h2>
        </div>
        <span className="orphan-zone__count">{orphans.length} 条</span>
      </div>
      <p className="orphan-zone__desc">
        原 Cue 被移走后，批注按原有顺序保留在这里，内容与提出人不变；可单条或整组重新挂到现存 Cue。
      </p>

      {orphans.length === 0 ? (
        <p className="empty-line">当前筛选下没有失联批注</p>
      ) : (
        <div className="orphan-groups">
          {groups.map((group) => (
            <div key={group.origin} className="orphan-group">
              <div className="orphan-group__head">
                <strong>{group.origin}</strong>
                {targets.length > 0 && (
                  <div className="orphan-group__reattach">
                    <select
                      value={groupTarget}
                      onChange={(e) => setGroupTarget(e.target.value)}
                      aria-label="重挂目标 Cue"
                    >
                      {targets.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className="link-btn"
                      disabled={!groupTarget}
                      onClick={() => onReattachGroup(group.origin, groupTarget)}
                    >
                      整组挂到此处（保持顺序）
                    </button>
                  </div>
                )}
              </div>
              {group.items.map((a) => (
                <AnnotationItem
                  key={a.id}
                  annotation={a}
                  orphan
                  reattachTargets={targets}
                  onStatusChange={(status) => onStatusChange(a.id, status)}
                  onContentChange={(content) => onContentChange(a.id, content)}
                  onRemove={() => onRemoveAnnotation(a.id)}
                  onReattach={(targetCueId) => onReattach(a.id, targetCueId)}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
