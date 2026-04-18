import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
   DSA Topics: ${
     Array.isArray(a.dsa_topics) && a.dsa_topics.length
       ? "\n" +
         a.dsa_topics
           .map(
             (d: any) =>
               `     - ${d.topic}${d.question ? `\n       Q: ${d.question}` : ""}${d.approach ? `\n       Approach: ${d.approach}` : ""}`,
           )
           .join("\n")
       : "N/A"
   }
   Behavioural Questions:${
     Array.isArray(a.behavioural_questions) && a.behavioural_questions.length
       ? "\n" +
         a.behavioural_questions
           .map(
             (q: any) =>
               `     - Q: ${q.question}\n       A: ${q.answer || "(no answer recorded)"}`,
           )
           .join("\n")
       : " N/A"
   }
   Mistakes: ${a.mistakes || "N/A"}
   Improvements: ${a.improvements || "N/A"}
`,
            )
            .join("\n");

    const systemPrompt = `You are an expert AI Career Coach specialising in software engineering graduate recruitment in Australia. You have deep knowledge of Australian tech companies (Atlassian, Canva, Afterpay, REA Group, Seek, Xero, etc.), graduate SWE hiring pipelines, DSA patterns tested in grad interviews, and resume/application strategy for competitive grad markets.

You are analysing the job application data of a Master of Computer Science (Software Engineering) student at Monash University who is actively applying for graduate roles in Sydney.

Here is their current application data:
${appSummary}

Be specific, actionable, and encouraging. Reference their actual data when giving advice. Keep responses concise and well-structured using markdown.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
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
