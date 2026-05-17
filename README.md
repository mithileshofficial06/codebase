# CodeMap

Visualize your codebase dependencies with an interactive graph, AI chat assistant, and health score metrics.

## Project Structure

```
codemap/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Node.js + Express backend
├── packages/
│   └── shared/       # Shared TypeScript types
└── turbo.json        # Turborepo config
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

3. Start development servers:
```bash
npm run dev
```

## Environment Variables

- `GITHUB_TOKEN` - GitHub personal access token
- `GEMINI_API_KEY` - Google Gemini API key
- `REDIS_URL` - Upstash Redis URL
- `REDIS_TOKEN` - Upstash Redis token
- `API_URL` - Backend API URL (default: http://localhost:4000)
- `NEXT_PUBLIC_API_URL` - Frontend API URL

## Features

- 🎨 Beautiful aurora background with grain texture
- 📊 Interactive dependency graph visualization
- 💬 AI-powered chat assistant (Gemini)
- 📈 Code health score with 5 metrics
- ⚡ Real-time SSE progress updates
- 🔄 Redis caching for faster analysis
- 🎯 React Flow + D3 force-directed graph

## Tech Stack

**Frontend:**
- Next.js 14
- React Flow
- Zustand
- Tailwind CSS
- D3 Force
- Gemini AI

**Backend:**
- Node.js + Express
- Octokit (GitHub API)
- dependency-cruiser
- Upstash Redis
- SSE (Server-Sent Events)

## Development

```bash
# Install dependencies
npm install

# Run dev servers (both apps)
npm run dev

# Build all apps
npm run build

# Lint all apps
npm run lint
```

## License

MIT
