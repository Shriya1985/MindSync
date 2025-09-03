import { createContext, useContext, useEffect, useState } from "react";
import {
  supabase,
  isSupabaseConfigured,
  testSupabaseConnection,
  forceSyncToSupabase,
  safeGetSession,
} from "@/lib/supabase";
import { localStorageService } from "@/lib/localStorage";
import { AuthContext } from "@/contexts/AuthContext";
import { showNotification } from "@/components/ui/notification-system";
import { processJournalEntry } from "@/utils/journalMoodAnalysis";
import type { ChatSession } from "@/utils/chatSessions";

// Types
export type MoodEntry = {
  id: string;
  date: string;
  mood: string;
  rating: number;
  emoji: string;
  source?: string;
  notes?: string;
};

export type JournalEntry = {
  id: string;
  date: string;
  title: string;
  content: string;
  sentiment?: "positive" | "negative" | "neutral";
  wordCount: number;
  tags?: string[];
};

export type ChatMessage = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  sentiment?: "positive" | "negative" | "neutral";
  mood?: string;
  emotionalState?: any;
};

export type Achievement = {
  id: string;
  type: "streak" | "milestone" | "activity" | "level" | "special";
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earnedAt: Date;
  metadata?: any;
};

export type UserStats = {
  level: number;
  points: number;
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
  totalWords: number;
  lastActivity: string;
};

export type DailyQuest = {
  id: string;
  questId: string;
  title: string;
  description: string;
  category: string;
  xpReward: number;
  completedAt?: Date;
  date: string;
};

export type CopingSession = {
  id: string;
  strategyId: string;
  strategyTitle: string;
  durationSeconds: number;
  completed: boolean;
  xpEarned: number;
  sessionDate: string;
};

export type PointActivity = {
  id: string;
  points: number;
  activity: string;
  source: string;
  createdAt: Date;
};

