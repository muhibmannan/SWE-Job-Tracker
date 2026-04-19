"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({
  email,
  firstName,
}: {
  email: string;
  firstName?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const nav = [
    { href: "/dashboard", label: "~/pipeline" },
    { href: "/resumes", label: "~/resumes" },
    { href: "/analytics", label: "~/analytics" },
  ];

  return (
    <header
      className="px-4 sm:px-6 py-5 flex items-center justify-between border-b"
      style={{ borderColor: "var(--border)" }}
    >
      <Link href="/dashboard" className="flex items-center gap-3">
        <div
          className="w-3 h-3"
          style={{ background: "var(--accent)", borderRadius: 3 }}
        />
        <span
          className="mono text-xl font-medium"
          style={{ color: "var(--text)" }}
        >
          {firstName ? firstName.toLowerCase() : "jobtracker"}
          <span style={{ color: "var(--accent)" }}>.sh</span>
        </span>
      </Link>

      <nav className="hidden sm:flex items-center gap-7">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="mono text-sm transition-colors hover:opacity-70"
            style={{
              color: pathname === item.href ? "var(--text)" : "var(--text-dim)",
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3 sm:gap-4">
        <ThemeToggle />
        <div
          className="w-[0.5px] h-4 hidden sm:block"
          style={{ background: "var(--border)" }}
        />
        <button
          onClick={signOut}
          className="mono text-sm flex items-center gap-1.5 transition-opacity hover:opacity-70"
          style={{ color: "var(--text-dim)" }}
          title="Sign out"
        >
          <span>$</span>
          <span>logout</span>
        </button>
      </div>
    </header>
  );
}
