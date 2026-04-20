"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  const nav = [
    { href: "/dashboard", label: "~/pipeline" },
    { href: "/resumes", label: "~/resumes" },
    { href: "/analytics", label: "~/analytics" },
  ];

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex"
      style={{
        background: "var(--bg)",
        borderTop: "0.5px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {nav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center gap-1 py-3 mono text-xs transition-colors"
            style={{
              color: active ? "var(--accent)" : "var(--text-dim)",
              borderTop: active
                ? "1.5px solid var(--accent)"
                : "1.5px solid transparent",
              marginTop: "-0.5px",
            }}
          >
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
