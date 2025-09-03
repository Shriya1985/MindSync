import { showNotification } from "@/components/ui/notification-system";

export interface JournalMoodAnalysis {
  mood: string;
  rating: number;
  emoji: string;
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  keywords: string[];
}

// Simple keyword-based mood analysis for journal entries
const moodKeywords = {
  happy: {
    keywords: [
      "happy",
      "joy",
      "excited",
      "amazing",
      "wonderful",
      "great",
      "awesome",
      "fantastic",
      "love",
      "blessed",
      "grateful",
      "celebration",
      "success",
      "achievement",
      "smile",
      "laugh",
      "fun",
    ],
    emoji: "😊",
    baseRating: 8,
  },
  calm: {
    keywords: [
      "calm",
      "peaceful",
      "relaxed",
      "serene",
      "quiet",
      "tranquil",
      "content",
      "balanced",
      "centered",
      "meditation",
      "breathe",
      "rest",
      "gentle",
    ],
    emoji: "😌",
    baseRating: 7,
  },
  excited: {
    keywords: [
      "excited",
      "thrilled",
      "enthusiastic",
      "energetic",
      "pumped",
      "motivated",
      "inspired",
      "adventure",
      "opportunity",
      "new",
      "fresh",
    ],
    emoji: "✨",
    baseRating: 9,
  },
  sad: {
    keywords: [
      "sad",
      "down",
      "depressed",
      "unhappy",
      "crying",
      "tears",
      "lonely",
      "empty",
      "loss",
      "grief",
      "miss",
      "hurt",
      "pain",
    ],
    emoji: "😔",
    baseRating: 3,
  },
  anxious: {
    keywords: [
      "anxious",
      "worried",
      "stress",
      "nervous",
      "fear",
      "scared",
      "panic",
      "overwhelmed",
      "pressure",
      "tension",
      "uncertain",
    ],
    emoji: "😰",
    baseRating: 4,
  },
  frustrated: {
    keywords: [
      "frustrated",
      "angry",
      "annoyed",
      "irritated",
      "mad",
      "upset",
      "disappointed",
      "failed",
      "stuck",
      "difficult",
      "problem",
    ],
    emoji: "😤",
    baseRating: 4,
  },
  tired: {
    keywords: [
      "tired",
      "exhausted",
      "sleepy",
      "drained",
      "worn",
      "fatigue",
      "weary",
      "burnout",
      "overworked",
    ],
    emoji: "😴",
    baseRating: 5,
  },
  confused: {
    keywords: [
      "confused",
      "lost",
      "uncertain",
      "unclear",
      "mixed",
      "conflicted",
      "complicated",
      "complex",
      "don't know",
    ],
    emoji: "🤔",
    baseRating: 5,
  },
  grateful: {
    keywords: [
      "grateful",
      "thankful",
      "appreciate",
      "blessing",
      "fortunate",
      "lucky",
      "abundance",
      "gift",
    ],
    emoji: "🙏",
    baseRating: 8,
  },
  hopeful: {
    keywords: [
      "hope",
      "optimistic",
      "future",
      "better",
      "improve",
      "progress",
      "possibility",
      "potential",
      "dream",
    ],
    emoji: "🌟",
    baseRating: 7,
  },
};