type DataContextType = {
  // Data
  moodEntries: MoodEntry[];
  journalEntries: JournalEntry[];
  chatMessages: ChatMessage[];
  chatSessions: ChatSession[];
  achievements: Achievement[];
  userStats: UserStats;
  dailyQuests: DailyQuest[];
  copingSessions: CopingSession[];
  pointActivities: PointActivity[];
  currentSessionId: string | null;

  // Loading states
  isLoading: boolean;
  isInitialized: boolean;

  // Mood functions
  addMoodEntry: (entry: Omit<MoodEntry, "id">) => Promise<void>;
  updateMoodEntry: (id: string, updates: Partial<MoodEntry>) => Promise<void>;
  deleteMoodEntry: (id: string) => Promise<void>;

  // Journal functions
  addJournalEntry: (entry: Omit<JournalEntry, "id">) => Promise<void>;
  updateJournalEntry: (
    id: string,
    updates: Partial<JournalEntry>,
  ) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;

  // Chat functions
  addChatMessage: (
    message: Omit<ChatMessage, "id" | "timestamp">,
    sessionId?: string,
  ) => Promise<void>;
  clearChatHistory: () => Promise<void>;

  // Session functions
  createChatSession: (title?: string) => Promise<string>;
  getChatSessions: () => ChatSession[];
  loadChatSession: (sessionId: string) => Promise<void>;
  deleteChatSession: (sessionId: string) => Promise<void>;
  getCurrentSessionMessages: () => ChatMessage[];
  getRecentChatContext: () => ChatMessage[];

  // Achievement functions
  addAchievement: (
    achievement: Omit<Achievement, "id" | "earnedAt">,
  ) => Promise<void>;

  // Points and progress functions
  addPoints: (
    points: number,
    activity: string,
    source?: string,
  ) => Promise<void>;
  updateStreak: () => Promise<void>;

  // Quest functions
  addDailyQuest: (quest: Omit<DailyQuest, "id">) => Promise<void>;
  completeDailyQuest: (questId: string) => Promise<void>;

  // Utility functions
  getStreakInfo: () => { current: number; longest: number };
  exportData: () => any;

  // Connection and sync functions
  testConnection: () => Promise<boolean>;
  forceSync: () => Promise<boolean>;
  runDatabaseDiagnostics: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    console.error("🚨 useData called outside DataProvider context!");
    console.error("Component tree:", new Error().stack);
    console.error("Make sure the component is wrapped in <DataProvider>");
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

type DataProviderProps = {
  children: React.ReactNode;
};

export function DataProvider({ children }: DataProviderProps) {
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;
  const isAuthenticated = authContext?.isAuthenticated || false;
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    points: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalEntries: 0,
    totalWords: 0,
    lastActivity: new Date().toISOString(),
  });
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [copingSessions, setCopingSessions] = useState<CopingSession[]>([]);
  const [pointActivities, setPointActivities] = useState<PointActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Load all user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Enforce Supabase-only operation
      if (isSupabaseConfigured) {
        loadAllData();
      } else {
        console.error(
          "❌ Supabase not configured. Cannot operate without database.",
        );
        showNotification({
          type: "encouragement",
          title: "Database Required",
          message: "Please configure Supabase to use the application.",
          duration: 10000,
        });
      }
    } else {
      // Clear data when not authenticated
      clearAllData();
    }
  }, [isAuthenticated, user]);

  const loadAllData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Test connection first
      console.log("🔍 Testing Supabase connection...");
      const connectionStatus = await testSupabaseConnection();
      setIsConnected(connectionStatus);

      if (connectionStatus) {
        // Ensure we have an authenticated Supabase session before DB ops
        const { data: sessionData } = await safeGetSession();
        const sessionUserId = sessionData?.session?.user?.id;
        if (!sessionUserId) {
          console.warn(
            "⚠️ Connected but not authenticated with Supabase; re-authenticating",
          );
          setIsConnected(false);
          // Force user to re-authenticate instead of falling back
          showNotification({
            type: "encouragement",
            title: "Authentication Required",
            message: "Please sign in again to sync your data.",
            duration: 5000,
          });
          return;
        }
        if (sessionUserId !== user.id) {
          console.warn(
            "⚠️ Session user does not match app user; clearing session",
            { sessionUserId, appUserId: user.id },
          );
          setIsConnected(false);
          // Clear invalid session and force re-auth
          try {
            await supabase.auth.signOut();
          } catch (e) {}
          showNotification({
            type: "encouragement",
            title: "Session Mismatch",
            message: "Please sign in again to access your data.",
            duration: 5000,
          });
          return;
        }

        console.log("✅ Supabase connected, loading data from database");
        console.log("👤 Loading data for user:", user.id);

        // Force sync to ensure user data exists
        const syncSuccess = await forceSyncToSupabase(user.id);
        if (syncSuccess) {
          setLastSyncTime(new Date());
          console.log("🔄 User stats synchronized");
        }

        // Load data with individual error handling
        const dataLoadResults = await Promise.allSettled([
          loadMoodEntries(),
          loadJournalEntries(),
          loadChatMessages(),
          loadAchievements(),
          loadUserStats(),
          loadDailyQuests(),
          loadPointActivities(),
        ]);

        // Check for any failed data loads
        const failedLoads = dataLoadResults.filter(
          (result) => result.status === "rejected",
        );
        const successfulLoads = dataLoadResults.filter(
          (result) => result.status === "fulfilled",
        );

        console.log(
          `📊 Data load summary: ${successfulLoads.length} successful, ${failedLoads.length} failed`,
        );

        if (failedLoads.length === 0) {
          console.log("✅ Database Connected: All data loaded successfully");
        } else {
          console.log("⚠️ Some data loads failed:", failedLoads);
          // Only show partial load issues if there are actual problems
          showNotification({
            type: "encouragement",
            title: "Data Sync Issue",
            message: `Some data couldn't load from database. Using offline mode.`,
            duration: 4000,
          });
        }
      } else {
        console.error("❌ Supabase connection failed - retrying in 3 seconds...");
        setIsConnected(false);

        showNotification({
          type: "encouragement",
          title: "Connection Failed",
          message: "Unable to connect to database. Retrying...",
          duration: 3000,
        });

        // Retry connection after 3 seconds
        setTimeout(() => {
          if (user && isAuthenticated) {
            console.log("🔄 Retrying Supabase connection...");
            loadAllData();
          }
        }, 3000);
        return;
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };


  const clearAllData = () => {
    setMoodEntries([]);
    setJournalEntries([]);
    setChatMessages([]);
    setAchievements([]);
    setUserStats({
      level: 1,
      points: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalEntries: 0,
      totalWords: 0,
      lastActivity: new Date().toISOString(),
    });
    setDailyQuests([]);
    setCopingSessions([]);
    setPointActivities([]);
    setIsInitialized(false);
  };

  const loadMoodEntries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("❌ Error loading mood entries:", {
        code: error.code || "UNKNOWN",
        message: error.message || "Unknown error",
        details: error.details || "No details available",
        hint: error.hint || "No hint available",
        fullError: error,
      });

      // Only show error notifications in development or for critical issues
      if (
        import.meta.env.DEV ||
        error.code === "PGRST116" ||
        error.message?.includes("permission")
      ) {
        showNotification({
          type: "encouragement",
          title: "Data Issue",
          message: "Using offline mode while resolving connection",
          duration: 3000,
        });
      }

      // Set empty array as fallback
      setMoodEntries([]);
      return;
    }

    const mappedEntries: MoodEntry[] = data.map((entry) => ({
      id: entry.id,
      date: entry.date,
      mood: entry.mood,
      rating: entry.rating,
      emoji: entry.emoji,
      source: entry.source,
      notes: entry.notes,
    }));

    setMoodEntries(mappedEntries);
  };

  const loadJournalEntries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("❌ Error loading journal entries:", {
        code: error.code || "UNKNOWN",
        message: error.message || "Unknown error",
        details: error.details || "No details available",
        hint: error.hint || "No hint available",
        fullError: error,
      });

      if (
        import.meta.env.DEV ||
        error.code === "PGRST116" ||
        error.message?.includes("permission")
      ) {
        showNotification({
          type: "encouragement",
          title: "Data Issue",
          message: "Using offline mode while resolving connection",
          duration: 3000,
        });
      }

      // Set empty array as fallback
      setJournalEntries([]);
      return;
    }

    const mappedEntries: JournalEntry[] = data.map((entry) => ({
      id: entry.id,
      date: entry.date,
      title: entry.title,
      content: entry.content,
      sentiment: entry.sentiment,
      wordCount: entry.word_count,
      tags: entry.tags || [],
    }));

    setJournalEntries(mappedEntries);
  };

  const loadChatMessages = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Error loading chat messages:", {
        code: error.code || "UNKNOWN",
        message: error.message || "Unknown error",
        details: error.details || "No details available",
        hint: error.hint || "No hint available",
        fullError: error,
      });

      if (
        import.meta.env.DEV ||
        error.code === "PGRST116" ||
        error.message?.includes("permission")
      ) {
        showNotification({
          type: "encouragement",
          title: "Data Issue",
          message: "Using offline mode while resolving connection",
          duration: 3000,
        });
      }

      // Set empty array as fallback
      setChatMessages([]);
      return;
    }

    const mappedMessages: ChatMessage[] = data.map((message) => ({
      id: message.id,
      content: message.content,
      sender: message.sender as "user" | "ai",
      timestamp: new Date(message.created_at),
      sentiment: message.sentiment,
      mood: message.mood,
      emotionalState: message.emotional_state,
    }));

    setChatMessages(mappedMessages);
  };

  const loadAchievements = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", user.id)
      .order("earned_at", { ascending: false });

    if (error) {
      console.error("❌ Error loading achievements:", {
        code: error.code || "UNKNOWN",
        message: error.message || "Unknown error",
        details: error.details || "No details available",
        hint: error.hint || "No hint available",
        fullError: error,
      });

      if (
        import.meta.env.DEV ||
        error.code === "PGRST116" ||
        error.message?.includes("permission")
      ) {
        showNotification({
          type: "encouragement",
          title: "Data Issue",
          message: "Using offline mode while resolving connection",
          duration: 3000,
        });
      }

      // Set empty array as fallback
      setAchievements([]);
      return;
    }

    const mappedAchievements: Achievement[] = data.map((achievement) => ({
      id: achievement.id,
      type: achievement.type as any,
      achievementId: achievement.achievement_id,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      rarity: achievement.rarity as any,
      earnedAt: new Date(achievement.earned_at),
      metadata: achievement.metadata,
    }));

    setAchievements(mappedAchievements);
  };

  const loadUserStats = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      const readable = `${error.message || error.code || "Unknown error"}`;
      console.error("❌ Error loading user stats:", readable, {
        code: error.code || "UNKNOWN",
        message: error.message || "Unknown error",
        details: error.details || "No details available",
        hint: error.hint || "No hint available",
      });

      if (
        import.meta.env.DEV ||
        error.code === "PGRST116" ||
        error.message?.includes("permission")
      ) {
        showNotification({
          type: "encouragement",
          title: "Data Issue",
          message: "Using offline mode while resolving connection",
          duration: 3000,
        });
      }

      // Use default stats as fallback
      setUserStats({
        level: 1,
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalEntries: 0,
        totalWords: 0,
        lastActivity: new Date().toISOString(),
      });
      return;
    }

    if (data) {
      setUserStats({
        level: data.level,
        points: data.points,
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        totalEntries: data.total_entries,
        totalWords: data.total_words,
        lastActivity: data.last_activity,
      });
    }
  };

  const loadDailyQuests = async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("daily_quests")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Error loading daily quests:", {
        code: error.code || "UNKNOWN",
        message: error.message || "Unknown error",
        details: error.details || "No details available",
        hint: error.hint || "No hint available",
        fullError: error,
      });

      if (
        import.meta.env.DEV ||
        error.code === "PGRST116" ||
        error.message?.includes("permission")
      ) {
        showNotification({
          type: "encouragement",
          title: "Data Issue",
          message: "Using offline mode while resolving connection",
          duration: 3000,
        });
      }

      // Set empty array as fallback
      setDailyQuests([]);
      return;
    }

    const mappedQuests: DailyQuest[] = data.map((quest) => ({
      id: quest.id,
      questId: quest.quest_id,
      title: quest.title,
      description: quest.description,
      category: quest.category,
      xpReward: quest.xp_reward,
      completedAt: quest.completed_at
        ? new Date(quest.completed_at)
        : undefined,
      date: quest.date,
    }));

    setDailyQuests(mappedQuests);
  };

  const loadPointActivities = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("point_activities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50); // Load recent activities

    if (error) {
      console.error("❌ Error loading point activities:", {
        code: error.code || "UNKNOWN",
        message: error.message || "Unknown error",
        details: error.details || "No details available",
        hint: error.hint || "No hint available",
        fullError: error,
      });

      if (
        import.meta.env.DEV ||
        error.code === "PGRST116" ||
        error.message?.includes("permission")
      ) {
        showNotification({
          type: "encouragement",
          title: "Data Issue",
          message: "Using offline mode while resolving connection",
          duration: 3000,
        });
      }

      // Set empty array as fallback
      setPointActivities([]);
      return;
    }

    const mappedActivities: PointActivity[] = data.map((activity) => ({
      id: activity.id,
      points: activity.points,
      activity: activity.activity,
      source: activity.source,
      createdAt: new Date(activity.created_at),
    }));

    setPointActivities(mappedActivities);
  };

  // Mood entry functions
  const addMoodEntry = async (entry: Omit<MoodEntry, "id">) => {
    if (!user) return;

    console.log("📝 Adding mood entry:", entry);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("mood_entries")
          .insert({
            user_id: user.id,
            mood: entry.mood,
            rating: entry.rating,
            emoji: entry.emoji,
            source: entry.source,
            notes: entry.notes,
            date: entry.date,
          })
          .select()
          .single();

        if (error) {
          console.error("❌ Error adding mood entry to Supabase:", {
            code: error.code,
            message: error.message,
            details: error.details,
          });

          // Fallback to localStorage with notification
          showNotification({
            type: "encouragement",
            title: "Saved Locally",
            message: "Mood saved offline - will sync when connection restored",
            duration: 3000,
          });

          const result = await localStorageService.addMoodEntry(entry);
          if (result) {
            setMoodEntries((prev) => [
              result,
              ...(Array.isArray(prev) ? prev : []),
            ]);
            await updateStreak();
          }
          return;
        }

        console.log("✅ Mood entry successfully saved to Supabase");

        const newEntry: MoodEntry = {
          id: data.id,
          date: data.date,
          mood: data.mood,
          rating: data.rating,
          emoji: data.emoji,
          source: data.source,
          notes: data.notes,
        };

        setMoodEntries((prev) => [
          newEntry,
          ...(Array.isArray(prev) ? prev : []),
        ]);
        await updateStreak();

        // Update sync time
        setLastSyncTime(new Date());

        console.log("💖 Mood logged and saved to database");
      } catch (networkError) {
        console.error("🔌 Network error adding mood entry:", networkError);

        showNotification({
          type: "encouragement",
          title: "Connection Issue",
          message: "Saved locally - will sync when online",
          duration: 3000,
        });

        // Fallback to localStorage
        const result = await localStorageService.addMoodEntry(entry);
        if (result) {
          setMoodEntries((prev) => [
            result,
            ...(Array.isArray(prev) ? prev : []),
          ]);
          await updateStreak();
        }
      }
    } else {
      // Use localStorage fallback
      console.log("💾 Using localStorage mode for mood entry");
      const result = await localStorageService.addMoodEntry(entry);
      if (result) {
        setMoodEntries((prev) => [
          result,
          ...(Array.isArray(prev) ? prev : []),
        ]);
        await updateStreak();

        console.log("💖 Mood logged locally");
      }
    }
  };

  const updateMoodEntry = async (id: string, updates: Partial<MoodEntry>) => {
    if (!user) return;

    const { error } = await supabase
      .from("mood_entries")
      .update({
        mood: updates.mood,
        rating: updates.rating,
        emoji: updates.emoji,
        source: updates.source,
        notes: updates.notes,
        date: updates.date,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating mood entry:", error);
      return;
    }

    setMoodEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)),
    );
  };

  const deleteMoodEntry = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("mood_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting mood entry:", error);
      return;
    }

    setMoodEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  // Journal entry functions
  const addJournalEntry = async (entry: Omit<JournalEntry, "id">) => {
    if (!user) return;

    // Process journal for mood analysis and auto-create mood entry
    try {
      await processJournalEntry(entry.title, entry.content, addMoodEntry);
    } catch (error) {
      console.error("Mood analysis failed:", error);
    }

    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        title: entry.title,
        content: entry.content,
        sentiment: entry.sentiment,
        word_count: entry.wordCount,
        tags: entry.tags,
        date: entry.date,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding journal entry:", error);
      return;
    }

    const newEntry: JournalEntry = {
      id: data.id,
      date: data.date,
      title: data.title,
      content: data.content,
      sentiment: data.sentiment,
      wordCount: data.word_count,
      tags: data.tags || [],
    };

    setJournalEntries((prev) => [
      newEntry,
      ...(Array.isArray(prev) ? prev : []),
    ]);
    await updateStreak();
  };

  const updateJournalEntry = async (
    id: string,
    updates: Partial<JournalEntry>,
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from("journal_entries")
      .update({
        title: updates.title,
        content: updates.content,
        sentiment: updates.sentiment,
        word_count: updates.wordCount,
        tags: updates.tags,
        date: updates.date,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating journal entry:", error);
      return;
    }

    setJournalEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)),
    );
  };

  const deleteJournalEntry = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting journal entry:", error);
      return;
    }

    setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  // Chat message functions
  const addChatMessage = async (
    message: Omit<ChatMessage, "id" | "timestamp">,
    sessionId?: string,
  ) => {
    if (!user) return;

    if (isSupabaseConfigured) {
      // Database mode - Always use this for chat
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          user_id: user.id,
          session_id: sessionId || currentSessionId,
          content: message.content,
          sender: message.sender,
          sentiment: message.sentiment,
          mood: message.mood,
          emotional_state: message.emotionalState,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding chat message:", error.message || error);
        showNotification({
          type: "encouragement",
          title: "Error",
          message: "Failed to save chat message",
          duration: 3000,
        });
        return;
      }

      const newMessage: ChatMessage = {
        id: data.id,
        content: data.content,
        sender: data.sender as "user" | "ai",
        timestamp: new Date(data.created_at),
        sentiment: data.sentiment,
        mood: data.mood,
        emotionalState: data.emotional_state,
      };

      // Update local state with new message
      setChatMessages((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        newMessage,
      ]);

      // After adding a message, reload chat history to ensure context
      await loadChatMessages();
    } else {
      // localStorage fallback - but warn user to use Supabase
      console.warn(
        "💬 Chat messages should use Supabase for proper context and history. Please configure Supabase.",
      );

      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: message.content,
        sender: message.sender,
        timestamp: new Date(),
        sentiment: message.sentiment,
        mood: message.mood,
        emotionalState: message.emotionalState,
      };

      const result = await localStorageService.addChatMessage(newMessage);
      if (result) {
        setChatMessages((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          newMessage,
        ]);
      }
    }
  };

  const clearChatHistory = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Error clearing chat history:", error);
      return;
    }

    setChatMessages([]);
  };

  // Achievement functions
  const addAchievement = async (
    achievement: Omit<Achievement, "id" | "earnedAt">,
  ) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("achievements")
      .insert({
        user_id: user.id,
        achievement_id: achievement.achievementId,
        type: achievement.type,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        rarity: achievement.rarity,
        metadata: achievement.metadata,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding achievement:", error);
      return;
    }

    const newAchievement: Achievement = {
      id: data.id,
      type: data.type,
      achievementId: data.achievement_id,
      title: data.title,
      description: data.description,
      icon: data.icon,
      rarity: data.rarity,
      earnedAt: new Date(data.earned_at),
      metadata: data.metadata,
    };

    setAchievements((prev) => [
      newAchievement,
      ...(Array.isArray(prev) ? prev : []),
    ]);
  };

  // Points and progress functions
  const addPoints = async (
    points: number,
    activity: string,
    source: string = "general",
  ) => {
    if (!user) return;

    console.log(`🎯 Adding ${points} points for: ${activity} (${source})`);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from("point_activities").insert({
        user_id: user.id,
        points,
        activity,
        source,
      });

      if (error) {
        console.error("❌ Error adding points:", {
          code: error.code,
          message: error.message,
          details: error.details,
        });
        return;
      }

      console.log("✅ Points added successfully, reloading stats...");

      // Wait a moment for trigger to execute, then reload
      setTimeout(async () => {
        await loadUserStats();
        await loadPointActivities();
        console.log("📊 Stats reloaded after points addition");
      }, 500);
    } else {
      // Use localStorage fallback
      await localStorageService.addPoints(points, activity);

      // Update local state
      setUserStats((prev) => ({
        ...prev,
        points: prev.points + points,
        level: Math.max(1, Math.floor((prev.points + points) / 100) + 1),
      }));

      const newActivity: PointActivity = {
        id: Date.now().toString(),
        points,
        activity,
        source,
        createdAt: new Date(),
      };

      setPointActivities((prev) => [
        newActivity,
        ...(Array.isArray(prev) ? prev : []),
      ]);
    }
  };

  const updateStreak = async () => {
    if (!user) return;

    console.log("🔥 Updating streak for user:", user.id);

    if (isSupabaseConfigured) {
      // Streak calculation is now handled by database triggers
      // Just reload the stats to get the updated values
      console.log("�� Reloading user stats after streak update");
      setTimeout(async () => {
        await loadUserStats();
      }, 500);
    } else {
      // localStorage mode - manual calculation
      try {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split("T")[0];

        const todayMoodEntries = (
          Array.isArray(moodEntries) ? moodEntries : []
        ).filter((entry) => entry.date === today);
        const todayJournalEntries = (
          Array.isArray(journalEntries) ? journalEntries : []
        ).filter((entry) => entry.date === today);
        const todayTotal = todayMoodEntries.length + todayJournalEntries.length;

        const yesterdayMoodEntries = (
          Array.isArray(moodEntries) ? moodEntries : []
        ).filter((entry) => entry.date === yesterday);
        const yesterdayJournalEntries = (
          Array.isArray(journalEntries) ? journalEntries : []
        ).filter((entry) => entry.date === yesterday);
        const yesterdayTotal =
          yesterdayMoodEntries.length + yesterdayJournalEntries.length;

        let currentStreak = userStats.currentStreak || 0;

        // If this is the first activity today
        if (todayTotal === 1) {
          // If had activity yesterday, continue streak, otherwise start new
          currentStreak = yesterdayTotal > 0 ? currentStreak + 1 : 1;
        }

        const longestStreak = Math.max(
          currentStreak,
          userStats.longestStreak || 0,
        );

        const existingStats = localStorage.getItem("mindsync_user_stats");
        const stats = existingStats
          ? JSON.parse(existingStats)
          : {
              level: 1,
              points: 0,
              currentStreak: 0,
              longestStreak: 0,
              totalEntries: 0,
              totalWords: 0,
              lastActivity: new Date().toISOString(),
            };

        stats.currentStreak = currentStreak;
        stats.longestStreak = longestStreak;
        stats.lastActivity = new Date().toISOString();

        localStorage.setItem("mindsync_user_stats", JSON.stringify(stats));

        setUserStats((prev) => ({
          ...prev,
          currentStreak,
          longestStreak,
          lastActivity: new Date().toISOString(),
        }));

        console.log("✅ Streak updated in localStorage:", currentStreak);
      } catch (error) {
        console.error("Error updating streak in localStorage:", error);
      }
    }
  };

  // Quest functions
  const addDailyQuest = async (quest: Omit<DailyQuest, "id">) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("daily_quests")
      .insert({
        user_id: user.id,
        quest_id: quest.questId,
        title: quest.title,
        description: quest.description,
        category: quest.category,
        xp_reward: quest.xpReward,
        date: quest.date,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding daily quest:", error);
      return;
    }

    const newQuest: DailyQuest = {
      id: data.id,
      questId: data.quest_id,
      title: data.title,
      description: data.description,
      category: data.category,
      xpReward: data.xp_reward,
      date: data.date,
    };

    setDailyQuests((prev) => [...(Array.isArray(prev) ? prev : []), newQuest]);
  };

  const completeDailyQuest = async (questId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("daily_quests")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", questId)
      .eq("user_id", user.id);

    if (error) {
      console.error("❌ Error completing daily quest:", {
        code: error.code || "UNKNOWN",
        message: error.message || "Unknown error",
        details: error.details || "No details available",
        hint: error.hint || "No hint available",
        fullError: error,
      });

      showNotification({
        type: "encouragement",
        title: "Quest Update Failed",
        message: `Database error: ${error.message || "Unknown error"}. Progress saved locally!`,
        duration: 4000,
      });
      return;
    }

    setDailyQuests((prev) =>
      prev.map((quest) =>
        quest.id === questId ? { ...quest, completedAt: new Date() } : quest,
      ),
    );
  };

  // Session management functions
  const createChatSession = async (title?: string): Promise<string> => {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const newSession: ChatSession = {
      id: sessionId,
      title: title || "New Chat",
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      isActive: true,
    };

    console.log("Creating session:", sessionId);
    setChatSessions((prev) => [
      newSession,
      ...(Array.isArray(prev) ? prev : []),
    ]);
    setCurrentSessionId(sessionId);

    // Ensure we have a session ID immediately
    return sessionId;
  };

  const getChatSessions = (): ChatSession[] => {
    return Array.isArray(chatSessions) ? chatSessions : [];
  };

  const loadChatSession = async (sessionId: string): Promise<void> => {
    setCurrentSessionId(sessionId);

    // For now, filter existing messages by sessionId if available
    const sessionMessages = (
      Array.isArray(chatMessages) ? chatMessages : []
    ).filter((msg: any) => msg.sessionId === sessionId);
    setChatMessages(sessionMessages);
  };

  const deleteChatSession = async (sessionId: string): Promise<void> => {
    setChatSessions((prev) =>
      (Array.isArray(prev) ? prev : []).filter(
        (session) => session.id !== sessionId,
      ),
    );

    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setChatMessages([]);
    }
  };

  const getCurrentSessionMessages = (): ChatMessage[] => {
    // Return all messages for context - sorted by timestamp
    const messages = Array.isArray(chatMessages) ? chatMessages : [];
    return messages.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  };

  // Get recent messages for AI context (last 5 messages)
  const getRecentChatContext = (): ChatMessage[] => {
    const messages = getCurrentSessionMessages();
    return messages.slice(-5); // Last 5 messages for context
  };

  // Utility functions
  const getStreakInfo = () => ({
    current: userStats.currentStreak,
    longest: userStats.longestStreak,
  });

  const exportData = () => ({
    moodEntries,
    journalEntries,
    chatMessages,
    achievements,
    userStats,
    dailyQuests,
    pointActivities,
    exportedAt: new Date().toISOString(),
    connectionStatus: isConnected,
    lastSync: lastSyncTime,
  });

  // Test connection function
  const testConnection = async (): Promise<boolean> => {
    const status = await testSupabaseConnection();
    setIsConnected(status);
    return status;
  };

  // Force sync function
  const forceSync = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const syncSuccess = await forceSyncToSupabase(user.id);
      if (syncSuccess) {
        setLastSyncTime(new Date());
        // Reload data after sync
        await loadAllData();

        // Only show sync confirmation when manually triggered
        showNotification({
          type: "encouragement",
          title: "Sync Complete ✅",
          message: "Data synchronized successfully",
          duration: 2000,
        });
      }
      return syncSuccess;
    } catch (error) {
      console.error("Force sync failed:", error);
      return false;
    }
  };

  // Database diagnostics function
  const runDatabaseDiagnostics = async (): Promise<void> => {
    if (!user || !isSupabaseConfigured) {
      console.log("🔍 Database diagnostics: Not configured or no user");
      return;
    }

    console.log("🔍 Running database diagnostics for user:", user.id);

    try {
      // Test each table individually
      const tables = [
        "profiles",
        "user_stats",
        "mood_entries",
        "journal_entries",
        "chat_messages",
        "achievements",
        "daily_quests",
        "point_activities",
      ];

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select("id")
            .eq("user_id", user.id)
            .limit(1);

          if (error) {
            console.error(`❌ Table ${table} error:`, {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint,
            });
          } else {
            console.log(
              `✅ Table ${table}: ${data?.length || 0} records accessible`,
            );
          }
        } catch (tableError) {
          console.error(`❌ Table ${table} exception:`, tableError);
        }
      }

      // Test RLS (Row Level Security)
      try {
        const { data: rlsTest } = await supabase
          .from("user_stats")
          .select("user_id")
          .limit(1);

        if (rlsTest && rlsTest.length > 0) {
          console.log("✅ RLS working: Can access user_stats");
        } else {
          console.log("⚠️ RLS check: No data returned from user_stats");
        }
      } catch (rlsError) {
        console.error("❌ RLS test failed:", rlsError);
      }
    } catch (error) {
      console.error("❌ Database diagnostics failed:", error);
    }
  };

  const value: DataContextType = {
    // Data
    moodEntries,
    journalEntries,
    chatMessages,
    chatSessions,
    achievements,
    userStats,
    dailyQuests,
    copingSessions,
    pointActivities,
    currentSessionId,

    // Loading states
    isLoading,
    isInitialized,

    // Functions
    addMoodEntry,
    updateMoodEntry,
    deleteMoodEntry,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    addChatMessage,
    clearChatHistory,
    createChatSession,
    getChatSessions,
    loadChatSession,
    deleteChatSession,
    getCurrentSessionMessages,
    getRecentChatContext,
    addAchievement,
    addPoints,
    updateStreak,
    addDailyQuest,
    completeDailyQuest,
    getStreakInfo,
    exportData,
    testConnection,
    forceSync,
    runDatabaseDiagnostics,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
