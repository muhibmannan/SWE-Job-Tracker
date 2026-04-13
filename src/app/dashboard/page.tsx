import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center gap-2 justify-center mb-2">
          <div
            className="w-2 h-2 rounded-full bg-green-400"
            style={{ boxShadow: "0 0 10px #4ade80" }}
          />
          <h1 className="text-white font-bold text-2xl">SWE Job Tracker</h1>
        </div>
        <p style={{ color: "#8b949e" }}>Logged in as {user.email}</p>
        <p className="mt-4 text-sm" style={{ color: "#8b949e" }}>
          Dashboard coming in Step 5 ⚡
        </p>
      </div>
    </div>
  );
}
