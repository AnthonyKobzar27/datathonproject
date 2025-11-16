-- Supabase Migration Scripts
-- Run these in your Supabase SQL Editor

-- ============================================
-- 1. Enable UUID extension (if not already enabled)
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. Create profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT, -- Optional: if you want to store additional password hash
  userhash TEXT UNIQUE NOT NULL, -- ETH-style hash for profile picture
  name TEXT,
  phone TEXT,
  organization TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. Create predictions_history table
-- ============================================
CREATE TABLE IF NOT EXISTS predictions_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  respiratory_rate NUMERIC NOT NULL,
  oxygen_saturation NUMERIC NOT NULL,
  o2_scale INTEGER NOT NULL,
  systolic_bp NUMERIC NOT NULL,
  heart_rate NUMERIC NOT NULL,
  temperature NUMERIC NOT NULL,
  consciousness TEXT NOT NULL,
  on_oxygen INTEGER NOT NULL,
  risk_level TEXT NOT NULL,
  probabilities JSONB, -- Store probability distribution as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions_history(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE predictions_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own predictions
CREATE POLICY "Users can view own predictions"
  ON predictions_history FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own predictions
CREATE POLICY "Users can insert own predictions"
  ON predictions_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own predictions
CREATE POLICY "Users can delete own predictions"
  ON predictions_history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. Function to automatically create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  eth_hash TEXT;
  random_part TEXT;
BEGIN
  -- Generate ETH-style hash (0x + 40 hex characters)
  -- Use MD5 hash of user ID + email + timestamp for uniqueness
  random_part := md5(NEW.id::text || NEW.email || extract(epoch from now())::text || random()::text);
  eth_hash := '0x' || substring(random_part from 1 for 40);
  
  INSERT INTO public.profiles (user_id, email, userhash)
  VALUES (
    NEW.id,
    NEW.email,
    eth_hash
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. Function to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

