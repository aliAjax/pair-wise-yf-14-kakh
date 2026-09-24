import type { AnnStatus } from "./types";

// 状态的展示元数据（与数据、规则分开维护）
export const STATUS_META: Record<
  AnnStatus,
  { label: string; hint: string; tone: string }
> = {
  pending: { label: "待处理", hint: "散排后还未安排处理", tone: "pending" },
  doing: { label: "处理中", hint: "复排调整中", tone: "doing" },
  done: { label: "已处理", hint: "复排确认通过", tone: "done" },
};

export const STATUS_ORDER: AnnStatus[] = ["pending", "doing", "done"];
