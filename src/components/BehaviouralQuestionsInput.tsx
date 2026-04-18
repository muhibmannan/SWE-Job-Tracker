"use client";

import { useState } from "react";
import { BehaviouralQuestion } from "@/lib/types";

interface Props {
  value: BehaviouralQuestion[];
  onChange: (questions: BehaviouralQuestion[]) => void;
}

export default function BehaviouralQuestionsInput({ value, onChange }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const addCard = () => {
    const newIdx = value.length;
    onChange([...value, { question: "", answer: "" }]);
    setExpanded(newIdx);
  };

  const updateCard = (
    idx: number,
    field: "question" | "answer",
    val: string,
  ) => {
    onChange(value.map((c, i) => (i === idx ? { ...c, [field]: val } : c)));
  };

  const removeCard = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
    if (expanded === idx) setExpanded(null);
  };

  const inputBase =
    "w-full mono text-sm px-3 py-2 rounded outline-none border transition-colors focus:border-[var(--accent)]";
  const inputStyle = {
    background: "var(--bg)",
    borderColor: "var(--border)",
    color: "var(--text)",
  };

  const preview = (q: string) =>
    q.trim()
      ? q.length > 80
        ? q.slice(0, 80) + "..."
        : q
      : "untitled question";

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p
          className="mono text-xs italic py-2"
          style={{ color: "var(--text-muted)" }}
        >
          // no questions added yet
        </p>
      )}

      {value.map((card, i) => {
        const isOpen = expanded === i;
        return (
          <div
            key={i}
            className="rounded-lg overflow-hidden transition-all"
            style={{
              background: "var(--bg)",
              border: "0.5px solid var(--border)",
            }}
          >
            {/* Header — always visible */}
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : i)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
              style={{ background: isOpen ? "var(--bg-hover)" : "transparent" }}
            >
              <span
                className="mono text-[10px] uppercase tracking-widest shrink-0"
                style={{ color: "var(--text-dim)" }}
              >
                Q{i + 1}
              </span>
              <span
                className="mono text-xs truncate flex-1"
                style={{
                  color: card.question.trim()
                    ? "var(--text)"
                    : "var(--text-muted)",
                }}
              >
                {preview(card.question)}
              </span>
              {card.answer.trim() && !isOpen && (
                <span
                  className="mono text-[10px]"
                  style={{ color: "var(--accent)" }}
                >
                  ✓ answered
                </span>
              )}
              <span
                className="mono text-xs shrink-0"
                style={{ color: "var(--text-dim)" }}
              >
                {isOpen ? "▾" : "▸"}
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  removeCard(i);
                }}
                className="mono text-base shrink-0 transition-opacity hover:opacity-70"
                style={{ color: "var(--red)" }}
                role="button"
                aria-label="Remove question"
              >
                ×
              </span>
            </button>

            {/* Body — only when expanded */}
            {isOpen && (
              <div
                className="p-3 pt-1 space-y-2"
                style={{ borderTop: "0.5px solid var(--border)" }}
              >
                <div className="flex items-start gap-2">
                  <span
                    className="mono text-[10px] uppercase tracking-widest pt-2 shrink-0"
                    style={{ color: "var(--text-dim)", minWidth: 24 }}
                  >
                    Q
                  </span>
                  <textarea
                    value={card.question}
                    onChange={(e) => updateCard(i, "question", e.target.value)}
                    placeholder="tell me about a time when..."
                    rows={2}
                    className={inputBase + " resize-y min-h-[50px]"}
                    style={inputStyle}
                    autoFocus
                  />
                </div>
                <div className="flex items-start gap-2">
                  <span
                    className="mono text-[10px] uppercase tracking-widest pt-2 shrink-0"
                    style={{ color: "var(--accent)", minWidth: 24 }}
                  >
                    A
                  </span>
                  <textarea
                    value={card.answer}
                    onChange={(e) => updateCard(i, "answer", e.target.value)}
                    placeholder="your answer — use star method..."
                    rows={4}
                    className={inputBase + " resize-y min-h-[90px]"}
                    style={inputStyle}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addCard}
        className="w-full mono text-sm py-2.5 rounded-lg transition-all hover:opacity-80 flex items-center justify-center gap-2"
        style={{
          background: "transparent",
          border: "0.5px dashed var(--border-strong)",
          color: "var(--text-dim)",
        }}
      >
        <span>+</span>
        <span>add question</span>
      </button>
    </div>
  );
}
