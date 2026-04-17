"use client";

import { useState } from "react";
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
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);

  const ask = async (q: string) => {
    if (!q.trim() || loading) return;
    setLoading(true);
    setQuestion("");
    setResponse("");

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
        { q, a: "Something went wrong. Please try again." },
      ]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm shadow-lg transition-transform hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #1f6feb, #8b5cf6)",
          color: "#fff",
          boxShadow: "0 0 20px #1f6feb66",
        }}
      >
        <span className="text-lg">🤖</span>
        <span className="hidden sm:inline">AI Career Coach</span>
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-end"
          style={{ background: "rgba(1,4,9,0.6)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full sm:w-[420px] h-[90vh] sm:h-screen flex flex-col border-l"
            style={{ background: "#0d1117", borderColor: "#21262d" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "#21262d" }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <span className="font-bold text-white">AI Career Coach</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: "#8b949e" }}>
                  Powered by Groq · {applications.length} applications analysed
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-lg"
                style={{ color: "#8b949e", background: "#21262d" }}
              >
                ✕
              </button>
            </div>

            {/* Chat history */}
            <div className="flex-1 overflow-auto px-5 py-4 space-y-5">
              {history.length === 0 && !loading && (
                <div>
                  <p className="text-sm mb-4" style={{ color: "#8b949e" }}>
                    Ask me anything about your applications. I'll analyse your
                    data and give you specific, actionable advice.
                  </p>
                  <div className="space-y-2">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => ask(p)}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-xs border transition-colors"
                        style={{
                          borderColor: "#21262d",
                          color: "#8b949e",
                          background: "#161b22",
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {history.map((h, i) => (
                <div key={i} className="space-y-3">
                  {/* Question */}
                  <div className="flex justify-end">
                    <div
                      className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm"
                      style={{ background: "#1f6feb", color: "#fff" }}
                    >
                      {h.q}
                    </div>
                  </div>
                  {/* Answer */}
                  <div className="flex justify-start">
                    <div
                      className="max-w-[95%] px-4 py-3 rounded-2xl rounded-tl-sm text-sm border"
                      style={{
                        background: "#161b22",
                        borderColor: "#21262d",
                        color: "#e6edf3",
                      }}
                    >
                      <div
                        className="prose-sm whitespace-pre-wrap"
                        style={{ lineHeight: 1.6 }}
                      >
                        {h.a}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div
                    className="px-4 py-3 rounded-2xl rounded-tl-sm border"
                    style={{ background: "#161b22", borderColor: "#21262d" }}
                  >
                    <div className="flex gap-1.5 items-center">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            background: "#8b949e",
                            animationDelay: `${i * 0.15}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick prompts after first message */}
            {history.length > 0 && !loading && (
              <div
                className="px-5 py-2 border-t overflow-x-auto"
                style={{ borderColor: "#21262d" }}
              >
                <div className="flex gap-2 pb-1">
                  {QUICK_PROMPTS.slice(0, 3).map((p) => (
                    <button
                      key={p}
                      onClick={() => ask(p)}
                      className="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs border flex-shrink-0"
                      style={{
                        borderColor: "#21262d",
                        color: "#8b949e",
                        background: "#161b22",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div
              className="px-5 py-4 border-t"
              style={{ borderColor: "#21262d" }}
            >
              <div className="flex gap-2">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && ask(question)}
                  placeholder="Ask about your applications…"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm border outline-none"
                  style={{
                    background: "#161b22",
                    borderColor: "#30363d",
                    color: "#e6edf3",
                  }}
                />
                <button
                  onClick={() => ask(question)}
                  disabled={loading || !question.trim()}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity"
                  style={{
                    background: "#1f6feb",
                    color: "#fff",
                    opacity: loading || !question.trim() ? 0.5 : 1,
                  }}
                >
                  Ask
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
