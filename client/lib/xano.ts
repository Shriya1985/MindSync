// Xano API Configuration and Service
const XANO_BASE_URL =
  import.meta.env.VITE_XANO_BASE_URL ||
  "https://your-workspace.xano.io/api:your-api-group";

// Types for API responses
export interface XanoUser {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  created_at: number;
}

export interface XanoAuthResponse {
  authToken: string;
  user: XanoUser;
}

export interface XanoError {
  message: string;
  code?: string;
}

// Token management
class TokenManager {
  private static TOKEN_KEY = "xano_auth_token";

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

// Xano API Client
class XanoClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = TokenManager.getToken();

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (!response.ok) {
      const error: XanoError = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message);
    }

    return response.json();
  }

  // Authentication endpoints
  async signup(
    email: string,
    password: string,
    name: string,
  ): Promise<XanoAuthResponse> {
    return this.request<XanoAuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<XanoAuthResponse> {
    return this.request<XanoAuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    await this.request("/auth/logout", {
      method: "POST",
    });
  }

  async getProfile(): Promise<XanoUser> {
    return this.request<XanoUser>("/auth/me");
  }

  async updateProfile(updates: Partial<XanoUser>): Promise<XanoUser> {
    return this.request<XanoUser>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  // User Stats
  async getUserStats(): Promise<any> {
    return this.request("/user/stats");
  }

  async updateUserStats(stats: any): Promise<any> {
    return this.request("/user/stats", {
      method: "PATCH",
      body: JSON.stringify(stats),
    });
  }

  // Mood Entries
  async getMoodEntries(): Promise<any[]> {
    return this.request("/mood-entries");
  }

  async createMoodEntry(entry: any): Promise<any> {
    return this.request("/mood-entries", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  }

  async updateMoodEntry(id: string, updates: any): Promise<any> {
    return this.request(`/mood-entries/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async deleteMoodEntry(id: string): Promise<void> {
    await this.request(`/mood-entries/${id}`, {
      method: "DELETE",
    });
  }

  // Journal Entries
  async getJournalEntries(): Promise<any[]> {
    return this.request("/journal-entries");
  }

  async createJournalEntry(entry: any): Promise<any> {
    return this.request("/journal-entries", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  }

  async updateJournalEntry(id: string, updates: any): Promise<any> {
    return this.request(`/journal-entries/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async deleteJournalEntry(id: string): Promise<void> {
    await this.request(`/journal-entries/${id}`, {
      method: "DELETE",
    });
  }

  // Chat Messages
  async getChatMessages(): Promise<any[]> {
    return this.request("/chat-messages");
  }

  async createChatMessage(message: any): Promise<any> {
    return this.request("/chat-messages", {
      method: "POST",
      body: JSON.stringify(message),
    });
  }

  // Achievements
  async getAchievements(): Promise<any[]> {
    return this.request("/achievements");
  }

  async createAchievement(achievement: any): Promise<any> {
    return this.request("/achievements", {
      method: "POST",
      body: JSON.stringify(achievement),
    });
  }

  // Daily Quests
  async getDailyQuests(): Promise<any[]> {
    return this.request("/daily-quests");
  }

  async createDailyQuest(quest: any): Promise<any> {
    return this.request("/daily-quests", {
      method: "POST",
      body: JSON.stringify(quest),
    });
  }

  async completeDailyQuest(id: string): Promise<any> {
    return this.request(`/daily-quests/${id}/complete`, {
      method: "PATCH",
    });
  }

  // Coping Sessions
  async getCopingSessions(): Promise<any[]> {
    return this.request("/coping-sessions");
  }

  async createCopingSession(session: any): Promise<any> {
    return this.request("/coping-sessions", {
      method: "POST",
      body: JSON.stringify(session),
    });
  }
}

// Export singleton instance
export const xanoClient = new XanoClient(XANO_BASE_URL);
export { TokenManager };

// Export types for use in components
export type { XanoUser, XanoAuthResponse, XanoError };
