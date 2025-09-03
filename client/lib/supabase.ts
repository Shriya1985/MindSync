import { createClient } from "@supabase/supabase-js";

// Read Supabase credentials from environment only (no hardcoded fallbacks)
const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envSupabaseAnonKey = import.meta.env
  .VITE_SUPABASE_ANON_KEY as string | undefined;

// Configured only when both env vars are present
export const isSupabaseConfigured = Boolean(
  envSupabaseUrl && envSupabaseAnonKey,
);

console.log("🔧 Supabase configured:", isSupabaseConfigured);
if (isSupabaseConfigured) {
  console.log("🔗 Supabase URL:", envSupabaseUrl);
} else {
  console.warn(
    "Supabase env vars missing. App will run in offline mode until configured.",
  );
}

// Create a fallback client for when Supabase isn't configured
const createFallbackClient = () => {
  console.warn(
    "🔧 Supabase not configured. Using local-only mode with graceful fallbacks.",
  );

  return {
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () =>
        Promise.resolve({
          data: { user: null },
          error: { message: "Supabase not configured" },
        }),
      signUp: () =>
        Promise.resolve({
          data: { user: null },
          error: { message: "Supabase not configured" },
        }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: null,
              error: { message: "Supabase not configured" },
            }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () =>
            Promise.resolve({
              data: null,
              error: { message: "Supabase not configured" },
            }),
        }),
      }),
      update: () => ({
        eq: () =>
          Promise.resolve({ error: { message: "Supabase not configured" } }),
      }),
      delete: () => ({
        eq: () =>
          Promise.resolve({ error: { message: "Supabase not configured" } }),
      }),
    }),
  } as any;
};

export const supabase = isSupabaseConfigured
  ? createClient(envSupabaseUrl!, envSupabaseAnonKey!, {
      auth: {
        persistSession: true,
        storage: window.localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        storageKey: "mindsync-auth",
        debug: false,
      },
      db: {
        schema: "public",
      },
      global: {
        headers: {
          "X-Client-Info": "mindsync-app",
        },
      },
      realtime: {
        params: {
          eventsPerSecond: 2,
        },
      },
    })
  : createFallbackClient();

// Proactively clean up invalid or partial sessions to avoid refresh errors
const AUTH_STORAGE_KEYS = ["mindsync-auth"];
const clearSupabaseAuthStorage = () => {
  try {
    AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    Object.keys(localStorage)
      .filter((k) => k.startsWith("sb-") && k.endsWith("-auth-token"))
      .forEach((k) => localStorage.removeItem(k));
    console.log("🧹 Cleared invalid Supabase auth storage");
  } catch (e) {
    console.warn("Failed to clear Supabase auth storage", e);
  }
};

const ensureValidSession = () => {
  try {
    const raw = localStorage.getItem("mindsync-auth");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const refreshToken = parsed?.currentSession?.refresh_token;
    const accessToken = parsed?.currentSession?.access_token;
    if (!refreshToken || !accessToken) {
      clearSupabaseAuthStorage();
    }
  } catch (e) {
    clearSupabaseAuthStorage();
  }
};

if (typeof window !== "undefined") {
  ensureValidSession();
}

// Safe wrappers to guard against invalid refresh token crashes
export const safeGetSession = async (): Promise<any> => {
  try {
    return await supabase.auth.getSession();
  } catch (e: any) {
    const msg = e?.message || "";
    if (
      msg.includes("Invalid Refresh Token") ||
      msg.includes("Refresh Token Not Found")
    ) {
      clearSupabaseAuthStorage();
      try {
        await supabase.auth.signOut();
      } catch {}
      return { data: { session: null }, error: null };
    }
    throw e;
  }
};

export const safeGetUser = async (): Promise<any> => {
  try {
    return await supabase.auth.getUser();
  } catch (e: any) {
    const msg = e?.message || "";
    if (
      msg.includes("Invalid Refresh Token") ||
      msg.includes("Refresh Token Not Found")
    ) {
      clearSupabaseAuthStorage();
      try {
        await supabase.auth.signOut();
      } catch {}
      return { data: { user: null }, error: null };
    }
    throw e;
  }
};

