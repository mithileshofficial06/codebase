<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-000?logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4-000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_AI-4285F4?logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/D3.js-F9A03C?logo=d3dotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Turborepo-EF4444?logo=turborepo&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-A78BFA" />
</p>

<br />

<h1 align="center">
  CodeMap
</h1>

<p align="center">
  <strong>See the architecture of any codebase — instantly.</strong>
</p>

<p align="center">
  Paste a GitHub URL. Get an interactive dependency graph, semantic architecture clusters,<br />
  codebase health scoring, AI-powered chat, and execution flow detection — in seconds.<br />
  No install. No signup. No config.
</p>

<br />

<p align="center">
  <a href="#-features">Features</a> ·
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-deployment">Deployment</a> ·
  <a href="#-contributing">Contributing</a>
</p>

---

## What is CodeMap?

Every developer has joined a new codebase and spent days — sometimes weeks — just understanding how it fits together. README files are outdated. Folder structures are misleading. Grep-ing through files is slow.

**CodeMap solves this in under 10 seconds.**

Paste any public GitHub repository URL. CodeMap fetches the real code, parses every import and export using static analysis, builds a live interactive dependency graph, calculates a health score from five architectural signals, detects execution flows automatically, and gives you an AI assistant that knows your actual codebase — not generic advice.

---

## ✨ Features

### 🗺 Interactive Dependency Graph
Every file is a node. Every import is an edge. Force-directed D3 layout clusters related files naturally. Nodes are color-coded by risk:
- 🔵 **Core** — high dependency count, foundational files
- 🔴 **Hotspot** — changed frequently, bug-prone, risky to touch
- 🟢 **Stable** — rarely changed, well-settled code
- ⚪ **Utility** — helper and leaf files

### 🧠 Semantic Architecture Engine
Goes beyond raw imports. Classifies every file into one of **15 semantic cluster types** — Components, Hooks, API Layer, Auth, Database, Services, State Management, and more — using 100+ pattern matching rules with framework detection (Next.js, React, Express, Django, FastAPI).

### 🏥 Codebase Health Score
A single 0–100 score built from five architectural signals:
- Circular dependency count
- Hotspot density (% of frequently changed files)
- Coupling tightness (avg dependencies per file)
- Stale file risk (untouched files with many dependents)
- File size bloat (files that should be split)

### 🔄 Execution Flow Detection
Automatically detects five flow types through the codebase — Authentication, API Request, User Registration, Database Query, and UI Render — with confidence scoring. Only flows above 40% confidence are shown.

### 🤖 Graph-Aware AI Chat
Ask anything about the codebase. Powered by **Gemini 2.0 Flash**. Answers reference your actual file names and real dependency relationships. Clickable file references jump directly to nodes on the graph. Supports streaming responses.

Example questions:
- *"What breaks if I change db.ts?"*
- *"Which files are most risky before a release?"*
- *"How does the authentication flow work?"*
- *"What has the most technical debt?"*

### ⚡ Real-Time Progress via SSE
Watch the analysis happen live — fetching file tree, parsing imports, building the graph, calculating health, detecting flows — with an animated visual checklist. Results are cached in Redis for instant repeat visits.

