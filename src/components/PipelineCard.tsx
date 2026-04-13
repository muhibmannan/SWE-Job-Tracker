"use client";

import { AppStatus } from "@/lib/types";

const COLORS: Record<AppStatus, { bg: string; text: string; dot: string }> = {
  Applied: { bg: "#1e3a5f", text: "#60a5fa", dot: "#3b82f6" },
  OA: { bg: "#3b2a00", text: "#fbbf24", dot: "#f59e0b" },
  Interview: { bg: "#1a2e1a", text: "#4ade80", dot: "#22c55e" },
  Offer: { bg: "#1f1060", text: "#a78bfa", dot: "#8b5cf6" },
  Rejected: { bg: "#2d1515", text: "#f87171", dot: "#ef4444" },
};

interface Props {
  stage: AppStatus | "All";
  count: number;
  active: boolean;
  onClick: () => void;
}

export default function PipelineCard({ stage, count, active, onClick }: Props) {
  const c = stage === "All" ? null : COLORS[stage];
  return (
    <button
      onClick={onClick}
      className="flex-1 min-w-[80px] rounded-xl p-3 sm:p-4 text-left transition-all border"
      style={{
        background: active ? (c?.bg ?? "#1c2128") : "#0d1117",
        borderColor: active ? (c?.dot ?? "#8b949e") : "#21262d",
        boxShadow: active ? `0 0 12px ${c?.dot ?? "#8b949e"}33` : "none",
      }}
    >
      <div
        className="font-bold text-xl sm:text-2xl font-mono"
        style={{ color: c?.text ?? "#f0f6fc" }}
      >
        {count}
      </div>
      <div
        className="text-xs font-bold uppercase tracking-widest mt-1"
        style={{ color: "#8b949e" }}
      >
        {stage}
      </div>
    </button>
  );
}
