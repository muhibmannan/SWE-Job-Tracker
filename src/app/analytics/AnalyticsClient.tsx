"use client";

import { User } from "@supabase/supabase-js";
import { Application } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Link from "next/link";
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
    { stage: "Applied", count: total, fill: "#3b82f6" },
    { stage: "OA Stage", count: reachedOA, fill: "#f59e0b" },
    { stage: "Interview", count: reachedInterview, fill: "#22c55e" },
    { stage: "Offer", count: reachedOffer, fill: "#8b5cf6" },
  ];

  // Source breakdown
  const sourceCounts: Record<string, number> = {};
  applications.forEach((a) => {
    const s = a.source || "Unknown";
    sourceCounts[s] = (sourceCounts[s] || 0) + 1;
  });
  const sourceData = Object.entries(sourceCounts).map(([name, value]) => ({
    name,
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
    const weekKey = `${year}-W${String(week).padStart(2, "0")}`;
    volumeMap[weekKey] = (volumeMap[weekKey] || 0) + 1;
  });
  const volumeData = Object.entries(volumeMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, count }));

  // Rates
  const responseRate = total > 0 ? ((reachedOA / total) * 100).toFixed(1) : "0";
  const interviewRate =
    total > 0 ? ((reachedInterview / total) * 100).toFixed(1) : "0";
  const offerRate = total > 0 ? ((reachedOffer / total) * 100).toFixed(1) : "0";
  const rejectRate = total > 0 ? ((rejected / total) * 100).toFixed(1) : "0";

  const PIE_COLORS = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#64748b",
    "#ec4899",
  ];

  const cardStyle = {
    background: "#0d1117",
    borderColor: "#21262d",
  };

  const Stat = ({
    label,
    value,
    suffix,
    color,
  }: {
    label: string;
    value: string | number;
    suffix?: string;
    color: string;
  }) => (
    <div className="rounded-xl border p-4 sm:p-5" style={cardStyle}>
      <p
        className="text-xs font-bold uppercase tracking-wider mb-2"
        style={{ color: "#8b949e" }}
      >
        {label}
      </p>
      <p className="font-mono font-bold text-2xl sm:text-3xl" style={{ color }}>
        {value}
        <span className="text-lg" style={{ color: "#8b949e" }}>
          {suffix}
        </span>
      </p>
    </div>
  );

  const ChartCard = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="rounded-xl border p-4 sm:p-5" style={cardStyle}>
      <h3 className="font-bold text-white mb-4">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#010409" }}>
      <Navbar email={user.email ?? ""} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header with tabs */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white font-bold text-xl sm:text-2xl">
              Analytics
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#8b949e" }}>
              Insights from {total} application{total !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard"
              className="px-3 py-2 rounded-lg text-sm font-bold border"
              style={{ borderColor: "#30363d", color: "#8b949e" }}
            >
              Applications
            </Link>
            <span
              className="px-3 py-2 rounded-lg text-sm font-bold"
              style={{ background: "#238636", color: "#fff" }}
            >
              Analytics
            </span>
          </div>
        </div>

        {total === 0 ? (
          <div className="text-center py-20" style={{ color: "#8b949e" }}>
            <p className="text-4xl mb-3">📊</p>
            <p className="font-medium">
              No data yet — add applications to see analytics
            </p>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <Stat
                label="Response Rate"
                value={responseRate}
                suffix="%"
                color="#60a5fa"
              />
              <Stat
                label="Interview Rate"
                value={interviewRate}
                suffix="%"
                color="#4ade80"
              />
              <Stat
                label="Offer Rate"
                value={offerRate}
                suffix="%"
                color="#a78bfa"
              />
              <Stat
                label="Reject Rate"
                value={rejectRate}
                suffix="%"
                color="#f87171"
              />
            </div>

            {/* Funnel chart */}
            <div className="mb-6">
              <ChartCard title="Pipeline Funnel">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={funnelData}
                    layout="vertical"
                    margin={{ left: 10, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis
                      type="number"
                      stroke="#8b949e"
                      style={{ fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="stage"
                      stroke="#8b949e"
                      style={{ fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#161b22",
                        border: "1px solid #30363d",
                        borderRadius: 8,
                        color: "#e6edf3",
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {funnelData.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {/* Source breakdown */}
              <ChartCard title="Applications by Source">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                      style={{ fontSize: 11, fill: "#e6edf3" }}
                    >
                      {sourceData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#161b22",
                        border: "1px solid #30363d",
                        borderRadius: 8,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Volume over time */}
              <ChartCard title="Applications Over Time">
                {volumeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                      <XAxis
                        dataKey="week"
                        stroke="#8b949e"
                        style={{ fontSize: 11 }}
                      />
                      <YAxis
                        stroke="#8b949e"
                        style={{ fontSize: 11 }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#161b22",
                          border: "1px solid #30363d",
                          borderRadius: 8,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#4ade80"
                        strokeWidth={2}
                        dot={{ fill: "#4ade80", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    className="flex items-center justify-center h-60"
                    style={{ color: "#8b949e" }}
                  >
                    <p className="text-sm">
                      Add dates to applications to see trends
                    </p>
                  </div>
                )}
              </ChartCard>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
