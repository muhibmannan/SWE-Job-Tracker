"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  jobTitle: string;
  jobCompany: string;
  userId: string | null;
  initialIsSaved: boolean;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export default function SaveButton({
  jobTitle,
  jobCompany,
  userId,
  initialIsSaved,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [state, setState] = useState<SaveState>(
    initialIsSaved ? "saved" : "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Logged-out: render a link that sends them to /auth.
  if (!userId) {
    return (
      <a
        href="/auth"
        onClick={(e) => e.stopPropagation()}
        className="mono text-xs px-2 py-1 rounded transition-opacity hover:opacity-70 whitespace-nowrap"
        style={{ color: "var(--text-dim)" }}
        title="Log in to save this job to your pipeline"
      >
        $ log in to save
      </a>
    );
  }

  // Saved or already-saved: passive label.
  if (state === "saved") {
    return (
      <span
        className="mono text-xs px-2 py-1 whitespace-nowrap"
        style={{ color: "var(--text-dim)" }}
        title="Already in your pipeline"
      >
        $ saved ✓
      </span>
    );
  }

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    setState("saving");
    setErrorMsg(null);

    const supabase = createClient();
    const { error } = await supabase.from("applications").insert({
      user_id: userId,
      role: jobTitle,
      company: jobCompany,
      status: "Saved",
      cover_letter: false,
      dsa_topics: [],
      behavioural_questions: [],
    });

    if (error) {
      // Postgres unique violation = "already saved by us". Treat as saved.
      if (error.code === "23505") {
        setState("saved");
        return;
      }
      setState("error");
      setErrorMsg(error.message);
      return;
    }

    setState("saved");
    // Revalidate /browse so saved-state matches DB on next navigation.
    startTransition(() => router.refresh());
  }

  if (state === "error") {
    return (
      <button
        type="button"
        onClick={handleSave}
        className="mono text-xs px-2 py-1 rounded transition-opacity hover:opacity-70 whitespace-nowrap"
        style={{ color: "var(--red)" }}
        title={errorMsg ?? "Failed to save — click to retry"}
      >
        $ retry
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={state === "saving"}
      className="mono text-xs px-2 py-1 rounded transition-opacity hover:opacity-70 whitespace-nowrap disabled:opacity-50"
      style={{ color: "var(--accent)" }}
      title="Save this job to your pipeline"
    >
      {state === "saving" ? "$ saving..." : "$ save"}
    </button>
  );
}
