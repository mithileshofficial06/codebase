# CodeMap - Technical Architecture Report

## Executive Summary

**CodeMap** is a sophisticated codebase visualization and analysis platform that transforms GitHub repositories into interactive, intelligent architecture maps. Built as a modern monorepo using Turborepo, it combines real-time graph visualization, AI-powered insights, and semantic architecture analysis to help developers understand complex codebases.

**Project Type:** Full-stack web application (Monorepo)  
**Architecture:** Client-Server with AI Integration  
**Primary Use Case:** Repository analysis, dependency visualization, and AI-assisted code exploration

---

## 1. Project Architecture

### 1.1 Monorepo Structure

```
codemap/
├── apps/
│   ├── api/          # Express.js backend (Port 4000)
│   └── web/          # Next.js frontend (Port 3000)
├── packages/
│   └── shared/       # Shared TypeScript types
└── turbo.json        # Turborepo orchestration
```

**Build System:** Turborepo v2.5.0  
**Package Manager:** npm 10.9.2  
**Workspace Strategy:** npm workspaces with internal package references

---

## 2. Technology Stack

### 2.1 Frontend (`apps/web`)

**Framework & Core:**
- **Next.js 14.2.35** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5.9.3** - Type safety

**Visualization:**
- **ReactFlow 11.11.4** - Graph rendering engine
- **D3.js 7.9.0** - Force-directed layout algorithms
- **D3-Force 3.0.0** - Physics-based node positioning
- **Framer Motion 12.38.0** - Animation system

**State Management:**
- **Zustand 4.5.7** - Lightweight state management
  - `graphStore` - Graph data and UI state
  - `flowStore` - Flow detection and playback
  - `chatStore` - AI chat messages
  - `repoStore` - Repository data
  - `uiStore` - UI preferences

**Styling:**
- **Tailwind CSS 3.4.19** - Utility-first CSS
- **Geist Font** - Typography system
- **Custom Aurora Background** - Cinematic visual effects

**AI Integration:**
- **Google Generative AI 0.21.0** - Gemini API client
- **NVIDIA NIM Support** - OpenAI-compatible API (optional)

**UI Components:**
- **Lucide React** - Icon system
- **React Markdown** - Chat message rendering
- **Custom SVG Icons** - Flow and system indicators


### 2.2 Backend (`apps/api`)

**Framework:**
- **Express.js 4.22.2** - Web server
- **Node.js 20+** - Runtime
- **TypeScript 5.9.3** - Type safety
- **tsx 4.0.0** - TypeScript execution with hot reload

**GitHub Integration:**
- **Octokit REST 20.1.2** - GitHub API client
- **Authenticated requests** - 5,000 requests/hour rate limit

**Caching:**
- **Upstash Redis 1.38.0** - Serverless Redis for analysis caching

**AI Integration:**
- **Google GenAI 1.0.0** - Gemini API for code analysis

**Validation:**
- **Zod 3.23.0** - Runtime type validation

**Development:**
- **dotenv 16.6.1** - Environment variable management
- **CORS 2.8.6** - Cross-origin resource sharing

---

## 3. Core Systems

### 3.1 Semantic Architecture Engine

**Location:** `apps/web/lib/semanticArchitectureEngine.ts`

**Purpose:** Transforms raw dependency graphs into intelligent semantic clusters

**Key Features:**
- **15 Semantic Cluster Types:**
  - Config/System (⚙️)
  - Pages (📄)
  - Components (🧩)
  - Hooks (🪝)
  - State Management (🔄)
  - API Layer (⚡)
  - Services (⚙️)
  - Models (🗄️)
  - Database (💾)
  - Authentication (🔐)
  - Middleware (🛡️)
  - Utilities (🔧)
  - Tests (🧪)
  - Styles (🎨)
  - Assets (📦)

**Intelligence Features:**
- **100+ Pattern Matching Rules** - File path and naming conventions
- **Framework Detection** - Next.js, React, Express, Flask, Django, FastAPI
- **Fallback Clustering** - Folder-based grouping for unmatched files
- **Confidence Scoring** - High (70%+), Medium (40-69%), Low (<40%)
- **Entry Point Detection** - Identifies application starting points

**Algorithm:**
```typescript
1. Pattern-based classification (filename, path, extension)
2. Framework-specific heuristics
3. Folder-based fallback (2-level depth)
4. Confidence calculation based on multiple signals
5. Cluster metadata enrichment (size, file count, risk)
```


