# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

Slang Sensei (スラング先生) is a Japanese slang dictionary web application with
AI-powered explanations. It features:

- Slang term search with semantic matching
- Grammar analysis for Japanese sentences
- AI-powered explanations using OpenAI GPT-4o-mini
- User authentication via Supabase
- Search history tracking
- Client-side caching for performance

## Development Commands

### Setup

```bash
# Install dependencies (uses pnpm workspaces)
pnpm install

# Start local Supabase instance (required for backend)
supabase start

# Serve Edge Functions locally
supabase functions serve
```

### Development

```bash
# Start frontend dev server (runs on http://localhost:5173)
pnpm dev
# or: cd frontend && pnpm dev

# Build frontend for production
pnpm build

# Preview production build
pnpm preview

# Lint frontend code
pnpm lint
```

### Supabase

```bash
# Check Supabase status
pnpm supabase:status

# View Edge Function logs (production)
pnpm supabase:logs

# View Edge Function logs (local)
pnpm supabase:logs:local

# Create new migration
supabase migration new <migration_name>

# Deploy database migrations
pnpm deploy:db
# or: supabase db push

# Deploy Edge Functions
pnpm deploy:functions
# or: supabase functions deploy

# Deploy all backend (runs deploy.sh)
pnpm deploy:all
```

### Testing

```bash
# Test Edge Function locally
curl -X POST 'http://127.0.0.1:54321/functions/v1/explain' \
  -H 'Authorization: Bearer YOUR_LOCAL_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"term": "草"}'

# Test grammar analysis
curl -X POST 'http://127.0.0.1:54321/functions/v1/explain' \
  -H 'Authorization: Bearer YOUR_LOCAL_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"sentence": "行ってきます", "type": "grammar"}'
```

## Architecture

### Project Structure

```
slang-sensei-web/
├── frontend/              # React + Vite SPA
│   ├── src/
│   │   ├── components/   # Reusable UI components (shadcn/ui)
│   │   ├── containers/   # Feature containers (Auth, SlangDictionary)
│   │   ├── lib/          # Core libraries (supabase client, utils)
│   │   ├── App.tsx       # Root component with routing
│   │   └── routes.tsx    # Route definitions
│   └── package.json
├── supabase/
│   ├── functions/        # Edge Functions (Deno)
│   │   ├── explain/      # AI explanation function
│   │   │   ├── index.ts  # Main handler
│   │   │   └── lib/      # Business logic modules
│   │   └── _shared/      # Shared utilities (CORS)
│   ├── migrations/       # SQL migrations
│   └── schemas/          # Schema definitions (reference only)
└── pnpm-workspace.yaml   # Monorepo workspace config
```

### Frontend Architecture

**Technology Stack:**

- React 19 + TypeScript
- Vite for build/dev server
- Tailwind CSS + shadcn/ui components
- React Router for routing
- Supabase JS client for backend communication

**Key Files:**

- `frontend/src/lib/supabase.ts` - Supabase client, API functions, caching
  layer, localStorage management
- `frontend/src/containers/SlangDictionary/index.tsx` - Main app container with
  state management
- `frontend/src/containers/Auth/index.tsx` - Authentication flow
- `frontend/src/routes.tsx` - Route definitions (/, /signup)

**State Management:**

- React hooks for local state (useState, useEffect)
- Auth state managed via Supabase auth listener
- No Redux/external state library

**API Communication Flow:**

1. User submits search term or sentence
2. Check localStorage cache first (24hr TTL)
3. If not cached, call Supabase Edge Function with auth token
4. Edge Function checks database cache, calls OpenAI if needed
5. Response cached in both localStorage and database
6. Search history recorded for authenticated users

**Caching Strategy:**

- Client-side: localStorage with 24hr expiry (`getCachedExplanation`,
  `setCachedExplanation`)
- Server-side: PostgreSQL `explanation_cache` table with hash-based lookups
- Separate caches for slang and grammar analysis
- Expired cache cleanup on app mount

### Backend Architecture

**Technology Stack:**

- Supabase (PostgreSQL + Edge Functions)
- Deno runtime for Edge Functions
- OpenAI GPT-4o-mini for AI explanations

**Edge Function: `explain`** Location: `supabase/functions/explain/`

**Request Flow:**

