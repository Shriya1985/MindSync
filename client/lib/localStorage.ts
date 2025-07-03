// Simple localStorage service for local development
// No external APIs - everything stored locally in the browser

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  password: string; // For simulation only - never do this in production!
  createdAt: string;
}

export interface LocalUserStats {
  level: number;
  points: number;
  currentStreak: number;
  longestStreak: number;
  lastActivity: string;
}

// Storage keys
const STORAGE_KEYS = {
  CURRENT_USER: "mindsync_current_user",
  USERS: "mindsync_users",
  USER_STATS: "mindsync_user_stats",
  MOOD_ENTRIES: "mindsync_mood_entries",
  JOURNAL_ENTRIES: "mindsync_journal_entries",
  CHAT_MESSAGES: "mindsync_chat_messages",
  ACHIEVEMENTS: "mindsync_achievements",
  DAILY_QUESTS: "mindsync_daily_quests",
  COPING_SESSIONS: "mindsync_coping_sessions",
};

class LocalStorageService {
  // Generic get/set methods
  private get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  }

  // User management
  getCurrentUser(): LocalUser | null {
    return this.get<LocalUser | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  setCurrentUser(user: LocalUser | null): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  }

  getAllUsers(): LocalUser[] {
    return this.get<LocalUser[]>(STORAGE_KEYS.USERS, []);
  }

  addUser(user: LocalUser): void {
    const users = this.getAllUsers();
    users.push(user);
    this.set(STORAGE_KEYS.USERS, users);
  }

  updateUser(userId: string, updates: Partial<LocalUser>): LocalUser | null {
    const users = this.getAllUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) return null;

    users[userIndex] = { ...users[userIndex], ...updates };
    this.set(STORAGE_KEYS.USERS, users);

    // Update current user if it's the same
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      this.setCurrentUser(users[userIndex]);
    }

    return users[userIndex];
  }

  findUserByEmail(email: string): LocalUser | null {
    const users = this.getAllUsers();
    return users.find((u) => u.email === email) || null;
  }

  // Authentication simulation
  login(
    email: string,
    password: string,
  ): { success: boolean; user?: LocalUser; error?: string } {
    console.log("🔍 Looking for user with email:", email);

    const user = this.findUserByEmail(email);
    console.log("👤 Found user:", user ? "Yes" : "No");

    if (!user) {
      console.log("❌ User not found in localStorage");
      return { success: false, error: "User not found. Please sign up first." };
    }

    console.log("🔑 Checking password...");
    if (user.password !== password) {
      console.log("❌ Password mismatch");
      return { success: false, error: "Invalid password" };
    }

    console.log("✅ Login successful, setting current user");
    this.setCurrentUser(user);
    return { success: true, user };
  }

  register(
    email: string,
    password: string,
    name: string,
  ): { success: boolean; user?: LocalUser; error?: string } {
    console.log("📝 Registering new user:", email);

    // Check if user already exists
    if (this.findUserByEmail(email)) {
      console.log("❌ User already exists");
      return { success: false, error: "User already exists" };
    }

    const user: LocalUser = {
      id: Date.now().toString(),
      email,
      name,
      password,
      createdAt: new Date().toISOString(),
    };

    console.log("💾 Saving user to localStorage");
    this.addUser(user);
    this.setCurrentUser(user);

    // Initialize user stats
    this.setUserStats(user.id, {
      level: 1,
      points: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivity: new Date().toISOString().split("T")[0],
    });

    console.log("✅ Registration successful");
    return { success: true, user };
  }

  logout(): void {
    this.setCurrentUser(null);
  }

  // User stats
  getUserStats(userId: string): LocalUserStats {
    const allStats = this.get<Record<string, LocalUserStats>>(
      STORAGE_KEYS.USER_STATS,
      {},
    );
    return (
      allStats[userId] || {
        level: 1,
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivity: new Date().toISOString().split("T")[0],
      }
    );
  }

  setUserStats(userId: string, stats: LocalUserStats): void {
    const allStats = this.get<Record<string, LocalUserStats>>(
      STORAGE_KEYS.USER_STATS,
      {},
    );
    allStats[userId] = stats;
    this.set(STORAGE_KEYS.USER_STATS, allStats);
  }

  // Generic data methods for user-specific data
  getUserData<T>(
    userId: string,
    dataType: keyof typeof STORAGE_KEYS,
    defaultValue: T[],
  ): T[] {
    const allData = this.get<Record<string, T[]>>(STORAGE_KEYS[dataType], {});
    return allData[userId] || defaultValue;
  }

  setUserData<T>(
    userId: string,
    dataType: keyof typeof STORAGE_KEYS,
    data: T[],
  ): void {
    const allData = this.get<Record<string, T[]>>(STORAGE_KEYS[dataType], {});
    allData[userId] = data;
    this.set(STORAGE_KEYS[dataType], allData);
  }

  addUserDataItem<T extends { id: string }>(
    userId: string,
    dataType: keyof typeof STORAGE_KEYS,
    item: T,
  ): void {
    const currentData = this.getUserData<T>(userId, dataType, []);
    currentData.unshift(item); // Add to beginning
    this.setUserData(userId, dataType, currentData);
  }

  updateUserDataItem<T extends { id: string }>(
    userId: string,
    dataType: keyof typeof STORAGE_KEYS,
    id: string,
    updates: Partial<T>,
  ): void {
    const currentData = this.getUserData<T>(userId, dataType, []);
    const index = currentData.findIndex((item) => item.id === id);
    if (index !== -1) {
      currentData[index] = { ...currentData[index], ...updates };
      this.setUserData(userId, dataType, currentData);
    }
  }

  deleteUserDataItem(
    userId: string,
    dataType: keyof typeof STORAGE_KEYS,
    id: string,
  ): void {
    const currentData = this.getUserData(userId, dataType, []);
    const filteredData = currentData.filter((item: any) => item.id !== id);
    this.setUserData(userId, dataType, filteredData);
  }

  // Mood entry specific methods for DataContext compatibility
  async addMoodEntry(entry: any): Promise<any> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const moodEntry = {
      id: this.generateId(),
      ...entry,
    };

    this.addUserDataItem(currentUser.id, "MOOD_ENTRIES", moodEntry);
    return moodEntry;
  }

  // Get all user data for DataContext
  getAllUserData(): any {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return {};

    return {
      userStats: this.get(STORAGE_KEYS.USER_STATS, {
        level: 1,
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalEntries: 0,
        totalWords: 0,
        lastActivity: new Date().toISOString(),
      }),
      moodEntries: this.get(STORAGE_KEYS.MOOD_ENTRIES, []),
      journalEntries: this.get(STORAGE_KEYS.JOURNAL_ENTRIES, []),
      chatMessages: this.get(STORAGE_KEYS.CHAT_MESSAGES, []),
      achievements: this.get(STORAGE_KEYS.ACHIEVEMENTS, []),
      dailyQuests: this.get(STORAGE_KEYS.DAILY_QUESTS, []),
      copingSessions: this.get(STORAGE_KEYS.COPING_SESSIONS, []),
      pointActivities: [], // No existing point activities in localStorage
    };
  }

  // Utility methods
  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  exportAllData(): any {
    const data: any = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      data[name] = this.get(key, null);
    });
    return {
      ...data,
      exportedAt: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();

// Generate some fake AI responses for the chatbot
export const generateFakeAIResponse = (
  userMessage: string,
  mood?: string,
): string => {
  const responses = [
    "Thank you for sharing that with me! I can sense there's a lot on your mind. How has this been affecting your day-to-day life? 💙",
    "I really appreciate you opening up about this. It takes courage to share our thoughts and feelings. What would help you feel more supported right now? 🌟",
    "What you're experiencing sounds really significant. Sometimes just expressing these feelings can be the first step toward feeling better. How are you taking care of yourself through this? 💚",
    "I can hear how important this is to you. These feelings you're describing are completely valid. What's one small thing that has brought you comfort recently? ✨",
    "Thank you for trusting me with these thoughts. You're being so brave by talking about this. What would make today feel a little bit brighter for you? 🌻",
    "I sense there's a lot of wisdom in what you're sharing. Sometimes our emotions are trying to tell us something important. What feels most helpful to focus on right now? 🧠",
    "Your feelings matter so much, and I'm grateful you're sharing them with me. What's one thing you're looking forward to, even if it seems small? 🌈",
    "I can feel the strength it takes to share what you're going through. You're not alone in this. What kind of support feels most meaningful to you? 💝",
    "What you're describing resonates deeply. These experiences shape us in important ways. How would you like to move forward with this? 🌱",
    "I'm really honored that you're sharing this with me. Your thoughts and feelings are so valid. What brings you the most peace when things feel overwhelming? 🕊️",
  ];

  // Add mood-specific responses
  if (mood) {
    const moodResponses: Record<string, string[]> = {
      happy: [
        "I love hearing that you're feeling happy! ☀️ Your joy is absolutely contagious! What's been bringing you this wonderful feeling today?",
        "Your happiness is radiating through your words and it's making me smile too! 😊 What's been going particularly well for you lately?",
      ],
      sad: [
        "I can feel the sadness in your words, and I want you to know that it's completely okay to feel this way. 💙 These feelings are valid and important. What's been weighing on your heart?",
        "Thank you for sharing that you're feeling sad. Sometimes our hearts need to feel these emotions fully. What would bring you a little comfort right now? 🫂",
      ],
      anxious: [
        "I can sense the anxiety you're experiencing, and I want you to know that you're safe here with me. 🌿 Anxiety can feel so overwhelming. What's been on your mind that's causing this worry?",
        "That anxious feeling sounds really difficult to carry. You're being so brave by talking about it. What usually helps you feel more grounded when anxiety shows up? 💚",
      ],
      calm: [
        "I can feel the beautiful calmness in your energy, and it's so peaceful! 🌊 This sense of tranquility is precious. What's been helping you feel so centered today?",
        "Your calmness is like a gentle breeze that's making this whole conversation feel more serene. ☁️ What practices or thoughts are supporting this peaceful feeling?",
      ],
      excited: [
        "OH WOW! Your excitement is absolutely infectious! ✨ I can practically feel the sparkles of joy dancing around your words! What amazing thing has you feeling so energized?",
        "Your enthusiasm is lighting up this whole conversation! 🎉 I love when life feels this bright and full of possibilities! Tell me more about what's got you so excited!",
      ],
    };

    const moodSpecificResponses = moodResponses[mood];
    if (moodSpecificResponses) {
      responses.push(...moodSpecificResponses);
    }
  }

  // Return a random response
  return responses[Math.floor(Math.random() * responses.length)];
};
