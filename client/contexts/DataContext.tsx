import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { showNotification } from "@/components/ui/notification-system";

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

type DataContextType = {
  // Data
  moodEntries: MoodEntry[];
  journalEntries: JournalEntry[];
  chatMessages: ChatMessage[];
  achievements: Achievement[];
  userStats: UserStats;
  dailyQuests: DailyQuest[];
  copingSessions: CopingSession[];

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
  addChatMessage: (message: Omit<ChatMessage, "id">) => Promise<void>;

  // Achievement functions
  addAchievement: (achievement: Omit<Achievement, "id">) => Promise<void>;

  // Stats functions
  addPoints: (points: number, reason: string) => Promise<void>;
  updateStreak: () => Promise<void>;
  getStreakInfo: () => { current: number; longest: number };

  // Quest functions
  completeQuest: (questId: string, xpReward: number) => Promise<void>;
  generateDailyQuests: () => Promise<void>;

  // Coping session functions
  addCopingSession: (session: Omit<CopingSession, "id">) => Promise<void>;

  // Data management
  refreshData: () => Promise<void>;
  exportData: () => any;
};

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    points: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivity: new Date().toISOString().split("T")[0],
  });
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [copingSessions, setCopingSessions] = useState<CopingSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load all user data from Supabase
  const loadUserData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Load all data in parallel
      const [
        moodsResult,
        journalsResult,
        chatsResult,
        achievementsResult,
        statsResult,
        questsResult,
        sessionsResult,
      ] = await Promise.all([
        supabase
          .from("mood_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false }),
        supabase
          .from("journal_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false }),
        supabase
          .from("chat_messages")
          .select("*")
          .eq("user_id", user.id)
          .order("timestamp", { ascending: false })
          .limit(100),
        supabase
          .from("achievements")
          .select("*")
          .eq("user_id", user.id)
          .order("earned_at", { ascending: false }),
        supabase.from("user_stats").select("*").eq("user_id", user.id).single(),
        supabase
          .from("daily_quests")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", new Date().toISOString().split("T")[0]),
        supabase
          .from("coping_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("session_date", { ascending: false }),
      ]);

      // Process mood entries
      if (moodsResult.data) {
        setMoodEntries(
          moodsResult.data.map((mood) => ({
            id: mood.id,
            date: mood.date,
            mood: mood.mood,
            rating: mood.rating,
            emoji: mood.emoji,
            source: mood.source,
            notes: mood.notes,
          })),
        );
      }

      // Process journal entries
      if (journalsResult.data) {
        setJournalEntries(
          journalsResult.data.map((journal) => ({
            id: journal.id,
            date: journal.date,
            title: journal.title,
            content: journal.content,
            sentiment: journal.sentiment,
            wordCount: journal.word_count,
            tags: journal.tags,
          })),
        );
      }

      // Process chat messages
      if (chatsResult.data) {
        setChatMessages(
          chatsResult.data.map((chat) => ({
            id: chat.id,
            content: chat.content,
            sender: chat.sender,
            timestamp: new Date(chat.timestamp),
            sentiment: chat.sentiment,
            mood: chat.mood,
            emotionalState: chat.emotional_state,
          })),
        );
      }

      // Process achievements
      if (achievementsResult.data) {
        setAchievements(
          achievementsResult.data.map((achievement) => ({
            id: achievement.id,
            type: achievement.achievement_type as any,
            achievementId: achievement.achievement_id,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            rarity: achievement.rarity as any,
            earnedAt: new Date(achievement.earned_at),
            metadata: achievement.metadata,
          })),
        );
      }

      // Process user stats
      if (statsResult.data) {
        setUserStats({
          level: statsResult.data.level,
          points: statsResult.data.points,
          currentStreak: statsResult.data.current_streak,
          longestStreak: statsResult.data.longest_streak,
          lastActivity: statsResult.data.last_activity,
        });
      }

      // Process daily quests
      if (questsResult.data) {
        setDailyQuests(
          questsResult.data.map((quest) => ({
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
          })),
        );
      }

      // Process coping sessions
      if (sessionsResult.data) {
        setCopingSessions(
          sessionsResult.data.map((session) => ({
            id: session.id,
            strategyId: session.strategy_id,
            strategyTitle: session.strategy_title,
            durationSeconds: session.duration_seconds,
            completed: session.completed,
            xpEarned: session.xp_earned,
            sessionDate: session.session_date,
          })),
        );
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    } else {
      // Clear data when user logs out
      setMoodEntries([]);
      setJournalEntries([]);
      setChatMessages([]);
      setAchievements([]);
      setUserStats({
        level: 1,
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivity: new Date().toISOString().split("T")[0],
      });
      setDailyQuests([]);
      setCopingSessions([]);
      setIsInitialized(false);
    }
  }, [isAuthenticated, user]);

  // Mood functions
  const addMoodEntry = async (entry: Omit<MoodEntry, "id">) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("mood_entries")
        .insert({
          user_id: user.id,
          date: entry.date,
          mood: entry.mood,
          rating: entry.rating,
          emoji: entry.emoji,
          source: entry.source,
          notes: entry.notes,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newEntry: MoodEntry = {
          id: data.id,
          date: data.date,
          mood: data.mood,
          rating: data.rating,
          emoji: data.emoji,
          source: data.source,
          notes: data.notes,
        };

        setMoodEntries((prev) => [newEntry, ...prev]);
        await addPoints(5, "Mood check-in");
        await updateStreak();
      }
    } catch (error) {
      console.error("Error adding mood entry:", error);
    }
  };

  const updateMoodEntry = async (id: string, updates: Partial<MoodEntry>) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from("mood_entries")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setMoodEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, ...updates } : entry,
        ),
      );
    } catch (error) {
      console.error("Error updating mood entry:", error);
    }
  };

  const deleteMoodEntry = async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from("mood_entries")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setMoodEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error("Error deleting mood entry:", error);
    }
  };

  // Journal functions
  const addJournalEntry = async (entry: Omit<JournalEntry, "id">) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          date: entry.date,
          title: entry.title,
          content: entry.content,
          sentiment: entry.sentiment,
          word_count: entry.wordCount,
          tags: entry.tags,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newEntry: JournalEntry = {
          id: data.id,
          date: data.date,
          title: data.title,
          content: data.content,
          sentiment: data.sentiment,
          wordCount: data.word_count,
          tags: data.tags,
        };

        setJournalEntries((prev) => [newEntry, ...prev]);
        await addPoints(10, "Journal entry");
      }
    } catch (error) {
      console.error("Error adding journal entry:", error);
    }
  };

  const updateJournalEntry = async (
    id: string,
    updates: Partial<JournalEntry>,
  ) => {
    if (!user?.id) return;

    try {
      const dbUpdates: any = { ...updates };
      if (updates.wordCount !== undefined) {
        dbUpdates.word_count = updates.wordCount;
        delete dbUpdates.wordCount;
      }

      const { error } = await supabase
        .from("journal_entries")
        .update(dbUpdates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setJournalEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, ...updates } : entry,
        ),
      );
    } catch (error) {
      console.error("Error updating journal entry:", error);
    }
  };

  const deleteJournalEntry = async (id: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error("Error deleting journal entry:", error);
    }
  };

  // Chat functions
  const addChatMessage = async (message: Omit<ChatMessage, "id">) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          user_id: user.id,
          content: message.content,
          sender: message.sender,
          sentiment: message.sentiment,
          mood: message.mood,
          emotional_state: message.emotionalState,
          timestamp: message.timestamp.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newMessage: ChatMessage = {
          id: data.id,
          content: data.content,
          sender: data.sender,
          timestamp: new Date(data.timestamp),
          sentiment: data.sentiment,
          mood: data.mood,
          emotionalState: data.emotional_state,
        };

        setChatMessages((prev) => [newMessage, ...prev.slice(0, 99)]);

        if (message.sender === "user") {
          await addPoints(2, "Chat interaction");
        }
      }
    } catch (error) {
      console.error("Error adding chat message:", error);
    }
  };

  // Achievement functions
  const addAchievement = async (achievement: Omit<Achievement, "id">) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("achievements")
        .insert({
          user_id: user.id,
          achievement_type: achievement.type,
          achievement_id: achievement.achievementId,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          rarity: achievement.rarity,
          earned_at: achievement.earnedAt.toISOString(),
          metadata: achievement.metadata,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newAchievement: Achievement = {
          id: data.id,
          type: data.achievement_type as any,
          achievementId: data.achievement_id,
          title: data.title,
          description: data.description,
          icon: data.icon,
          rarity: data.rarity as any,
          earnedAt: new Date(data.earned_at),
          metadata: data.metadata,
        };

        setAchievements((prev) => [newAchievement, ...prev]);

        showNotification({
          type: "achievement",
          title: `${achievement.icon} Achievement Unlocked!`,
          message: `${achievement.title} - ${achievement.description}`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error adding achievement:", error);
    }
  };

  // Stats functions
  const addPoints = async (points: number, reason: string) => {
    if (!user?.id) return;

    try {
      const newPoints = userStats.points + points;
      const newLevel = Math.floor(newPoints / 100) + 1;

      const { error } = await supabase
        .from("user_stats")
        .update({
          points: newPoints,
          level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      const oldLevel = userStats.level;
      setUserStats((prev) => ({
        ...prev,
        points: newPoints,
        level: newLevel,
      }));

      // Check for level up
      if (newLevel > oldLevel) {
        await addAchievement({
          type: "level",
          achievementId: `level_${newLevel}`,
          title: "Level Up!",
          description: `Reached level ${newLevel}`,
          icon: "🎉",
          rarity: "common",
          earnedAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Error adding points:", error);
    }
  };

  const updateStreak = async () => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = 1;

      if (userStats.lastActivity === yesterdayStr) {
        newStreak = userStats.currentStreak + 1;
      } else if (userStats.lastActivity === today) {
        return; // Already updated today
      }

      const newLongestStreak = Math.max(userStats.longestStreak, newStreak);

      const { error } = await supabase
        .from("user_stats")
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_activity: today,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setUserStats((prev) => ({
        ...prev,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActivity: today,
      }));

      // Check for streak achievements
      if (newStreak === 7) {
        await addAchievement({
          type: "streak",
          achievementId: "streak_7",
          title: "Weekly Warrior",
          description: "7 day streak!",
          icon: "🔥",
          rarity: "rare",
          earnedAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  };

  const getStreakInfo = () => ({
    current: userStats.currentStreak,
    longest: userStats.longestStreak,
  });

  // Quest functions
  const completeQuest = async (questId: string, xpReward: number) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from("daily_quests")
        .update({
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("quest_id", questId)
        .eq("date", new Date().toISOString().split("T")[0]);

      if (error) throw error;

      setDailyQuests((prev) =>
        prev.map((quest) =>
          quest.questId === questId
            ? { ...quest, completedAt: new Date() }
            : quest,
        ),
      );

      await addPoints(xpReward, `Completed quest: ${questId}`);
    } catch (error) {
      console.error("Error completing quest:", error);
    }
  };

  const generateDailyQuests = async () => {
    // This would generate new daily quests
    // Implementation depends on quest generation logic
  };

  // Coping session functions
  const addCopingSession = async (session: Omit<CopingSession, "id">) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("coping_sessions")
        .insert({
          user_id: user.id,
          strategy_id: session.strategyId,
          strategy_title: session.strategyTitle,
          duration_seconds: session.durationSeconds,
          completed: session.completed,
          xp_earned: session.xpEarned,
          session_date: session.sessionDate,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newSession: CopingSession = {
          id: data.id,
          strategyId: data.strategy_id,
          strategyTitle: data.strategy_title,
          durationSeconds: data.duration_seconds,
          completed: data.completed,
          xpEarned: data.xp_earned,
          sessionDate: data.session_date,
        };

        setCopingSessions((prev) => [newSession, ...prev]);

        if (session.completed) {
          await addPoints(session.xpEarned, "Completed coping session");
        }
      }
    } catch (error) {
      console.error("Error adding coping session:", error);
    }
  };

  // Data management
  const refreshData = async () => {
    await loadUserData();
  };

  const exportData = () => {
    return {
      moodEntries,
      journalEntries,
      chatMessages,
      achievements,
      userStats,
      dailyQuests,
      copingSessions,
      exportedAt: new Date().toISOString(),
    };
  };

  return (
    <DataContext.Provider
      value={{
        moodEntries,
        journalEntries,
        chatMessages,
        achievements,
        userStats,
        dailyQuests,
        copingSessions,
        isLoading,
        isInitialized,
        addMoodEntry,
        updateMoodEntry,
        deleteMoodEntry,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        addChatMessage,
        addAchievement,
        addPoints,
        updateStreak,
        getStreakInfo,
        completeQuest,
        generateDailyQuests,
        addCopingSession,
        refreshData,
        exportData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
