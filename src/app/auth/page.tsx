"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else router.push("/dashboard");
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Check your email for a confirmation link!");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #010409 0%, #0d1117 100%)",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div
              className="w-2 h-2 rounded-full bg-green-400"
              style={{ boxShadow: "0 0 10px #4ade80" }}
            />
            <span className="text-white font-bold text-xl tracking-tight">
              SWE Job Tracker
            </span>
          </div>
          <p className="text-sm" style={{ color: "#8b949e" }}>
            Track every application. Land the role.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-6 border"
          style={{ background: "#161b22", borderColor: "#30363d" }}
        >
          {/* Toggle */}
          <div
            className="flex rounded-lg p-1 mb-6"
            style={{ background: "#0d1117" }}
          >
            {["Login", "Sign Up"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setIsLogin(tab === "Login");
                  setError("");
                  setMessage("");
                }}
                className="flex-1 py-2 rounded-md text-sm font-semibold transition-all"
                style={{
                  background: (isLogin ? tab === "Login" : tab === "Sign Up")
                    ? "#21262d"
                    : "transparent",
                  color: (isLogin ? tab === "Login" : tab === "Sign Up")
                    ? "#f0f6fc"
                    : "#8b949e",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="space-y-3 mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-colors"
              style={{
                background: "#0d1117",
                borderColor: "#30363d",
                color: "#e6edf3",
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none border transition-colors"
              style={{
                background: "#0d1117",
                borderColor: "#30363d",
                color: "#e6edf3",
              }}
            />
          </div>

          {/* Error / Message */}
          {error && (
            <div
              className="mb-3 px-3 py-2 rounded-lg text-xs"
              style={{ background: "#2d1515", color: "#f87171" }}
            >
              {error}
            </div>
          )}
          {message && (
            <div
              className="mb-3 px-3 py-2 rounded-lg text-xs"
              style={{ background: "#1a2e1a", color: "#4ade80" }}
            >
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-bold transition-opacity"
            style={{
              background: "#238636",
              color: "#fff",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Sign In"
                : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
