#!/bin/bash

# Slang Sensei Deployment Script
echo "🚀 Starting Slang Sensei deployment process..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in to Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run: supabase login"
    exit 1
fi

echo "✅ Supabase CLI is ready"

# Deploy Supabase functions
echo "📦 Deploying Supabase Edge Functions..."
supabase functions deploy explain

if [ $? -eq 0 ]; then
    echo "✅ Edge Functions deployed successfully"
else
    echo "❌ Failed to deploy Edge Functions"
    exit 1
fi

# Deploy database migrations
echo "🗄️ Deploying database migrations..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Database migrations deployed successfully"
else
    echo "❌ Failed to deploy database migrations"
    exit 1
fi

echo "🎉 Supabase backend deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to your Supabase dashboard and get your production URL and anon key"
echo "2. Deploy your frontend to Vercel:"
echo "   - Push your code to GitHub"
echo "   - Connect your repository to Vercel"
echo "   - Set environment variables:"
echo "     - VITE_SUPABASE_URL"
echo "     - VITE_SUPABASE_ANON_KEY"
echo "3. Update Supabase auth settings with your Vercel domain"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"