### 3.2 Semantic Layout Engine

**Location:** `apps/web/lib/semanticLayoutEngine.ts`

**Purpose:** Physics-based graph layout with architectural gravity

**Layout Modes:**

1. **Architecture Layout** (Cluster View)
   - Semantic gravity zones (top-right for config, top for pages, etc.)
   - Center attraction force (2%)
   - Cluster affinity force (25%)
   - Dead node containment (40%)
   - Reduced repulsion (-1200) for tighter packing

2. **Module Layout** (Expanded Cluster)
   - Tight file packing within cluster
   - 70% density optimization
   - Collision detection (radius 120)

3. **File Layout** (All Files)
   - Intelligent grouping by semantic type
   - 65% density optimization
   - No floating nodes (containment forces)

**Force System:**
```typescript
Forces Applied:
- semanticGravityForce: 15% (pulls to architectural zones)
- centerAttractionForce: 2% (prevents drift)
- clusterAffinityForce: 25% (keeps related nodes together)
- deadNodeContainmentForce: 40% (prevents isolated floating)
- repulsionForce: -1200 (node separation)
- collisionForce: radius 120 (prevents overlap)
```

**Density Optimization:**
- Calculates bounding box of all nodes
- Scales positions to achieve target density (65-70%)
- Maintains aspect ratio and readability

---

### 3.3 Flow Detection System

**Location:** `apps/web/lib/flowDetection.ts`

**Purpose:** Automatically detect execution flows through the codebase

**Detected Flow Types:**
1. **Authentication Flow** - Login, session, token management
2. **API Request Flow** - HTTP request lifecycle
3. **User Registration Flow** - Signup process
4. **Database Query Flow** - Data access patterns
5. **UI Render Flow** - Component rendering chain

**Confidence Scoring Algorithm:**
```typescript
Confidence = (
  chainDepth * 0.6 +           // Longer chains = higher confidence
  systemDiversity * 0.3 +      // Cross-system flows = more meaningful
  dependencyQuality * 0.2 +    // Strong dependencies = better signal
  frameworkSignals * 0.2       // Framework patterns = validation
) / 1.3

Minimum Threshold: 40%
```

**Flow Structure:**
```typescript
interface DetectedFlow {
  id: string;
  name: string;
  type: FlowType;
  steps: FlowStep[];
  confidence: number;  // 0-1 scale
  description: string;
}
```

**Filtering:**
- Only flows with 40%+ confidence are shown
- Prevents "fake" or low-quality flow detection
- Graceful empty state when no meaningful flows exist


### 3.4 Graph-Aware AI System

**Location:** `apps/web/lib/graphAwareContext.ts`

**Purpose:** Provide structured intelligence to AI for context-aware responses

**Context Structure:**
```typescript
interface GraphAwareContext {
  architectureClusters: ClusterSummary[];
  dependencyGraph: {
    coreNodes: string[];
    hotspotNodes: string[];
    stableNodes: string[];
    utilityNodes: string[];
    criticalPaths: string[];
  };
  detectedFlows: FlowSummary[];
  riskMetrics: {
    highRiskFiles: string[];
    tightlyCoupledModules: string[];
    changeHotspots: string[];
  };
  currentFocus: {
    activeFlow: string | null;
    viewLevel: string;
  };
  healthMetrics: {
    overall: number;
    complexity: number;
    maintainability: number;
    testCoverage: number;
  };
  entryPoints: string[];
}
```

**Intelligence Features:**
- **Structured Data Extraction** - Not raw graph dumps
- **Risk Analysis** - Identifies high-risk files and coupling
- **Entry Point Detection** - Finds application starting points
- **Context-Aware Suggestions** - Dynamic question generation
- **Intent Detection** - Classifies user questions (architecture, flow, risk, etc.)

**AI Prompt Engineering:**
- System prompt defines AI as "intelligent architecture companion"
- Context formatted as structured sections (not JSON)
- File names made exact for clickable references
- Temperature: 0.4 (balanced creativity/accuracy)
- Max tokens: 500 (concise responses)

---

### 3.5 Graph Reaction Engine

**Location:** `apps/web/lib/graphReactionEngine.ts`

**Purpose:** Extract clickable references from AI responses

