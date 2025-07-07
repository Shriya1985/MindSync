# 🚀 Supabase Database Setup Guide

## ✅ Environment Variables Configured

Your `.env` file has been created with your Supabase credentials.

## 📋 Required Database Tables

Your application needs these tables to work properly:

### Core Tables:

1. **`profiles`** - User profile information
2. **`user_stats`** - Points, levels, streaks
3. **`mood_entries`** - Daily mood tracking
4. **`journal_entries`** - User journal posts
5. **`chat_messages`** - Chatbot conversations
6. **`chat_sessions`** - Chat history sessions
7. **`achievements`** - User achievement badges
8. **`daily_quests`** - Daily challenges
9. **`point_activities`** - Point earning history

## 🛠️ Setup Instructions

### Option 1: Run Safe Migration (Recommended)

Copy and paste this SQL in your Supabase SQL Editor:

```sql
-- Copy the contents of supabase/migrations/002_safe_migration.sql
```

### Option 2: Manual Setup

If you want to set up tables manually, run each migration:

1. **Basic Schema**: Run `supabase/migrations/001_initial_schema.sql`
2. **Safe Updates**: Run `supabase/migrations/002_safe_migration.sql`

## 🔧 After Running Migration

1. ✅ **Restart your application** (already done)
2. ✅ **Check console** - Should show "🔧 Supabase configured: true"
3. ✅ **Test features**:
   - Sign up / Sign in
   - Add mood entries
   - Write journal entries
   - Use chatbot
   - Check dashboard

## 🎯 What to Expect

After migration, your app will:

- ✅ Store all data in Supabase (no more localStorage)
- ✅ Sync data across devices
- ✅ Enable real-time chat history
- ✅ Provide secure user authentication
- ✅ Track progress permanently

## 🐛 Troubleshooting

If you see errors:

1. Check if all tables were created successfully
2. Verify RLS policies are active
3. Ensure auth.users table exists
4. Check browser console for specific errors

## 🔍 Verify Setup

Run this query in Supabase SQL Editor to check:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:

- achievements
- chat_messages
- chat_sessions
- daily_quests
- journal_entries
- mood_entries
- point_activities
- profiles
- user_stats
