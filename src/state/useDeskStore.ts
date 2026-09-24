import { useCallback, useEffect, useMemo, useState } from "react";
import type { AnnStatus, DeskState } from "../data/types";
import { clearState, loadState, saveState } from "../data/storage";
import { createSeedState } from "../data/seed";
import {
  addAnnotation,
  addCue,
  moveCue,
  reattachAnnotation,
  reattachOrphanGroup,
  removeAnnotation,
  removeCue,
  renameShow,
  setAnnotationStatus,
  updateAnnotationContent,
} from "../rules/deskRules";
import {
  cueAnnotationCount,
  filterAnnotations,
  selectCueViews,
  selectOrphans,
  statusCounts,
} from "../rules/selectors";

export function useDeskStore() {
  const [state, setState] = useState<DeskState>(() => loadState());

  // 重开浏览器后继续处理：任何改动都落到本地存档
  useEffect(() => {
    saveState(state);
  }, [state]);

  const update = useCallback(
    (fn: (prev: DeskState) => DeskState) => setState((prev) => fn(prev)),
    [],
  );

  const actions = useMemo(
    () => ({
      renameShow: (name: string) => update((s) => renameShow(s, name)),
      addCue: (input: { name: string; scene: string }) =>
        update((s) => addCue(s, input)),
      moveCue: (cueId: string, direction: -1 | 1) =>
        update((s) => moveCue(s, cueId, direction)),
      removeCue: (cueId: string) => update((s) => removeCue(s, cueId)),

      addAnnotation: (input: {
        cueId: string;
        content: string;
        author: string;
      }) => update((s) => addAnnotation(s, input)),
      setAnnotationStatus: (annotationId: string, status: AnnStatus) =>
        update((s) => setAnnotationStatus(s, annotationId, status)),
      updateAnnotationContent: (annotationId: string, content: string) =>
        update((s) => updateAnnotationContent(s, annotationId, content)),
      removeAnnotation: (annotationId: string) =>
        update((s) => removeAnnotation(s, annotationId)),
      reattach: (annotationId: string, targetCueId: string) =>
        update((s) => reattachAnnotation(s, annotationId, targetCueId)),
      reattachGroup: (originCueName: string, targetCueId: string) =>
        update((s) => reattachOrphanGroup(s, originCueName, targetCueId)),

      resetToSeed: () => {
        clearState();
        setState(createSeedState());
      },
    }),
    [update],
  );

  return {
    state,
    actions,
    views: {
      cueViews: selectCueViews(state),
      orphans: selectOrphans(state),
      counts: statusCounts(state),
      cueCount: cueAnnotationCount,
      filter: filterAnnotations,
    },
  };
}
