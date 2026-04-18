"use client";

import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Application, AppStatus, NewApplication } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import PipelineCard from "@/components/PipelineCard";
import ApplicationModal from "@/components/ApplicationModal";
import AICoach from "@/components/AICoach";

const STAGES: AppStatus[] = ["Applied", "OA", "Interview", "Offer", "Rejected"];
const STAGE_COLORS: Record<AppStatus, string> = {
  Applied: "var(--blue)",
  OA: "var(--amber)",
  Interview: "var(--green)",
  Offer: "var(--purple)",
  Rejected: "var(--red)",
};

export default function DashboardClient({
  user,
  initialApps,
  firstName,
}: {
  user: User;
  initialApps: Application[];
  firstName: string | null;
}) {
  const [apps, setApps] = useState<Application[]>(initialApps);
  const [filter, setFilter] = useState<AppStatus | "All">("All");
  const [modal, setModal] = useState<Partial<Application> | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const supabase = createClient();

  const filtered =
    filter === "All" ? apps : apps.filter((a) => a.status === filter);
  const count = (s: AppStatus) => apps.filter((a) => a.status === s).length;
  const total = apps.length;
  const waiting = apps.filter((a) =>
    ["Applied", "OA", "Interview"].includes(a.status),
  ).length;
  const responseRate =
    total > 0
      ? Math.round(
          (apps.filter((a) => ["OA", "Interview", "Offer"].includes(a.status))
            .length /
            total) *
            100,
        )
      : 0;
  const offerRate =
    total > 0
      ? Math.round(
          (apps.filter((a) => a.status === "Offer").length / total) * 100,
        )
      : 0;

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
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar email={user.email ?? ""} firstName={firstName} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Hero stats */}
        <div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-8 mb-8"
          style={{ borderBottom: "0.5px solid var(--border)" }}
        >
          <div>
            <h1
              className="text-5xl sm:text-6xl font-medium tracking-tight leading-none"
              style={{ color: "var(--text)" }}
            >
              {total}
              <span
                className="text-3xl sm:text-4xl ml-1"
                style={{ color: "var(--text-dim)" }}
              >
                /apps
              </span>
            </h1>
            <p
              className="mono text-sm mt-3"
              style={{ color: "var(--text-dim)" }}
            >
              // {waiting} awaiting response
            </p>
          </div>
          <div className="flex gap-8 sm:gap-10">
            <div>
              <div
                className="mono text-xs uppercase tracking-widest"
                style={{ color: "var(--text-dim)" }}
              >
                response
              </div>
              <div
                className="mono text-2xl font-medium mt-2"
                style={{ color: "var(--text)" }}
              >
                {responseRate}
                <span
                  className="text-sm ml-1"
                  style={{ color: "var(--accent)" }}
                >
                  %
                </span>
              </div>
            </div>
            <div>
              <div
                className="mono text-xs uppercase tracking-widest"
                style={{ color: "var(--text-dim)" }}
              >
                offers
              </div>
              <div
                className="mono text-2xl font-medium mt-2"
                style={{ color: "var(--text)" }}
              >
                {offerRate}
                <span
                  className="text-sm ml-1"
                  style={{ color: "var(--accent)" }}
                >
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline */}
        <div
          className="flex rounded-lg overflow-hidden mb-8 overflow-x-auto"
          style={{ border: "0.5px solid var(--border)" }}
        >
          <PipelineCard
            stage="All"
            count={total}
            active={filter === "All"}
            onClick={() => setFilter("All")}
            isFirst
          />
          {STAGES.map((s, i) => (
            <PipelineCard
              key={s}
              stage={s}
              count={count(s)}
              active={filter === s}
              onClick={() => setFilter(s)}
              isLast={i === STAGES.length - 1}
            />
          ))}
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <p
            className="mono text-sm uppercase tracking-widest"
            style={{ color: "var(--text-dim)" }}
          >
            //{" "}
            {filter === "All"
              ? "all applications"
              : `${filter.toLowerCase()} stage`}
          </p>
          <button
            onClick={() => setModal({})}
            className="mono text-sm px-4 py-2 rounded transition-colors hover:opacity-70"
            style={{
              border: "0.5px solid var(--border-strong)",
              color: "var(--text)",
            }}
          >
            + new
          </button>
        </div>

        {/* Applications */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="mono text-base" style={{ color: "var(--text-dim)" }}>
              {apps.length === 0
                ? '// no applications yet → hit "+ new" to start'
                : "// no matches in this stage"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((app) => {
              const isExp = expanded === app.id;
              return (
                <React.Fragment key={app.id}>
                  <div
                    className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-4 sm:gap-6 items-center py-4 px-4 sm:px-5 rounded-lg cursor-pointer transition-colors"
                    style={{
                      background: isExp ? "var(--bg-hover)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isExp)
                        e.currentTarget.style.background = "var(--bg-hover)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isExp)
                        e.currentTarget.style.background = "transparent";
                    }}
                    onClick={() => setExpanded(isExp ? null : app.id)}
                  >
                    <div className="min-w-0">
                      <div
                        className="text-base font-medium truncate"
                        style={{ color: "var(--text)" }}
                      >
                        {app.company}
                      </div>
                      <div
                        className="mono text-sm mt-1 truncate"
                        style={{ color: "var(--text-dim)" }}
                      >
                        {app.role.toLowerCase().replace(/ /g, "-")}
                        {app.source && ` → ${app.source.toLowerCase()}`}
                      </div>
                    </div>
                    <div
                      className="mono text-sm hidden sm:block"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {app.date_applied ?? "—"}
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 mono text-xs uppercase tracking-wider px-2.5 py-1.5 rounded"
                      style={{
                        border: `0.5px solid ${STAGE_COLORS[app.status]}40`,
                        background: `${STAGE_COLORS[app.status]}0D`,
                        color: STAGE_COLORS[app.status],
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: STAGE_COLORS[app.status] }}
                      />
                      {app.status.toLowerCase()}
                    </span>
                    <div className="hidden sm:flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModal(app);
                        }}
                        className="mono text-xs px-2 py-1 transition-opacity hover:opacity-60"
                        style={{ color: "var(--text-dim)" }}
                      >
                        edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(app.id);
                        }}
                        className="mono text-xs px-2 py-1 transition-opacity hover:opacity-60"
                        style={{ color: "var(--red)" }}
                      >
                        del
                      </button>
                    </div>
                  </div>
                  {isExp && (
                    <div
                      className="px-4 sm:px-5 pb-4 pt-1 mb-2 rounded-b-lg"
                      style={{ background: "var(--bg-hover)" }}
                    >
                      <div
                        className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-4 pt-3"
                        style={{ borderTop: "0.5px solid var(--border)" }}
                      >
                        {[
                          ["oa_score", app.oa_score],
                          ["interview", app.interview_outcome],
                          ["dsa", app.dsa_topics],
                          ["behavioural", app.behavioural_questions],
                        ]
                          .filter(([, v]) => v)
                          .map(([k, v]) => (
                            <div key={k as string}>
                              <div
                                className="mono text-xs uppercase tracking-widest mb-1.5"
                                style={{ color: "var(--text-dim)" }}
                              >
                                {k}
                              </div>
                              <div
                                className="mono text-sm"
                                style={{ color: "var(--text)" }}
                              >
                                {v}
                              </div>
                            </div>
                          ))}
                      </div>
                      {(app.mistakes || app.improvements) && (
                        <div
                          className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4"
                          style={{ borderTop: "0.5px solid var(--border)" }}
                        >
                          {app.mistakes && (
                            <div>
                              <div
                                className="mono text-xs uppercase tracking-widest mb-1.5"
                                style={{ color: "var(--red)" }}
                              >
                                mistakes
                              </div>
                              <div
                                className="text-sm"
                                style={{ color: "var(--text)" }}
                              >
                                {app.mistakes}
                              </div>
                            </div>
                          )}
                          {app.improvements && (
                            <div>
                              <div
                                className="mono text-xs uppercase tracking-widest mb-1.5"
                                style={{ color: "var(--accent)" }}
                              >
                                improve
                              </div>
                              <div
                                className="text-sm"
                                style={{ color: "var(--text)" }}
                              >
                                {app.improvements}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2 mt-4 sm:hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModal(app);
                          }}
                          className="flex-1 mono text-sm py-2.5 rounded"
                          style={{
                            border: "0.5px solid var(--border-strong)",
                            color: "var(--text)",
                          }}
                        >
                          edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(app.id);
                          }}
                          className="flex-1 mono text-sm py-2.5 rounded"
                          style={{
                            border: "0.5px solid var(--border-strong)",
                            color: "var(--red)",
                          }}
                        >
                          delete
                        </button>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
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
