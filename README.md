# SWE Job Tracker

A full-stack job application tracker built for software engineering graduate applicants. Track every application through the hiring pipeline, log performance data, and get AI-powered coaching to improve over time.

**Live demo:** _coming soon_

## Features

- **Pipeline tracking** — Applied → OA → Interview → Offer → Rejected
- **Performance logging** — OA scores, interview outcomes, DSA topics asked, behavioural questions
- **Strategy tracking** — application source, resume version, cover letter usage
- **Reflection system** — log mistakes and improvements after each round
- **AI Career Coach** — pattern detection and personalised prep advice powered by Claude (coming soon)
- **Analytics dashboard** — conversion rates and application trends (coming soon)
- **Cross-device sync** — data persists via Supabase, works on mobile and desktop
- **Secure auth** — email/password authentication with Row Level Security

## Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Frontend   | Next.js 14, TypeScript, Tailwind CSS |
| Database   | Supabase (PostgreSQL)                |
| Auth       | Supabase Auth                        |
| AI         | Anthropic Claude API                 |
| Deployment | Vercel                               |

## Getting Started

1. Clone the repo

```bash
   git clone https://github.com/muhibmannan/SWE-Job-Tracker.git
   cd SWE-Job-Tracker
```

2. Install dependencies

```bash
   npm install
```

3. Set up environment variables — create a `.env.local` file:

```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
```

4. Run the development server

```bash
   npm run dev
```

## Project Status

Actively in development. Current progress:

- [x] Authentication (login / sign up)
- [x] Application CRUD (add, edit, delete)
- [x] Pipeline filter cards
- [x] Responsive layout (mobile + desktop)
- [ ] AI Career Coach
- [ ] Analytics dashboard
- [ ] Vercel deployment

## Author

Muhib Mannan — Master of Computer Science (Software Engineering), Monash University  
[GitHub](https://github.com/muhibmannan)
