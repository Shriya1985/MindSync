import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "https://your-project-id.supabase.co" &&
  supabaseAnonKey !== "your-anon-key-here"
);

console.log("🔧 Supabase configured:", isSupabaseConfigured);

// Create a fallback client for development
const createFallbackClient = () => {
  console.warn(
    "🔧 Supabase not configured. Using development mode with localStorage fallback.\n" +
      "To enable database features:\n" +
      "1. Create a Supabase project at https://supabase.com\n" +
      "2. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file\n" +
      "3. Run the database migration from SUPABASE_SETUP.md",
  );

  // Return a mock client that won't crash the app
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
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        storage: window.localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // Make session more persistent
        storageKey: 'mindsync-auth',
        // Prevent automatic logout on tab changes
        debug: false,
      },
    })
  : createFallbackClient();

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
