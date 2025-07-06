import type { ChatMessage } from "@/contexts/DataContext";

export type ChatSession = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessage?: string;
  mood?: string;
  isActive?: boolean;
  summary?: string;
};

export type SessionMessage = ChatMessage & {
  sessionId: string;
};

// Generate session title from first few messages
export function generateSessionTitle(messages: ChatMessage[]): string {
  if (messages.length === 0) return "New Chat";

  const userMessages = messages.filter((msg) => msg.sender === "user");
  if (userMessages.length === 0) return "New Chat";

  const firstMessage = userMessages[0].content;

  // Extract meaningful keywords for title
  const words = firstMessage
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .split(" ")
    .filter((word) => word.length > 3)
    .filter(
      (word) =>
        ![
          "this",
          "that",
          "with",
          "have",
          "been",
          "very",
          "just",
          "like",
          "really",
          "feeling",
        ].includes(word),
    );

  if (words.length === 0) {
    // Fallback to time-based title
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `Chat at ${time}`;
  }

  // Create title from first 2-3 meaningful words
  const titleWords = words.slice(0, 3);
  let title = titleWords
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Cap length
  if (title.length > 30) {
    title = title.substring(0, 27) + "...";
  }

  return title;
}

// Analyze conversation mood for session
export function analyzeSessionMood(messages: ChatMessage[]): string {
  const userMessages = messages.filter((msg) => msg.sender === "user");
  if (userMessages.length === 0) return "neutral";

  // Count emotional indicators
  const emotionCounts: Record<string, number> = {
    positive: 0,
    negative: 0,
    neutral: 0,
  };

  userMessages.forEach((msg) => {
    const content = msg.content.toLowerCase();

    // Positive indicators
    if (
      /\b(happy|joy|excited|great|amazing|wonderful|love|good|better|fantastic|awesome|grateful|blessed|thrilled)\b/.test(
        content,
      )
    ) {
      emotionCounts.positive++;
    }
    // Negative indicators
    else if (
      /\b(sad|depressed|anxious|worried|scared|angry|frustrated|hurt|lonely|stressed|upset|terrible|awful|horrible)\b/.test(
        content,
      )
    ) {
      emotionCounts.negative++;
    }
    // Neutral
    else {
      emotionCounts.neutral++;
    }
  });

  // Determine overall mood
  const maxCount = Math.max(...Object.values(emotionCounts));
  if (emotionCounts.positive === maxCount) return "positive";
  if (emotionCounts.negative === maxCount) return "negative";
  return "neutral";
}

// Generate conversation summary
export function generateSessionSummary(messages: ChatMessage[]): string {
  if (messages.length === 0) return "";

  const userMessages = messages.filter((msg) => msg.sender === "user");
  if (userMessages.length === 0) return "No user messages";

  // Extract key themes and topics
  const topics: string[] = [];
  const emotions: string[] = [];

  const content = userMessages
    .map((msg) => msg.content.toLowerCase())
    .join(" ");

  // Detect topics
  const topicKeywords = {
    work: /\b(work|job|career|boss|colleague|office|meeting|project|deadline)\b/g,
    family:
      /\b(family|parent|mother|father|sibling|brother|sister|child|kids)\b/g,
    relationships:
      /\b(relationship|partner|boyfriend|girlfriend|husband|wife|friend|dating)\b/g,
    health: /\b(health|sick|doctor|hospital|medicine|therapy|exercise|diet)\b/g,
    school:
      /\b(school|university|college|student|exam|homework|study|class)\b/g,
    sleep: /\b(sleep|tired|exhausted|insomnia|dream|nightmare)\b/g,
    stress: /\b(stress|pressure|overwhelmed|busy|deadline|anxiety)\b/g,
  };

  Object.entries(topicKeywords).forEach(([topic, regex]) => {
    if (regex.test(content)) {
      topics.push(topic);
    }
  });

  // Detect emotions
  const emotionKeywords = {
    anxiety: /\b(anxious|worried|nervous|scared|panic|stress)\b/g,
    sadness: /\b(sad|depressed|down|hurt|lonely|crying)\b/g,
    happiness: /\b(happy|excited|joy|great|amazing|wonderful)\b/g,
    anger: /\b(angry|mad|frustrated|irritated|furious)\b/g,
    confusion: /\b(confused|lost|uncertain|unclear|puzzled)\b/g,
  };

  Object.entries(emotionKeywords).forEach(([emotion, regex]) => {
    if (regex.test(content)) {
      emotions.push(emotion);
    }
  });

  // Build summary
  let summary = "";

  if (topics.length > 0) {
    summary += `Topics: ${topics.join(", ")}`;
  }

  if (emotions.length > 0) {
    if (summary) summary += " | ";
    summary += `Emotions: ${emotions.join(", ")}`;
  }

  if (!summary) {
    // Fallback to message count and time
    const messageCount = userMessages.length;
    summary = `${messageCount} message${messageCount > 1 ? "s" : ""} exchanged`;
  }

  return summary;
}

// Group sessions by date for display
export function groupSessionsByDate(sessions: ChatSession[]): {
  today: ChatSession[];
  yesterday: ChatSession[];
  thisWeek: ChatSession[];
  older: ChatSession[];
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const grouped = {
    today: [] as ChatSession[],
    yesterday: [] as ChatSession[],
    thisWeek: [] as ChatSession[],
    older: [] as ChatSession[],
  };

  sessions.forEach((session) => {
    const sessionDate = new Date(session.createdAt);
    const sessionDay = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate(),
    );

    if (sessionDay.getTime() === today.getTime()) {
      grouped.today.push(session);
    } else if (sessionDay.getTime() === yesterday.getTime()) {
      grouped.yesterday.push(session);
    } else if (sessionDay >= weekAgo) {
      grouped.thisWeek.push(session);
    } else {
      grouped.older.push(session);
    }
  });

  return grouped;
}

// Get mood-based icon for session
export function getSessionMoodIcon(mood: string): string {
  const moodIcons: Record<string, string> = {
    positive: "😊",
    negative: "😔",
    neutral: "😐",
    anxiety: "😰",
    sadness: "😢",
    happiness: "😄",
    anger: "😠",
    confusion: "😕",
  };

  return moodIcons[mood] || "💭";
}

// Format session time for display
export function formatSessionTime(date: Date): string {
  const now = new Date();
  const sessionDate = new Date(date);

  // If today, show time
  if (sessionDate.toDateString() === now.toDateString()) {
    return sessionDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // If this week, show day and time
  const daysDiff = Math.floor(
    (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysDiff <= 7) {
    return sessionDate.toLocaleDateString([], {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Older, show date
  return sessionDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
