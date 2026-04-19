"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleReset = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else {
      setMessage("password updated → redirecting");
      setTimeout(() => router.push("/dashboard"), 1500);
    }
    setLoading(false);
  };

  const inputStyle = {
    background: "var(--bg)",
    borderColor: "var(--border-strong)",
    color: "var(--text)",
    fontSize: "16px",
    minHeight: "44px",
  };

  const inputClasses =
    "w-full mono px-3.5 rounded-lg outline-none border transition-colors focus:border-[var(--accent)]";

  const Label = ({ children }: { children: string }) => (
    <label
      className="mono text-[10px] uppercase tracking-[0.15em] mb-2 block"
      style={{ color: "var(--text-dim)" }}
    >
      {children}
    </label>
  );

  const strength = (() => {
    if (!password) return null;
    if (password.length < 8) return { label: "too short", color: "var(--red)" };
    if (password.length < 12 || !/[0-9]/.test(password))
      return { label: "weak", color: "var(--amber)" };
    if (!/[A-Z]/.test(password) || !/[^a-zA-Z0-9]/.test(password))
      return { label: "ok", color: "var(--blue)" };
    return { label: "strong", color: "var(--accent)" };
  })();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      <div className="flex justify-end p-5">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-3">
              <div
                className="w-3 h-3"
                style={{ background: "var(--accent)", borderRadius: 3 }}
              />
              <span
                className="mono text-2xl font-medium"
                style={{ color: "var(--text)" }}
              >
                jobtracker<span style={{ color: "var(--accent)" }}>.sh</span>
              </span>
            </div>
            <p className="mono text-sm" style={{ color: "var(--text-dim)" }}>
              // set a new password
            </p>
          </div>

          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-elev)",
              border: "0.5px solid var(--border)",
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{
                borderBottom: "0.5px solid var(--border)",
                background: "var(--bg)",
              }}
            >
              <div className="flex gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: "#FF5F57" }}
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
                className="mono text-xs ml-2"
                style={{ color: "var(--text-dim)" }}
              >
                reset-password.sh — zsh
              </span>
            </div>

            <div className="p-6">
              <div className="space-y-5 mb-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>new password</Label>
                    {strength && (
                      <span
                        className="mono text-[10px] uppercase tracking-[0.12em]"
                        style={{ color: strength.color }}
                      >
                        {strength.label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleReset()}
                      placeholder="••••••••"
                      autoFocus
                      autoComplete="new-password"
                      className={inputClasses + " pr-14"}
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded transition-opacity hover:opacity-70"
                      style={{ color: "var(--text-dim)" }}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "hide" : "show"}
                    </button>
                  </div>
                </div>
                <div>
                  <Label>confirm password</Label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleReset()}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={inputClasses}
                    style={inputStyle}
                  />
                </div>
              </div>

              {error && (
                <div
                  className="mono text-xs px-3 py-2.5 rounded-lg mb-4 flex items-start gap-2 break-words"
                  style={{
                    background: "rgba(248,113,113,0.08)",
                    border: "0.5px solid rgba(248,113,113,0.25)",
                  }}
                >
                  <span style={{ color: "var(--red)" }}>!</span>
                  <span
                    className="break-words min-w-0"
                    style={{ color: "var(--red)" }}
                  >
                    {error.toLowerCase()}
                  </span>
                </div>
              )}
              {message && (
                <div
                  className="mono text-xs px-3 py-2.5 rounded-lg mb-4 flex items-start gap-2 break-words"
                  style={{
                    background: "var(--accent-bg)",
                    border: "0.5px solid rgba(34,197,94,0.25)",
                  }}
                >
                  <span style={{ color: "var(--accent)" }}>✓</span>
                  <span
                    className="break-words min-w-0"
                    style={{ color: "var(--accent)" }}
                  >
                    {message}
                  </span>
                </div>
              )}

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full mono text-sm font-medium rounded-lg transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "var(--accent)",
                  color: "#0A0A0A",
                  opacity: loading ? 0.5 : 1,
                  minHeight: "48px",
                }}
              >
                {loading ? "$ updating..." : "$ update-password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
