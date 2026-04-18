"use client";

import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Application, AppStatus, NewApplication } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import PipelineCard from "@/components/PipelineCard";
import ApplicationModal from "@/components/ApplicationModal";
import AICoach from "@/components/AICoach";
import MobileNav from "@/components/MobileNav";

function ExpandableItem({
  label,
  question,
  answer,
  labelColor,
  qPrefix,
  aPrefix,
}: {
  label: string;
  question: string;
  answer: string;
  labelColor: string;
  qPrefix: string;
  aPrefix: string;
}) {
  const [open, setOpen] = useState(false);
  const preview = question.trim()
    ? question.length > 90
      ? question.slice(0, 90) + "..."
      : question
    : "no question recorded";

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: "var(--bg)", border: "0.5px solid var(--border)" }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
        style={{ background: open ? "var(--bg-hover)" : "transparent" }}
      >
        <span
          className="mono text-xs font-medium px-2 py-0.5 rounded shrink-0"
          style={{
            background: `${labelColor}15`,
            color: labelColor,
            border: `0.5px solid ${labelColor}40`,
          }}
        >
          {label}
        </span>
        <span
          className="mono text-xs truncate flex-1"
          style={{ color: "var(--text)" }}
        >
          {preview}
        </span>
        {answer.trim() && !open && (
          <span
            className="mono text-[10px] shrink-0"
            style={{ color: "var(--accent)" }}
          >
            ✓
          </span>
        )}
        <span
          className="mono text-xs shrink-0"
          style={{ color: "var(--text-dim)" }}
        >
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open && (
        <div
          className="px-3 pb-3 pt-1 space-y-2 mono text-xs"
          style={{ borderTop: "0.5px solid var(--border)" }}
        >
          {question.trim() && (
            <div>
              <span style={{ color: "var(--text-dim)" }}>{qPrefix}: </span>
              <span
                className="break-words whitespace-pre-wrap"
                style={{ color: "var(--text)" }}
              >
                {question}
              </span>
            </div>
          )}
          {answer.trim() && (
            <div>
              <span style={{ color: "var(--accent)" }}>{aPrefix}: </span>
              <span
                className="break-words whitespace-pre-wrap"
                style={{ color: "var(--text)" }}
              >
                {answer}
              </span>
            </div>
          )}
          {!question.trim() && !answer.trim() && (
            <p style={{ color: "var(--text-muted)" }}>// no details recorded</p>
          )}
        </div>
      )}
    </div>
  );
}

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
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 sm:gap-6 pb-6 sm:pb-8 mb-6 sm:mb-8"
          style={{ borderBottom: "0.5px solid var(--border)" }}
        >
          <div>
            <h1
              className="text-6xl sm:text-6xl font-medium tracking-tight leading-none"
              style={{ color: "var(--text)" }}
            >
              {total}
              <span
                className="text-4xl sm:text-4xl ml-1"
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

          {/* Stats — grid on mobile, row on desktop */}
          <div
            className="grid grid-cols-2 sm:flex gap-4 sm:gap-10 pt-3 sm:pt-0"
            style={{ borderTop: "0.5px solid var(--border)" }}
          >
            <div
              className="sm:border-none pt-3 sm:pt-0"
              style={{ borderTop: "none" }}
            >
              <div
                className="mono text-xs uppercase tracking-widest"
                style={{ color: "var(--text-dim)" }}
              >
                response
              </div>
              <div
                className="mono text-2xl sm:text-2xl font-medium mt-1.5 sm:mt-2"
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
            <div className="pt-3 sm:pt-0">
              <div
                className="mono text-xs uppercase tracking-widest"
                style={{ color: "var(--text-dim)" }}
              >
                offers
              </div>
              <div
                className="mono text-2xl sm:text-2xl font-medium mt-1.5 sm:mt-2"
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
          className="flex rounded-lg overflow-hidden mb-8 overflow-x-auto scrollbar-none"
          style={{
            border: "0.5px solid var(--border)",
            WebkitOverflowScrolling: "touch",
          }}
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
                      className="px-4 sm:px-5 pb-4 pt-1 mb-2 rounded-b-lg space-y-4"
                      style={{ background: "var(--bg-hover)" }}
                    >
                      {/* Basic performance fields */}
                      {(app.oa_score || app.interview_outcome) && (
                        <div
                          className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3"
                          style={{ borderTop: "0.5px solid var(--border)" }}
                        >
                          {app.oa_score && (
                            <div>
                              <div
                                className="mono text-xs uppercase tracking-widest mb-1.5"
                                style={{ color: "var(--text-dim)" }}
                              >
                                oa score
                              </div>
                              <div
                                className="mono text-sm"
                                style={{ color: "var(--text)" }}
                              >
                                {app.oa_score}
                              </div>
                            </div>
                          )}
                          {app.interview_outcome && (
                            <div>
                              <div
                                className="mono text-xs uppercase tracking-widest mb-1.5"
                                style={{ color: "var(--text-dim)" }}
                              >
                                interview
                              </div>
                              <div
                                className="mono text-sm"
                                style={{ color: "var(--text)" }}
                              >
                                {app.interview_outcome}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* DSA Topics — collapsible list */}
                      {app.dsa_topics && app.dsa_topics.length > 0 && (
                        <div>
                          <div
                            className="mono text-xs uppercase tracking-widest mb-2"
                            style={{ color: "var(--text-dim)" }}
                          >
                            dsa topics
                          </div>
                          <div className="space-y-1.5">
                            {app.dsa_topics.map((item, i) => (
                              <ExpandableItem
                                key={i}
                                label={item.topic}
                                question={item.question}
                                answer={item.approach}
                                labelColor="#22C55E"
                                qPrefix="Q"
                                aPrefix="Approach"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Behavioural — collapsible list */}
                      {app.behavioural_questions &&
                        app.behavioural_questions.length > 0 && (
                          <div>
                            <div
                              className="mono text-xs uppercase tracking-widest mb-2"
                              style={{ color: "var(--text-dim)" }}
                            >
                              behavioural
                            </div>
                            <div className="space-y-1.5">
                              {app.behavioural_questions.map((bq, i) => (
                                <ExpandableItem
                                  key={i}
                                  label={`Q${i + 1}`}
                                  question={bq.question}
                                  answer={bq.answer}
                                  labelColor="#71717A"
                                  qPrefix="Q"
                                  aPrefix="A"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Reflection */}
                      {(app.mistakes || app.improvements) && (
                        <div
                          className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3"
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

                      {/* Mobile edit/delete */}
                      <div className="flex gap-2 sm:hidden">
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
      <MobileNav />
    </div>
  );
}