**Reference Types:**
1. **File References** (blue) → Zoom to node
2. **Cluster References** (orange) → Expand module
3. **Flow References** (green) → Play flow

**Extraction Algorithm:**
```typescript
1. Parse AI response text
2. Match against known entities (files, clusters, flows)
3. Fuzzy matching with confidence threshold
4. Generate clickable spans with metadata
5. Return structured reference list
```

**Intent Detection:**
- Architecture questions → Focus on structure
- Flow questions → Explain execution paths
- Risk questions → Identify breaking points
- Onboarding questions → Guide exploration
- Refactoring questions → Suggest improvements


---

## 4. User Interface Architecture

### 4.1 Component Hierarchy

```
AppLayout (Main Container)
├── AuroraBackground (Animated background)
├── GraphCanvas (Visualization)
│   ├── ReactFlow (Graph renderer)
│   ├── CustomNode (Node component)
│   ├── CustomEdge (Edge component)
│   ├── ClusterNode (Cluster component)
│   ├── GraphControls (View switcher)
│   ├── GraphSearch (Cmd+K search)
│   ├── NodeDetail (Side panel)
│   ├── OnboardingPanel (AI summary)
│   └── FlowVisualization (Flow playback)
├── FlowPanel (Flow list)
├── ChatPanel (AI assistant)
│   ├── ChatMessage (Message bubble)
│   └── StreamingIndicator (Loading state)
└── HealthPanel (Metrics display)
```

### 4.2 Visual Design System

