-- Quick fix for the userhash generation function
-- Run this in your Supabase SQL Editor to fix the gen_random_bytes error

-- Drop and recreate the function with a simpler hash method
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

