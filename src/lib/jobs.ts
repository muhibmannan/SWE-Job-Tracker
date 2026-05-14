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


export function daysUntilClosing(job: ScrapedJob): number {
  if (job.closing_at) {
    const closingMs = new Date(job.closing_at).getTime();
    const nowMs = Date.now();
    const days = (closingMs - nowMs) / (1000 * 60 * 60 * 24);
    return Math.ceil(days);
  }

  // Fallback: parse `posted_date` text (kept for graceful degradation).
  const s = job.posted_date.toLowerCase().trim();
  if (!s.startsWith("closing")) return Number.POSITIVE_INFINITY;
  if (s.includes("hour")) return 0;

  const dayMatch = s.match(/in (\d+|a|an) days?/);
  if (dayMatch) return dayMatch[1].match(/^an?$/) ? 1 : parseInt(dayMatch[1], 10);

  const monthMatch = s.match(/in (\d+|a|an) months?/);
  if (monthMatch) {
    const n = monthMatch[1].match(/^an?$/) ? 1 : parseInt(monthMatch[1], 10);
    return n * 30;
  }

  const yearMatch = s.match(/in (\d+|a|an) years?/);
  if (yearMatch) {
    const n = yearMatch[1].match(/^an?$/) ? 1 : parseInt(yearMatch[1], 10);
    return n * 365;
  }

  return Number.POSITIVE_INFINITY;
}

export function formatClosingText(job: ScrapedJob): string {
  if (!job.closing_at) {
    return job.posted_date.toLowerCase() || "new";
  }

  const closingMs = new Date(job.closing_at).getTime();
  const nowMs = Date.now();
  const diffMs = closingMs - nowMs;

  if (diffMs < 0) return "closed";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) {
    return hours <= 1 ? "closing today" : `closing in ${hours} hours`;
  }

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days < 14) return days === 1 ? "closing in 1 day" : `closing in ${days} days`;

  const weeks = Math.round(days / 7);
  if (weeks < 8) return `closing in ${weeks} weeks`;

  const months = Math.round(days / 30);
  return `closing in ${months} months`;
}