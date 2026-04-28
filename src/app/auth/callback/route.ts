import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorDescription = searchParams.get("error_description");

  // If Supabase passed an error (expired link, etc.), redirect to auth with the error
  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(errorDescription)}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Fallback — send back to auth page
  return NextResponse.redirect(`${origin}/auth?error=could_not_authenticate`);
}