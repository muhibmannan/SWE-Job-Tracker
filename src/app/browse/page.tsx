import Link from "next/link";
import { fetchScrapedJobs } from "@/lib/jobs";
import type { ScrapedJob } from "@/lib/types";

export const metadata = {
  title: "~/browse · jobtracker.sh",
};

export const revalidate = 300;

// Map source identifier → display label + color (uses CSS vars from globals.css)
const SOURCE_STYLE: Record<string, { label: string; color: string }> = {
  "gradconnection-graduate": { label: "graduate", color: "var(--blue)" },
  "gradconnection-internship": { label: "internship", color: "var(--purple)" },
};

function sourceStyle(source: string) {
  return SOURCE_STYLE[source] ?? { label: source, color: "var(--text-dim)" };
}

export default async function BrowsePage() {
  let jobs: ScrapedJob[] = [];
  let errorMessage: string | null = null;

  try {
    jobs = await fetchScrapedJobs({ limit: 50 });
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <main className="px-4 sm:px-6 py-6 sm:py-10 max-w-5xl mx-auto pb-24">
      <header className="mb-8 sm:mb-10">
        <h1
          className="mono text-xl sm:text-2xl font-medium"
          style={{ color: "var(--text)" }}
        >
          ~/browse
        </h1>
        <p className="mono text-sm mt-2" style={{ color: "var(--text-dim)" }}>
          // graduate &amp; internship roles, scraped from gradconnection
        </p>
      </header>

      {errorMessage ? (
        <div
          className="mono text-sm py-12 text-center"
          style={{ color: "var(--text-dim)" }}
        >
          // failed to load jobs:{" "}
          <code style={{ color: "var(--red)" }}>{errorMessage}</code>
        </div>
      ) : (
        <>
          <div
            className="mono text-xs uppercase tracking-wider mb-4 px-4 sm:px-5"
            style={{ color: "var(--text-dim)" }}
          >
            // {jobs.length} {jobs.length === 1 ? "job" : "jobs"} found
          </div>

          <ul className="space-y-1">
            {jobs.map((job) => (
              <li key={job.id}>
                <JobRow job={job} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

function JobRow({ job }: { job: ScrapedJob }) {
  const style = sourceStyle(job.source);
  const slug = job.title
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "");

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
      </div>

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
