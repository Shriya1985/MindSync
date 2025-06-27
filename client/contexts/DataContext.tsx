import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type MoodEntry = {
  id: string;
  date: string;
  mood: string;
  rating: number;
  emoji: string;
  note?: string;
  activities?: string[];
  source: "dashboard" | "chatbot";
};

export type JournalEntry = {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
  sentiment: "positive" | "neutral" | "negative";
  tags: string[];
  wordCount: number;
  aiPrompt?: string;
};

export type ChatMessage = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  mood?: string;
  sentiment?: "positive" | "neutral" | "negative";
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  category: "streak" | "milestone" | "activity";
};

export type UserStats = {
  totalEntries: number;
  totalWords: number;
  currentStreak: number;
  longestStreak: number;
  averageMood: number;
  positiveEntries: number;
  chatSessions: number;
  achievements: Achievement[];
  points: number;
  level: number;
};

type DataContextType = {
  moodEntries: MoodEntry[];
  journalEntries: JournalEntry[];
  chatMessages: ChatMessage[];
  userStats: UserStats;
  addMoodEntry: (entry: Omit<MoodEntry, "id">) => void;
  addJournalEntry: (entry: Omit<JournalEntry, "id">) => void;
  addChatMessage: (message: Omit<ChatMessage, "id">) => void;
  updateStats: () => void;
  earnAchievement: (achievementId: string) => void;
  getStreakInfo: () => { current: number; type: string; daysUntilNext: number };
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalEntries: 0,
    totalWords: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageMood: 0,
    positiveEntries: 0,
    chatSessions: 0,
    achievements: [],
    points: 0,
    level: 1,
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedMoodEntries = localStorage.getItem("mindSync_moodEntries");
    const savedJournalEntries = localStorage.getItem("mindSync_journalEntries");
    const savedChatMessages = localStorage.getItem("mindSync_chatMessages");
    const savedStats = localStorage.getItem("mindSync_userStats");

    if (savedMoodEntries) {
      setMoodEntries(JSON.parse(savedMoodEntries));
    }
    if (savedJournalEntries) {
      setJournalEntries(JSON.parse(savedJournalEntries));
    }
    if (savedChatMessages) {
      setChatMessages(JSON.parse(savedChatMessages));
    }
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("mindSync_moodEntries", JSON.stringify(moodEntries));
  }, [moodEntries]);

  useEffect(() => {
    localStorage.setItem(
      "mindSync_journalEntries",
      JSON.stringify(journalEntries),
    );
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem("mindSync_chatMessages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem("mindSync_userStats", JSON.stringify(userStats));
  }, [userStats]);

  const addMoodEntry = (entry: Omit<MoodEntry, "id">) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setMoodEntries((prev) => [newEntry, ...prev]);
    updateStats();
    checkAchievements("mood");
  };

  const addJournalEntry = (entry: Omit<JournalEntry, "id">) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setJournalEntries((prev) => [newEntry, ...prev]);
    updateStats();
    checkAchievements("journal");
  };

  const addChatMessage = (message: Omit<ChatMessage, "id">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
    };
    setChatMessages((prev) => [...prev, newMessage]);
    if (message.sender === "user") {
      updateStats();
      checkAchievements("chat");
    }
  };

  const updateStats = () => {
    setUserStats((prev) => {
      const totalMoodEntries = moodEntries.length;
      const totalJournalEntries = journalEntries.length;
      const totalEntries = totalMoodEntries + totalJournalEntries;

      const totalWords = journalEntries.reduce(
        (sum, entry) => sum + entry.wordCount,
        0,
      );

      const allMoodRatings = moodEntries.map((entry) => entry.rating);
      const averageMood =
        allMoodRatings.length > 0
          ? allMoodRatings.reduce((sum, rating) => sum + rating, 0) /
            allMoodRatings.length
          : 0;

      const positiveEntries = [
        ...moodEntries.filter((entry) => entry.rating >= 7),
        ...journalEntries.filter((entry) => entry.sentiment === "positive"),
      ].length;

      const currentStreak = calculateCurrentStreak();
      const points = calculatePoints();
      const level = Math.floor(points / 100) + 1;

      return {
        ...prev,
        totalEntries,
        totalWords,
        averageMood,
        positiveEntries,
        currentStreak,
        longestStreak: Math.max(prev.longestStreak, currentStreak),
        points,
        level,
      };
    });
  };

  const calculateCurrentStreak = () => {
    const today = new Date().toISOString().split("T")[0];
    const allEntryDates = [
      ...moodEntries.map((entry) => entry.date),
      ...journalEntries.map((entry) => entry.date),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    let currentDate = new Date(today);

    for (const dateStr of allEntryDates) {
      const entryDate = new Date(dateStr);
      const daysDiff = Math.floor(
        (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === streak) {
        streak++;
        currentDate = new Date(entryDate);
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  };

  const calculatePoints = () => {
    let points = 0;
    points += moodEntries.length * 5; // 5 points per mood entry
    points += journalEntries.length * 10; // 10 points per journal entry
    points += journalEntries.reduce(
      (sum, entry) => sum + Math.floor(entry.wordCount / 10),
      0,
    ); // 1 point per 10 words
    points += userStats.achievements.filter((a) => a.earned).length * 50; // 50 points per achievement
    return points;
  };

  const checkAchievements = (type: "mood" | "journal" | "chat") => {
    const achievements: Achievement[] = [
      {
        id: "first_entry",
        title: "First Step",
        description: "Made your first entry",
        icon: "🌱",
        earned: false,
        category: "milestone",
      },
      {
        id: "week_streak",
        title: "Week Warrior",
        description: "7 consecutive days of entries",
        icon: "🔥",
        earned: false,
        category: "streak",
      },
      {
        id: "word_master",
        title: "Word Master",
        description: "Written 1000+ words",
        icon: "📝",
        earned: false,
        category: "milestone",
      },
      {
        id: "mood_tracker",
        title: "Mood Explorer",
        description: "Logged 10 mood entries",
        icon: "😊",
        earned: false,
        category: "activity",
      },
      {
        id: "journal_enthusiast",
        title: "Journal Enthusiast",
        description: "Written 5 journal entries",
        icon: "📖",
        earned: false,
        category: "activity",
      },
    ];

    setUserStats((prev) => {
      const updatedAchievements = [...prev.achievements];

      achievements.forEach((achievement) => {
        const existingIndex = updatedAchievements.findIndex(
          (a) => a.id === achievement.id,
        );
        let shouldEarn = false;

        switch (achievement.id) {
          case "first_entry":
            shouldEarn = moodEntries.length + journalEntries.length >= 1;
            break;
          case "week_streak":
            shouldEarn = calculateCurrentStreak() >= 7;
            break;
          case "word_master":
            shouldEarn =
              journalEntries.reduce((sum, entry) => sum + entry.wordCount, 0) >=
              1000;
            break;
          case "mood_tracker":
            shouldEarn = moodEntries.length >= 10;
            break;
          case "journal_enthusiast":
            shouldEarn = journalEntries.length >= 5;
            break;
        }

        if (shouldEarn) {
          if (existingIndex >= 0) {
            updatedAchievements[existingIndex] = {
              ...achievement,
              earned: true,
              earnedDate: new Date().toISOString(),
            };
          } else {
            updatedAchievements.push({
              ...achievement,
              earned: true,
              earnedDate: new Date().toISOString(),
            });
          }
        } else if (existingIndex < 0) {
          updatedAchievements.push(achievement);
        }
      });

      return { ...prev, achievements: updatedAchievements };
    });
  };

  const earnAchievement = (achievementId: string) => {
    setUserStats((prev) => ({
      ...prev,
      achievements: prev.achievements.map((achievement) =>
        achievement.id === achievementId
          ? {
              ...achievement,
              earned: true,
              earnedDate: new Date().toISOString(),
            }
          : achievement,
      ),
    }));
  };

  const getStreakInfo = () => {
    const currentStreak = calculateCurrentStreak();
    const daysUntilNext =
      currentStreak < 7
        ? 7 - currentStreak
        : currentStreak < 30
          ? 30 - currentStreak
          : 0;

    let type = "Daily Check-ins";
    if (currentStreak >= 30) type = "Monthly Master";
    else if (currentStreak >= 7) type = "Weekly Warrior";

    return { current: currentStreak, type, daysUntilNext };
  };

  const value: DataContextType = {
    moodEntries,
    journalEntries,
    chatMessages,
    userStats,
    addMoodEntry,
    addJournalEntry,
    addChatMessage,
    updateStats,
    earnAchievement,
    getStreakInfo,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
