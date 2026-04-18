import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [{ data: applications }, { data: profile }] = await Promise.all([
    supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("first_name").eq("id", user.id).single(),
  ]);

  return (
    <DashboardClient
      user={user}
      initialApps={applications ?? []}
      firstName={profile?.first_name ?? null}
    />
  );
}
