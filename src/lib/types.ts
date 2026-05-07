export type AppStatus = "Applied" | "OA" | "Interview" | "Offer" | "Rejected";

export interface BehaviouralQuestion {
  question: string;
  answer: string;
}

export interface DSATopic {
  topic: string;
  question: string;
  approach: string;
}

export interface Application {
  id: string;
  user_id: string;
  company: string;
  role: string;
  date_applied: string | null;
  deadline: string | null;
  status: AppStatus;
  source: string | null;
  resume_id: string | null;
  cover_letter: boolean;
  oa_score: string | null;
  interview_outcome: string | null;
  dsa_topics: DSATopic[];
  behavioural_questions: BehaviouralQuestion[];
  mistakes: string | null;
  improvements: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScrapedJob {
     id: number;
     title: string;
     company: string;
     location: string | null;
     url: string;
     description: string;
     posted_date: string;
     source: string;
     scraped_at: string; // ISO-8601 UTC
   }

export type Resume = {
  id: string;
  user_id: string;
  label: string;
  file_path: string;
  filename: string;
  file_size: number | null;
  created_at: string;
};

export type NewApplication = Omit<
  Application,
  "id" | "user_id" | "created_at" | "updated_at"
>;
