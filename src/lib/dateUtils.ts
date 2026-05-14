/**
 * Format a date as a relative string (e.g. "3 days ago", "in 2 weeks").
 *
 * Two paths:
 * - Date-only strings (YYYY-MM-DD): compute whole-day diffs in local time.
 *   These are calendar dates (e.g., date_applied) and shouldn't drift with
 *   time-of-day.
 * - Timestamps with time-of-day: compute ms diffs with single-pass division.
 */
export function formatRelativeDate(iso: string | null | undefined): string {
  if (!iso) return "—";

  // Detect date-only inputs (YYYY-MM-DD). PostgreSQL DATE columns serialize
  // this way. They represent calendar dates with no time-of-day, so we
  // compute whole-day differences in the local timezone — never milliseconds.
  // Otherwise UTC midnight (10am Sydney) introduces off-by-one errors near
  // day boundaries.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);

  let diffDays: number;
  let diffMs: number;

  if (dateOnly) {
    const [y, m, d] = iso.split("-").map(Number);
    const appliedLocal = new Date(y, m - 1, d); // local midnight
    const now = new Date();
    const todayLocal = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    diffMs = appliedLocal.getTime() - todayLocal.getTime();
    diffDays = Math.round(diffMs / 86400000); // exact: both are local midnight
  } else {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "—";
    diffMs = date.getTime() - Date.now();
    // floor for past, ceil for future — "N full units have passed" framing
    diffDays =
      diffMs < 0
        ? Math.ceil(diffMs / 86400000)
        : Math.floor(diffMs / 86400000);
  }

  const past = diffMs < 0;
  const abs = (n: number) => Math.abs(n);

  // Sub-day granularity for real timestamps only (uploads, edits, etc.).
  if (!dateOnly && abs(diffDays) === 0) {
    const hours = Math.floor(abs(diffMs) / 3600000);
    if (hours === 0) {
      const minutes = Math.floor(abs(diffMs) / 60000);
      if (minutes === 0) return "just now";
      return past ? `${minutes} min ago` : `in ${minutes} min`;
    }
    return past ? `${hours}h ago` : `in ${hours}h`;
  }

  // Today / yesterday / tomorrow
  if (diffDays === 0) return "today";
  if (diffDays === -1) return "yesterday";
  if (diffDays === 1) return "tomorrow";

  // Days (up to 13). "8 days ago" reads more precisely than "1 week ago".
  if (abs(diffDays) < 14) {
    return past ? `${abs(diffDays)} days ago` : `in ${diffDays} days`;
  }

  // Weeks (14-29 days)
  if (abs(diffDays) < 30) {
    const weeks = Math.round(abs(diffDays) / 7);
    return past
      ? `${weeks} week${weeks === 1 ? "" : "s"} ago`
      : `in ${weeks} week${weeks === 1 ? "" : "s"}`;
  }

  // Months (30-364 days)
  if (abs(diffDays) < 365) {
    const months = Math.round(abs(diffDays) / 30);
    return past
      ? `${months} month${months === 1 ? "" : "s"} ago`
      : `in ${months} month${months === 1 ? "" : "s"}`;
  }

  // Years
  const years = Math.round(abs(diffDays) / 365);
  return past
    ? `${years} year${years === 1 ? "" : "s"} ago`
    : `in ${years} year${years === 1 ? "" : "s"}`;
}

/**
 * Format a date as an absolute date string (e.g. "26 Mar 2026").
 * Used as the tooltip / title attribute companion to relative dates.
 *
 * For date-only inputs (YYYY-MM-DD), formats from components directly to
 * avoid UTC-midnight timezone drift.
 */
export function formatAbsoluteDate(iso: string | null | undefined): string {
  if (!iso) return "";

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  let date: Date;

  if (dateOnly) {
    const [y, m, d] = iso.split("-").map(Number);
    date = new Date(y, m - 1, d); // local midnight
  } else {
    date = new Date(iso);
  }

  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}