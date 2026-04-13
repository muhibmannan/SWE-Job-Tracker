"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Navbar({ email }: { email: string }) {
  const router = useRouter();
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <header
      className="border-b px-4 sm:px-6 py-3 flex items-center justify-between"
      style={{ borderColor: "#21262d", background: "#0d1117" }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full bg-green-400"
          style={{ boxShadow: "0 0 8px #4ade80" }}
        />
        <span className="font-bold text-white text-sm sm:text-base tracking-tight">
          SWE Job Tracker
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs hidden sm:block" style={{ color: "#8b949e" }}>
          {email}
        </span>
        <button
          onClick={signOut}
          className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
          style={{ borderColor: "#30363d", color: "#8b949e" }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