// Test Supabase connection with timeout
export const testSupabaseConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    console.log("❌ Supabase not configured");
    return false;
  }

  try {
    console.log("🔍 Testing Supabase connection...");

    const connectionPromise = supabase.from("profiles").select("id").limit(1);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Connection timeout after 12s")), 12000),
    );

    const { data, error } = (await Promise.race([
      connectionPromise,
      timeoutPromise,
    ])) as any;

    if (error) {
      console.error("❌ Supabase connection test failed:", error.message);
      if (
        error.message.includes("RLS") ||
        error.message.includes("policy") ||
        error.message.includes("JWT")
      ) {
        console.log("✅ Supabase connection successful (RLS active)");
        return true;
      }
      return false;
    }

    console.log("✅ Supabase connection successful");
    return true;
  } catch (error: any) {
    if (error.message?.includes("timeout")) {
      console.error("❌ Supabase connection timeout - check network/CORS");
    } else {
      console.error("❌ Supabase connection test error:", error);
    }
    return false;
  }
};

// Force sync data to ensure changes reflect in Supabase
export const forceSyncToSupabase = async (userId: string) => {
  if (!isSupabaseConfigured || !userId) return false;

  try {
    const { data: sessionData } = await safeGetSession();
    const sessionUserId = sessionData?.session?.user?.id;
    if (!sessionUserId) {
      console.warn("⚠️ Skipping sync: no Supabase session");
      return false;
    }
    if (sessionUserId !== userId) {
      console.warn("⚠️ Skipping sync: session/user mismatch", {
        sessionUserId,
        userId,
      });
      return false;
    }

    console.log("🔄 Force syncing data to Supabase for user:", userId);

    const { error } = await supabase.from("user_stats").upsert(
      {
        user_id: userId,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

    if (error) {
      console.error("❌ Sync failed:", error.message);
      return false;
    }

    console.log("✅ Data successfully synced to Supabase");
    return true;
  } catch (error) {
    console.error("❌ Sync error:", error);
    return false;
  }
};

// Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          bio?: string;
          created_at: string;
          updated_at: string;
          preferences: any;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          bio?: string;
          preferences?: any;
        };
        Update: {
          email?: string;
          name?: string;
          avatar_url?: string;
          bio?: string;
          preferences?: any;
        };
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          level: number;
          points: number;
          current_streak: number;
          longest_streak: number;
          total_entries: number;
          total_words: number;
          last_activity: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          level?: number;
          points?: number;
          current_streak?: number;
          longest_streak?: number;
          total_entries?: number;
          total_words?: number;
          last_activity?: string;
        };
        Update: {
          level?: number;
          points?: number;
          current_streak?: number;
          longest_streak?: number;
          total_entries?: number;
          total_words?: number;
          last_activity?: string;
        };
      };
      mood_entries: {
        Row: {
          id: string;
          user_id: string;
          mood: string;
          rating: number;
          emoji: string;
          notes?: string;
          source?: string;
          date: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          mood: string;
          rating: number;
          emoji: string;
          notes?: string;
          source?: string;
          date: string;
        };
        Update: {
          mood?: string;
          rating?: number;
          emoji?: string;
          notes?: string;
          source?: string;
          date?: string;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          sentiment?: string;
          word_count: number;
          tags?: string[];
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          content: string;
          sentiment?: string;
          word_count: number;
          tags?: string[];
          date: string;
        };
        Update: {
          title?: string;
          content?: string;
          sentiment?: string;
          word_count?: number;
          tags?: string[];
          date?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          sender: "user" | "ai";
          sentiment?: string;
          mood?: string;
          emotional_state?: any;
          created_at: string;
        };
        Insert: {
          user_id: string;
          content: string;
          sender: "user" | "ai";
          sentiment?: string;
          mood?: string;
          emotional_state?: any;
        };
        Update: {
          content?: string;
          sentiment?: string;
          mood?: string;
          emotional_state?: any;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          type: string;
          title: string;
          description: string;
          icon: string;
          rarity: string;
          metadata?: any;
          earned_at: string;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          type: string;
          title: string;
          description: string;
          icon: string;
          rarity: string;
          metadata?: any;
        };
        Update: {
          metadata?: any;
        };
      };
      daily_quests: {
        Row: {
          id: string;
          user_id: string;
          quest_id: string;
          title: string;
          description: string;
          category: string;
          xp_reward: number;
          completed_at?: string;
          date: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          quest_id: string;
          title: string;
          description: string;
          category: string;
          xp_reward: number;
          completed_at?: string;
          date: string;
        };
        Update: {
          completed_at?: string;
        };
      };
      point_activities: {
        Row: {
          id: string;
          user_id: string;
          points: number;
          activity: string;
          source: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          points: number;
          activity: string;
          source: string;
        };
        Update: never;
      };
    };
  };
}
