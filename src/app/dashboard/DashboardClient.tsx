"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { User } from "@supabase/supabase-js";
import { Application, AppStatus, NewApplication } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import PipelineCard from "@/components/PipelineCard";
import ApplicationModal from "@/components/ApplicationModal";
import { formatRelativeDate, formatAbsoluteDate } from "@/lib/dateUtils";
import AICoach from "@/components/AICoach";
import MobileNav from "@/components/MobileNav";
import { Resume } from "@/lib/types";

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
  resumes,
}: {
  user: User;
  initialApps: Application[];
  firstName: string | null;
  resumes: Resume[];
}) {
  const [apps, setApps] = useState<Application[]>(initialApps);
  const [filter, setFilter] = useState<AppStatus | "All">("All");
  const [modal, setModal] = useState<Partial<Application> | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [showRejected, setShowRejected] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Cmd+K / Ctrl+K to focus the search input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        setQuery("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filtered = useMemo(() => {
    // Apply status filter first
    let byStatus =
      filter === "All" ? apps : apps.filter((a) => a.status === filter);

    // Hide rejected by default in "All" view, unless toggled on or actively searching
    if (filter === "All" && !showRejected && !query.trim()) {
      byStatus = byStatus.filter((a) => a.status !== "Rejected");
    }

    const q = query.trim().toLowerCase();
    if (!q) return byStatus;

    return byStatus.filter((a) => {
      const haystack = [
        a.company,
        a.role,
        a.status,
        a.source ?? "",
        a.mistakes ?? "",
        a.improvements ?? "",
        a.oa_score ?? "",
        a.interview_outcome ?? "",
        ...(a.dsa_topics ?? []).flatMap((t) => [
          t.topic,
          t.question,
          t.approach,
        ]),
        ...(a.behavioural_questions ?? []).flatMap((b) => [
          b.question,
          b.answer,
        ]),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [apps, filter, query, showRejected]);

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
                /applications
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
          className="flex rounded-lg mb-8 overflow-x-auto scrollbar-none"
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
        <div className="flex items-center justify-between mb-4 gap-3">
          <p
            className="mono text-sm uppercase tracking-widest truncate"
            style={{ color: "var(--text-dim)" }}
          >
            //{" "}
            {query.trim()
              ? `${filtered.length} match${filtered.length === 1 ? "" : "es"}`
              : filter === "All"
                ? "all applications"
                : `${filter.toLowerCase()} stage`}
          </p>
          <button
            onClick={() => setModal({})}
            className="mono text-sm px-4 py-2 rounded transition-colors hover:opacity-70 shrink-0"
            style={{
              border: "0.5px solid var(--border-strong)",
              color: "var(--text)",
            }}
          >
            + new
          </button>
        </div>

        {/* Search bar */}
        <div
          className="flex items-center gap-2 rounded-lg mb-5 px-3.5 transition-colors focus-within:border-[var(--accent)]"
          style={{
            background: "var(--bg-elev)",
            border: "0.5px solid var(--border-strong)",
            minHeight: "44px",
          }}
        >
          <span
            className="mono text-base shrink-0"
            style={{ color: "var(--accent)" }}
          >
            $
          </span>
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search company, role, notes, dsa topics..."
            autoComplete="off"
            spellCheck={false}
            className="flex-1 mono bg-transparent outline-none placeholder:opacity-60"
            style={{
              color: "var(--text)",
              fontSize: "16px",
            }}
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
              className="mono text-xs px-2 py-1 transition-opacity hover:opacity-70 shrink-0"
              style={{ color: "var(--text-dim)" }}
              aria-label="Clear search"
            >
              ✕
            </button>
          ) : (
            <span
              className="mono text-xs hidden sm:inline shrink-0 px-1.5 py-0.5 rounded"
              style={{
                color: "var(--text-dim)",
                border: "0.5px solid var(--border)",
              }}
            >
              ⌘K
            </span>
          )}
        </div>

        {/* Applications */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            {apps.length === 0 ? (
              <div className="space-y-6">
                <p
                  className="mono text-base"
                  style={{ color: "var(--text-dim)" }}
                >
                  {'// no applications yet → hit "+ new" to start'}
                </p>
                <div
                  className="flex items-center justify-center gap-3 mono text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  <div
                    className="h-[0.5px] w-12"
                    style={{ background: "var(--border)" }}
                  />
                  <span>or</span>
                  <div
                    className="h-[0.5px] w-12"
                    style={{ background: "var(--border)" }}
                  />
                </div>
                <button
                  onClick={async () => {
                    if (loadingDemo) return;
                    setLoadingDemo(true);
                    try {
                      const res = await fetch("/api/demo-load", {
                        method: "POST",
                      });
                      if (!res.ok) {
                        const data = await res.json();
                        alert(data.error ?? "Failed to load demo data");
                        setLoadingDemo(false);
                        return;
                      }
                      window.location.reload();
                    } catch {
                      alert("Network error — please try again");
                      setLoadingDemo(false);
                    }
                  }}
                  disabled={loadingDemo}
                  className="mono text-sm font-medium px-5 py-3 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: "var(--accent)",
                    color: "#0A0A0A",
                    opacity: loadingDemo ? 0.5 : 1,
                    cursor: loadingDemo ? "not-allowed" : "pointer",
                  }}
                >
                  {loadingDemo ? "$ loading..." : "$ load-demo-data"}
                </button>
                <p
                  className="mono text-xs mt-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  // populates 10 sample applications and 2 cv versions
                </p>
              </div>
            ) : (
              <p
                className="mono text-base"
                style={{ color: "var(--text-dim)" }}
              >
                {query.trim()
                  ? `// no matches for "${query}" → try a different term`
                  : "// no matches in this stage"}
              </p>
            )}
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
                      title={formatAbsoluteDate(app.date_applied)}
                    >
                      {formatRelativeDate(app.date_applied)}
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
                      {/* Linked resume */}
                      {app.resume_id &&
                        (() => {
                          const linkedResume = resumes.find(
                            (r) => r.id === app.resume_id,
                          );
                          if (!linkedResume) return null;
                          return (
                            <div
                              className="pt-3"
                              style={{ borderTop: "0.5px solid var(--border)" }}
                            >
                              <div
                                className="mono text-xs uppercase tracking-widest mb-1.5"
                                style={{ color: "var(--text-dim)" }}
                              >
                                resume
                              </div>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const { data } = await supabase.storage
                                    .from("resumes")
                                    .createSignedUrl(
                                      linkedResume.file_path,
                                      60,
                                    );
                                  if (data)
                                    window.open(data.signedUrl, "_blank");
                                }}
                                className="mono text-sm transition-opacity hover:opacity-70"
                                style={{ color: "var(--accent)" }}
                              >
                                $ open {linkedResume.label.toLowerCase()} →
                              </button>
                            </div>
                          );
                        })()}
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

        {/* Show/hide rejected toggle — only on All view, not searching, when rejected exist */}
        {filter === "All" &&
          !query.trim() &&
          apps.some((a) => a.status === "Rejected") && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setShowRejected((v) => !v)}
                className="mono text-sm px-5 py-2.5 rounded-lg transition-colors hover:opacity-70"
                style={{
                  border: "0.5px solid var(--border-strong)",
                  color: showRejected ? "var(--text)" : "var(--text-dim)",
                  background: showRejected ? "var(--bg-hover)" : "transparent",
                }}
              >
                {showRejected
                  ? `✓ showing ${apps.filter((a) => a.status === "Rejected").length} rejected`
                  : `show ${apps.filter((a) => a.status === "Rejected").length} rejected`}
              </button>
            </div>
          )}
      </main>

      {modal !== null && (
        <ApplicationModal
          app={modal}
          resumes={resumes}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      <AICoach applications={apps} />
      <MobileNav />
    </div>
  );
}
