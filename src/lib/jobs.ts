// src/lib/jobs.ts
import type { ScrapedJob } from "./types";

const SCRAPER_API_URL =
  process.env.NEXT_PUBLIC_SCRAPER_API_URL ?? "https://muhib-job-scraper.fly.dev";


export interface JobsQuery {
  category?: "graduate" | "internship";
  company?: string;
  limit?: number;
}

export async function fetchScrapedJobs(
  query: JobsQuery = {}
): Promise<ScrapedJob[]> {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.company) params.set("company", query.company);
  params.set("limit", String(query.limit ?? 50));

  const res = await fetch(`${SCRAPER_API_URL}/jobs?${params}`, {
    // Refresh data every 5 minutes; fine for a scraper that updates every 30
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Scraper API ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

export interface ScrapedStats {
  total: number;
  by_source: Record<string, number>;
  top_companies: { company: string; count: number }[];
}

export async function fetchScrapedStats(): Promise<ScrapedStats> {
  const res = await fetch(`${SCRAPER_API_URL}/stats`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`Scraper stats API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

/**
 * Estimate days until a job closes from GradConnection's fuzzy posted_date string.
 * Returns Number.POSITIVE_INFINITY for "New!" or unparseable strings (treated as "no rush").
 * Returns 0 for already-closed or "Closing in N hours".
 *
 * Examples:
 *   "Closing in 4 hours"   → 0
 *   "Closing in 13 days"   → 13
 *   "Closing in a month"   → 30
 *   "Closing in 2 months"  → 60
 *   "Closing in a year"    → 365
 *   "New!"                 → Infinity
 */
export function daysUntilClosing(postedDate: string): number {
  const s = postedDate.toLowerCase().trim();

  // Just-posted listings: no closing info, push to bottom of "soon" sort
  if (!s.startsWith("closing")) return Number.POSITIVE_INFINITY;

  // Hours → 0 (treat as "today")
  if (s.includes("hour")) return 0;

  // Match "in N days" or "in a day"
  const dayMatch = s.match(/in (\d+|a|an) days?/);
  if (dayMatch) return dayMatch[1] === "a" || dayMatch[1] === "an" ? 1 : parseInt(dayMatch[1], 10);

  // "in N months" or "in a month"
  const monthMatch = s.match(/in (\d+|a|an) months?/);
  if (monthMatch) {
    const n = monthMatch[1] === "a" || monthMatch[1] === "an" ? 1 : parseInt(monthMatch[1], 10);
    return n * 30;
  }

  // "in N years" or "in a year"
  const yearMatch = s.match(/in (\d+|a|an) years?/);
  if (yearMatch) {
    const n = yearMatch[1] === "a" || yearMatch[1] === "an" ? 1 : parseInt(yearMatch[1], 10);
    return n * 365;
  }

  // Unrecognised — push to bottom
  return Number.POSITIVE_INFINITY;
}