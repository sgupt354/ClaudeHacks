# Civilian

**Civilian** is an AI-powered civic engagement platform that helps residents report local government issues, get connected to the right officials, and build community around shared problems.

Live: [https://civic-app-nine.vercel.app](https://civic-app-nine.vercel.app)  
GitHub: [https://github.com/ARasugit20/ClaudeHacks](https://github.com/ARasugit20/ClaudeHacks)

---

## The Problem

Most people notice broken streetlights, dangerous potholes, or unsafe crosswalks — but never report them. The barriers are real: they don't know who to contact, how to write a formal complaint, or whether anyone else cares. Issues go unresolved for months.

## What Civilian Does

1. You describe your problem in plain language (any language)
2. AI finds the real responsible official, writes a formal letter citing actual city ordinances, and identifies the issue type
3. Your complaint is posted to a community feed where neighbors can echo it, building collective pressure
4. You can track similar issues, see what's been resolved, and connect with others facing the same problem

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (Pages Router) |
| Frontend | React 19, Tailwind CSS 4 |
| AI | Anthropic Claude (`claude-sonnet-4-6` for analysis, `claude-haiku-4-5` for moderation/translation) |
| Database | InsForge (Postgres-backed BaaS) |
| Maps | Mapbox GL + react-map-gl, Leaflet |
| Email | Resend |
| 3D / Animation | Three.js, @react-three/fiber, Framer Motion |
| PDF Export | jsPDF |
| Deployment | Vercel |

---

## Key Features

- **AI Complaint Analysis** — Claude searches the web for real government contacts, cites city ordinances, and writes a formal letter on your behalf
- **AI Moderation** — Intent-based content moderation using Claude Haiku; blocks inappropriate messages before they reach officials
- **AI Translation** — Write in any of 70+ languages; complaints are translated automatically
- **Community Feed** — Forum where residents see, echo, and discuss local issues
- **Interactive Map** — All reported issues plotted on a Mapbox map by location
- **Issue Reels** — Short-form vertical scroll of recent community issues
- **Search** — Full-text search across all reported issues
- **Similar Issues** — After submitting, see if neighbors have reported the same problem
- **Email to Officials** — Formal complaint emails sent directly via Resend
- **Profile & Tracking** — Track issues you've raised or echoed

---

## API Routes

| Route | Purpose |
|---|---|
| `POST /api/analyze` | Claude analyzes complaint, finds official, writes formal letter |
| `POST /api/moderate` | Claude Haiku checks if message is appropriate to send to officials |
| `POST /api/translate` | Claude Haiku translates complaint to English |
| `GET/POST /api/posts` | Fetch all posts or create a new one |
| `GET /api/search` | Full-text search across posts |
| `GET /api/similar` | Find posts with matching issue type and location |
| `POST /api/echo` | Echo (upvote) a post |
| `GET/POST /api/comments` | Fetch or add comments on a post |
| `POST /api/send-email` | Send formal complaint email to official via Resend |
| `POST /api/resolve` | Mark an issue as resolved |
| `GET /api/contact` | Lookup official contact info |

---

## Local Setup

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)
- An [InsForge](https://insforge.app) project (for the database)
- A [Resend](https://resend.com) API key (for email)
- A [Mapbox](https://mapbox.com) token (for the map)

### Install & Run

```bash
git clone https://github.com/ARasugit20/ClaudeHacks.git
cd ClaudeHacks/civic-app
npm install
```

Create a `.env.local` file:

```env
ANTHROPIC_API_KEY=your_anthropic_key
INSFORGE_URL=https://your-project.insforge.app
INSFORGE_ANON_KEY=your_insforge_anon_key
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database

The app uses InsForge (Postgres). The `posts` table schema:

```sql
create table posts (
  id uuid primary key default gen_random_uuid(),
  complaint text,
  formal_request text,
  department text,
  official_name text,
  official_email text,
  issue_type text,
  location text,
  urgency_score int,
  echo_count int default 0,
  resolved boolean default false,
  created_at timestamptz default now()
);
```

Seed demo data:

```bash
node scripts/seed.js
```

---

## Project Structure

```
civic-app/
├── pages/
│   ├── index.js          # Landing page
│   ├── compose.js        # Raise an issue (main flow)
│   ├── forum.js          # Community feed
│   ├── map.js            # Issues map
│   ├── search.js         # Search issues
│   ├── reels.js          # Issue reels
│   ├── profile.js        # User profile & tracked issues
│   ├── post/[id].js      # Single issue page
│   ├── similar.js        # Similar issues after submit
│   └── api/              # All API routes
├── components/
│   ├── Nav.js            # Navigation
│   └── Toast.js          # Toast notifications
├── lib/
│   └── insforge.js       # InsForge client
└── styles/
    └── globals.css
```

---

## Built for ClaudeHacks

Civilian was built for the ClaudeHacks hackathon. The core thesis: AI should lower the barrier for civic participation, not just automate tasks. Every resident deserves to have their voice heard by the right person, in the right format, with community backing.
