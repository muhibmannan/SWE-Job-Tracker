"use client";

import { useState, useEffect } from "react";
import { Application, AppStatus, NewApplication } from "@/lib/types";
import DSATopicsInput from "./DSATopicsInput";
import BehaviouralQuestionsInput from "./BehaviouralQuestionsInput";

const STAGES: AppStatus[] = ["Applied", "OA", "Interview", "Offer", "Rejected"];
const SOURCES = [
  "Seek",
  "LinkedIn",
  "GradConnection",
  "GradAustralia",
  "Company Site",
  "Referral",
  "Other",
];

const STAGE_COLORS: Record<AppStatus, string> = {
  Applied: "var(--blue)",
  OA: "var(--amber)",
  Interview: "var(--green)",
  Offer: "var(--purple)",
  Rejected: "var(--red)",
};

interface Props {
  app: Partial<Application> | null;
  onClose: () => void;
  onSave: (data: NewApplication) => Promise<void>;
}

const EMPTY: NewApplication = {
  company: "",
  role: "",
  date_applied: "",
  deadline: "",
  status: "Applied",
  source: "",
  resume_version: "",
  cover_letter: false,
  oa_score: "",
  interview_outcome: "",
  dsa_topics: [],
  behavioural_questions: [],
  mistakes: "",
  improvements: "",
};

