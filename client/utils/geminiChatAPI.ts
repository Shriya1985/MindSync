import type { ChatMessage, MoodEntry, JournalEntry, UserStats } from "@/contexts/DataContext";

export interface GeminiChatRequest {
  message: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
  }>;
  userContext?: {
    name?: string;
    mood?: string;
    recentMoods?: Array<{ mood: string; rating: number; date: string }>;
    recentJournals?: Array<{ title: string; content: string; date: string }>;
    userStats?: UserStats;
  };
  sessionId?: string;
}

export interface GeminiChatResponse {
  response: string;
  error?: string;
  sessionId?: string;
}

// Session storage management
class ChatSessionManager {
  private storageKey = 'mindsync_chat_sessions';
  
  getCurrentSessionId(): string {
    let sessionId = sessionStorage.getItem('current_chat_session');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('current_chat_session', sessionId);
    }
    return sessionId;
  }

  saveConversation(sessionId: string, messages: ChatMessage[]) {
    try {
      const sessions = this.getAllSessions();
      sessions[sessionId] = {
        messages: messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp.toISOString(),
          mood: msg.mood,
          sentiment: msg.sentiment
        })),
        lastUpdated: new Date().toISOString()
      };
      
      // Keep only last 10 sessions to manage storage
      const sessionKeys = Object.keys(sessions).sort((a, b) => 
        new Date(sessions[b].lastUpdated).getTime() - new Date(sessions[a].lastUpdated).getTime()
      );
      
      if (sessionKeys.length > 10) {
        sessionKeys.slice(10).forEach(key => delete sessions[key]);
      }
      
      sessionStorage.setItem(this.storageKey, JSON.stringify(sessions));
    } catch (error) {
      console.warn("Failed to save conversation to session storage:", error);
    }
  }

  getAllSessions(): Record<string, any> {
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn("Failed to load sessions from storage:", error);
      return {};
    }
  }

  createNewSession(): string {
    const sessionId = this.generateSessionId();
    sessionStorage.setItem('current_chat_session', sessionId);
    return sessionId;
  }

  private generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

const sessionManager = new ChatSessionManager();

export async function generateGeminiResponse(
  userMessage: string,
  context: {
    recentMessages: ChatMessage[];
    recentMoods: MoodEntry[];
    recentJournals: JournalEntry[];
    userStats: UserStats;
    userName?: string;
    currentMood?: string;
  }
): Promise<string> {
  try {
    const sessionId = sessionManager.getCurrentSessionId();

    // Prepare conversation history for API
    const conversationHistory = context.recentMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content,
      timestamp: msg.timestamp.toISOString()
    }));

    // Prepare user context
    const userContext = {
      name: context.userName,
      mood: context.currentMood,
      recentMoods: context.recentMoods.slice(0, 5).map(mood => ({
        mood: mood.mood,
        rating: mood.rating,
        date: mood.date
      })),
      recentJournals: context.recentJournals.slice(0, 3).map(journal => ({
        title: journal.title,
        content: journal.content.slice(0, 200), // Limit content length
        date: journal.date
      })),
      userStats: context.userStats
    };

    const requestData: GeminiChatRequest = {
      message: userMessage,
      conversationHistory,
      userContext,
      sessionId
    };

    console.log("🤖 Calling Gemini API with context...");

    const response = await fetch('/api/chat/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    // Check response status first
    if (!response.ok) {
      console.warn(`⚠️ HTTP error ${response.status}: ${response.statusText}`);
      return generateLocalFallback(userMessage, context);
    }

    // Then safely read the response body
    const data: GeminiChatResponse = await response.json();

    if (data.error) {
      console.warn("⚠️ Gemini service error, using fallback:", data.error);
      return data.response || generateLocalFallback(userMessage, context);
    }

    // Update session ID if provided
    if (data.sessionId) {
      sessionStorage.setItem('current_chat_session', data.sessionId);
    }

    // Save conversation to session storage (for future database migration)
    const updatedMessages = [
      ...context.recentMessages,
      {
        id: Date.now().toString(),
        content: userMessage,
        sender: 'user' as const,
        timestamp: new Date(),
        mood: context.currentMood
      },
      {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai' as const,
        timestamp: new Date()
      }
    ];
    
    sessionManager.saveConversation(sessionId, updatedMessages);

    console.log("✅ Gemini response received successfully");
    return data.response;

  } catch (error) {
    console.error("❌ Error calling Gemini API:", error);
    return generateLocalFallback(userMessage, context);
  }
}

