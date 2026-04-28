import { NewApplication } from "./types";

export const DEMO_RESUMES = [
  {
    label: "v1 — default",
    filename: "resume-default.pdf",
    publicPath: "/demo/resume-default.pdf",
  },
  {
    label: "v2 — tailored for fintech",
    filename: "resume-tailored.pdf",
    publicPath: "/demo/resume-tailored.pdf",
  },
];

// Helper: returns a date N days ago in YYYY-MM-DD format
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export function getDemoApplications(): Array <
  Omit<NewApplication, "resume_id"> & { useResumeIndex: number | null }
> {
  return [
    {
      company: "Atlassian",
      role: "Graduate Software Engineer",
      date_applied: daysAgo(45),
      deadline: null,
      status: "Offer",
      source: "Company Site",
      cover_letter: true,
      oa_score: "92% / pass",
      interview_outcome: "pass — strong communication, clear thought process",
      dsa_topics: [
        {
          topic: "Arrays / Lists",
          question: "Find the longest substring without repeating characters",
          approach: "Sliding window with hash set, O(n) time, O(k) space",
        },
        {
          topic: "Trees",
          question: "Validate a binary search tree",
          approach: "In-order traversal, check sorted",
        },
      ],
      behavioural_questions: [
        {
          question: "Tell me about a time you had a conflict with a teammate.",
          answer:
            "Context: During a group project at Monash, a teammate kept missing deadlines. Action: I scheduled a 1:1 to understand what was blocking them — turned out they were overloaded with another unit. Result: We re-split the work based on capacity. Evidence: We submitted on time and scored an HD.",
        },
      ],
      mistakes: null,
      improvements: null,
      useResumeIndex: 1,
    },
    {
      company: "Canva",
      role: "Junior Software Engineer",
      date_applied: daysAgo(38),
      deadline: null,
      status: "Interview",
      source: "LinkedIn",
      cover_letter: true,
      oa_score: "85% / pass",
      interview_outcome: null,
      dsa_topics: [
        {
          topic: "Graphs",
          question: "Number of islands",
          approach: "DFS with visited set, O(m*n)",
        },
      ],
      behavioural_questions: [
        {
          question: "Why Canva?",
          answer:
            "Strong design culture, products I actually use daily, and clear emphasis on craftsmanship in their engineering blog posts.",
        },
      ],
      mistakes: null,
      improvements: null,
      useResumeIndex: 0,
    },
    {
      company: "Macquarie Bank",
      role: "Technology Graduate",
      date_applied: daysAgo(30),
      deadline: null,
      status: "Interview",
      source: "GradConnection",
      cover_letter: false,
      oa_score: "Pass",
      interview_outcome: null,
      dsa_topics: [
        {
          topic: "Strings",
          question: "Anagram check",
          approach: "Count frequencies with hash map",
        },
        {
          topic: "Hash Maps",
          question: "Two sum",
          approach: "Single pass, complement lookup",
        },
      ],
      behavioural_questions: [
        {
          question: "Why finance?",
          answer:
            "Genuinely interested in how systems handle high-volume real-time data. Macquarie's tech team works on infrastructure that handles billions in daily transactions, which is rare for a grad to touch.",
        },
      ],
      mistakes: null,
      improvements: null,
      useResumeIndex: 1,
    },
    {
      company: "Telstra",
      role: "Software Engineering Graduate",
      date_applied: daysAgo(28),
      deadline: null,
      status: "OA",
      source: "GradAustralia",
      cover_letter: false,
      oa_score: null,
      interview_outcome: null,
      dsa_topics: [],
      behavioural_questions: [],
      mistakes: null,
      improvements: null,
      useResumeIndex: 0,
    },
    {
      company: "Commonwealth Bank",
      role: "Graduate Software Engineer",
      date_applied: daysAgo(25),
      deadline: null,
      status: "OA",
      source: "Seek",
      cover_letter: true,
      oa_score: null,
      interview_outcome: null,
      dsa_topics: [],
      behavioural_questions: [],
      mistakes: null,
      improvements: null,
      useResumeIndex: 1,
    },
    {
      company: "Google",
      role: "Software Engineer, University Graduate",
      date_applied: daysAgo(60),
      deadline: null,
      status: "Rejected",
      source: "Company Site",
      cover_letter: false,
      oa_score: "Did not advance",
      interview_outcome: null,
      dsa_topics: [],
      behavioural_questions: [],
      mistakes:
        "Applied late — postings filled by the time I submitted. Didn't tailor my CV.",
      improvements:
        "Set up alerts for next year. Build a tailored Google-specific CV emphasising systems work.",
      useResumeIndex: 0,
    },
    {
      company: "WiseTech Global",
      role: "Software Developer Graduate",
      date_applied: daysAgo(50),
      deadline: null,
      status: "Rejected",
      source: "LinkedIn",
      cover_letter: true,
      oa_score: "62% / fail",
      interview_outcome: null,
      dsa_topics: [
        {
          topic: "Dynamic Programming",
          question: "Longest increasing subsequence",
          approach: "Tried O(n^2) DP, ran out of time on optimisation",
        },
      ],
      behavioural_questions: [],
      mistakes:
        "Spent too long on the DP question without falling back to brute force first. Didn't budget time across all 4 questions.",
      improvements:
        "Practise time-boxing — 25 mins per question max, brute force first, optimise after.",
      useResumeIndex: 0,
    },
    {
      company: "Optiver",
      role: "Software Engineer Intern",
      date_applied: daysAgo(20),
      deadline: null,
      status: "Applied",
      source: "Company Site",
      cover_letter: true,
      oa_score: null,
      interview_outcome: null,
      dsa_topics: [],
      behavioural_questions: [],
      mistakes: null,
      improvements: null,
      useResumeIndex: 1,
    },
    {
      company: "REA Group",
      role: "Graduate Engineer",
      date_applied: daysAgo(15),
      deadline: null,
      status: "Applied",
      source: "GradConnection",
      cover_letter: false,
      oa_score: null,
      interview_outcome: null,
      dsa_topics: [],
      behavioural_questions: [],
      mistakes: null,
      improvements: null,
      useResumeIndex: 0,
    },
    {
      company: "Xero",
      role: "Software Engineer Graduate",
      date_applied: daysAgo(10),
      deadline: null,
      status: "Applied",
      source: "Seek",
      cover_letter: true,
      oa_score: null,
      interview_outcome: null,
      dsa_topics: [],
      behavioural_questions: [],
      mistakes: null,
      improvements: null,
      useResumeIndex: 0,
    },
  ];
}