export default function ApplicationModal({ app, onClose, onSave }: Props) {
  const [form, setForm] = useState<NewApplication>({ ...EMPTY, ...app });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof NewApplication, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSave = async () => {
    if (!form.company || !form.role) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const inputStyle = {
    background: "var(--bg)",
    borderColor: "var(--border-strong)",
    color: "var(--text)",
  };
  const inputClasses =
    "w-full mono text-sm px-3 py-2.5 rounded-lg outline-none border transition-colors focus:border-[var(--accent)]";

  const Label = ({ children }: { children: string }) => (
    <label
      className="mono text-[10px] uppercase tracking-[0.15em] mb-1.5 block"
      style={{ color: "var(--text-dim)" }}
    >
      {children}
    </label>
  );

  const SectionHeader = ({
    label,
    color,
  }: {
    label: string;
    color: string;
  }) => (
    <div className="flex items-center gap-2 mt-6 mb-4">
      <div className="w-1 h-4 rounded-full" style={{ background: color }} />
      <span
        className="mono text-xs uppercase tracking-[0.15em] font-medium"
        style={{ color }}
      >
        // {label}
      </span>
      <div
        className="flex-1 h-[0.5px]"
        style={{ background: "var(--border)" }}
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl rounded-t-2xl sm:rounded-xl overflow-hidden flex flex-col"
        style={{
          background: "var(--bg-elev)",
          border: "0.5px solid var(--border)",
          maxHeight: "94vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "var(--border-strong)" }}
          />
        </div>

        {/* Terminal chrome */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            borderBottom: "0.5px solid var(--border)",
            background: "var(--bg)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={onClose}
                className="w-2.5 h-2.5 rounded-full transition-opacity hover:opacity-70"
                style={{ background: "#FF5F57" }}
                aria-label="Close"
              />
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "#FEBC2E" }}
              />
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "#28C840" }}
              />
            </div>
            <span
              className="mono text-xs ml-2"
              style={{ color: "var(--text-dim)" }}
            >
              {app?.id ? "edit-application.sh" : "new-application.sh"} — zsh
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mono text-xs transition-opacity hover:opacity-70"
            style={{ color: "var(--text-dim)" }}
          >
            esc
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <p className="mono text-xs" style={{ color: "var(--text-dim)" }}>
            {app?.id
              ? "// editing existing application"
              : "// new application record"}
          </p>

          {/* Core */}
          <SectionHeader label="core" color="var(--text)" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>company *</Label>
              <input
                className={inputClasses}
                style={inputStyle}
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="atlassian"
                autoFocus
              />
            </div>
            <div>
              <Label>role *</Label>
              <input
                className={inputClasses}
                style={inputStyle}
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                placeholder="graduate swe"
              />
            </div>
            <div>
              <Label>date applied</Label>
              <input
                type="date"
                className={inputClasses}
                style={inputStyle}
                value={form.date_applied ?? ""}
                onChange={(e) => set("date_applied", e.target.value)}
              />
            </div>
            <div>
              <Label>deadline</Label>
              <input
                type="date"
                className={inputClasses}
                style={inputStyle}
                value={form.deadline ?? ""}
                onChange={(e) => set("deadline", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>status</Label>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => {
                const active = form.status === s;
                const color = STAGE_COLORS[s];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("status", s)}
                    className="mono text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: active ? `${color}15` : "transparent",
                      border: `0.5px solid ${active ? color : "var(--border-strong)"}`,
                      color: active ? color : "var(--text-dim)",
                    }}
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                      style={{
                        background: active ? color : "var(--text-muted)",
                      }}
                    />
                    {s.toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Strategy */}
          <SectionHeader label="strategy" color="var(--accent)" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>source</Label>
              <select
                className={inputClasses}
                style={inputStyle}
                value={form.source ?? ""}
                onChange={(e) => set("source", e.target.value)}
              >
                <option value="">—</option>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>cv version</Label>
              <input
                className={inputClasses}
                style={inputStyle}
                value={form.resume_version ?? ""}
                onChange={(e) => set("resume_version", e.target.value)}
                placeholder="v1 / v2 / tailored"
              />
            </div>
            <div>
              <Label>cover letter</Label>
              <div className="flex gap-2">
                {[
                  { v: true, label: "yes" },
                  { v: false, label: "no" },
                ].map((opt) => {
                  const active = form.cover_letter === opt.v;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => set("cover_letter", opt.v)}
                      className="flex-1 mono text-xs py-2.5 rounded-lg transition-all"
                      style={{
                        background: active ? "var(--accent-bg)" : "transparent",
                        border: `0.5px solid ${active ? "var(--accent)" : "var(--border-strong)"}`,
                        color: active ? "var(--accent)" : "var(--text-dim)",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Performance */}
          <SectionHeader label="performance" color="var(--amber)" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>oa score / result</Label>
              <input
                className={inputClasses}
                style={inputStyle}
                value={form.oa_score ?? ""}
                onChange={(e) => set("oa_score", e.target.value)}
                placeholder="85% / pass"
              />
            </div>
            <div>
              <Label>interview outcome</Label>
              <input
                className={inputClasses}
                style={inputStyle}
                value={form.interview_outcome ?? ""}
                onChange={(e) => set("interview_outcome", e.target.value)}
                placeholder="pass — reason"
              />
            </div>
          </div>

          <div className="mb-4">
            <Label>dsa topics asked</Label>
            <DSATopicsInput
              value={form.dsa_topics}
              onChange={(topics) => set("dsa_topics", topics)}
            />
          </div>

          <div className="mb-4">
            <Label>behavioural questions</Label>
            <BehaviouralQuestionsInput
              value={form.behavioural_questions}
              onChange={(qs) => set("behavioural_questions", qs)}
            />
          </div>

          {/* Reflection */}
          <SectionHeader label="reflection" color="var(--red)" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>mistakes made</Label>
              <textarea
                className={inputClasses + " resize-y min-h-[80px]"}
                style={inputStyle}
                rows={3}
                value={form.mistakes ?? ""}
                onChange={(e) => set("mistakes", e.target.value)}
                placeholder="what went wrong?"
              />
            </div>
            <div>
              <Label>what to improve</Label>
              <textarea
                className={inputClasses + " resize-y min-h-[80px]"}
                style={inputStyle}
                rows={3}
                value={form.improvements ?? ""}
                onChange={(e) => set("improvements", e.target.value)}
                placeholder="specific actions to take..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 px-5 sm:px-6 py-4"
          style={{
            borderTop: "0.5px solid var(--border)",
            background: "var(--bg)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-none mono text-sm px-4 py-2.5 rounded-lg transition-colors hover:opacity-70"
            style={{
              border: "0.5px solid var(--border-strong)",
              color: "var(--text-dim)",
            }}
          >
            cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !form.company || !form.role}
            className="flex-1 mono text-sm font-medium py-2.5 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "var(--accent)",
              color: "#0A0A0A",
              opacity: saving || !form.company || !form.role ? 0.4 : 1,
              cursor:
                saving || !form.company || !form.role
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {saving
              ? "$ saving..."
              : app?.id
                ? "$ save-changes"
                : "$ create-application"}
          </button>
        </div>
      </div>
    </div>
  );
}
