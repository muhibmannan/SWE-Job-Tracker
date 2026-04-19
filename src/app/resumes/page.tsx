import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResumesClient from "./ResumesClient";

export default async function ResumesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [{ data: resumes }, { data: profile }] = await Promise.all([
    supabase
      .from("resumes")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("first_name").eq("id", user.id).single(),
  ]);

  return (
    <ResumesClient
      user={user}
      initialResumes={resumes ?? []}
      firstName={profile?.first_name ?? null}
    />
  );
}
