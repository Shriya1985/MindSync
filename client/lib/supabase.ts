import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

// Debug: Log configuration (remove in production)
console.log("Supabase URL:", supabaseUrl);
console.log(
  "Supabase Key (first 20 chars):",
  supabaseAnonKey?.substring(0, 20) + "...",
);

// Validate configuration
if (!supabaseUrl || supabaseUrl === "https://your-project.supabase.co") {
  console.error("❌ VITE_SUPABASE_URL is not set properly in .env file");
}
if (!supabaseAnonKey || supabaseAnonKey === "your-anon-key") {
  console.error("❌ VITE_SUPABASE_ANON_KEY is not set properly in .env file");
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar?: string;
          updated_at?: string;
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
          last_activity: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          level?: number;
          points?: number;
          current_streak?: number;
          longest_streak?: number;
          last_activity?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          level?: number;
          points?: number;
          current_streak?: number;
          longest_streak?: number;
          last_activity?: string;
          updated_at?: string;
        };
      };
      mood_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          mood: string;
          rating: number;
          emoji: string;
          source?: string;
          notes?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          mood: string;
          rating: number;
          emoji: string;
          source?: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          date?: string;
          mood?: string;
          rating?: number;
          emoji?: string;
          source?: string;
          notes?: string;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          title: string;
          content: string;
          sentiment?: string;
          word_count: number;
          tags?: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          title: string;
          content: string;
          sentiment?: string;
          word_count?: number;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          date?: string;
          title?: string;
          content?: string;
          sentiment?: string;
          word_count?: number;
          tags?: string[];
          updated_at?: string;
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
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          sender: "user" | "ai";
          sentiment?: string;
          mood?: string;
          emotional_state?: any;
          timestamp?: string;
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
          achievement_type: string;
          achievement_id: string;
          title: string;
          description: string;
          icon: string;
          rarity: string;
          earned_at: string;
          metadata?: any;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_type: string;
          achievement_id: string;
          title: string;
          description: string;
          icon: string;
          rarity: string;
          earned_at?: string;
          metadata?: any;
        };
        Update: {
          title?: string;
          description?: string;
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
          id?: string;
          user_id: string;
          quest_id: string;
          title: string;
          description: string;
          category: string;
          xp_reward: number;
          completed_at?: string;
          date: string;
          created_at?: string;
        };
        Update: {
          completed_at?: string;
        };
      };
      coping_sessions: {
        Row: {
          id: string;
          user_id: string;
          strategy_id: string;
          strategy_title: string;
          duration_seconds: number;
          completed: boolean;
          xp_earned: number;
          session_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          strategy_id: string;
          strategy_title: string;
          duration_seconds: number;
          completed: boolean;
          xp_earned: number;
          session_date: string;
          created_at?: string;
        };
        Update: {
          duration_seconds?: number;
          completed?: boolean;
          xp_earned?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
