import {
  fetchScrapedJobs,
  fetchScrapedStats,
  daysUntilClosing,
} from "@/lib/jobs";
import type { ScrapedJob } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import BrowseFilters from "./BrowseFilters";
import JobRow from "./JobRow";

export const metadata = {
  title: "~/browse · jobtracker.sh",
  description:
    "Browse graduate & internship SWE roles in Sydney, sourced from gradconnection.",
};

export const revalidate = 300;

const PAGE_SIZE = 25;

type SortMode = "soon" | "new" | "latest";

type SearchParams = {
  category?: string;
  company?: string;
  sort?: string;
  page?: string;
};

function parseCategory(
  value: string | undefined,
): "graduate" | "internship" | undefined {
  if (value === "graduate" || value === "internship") return value;
  return undefined;
}

function parseSort(value: string | undefined): SortMode {
  if (value === "new" || value === "latest") return value;
  return "soon";
}

function parsePage(value: string | undefined): number {
  const n = parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

// Build a stable key for matching a scraped job against a saved application.
// Lowercased to absorb whitespace/case noise from re-scraped listings.
function jobKey(role: string, company: string): string {
  return `${role.toLowerCase().trim()}|${company.toLowerCase().trim()}`;
}

function sortJobs(jobs: ScrapedJob[], mode: SortMode): ScrapedJob[] {
  const copy = [...jobs];
  switch (mode) {
    case "soon":
      return copy.sort(
        (a, b) =>
          daysUntilClosing(a.posted_date) - daysUntilClosing(b.posted_date),
      );
    case "new":
      return copy.sort((a, b) => {
        const aNew = a.posted_date.toLowerCase().includes("new") ? 0 : 1;
        const bNew = b.posted_date.toLowerCase().includes("new") ? 0 : 1;
        if (aNew !== bNew) return aNew - bNew;
        return b.scraped_at.localeCompare(a.scraped_at);
      });
    case "latest":
      return copy.sort((a, b) => b.scraped_at.localeCompare(a.scraped_at));
  }
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const category = parseCategory(params.category);
  const company = params.company?.trim() || undefined;
  const sort = parseSort(params.sort);
  const page = parsePage(params.page);

  // Auth + already-saved lookup. /browse is public; we only fetch saved-state
  // when the user is logged in. Saved jobs are matched by (role, company)
  // lowercased — same job pulled fresh on a later scrape may have small
  // whitespace/case differences in title.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let savedJobKeys = new Set<string>();
  if (user) {
    const { data: apps } = await supabase
      .from("applications")
      .select("role, company")
      .eq("user_id", user.id);

    savedJobKeys = new Set((apps ?? []).map((a) => jobKey(a.role, a.company)));
  }

  let allJobs: ScrapedJob[] = [];
  let totalGraduate = 0;
  let totalInternship = 0;
  let errorMessage: string | null = null;

  try {
    const [jobs, stats] = await Promise.all([
      fetchScrapedJobs({ category, company, limit: 200 }),
      fetchScrapedStats(),
    ]);
    allJobs = sortJobs(jobs, sort);
    totalGraduate = stats.by_source["gradconnection-graduate"] ?? 0;
    totalInternship = stats.by_source["gradconnection-internship"] ?? 0;
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  const totalMatched = allJobs.length;
  const endIdx = page * PAGE_SIZE;
  const pageJobs = allJobs.slice(0, endIdx);
  const hasMore = endIdx < totalMatched;

  const baseParams = new URLSearchParams();
  if (category) baseParams.set("category", category);
  if (company) baseParams.set("company", company);
  if (sort !== "soon") baseParams.set("sort", sort);

  function urlForPage(nextPage: number): string {
    const p = new URLSearchParams(baseParams);
    if (nextPage > 1) p.set("page", String(nextPage));
    const q = p.toString();
    return q ? `/browse?${q}` : "/browse";
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
          // graduate &amp; internship roles, sourced from gradconnection
        </p>
        <p className="mono text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          // total:{" "}
          <span style={{ color: "var(--blue)" }}>{totalGraduate} graduate</span>
          {" · "}
          <span style={{ color: "var(--purple)" }}>
            {totalInternship} internship
          </span>
        </p>
      </header>

      <BrowseFilters category={category} company={company ?? ""} sort={sort} />

      {errorMessage ? (
        <div
          className="mono text-sm py-12 text-center"
          style={{ color: "var(--text-dim)" }}
        >
          // failed to load jobs:{" "}
          <code style={{ color: "var(--red)" }}>{errorMessage}</code>
        </div>
      ) : pageJobs.length === 0 ? (
        <div
          className="mono text-sm py-12 text-center"
          style={{ color: "var(--text-dim)" }}
        >
          // no jobs match the current filters
        </div>
      ) : (
        <>
          <div
            className="mono text-xs uppercase tracking-wider mb-4 px-4 sm:px-5"
            style={{ color: "var(--text-dim)" }}
          >
            // showing {pageJobs.length} of {totalMatched}{" "}
            {totalMatched === 1 ? "job" : "jobs"}
          </div>

          <ul className="space-y-1">
            {pageJobs.map((job) => (
              <li key={job.id}>
                <JobRow
                  job={job}
                  userId={user?.id ?? null}
                  isSaved={savedJobKeys.has(jobKey(job.title, job.company))}
                />
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <a
                href={urlForPage(page + 1)}
                className="mono text-xs uppercase tracking-wider px-4 py-2 rounded transition-opacity hover:opacity-70"
                style={{
                  border: "0.5px solid var(--border-strong)",
                  color: "var(--accent)",
                  background: "var(--accent-bg)",
                }}
              >
                $ load more →
              </a>
            </div>
          )}
        </>
      )}
    </main>
  );
}
