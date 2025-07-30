import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { localStorageService } from "@/lib/localStorage";

export const diagnoseDynamicDataSync = async () => {
  console.log("🔍 === DATA SYNC DIAGNOSTIC REPORT ===");

  // 1. Check Environment Variables
  console.log("📋 Environment Check:");
  console.log(
    "  VITE_SUPABASE_URL:",
    import.meta.env.VITE_SUPABASE_URL || "NOT SET",
  );
  console.log(
    "  VITE_SUPABASE_ANON_KEY:",
    import.meta.env.VITE_SUPABASE_ANON_KEY ? "SET" : "NOT SET",
  );
  console.log("  isSupabaseConfigured:", isSupabaseConfigured);

  // 2. Check Supabase Connection
  if (isSupabaseConfigured) {
    console.log("🌐 Testing Supabase Connection...");
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);
      if (error) {
        console.log("❌ Supabase connection error:", error.message);
      } else {
        console.log("✅ Supabase connection successful");
      }
    } catch (err) {
      console.log("❌ Supabase connection failed:", err);
    }
  } else {
    console.log("⚠️ Supabase not configured - using localStorage fallback");
  }

  // 3. Check Current Auth State
  console.log("👤 Auth State Check:");
  try {
    if (isSupabaseConfigured) {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.log("❌ Auth session error:", error);
      } else {
        console.log(
          "🔐 Supabase session:",
          session ? `User ID: ${session.user.id}` : "No session",
        );
      }
    }

    const localUser = localStorageService.getCurrentUser();
    console.log(
      "💾 localStorage user:",
      localUser
        ? `Name: ${localUser.name}, Email: ${localUser.email}`
        : "No local user",
    );
  } catch (err) {
    console.log("❌ Auth check failed:", err);
  }

  // 4. Check Data Storage
  console.log("📊 Data Storage Check:");
  const localData = localStorageService.getAllUserData();
  console.log("💾 Local Data Counts:", {
    moodEntries: localData.moodEntries?.length || 0,
    journalEntries: localData.journalEntries?.length || 0,
    chatMessages: localData.chatMessages?.length || 0,
  });

  if (isSupabaseConfigured) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const userId = session.user.id;

        const [moodRes, journalRes, chatRes] = await Promise.all([
          supabase.from("mood_entries").select("id").eq("user_id", userId),
          supabase.from("journal_entries").select("id").eq("user_id", userId),
          supabase.from("chat_messages").select("id").eq("user_id", userId),
        ]);

        console.log("🌐 Supabase Data Counts:", {
          moodEntries: moodRes.data?.length || 0,
          journalEntries: journalRes.data?.length || 0,
          chatMessages: chatRes.data?.length || 0,
        });
      } else {
        console.log("🌐 No Supabase user session - cannot check data");
      }
    } catch (err) {
      console.log("❌ Supabase data check failed:", err);
    }
  }

  console.log("🏁 === DIAGNOSTIC COMPLETE ===");
};

export const forceSyncToSupabase = async () => {
  if (!isSupabaseConfigured) {
    console.log("❌ Cannot sync: Supabase not configured");
    return false;
  }

  try {
    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      console.log("❌ No active Supabase session");
      return false;
    }

    const userId = session.user.id;
    console.log("🔄 Starting force sync for user:", userId);

    // Get local data
    const localData = localStorageService.getAllUserData();
    let syncCount = 0;

    // Sync mood entries
    if (localData.moodEntries?.length > 0) {
      for (const entry of localData.moodEntries) {
        try {
          const { error } = await supabase.from("mood_entries").insert({
            user_id: userId,
            mood: entry.mood,
            rating: entry.rating,
            emoji: entry.emoji,
            notes: entry.notes || "",
            source: entry.source || "manual",
            date: entry.date,
          });

          if (!error) syncCount++;
        } catch (err) {
          console.log("⚠️ Failed to sync mood entry:", entry.mood);
        }
      }
    }

    // Sync journal entries
    if (localData.journalEntries?.length > 0) {
      for (const entry of localData.journalEntries) {
        try {
          const { error } = await supabase.from("journal_entries").insert({
            user_id: userId,
            title: entry.title,
            content: entry.content,
            sentiment: entry.sentiment,
            word_count: entry.wordCount || entry.content.split(" ").length,
            tags: entry.tags || [],
            date: entry.date,
          });

          if (!error) syncCount++;
        } catch (err) {
          console.log("⚠️ Failed to sync journal entry:", entry.title);
        }
      }
    }

    console.log(`✅ Sync complete! Synced ${syncCount} items to Supabase`);
    return true;
  } catch (error) {
    console.log("❌ Force sync failed:", error);
    return false;
  }
};

export const ensureSupabaseIsUsed = () => {
  console.log(
    "🔧 Checking why localStorage is being used instead of Supabase...",
  );

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log("Environment variables:", {
    url: envUrl || "MISSING",
    key: envKey ? "PRESENT" : "MISSING",
  });

  if (!envUrl || !envKey) {
    console.log("❌ Environment variables not loaded properly");
    console.log("💡 Try restarting the dev server");
    return false;
  }

  if (
    envUrl === "https://your-project-id.supabase.co" ||
    envKey === "your-anon-key-here"
  ) {
    console.log("❌ Environment variables contain placeholder values");
    return false;
  }

  console.log("✅ Environment variables look correct");
  console.log(
    "🔍 isSupabaseConfigured should be:",
    !!(
      envUrl &&
      envKey &&
      envUrl !== "https://your-project-id.supabase.co" &&
      envKey !== "your-anon-key-here"
    ),
  );

  return true;
};

export const clearLocalStorageAndForceSupabase = () => {
  console.log("🧹 Clearing localStorage and forcing Supabase usage...");

  // Clear all localStorage data
  const keysToRemove = [
    "mindsync_current_user",
    "mindsync_users",
    "mindsync_user_stats",
    "mindsync_mood_entries",
    "mindsync_journal_entries",
    "mindsync_chat_messages",
    "mindsync_achievements",
    "mindsync_daily_quests",
    "mindsync_coping_sessions",
  ];

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed ${key}`);
  });

  // Clear session storage too
  sessionStorage.clear();

  console.log("✅ All local storage cleared");
  console.log("🔄 Please refresh the page to force Supabase usage");

  return true;
};
