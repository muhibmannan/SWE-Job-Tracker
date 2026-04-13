"use client";

import { useState } from "react";
import { Application, AppStatus, NewApplication } from "@/lib/types";

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
const STAGE_COLORS: Record<
  AppStatus,
  { bg: string; text: string; border: string }
> = {
  Applied: { bg: "#1e3a5f", text: "#60a5fa", border: "#3b82f6" },
  OA: { bg: "#3b2a00", text: "#fbbf24", border: "#f59e0b" },
  Interview: { bg: "#1a2e1a", text: "#4ade80", border: "#22c55e" },
  Offer: { bg: "#1f1060", text: "#a78bfa", border: "#8b5cf6" },
  Rejected: { bg: "#2d1515", text: "#f87171", border: "#ef4444" },
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
  dsa_topics: "",
  behavioural_questions: "",
  mistakes: "",
  improvements: "",
};

export default function ApplicationModal({ app, onClose, onSave }: Props) {
  const [form, setForm] = useState<NewApplication>({ ...EMPTY, ...app });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof NewApplication, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.company || !form.role) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const input = "w-full px-3 py-2 rounded-lg text-sm border outline-none";
  const inputStyle = {
    background: "#0d1117",
    borderColor: "#30363d",
    color: "#e6edf3",
  };
  const label = "block text-xs font-bold uppercase tracking-wider mb-1.5";
  const labelStyle = { color: "#8b949e" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(1,4,9,0.85)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl border overflow-auto max-h-[92vh]"
        style={{ background: "#161b22", borderColor: "#30363d" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar for mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "#30363d" }}
          />
        </div>

        <div className="px-5 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white text-lg">
              {app?.id ? "Edit Application" : "New Application"}
            </h2>
            <button
              onClick={onClose}
              className="text-xl w-8 h-8 flex items-center justify-center rounded-lg"
              style={{ color: "#8b949e", background: "#21262d" }}
            >
              ✕
            </button>
          </div>

          {/* Core fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={label} style={labelStyle}>
                Company *
              </label>
              <input
                className={input}
                style={inputStyle}
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="e.g. Atlassian"
              />
            </div>
            <div>
              <label className={label} style={labelStyle}>
                Role *
              </label>
              <input
                className={input}
                style={inputStyle}
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                placeholder="e.g. Graduate SWE"
              />
            </div>
            <div>
              <label className={label} style={labelStyle}>
                Date Applied
              </label>
              <input
                type="date"
                className={input}
                style={inputStyle}
                value={form.date_applied ?? ""}
                onChange={(e) => set("date_applied", e.target.value)}
              />
            </div>
            <div>
              <label className={label} style={labelStyle}>
                Deadline
              </label>
              <input
                type="date"
                className={input}
                style={inputStyle}
                value={form.deadline ?? ""}
                onChange={(e) => set("deadline", e.target.value)}
              />
            </div>
          </div>

          {/* Status */}
          <div className="mb-4">
            <label className={label} style={labelStyle}>
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => {
                const c = STAGE_COLORS[s];
                const active = form.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => set("status", s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                    style={{
                      background: active ? c.bg : "transparent",
                      borderColor: active ? c.border : "#30363d",
                      color: active ? c.text : "#8b949e",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Strategy */}
          <div
            className="border-t pt-4 mb-4"
            style={{ borderColor: "#21262d" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: "#4ade80" }}
            >
              Strategy
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={label} style={labelStyle}>
                  Source
                </label>
                <select
                  className={input}
                  style={inputStyle}
                  value={form.source ?? ""}
                  onChange={(e) => set("source", e.target.value)}
                >
                  <option value="">—</option>
                  {SOURCES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label} style={labelStyle}>
                  Resume Version
                </label>
                <input
                  className={input}
                  style={inputStyle}
                  value={form.resume_version ?? ""}
                  onChange={(e) => set("resume_version", e.target.value)}
                  placeholder="v1 / v2 / tailored"
                />
              </div>
              <div>
                <label className={label} style={labelStyle}>
                  Cover Letter
                </label>
                <div className="flex gap-2">
                  {[true, false].map((v) => (
                    <button
                      key={String(v)}
                      onClick={() => set("cover_letter", v)}
                      className="flex-1 py-2 rounded-lg text-xs font-bold border transition-all"
                      style={{
                        background:
                          form.cover_letter === v ? "#1a2e1a" : "transparent",
                        borderColor:
                          form.cover_letter === v ? "#22c55e" : "#30363d",
                        color: form.cover_letter === v ? "#4ade80" : "#8b949e",
                      }}
                    >
                      {v ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div
            className="border-t pt-4 mb-4"
            style={{ borderColor: "#21262d" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: "#fbbf24" }}
            >
              Performance
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label} style={labelStyle}>
                  OA Score / Result
                </label>
                <input
                  className={input}
                  style={inputStyle}
                  value={form.oa_score ?? ""}
                  onChange={(e) => set("oa_score", e.target.value)}
                  placeholder="e.g. 85% / Pass"
                />
              </div>
              <div>
                <label className={label} style={labelStyle}>
                  Interview Outcome
                </label>
                <input
                  className={input}
                  style={inputStyle}
                  value={form.interview_outcome ?? ""}
                  onChange={(e) => set("interview_outcome", e.target.value)}
                  placeholder="Pass/Fail — reason"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className={label} style={labelStyle}>
                  DSA Topics Asked
                </label>
                <input
                  className={input}
                  style={inputStyle}
                  value={form.dsa_topics ?? ""}
                  onChange={(e) => set("dsa_topics", e.target.value)}
                  placeholder="Sliding window, Graph BFS…"
                />
              </div>
              <div>
                <label className={label} style={labelStyle}>
                  Behavioural Questions
                </label>
                <input
                  className={input}
                  style={inputStyle}
                  value={form.behavioural_questions ?? ""}
                  onChange={(e) => set("behavioural_questions", e.target.value)}
                  placeholder="Tell me about a conflict…"
                />
              </div>
            </div>
          </div>

          {/* Reflection */}
          <div
            className="border-t pt-4 mb-5"
            style={{ borderColor: "#21262d" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: "#f87171" }}
            >
              Reflection
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label} style={labelStyle}>
                  Mistakes Made
                </label>
                <textarea
                  className={input}
                  style={{ ...inputStyle, resize: "vertical" }}
                  rows={3}
                  value={form.mistakes ?? ""}
                  onChange={(e) => set("mistakes", e.target.value)}
                  placeholder="What went wrong?"
                />
              </div>
              <div>
                <label className={label} style={labelStyle}>
                  What to Improve
                </label>
                <textarea
                  className={input}
                  style={{ ...inputStyle, resize: "vertical" }}
                  rows={3}
                  value={form.improvements ?? ""}
                  onChange={(e) => set("improvements", e.target.value)}
                  placeholder="Specific actions to take…"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold border"
              style={{ borderColor: "#30363d", color: "#8b949e" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.company || !form.role}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity"
              style={{
                background: "#238636",
                color: "#fff",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving
                ? "Saving…"
                : app?.id
                  ? "Save Changes"
                  : "Add Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
