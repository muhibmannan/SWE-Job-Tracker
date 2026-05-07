import Link from "next/link";
import type { ScrapedJob } from "@/lib/types";

const SOURCE_STYLE: Record<string, { label: string; color: string }> = {
  "gradconnection-graduate": { label: "graduate", color: "var(--blue)" },
  "gradconnection-internship": { label: "internship", color: "var(--purple)" },
};

function sourceStyle(source: string) {
  return SOURCE_STYLE[source] ?? { label: source, color: "var(--text-dim)" };
}

export default function JobRow({ job }: { job: ScrapedJob }) {
  const style = sourceStyle(job.source);

  return (
    <Link
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-4 sm:gap-6 items-center py-4 px-4 sm:px-5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
    >
      <div className="min-w-0">
        <div
          className="text-base font-medium truncate"
          style={{ color: "var(--text)" }}
        >
          {job.title}
        </div>
        <div
          className="mono text-sm mt-1 truncate"
          style={{ color: "var(--text-dim)" }}
        >
          {job.company.toLowerCase()}
          {job.location && ` → ${job.location.toLowerCase()}`}
        </div>
        {/* Mobile-only date row */}
        <div
          className="mono text-xs mt-1 sm:hidden"
          style={{ color: "var(--text-dim)" }}
        >
          {job.posted_date.toLowerCase()}
        </div>
      </div>

      {/* Desktop date column */}
      <div
        className="mono text-sm hidden sm:block whitespace-nowrap"
        style={{ color: "var(--text-dim)" }}
        title={job.posted_date}
      >
        {job.posted_date.toLowerCase()}
      </div>

      <span
        className="inline-flex items-center gap-1.5 mono text-xs uppercase tracking-wider px-2.5 py-1.5 rounded whitespace-nowrap"
        style={{
          border: `0.5px solid ${style.color}40`,
          background: `${style.color}0D`,
          color: style.color,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: style.color }}
        />
        {style.label}
      </span>

      <div className="hidden sm:flex gap-3">
        <span
          className="mono text-xs px-2 py-1"
          style={{ color: "var(--accent)" }}
        >
          apply →
        </span>
      </div>
    </Link>
  );
}
