"use client";

import React from "react";
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Application, AppStatus, NewApplication } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import PipelineCard from "@/components/PipelineCard";
import ApplicationModal from "@/components/ApplicationModal";
import AICoach from "@/components/AICoach";
import Link from "next/link";

const STAGES: AppStatus[] = ["Applied", "OA", "Interview", "Offer", "Rejected"];
const STAGE_COLORS: Record<AppStatus, { text: string; dot: string }> = {
  Applied: { text: "#60a5fa", dot: "#3b82f6" },
  OA: { text: "#fbbf24", dot: "#f59e0b" },
  Interview: { text: "#4ade80", dot: "#22c55e" },
  Offer: { text: "#a78bfa", dot: "#8b5cf6" },
  Rejected: { text: "#f87171", dot: "#ef4444" },
};

export default function DashboardClient({
  user,
  initialApps,
}: {
  user: User;
  initialApps: Application[];
}) {
  const [apps, setApps] = useState<Application[]>(initialApps);
  const [filter, setFilter] = useState<AppStatus | "All">("All");
  const [modal, setModal] = useState<Partial<Application> | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const supabase = createClient();

  const filtered =
    filter === "All" ? apps : apps.filter((a) => a.status === filter);
  const count = (s: AppStatus) => apps.filter((a) => a.status === s).length;

  const handleSave = async (data: NewApplication) => {
    if (modal?.id) {
      const { data: updated } = await supabase
        .from("applications")
        .update(data)
        .eq("id", modal.id)
        .select()
        .single();
      if (updated) setApps(apps.map((a) => (a.id === modal.id ? updated : a)));
    } else {
      const { data: created } = await supabase
        .from("applications")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      if (created) setApps([created, ...apps]);
    }
    setModal(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    await supabase.from("applications").delete().eq("id", id);
    setApps(apps.filter((a) => a.id !== id));
    setExpanded(null);
  };

  return (
    <div className="min-h-screen" style={{ background: "#010409" }}>
      <Navbar email={user.email ?? ""} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white font-bold text-xl sm:text-2xl">
              Applications
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#8b949e" }}>
              {apps.length} tracked
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Link
              href="/analytics"
              className="px-3 py-2 rounded-lg text-sm font-bold border hidden sm:inline-block"
              style={{ borderColor: "#30363d", color: "#8b949e" }}
            >
              Analytics
            </Link>
            <button
              onClick={() => setModal({})}
              className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
              style={{ background: "#238636", color: "#fff" }}
            >
              <span className="text-lg leading-none">+</span>
              <span className="hidden sm:inline">New Application</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Pipeline cards */}
        <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-1">
          <PipelineCard
            stage="All"
            count={apps.length}
            active={filter === "All"}
            onClick={() => setFilter("All")}
          />
          {STAGES.map((s) => (
            <PipelineCard
              key={s}
              stage={s}
              count={count(s)}
              active={filter === s}
              onClick={() => setFilter(s)}
            />
          ))}
        </div>

        {/* Table / Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: "#8b949e" }}>
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">
              {apps.length === 0
                ? "No applications yet — hit '+ New Application'"
                : "No applications match this filter"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div
              className="hidden sm:block rounded-xl border overflow-hidden"
              style={{ borderColor: "#21262d", background: "#0d1117" }}
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ background: "#161b22" }}>
                    {[
                      "Company",
                      "Role",
                      "Status",
                      "Applied",
                      "Source",
                      "CV",
                      "CL",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                        style={{
                          color: "#8b949e",
                          borderBottom: "1px solid #21262d",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app) => {
                    const c = STAGE_COLORS[app.status];
                    const isExp = expanded === app.id;
                    return (
                      <React.Fragment key={app.id}>
                        <tr
                          key={app.id}
                          className="cursor-pointer transition-colors hover:bg-opacity-50"
                          style={{
                            background: isExp ? "#161b22" : "transparent",
                            borderBottom: "1px solid #161b22",
                          }}
                          onClick={() => setExpanded(isExp ? null : app.id)}
                        >
                          <td
                            className="px-4 py-3 font-bold text-sm"
                            style={{ color: "#f0f6fc" }}
                          >
                            {app.company}
                          </td>
                          <td
                            className="px-4 py-3 text-sm font-mono"
                            style={{ color: "#e6edf3" }}
                          >
                            {app.role}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold"
                              style={{
                                background: `${c.dot}22`,
                                color: c.text,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: c.dot }}
                              />
                              {app.status}
                            </span>
                          </td>
                          <td
                            className="px-4 py-3 text-xs font-mono"
                            style={{ color: "#8b949e" }}
                          >
                            {app.date_applied ?? "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ color: "#8b949e" }}
                          >
                            {app.source ?? "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-xs font-mono"
                            style={{ color: "#8b949e" }}
                          >
                            {app.resume_version ?? "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-xs font-bold"
                            style={{
                              color: app.cover_letter ? "#4ade80" : "#8b949e",
                            }}
                          >
                            {app.cover_letter ? "Y" : "N"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModal(app);
                                }}
                                className="text-xs px-2.5 py-1 rounded-lg border"
                                style={{
                                  borderColor: "#30363d",
                                  color: "#8b949e",
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(app.id);
                                }}
                                className="text-xs px-2.5 py-1 rounded-lg border"
                                style={{
                                  borderColor: "#30363d",
                                  color: "#f87171",
                                }}
                              >
                                Del
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExp && (
                          <tr
                            key={`exp-${app.id}`}
                            style={{ background: "#161b22" }}
                          >
                            <td colSpan={8} className="px-4 pb-4 pt-1">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                                {[
                                  ["OA Score", app.oa_score],
                                  ["Interview Outcome", app.interview_outcome],
                                  ["DSA Topics", app.dsa_topics],
                                  ["Behavioural Qs", app.behavioural_questions],
                                ]
                                  .filter(([, v]) => v)
                                  .map(([k, v]) => (
                                    <div key={k as string}>
                                      <p
                                        className="text-xs uppercase tracking-wider mb-1"
                                        style={{ color: "#8b949e" }}
                                      >
                                        {k}
                                      </p>
                                      <p
                                        className="text-xs font-mono"
                                        style={{ color: "#e6edf3" }}
                                      >
                                        {v}
                                      </p>
                                    </div>
                                  ))}
                              </div>
                              {(app.mistakes || app.improvements) && (
                                <div
                                  className="grid grid-cols-2 gap-4 pt-3 border-t"
                                  style={{ borderColor: "#21262d" }}
                                >
                                  {app.mistakes && (
                                    <div>
                                      <p
                                        className="text-xs uppercase tracking-wider mb-1"
                                        style={{ color: "#f87171" }}
                                      >
                                        ⚠ Mistakes
                                      </p>
                                      <p
                                        className="text-xs"
                                        style={{ color: "#e6edf3" }}
                                      >
                                        {app.mistakes}
                                      </p>
                                    </div>
                                  )}
                                  {app.improvements && (
                                    <div>
                                      <p
                                        className="text-xs uppercase tracking-wider mb-1"
                                        style={{ color: "#4ade80" }}
                                      >
                                        ↑ Improve
                                      </p>
                                      <p
                                        className="text-xs"
                                        style={{ color: "#e6edf3" }}
                                      >
                                        {app.improvements}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {filtered.map((app) => {
                const c = STAGE_COLORS[app.status];
                const isExp = expanded === app.id;
                return (
                  <div
                    key={app.id}
                    className="rounded-xl border p-4"
                    style={{ background: "#0d1117", borderColor: "#21262d" }}
                    onClick={() => setExpanded(isExp ? null : app.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-white">{app.company}</p>
                        <p className="text-sm" style={{ color: "#8b949e" }}>
                          {app.role}
                        </p>
                      </div>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold"
                        style={{ background: `${c.dot}22`, color: c.text }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: c.dot }}
                        />
                        {app.status}
                      </span>
                    </div>
                    <div
                      className="flex gap-3 text-xs mb-3"
                      style={{ color: "#8b949e" }}
                    >
                      <span>{app.date_applied ?? "—"}</span>
                      <span>{app.source ?? "—"}</span>
                      <span>CV: {app.resume_version ?? "—"}</span>
                      <span
                        style={{
                          color: app.cover_letter ? "#4ade80" : "#8b949e",
                        }}
                      >
                        CL: {app.cover_letter ? "Y" : "N"}
                      </span>
                    </div>
                    {isExp &&
                      (app.mistakes || app.improvements || app.dsa_topics) && (
                        <div
                          className="border-t pt-3 mb-3 space-y-2"
                          style={{ borderColor: "#21262d" }}
                        >
                          {app.dsa_topics && (
                            <p className="text-xs" style={{ color: "#fbbf24" }}>
                              DSA: {app.dsa_topics}
                            </p>
                          )}
                          {app.mistakes && (
                            <p className="text-xs" style={{ color: "#f87171" }}>
                              ⚠ {app.mistakes}
                            </p>
                          )}
                          {app.improvements && (
                            <p className="text-xs" style={{ color: "#4ade80" }}>
                              ↑ {app.improvements}
                            </p>
                          )}
                        </div>
                      )}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModal(app);
                        }}
                        className="flex-1 py-1.5 rounded-lg text-xs font-bold border"
                        style={{ borderColor: "#30363d", color: "#8b949e" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(app.id);
                        }}
                        className="flex-1 py-1.5 rounded-lg text-xs font-bold border"
                        style={{ borderColor: "#30363d", color: "#f87171" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      {modal !== null && (
        <ApplicationModal
          app={modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      <AICoach applications={apps} />
    </div>
  );
}
