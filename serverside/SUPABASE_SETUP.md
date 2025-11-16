# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key from Settings > API

## Step 2: Run SQL Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the entire contents of `supabase_migrations.sql`
3. Click **Run** to execute the migrations

This will create:
- `profiles` table with userhash column (ETH-style hash for profile pictures)
- `predictions_history` table for storing all predictions
- Row Level Security (RLS) policies
- Automatic profile creation on user signup
- Triggers for updated_at timestamps

## Step 3: Configure Frontend

1. Create `.env.local` in `frontend/datathon_project/`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Install dependencies:
```bash
cd frontend/datathon_project
npm install
```

## Step 4: Enable Email Auth (Optional)

In Supabase Dashboard:
1. Go to **Authentication** > **Providers**
2. Enable **Email** provider
3. Configure email templates if needed

## Database Schema

### profiles table
- `id` - UUID primary key
- `user_id` - References auth.users
- `email` - User email (unique)
- `username` - Optional username
- `password_hash` - Optional additional password hash
- `userhash` - ETH-style hash (0x...) for profile picture generation
- `name`, `phone`, `organization` - Additional profile fields
- `created_at`, `updated_at` - Timestamps

### predictions_history table
- `id` - UUID primary key
- `user_id` - References auth.users
- All prediction input fields (respiratory_rate, oxygen_saturation, etc.)
- `risk_level` - Predicted risk level
- `probabilities` - JSONB field for probability distribution
- `created_at` - Timestamp

## Features Included

✅ User authentication (sign up, sign in, sign out)
✅ Automatic profile creation on signup
✅ Row Level Security (users can only see their own data)
✅ Profile management
✅ Prediction history storage
✅ ETH-style userhash for profile pictures

