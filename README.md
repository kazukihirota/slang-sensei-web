# Slang Sensei (スラング先生)

A modern Japanese slang dictionary web application with AI-powered explanations.

## 🚀 Features

- **Search Japanese Slang**: Comprehensive database of Japanese slang terms
- **AI Explanations**: Powered by OpenAI GPT-4o-mini for detailed, context-aware explanations
- **User Authentication**: Secure sign-up and sign-in with Supabase Auth
- **Search History**: Track your recent searches
- **Real-time Updates**: Fast, responsive interface built with React + Vite
- **Semantic Search**: Intelligent search using PostgreSQL similarity functions

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **pnpm** 8.x or higher
- **Supabase CLI** (for local development)
- **OpenAI API Key** (for AI explanations)

## 🛠️ Setup

### 1. Install pnpm

If you don't have pnpm installed:

```bash
# Using npm
npm install -g pnpm

# Or using Homebrew (macOS)
brew install pnpm

# Or using other methods
# See: https://pnpm.io/installation
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install
```

This will install dependencies for both `frontend/` and `scripts/` packages.

### 3. Setup Supabase

```bash
# Install Supabase CLI
pnpm add -g supabase

# Login to Supabase
supabase login

# Start local Supabase instance
supabase start
```

This will start:

- PostgreSQL database
- Edge Functions runtime
- Supabase Studio (http://localhost:54323)
- API Gateway (http://localhost:54321)

### 4. Configure Environment Variables

Create `frontend/.env.local`:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase-start
```

**Note**: Get your local anon key from the output of `supabase start`.

### 5. Setup OpenAI (Optional for local dev)

If you want AI explanations in local development:

```bash
# Set OpenAI API key as Supabase secret
supabase secrets set OPENAI_API_KEY=sk-proj-your-key-here
```

## 🏃 Running the Application

### Development Mode

```bash
# Start Supabase (if not already running)
supabase start

# In a new terminal, start the frontend
cd frontend
pnpm dev
```

The app will be available at: **http://localhost:5173**

### Other Commands

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint frontend code
pnpm lint

# Run CSV export script
pnpm export:csv

# Deploy all Edge Functions
pnpm deploy:functions

# Deploy database migrations
pnpm deploy:db

# Deploy everything (backend)
pnpm deploy:all
```

**Using pnpm workspace commands directly:**

```bash
# Alternative syntax for workspace commands
pnpm -F frontend build
pnpm -F frontend preview
pnpm -F frontend lint
pnpm -F scripts export:csv
```

## 📁 Project Structure

```
slang-sensei-web/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── lib/          # Supabase client
│   │   └── main.tsx      # App entry point
│   └── package.json
├── scripts/              # Utility scripts
│   ├── export-to-csv.js  # JMdict data export
│   └── package.json
├── supabase/             # Supabase backend
│   ├── functions/        # Edge Functions
│   │   └── explain/      # AI explanation function
│   ├── migrations/       # Database migrations
│   └── config.toml       # Supabase configuration
├── docs/                 # Internal documentation (not committed)
│   ├── API_FLOW.md
│   └── DEPLOYING_FUNCTIONS.md
├── pnpm-workspace.yaml   # pnpm workspace config
├── deploy.sh             # Deployment script
├── DEPLOYMENT.md         # Production deployment guide
└── README.md             # This file
```

## 🔧 Technology Stack

### Frontend

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Supabase JS** - Backend client

### Backend

- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Edge Functions (Deno runtime)
- **OpenAI API** - GPT-4o-mini for explanations

### Package Management

- **pnpm** - Fast, disk space efficient package manager
- **Workspaces** - Monorepo structure

## 🚀 Deployment

See the [DEPLOYMENT.md](./DEPLOYMENT.md) guide for detailed production deployment instructions.

Quick deploy:

```bash
# Deploy all Edge Functions
pnpm deploy:functions

# Deploy database migrations only
pnpm deploy:db

# Deploy everything (backend)
pnpm deploy:all
# Or: ./deploy.sh

# Deploy frontend to Vercel
# (Push to GitHub and connect via Vercel dashboard)
```

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full production deployment guide
- [docs/API_FLOW.md](./docs/API_FLOW.md) - API call flow documentation (internal)
- [docs/DEPLOYING_FUNCTIONS.md](./docs/DEPLOYING_FUNCTIONS.md) - Edge Functions deployment (internal)
- [frontend/README.md](./frontend/README.md) - Frontend-specific docs
- [scripts/README.md](./scripts/README.md) - Scripts documentation

**Note**: The `docs/` directory is excluded from git and contains internal development documentation.

## 🧪 Testing

### Test Edge Functions Locally

```bash
# Start Supabase
supabase start

# Test the explain function
curl -X POST 'http://127.0.0.1:54321/functions/v1/explain' \
  -H 'Authorization: Bearer YOUR_LOCAL_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"term": "草"}'
```

### Check Logs

```bash
# View Edge Function logs (production)
pnpm supabase:logs

# View Edge Function logs (local)
pnpm supabase:logs:local

# Alternative: using supabase CLI directly
supabase functions logs explain --local
supabase db logs
```

## 🤝 Development Workflow

1. **Create feature branch**

   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes**

   - Frontend: Edit files in `frontend/src/`
   - Backend: Edit files in `supabase/functions/`
   - Database: Add migrations in `supabase/migrations/`

3. **Test locally**

   ```bash
   pnpm supabase:start
   pnpm dev
   ```

4. **Deploy to production**

   ```bash
   # Deploy Supabase backend
   pnpm deploy:all

   # Push to GitHub (triggers Vercel deployment)
   git push origin main
   ```

## 🔍 Database

### Migrations

```bash
# Create new migration
supabase migration new your_migration_name

# Apply migrations
supabase db push

# Reset database (destructive!)
supabase db reset
```

### Schema Files

Located in `supabase/schemas/`:

- `01_extensions.sql` - PostgreSQL extensions
- `02_slang_tables.sql` - Table definitions
- `03_indexes.sql` - Database indexes
- `04_functions.sql` - Database functions
- `05_permissions.sql` - Row Level Security

## 📊 Performance

- **Caching**: Explanations are cached to reduce API calls
- **Semantic Search**: Fast PostgreSQL full-text search
- **Edge Functions**: Low latency with Supabase Edge Network
- **Single API Call**: Optimized to use 1 OpenAI call for new terms

## 🐛 Troubleshooting

### "pnpm command not found"

```bash
npm install -g pnpm
```

### "Supabase not started"

```bash
supabase start
```

### Frontend won't connect to backend

- Check `.env.local` has correct Supabase URL and key
- Verify Supabase is running: `supabase status`

### Edge Function errors

```bash
# Check function logs
supabase functions logs explain --local

# Verify OpenAI key is set
supabase secrets list
```

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- **JMdict** - Japanese dictionary data
- **Supabase** - Backend infrastructure
- **OpenAI** - AI explanations
- **React** & **Vite** - Frontend framework and tooling

---

Built with ❤️ using React, Supabase, and OpenAI
