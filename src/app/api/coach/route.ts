import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { question, applications } = await request.json();

    const appSummary =
      applications.length === 0
        ? "No applications logged yet."
        : applications
            .map(
              (a: any, i: number) => `
${i + 1}. ${a.company} — ${a.role}
   Status: ${a.status}
   Source: ${a.source || "N/A"} | Resume: ${a.resume_version || "N/A"} | Cover Letter: ${a.cover_letter ? "Yes" : "No"}
   OA Score: ${a.oa_score || "N/A"} | Interview Outcome: ${a.interview_outcome || "N/A"}
   DSA Topics: ${a.dsa_topics || "N/A"}
   Behavioural Questions: ${a.behavioural_questions || "N/A"}
   Mistakes: ${a.mistakes || "N/A"}
   Improvements: ${a.improvements || "N/A"}
`,
            )
            .join("\n");

    const systemPrompt = `You are an expert AI Career Coach specialising in software engineering graduate recruitment in Australia. You have deep knowledge of Australian tech companies (Atlassian, Canva, Afterpay, REA Group, Seek, Xero, etc.), graduate SWE hiring pipelines (OA formats, technical interviews, behavioural rounds), LeetCode/DSA patterns commonly tested in grad interviews, and resume/application strategy for competitive grad markets.

You are analysing the job application data of a Master of Computer Science (Software Engineering) student at Monash University who is actively applying for graduate roles in Sydney.

Here is their current application data:
${appSummary}

Be specific, actionable, and encouraging. Reference their actual data when giving advice. Keep responses concise and well-structured using markdown.`;

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      max_tokens: 1024,
    });

    const text = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error("AI Coach Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
