/**
 * Format a date as a relative string (e.g. "3 days ago", "in 2 weeks").
 * Falls back to absolute date for distances over 12 months.
 */
export function formatRelativeDate(iso: string | null | undefined): string {
  if (!iso) return "—";

  const date = new Date(iso);
  if (isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffWeeks = Math.round(diffDays / 7);
  const diffMonths = Math.round(diffDays / 30);
  const diffYears = Math.round(diffDays / 365);

  const past = diffMs < 0;
  const abs = (n: number) => Math.abs(n);

  // Today
  if (abs(diffDays) === 0) return "today";

  // Yesterday / tomorrow
  if (diffDays === -1) return "yesterday";
  if (diffDays === 1) return "tomorrow";

  // Days
  if (abs(diffDays) < 7) {
    return past ? `${abs(diffDays)} days ago` : `in ${diffDays} days`;
  }

  // Weeks
  if (abs(diffDays) < 30) {
    return past
      ? `${abs(diffWeeks)} week${abs(diffWeeks) === 1 ? "" : "s"} ago`
      : `in ${diffWeeks} week${diffWeeks === 1 ? "" : "s"}`;
  }

  // Months
  if (abs(diffDays) < 365) {
    return past
      ? `${abs(diffMonths)} month${abs(diffMonths) === 1 ? "" : "s"} ago`
      : `in ${diffMonths} month${diffMonths === 1 ? "" : "s"}`;
  }

  // Years
  return past
    ? `${abs(diffYears)} year${abs(diffYears) === 1 ? "" : "s"} ago`
    : `in ${diffYears} year${diffYears === 1 ? "" : "s"}`;
}

/**
 * Format a date as an absolute date string (e.g. "26 Mar 2026").
 * Used as the tooltip / title attribute companion to relative dates.
 */
export function formatAbsoluteDate(iso: string | null | undefined): string {
  if (!iso) return "";

  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}