import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_RESUMES, getDemoApplications } from "@/lib/demoData";

export async function POST() {
  const supabase = await createClient();

  // Verify user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Check the user has zero applications
  const { count: appCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true });

  if ((appCount ?? 0) > 0) {
    return NextResponse.json(
      { error: "Demo data can only be loaded for empty accounts" },
      { status: 400 },
    );
  }

  // Upload demo resumes by fetching them from /public/demo
  const insertedResumeIds: string[] = [];

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";
  const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`;

  for (const resume of DEMO_RESUMES) {
    try {
      // Fetch the demo PDF from the public folder
      const fileResponse = await fetch(`${baseUrl}${resume.publicPath}`);
      if (!fileResponse.ok) {
        console.error(`Could not fetch ${resume.publicPath}`);
        continue;
      }
      const blob = await fileResponse.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const fileBuffer = new Uint8Array(arrayBuffer);

      // Upload to Supabase Storage
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.pdf`;
      const path = `${user.id}/${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(path, fileBuffer, {
          contentType: "application/pdf",
        });

      if (uploadError) {
        console.error("Upload failed:", uploadError);
        continue;
      }

      // Insert resume record
      const { data: inserted, error: insertError } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          label: resume.label,
          file_path: path,
          filename: resume.filename,
          file_size: fileBuffer.length,
        })
        .select()
        .single();

      if (insertError || !inserted) {
        console.error("Insert failed:", insertError);
        await supabase.storage.from("resumes").remove([path]);
        continue;
      }

      insertedResumeIds.push(inserted.id);
    } catch (err) {
      console.error("Demo resume error:", err);
    }
  }

  // Insert demo applications, linking to resumes by index
  const apps = getDemoApplications().map((app) => {
    const { useResumeIndex, ...rest } = app;
    const resume_id =
      useResumeIndex !== null && insertedResumeIds[useResumeIndex]
        ? insertedResumeIds[useResumeIndex]
        : null;
    return {
      ...rest,
      resume_id,
      user_id: user.id,
    };
  });

  const { error: appError } = await supabase.from("applications").insert(apps);

  if (appError) {
    return NextResponse.json(
      { error: "Failed to insert applications", details: appError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    appsInserted: apps.length,
    resumesInserted: insertedResumeIds.length,
  });
}