1. `index.ts` - Main handler, routes requests by type (slang/grammar)
2. `lib/auth.ts` - Extracts authenticated user from request
3. `lib/handlers.ts` - Business logic handlers:
   - `handleExistingSlang` - Generate explanation for known slang
   - `handleNewSlangTerm` - Create explanation for unknown terms
   - `handleGrammarAnalysis` - Analyze Japanese sentence grammar
4. `lib/database.ts` - Database operations:
   - `searchSlang` - Semantic search using PostgreSQL functions
   - `getCachedExplanation` - Check explanation cache
   - `cacheExplanation` - Store generated explanations
   - `recordUserSearch` - Track search history
5. `lib/ai.ts` - OpenAI API integration
6. `lib/prompts.ts` - AI prompt templates

**Database Schema:**

- `dictionary_entries` - Slang terms and dictionary words
- `dictionary_examples` - Usage examples for entries
- `explanation_cache` - Cached AI-generated explanations
- `search_history` - User search history (requires auth)

**Key Features:**

- Hash-based cache lookup (term + entry_id)
- Semantic search using PostgreSQL `search_slang_entries()` function
- Optional authentication (guests get explanations but no history)
- Fire-and-forget cache/history writes for performance

### Database Functions

Located in `supabase/schemas/04_functions.sql`:

- `search_slang_entries(query, limit)` - Full-text search with similarity
  ranking
- Uses PostgreSQL extensions: `pg_trgm` for trigram similarity

## Common Workflows

### Adding a New Feature

1. Frontend changes go in `frontend/src/containers/` or
   `frontend/src/components/`
2. Backend changes go in `supabase/functions/` or `supabase/migrations/`
3. Test locally with `supabase start` + `pnpm dev`
4. Deploy backend with `pnpm deploy:all`
5. Frontend deploys automatically via Vercel on push to main

### Modifying Database Schema

1. Create migration: `supabase migration new <name>`
2. Edit SQL file in `supabase/migrations/`
3. Test locally: `supabase db reset`
4. Deploy: `pnpm deploy:db`

### Updating AI Prompts

1. Edit `supabase/functions/explain/lib/prompts.ts`
2. Test locally with curl or frontend
3. Deploy: `pnpm deploy:functions`

### Working with Edge Functions

- Edge Functions use Deno, not Node.js
- Do not generate Deno lock file
- Import Supabase types: `@supabase/functions-js/edge-runtime.d.ts`
- Use `import.meta.env` for environment variables
- CORS headers required for browser requests (`_shared/cors.ts`)

## Environment Variables

### Local Development (`frontend/.env.local`)

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<from supabase start output>
```

### Supabase Secrets

```bash
# Set OpenAI API key (required for explanations)
supabase secrets set OPENAI_API_KEY=sk-proj-...
```

### Production (Vercel)

- `VITE_SUPABASE_URL` - Production Supabase URL
- `VITE_SUPABASE_ANON_KEY` - Production anon key

## Important Patterns

### Authentication

- Optional for slang/grammar explanations (guests allowed)
- Required for search history persistence
- Auth state managed via `supabase.auth.onAuthStateChange()`
- User session passed to Edge Functions via Authorization header

### Error Handling

- Edge Functions return JSON errors with 4xx/5xx status codes
- Frontend displays user-friendly error messages
- Console logs for debugging (check with `pnpm supabase:logs`)

### Type Safety

- Frontend uses TypeScript strict mode
- Database types defined in `frontend/src/lib/supabase.ts`
- Edge Function types in `supabase/functions/explain/lib/types.ts`
- Supabase auto-generates types from schema (not currently used)

### Performance Optimization

- Multi-level caching (localStorage + database)
- Fire-and-forget writes for history/cache
- Semantic search limited to top 1-3 results
- Single OpenAI call per unique term

## Testing Strategy

- Manual testing via local Supabase + frontend dev server
- Edge Function testing via curl commands
- No automated test suite currently

## Deployment

### Backend (Supabase)

- Deploy via `pnpm deploy:all` or `./deploy.sh`
- Migrations must be deployed before function changes
- Link project: `supabase link --project-ref <ref>`

### Frontend (Vercel)

- Auto-deploys from GitHub main branch
- Root directory: `frontend/`
- Build command: `pnpm run build`
- Output directory: `dist`

See `DEPLOYMENT.md` for full production setup guide.
