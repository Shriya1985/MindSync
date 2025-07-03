# MindSync - Supabase Database Setup Guide

This guide will walk you through setting up Supabase as the backend database for your MindSync mental health application.

## 🚀 **Quick Setup Steps**

### 1. **Create Supabase Project**

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `mindsync-app`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait for the project to be created (2-3 minutes)

### 2. **Get Your Project Credentials**

1. In your Supabase dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Project API Key** (anon/public key)

### 3. **Configure Environment Variables**

1. In your project root, create a `.env` file:

```bash
cp client/.env.example client/.env
```

2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. **Run Database Migration**

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
3. Paste it into the SQL editor
4. Click **Run** to execute the migration
5. You should see "Success" message

### 5. **Verify Setup**

1. Go to **Table Editor** in Supabase dashboard
2. You should see 8 tables created:
   - `profiles`
   - `user_stats`
   - `mood_entries`
   - `journal_entries`
   - `chat_messages`
   - `achievements`
   - `daily_quests`
   - `point_activities`

### 6. **Test the Application**

1. Start your development server:

```bash
cd client
npm run dev
```

2. Navigate to `/auth` and create a new account
3. Verify that user profile and stats are created automatically
4. Test adding mood entries, journal entries, etc.

---

## 📊 **Database Schema Overview**

### **Tables Created**

| Table              | Purpose                            | Key Features                    |
| ------------------ | ---------------------------------- | ------------------------------- |
| `profiles`         | User profiles extending auth.users | Name, avatar, bio, preferences  |
| `user_stats`       | Points, levels, streaks            | Real-time XP tracking           |
| `mood_entries`     | Daily mood logs                    | Emoji, rating, notes            |
| `journal_entries`  | Personal journal entries           | Content, sentiment analysis     |
| `chat_messages`    | AI chatbot conversations           | User/AI messages, context       |
| `achievements`     | Badges and milestones              | Gamification system             |
| `daily_quests`     | Self-care challenges               | XP rewards, completion tracking |
| `point_activities` | Points history log                 | Activity tracking, leaderboards |

### **Security Features**

✅ **Row Level Security (RLS)** enabled on all tables  
✅ **User isolation** - users can only access their own data  
✅ **Automatic user creation** via database triggers  
✅ **Data validation** with CHECK constraints  
✅ **Indexed queries** for optimal performance

---

## 🔧 **Advanced Configuration**

### **Enable Email Authentication**

1. Go to **Authentication > Settings**
2. Configure email settings:
   - **Email confirmation**: Enable for production
   - **Custom SMTP**: Configure your email provider
   - **Email templates**: Customize signup/reset emails

### **Setup Database Backups**

1. Go to **Settings > Database**
2. Enable **Point-in-time Recovery**
3. Configure **Backup schedule**

### **Monitor Performance**

1. Go to **Reports** to monitor:
   - Database usage
   - API requests
   - User authentication
   - Query performance

### **Optional: Setup Realtime**

For live chat or real-time updates:

1. Go to **Database > Replication**
2. Enable realtime for specific tables:

```sql
-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
```

---

## 🚨 **Production Checklist**

### **Before Going Live:**

- [ ] Enable email confirmation
- [ ] Setup custom email templates
- [ ] Configure custom domain
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Review and test RLS policies
- [ ] Configure rate limiting
- [ ] Setup SSL certificates
- [ ] Test user registration flow
- [ ] Test data synchronization across devices

### **Security Best Practices:**

- [ ] Use environment variables for all secrets
- [ ] Enable 2FA on Supabase account
- [ ] Regularly rotate API keys
- [ ] Monitor authentication logs
- [ ] Set up database usage alerts
- [ ] Review access patterns regularly

---

## 🔍 **Testing Database Integration**

### **Test User Flow:**

1. **Registration**: Create new account
2. **Profile**: Update user profile
3. **Mood Tracking**: Add mood entries
4. **Journaling**: Create journal entries
5. **Chat**: Send messages to AI
6. **Quests**: Complete daily quests
7. **Points**: Verify XP tracking
8. **Cross-device**: Login from different browser

### **Verify Data Persistence:**

1. Create test data in the app
2. Logout and login again
3. Verify all data is preserved
4. Check Supabase dashboard for data

---

## 🆘 **Troubleshooting**

### **Common Issues:**

**1. Environment Variables Not Loading**

```bash
# Make sure .env file is in client/ directory
# Restart development server after changes
npm run dev
```

**2. Authentication Errors**

- Check project URL and API key
- Verify RLS policies are applied
- Check Supabase dashboard logs

**3. Database Connection Issues**

- Verify project is active in Supabase
- Check internet connection
- Review Supabase status page

**4. Migration Errors**

- Ensure clean database before running migration
- Run migration commands one by one if needed
- Check for syntax errors in SQL

### **Getting Help:**

1. **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
2. **Community**: [https://github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
3. **Support**: Contact Supabase support for project-specific issues

---

## ✅ **Setup Complete!**

Your MindSync application now has:

🗄️ **Secure Database** with user authentication  
🔄 **Cross-device Sync** for all user data  
🛡️ **Row Level Security** protecting user privacy  
📊 **Scalable Infrastructure** ready for production  
🚀 **Real-time Updates** for dynamic features

Your users can now:

- Register/login securely
- Access their data from any device
- Have all interactions saved automatically
- Enjoy a seamless, persistent experience

**Next Steps:**

- Test thoroughly with multiple users
- Monitor usage and performance
- Plan for scaling as you grow
- Consider adding advanced features like real-time chat
