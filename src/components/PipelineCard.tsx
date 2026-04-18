"use client";

import { AppStatus } from "@/lib/types";

const COLORS: Record<AppStatus | "All", string> = {
  All: "var(--text)",
  Applied: "var(--blue)",
  OA: "var(--amber)",
  Interview: "var(--green)",
  Offer: "var(--purple)",
  Rejected: "var(--red)",
};

interface Props {
  stage: AppStatus | "All";
  count: number;
  active: boolean;
  onClick: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function PipelineCard({
  stage,
  count,
  active,
  onClick,
  isLast,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="flex-1 min-w-0 py-4 px-4 sm:px-5 relative transition-colors text-center sm:text-left"
      style={{
        background: active ? "var(--accent-bg)" : "transparent",
        borderRight: isLast ? "none" : "0.5px solid var(--border)",
      }}
    >
      <div
        className="mono text-xl sm:text-2xl font-medium"
        style={{ color: active ? "var(--accent)" : COLORS[stage] }}
      >
        {count}
      </div>
      <div
        className="mono text-xs uppercase tracking-widest mt-1.5"
        style={{ color: "var(--text-dim)" }}
      >
        {stage.toLowerCase()}
      </div>
      {active && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: "var(--accent)" }}
        />
      )}
    </button>
  );
}
