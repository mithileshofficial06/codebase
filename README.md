<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-000?logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express-4-000?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=fff" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Gemini_AI-4285F4?logo=google&logoColor=fff" alt="Gemini" />
  <img src="https://img.shields.io/badge/License-MIT-A78BFA" alt="License" />
</p>

<h1 align="center">CodeMap</h1>

<p align="center">
  <strong>See the architecture of any codebase — instantly.</strong><br />
  Paste a GitHub URL. Get an interactive dependency graph, health scoring, and AI-powered code analysis in seconds.
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#deployment">Deployment</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#contributing">Contributing</a>
</p>

---

## Features

🗺️ **Interactive Dependency Graph** — Every file is a node, every import is an edge. Navigate your codebase visually with semantic clustering.

📊 **Health Scoring** — Coupling, complexity, and code churn distilled into a single actionable score.

🔥 **Hotspot Detection** — Surface the files changed most frequently — where bugs cluster and changes cascade.

💬 **AI-Powered Chat** — Ask your codebase anything. Powered by Gemini, answers reference real file names and dependencies.

🔄 **Flow Detection** — Automatically detect authentication, API request, and data flows through your code.

⚡ **Instant Analysis** — No install, no signup, no config. Just paste a GitHub URL.

---

## Quick Start

### Prerequisites

- **Node.js** 20+
- **npm** 10+
- API keys (see [Environment Variables](#environment-variables))

### Install & Run

```bash
# Clone the repo
git clone https://github.com/your-username/codemap.git
cd codemap

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start dev servers (frontend + backend)
npm run dev
```

- **Frontend** → http://localhost:3000
- **API** → http://localhost:4000

### Environment Variables

Create a `.env` file in the project root:

```env
# Required
GITHUB_TOKEN=ghp_your_github_personal_access_token
GEMINI_API_KEY=your_gemini_api_key

# Optional — Caching
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Optional — Frontend URL (for CORS in production)
FRONTEND_URL=https://your-app.vercel.app
```

---

## Project Structure

```
codemap/
├── apps/
│   ├── api/            # Express.js backend (Port 4000)
│   │   ├── src/
│   │   │   ├── routes/     # API routes (analyze, chat, health)
│   │   │   └── index.ts    # Server entry point
│   │   └── package.json
│   └── web/            # Next.js frontend (Port 3000)
│       ├── app/            # App Router pages
│       ├── components/     # React components
│       ├── lib/            # Core engines
│       │   ├── semanticArchitectureEngine.ts
│       │   ├── semanticLayoutEngine.ts
│       │   ├── flowDetection.ts
│       │   └── graphAwareContext.ts
│       └── package.json
├── packages/
│   └── shared/         # Shared TypeScript types
├── turbo.json          # Turborepo config
└── package.json        # Workspace root
```

---

## Tech Stack

### Frontend (`apps/web`)

| Category | Technology |
|----------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.9 |
| Graph | ReactFlow + D3.js |
| State | Zustand |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| AI | Google Generative AI (Gemini) |

### Backend (`apps/api`)

| Category | Technology |
|----------|-----------|
| Framework | Express.js 4 |
| Language | TypeScript 5.9 |
| GitHub | Octokit REST |
| Cache | Upstash Redis |
| AI | Google GenAI |
| Validation | Zod |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting |
| Railway | API hosting |
| Upstash | Redis caching |
| GitHub API | Repository data |
| Gemini | AI inference |

---

## Deployment

### Frontend → Vercel

1. Import the repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `apps/web`
3. Set **Framework Preset** to `Next.js`
4. Add environment variables:
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_API_URL` → your Railway API URL

### Backend → Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repo
3. Set **Root Directory** to `/` (monorepo root)
4. Railway will auto-detect the `Dockerfile`
5. Add environment variables:
   - `GITHUB_TOKEN`
   - `GEMINI_API_KEY`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `FRONTEND_URL`
   - `PORT` = `4000`

---

## API Endpoints

### Backend (`/api`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/analyze` | Analyze a GitHub repository (SSE progress) |
| `POST` | `/chat` | AI chat with codebase context |
| `GET` | `/health` | Health check |

### Frontend (Next.js API Routes)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Proxy to backend |
| `POST` | `/api/chat` | AI chat (Gemini) |
| `POST` | `/api/onboarding` | Generate repo summary |

---

## Scripts

```bash
# Development
npm run dev          # Start all services (Turborepo)

# Build
npm run build        # Build all packages

# Individual services
cd apps/web && npm run dev     # Frontend only
cd apps/api && npm run dev     # Backend only
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/your-username">Mithilesh KS</a>
</p>
