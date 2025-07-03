import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
