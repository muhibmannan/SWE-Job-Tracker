import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .order("date_applied", { ascending: true });

  return <AnalyticsClient user={user} applications={applications ?? []} />;
}
