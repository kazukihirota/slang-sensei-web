# GitHub Actions Workflows

## Deploy to Production

This workflow automatically deploys your Supabase backend (Edge Functions and Database Migrations) when code is pushed to the `main` branch.

### Required Secrets

You need to set up the following secrets in your GitHub repository:

1. **SUPABASE_ACCESS_TOKEN**

   - Go to https://supabase.com/dashboard/account/tokens
   - Generate a new access token
   - Copy the token

2. **SUPABASE_PROJECT_ID**

   - Go to your Supabase project dashboard
   - Go to Settings → General
   - Copy your "Reference ID"

3. **SUPABASE_DB_PASSWORD** (optional, needed for migrations)
   - Your database password
   - Found in Settings → Database → Connection string

### How to Add Secrets to GitHub

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:
   - Name: `SUPABASE_ACCESS_TOKEN`, Value: your token
   - Name: `SUPABASE_PROJECT_ID`, Value: your project ref
   - Name: `SUPABASE_DB_PASSWORD`, Value: your db password

### Manual Trigger

You can also manually trigger the deployment:

1. Go to **Actions** tab in your GitHub repository
2. Select "Deploy to Production" workflow
3. Click "Run workflow"

### What Gets Deployed

- ✅ Supabase Edge Functions (from `supabase/functions/`)
- ✅ Database Migrations (from `supabase/migrations/`)
- ❌ Frontend (deployed separately via Vercel)

### Frontend Deployment

Your frontend should be deployed via Vercel:

1. Connect your GitHub repo to Vercel
2. Vercel will auto-deploy on every push to `main`
3. Set environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