### 🔍 Cmd+K Search
Raycast-style instant search across all files and clusters. Keyboard navigable. Smooth zoom to any node on the graph.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- A GitHub Personal Access Token ([create one here](https://github.com/settings/tokens))
- A Gemini API key ([get one free here](https://aistudio.google.com))

### Install & Run

```bash
# Clone the repository
git clone https://github.com/mithileshofficial06/codemap.git
cd codemap

# Install all dependencies (Turborepo manages the monorepo)
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys (see Environment Variables section below)

# Start both frontend and backend
npm run dev
```

Open **http://localhost:3000** and paste any public GitHub URL.

### Environment Variables

```env
# ── Required ──────────────────────────────────────────
GITHUB_TOKEN=ghp_your_github_personal_access_token
GEMINI_API_KEY=your_gemini_api_key

# ── Optional: Caching (highly recommended) ────────────
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# ── Optional: CORS in production ──────────────────────
FRONTEND_URL=https://your-app.vercel.app
PORT=4000
```

> **Getting your GitHub Token:** Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens → give read access to public repositories.

> **Getting Gemini API Key:** Go to [aistudio.google.com](https://aistudio.google.com) → Get API Key → completely free, no credit card.

---

## 🛠 Tech Stack

### Frontend (`apps/web`)

| Category | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 App Router | SSR, routing, API routes |
| Language | TypeScript 5.9 | Type safety |
| Graph | ReactFlow + D3.js | Interactive visualization |
| Layout | D3 Force Simulation | Physics-based node positioning |
| State | Zustand | 5-store state management |
| Styling | Tailwind CSS | Utility-first CSS |
| Animation | Framer Motion | UI animations and transitions |
| Background | Three.js + WebGL | 3D fluid ribbon animation |
| AI | Google Generative AI | Gemini streaming chat |
| Icons | Lucide React | Icon system |

### Backend (`apps/api`)

| Category | Technology | Purpose |
|---|---|---|
| Framework | Express.js 4 | HTTP server |
| Language | TypeScript 5.9 | Type safety |
| GitHub | Octokit REST | Repository data fetching |
| Parsing | dependency-cruiser | Static import/export analysis |
| Cache | Upstash Redis | Result caching (serverless) |
| Streaming | Server-Sent Events | Real-time progress updates |
| Validation | Zod | Runtime type checking |

### Infrastructure

| Service | Purpose | Cost |
|---|---|---|
| Vercel | Frontend hosting | Free tier |
| Railway | Backend hosting | Free tier |
| Upstash Redis | Serverless caching | Free tier |
| GitHub API | Repository data | Free (5K req/hr) |
| Gemini API | AI inference | Free tier |

**Total infrastructure cost for public repos: $0/month**

---

## 🏗 Architecture

### Monorepo Structure

```
codemap/
├── apps/
│   ├── web/                          # Next.js frontend (Port 3000)
│   │   ├── app/                      # App Router pages + API routes
│   │   ├── components/               # React components
│   │   │   ├── graph/                # Graph canvas, nodes, edges
│   │   │   ├── chat/                 # AI chat panel
│   │   │   ├── health/               # Health score panel
│   │   │   └── landing/              # Landing page components
│   │   ├── lib/                      # Core intelligence engines
│   │   │   ├── semanticArchitectureEngine.ts   # 15-type file classification
│   │   │   ├── semanticLayoutEngine.ts         # Physics layout system
│   │   │   ├── flowDetection.ts               # Execution flow detection
│   │   │   ├── graphAwareContext.ts            # AI context builder
│   │   │   └── graphReactionEngine.ts          # Clickable AI references
│   │   └── store/                    # Zustand state stores
│   │
│   └── api/                          # Express backend (Port 4000)
│       └── src/
│           ├── routes/               # analyze, chat, health
│           ├── services/             # github, parser, graphBuilder, healthScore
│           ├── cache/                # Redis client
│           └── sse/                  # Progress streaming
│
├── packages/
│   └── shared/                       # Shared TypeScript types
│
└── turbo.json                        # Turborepo pipeline config
```

### Data Flow

```
User pastes GitHub URL
        ↓
Next.js frontend → POST /api/analyze
        ↓
Express backend checks Redis cache
        ↓ (cache miss)
Octokit fetches file tree + commit history
        ↓
dependency-cruiser parses all imports/exports
        ↓
GraphBuilder assembles nodes + edges JSON
        ↓
HealthScore calculates 5 metrics
        ↓
SSE streams progress to frontend in real time
        ↓
Result cached in Redis (1hr TTL)
        ↓
Frontend renders D3 force graph + health panel
        ↓
Gemini AI available for questions with graph context
```

---

## 🚢 Deployment

### Frontend → Vercel

```bash
# Option 1: Vercel CLI
npm i -g vercel
cd apps/web
vercel --prod

# Option 2: Import on vercel.com
# Set Root Directory: apps/web
# Framework: Next.js
```

Add environment variables on Vercel dashboard:
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_API_URL` → your Railway API URL

### Backend → Railway

1. Create new project at [railway.app](https://railway.app)
2. Connect this GitHub repository
3. Set Root Directory to `/` (Turborepo handles the rest)
4. Add environment variables:
   - `GITHUB_TOKEN`
   - `GEMINI_API_KEY`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `FRONTEND_URL` → your Vercel URL
   - `PORT=4000`

### Redis → Upstash

1. Create free database at [upstash.com](https://upstash.com)
2. Copy REST URL and token to environment variables

---

## 📡 API Reference

### Backend Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/analyze` | Analyze a GitHub repository. Returns SSE progress stream then full graph JSON |
| `POST` | `/chat` | AI chat with codebase context. Returns streaming text |
| `GET` | `/health` | Server health check |

### Request: POST `/analyze`

```json
{
  "url": "https://github.com/vercel/next.js"
}
```

### Response (SSE stream, then JSON)

```json
{
  "nodes": [...],
  "edges": [...],
  "clusters": [...],
  "healthScore": {
    "overall": 74,
    "metrics": {
      "circularDeps": 92,
      "hotspotDensity": 68,
      "coupling": 71,
      "staleFiles": 85,
      "fileBloat": 79
    }
  },
  "detectedFlows": [...],
  "meta": {
    "owner": "vercel",
    "repo": "next.js",
    "totalFiles": 2847,
    "analyzedFiles": 1203
  }
}
```

---

## 🧩 Scripts

```bash
npm run dev        # Start all services (Turborepo parallel)
npm run build      # Build all packages
npm run lint       # Lint all packages

# Individual services
cd apps/web && npm run dev    # Frontend only at :3000
cd apps/api && npm run dev    # Backend only at :4000
```

---

## 🗺 Roadmap

- [ ] GitHub OAuth — private repository support
- [ ] Shareable links — annotated map snapshots
- [ ] PR impact preview — visualize blast radius before merging
- [ ] Codebase time machine — timeline slider through git history
- [ ] GitLab and Bitbucket support
- [ ] VS Code extension
- [ ] Export to PNG/SVG
- [ ] Multi-language flow detection (Python, Go, Java)
- [ ] Collaborative annotations

---

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

```bash
# Fork and clone
git clone https://github.com/mithileshofficial06/codemap.git

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes, then
git commit -m "feat: your feature description"
git push origin feature/your-feature-name

# Open a Pull Request on GitHub
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built by <a href="https://github.com/mithileshofficial06">Mithilesh KS</a>
  <br />
  <a href="https://github.com/mithileshofficial06/codemap">github.com/mithileshofficial06/codemap</a>
</p>
