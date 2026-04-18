"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { DSATopic } from "@/lib/types";

const DSA_TOPICS = [
  "Arrays",
  "Strings",
  "Hash Map",
  "Two Pointers",
  "Sliding Window",
  "Binary Search",
  "Sorting",
  "Stack",
  "Queue",
  "Linked List",
  "Trees",
  "Binary Tree",
  "BST",
  "Trie",
  "Heap",
  "Graphs",
  "BFS",
  "DFS",
  "Topological Sort",
  "Union Find",
  "Dynamic Programming",
  "Greedy",
  "Backtracking",
  "Recursion",
  "Bit Manipulation",
  "Math",
  "Matrix",
  "Intervals",
  "Prefix Sum",
  "Divide and Conquer",
  "Segment Tree",
  "Monotonic Stack",
  "System Design",
  "SQL",
  "OOP",
  "Concurrency",
];

interface Props {
  value: DSATopic[];
  onChange: (topics: DSATopic[]) => void;
}

export default function DSATopicsInput({ value, onChange }: Props) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = DSA_TOPICS.filter(
    (t) =>
      t.toLowerCase().includes(input.toLowerCase()) &&
      !value.some((v) => v.topic.toLowerCase() === t.toLowerCase()),
  ).slice(0, 6);

  const showCustomOption =
    !!input.trim() &&
    !suggestions.some((s) => s.toLowerCase() === input.toLowerCase()) &&
    !value.some((v) => v.topic.toLowerCase() === input.toLowerCase());

  const addTopic = (topicName: string) => {
    const clean = topicName.trim();
    if (!clean) return;
    if (value.some((v) => v.topic.toLowerCase() === clean.toLowerCase())) {
      setInput("");
      return;
    }
    const newTopic: DSATopic = { topic: clean, question: "", approach: "" };
    onChange([...value, newTopic]);
    setInput("");
    setHighlighted(0);
    setExpanded(value.length);
  };

  const removeTopic = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
    if (expanded === idx) setExpanded(null);
  };

  const updateField = (
    idx: number,
    field: "question" | "approach",
    val: string,
  ) => {
    onChange(value.map((t, i) => (i === idx ? { ...t, [field]: val } : t)));
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted === suggestions.length && input.trim()) {
        addTopic(input);
      } else if (suggestions[highlighted]) {
        addTopic(suggestions[highlighted]);
      } else if (input.trim()) {
        addTopic(input);
      }
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      removeTopic(value.length - 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const max = showCustomOption
        ? suggestions.length
        : suggestions.length - 1;
      setHighlighted((h) => Math.min(h + 1, max));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === ",") {
      e.preventDefault();
      if (input.trim()) addTopic(input);
    }
  };

  useEffect(() => {
    setHighlighted(0);
  }, [input]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const inputBase =
    "w-full mono text-sm px-3 py-2 rounded outline-none border transition-colors focus:border-[var(--accent)]";
  const cardInputStyle = {
    background: "var(--bg)",
    borderColor: "var(--border)",
    color: "var(--text)",
  };

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Input + chips */}
      <div className="relative">
        <div
          className="w-full px-3 py-2 rounded-lg border flex flex-wrap gap-1.5 items-center min-h-[44px] transition-colors"
          style={{
            background: "var(--bg)",
            borderColor: focused ? "var(--accent)" : "var(--border-strong)",
          }}
        >
          {value.map((item, i) => {
            const isOpen = expanded === i;
            const hasDetails = item.question.trim() || item.approach.trim();
            return (
              <span
                key={i}
                className="mono text-xs inline-flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition-all"
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{
                  background: isOpen ? "var(--accent)" : "var(--accent-bg)",
                  color: isOpen ? "#0A0A0A" : "var(--accent)",
                  border: "0.5px solid rgba(34,197,94,0.35)",
                }}
              >
                <span>{item.topic}</span>
                {hasDetails && !isOpen && (
                  <span style={{ opacity: 0.6 }}>●</span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTopic(i);
                  }}
                  className="transition-opacity hover:opacity-70 text-sm leading-none ml-0.5"
                  aria-label={`Remove ${item.topic}`}
                >
                  ×
                </button>
              </span>
            );
          })}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            placeholder={value.length === 0 ? "type topic + enter..." : ""}
            className="flex-1 min-w-[120px] mono text-sm bg-transparent outline-none"
            style={{ color: "var(--text)" }}
          />
        </div>

        {/* Autocomplete dropdown */}
        {focused && input && (
          <div
            className="absolute left-0 right-0 mt-1 rounded-lg overflow-hidden z-10"
            style={{
              background: "var(--bg-elev)",
              border: "0.5px solid var(--border-strong)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            {suggestions.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => addTopic(s)}
                onMouseEnter={() => setHighlighted(i)}
                className="w-full text-left mono text-sm px-3 py-2 transition-colors flex items-center justify-between"
                style={{
                  background:
                    highlighted === i ? "var(--accent-bg)" : "transparent",
                  color: highlighted === i ? "var(--accent)" : "var(--text)",
                }}
              >
                <span>{s}</span>
                <span
                  className="mono text-[10px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  suggested
                </span>
              </button>
            ))}
            {showCustomOption && (
              <button
                type="button"
                onClick={() => addTopic(input)}
                onMouseEnter={() => setHighlighted(suggestions.length)}
                className="w-full text-left mono text-sm px-3 py-2 transition-colors flex items-center justify-between"
                style={{
                  background:
                    highlighted === suggestions.length
                      ? "var(--accent-bg)"
                      : "transparent",
                  color:
                    highlighted === suggestions.length
                      ? "var(--accent)"
                      : "var(--text)",
                  borderTop:
                    suggestions.length > 0
                      ? "0.5px solid var(--border)"
                      : "none",
                }}
              >
                <span>+ add &quot;{input}&quot;</span>
                <span
                  className="mono text-[10px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  custom
                </span>
              </button>
            )}
          </div>
        )}

        <p
          className="mono text-[10px] mt-1.5"
          style={{ color: "var(--text-muted)" }}
        >
          tip: click a chip to add question + approach · ● means details saved
        </p>
      </div>

      {/* Expanded detail editor for selected chip */}
      {expanded !== null && value[expanded] && (
        <div
          className="rounded-lg p-3 space-y-2"
          style={{
            background: "var(--bg)",
            border: "0.5px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="mono text-xs font-medium"
              style={{ color: "var(--accent)" }}
            >
              // {value[expanded].topic.toLowerCase()}
            </span>
            <div
              className="flex-1 h-[0.5px]"
              style={{ background: "var(--border)" }}
            />
            <button
              type="button"
              onClick={() => setExpanded(null)}
              className="mono text-xs transition-opacity hover:opacity-70"
              style={{ color: "var(--text-dim)" }}
            >
              close
            </button>
          </div>

          <div className="flex items-start gap-2">
            <span
              className="mono text-[10px] uppercase tracking-widest pt-2 shrink-0"
              style={{ color: "var(--text-dim)", minWidth: 24 }}
            >
              Q
            </span>
            <textarea
              value={value[expanded].question}
              onChange={(e) =>
                updateField(expanded, "question", e.target.value)
              }
              placeholder="full question — e.g. given an array of integers, find two numbers that sum to target..."
              rows={2}
              className={inputBase + " resize-y min-h-[50px]"}
              style={cardInputStyle}
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
              value={value[expanded].approach}
              onChange={(e) =>
                updateField(expanded, "approach", e.target.value)
              }
              placeholder="your approach — e.g. used hash map to store seen values, O(n) time..."
              rows={3}
              className={inputBase + " resize-y min-h-[70px]"}
              style={cardInputStyle}
            />
          </div>
        </div>
      )}
    </div>
  );
}
