import type { StatusFilter } from "../data/types";
import { STATUS_META, STATUS_ORDER } from "../data/status";

interface FilterBarProps {
  filter: StatusFilter;
  onChange: (filter: StatusFilter) => void;
  counts: Record<"pending" | "doing" | "done", number>;
  total: number;
}

// 列表界面：复排前一键筛出待处理条目
export function FilterBar({ filter, onChange, counts, total }: FilterBarProps) {
  const tabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "全部", count: total },
    ...STATUS_ORDER.map((s) => ({
      key: s as StatusFilter,
      label: STATUS_META[s].label,
      count: counts[s],
    })),
  ];

  return (
    <div className="filter-bar" role="tablist" aria-label="按处理状态筛选">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={filter === tab.key}
          className={`filter-tab${filter === tab.key ? " is-active" : ""} ${
            tab.key === "pending" ? "filter-tab--pending" : ""
          }`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          <span className="filter-tab__count">{tab.count}</span>
        </button>
      ))}
      {filter === "pending" && (
        <span className="filter-bar__tip">复排模式：只看待处理批注</span>
      )}
    </div>
  );
}
