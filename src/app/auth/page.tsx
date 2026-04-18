"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

type Mode = "login" | "signup" | "forgot";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const reset = () => {
    setError("");
    setMessage("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    reset();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else router.push("/dashboard");
    } else if (mode === "signup") {
      if (!firstName.trim()) {
        setError("First name is required");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setError(error.message);
      else {
        if (data.user) {
          await supabase.from("profiles").insert({
            id: data.user.id,
            first_name: firstName,
          });
        }
        setMessage("check your email for a confirmation link");
      }
    } else if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) setError(error.message);
      else setMessage("password reset link sent to your email");
    }

    setLoading(false);
  };

  const inputStyle = {
    background: "var(--bg)",
    borderColor: "var(--border-strong)",
    color: "var(--text)",
  };

  const Label = ({ children }: { children: string }) => (
    <label
      className="mono text-[10px] uppercase tracking-[0.15em] mb-2 block"
      style={{ color: "var(--text-dim)" }}
    >
      {children}
    </label>
  );

  const buttonText = {
    login: email ? `$ login --email ${email}` : "$ login",
    signup: "$ signup --create-account",
    forgot: "$ send-reset-link",
  }[mode];

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
          {/* Brand */}
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
              // track every application. land the role.
            </p>
          </div>

          {/* Terminal card */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-elev)",
              border: "0.5px solid var(--border)",
            }}
          >
            {/* Terminal chrome */}
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
                auth.sh — zsh
              </span>
            </div>

            <div className="p-6">
              {/* Tabs — only show login/signup */}
              {mode !== "forgot" && (
                <div
                  className="flex mb-6"
                  style={{ borderBottom: "0.5px solid var(--border)" }}
                >
                  {[
                    { key: "login" as Mode, label: "login" },
                    { key: "signup" as Mode, label: "signup" },
                  ].map((tab) => {
                    const active = mode === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => {
                          setMode(tab.key);
                          reset();
                        }}
                        className="flex-1 mono text-sm py-3 relative transition-colors"
                        style={{
                          color: active ? "var(--text)" : "var(--text-dim)",
                        }}
                      >
                        ~/{tab.label}
                        {active && (
                          <div
                            className="absolute bottom-[-0.5px] left-0 right-0 h-[2px]"
                            style={{ background: "var(--accent)" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Forgot password header */}
              {mode === "forgot" && (
                <div
                  className="mb-6 pb-4"
                  style={{ borderBottom: "0.5px solid var(--border)" }}
                >
                  <button
                    onClick={() => {
                      setMode("login");
                      reset();
                    }}
                    className="mono text-xs transition-opacity hover:opacity-70 mb-2 flex items-center gap-1"
                    style={{ color: "var(--text-dim)" }}
                  >
                    ← back to login
                  </button>
                  <p className="mono text-sm" style={{ color: "var(--text)" }}>
                    ~/reset-password
                  </p>
                  <p
                    className="mono text-xs mt-2"
                    style={{ color: "var(--text-dim)" }}
                  >
                    // enter your email to receive a reset link
                  </p>
                </div>
              )}

              {/* Fields */}
              <div className="space-y-5 mb-5">
                {mode === "signup" && (
                  <div>
                    <Label>first name</Label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="muhib"
                      autoFocus
                      className="w-full mono text-sm px-3.5 py-3 rounded-lg outline-none border transition-colors focus:border-[var(--accent)]"
                      style={inputStyle}
                    />
                  </div>
                )}

                <div>
                  <Label>email</Label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="you@example.com"
                    autoFocus={mode !== "signup"}
                    className="w-full mono text-sm px-3.5 py-3 rounded-lg outline-none border transition-colors focus:border-[var(--accent)]"
                    style={inputStyle}
                  />
                </div>

                {mode !== "forgot" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>password</Label>
                      {mode === "login" && (
                        <button
                          onClick={() => {
                            setMode("forgot");
                            reset();
                          }}
                          className="mono text-[10px] uppercase tracking-[0.12em] transition-opacity hover:opacity-70"
                          style={{ color: "var(--accent)" }}
                        >
                          forgot?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="••••••••"
                      className="w-full mono text-sm px-3.5 py-3 rounded-lg outline-none border transition-colors focus:border-[var(--accent)]"
                      style={inputStyle}
                    />
                  </div>
                )}
              </div>

              {/* Error / Message */}
              {error && (
                <div
                  className="mono text-xs px-3 py-2.5 rounded-lg mb-4 flex items-start gap-2"
                  style={{
                    background: "rgba(248,113,113,0.08)",
                    border: "0.5px solid rgba(248,113,113,0.25)",
                  }}
                >
                  <span style={{ color: "var(--red)" }}>!</span>
                  <span style={{ color: "var(--red)" }}>
                    {error.toLowerCase()}
                  </span>
                </div>
              )}
              {message && (
                <div
                  className="mono text-xs px-3 py-2.5 rounded-lg mb-4 flex items-start gap-2"
                  style={{
                    background: "var(--accent-bg)",
                    border: "0.5px solid rgba(34,197,94,0.25)",
                  }}
                >
                  <span style={{ color: "var(--accent)" }}>✓</span>
                  <span style={{ color: "var(--accent)" }}>{message}</span>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mono text-sm font-medium py-3 rounded-lg transition-all hover:opacity-90 active:scale-[0.98] truncate"
                style={{
                  background: "var(--accent)",
                  color: "#0A0A0A",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {loading ? "$ processing..." : buttonText}
              </button>
            </div>
          </div>

          <p
            className="mono text-xs text-center mt-6"
            style={{ color: "var(--text-muted)" }}
          >
            // built by a dev, for devs
          </p>
        </div>
      </div>
    </div>
  );
}
