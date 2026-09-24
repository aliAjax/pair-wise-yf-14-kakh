import type { Cue, DeskState, NoteStatus, RehearsalNote } from "./types";

/**
 * 首次打开时的示例排练数据。
 * 故意让 Cue 编号与数组顺序不完全一致，以体现「调序靠位置、绑定靠 id」。
 */

const now = Date.now();

const cues: Cue[] = [
  { id: "cue-1", label: "Q1", summary: "开场前观众入场 · 冷蓝环境光" },
  { id: "cue-2", label: "Q2", summary: "二幕开场 · 冷蓝侧光 CH021–028，65%" },
  { id: "cue-3", label: "Q3", summary: "追光入场 · FOH-03，焦点门口" },
  { id: "cue-4", label: "Q4", summary: "争吵段 · 顶光骤亮，逆光收半" },
  { id: "cue-5", label: "Q5", summary: "独白 · 暖色定点，其余压到 10%" },
  { id: "cue-6", label: "Q6", summary: "谢幕 · 全台面光 80%" },
];

function note(
  seq: number,
  cueId: string | null,
  content: string,
  author: string,
  status: NoteStatus = "pending",
  orphanFromLabel: string | null = null,
): RehearsalNote {
  return {
    id: `note-${seq}`,
    cueId,
    content,
    author,
    status,
    seq,
    createdAt: now - (20 - seq) * 60_000,
    orphanFromLabel,
  };
}

/** 预置一条失联批注：它原来挂在已撤掉的 Q0 预备铃 Cue 上 */
const notes: RehearsalNote[] = [
  note(1, "cue-2", "侧光收得再慢半拍，演员走到台口再收", "导演 林姐"),
  note(2, "cue-2", "CH024 频闪疑似接触不良，开演前检查", "灯光 小王", "in-progress"),
  note(3, "cue-3", "追光起手位置偏左 30cm，等走位再定", "舞台监督 阿陈"),
  note(4, "cue-4", "骤亮太硬，改成 0.8 秒 fade in", "导演 林姐"),
  note(5, "cue-5", "暖色片换成 R313 试试，现在偏黄", "灯光 小王", "done"),
  note(6, "cue-6", "谢幕第二波起光等掌声，不要卡时间", "舞台监督 阿陈"),
  note(
    7,
    null,
    "预备铃时后场灯提前 5 秒压暗（原 Q0 已撤，待重新挂接）",
    "灯光 小王",
    "pending",
    "Q0",
  ),
];

export const initialState: DeskState = {
  showTitle: "《夜航》彩排 · 2026 秋季档",
  cues,
  notes,
  nextSeq: 8,
};