export function analyzeJournalMood(
  content: string,
  title: string = "",
): JournalMoodAnalysis {
  const fullText = `${title} ${content}`.toLowerCase();
  const words = fullText.split(/\s+/);

  // Count mood keywords
  const moodScores: { [key: string]: { count: number; keywords: string[] } } =
    {};

  Object.entries(moodKeywords).forEach(([mood, config]) => {
    moodScores[mood] = { count: 0, keywords: [] };

    config.keywords.forEach((keyword) => {
      const occurrences = (fullText.match(new RegExp(keyword, "gi")) || [])
        .length;
      if (occurrences > 0) {
        moodScores[mood].count += occurrences;
        moodScores[mood].keywords.push(keyword);
      }
    });
  });

  // Find dominant mood
  let dominantMood = "neutral";
  let maxScore = 0;
  let detectedKeywords: string[] = [];

  Object.entries(moodScores).forEach(([mood, data]) => {
    if (data.count > maxScore) {
      maxScore = data.count;
      dominantMood = mood;
      detectedKeywords = data.keywords;
    }
  });

  // Default to neutral if no strong mood detected
  if (maxScore === 0) {
    // Check for general positive/negative indicators
    const positiveWords = ["good", "nice", "ok", "fine", "well", "better"];
    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "worse",
      "difficult",
      "hard",
    ];

    const positiveCount = positiveWords.reduce(
      (count, word) =>
        count + (fullText.match(new RegExp(word, "gi")) || []).length,
      0,
    );
    const negativeCount = negativeWords.reduce(
      (count, word) =>
        count + (fullText.match(new RegExp(word, "gi")) || []).length,
      0,
    );

    if (positiveCount > negativeCount) {
      dominantMood = "calm";
      detectedKeywords = ["positive tone"];
    } else if (negativeCount > positiveCount) {
      dominantMood = "sad";
      detectedKeywords = ["negative tone"];
    }
  }

  // Calculate rating and sentiment
  const moodConfig = moodKeywords[dominantMood as keyof typeof moodKeywords];
  const rating = moodConfig ? moodConfig.baseRating : 6;
  const emoji = moodConfig ? moodConfig.emoji : "😐";

  let sentiment: "positive" | "negative" | "neutral" = "neutral";
  if (rating >= 7) sentiment = "positive";
  else if (rating <= 4) sentiment = "negative";

  // Calculate confidence based on keyword frequency
  const confidence = Math.min(0.9, 0.3 + maxScore * 0.15);

  return {
    mood: dominantMood,
    rating,
    emoji,
    sentiment,
    confidence,
    keywords: detectedKeywords.slice(0, 3), // Top 3 keywords
  };
}

export function generateMoodInsight(analysis: JournalMoodAnalysis): string {
  const { mood, confidence, keywords } = analysis;

  if (confidence < 0.4) {
    return "Your journal reflects a mix of emotions today. Keep exploring your feelings through writing.";
  }

  const insights = {
    happy:
      "Your journal radiates positivity! It's wonderful to see you experiencing joy and contentment.",
    excited:
      "Your enthusiasm really shines through your words! This energy can be contagious to others around you.",
    calm: "Your writing reflects a peaceful state of mind. This inner tranquility is a beautiful thing to cultivate.",
    grateful:
      "Your sense of gratitude comes through beautifully. This mindset can enhance your overall well-being.",
    hopeful:
      "Your optimism for the future is inspiring. Hope is a powerful force for positive change.",
    sad: "I can sense some sadness in your words. Remember that it's okay to feel this way, and brighter days are ahead.",
    anxious:
      "Your writing shows some worry or stress. Consider some breathing exercises or talking to someone you trust.",
    frustrated:
      "I can feel some frustration in your journal. These feelings are valid - perhaps some physical activity might help?",
    tired:
      "Your words suggest you might be feeling drained. Remember to prioritize rest and self-care.",
    confused:
      "Your journal reflects some uncertainty. Writing about your thoughts is a great way to gain clarity.",
  };

  let insight =
    insights[mood as keyof typeof insights] ||
    "Your journal entry provides valuable insight into your emotional state.";

  if (keywords.length > 0) {
    insight += ` I noticed themes around: ${keywords.join(", ")}.`;
  }

  return insight;
}

export async function processJournalEntry(
  title: string,
  content: string,
  addMoodEntry: (entry: any) => Promise<void>,
): Promise<JournalMoodAnalysis> {
  // Analyze the mood
  const analysis = analyzeJournalMood(content, title);

  // Auto-create a mood entry based on journal analysis
  try {
    await addMoodEntry({
      date: new Date().toISOString().split("T")[0],
      mood: analysis.mood.charAt(0).toUpperCase() + analysis.mood.slice(1),
      rating: analysis.rating,
      emoji: analysis.emoji,
      source: "journal_analysis",
      notes: `Auto-detected from journal: "${title}"`,
    });

    // Show insight notification
    const insight = generateMoodInsight(analysis);
    showNotification({
      type: "encouragement",
      title: `Mood Detected: ${analysis.emoji} ${analysis.mood}`,
      message: insight,
      duration: 6000,
    });
  } catch (error) {
    console.error("Failed to create mood entry from journal:", error);
  }

  return analysis;
}
