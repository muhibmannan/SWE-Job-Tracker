"use client";

import { useState, useEffect, useRef } from "react";
import { Application } from "@/lib/types";

const QUICK_PROMPTS = [
  "What patterns do you see in my rejections?",
  "What DSA topics should I focus on based on my interviews?",
  "Which application source is working best for me?",
  "Give me a study plan for my next interview",
  "How can I improve my OA performance?",
  "Analyse my overall application strategy",
];

export default function AICoach({
  applications,
}: {
  applications: Application[];
}) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history, loading]);

  const ask = async (q: string) => {
    if (!q.trim() || loading) return;
    setLoading(true);
    setQuestion("");

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, applications }),
      });
      const data = await res.json();
      setHistory((h) => [...h, { q, a: data.response }]);
    } catch {
      setHistory((h) => [
        ...h,
        { q, a: "// error: connection failed → please try again" },
      ]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      {/* Mobile — glass style */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open AI Career Coach"
        className="sm:hidden fixed z-40 mono text-sm font-medium flex items-center gap-2 px-4 py-3 rounded-full transition-all hover:scale-105 active:scale-[0.98] bottom-20 right-4"
        style={{
          background: "color-mix(in srgb, var(--bg-elev) 55%, transparent)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border:
            "0.5px solid color-mix(in srgb, var(--accent) 40%, transparent)",
          color: "var(--accent)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.25), inset 0 0 0 0.5px rgba(255, 255, 255, 0.08)",
        }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background: "var(--accent)",
            boxShadow: "0 0 8px var(--accent)",
          }}
        />
        <span>$ coach</span>
      </button>

      {/* Desktop — solid green pill */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open AI Career Coach"
        className="hidden sm:flex fixed z-40 mono text-sm font-medium items-center gap-2 px-4 py-3 rounded-full transition-all hover:opacity-90 active:scale-[0.98] bottom-6 right-6"
        style={{
          background: "var(--accent)",
          color: "#0A0A0A",
          boxShadow: "0 4px 24px rgba(34, 197, 94, 0.25)",
        }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: "#0A0A0A" }}
        />
        <span>$ coach</span>
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end"
          style={{
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full sm:w-[440px] sm:h-screen flex flex-col rounded-t-2xl sm:rounded-none overflow-hidden"
            style={{
              background: "var(--bg-elev)",
              border: "0.5px solid var(--border)",
              maxHeight: "92dvh",
              height: "92dvh",
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

            {/* Terminal chrome header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                borderBottom: "0.5px solid var(--border)",
                background: "var(--bg)",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
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
                  className="mono text-xs sm:ml-2"
                  style={{ color: "var(--text-dim)" }}
                >
                  coach.sh
                  <span className="hidden sm:inline"> — zsh</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mono text-sm sm:text-xs w-10 h-10 sm:w-auto sm:h-auto flex items-center justify-center rounded-lg sm:rounded-none transition-opacity hover:opacity-70 -mr-2 sm:mr-0"
                style={{ color: "var(--text)", background: "transparent" }}
                aria-label="Close"
              >
                <span className="sm:hidden text-xl">✕</span>
                <span className="hidden sm:inline">esc</span>
              </button>
            </div>

            {/* Sub-header */}
            <div
              className="px-5 py-3"
              style={{ borderBottom: "0.5px solid var(--border)" }}
            >
              <p className="mono text-sm" style={{ color: "var(--text-dim)" }}>
                // <span style={{ color: "var(--accent)" }}>groq</span> ·{" "}
                {applications.length} application
                {applications.length === 1 ? "" : "s"} in context
              </p>
            </div>

            {/* Chat body */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 py-5 space-y-5"
            >
              {history.length === 0 && !loading && (
                <div>
                  <p
                    className="mono text-sm mb-4"
                    style={{ color: "var(--text-dim)" }}
                  >
                    // ask anything about your applications → i&apos;ll analyse
                    your data and give you specific, actionable advice
                  </p>
                  <div className="space-y-1.5">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => ask(p)}
                        className="w-full text-left mono text-sm px-3 py-2.5 rounded-lg transition-colors hover:opacity-70"
                        style={{
                          background: "var(--bg)",
                          border: "0.5px solid var(--border)",
                          color: "var(--text-dim)",
                        }}
                      >
                        <span style={{ color: "var(--accent)" }}>$ </span>
                        {p.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {history.map((h, i) => (
                <div key={i} className="space-y-3">
                  {/* Question — as terminal prompt */}
                  <div>
                    <p className="mono text-sm leading-relaxed break-words">
                      <span style={{ color: "var(--accent)" }}>$ </span>
                      <span style={{ color: "var(--text)" }}>{h.q}</span>
                    </p>
                  </div>
                  {/* Answer — as output */}
                  <div
                    className="px-4 py-3 rounded-lg"
                    style={{
                      background: "var(--bg)",
                      border: "0.5px solid var(--border)",
                    }}
                  >
                    <p
                      className="text-base whitespace-pre-wrap break-words"
                      style={{ color: "var(--text)", lineHeight: 1.65 }}
                    >
                      {h.a}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div>
                  <p
                    className="mono text-sm flex items-center gap-2"
                    style={{ color: "var(--text-dim)" }}
                  >
                    <span style={{ color: "var(--accent)" }}>$</span>
                    <span>analysing</span>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="inline-block w-1 h-1 rounded-full animate-bounce"
                        style={{
                          background: "var(--accent)",
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </p>
                </div>
              )}
            </div>

            {/* Quick prompts carousel — after first message */}
            {history.length > 0 && !loading && (
              <div
                className="px-5 py-2.5 overflow-x-auto scrollbar-none"
                style={{ borderTop: "0.5px solid var(--border)" }}
              >
                <div className="flex gap-1.5 pb-0.5">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => ask(p)}
                      className="whitespace-nowrap mono text-sm px-3 py-1.5 rounded-lg shrink-0 transition-colors hover:opacity-70"
                      style={{
                        background: "var(--bg)",
                        border: "0.5px solid var(--border)",
                        color: "var(--text-dim)",
                      }}
                    >
                      {p.toLowerCase().split(" ").slice(0, 5).join(" ")}
                      {p.split(" ").length > 5 ? "…" : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input — terminal style */}
            <div
              className="px-4 py-3"
              style={{
                borderTop: "0.5px solid var(--border)",
                background: "var(--bg)",
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="mono text-base shrink-0"
                  style={{ color: "var(--accent)" }}
                >
                  $
                </span>
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && ask(question)}
                  placeholder="ask about your applications..."
                  className="flex-1 mono bg-transparent outline-none"
                  style={{
                    color: "var(--text)",
                    fontSize: "16px",
                    minHeight: "36px",
                  }}
                  disabled={loading}
                />
                <button
                  onClick={() => ask(question)}
                  disabled={loading || !question.trim()}
                  className="mono text-sm font-medium px-3 py-2 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: "var(--accent)",
                    color: "#0A0A0A",
                    opacity: loading || !question.trim() ? 0.4 : 1,
                    cursor:
                      loading || !question.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  run
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
