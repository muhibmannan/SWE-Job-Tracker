"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const t = (localStorage.getItem("theme") as "dark" | "light") || "dark";
    setTheme(t);
    document.documentElement.dataset.theme = t;
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  };

  return (
    <button
      onClick={toggle}
      className="mono text-xs px-2 py-1 rounded transition-colors hover:opacity-70"
      style={{ color: "var(--text-dim)" }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "☾" : "☀"}
    </button>
  );
}
