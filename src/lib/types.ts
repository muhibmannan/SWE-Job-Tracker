export type AppStatus = "Applied" | "OA" | "Interview" | "Offer" | "Rejected";

export interface Application {
  id: string;
  user_id: string;
  company: string;
  role: string;
  date_applied: string | null;
  deadline: string | null;
  status: AppStatus;
  source: string | null;
  resume_version: string | null;
  cover_letter: boolean;
  oa_score: string | null;
  interview_outcome: string | null;
  dsa_topics: string | null;
  behavioural_questions: string | null;
  mistakes: string | null;
  improvements: string | null;
  created_at: string;
  updated_at: string;
}

export type NewApplication = Omit<
  Application,
  "id" | "user_id" | "created_at" | "updated_at"
>;
