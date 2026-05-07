export default function BrowseLoading() {
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
      </header>

      {/* Filter bar skeleton */}
      <div
        className="mb-6 sm:mb-8 px-4 sm:px-5 py-3 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3"
        style={{
          background: "var(--bg-elev)",
          border: "0.5px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-2 sm:flex-1">
          <span className="mono text-sm" style={{ color: "var(--accent)" }}>
            $
          </span>
          <span
            className="mono text-sm opacity-40"
            style={{ color: "var(--text-dim)" }}
          >
            loading...
          </span>
        </div>
      </div>

      {/* Row skeletons */}
      <ul className="space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <li
            key={i}
            className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-4 sm:gap-6 items-center py-4 px-4 sm:px-5 rounded-lg"
            style={{ opacity: 1 - i * 0.08 }}
          >
            <div className="min-w-0 space-y-2">
              <div
                className="h-4 rounded animate-pulse"
                style={{
                  background: "var(--bg-hover)",
                  width: `${60 + ((i * 7) % 30)}%`,
                }}
              />
              <div
                className="h-3 rounded animate-pulse"
                style={{
                  background: "var(--bg-hover)",
                  width: `${30 + ((i * 5) % 20)}%`,
                }}
              />
            </div>
            <div
              className="hidden sm:block h-3 w-24 rounded animate-pulse"
              style={{ background: "var(--bg-hover)" }}
            />
            <div
              className="h-6 w-20 rounded animate-pulse"
              style={{ background: "var(--bg-hover)" }}
            />
            <div
              className="hidden sm:block h-3 w-12 rounded animate-pulse"
              style={{ background: "var(--bg-hover)" }}
            />
          </li>
        ))}
      </ul>
    </main>
  );
}
