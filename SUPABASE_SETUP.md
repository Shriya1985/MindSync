# 🗄️ Supabase Database Setup Instructions

Follow these steps to set up your Supabase database for MindSync:

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `mindsync-db` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

## 2. Get Project Credentials

Once your project is created:

1. Go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Project API Keys** > **anon public** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 3. Configure Environment Variables

1. Create a `.env` file in the `client` folder:

   ```bash
   touch client/.env
   ```

2. Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 4. Create Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `client/lib/database-schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:

- All necessary tables (users, mood_entries, journal_entries, etc.)
- Row Level Security policies (users can only access their own data)
- Automatic triggers for timestamps
- Indexes for better performance
- A function to auto-create user profiles on signup

## 5. Configure Authentication

1. Go to **Authentication** > **Settings**
2. Configure email settings:
   - **Enable email confirmations**: Recommended for production
   - **Custom SMTP**: Optional, for custom email provider
3. Go to **Authentication** > **Providers**
4. Configure OAuth providers if desired (Google, GitHub, etc.)

## 6. Test the Connection

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Try to register a new account
3. Check the **Authentication** > **Users** tab in Supabase to see if the user was created
4. Check the **Table Editor** to see if user profile and stats were created automatically

## 7. Row Level Security (RLS)

Your database is automatically secured with RLS policies that ensure:

- Users can only access their own data
- No cross-user data leakage
- Automatic user isolation

## 8. Database Tables Created

### Core Tables:

- **users** - User profiles and basic info
- **user_stats** - Gamification stats (level, points, streaks)
- **mood_entries** - Daily mood tracking
- **journal_entries** - Journal entries with sentiment analysis
- **chat_messages** - AI chatbot conversation history
- **achievements** - Earned badges and milestones
- **daily_quests** - Daily challenges and completion status
- **coping_sessions** - Technique practice sessions

### Features:

- ✅ **Automatic user profile creation** on signup
- ✅ **Row Level Security** - users only see their own data
- ✅ **Real-time subscriptions** ready (if needed later)
- ✅ **Automatic timestamps** for created_at/updated_at
- ✅ **Performance indexes** on commonly queried fields
- ✅ **Data integrity** with foreign key constraints

## 9. Data Migration (Optional)

If you have existing localStorage data you want to migrate:

1. Export your current data using the "Export Data" feature in the profile
2. The new system will automatically start fresh
3. You can manually import important entries if needed

## 10. Production Considerations

For production deployment:

- Set up proper email templates in **Authentication** > **Templates**
- Configure custom domain if desired
- Set up database backups
- Monitor usage in **Settings** > **Usage**
- Consider upgrading to Pro plan for more resources

## 🔒 Security Features

Your data is now:

- **End-to-end secured** with RLS policies
- **Automatically backed up** by Supabase
- **Scalable** to thousands of users
- **GDPR compliant** with built-in data protection

## 🚀 Ready to Go!

Once setup is complete, your MindSync app will:

- Store all user data securely in PostgreSQL
- Support real-time features
- Scale automatically
- Provide detailed analytics capabilities
- Maintain data integrity across all features

Your mental health platform is now powered by a production-ready database! 🧠✨
