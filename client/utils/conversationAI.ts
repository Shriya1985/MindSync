import type { ChatMessage, MoodEntry, JournalEntry, UserStats } from "@/contexts/DataContext";

export interface ConversationContext {
  recentMessages: ChatMessage[];
  recentMoods: MoodEntry[];
  recentJournals: JournalEntry[];
  userStats: UserStats;
  userName?: string;
}

export interface AIResponse {
  content: string;
  mood?: string;
  sentiment?: "positive" | "negative" | "neutral";
  suggestedActions?: string[];
}

// Generate contextual AI response using user data and conversation history
export async function generateContextualResponse(
  userMessage: string,
  context: ConversationContext
): Promise<AIResponse> {
  
  // Analyze user's current emotional state
  const currentMood = analyzeCurrentMood(context.recentMoods, context.recentMessages);
  
  // Get conversation pattern
  const conversationPattern = analyzeConversationPattern(context.recentMessages);
  
  // Generate personalized response
  const response = await generatePersonalizedResponse(
    userMessage,
    currentMood,
    conversationPattern,
    context
  );
  
  return response;
}

function analyzeCurrentMood(recentMoods: MoodEntry[], recentMessages: ChatMessage[]): {
  primary: string;
  trend: "improving" | "declining" | "stable";
  intensity: number;
} {
  // Get mood from recent entries
  const today = new Date().toISOString().split('T')[0];
  const recentMoodEntries = recentMoods.filter(mood => {
    const daysDiff = Math.floor((new Date().getTime() - new Date(mood.date).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 3;
  });

  // Get mood from recent chat messages
  const recentChatMoods = recentMessages
    .filter(msg => msg.mood && msg.sender === "user")
    .slice(0, 5);

  let primaryMood = "neutral";
  let avgRating = 5;
  let trend: "improving" | "declining" | "stable" = "stable";

  if (recentMoodEntries.length > 0) {
    const moodCounts: Record<string, number> = {};
    let totalRating = 0;
    
    recentMoodEntries.forEach(mood => {
      moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
      totalRating += mood.rating;
    });
    
    // Find most common mood
    primaryMood = Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b
    )[0];
    
    avgRating = totalRating / recentMoodEntries.length;

    // Analyze trend
    if (recentMoodEntries.length >= 2) {
      const recent = recentMoodEntries.slice(0, 2);
      const older = recentMoodEntries.slice(2, 4);
      
      const recentAvg = recent.reduce((sum, m) => sum + m.rating, 0) / recent.length;
      const olderAvg = older.length > 0 ? older.reduce((sum, m) => sum + m.rating, 0) / older.length : recentAvg;
      
      if (recentAvg > olderAvg + 0.5) trend = "improving";
      else if (recentAvg < olderAvg - 0.5) trend = "declining";
    }
  }

  return {
    primary: primaryMood,
    trend,
    intensity: Math.max(1, Math.min(10, Math.round(avgRating)))
  };
}

function analyzeConversationPattern(recentMessages: ChatMessage[]): {
  frequency: "new" | "regular" | "frequent";
  topics: string[];
  engagement: "low" | "medium" | "high";
} {
  const userMessages = recentMessages.filter(msg => msg.sender === "user");
  
  let frequency: "new" | "regular" | "frequent" = "new";
  if (userMessages.length > 10) frequency = "frequent";
  else if (userMessages.length > 3) frequency = "regular";

  // Simple topic extraction
  const topics: string[] = [];
  const topicKeywords = {
    anxiety: ["anxious", "worried", "stress", "nervous"],
    work: ["work", "job", "career", "boss", "office"],
    relationships: ["relationship", "friend", "family", "partner"],
    health: ["health", "exercise", "sleep", "tired"],
    goals: ["goal", "achievement", "progress", "success"]
  };

  userMessages.forEach(msg => {
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => msg.content.toLowerCase().includes(keyword))) {
        if (!topics.includes(topic)) topics.push(topic);
      }
    });
  });

  // Analyze engagement based on message length and frequency
  const avgLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length;
  let engagement: "low" | "medium" | "high" = "medium";
  
  if (avgLength > 100 && userMessages.length > 5) engagement = "high";
  else if (avgLength < 30 || userMessages.length < 2) engagement = "low";

  return { frequency, topics, engagement };
}

async function generatePersonalizedResponse(
  userMessage: string,
  currentMood: { primary: string; trend: "improving" | "declining" | "stable"; intensity: number },
  pattern: { frequency: "new" | "regular" | "frequent"; topics: string[]; engagement: "low" | "medium" | "high" },
  context: ConversationContext
): Promise<AIResponse> {
  
  // Create context-aware prompt
  const contextPrompt = buildContextPrompt(userMessage, currentMood, pattern, context);
  
  // For now, return an enhanced response based on patterns
  // In production, this would call GPT-4 or similar API
  const response = generateEnhancedResponse(userMessage, currentMood, pattern, context);
  
  return response;
}

