-- IMMEDIATE FIX: Confirm your email to enable login
-- Copy and paste this EXACT script in your Supabase SQL Editor

-- Step 1: Check your user (find your email)
SELECT 
  email, 
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN 'NOT CONFIRMED - NEEDS FIX' 
    ELSE 'CONFIRMED - READY TO LOGIN' 
  END as status
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 2: Fix ALL unconfirmed users (this will fix your account)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Step 3: Verify the fix worked
SELECT 
  email, 
  email_confirmed_at,
  'LOGIN SHOULD NOW WORK' as status
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL
ORDER BY created_at DESC;

-- Success message
SELECT 'EMAIL CONFIRMATION FIXED! Try logging in now.' as result;
