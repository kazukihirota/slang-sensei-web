# Slang Sensei - Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
3. **GitHub Repository**: Push your code to GitHub

## Step 1: Deploy Supabase Backend

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to your users
3. Set a strong database password
4. Wait for the project to be provisioned

### 1.2 Deploy Database Schema

1. Install Supabase CLI: `pnpm add -g supabase`
2. Login: `supabase login`
3. Link your project: `supabase link --project-ref YOUR_PROJECT_REF`
4. Deploy migrations: `supabase db push`
5. Deploy Edge Functions: `supabase functions deploy`

### 1.3 Get Production Credentials

From your Supabase dashboard:

- Go to Settings > API
- Copy your Project URL and anon/public key

## Step 2: Deploy Frontend to Vercel

### 2.1 Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set the root directory to `/frontend`

### 2.2 Configure Build Settings

Vercel should auto-detect Vite, but verify:

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `pnpm run build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

### 2.3 Set Environment Variables

In Vercel dashboard, go to Settings > Environment Variables:

- `VITE_SUPABASE_URL`: Your production Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Your production Supabase anon key

### 2.4 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## Step 3: Configure Supabase for Production

### 3.1 Update Site URL

In Supabase dashboard:

1. Go to Authentication > URL Configuration
2. Add your Vercel domain to "Site URL"
3. Add your Vercel domain to "Redirect URLs"

### 3.2 Configure CORS

Add your Vercel domain to allowed origins in Supabase settings.

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Test user authentication
3. Test slang search functionality
4. Test explanation generation

## Troubleshooting

### Common Issues:

1. **CORS errors**: Check Supabase CORS settings
2. **Authentication issues**: Verify Site URL and Redirect URLs
3. **Build failures**: Check environment variables are set correctly
4. **Edge Function errors**: Ensure functions are deployed to production

### Environment Variables Checklist:

- [ ] `VITE_SUPABASE_URL` set in Vercel
- [ ] `VITE_SUPABASE_ANON_KEY` set in Vercel
- [ ] Supabase Site URL configured
- [ ] Supabase Redirect URLs configured
- [ ] CORS settings updated

## Next Steps

After successful deployment:

1. Set up custom domain (optional)
2. Configure monitoring and analytics
3. Set up automated deployments from main branch
4. Consider setting up staging environment