function generateLocalFallback(
  userMessage: string,
  context: {
    recentMessages: ChatMessage[];
    recentMoods: MoodEntry[];
    recentJournals: JournalEntry[];
    userStats: UserStats;
    userName?: string;
    currentMood?: string;
  }
): string {
  const userName = context.userName || "friend";
  const messageLower = userMessage.toLowerCase();
  
  // Context-aware fallback responses
  if (messageLower.includes("anxious") || messageLower.includes("worried")) {
    return `I can hear the anxiety in your words, ${userName}. That feeling is completely valid. When we're anxious, it often helps to focus on what we can control right now. Have you tried any breathing exercises today? Sometimes a simple 4-7-8 breathing pattern can help calm our nervous system. 🌿`;
  }
  
  if (messageLower.includes("sad") || messageLower.includes("down")) {
    return `I can feel the sadness you're experiencing, ${userName}. It's okay to feel this way - our emotions need space to be felt before they can transform. You're being brave by sharing this with me. What's one small thing that brought you even a moment of comfort today? 💙`;
  }
  
  if (messageLower.includes("happy") || messageLower.includes("good") || messageLower.includes("great")) {
    return `Your positive energy is wonderful to feel, ${userName}! I'm so glad you're experiencing this joy. It's beautiful when we can appreciate these moments of happiness. What's been contributing to this good feeling? I'd love to hear what's going well for you! ✨`;
  }
  
  // Acknowledge user progress if they have a streak
  let response = `Thank you for sharing that with me, ${userName}. `;
  
  if (context.userStats.currentStreak > 0) {
    response += `I see you're on a ${context.userStats.currentStreak}-day wellness journey - that's amazing dedication! `;
  }
  
  response += `Your thoughts and feelings are important, and I'm here to listen and support you. What feels most helpful to talk about right now? 💚`;
  
  return response;
}

// Enhanced emotion detection for better responses
export function detectUserEmotion(message: string): {
  emotion: string;
  intensity: number;
  needsSupport: boolean;
} {
  const messageLower = message.toLowerCase();
  
  const emotionPatterns = {
    anxiety: {
      keywords: ["anxious", "worried", "nervous", "panic", "overwhelmed", "stressed"],
      intensity: 7,
      needsSupport: true
    },
    sadness: {
      keywords: ["sad", "down", "depressed", "empty", "hopeless", "lonely"],
      intensity: 8,
      needsSupport: true
    },
    anger: {
      keywords: ["angry", "mad", "frustrated", "irritated", "furious"],
      intensity: 6,
      needsSupport: true
    },
    happiness: {
      keywords: ["happy", "joy", "excited", "wonderful", "amazing", "great"],
      intensity: 3,
      needsSupport: false
    },
    fear: {
      keywords: ["scared", "afraid", "terrified", "frightened"],
      intensity: 8,
      needsSupport: true
    }
  };
  
  for (const [emotion, pattern] of Object.entries(emotionPatterns)) {
    if (pattern.keywords.some(keyword => messageLower.includes(keyword))) {
      return {
        emotion,
        intensity: pattern.intensity,
        needsSupport: pattern.needsSupport
      };
    }
  }
  
  return {
    emotion: "neutral",
    intensity: 5,
    needsSupport: false
  };
}

// Utility functions for future database migration
export const chatStorageUtils = {
  // Get all conversations for potential database export
  getAllConversations() {
    return sessionManager.getAllSessions();
  },

  // Export conversations in database-ready format
  exportForDatabase() {
    const sessions = sessionManager.getAllSessions();
    return Object.entries(sessions).map(([sessionId, data]) => ({
      sessionId,
      messages: data.messages,
      createdAt: data.lastUpdated,
      userId: 'current_user' // Placeholder for when user system is integrated
    }));
  },

  // Clear all local storage (useful for testing)
  clearAllSessions() {
    sessionStorage.removeItem('mindsync_chat_sessions');
    sessionStorage.removeItem('current_chat_session');
  },

  // Start new conversation
  startNewConversation() {
    return sessionManager.createNewSession();
  }
};
