import { createContext, useContext, useEffect, useState } from "react";
import { xanoClient } from "@/lib/xano";
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

  // Helper function to convert API responses to our types
  const convertApiTimestamp = (timestamp: any): Date => {
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === "string") return new Date(timestamp);
    if (typeof timestamp === "number") return new Date(timestamp);
    return new Date();
  };

  // Load all user data from Xano
  const loadUserData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Load all data in parallel
      const [
        moodsData,
        journalsData,
        chatsData,
        achievementsData,
        statsData,
        questsData,
        sessionsData,
      ] = await Promise.all([
        xanoClient.getMoodEntries(),
        xanoClient.getJournalEntries(),
        xanoClient.getChatMessages(),
        xanoClient.getAchievements(),
        xanoClient.getUserStats(),
        xanoClient.getDailyQuests(),
        xanoClient.getCopingSessions(),
      ]);

      // Process mood entries
      setMoodEntries(
        moodsData.map((mood: any) => ({
          id: mood.id.toString(),
          date: mood.date,
          mood: mood.mood,
          rating: mood.rating,
          emoji: mood.emoji,
          source: mood.source,
          notes: mood.notes,
        })),
      );

      // Process journal entries
      setJournalEntries(
        journalsData.map((journal: any) => ({
          id: journal.id.toString(),
          date: journal.date,
          title: journal.title,
          content: journal.content,
          sentiment: journal.sentiment,
          wordCount: journal.word_count || journal.wordCount || 0,
          tags: journal.tags || [],
        })),
      );

      // Process chat messages
      setChatMessages(
        chatsData.map((chat: any) => ({
          id: chat.id.toString(),
          content: chat.content,
          sender: chat.sender,
          timestamp: convertApiTimestamp(chat.timestamp || chat.created_at),
          sentiment: chat.sentiment,
          mood: chat.mood,
          emotionalState: chat.emotional_state || chat.emotionalState,
        })),
      );

      // Process achievements
      setAchievements(
        achievementsData.map((achievement: any) => ({
          id: achievement.id.toString(),
          type: achievement.achievement_type || achievement.type,
          achievementId:
            achievement.achievement_id || achievement.achievementId,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          rarity: achievement.rarity,
          earnedAt: convertApiTimestamp(
            achievement.earned_at || achievement.earnedAt,
          ),
          metadata: achievement.metadata,
        })),
      );

      // Process user stats
      if (statsData) {
        setUserStats({
          level: statsData.level || 1,
          points: statsData.points || 0,
          currentStreak:
            statsData.current_streak || statsData.currentStreak || 0,
          longestStreak:
            statsData.longest_streak || statsData.longestStreak || 0,
          lastActivity:
            statsData.last_activity ||
            statsData.lastActivity ||
            new Date().toISOString().split("T")[0],
        });
      }

      // Process daily quests
      setDailyQuests(
        questsData.map((quest: any) => ({
          id: quest.id.toString(),
          questId: quest.quest_id || quest.questId,
          title: quest.title,
          description: quest.description,
          category: quest.category,
          xpReward: quest.xp_reward || quest.xpReward || 0,
          completedAt:
            quest.completed_at || quest.completedAt
              ? convertApiTimestamp(quest.completed_at || quest.completedAt)
              : undefined,
          date: quest.date,
        })),
      );

      // Process coping sessions
      setCopingSessions(
        sessionsData.map((session: any) => ({
          id: session.id.toString(),
          strategyId: session.strategy_id || session.strategyId,
          strategyTitle: session.strategy_title || session.strategyTitle,
          durationSeconds:
            session.duration_seconds || session.durationSeconds || 0,
          completed: session.completed || false,
          xpEarned: session.xp_earned || session.xpEarned || 0,
          sessionDate: session.session_date || session.sessionDate,
        })),
      );
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
      const newEntry = await xanoClient.createMoodEntry(entry);

      const moodEntry: MoodEntry = {
        id: newEntry.id.toString(),
        date: newEntry.date,
        mood: newEntry.mood,
        rating: newEntry.rating,
        emoji: newEntry.emoji,
        source: newEntry.source,
        notes: newEntry.notes,
      };

      setMoodEntries((prev) => [moodEntry, ...prev]);
      await addPoints(5, "Mood check-in");
      await updateStreak();
    } catch (error) {
      console.error("Error adding mood entry:", error);
    }
  };

  const updateMoodEntry = async (id: string, updates: Partial<MoodEntry>) => {
    if (!user?.id) return;

    try {
      await xanoClient.updateMoodEntry(id, updates);
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
      await xanoClient.deleteMoodEntry(id);
      setMoodEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error("Error deleting mood entry:", error);
    }
  };

  // Journal functions
  const addJournalEntry = async (entry: Omit<JournalEntry, "id">) => {
    if (!user?.id) return;

    try {
      const newEntry = await xanoClient.createJournalEntry({
        ...entry,
        word_count: entry.wordCount,
      });

      const journalEntry: JournalEntry = {
        id: newEntry.id.toString(),
        date: newEntry.date,
        title: newEntry.title,
        content: newEntry.content,
        sentiment: newEntry.sentiment,
        wordCount: newEntry.word_count || newEntry.wordCount || 0,
        tags: newEntry.tags || [],
      };

      setJournalEntries((prev) => [journalEntry, ...prev]);
      await addPoints(10, "Journal entry");
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
      const apiUpdates = { ...updates };
      if (updates.wordCount !== undefined) {
        (apiUpdates as any).word_count = updates.wordCount;
      }

      await xanoClient.updateJournalEntry(id, apiUpdates);
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
      await xanoClient.deleteJournalEntry(id);
      setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error("Error deleting journal entry:", error);
    }
  };

  // Chat functions
  const addChatMessage = async (message: Omit<ChatMessage, "id">) => {
    if (!user?.id) return;

    try {
      const newMessage = await xanoClient.createChatMessage({
        ...message,
        timestamp: message.timestamp.toISOString(),
        emotional_state: message.emotionalState,
      });

      const chatMessage: ChatMessage = {
        id: newMessage.id.toString(),
        content: newMessage.content,
        sender: newMessage.sender,
        timestamp: convertApiTimestamp(newMessage.timestamp),
        sentiment: newMessage.sentiment,
        mood: newMessage.mood,
        emotionalState: newMessage.emotional_state || newMessage.emotionalState,
      };

      setChatMessages((prev) => [chatMessage, ...prev.slice(0, 99)]);

      if (message.sender === "user") {
        await addPoints(2, "Chat interaction");
      }
    } catch (error) {
      console.error("Error adding chat message:", error);
    }
  };

  // Achievement functions
  const addAchievement = async (achievement: Omit<Achievement, "id">) => {
    if (!user?.id) return;

    try {
      const newAchievement = await xanoClient.createAchievement({
        achievement_type: achievement.type,
        achievement_id: achievement.achievementId,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        rarity: achievement.rarity,
        earned_at: achievement.earnedAt.toISOString(),
        metadata: achievement.metadata,
      });

      const achievementEntry: Achievement = {
        id: newAchievement.id.toString(),
        type: newAchievement.achievement_type || newAchievement.type,
        achievementId:
          newAchievement.achievement_id || newAchievement.achievementId,
        title: newAchievement.title,
        description: newAchievement.description,
        icon: newAchievement.icon,
        rarity: newAchievement.rarity,
        earnedAt: convertApiTimestamp(
          newAchievement.earned_at || newAchievement.earnedAt,
        ),
        metadata: newAchievement.metadata,
      };

      setAchievements((prev) => [achievementEntry, ...prev]);

      showNotification({
        type: "achievement",
        title: `${achievement.icon} Achievement Unlocked!`,
        message: `${achievement.title} - ${achievement.description}`,
        duration: 5000,
      });
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

      const updatedStats = await xanoClient.updateUserStats({
        points: newPoints,
        level: newLevel,
      });

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

      await xanoClient.updateUserStats({
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_activity: today,
      });

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
      await xanoClient.completeDailyQuest(questId);

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
    // Implementation depends on Xano API structure
  };

  // Coping session functions
  const addCopingSession = async (session: Omit<CopingSession, "id">) => {
    if (!user?.id) return;

    try {
      const newSession = await xanoClient.createCopingSession({
        strategy_id: session.strategyId,
        strategy_title: session.strategyTitle,
        duration_seconds: session.durationSeconds,
        completed: session.completed,
        xp_earned: session.xpEarned,
        session_date: session.sessionDate,
      });

      const copingSession: CopingSession = {
        id: newSession.id.toString(),
        strategyId: newSession.strategy_id || newSession.strategyId,
        strategyTitle: newSession.strategy_title || newSession.strategyTitle,
        durationSeconds:
          newSession.duration_seconds || newSession.durationSeconds,
        completed: newSession.completed,
        xpEarned: newSession.xp_earned || newSession.xpEarned,
        sessionDate: newSession.session_date || newSession.sessionDate,
      };

      setCopingSessions((prev) => [copingSession, ...prev]);

      if (session.completed) {
        await addPoints(session.xpEarned, "Completed coping session");
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