function buildContextPrompt(
  userMessage: string,
  currentMood: { primary: string; trend: "improving" | "declining" | "stable"; intensity: number },
  pattern: { frequency: "new" | "regular" | "frequent"; topics: string[]; engagement: "low" | "medium" | "high" },
  context: ConversationContext
): string {
  let prompt = `You are an empathetic AI therapist assistant. Respond to the user's message with context:\n\n`;
  
  prompt += `User's Current State:
- Primary mood: ${currentMood.primary} (intensity: ${currentMood.intensity}/10)
- Mood trend: ${currentMood.trend}
- Conversation frequency: ${pattern.frequency} user
- Engagement level: ${pattern.engagement}
- Recent topics: ${pattern.topics.join(", ") || "general conversation"}

User Stats:
- Current streak: ${context.userStats.currentStreak} days
- Level: ${context.userStats.level}
- Total entries: ${context.userStats.totalEntries}

Recent conversation context:
${context.recentMessages.slice(-3).map(msg => `${msg.sender}: ${msg.content}`).join('\n')}

User's current message: "${userMessage}"

Respond with empathy, acknowledge their emotional state, and provide helpful guidance. Be specific and personal based on their history.`;

  return prompt;
}

function generateEnhancedResponse(
  userMessage: string,
  currentMood: { primary: string; trend: "improving" | "declining" | "stable"; intensity: number },
  pattern: { frequency: "new" | "regular" | "frequent"; topics: string[]; engagement: "low" | "medium" | "high" },
  context: ConversationContext
): AIResponse {
  
  const userName = context.userName || "friend";
  let responseContent = "";
  let detectedMood = currentMood.primary;
  let sentiment: "positive" | "negative" | "neutral" = "neutral";
  let suggestedActions: string[] = [];

  // Personalized greeting based on frequency
  if (pattern.frequency === "new") {
    responseContent += `Hello ${userName}! I'm glad you're here. `;
  } else if (pattern.frequency === "regular") {
    responseContent += `Good to see you again, ${userName}. `;
  } else {
    responseContent += `Welcome back, ${userName}! `;
  }

  // Acknowledge mood trend
  if (currentMood.trend === "improving") {
    responseContent += `I notice you've been feeling better lately - that's wonderful to see! `;
    sentiment = "positive";
  } else if (currentMood.trend === "declining") {
    responseContent += `I can sense things have been challenging for you recently. I'm here to support you. `;
    sentiment = "negative";
  }

  // Acknowledge streak
  if (context.userStats.currentStreak > 0) {
    responseContent += `I see you're on a ${context.userStats.currentStreak}-day streak - that's amazing dedication! `;
  }

  // Generate context-aware response based on mood and message content
  const messageLower = userMessage.toLowerCase();
  
  if (messageLower.includes("anxious") || messageLower.includes("worried")) {
    detectedMood = "anxious";
    responseContent += `I can hear the anxiety in your words. That feeling is completely valid. `;
    responseContent += `When we're anxious, it often helps to focus on what we can control right now. `;
    suggestedActions = ["Try a 5-minute breathing exercise", "Write down your worries", "Take a short walk"];
  } else if (messageLower.includes("sad") || messageLower.includes("down")) {
    detectedMood = "sad";
    responseContent += `I can feel the sadness you're experiencing. It's okay to feel this way. `;
    responseContent += `Sometimes our emotions need space to be felt before they can transform. `;
    suggestedActions = ["Practice self-compassion", "Listen to calming music", "Reach out to a friend"];
  } else if (messageLower.includes("happy") || messageLower.includes("good")) {
    detectedMood = "happy";
    responseContent += `Your positive energy is wonderful! I'm so glad you're feeling good. `;
    responseContent += `It's beautiful when we can appreciate these moments of joy. `;
    suggestedActions = ["Share your happiness with someone", "Practice gratitude", "Celebrate this moment"];
    sentiment = "positive";
  } else {
    responseContent += `Thank you for sharing that with me. I'm listening and I'm here for you. `;
  }

  // Add relevant topic-based response
  if (pattern.topics.includes("work")) {
    responseContent += `Work can be such a significant part of our lives and stress. Remember that your worth isn't defined by your productivity. `;
  }
  
  if (pattern.topics.includes("relationships")) {
    responseContent += `Relationships can be both our greatest source of joy and our biggest challenges. `;
  }

  // Encourage continued engagement
  responseContent += `What would feel most helpful for you right now?`;

  return {
    content: responseContent,
    mood: detectedMood,
    sentiment,
    suggestedActions
  };
}

// Enhanced emotion AI for better mood detection
export function detectEmotionFromText(text: string): {
  emotion: string;
  confidence: number;
  intensity: number;
} {
  const emotionPatterns = {
    anxiety: {
      keywords: ["anxious", "worried", "nervous", "panic", "overwhelmed", "stressed", "tense"],
      intensity: 6
    },
    sadness: {
      keywords: ["sad", "down", "depressed", "empty", "hopeless", "lonely", "grief"],
      intensity: 4
    },
    anger: {
      keywords: ["angry", "mad", "frustrated", "irritated", "furious", "annoyed"],
      intensity: 5
    },
    happiness: {
      keywords: ["happy", "joy", "excited", "wonderful", "amazing", "great", "love"],
      intensity: 8
    },
    fear: {
      keywords: ["scared", "afraid", "terrified", "frightened", "worried"],
      intensity: 3
    },
    calm: {
      keywords: ["calm", "peaceful", "relaxed", "content", "serene"],
      intensity: 7
    }
  };

  const textLower = text.toLowerCase();
  let bestMatch = { emotion: "neutral", confidence: 0, intensity: 5 };

  for (const [emotion, pattern] of Object.entries(emotionPatterns)) {
    let matches = 0;
    for (const keyword of pattern.keywords) {
      if (textLower.includes(keyword)) {
        matches++;
      }
    }
    
    const confidence = matches / pattern.keywords.length;
    if (confidence > bestMatch.confidence) {
      bestMatch = {
        emotion,
        confidence,
        intensity: pattern.intensity
      };
    }
  }

  return bestMatch;
}
