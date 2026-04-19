"use client";

import { User } from "@supabase/supabase-js";
import { Application } from "@/lib/types";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AnalyticsClient({
  user,
  applications,
}: {
  user: User;
  applications: Application[];
}) {
  const total = applications.length;

  // Pipeline funnel — cumulative progression
  const reachedOA = applications.filter((a) =>
    ["OA", "Interview", "Offer"].includes(a.status),
  ).length;
  const reachedInterview = applications.filter((a) =>
    ["Interview", "Offer"].includes(a.status),
  ).length;
  const reachedOffer = applications.filter((a) => a.status === "Offer").length;
  const rejected = applications.filter((a) => a.status === "Rejected").length;

  const funnelData = [
    { stage: "applied", count: total, fill: "var(--blue)" },
    { stage: "oa", count: reachedOA, fill: "var(--amber)" },
    { stage: "interview", count: reachedInterview, fill: "var(--green)" },
    { stage: "offer", count: reachedOffer, fill: "var(--purple)" },
  ];

  // Source breakdown
  const sourceCounts: Record<string, number> = {};
  applications.forEach((a) => {
    const s = a.source || "unknown";
    sourceCounts[s] = (sourceCounts[s] || 0) + 1;
  });
  const sourceData = Object.entries(sourceCounts).map(([name, value]) => ({
    name: name.toLowerCase(),
    value,
  }));

  // Application volume over time (by week)
  const volumeMap: Record<string, number> = {};
  applications.forEach((a) => {
    if (!a.date_applied) return;
    const d = new Date(a.date_applied);
    const year = d.getFullYear();
    const jan1 = new Date(year, 0, 1);
    const week = Math.ceil(
      ((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7,
    );
    const weekKey = `W${String(week).padStart(2, "0")}`;
    volumeMap[weekKey] = (volumeMap[weekKey] || 0) + 1;
  });
  const volumeData = Object.entries(volumeMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, count }));

  // Rates
  const responseRate = total > 0 ? Math.round((reachedOA / total) * 100) : 0;
  const interviewRate =
    total > 0 ? Math.round((reachedInterview / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((reachedOffer / total) * 100) : 0;
  const rejectRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

  // Weeks span for subtitle
  const weeksSpan = volumeData.length;

  const PIE_COLORS = [
    "var(--blue)",
    "var(--amber)",
    "var(--green)",
    "var(--purple)",
    "var(--red)",
    "var(--text-dim)",
  ];

  const Stat = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: number;
    color: string;
  }) => (
    <div>
      <div
        className="mono text-xs uppercase tracking-widest"
        style={{ color: "var(--text-dim)" }}
      >
        {label}
      </div>
      <div
        className="mono text-2xl sm:text-3xl font-medium mt-1.5 sm:mt-2"
        style={{ color }}
      >
        {value}
        <span className="text-base ml-1" style={{ color: "var(--accent)" }}>
          %
        </span>
      </div>
    </div>
  );

  const SectionHeader = ({ label }: { label: string }) => (
    <div className="flex items-center gap-3 mb-5 mt-10 first:mt-0">
      <p
        className="mono text-sm uppercase tracking-widest"
        style={{ color: "var(--text-dim)" }}
      >
        // {label}
      </p>
      <div
        className="flex-1 h-[0.5px]"
        style={{ background: "var(--border)" }}
      />
    </div>
  );

  const ChartContainer = ({ children }: { children: React.ReactNode }) => (
    <div
      className="rounded-lg p-4 sm:p-5"
      style={{
        background: "var(--bg-elev)",
        border: "0.5px solid var(--border)",
      }}
    >
      {children}
    </div>
  );

  const tooltipStyle = {
    background: "var(--bg-elev)",
    border: "0.5px solid var(--border-strong)",
    borderRadius: 8,
    color: "var(--text)",
    fontFamily: "var(--font-mono)",
    fontSize: 12,
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar email={user.email ?? ""} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-28 sm:pb-10">
        {/* Hero */}
        <div
          className="pb-6 sm:pb-8 mb-6 sm:mb-8"
          style={{ borderBottom: "0.5px solid var(--border)" }}
        >
          <h1
            className="text-6xl font-medium tracking-tight leading-none"
            style={{ color: "var(--text)" }}
          >
            {total}
            <span
              className="text-4xl ml-1"
              style={{ color: "var(--text-dim)" }}
            >
              /applications
            </span>
          </h1>
          <p className="mono text-sm mt-3" style={{ color: "var(--text-dim)" }}>
            {total === 0
              ? "// no data yet → log applications to populate"
              : `// insights across ${weeksSpan || 1} week${weeksSpan === 1 ? "" : "s"}`}
          </p>
        </div>

        {total === 0 ? (
          <div className="text-center py-24">
            <p className="mono text-base" style={{ color: "var(--text-dim)" }}>
              // empty dataset → head to ~/pipeline to add your first app
            </p>
          </div>
        ) : (
          <>
            {/* Rate stats */}
            <SectionHeader label="conversion rates" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-8 mb-10">
              <Stat label="response" value={responseRate} color="var(--blue)" />
              <Stat
                label="interview"
                value={interviewRate}
                color="var(--green)"
              />
              <Stat label="offer" value={offerRate} color="var(--purple)" />
              <Stat label="reject" value={rejectRate} color="var(--red)" />
            </div>

            {/* Funnel */}
            <SectionHeader label="pipeline funnel" />
            <ChartContainer>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={funnelData}
                  layout="vertical"
                  margin={{ left: 0, right: 20, top: 5, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    stroke="var(--text-dim)"
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                    }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    stroke="var(--text-dim)"
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                    }}
                    width={75}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "var(--bg-hover)" }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {funnelData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Sources + Velocity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
              <div>
                <SectionHeader label="sources" />
                <ChartContainer>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={sourceData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={65}
                        innerRadius={38}
                        paddingAngle={2}
                        label={(entry: { name?: string; percent?: number }) => {
                          const name = entry.name ?? "";
                          const percent = entry.percent ?? 0;
                          const short =
                            name.length > 10 ? name.slice(0, 10) + "…" : name;
                          return `${short} ${Math.round(percent * 100)}%`;
                        }}
                        labelLine={false}
                        style={{
                          fontSize: 10,
                          fontFamily: "var(--font-mono)",
                          fill: "var(--text-dim)",
                        }}
                      >
                        {sourceData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                            stroke="var(--bg-elev)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <div>
                <SectionHeader label="velocity" />
                <ChartContainer>
                  {volumeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={volumeData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                        />
                        <XAxis
                          dataKey="week"
                          stroke="var(--text-dim)"
                          style={{
                            fontSize: 11,
                            fontFamily: "var(--font-mono)",
                          }}
                        />
                        <YAxis
                          stroke="var(--text-dim)"
                          style={{
                            fontSize: 11,
                            fontFamily: "var(--font-mono)",
                          }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          cursor={{ stroke: "var(--border-strong)" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="var(--accent)"
                          strokeWidth={2}
                          dot={{ fill: "var(--accent)", r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div
                      className="flex items-center justify-center h-60"
                      style={{ color: "var(--text-dim)" }}
                    >
                      <p className="mono text-sm">
                        // add dates to applications to see trends
                      </p>
                    </div>
                  )}
                </ChartContainer>
              </div>
            </div>
          </>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
