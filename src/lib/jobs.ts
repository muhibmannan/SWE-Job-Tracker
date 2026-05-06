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