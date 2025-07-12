-- Manual user confirmation and status check
-- Run this in your Supabase SQL Editor

-- 1. Check current user status
SELECT 
  id, 
  email, 
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Manually confirm the most recent user (replace with your email if needed)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL 
AND email = 'YOUR_EMAIL_HERE';

-- 3. Check if the update worked
SELECT 
  email, 
  email_confirmed_at,
  'User is now confirmed' as status
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL
ORDER BY created_at DESC 
LIMIT 3;

-- 4. Also check if profile was created correctly
SELECT 
  p.id,
  p.email,
  p.name,
  u.email_confirmed_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 3;
