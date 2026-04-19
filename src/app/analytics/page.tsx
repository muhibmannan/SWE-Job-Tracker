import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [{ data: applications }, { data: profile }] = await Promise.all([
    supabase
      .from("applications")
      .select("*")
      .order("date_applied", { ascending: true }),
    supabase.from("profiles").select("first_name").eq("id", user.id).single(),
  ]);

  return (
    <AnalyticsClient
      user={user}
      applications={applications ?? []}
      firstName={profile?.first_name ?? null}
    />
  );
}
