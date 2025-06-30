# 🚀 Xano Backend Setup Instructions

Follow these steps to set up your Xano backend for MindSync:

## 1. Create Xano Account

1. Go to [xano.com](https://xano.com)
2. Sign up for a free account
3. Create a new workspace
4. Choose your workspace name (e.g., "MindSync")

## 2. Create Database Tables

Create the following tables in Xano with these fields:

### **users** table:

- `id` (integer, auto-increment, primary key)
- `email` (text, unique)
- `name` (text)
- `avatar` (text, optional)
- `password` (text) - Xano will handle hashing
- `created_at` (datetime, auto-set on create)

### **user_stats** table:

- `id` (integer, auto-increment, primary key)
- `user_id` (integer, foreign key to users)
- `level` (integer, default: 1)
- `points` (integer, default: 0)
- `current_streak` (integer, default: 0)
- `longest_streak` (integer, default: 0)
- `last_activity` (date)
- `created_at` (datetime, auto-set on create)

### **mood_entries** table:

- `id` (integer, auto-increment, primary key)
- `user_id` (integer, foreign key to users)
- `date` (date)
- `mood` (text)
- `rating` (integer)
- `emoji` (text)
- `source` (text, optional)
- `notes` (text, optional)
- `created_at` (datetime, auto-set on create)

### **journal_entries** table:

- `id` (integer, auto-increment, primary key)
- `user_id` (integer, foreign key to users)
- `date` (date)
- `title` (text)
- `content` (text)
- `sentiment` (text, optional)
- `word_count` (integer, default: 0)
- `tags` (json, optional)
- `created_at` (datetime, auto-set on create)

### **chat_messages** table:

- `id` (integer, auto-increment, primary key)
- `user_id` (integer, foreign key to users)
- `content` (text)
- `sender` (text) // "user" or "ai"
- `sentiment` (text, optional)
- `mood` (text, optional)
- `emotional_state` (json, optional)
- `timestamp` (datetime)

### **achievements** table:

- `id` (integer, auto-increment, primary key)
- `user_id` (integer, foreign key to users)
- `achievement_type` (text)
- `achievement_id` (text)
- `title` (text)
- `description` (text)
- `icon` (text)
- `rarity` (text)
- `earned_at` (datetime)
- `metadata` (json, optional)

### **daily_quests** table:

- `id` (integer, auto-increment, primary key)
- `user_id` (integer, foreign key to users)
- `quest_id` (text)
- `title` (text)
- `description` (text)
- `category` (text)
- `xp_reward` (integer, default: 0)
- `completed_at` (datetime, optional)
- `date` (date)
- `created_at` (datetime, auto-set on create)

### **coping_sessions** table:

- `id` (integer, auto-increment, primary key)
- `user_id` (integer, foreign key to users)
- `strategy_id` (text)
- `strategy_title` (text)
- `duration_seconds` (integer, default: 0)
- `completed` (boolean, default: false)
- `xp_earned` (integer, default: 0)
- `session_date` (date)
- `created_at` (datetime, auto-set on create)

## 3. Create API Endpoints

In Xano's API Builder, create these endpoints:

### **Authentication Endpoints:**

1. **POST /auth/signup**

   - Input: `email`, `password`, `name`
   - Function: Create user + return auth token
   - Output: `authToken`, `user` object

2. **POST /auth/login**

   - Input: `email`, `password`
   - Function: Authenticate + return token
   - Output: `authToken`, `user` object

3. **POST /auth/logout**

   - Function: Invalidate token
   - Authentication: Required

4. **GET /auth/me**

   - Function: Get current user profile
   - Authentication: Required
   - Output: `user` object

5. **PATCH /auth/me**
   - Input: `name`, `avatar`
   - Function: Update user profile
   - Authentication: Required

### **Data Endpoints (all require authentication):**

1. **User Stats:**

   - `GET /user/stats` - Get user stats
   - `PATCH /user/stats` - Update user stats

2. **Mood Entries:**

   - `GET /mood-entries` - Get user's mood entries
   - `POST /mood-entries` - Create mood entry
   - `PATCH /mood-entries/{id}` - Update mood entry
   - `DELETE /mood-entries/{id}` - Delete mood entry

3. **Journal Entries:**

   - `GET /journal-entries` - Get user's journal entries
   - `POST /journal-entries` - Create journal entry
   - `PATCH /journal-entries/{id}` - Update journal entry
   - `DELETE /journal-entries/{id}` - Delete journal entry

4. **Chat Messages:**

   - `GET /chat-messages` - Get user's chat history
   - `POST /chat-messages` - Create chat message

5. **Achievements:**

   - `GET /achievements` - Get user's achievements
   - `POST /achievements` - Create achievement

6. **Daily Quests:**

   - `GET /daily-quests` - Get user's daily quests
   - `POST /daily-quests` - Create daily quest
   - `PATCH /daily-quests/{id}/complete` - Mark quest complete

7. **Coping Sessions:**
   - `GET /coping-sessions` - Get user's coping sessions
   - `POST /coping-sessions` - Create coping session

## 4. Configure Authentication

1. In Xano, go to **Settings** → **Authentication**
2. Enable JWT authentication
3. Set token expiration (e.g., 7 days)
4. Configure any additional security settings

## 5. Get Your API Base URL

1. Go to your Xano workspace
2. Navigate to **API** → **Settings**
3. Copy your **Base URL** (looks like: `https://x8ki-letl-twmt.xano.io/api:v1`)

## 6. Configure Environment Variables

Update your `client/.env` file:

```env
VITE_XANO_BASE_URL=https://your-workspace.xano.io/api:your-api-group
```

Replace with your actual Xano base URL.

## 7. Test the Connection

1. Restart your development server: `npm run dev`
2. Try creating a new account in your app
3. Check the Xano database to see if the user was created
4. Test login/logout functionality

## 8. Security Features

Your Xano backend now provides:

- ✅ **JWT Authentication** with secure token management
- ✅ **User isolation** - users only access their own data
- ✅ **Password hashing** handled automatically by Xano
- ✅ **Input validation** and sanitization
- ✅ **Rate limiting** and security headers
- ✅ **HTTPS encryption** for all API calls

## 9. Data Migration (Optional)

If you have existing data:

1. Export data using the "Export Data" feature in your app
2. Create a data import script for Xano
3. Or manually recreate important entries

## 🎉 Ready to Go!

Your MindSync app is now powered by Xano with:

- **Secure authentication** and user management
- **Scalable database** for all user data
- **RESTful API** endpoints for all operations
- **Production-ready** backend infrastructure
- **Real-time data** sync across devices

Your mental health platform now has enterprise-grade backend capabilities! 🧠✨
