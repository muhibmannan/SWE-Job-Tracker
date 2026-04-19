import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResumesClient from "./ResumesClient";

export default async function ResumesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [{ data: resumes }, { data: profile }, { data: applications }] =
    await Promise.all([
      supabase
        .from("resumes")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("first_name").eq("id", user.id).single(),
      supabase.from("applications").select("id, resume_id"),
    ]);

  // Count how many applications use each resume
  const usageCount: Record<string, number> = {};
  (applications ?? []).forEach((app) => {
    if (app.resume_id) {
      usageCount[app.resume_id] = (usageCount[app.resume_id] ?? 0) + 1;
    }
  });

  return (
    <ResumesClient
      user={user}
      initialResumes={resumes ?? []}
      firstName={profile?.first_name ?? null}
      usageCount={usageCount}
    />
  );
}