**Color Palette:**
- Background: Deep black (#000000)
- Primary: Blue (#3b82f6)
- Success: Green (#10b981)
- Warning: Orange (#f59e0b)
- Danger: Red (#ef4444)
- Purple: (#8b5cf6)

**Node Types & Colors:**
- Core: Blue glow (high dependency)
- Hotspot: Red glow (high change frequency)
- Stable: Green glow (low change frequency)
- Utility: Gray glow (helper functions)

**Visual Effects:**
- **Glassmorphism** - Backdrop blur with transparency
- **Glow Effects** - Multi-layer shadows (6px + 3px blur)
- **Aurora Background** - Animated gradient with grain texture
- **Smooth Animations** - 400ms cubic-bezier transitions
- **Spring Physics** - Framer Motion spring animations

**Typography:**
- Font Family: Geist Mono (monospace)
- Letter Spacing: -0.02em
- Font Weights: 400 (regular), 500 (medium), 600 (semibold)

### 4.3 Interaction Patterns

**Graph Interactions:**
- **Single Click** - Select node, show details
- **Drag** - Pan canvas
- **Scroll** - Zoom in/out
- **Cmd/Ctrl + K** - Open search (Raycast-style)
- **Hover** - Show node/edge highlights

**Flow Playback:**
- **Play Button** - Start flow animation
- **Pause Button** - Pause at current step
- **Reset Button** - Return to beginning
- **Step Indicator** - Shows current position (1/5)
- **Progress Bar** - Visual progress with shimmer effect

**Chat Interactions:**
- **Type & Send** - Ask questions
- **Click References** - Jump to files/clusters/flows
- **Suggested Questions** - Context-aware prompts
- **Streaming Responses** - Real-time AI output


---

## 5. Data Flow Architecture

### 5.1 Repository Analysis Pipeline

```
User Input (GitHub URL)
    ↓
Frontend: POST /api/analyze
    ↓
Backend: GitHub API
    ↓
1. Fetch repository metadata
2. Clone/download repository
3. Parse file structure
4. Analyze dependencies
5. Calculate health metrics
6. Detect flows
    ↓
Redis Cache (Upstash)
    ↓
SSE Progress Updates
    ↓
Frontend: Real-time UI updates
    ↓
Graph Visualization + AI Chat
```

### 5.2 State Management Flow

**Zustand Stores:**

1. **repoStore** - Repository data
   ```typescript
   - repoUrl: string
   - data: AnalysisResult | null
   - isLoading: boolean
   - error: string | null
   ```

2. **graphStore** - Graph visualization state
   ```typescript
   - nodes: GraphNode[]
   - edges: GraphEdge[]
   - clusters: ClusterNode[]
   - selectedNode: GraphNode | null
   - viewLevel: 'architecture' | 'module' | 'file'
   - activeFilter: FilterType
   ```

3. **flowStore** - Flow detection and playback
   ```typescript
   - detectedFlows: DetectedFlow[]
   - activeFlow: DetectedFlow | null
   - currentStepIndex: number
   - playbackState: 'idle' | 'playing' | 'paused'
   ```

4. **chatStore** - AI conversation
   ```typescript
   - messages: Message[]
   - isLoading: boolean
   - streaming: boolean
   ```

### 5.3 API Routes

**Frontend API Routes (Next.js):**

1. **POST /api/analyze**
   - Proxies to backend API
   - Handles repository analysis requests

2. **POST /api/chat**
   - AI chat endpoint
   - Supports Gemini or NVIDIA NIM
   - Streaming responses

3. **POST /api/onboarding**
   - Generates AI-powered repository summary
   - Used for onboarding panel

**Backend API Routes (Express):**

1. **POST /analyze**
   - Main analysis endpoint
   - SSE progress updates
   - Redis caching

2. **GET /health**
   - Health check endpoint
   - Returns API status


---

## 6. Key Features & Capabilities

### 6.1 Intelligent Graph Visualization

**Architecture View:**
- Semantic clusters organized by architectural layer
- Color-coded by system type
- Size indicates file count
- Glow indicates importance/risk

**Module View:**
- Expanded cluster showing individual files
- Tight packing with 70% density
- Maintains cluster context

**File View:**
- All files with intelligent grouping
- No floating nodes (containment forces)
- 65% density optimization

**Visual Enhancements:**
- Multi-layer glow effects
- Glass texture overlays
- Inner highlights for depth
- Smooth 400ms transitions
- Spring-based animations

### 6.2 Flow Visualization & Playback

**Features:**
- Automatic flow detection (5 types)
- Confidence-based filtering (40%+ threshold)
- Cinematic playback with animations
- Step-by-step progression
- Visual indicators (current, past, future steps)
- Backdrop dimming for focus
- Progress bar with shimmer effect

**Playback Controls:**
- Play/Pause/Reset buttons
- Step counter (e.g., "3/5")
- Auto-advance with 2.5s intervals
- Smooth transitions between steps

### 6.3 Graph-Aware AI Chat

**Intelligence:**
- Context-aware responses
- References specific files/clusters/flows
- Clickable references (blue/orange/green)
- Intent detection (architecture, flow, risk, etc.)
- Suggested questions based on context

**AI Providers:**
- Google Gemini (gemini-pro)
- NVIDIA NIM (llama-3.1-8b-instruct)
- Automatic fallback based on API key

**Features:**
- Streaming responses
- Markdown rendering
- Premium gradient AI avatar
- Context-aware suggestions
- Graph reactions (zoom, expand, play)

### 6.4 Health Score System

**Metrics:**
1. **Overall Score** (0-100)
2. **Complexity** - Cyclomatic complexity
3. **Maintainability** - Code quality
4. **Test Coverage** - Test percentage
5. **Documentation** - Comment ratio

**Visual Display:**
- Large animated score number
- Color-coded bars (green/yellow/red)
- Smooth animations
- Hover tooltips


### 6.5 Search & Navigation

**Graph Search (Cmd+K):**
- Raycast/Spotlight-inspired design
- Fuzzy search across files and clusters
- Keyboard shortcuts (↑↓ to navigate, Enter to select)
- Smooth zoom to selected node
- Backdrop blur with 70% opacity
- Staggered result animations

**Navigation Features:**
- View level switching (Architecture/Module/File)
- Filter by node type (Core/Hotspot/Stable/Utility)
- Cluster expansion/collapse
- Node detail panel
- Minimap (ReactFlow built-in)

### 6.6 Real-Time Progress Updates

**SSE (Server-Sent Events):**
- Live progress during analysis
- Step-by-step status updates
- Error handling with retry
- Graceful fallback

**Progress Steps:**
1. Fetching repository metadata
2. Analyzing file structure
3. Building dependency graph
4. Calculating health metrics
5. Detecting execution flows
6. Generating insights

**Visual Feedback:**
- Animated checklist
- Graph assembly animation
- Loading states
- Error messages

---

## 7. Performance Optimizations

### 7.1 Caching Strategy

**Redis Caching (Upstash):**
- Cache key: Repository URL
- TTL: Configurable (default: 1 hour)
- Reduces GitHub API calls
- Faster subsequent analyses

**React Optimizations:**
- `useMemo` for expensive calculations
- `useCallback` for stable function references
- `memo` for component memoization
- Zustand selective subscriptions

### 7.2 Graph Rendering

**ReactFlow Optimizations:**
- Viewport-based rendering (only visible nodes)
- Edge bundling for dense graphs
- Lazy loading of node details
- Debounced layout calculations

**D3 Force Simulation:**
- Limited iterations (300 max)
- Alpha decay for convergence
- Collision detection optimization
- Adaptive force strengths

### 7.3 Bundle Optimization

**Next.js Features:**
- Automatic code splitting
- Dynamic imports for heavy components
- Image optimization
- Font optimization (Geist)

**Build Output:**
- Tree shaking (unused code removal)
- Minification
- Compression (gzip/brotli)


---

## 8. Deployment Architecture

### 8.1 Frontend Deployment (Vercel)

**Configuration:** `apps/web/vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

**Environment Variables:**
- `GEMINI_API_KEY` or `NVIDIA_API_KEY`
- `NEXT_PUBLIC_API_URL`

**Features:**
- Automatic deployments from Git
- Edge network (CDN)
- Serverless functions for API routes
- Preview deployments for PRs

### 8.2 Backend Deployment (Railway)

**Configuration:** `apps/api/railway.json`
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Environment Variables:**
- `GITHUB_TOKEN`
- `GEMINI_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `PORT` (default: 4000)

**Features:**
- Automatic deployments
- Health checks
- Restart on failure
- Environment variable management

### 8.3 Infrastructure

**Services:**
1. **Vercel** - Frontend hosting
2. **Railway** - Backend hosting
3. **Upstash Redis** - Serverless caching
4. **GitHub API** - Repository data
5. **Google Gemini** or **NVIDIA NIM** - AI inference

**Scalability:**
- Serverless architecture (auto-scaling)
- Redis caching (reduces API calls)
- CDN distribution (global edge network)
- Stateless backend (horizontal scaling)

---

## 9. Security Considerations

### 9.1 API Security

**GitHub Token:**
- Personal access token (PAT)
- Stored in environment variables
- Never exposed to client
- Rate limit: 5,000 requests/hour

**AI API Keys:**
- Server-side only (not in client bundle)
- Environment variable storage
- Rotation recommended

**CORS:**
- Configured for specific origins
- Prevents unauthorized access
- Credentials handling

### 9.2 Data Privacy

**No Data Storage:**
- Repository data cached temporarily (Redis TTL)
- No persistent user data
- No authentication required
- Public repositories only

**Client-Side Security:**
- No sensitive data in localStorage
- XSS protection (React escaping)
- CSP headers (Content Security Policy)


---

## 10. Development Workflow

### 10.1 Local Development

**Setup:**
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start development servers
npm run dev
```

**Development Servers:**
- Frontend: http://localhost:3000 (Next.js)
- Backend: http://localhost:4000 (Express)

**Hot Reload:**
- Frontend: Next.js Fast Refresh
- Backend: tsx watch mode

### 10.2 Build Process

**Turborepo Pipeline:**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {}
  }
}
```

**Build Commands:**
```bash
# Build all apps
npm run build

# Build specific app
npm run build --filter=@codemap/web
npm run build --filter=@codemap/api

# Lint all apps
npm run lint
```

### 10.3 Code Quality

**TypeScript:**
- Strict mode enabled
- Type checking on build
- Shared types in `@codemap/shared`

**Linting:**
- ESLint for code quality
- Next.js ESLint config
- TypeScript ESLint rules

**Formatting:**
- Consistent code style
- Prettier integration (recommended)

---

## 11. Known Limitations & Future Improvements

### 11.1 Current Limitations

**Performance:**
- Large repositories (>1000 files) may be slow
- D3 force simulation can be CPU-intensive
- No pagination for large graphs

**Features:**
- No private repository support (requires OAuth)
- No user authentication
- No saved analyses
- No collaborative features

**AI:**
- Token limits (500 max)
- Rate limits (API dependent)
- No conversation history persistence

### 11.2 Potential Improvements

**Performance:**
- Virtual scrolling for large graphs
- Web Workers for heavy computations
- Progressive loading
- Graph simplification for large repos

**Features:**
- GitHub OAuth for private repos
- User accounts and saved analyses
- Collaborative annotations
- Export to PNG/SVG
- Diff view for repository changes
- Integration with CI/CD

**AI:**
- Longer context windows
- Conversation history
- Code generation
- Refactoring suggestions
- Multi-turn conversations

**Visualization:**
- 3D graph view
- Timeline view (git history)
- Heatmap overlays
- Custom layouts
- Graph filtering and querying


---

## 12. Technical Achievements

### 12.1 Innovation Highlights

**Semantic Architecture Intelligence:**
- First-of-its-kind semantic clustering system
- 100+ pattern matching rules
- Framework-aware analysis
- Confidence-based filtering

**Hybrid Graph Intelligence:**
- Combines import parsing with semantic analysis
- Prevents floating nodes and scattered layouts
- Architectural gravity system
- Density optimization

**Graph-Aware AI:**
- Structured context extraction (not raw dumps)
- Clickable references in AI responses
- Intent detection and routing
- Context-aware question suggestions

**Cinematic UX:**
- Premium visual design (Linear/Raycast quality)
- Smooth 60fps animations
- Aurora background with grain texture
- Glassmorphism and depth effects

### 12.2 Technical Complexity

**Graph Algorithms:**
- Custom force-directed layout
- Semantic gravity zones
- Dead node containment
- Density optimization
- Collision detection

**AI Integration:**
- Multi-provider support (Gemini, NVIDIA)
- Streaming responses
- Reference extraction
- Intent classification

**Real-Time Updates:**
- SSE for progress tracking
- Streaming AI responses
- Live graph updates
- Smooth state transitions

**State Management:**
- 5 Zustand stores
- Selective subscriptions
- Optimistic updates
- Error handling

---

## 13. Conclusion

CodeMap represents a sophisticated approach to codebase visualization and analysis. By combining semantic architecture intelligence, physics-based graph layouts, and AI-powered insights, it transforms complex repositories into understandable, explorable architecture maps.

**Key Strengths:**
- **Intelligent Clustering** - Semantic analysis beyond simple imports
- **Premium UX** - Cinematic design with smooth animations
- **AI Integration** - Context-aware, graph-connected assistant
- **Real-Time Feedback** - SSE progress and streaming responses
- **Scalable Architecture** - Monorepo with clear separation of concerns

**Use Cases:**
- Onboarding new developers to complex codebases
- Architecture review and documentation
- Dependency analysis and refactoring planning
- Technical debt identification
- Code exploration and understanding

**Target Audience:**
- Software engineers
- Technical leads and architects
- Code reviewers
- Open source maintainers
- Development teams

---

## Appendix A: File Structure

### Frontend Key Files
```
apps/web/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts
│   │   ├── chat/route.ts
│   │   └── onboarding/route.ts
│   ├── analyze/[repo]/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── graph/
│   │   ├── GraphCanvas.tsx
│   │   ├── CustomNode.tsx
│   │   ├── CustomEdge.tsx
│   │   ├── FlowPanel.tsx
│   │   └── FlowVisualization.tsx
│   ├── chat/
│   │   ├── ChatPanel.tsx
│   │   └── ChatMessage.tsx
│   └── ui/Icons.tsx
├── lib/
│   ├── semanticArchitectureEngine.ts
│   ├── semanticLayoutEngine.ts
│   ├── flowDetection.ts
│   ├── graphAwareContext.ts
│   └── graphReactionEngine.ts
└── store/
    ├── graphStore.ts
    ├── flowStore.ts
    ├── chatStore.ts
    └── repoStore.ts
```

### Backend Key Files
```
apps/api/
├── src/
│   ├── index.ts
│   ├── routes/
│   ├── services/
│   │   ├── github.ts
│   │   ├── graphBuilder.ts
│   │   ├── healthScore.ts
│   │   └── parser.ts
│   ├── cache/redis.ts
│   └── sse/progress.ts
└── package.json
```

---

## Appendix B: Environment Variables

### Frontend (.env.local)
```bash
GEMINI_API_KEY=your_gemini_api_key
# OR
NVIDIA_API_KEY=your_nvidia_api_key

NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Backend (.env)
```bash
GITHUB_TOKEN=github_pat_xxxxx
GEMINI_API_KEY=your_gemini_api_key

UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

PORT=4000
API_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
```

---

**Report Generated:** 2026-05-21  
**CodeMap Version:** 1.0.0  
**Report Author:** Kiro AI Assistant
