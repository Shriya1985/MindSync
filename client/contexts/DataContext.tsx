import { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { localStorageService } from "@/lib/localStorage";
import { useAuth } from "@/contexts/AuthContext";
import { showNotification } from "@/components/ui/notification-system";
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
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

type DataProviderProps = {
  children: React.ReactNode;
};

export function DataProvider({ children }: DataProviderProps) {
  const { user, isAuthenticated } = useAuth();
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

  // Load all user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (isSupabaseConfigured) {
        loadAllData();
      } else {
        loadLocalStorageData();
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
      await Promise.all([
        loadMoodEntries(),
        loadJournalEntries(),
        loadChatMessages(),
        loadAchievements(),
        loadUserStats(),
        loadDailyQuests(),
        loadPointActivities(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const loadLocalStorageData = () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load data from localStorage service
      const data = localStorageService.getAllUserData();

      setMoodEntries(data.moodEntries || []);
      setJournalEntries(data.journalEntries || []);
      setChatMessages(data.chatMessages || []);
      setAchievements(data.achievements || []);
      setUserStats(
        data.userStats || {
          level: 1,
          points: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalEntries: 0,
          totalWords: 0,
          lastActivity: new Date().toISOString(),
        },
      );
      setDailyQuests(data.dailyQuests || []);
      setCopingSessions(data.copingSessions || []);
      setPointActivities(data.pointActivities || []);

      console.log("✅ Loaded data from localStorage (Supabase not configured)");
    } catch (error) {
      console.error("Error loading localStorage data:", error);
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
      console.error("Error loading mood entries:", error);
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
      console.error("Error loading journal entries:", error);
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
      console.error("Error loading chat messages:", error);
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
      console.error("Error loading achievements:", error);
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
      console.error("Error loading user stats:", error);
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
      console.error("Error loading daily quests:", error);
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
      console.error("Error loading point activities:", error);
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

    if (isSupabaseConfigured) {
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
        console.error("Error adding mood entry:", error);
        return;
      }

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
    } else {
      // Use localStorage fallback
      const result = await localStorageService.addMoodEntry(entry);
      if (result) {
        setMoodEntries((prev) => [
          result,
          ...(Array.isArray(prev) ? prev : []),
        ]);
        await updateStreak();
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
      // Database mode
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
        showNotification("Failed to save chat message", "error");
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

      setChatMessages((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        newMessage,
      ]);
    } else {
      // localStorage mode
      const newMessage: ChatMessage & { sessionId?: string } = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: message.content,
        sender: message.sender,
        timestamp: new Date(),
        sentiment: message.sentiment,
        mood: message.mood,
        emotionalState: message.emotionalState,
        sessionId: sessionId || currentSessionId || undefined,
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

    if (isSupabaseConfigured) {
      const { error } = await supabase.from("point_activities").insert({
        user_id: user.id,
        points,
        activity,
        source,
      });

      if (error) {
        console.error("Error adding points:", error);
        return;
      }

      // Reload user stats to get updated points and level
      await loadUserStats();
      await loadPointActivities();
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

    // Calculate streak based on recent mood/journal entries
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    const todayEntries = (Array.isArray(moodEntries) ? moodEntries : []).filter(
      (entry) => entry.date === today,
    );
    const yesterdayEntries = (
      Array.isArray(moodEntries) ? moodEntries : []
    ).filter((entry) => entry.date === yesterday);

    const currentStreak =
      todayEntries.length > 0 ? userStats.currentStreak + 1 : 0;
    const longestStreak = Math.max(currentStreak, userStats.longestStreak);

    const { error } = await supabase
      .from("user_stats")
      .update({
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_activity: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating streak:", error.message || error);
      showNotification("Failed to update streak", "error");
      return;
    }

    setUserStats((prev) => ({
      ...prev,
      currentStreak,
      longestStreak,
      lastActivity: new Date().toISOString(),
    }));
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
      console.error("Error completing daily quest:", error);
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
    // For now, return all messages since session filtering isn't fully implemented
    return Array.isArray(chatMessages) ? chatMessages : [];
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
  });

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
    addAchievement,
    addPoints,
    updateStreak,
    addDailyQuest,
    completeDailyQuest,
    getStreakInfo,
    exportData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
