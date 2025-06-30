import { createContext, useContext, useEffect, useState } from "react";
import {
  localStorageService,
  generateFakeAIResponse,
} from "@/lib/localStorage";
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

  // Load all user data from localStorage
  const loadUserData = async () => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      // Small delay to simulate loading (for better UX)
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Load user stats
      const stats = localStorageService.getUserStats(user.id);
      setUserStats(stats);

      // Load all user data
      const moods = localStorageService.getUserData<MoodEntry>(
        user.id,
        "MOOD_ENTRIES",
        [],
      );
      const journals = localStorageService.getUserData<JournalEntry>(
        user.id,
        "JOURNAL_ENTRIES",
        [],
      );
      const chats = localStorageService.getUserData<any>(
        user.id,
        "CHAT_MESSAGES",
        [],
      );
      const achievementsData = localStorageService.getUserData<any>(
        user.id,
        "ACHIEVEMENTS",
        [],
      );
      const quests = localStorageService.getUserData<any>(
        user.id,
        "DAILY_QUESTS",
        [],
      );
      const sessions = localStorageService.getUserData<any>(
        user.id,
        "COPING_SESSIONS",
        [],
      );

      // Convert timestamp strings back to Date objects where needed
      const convertedChats = chats.map((chat: any) => ({
        ...chat,
        timestamp: new Date(chat.timestamp),
      }));

      const convertedAchievements = achievementsData.map(
        (achievement: any) => ({
          ...achievement,
          earnedAt: new Date(achievement.earnedAt),
        }),
      );

      const convertedQuests = quests.map((quest: any) => ({
        ...quest,
        completedAt: quest.completedAt
          ? new Date(quest.completedAt)
          : undefined,
      }));

      setMoodEntries(moods);
      setJournalEntries(journals);
      setChatMessages(convertedChats);
      setAchievements(convertedAchievements);
      setDailyQuests(convertedQuests);
      setCopingSessions(sessions);

      // Generate daily quests if none exist for today
      if (quests.length === 0) {
        await generateDailyQuests();
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

    const newEntry: MoodEntry = {
      ...entry,
      id: localStorageService.generateId(),
    };

    localStorageService.addUserDataItem(user.id, "MOOD_ENTRIES", newEntry);
    setMoodEntries((prev) => [newEntry, ...prev]);

    await addPoints(5, "Mood check-in");
    await updateStreak();
  };

  const updateMoodEntry = async (id: string, updates: Partial<MoodEntry>) => {
    if (!user?.id) return;

    localStorageService.updateUserDataItem(
      user.id,
      "MOOD_ENTRIES",
      id,
      updates,
    );
    setMoodEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)),
    );
  };

  const deleteMoodEntry = async (id: string) => {
    if (!user?.id) return;

    localStorageService.deleteUserDataItem(user.id, "MOOD_ENTRIES", id);
    setMoodEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  // Journal functions
  const addJournalEntry = async (entry: Omit<JournalEntry, "id">) => {
    if (!user?.id) return;

    const newEntry: JournalEntry = {
      ...entry,
      id: localStorageService.generateId(),
    };

    localStorageService.addUserDataItem(user.id, "JOURNAL_ENTRIES", newEntry);
    setJournalEntries((prev) => [newEntry, ...prev]);

    await addPoints(10, "Journal entry");
  };

  const updateJournalEntry = async (
    id: string,
    updates: Partial<JournalEntry>,
  ) => {
    if (!user?.id) return;

    localStorageService.updateUserDataItem(
      user.id,
      "JOURNAL_ENTRIES",
      id,
      updates,
    );
    setJournalEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)),
    );
  };

  const deleteJournalEntry = async (id: string) => {
    if (!user?.id) return;

    localStorageService.deleteUserDataItem(user.id, "JOURNAL_ENTRIES", id);
    setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  // Chat functions
  const addChatMessage = async (message: Omit<ChatMessage, "id">) => {
    if (!user?.id) return;

    const newMessage: ChatMessage = {
      ...message,
      id: localStorageService.generateId(),
    };

    // Convert Date to string for storage
    const storageMessage = {
      ...newMessage,
      timestamp: newMessage.timestamp.toISOString(),
    };

    localStorageService.addUserDataItem(
      user.id,
      "CHAT_MESSAGES",
      storageMessage,
    );
    setChatMessages((prev) => [newMessage, ...prev.slice(0, 99)]); // Keep only last 100 messages

    if (message.sender === "user") {
      await addPoints(2, "Chat interaction");

      // Simulate AI response after a delay
      setTimeout(
        async () => {
          const aiResponse: ChatMessage = {
            id: localStorageService.generateId(),
            content: generateFakeAIResponse(message.content, message.mood),
            sender: "ai",
            timestamp: new Date(),
            sentiment: "positive", // Most AI responses are supportive
          };

          const aiStorageMessage = {
            ...aiResponse,
            timestamp: aiResponse.timestamp.toISOString(),
          };

          localStorageService.addUserDataItem(
            user.id,
            "CHAT_MESSAGES",
            aiStorageMessage,
          );
          setChatMessages((prev) => [aiResponse, ...prev.slice(0, 99)]);
        },
        1500 + Math.random() * 1000,
      ); // Random delay between 1.5-2.5 seconds
    }
  };

  // Achievement functions
  const addAchievement = async (achievement: Omit<Achievement, "id">) => {
    if (!user?.id) return;

    const newAchievement: Achievement = {
      ...achievement,
      id: localStorageService.generateId(),
    };

    // Convert Date to string for storage
    const storageAchievement = {
      ...newAchievement,
      earnedAt: newAchievement.earnedAt.toISOString(),
    };

    localStorageService.addUserDataItem(
      user.id,
      "ACHIEVEMENTS",
      storageAchievement,
    );
    setAchievements((prev) => [newAchievement, ...prev]);

    showNotification({
      type: "achievement",
      title: `${achievement.icon} Achievement Unlocked!`,
      message: `${achievement.title} - ${achievement.description}`,
      duration: 5000,
    });
  };

  // Stats functions
  const addPoints = async (points: number, reason: string) => {
    if (!user?.id) return;

    const newPoints = userStats.points + points;
    const newLevel = Math.floor(newPoints / 100) + 1;
    const oldLevel = userStats.level;

    const updatedStats = {
      ...userStats,
      points: newPoints,
      level: newLevel,
    };

    localStorageService.setUserStats(user.id, updatedStats);
    setUserStats(updatedStats);

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
  };

  const updateStreak = async () => {
    if (!user?.id) return;

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

    const updatedStats = {
      ...userStats,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActivity: today,
    };

    localStorageService.setUserStats(user.id, updatedStats);
    setUserStats(updatedStats);

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
  };

  const getStreakInfo = () => ({
    current: userStats.currentStreak,
    longest: userStats.longestStreak,
  });

  // Quest functions
  const completeQuest = async (questId: string, xpReward: number) => {
    if (!user?.id) return;

    const questData = {
      completedAt: new Date().toISOString(),
    };

    localStorageService.updateUserDataItem(
      user.id,
      "DAILY_QUESTS",
      questId,
      questData,
    );

    setDailyQuests((prev) =>
      prev.map((quest) =>
        quest.questId === questId
          ? { ...quest, completedAt: new Date() }
          : quest,
      ),
    );

    await addPoints(xpReward, `Completed quest: ${questId}`);
  };

  const generateDailyQuests = async () => {
    if (!user?.id) return;

    const today = new Date().toISOString().split("T")[0];

    // Sample daily quests
    const questTemplates = [
      {
        questId: "gratitude-three",
        title: "Gratitude Practice",
        description: "Write down 3 things you're grateful for today",
        category: "gratitude",
        xpReward: 15,
      },
      {
        questId: "mindful-breathing",
        title: "Mindful Breathing",
        description: "Take 5 deep, conscious breaths",
        category: "mindfulness",
        xpReward: 10,
      },
      {
        questId: "mood-check",
        title: "Mood Check-In",
        description: "Log your current mood and reflect on what influenced it",
        category: "mindfulness",
        xpReward: 10,
      },
      {
        questId: "journal-reflection",
        title: "Daily Reflection",
        description: "Write about your day for at least 100 words",
        category: "mindfulness",
        xpReward: 20,
      },
    ];

    // Create 3-4 random quests for today
    const todaysQuests = questTemplates
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((template) => ({
        ...template,
        id: localStorageService.generateId(),
        date: today,
        completedAt: undefined,
      }));

    localStorageService.setUserData(user.id, "DAILY_QUESTS", todaysQuests);
    setDailyQuests(todaysQuests);
  };

  // Coping session functions
  const addCopingSession = async (session: Omit<CopingSession, "id">) => {
    if (!user?.id) return;

    const newSession: CopingSession = {
      ...session,
      id: localStorageService.generateId(),
    };

    localStorageService.addUserDataItem(user.id, "COPING_SESSIONS", newSession);
    setCopingSessions((prev) => [newSession, ...prev]);

    if (session.completed) {
      await addPoints(session.xpEarned, "Completed coping session");
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
      chatMessages: chatMessages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      })),
      achievements: achievements.map((ach) => ({
        ...ach,
        earnedAt: ach.earnedAt.toISOString(),
      })),
      userStats,
      dailyQuests: dailyQuests.map((quest) => ({
        ...quest,
        completedAt: quest.completedAt?.toISOString(),
      })),
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
