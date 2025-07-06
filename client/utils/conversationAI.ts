import type {
  ChatMessage,
  JournalEntry,
  MoodEntry,
} from "@/contexts/DataContext";

export type ConversationContext = {
  userMessage: string;
  recentMessages: ChatMessage[];
  recentMoods: MoodEntry[];
  recentJournals: JournalEntry[];
  userName?: string;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  conversationLength: number;
};

export type ResponseStyle = {
  tone: "supportive" | "gentle" | "encouraging" | "empathetic" | "celebrating";
  formality: "casual" | "warm" | "professional";
  emotionalIntensity: "low" | "medium" | "high";
};

// Enhanced emotion detection with context
export function analyzeMessageEmotion(message: string): {
  primaryEmotion: string;
  intensity: number;
  confidence: number;
  keywords: string[];
  sentiment: "positive" | "negative" | "neutral";
} {
  const lowerMessage = message.toLowerCase();

  const emotionPatterns = {
    joy: {
      keywords: [
        "happy",
        "excited",
        "wonderful",
        "amazing",
        "great",
        "fantastic",
        "awesome",
        "love",
        "brilliant",
        "thrilled",
        "grateful",
        "blessed",
        "perfect",
        "incredible",
      ],
      phrases: [
        "feeling good",
        "going well",
        "so happy",
        "really excited",
        "love it",
      ],
    },
    sadness: {
      keywords: [
        "sad",
        "depressed",
        "down",
        "hurt",
        "lonely",
        "empty",
        "hopeless",
        "crying",
        "tears",
        "miserable",
        "heartbroken",
        "devastated",
      ],
      phrases: [
        "feeling down",
        "really sad",
        "so upset",
        "want to cry",
        "feel empty",
      ],
    },
    anxiety: {
      keywords: [
        "anxious",
        "worried",
        "nervous",
        "scared",
        "afraid",
        "panic",
        "stress",
        "overwhelmed",
        "tense",
        "restless",
        "paranoid",
      ],
      phrases: [
        "cant stop thinking",
        "worried about",
        "so anxious",
        "really scared",
        "feel panicked",
      ],
    },
    anger: {
      keywords: [
        "angry",
        "mad",
        "furious",
        "irritated",
        "frustrated",
        "rage",
        "hate",
        "disgusted",
        "annoyed",
        "pissed",
      ],
      phrases: [
        "so angry",
        "really mad",
        "cant stand",
        "makes me furious",
        "really frustrated",
      ],
    },
    fear: {
      keywords: [
        "afraid",
        "scared",
        "terrified",
        "frightened",
        "panic",
        "terror",
        "phobia",
        "nightmare",
      ],
      phrases: [
        "so scared",
        "really afraid",
        "terrifies me",
        "having nightmares",
      ],
    },
    confusion: {
      keywords: [
        "confused",
        "lost",
        "uncertain",
        "unclear",
        "puzzled",
        "bewildered",
        "dont understand",
      ],
      phrases: [
        "so confused",
        "dont know",
        "not sure",
        "really lost",
        "dont understand",
      ],
    },
    calm: {
      keywords: [
        "calm",
        "peaceful",
        "relaxed",
        "serene",
        "tranquil",
        "centered",
        "balanced",
        "zen",
      ],
      phrases: [
        "feeling calm",
        "so peaceful",
        "really relaxed",
        "feel centered",
      ],
    },
  };

  let scores: Record<string, number> = {};
  let foundKeywords: string[] = [];

  // Score each emotion based on keywords and phrases
  Object.entries(emotionPatterns).forEach(([emotion, patterns]) => {
    let score = 0;

    // Check keywords
    patterns.keywords.forEach((keyword) => {
      if (lowerMessage.includes(keyword)) {
        score += 1;
        foundKeywords.push(keyword);
      }
    });

    // Check phrases (higher weight)
    patterns.phrases.forEach((phrase) => {
      if (lowerMessage.includes(phrase)) {
        score += 2;
        foundKeywords.push(phrase);
      }
    });

    scores[emotion] = score;
  });

  // Find dominant emotion
  const maxScore = Math.max(...Object.values(scores));
  const primaryEmotion =
    Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] ||
    "neutral";

  // Calculate intensity (0-10) based on context
  const intensityModifiers = {
    really: 2,
    very: 1.5,
    extremely: 3,
    so: 1.5,
    incredibly: 2.5,
    absolutely: 2,
    completely: 2,
    totally: 1.5,
    utterly: 3,
  };

  let intensityBoost = 0;
  Object.entries(intensityModifiers).forEach(([modifier, boost]) => {
    if (lowerMessage.includes(modifier)) intensityBoost += boost;
  });

  const baseIntensity =
    maxScore > 0 ? Math.min(10, maxScore * 2 + intensityBoost) : 3;

  // Determine sentiment
  const positiveEmotions = ["joy", "calm"];
  const negativeEmotions = ["sadness", "anxiety", "anger", "fear"];
  let sentiment: "positive" | "negative" | "neutral" = "neutral";

  if (positiveEmotions.includes(primaryEmotion)) sentiment = "positive";
  else if (negativeEmotions.includes(primaryEmotion)) sentiment = "negative";

  return {
    primaryEmotion,
    intensity: baseIntensity,
    confidence: maxScore > 0 ? Math.min(1, maxScore / 3) : 0.3,
    keywords: foundKeywords,
    sentiment,
  };
}

// Context-aware response generation
export function generateContextualResponse(
  context: ConversationContext,
): string {
  const {
    userMessage,
    recentMessages,
    recentMoods,
    timeOfDay,
    conversationLength,
  } = context;

  // Analyze current message emotion
  const emotion = analyzeMessageEmotion(userMessage);

  // Determine response style based on context
  const responseStyle = determineResponseStyle(
    emotion,
    recentMessages,
    conversationLength,
  );

  // Get conversation history insights
  const conversationInsights = analyzeConversationFlow(recentMessages);

  // Generate personalized response
  return buildPersonalizedResponse({
    userMessage,
    emotion,
    responseStyle,
    timeOfDay,
    conversationInsights,
    recentMoods,
    conversationLength,
  });
}

function determineResponseStyle(
  emotion: ReturnType<typeof analyzeMessageEmotion>,
  recentMessages: ChatMessage[],
  conversationLength: number,
): ResponseStyle {
  // Adjust tone based on emotion and intensity
  let tone: ResponseStyle["tone"] = "supportive";

  if (emotion.sentiment === "positive" && emotion.intensity > 7) {
    tone = "celebrating";
  } else if (emotion.intensity > 8 && emotion.sentiment === "negative") {
    tone = "empathetic";
  } else if (emotion.intensity < 4) {
    tone = "gentle";
  } else if (emotion.sentiment === "positive") {
    tone = "encouraging";
  }

  // Adjust formality based on conversation length
  const formality: ResponseStyle["formality"] =
    conversationLength > 5 ? "casual" : "warm";

  return {
    tone,
    formality,
    emotionalIntensity:
      emotion.intensity > 7 ? "high" : emotion.intensity > 4 ? "medium" : "low",
  };
}

function analyzeConversationFlow(recentMessages: ChatMessage[]): {
  topics: string[];
  emotionalProgression: string[];
  needsFollowUp: boolean;
  lastUserConcern?: string;
} {
  const userMessages = recentMessages
    .filter((msg) => msg.sender === "user")
    .slice(-3);

  // Extract topics and themes
  const topics: string[] = [];
  const emotionalProgression: string[] = [];

  userMessages.forEach((msg) => {
    const emotion = analyzeMessageEmotion(msg.content);
    emotionalProgression.push(emotion.primaryEmotion);

    // Simple topic extraction (could be enhanced with NLP)
    const content = msg.content.toLowerCase();
    if (content.includes("work") || content.includes("job"))
      topics.push("work");
    if (
      content.includes("family") ||
      content.includes("parent") ||
      content.includes("sibling")
    )
      topics.push("family");
    if (
      content.includes("relationship") ||
      content.includes("partner") ||
      content.includes("friend")
    )
      topics.push("relationships");
    if (content.includes("sleep") || content.includes("tired"))
      topics.push("sleep");
    if (content.includes("school") || content.includes("study"))
      topics.push("education");
  });

  // Check if last message needs follow-up
  const lastMessage = userMessages[userMessages.length - 1];
  const needsFollowUp = lastMessage
    ? lastMessage.content.includes("?") ||
      analyzeMessageEmotion(lastMessage.content).intensity > 7
    : false;

  return {
    topics: [...new Set(topics)],
    emotionalProgression,
    needsFollowUp,
    lastUserConcern: needsFollowUp ? lastMessage?.content : undefined,
  };
}

function buildPersonalizedResponse({
  userMessage,
  emotion,
  responseStyle,
  timeOfDay,
  conversationInsights,
  recentMoods,
  conversationLength,
}: {
  userMessage: string;
  emotion: ReturnType<typeof analyzeMessageEmotion>;
  responseStyle: ResponseStyle;
  timeOfDay: string;
  conversationInsights: ReturnType<typeof analyzeConversationFlow>;
  recentMoods: MoodEntry[];
  conversationLength: number;
}): string {
  // Acknowledgment of the user's message
  const acknowledgments = generateAcknowledgment(userMessage, emotion);

  // Main empathetic response
  const mainResponse = generateMainResponse(
    emotion,
    responseStyle,
    conversationInsights,
  );

  // Follow-up question or suggestion
  const followUp = generateFollowUp(
    emotion,
    conversationInsights,
    timeOfDay,
    recentMoods,
  );

  // Combine components naturally
  return `${acknowledgments} ${mainResponse} ${followUp}`;
}

function generateAcknowledgment(
  userMessage: string,
  emotion: ReturnType<typeof analyzeMessageEmotion>,
): string {
  const acknowledgments = {
    high_positive: [
      "I can absolutely feel the joy radiating from your words!",
      "Your excitement is absolutely contagious!",
      "The happiness in your message is just wonderful to witness!",
      "I'm practically glowing with happiness for you right now!",
    ],
    medium_positive: [
      "I can sense the positive energy in what you're sharing,",
      "There's such lovely warmth in your words,",
      "I can feel the contentment in your message,",
      "Your optimism really comes through here,",
    ],
    high_negative: [
      "I can feel the deep pain in your words,",
      "My heart really goes out to you right now,",
      "I can sense how difficult this is for you,",
      "The struggle you're describing sounds so overwhelming,",
    ],
    medium_negative: [
      "I hear the concern in what you're sharing,",
      "I can sense you're going through something challenging,",
      "It sounds like you're carrying some difficult feelings,",
      "I understand that this situation is weighing on you,",
    ],
    neutral: [
      "Thank you for sharing that with me,",
      "I appreciate you opening up about this,",
      "I'm here and listening to what you're telling me,",
      "I want you to know I'm truly present with what you're sharing,",
    ],
  };

  let category = "neutral";
  if (emotion.sentiment === "positive" && emotion.intensity > 7)
    category = "high_positive";
  else if (emotion.sentiment === "positive") category = "medium_positive";
  else if (emotion.sentiment === "negative" && emotion.intensity > 7)
    category = "high_negative";
  else if (emotion.sentiment === "negative") category = "medium_negative";

  const options = acknowledgments[category as keyof typeof acknowledgments];
  return options[Math.floor(Math.random() * options.length)];
}

function generateMainResponse(
  emotion: ReturnType<typeof analyzeMessageEmotion>,
  responseStyle: ResponseStyle,
  conversationInsights: ReturnType<typeof analyzeConversationFlow>,
): string {
  const { primaryEmotion, intensity, sentiment } = emotion;
  const { tone, emotionalIntensity } = responseStyle;

  const responses = {
    joy: {
      high: [
        "Your happiness is like sunshine that's brightening up our entire conversation! 🌟 These moments of pure joy are such precious gifts, and I'm so honored to share in this beautiful energy with you.",
        "The excitement and joy bursting from your words is absolutely infectious! 💫 Life feels magical when happiness hits like this, doesn't it? This kind of positive energy makes everything feel possible!",
        "I am absolutely glowing with happiness for you right now! 🌈 Your joy is like the most beautiful music filling up this space with light and wonder.",
      ],
      medium: [
        "I can feel the warm happiness in your words, and it's making my heart smile! 😊 There's something so beautiful about when life starts feeling hopeful and bright.",
        "There's such gorgeous positive energy flowing through what you're sharing! ✨ I love when we can pause and really appreciate these good moments.",
        "I can sense this wonderful contentment and joy in your message, and it's nourishing my soul! 🌸",
      ],
      low: [
        "I notice some lovely positive feelings in your words, and it makes my heart happy! 🌻",
        "There's such gentle, peaceful happiness in what you're sharing, and these quieter moments of contentment are treasures.",
        "I can sense some wonderful optimism sparkling through! 🌟",
      ],
    },
    sadness: {
      high: [
        "and it just breaks my heart that you're carrying such deep pain. 💙 What you're feeling right now is so valid and human. Even in this darkness, you reached out to me, and that shows incredible courage.",
        "and I wish I could wrap you in the warmest, most healing embrace right now. 🫂 Depression and sadness can make everything feel impossible, but you're not alone in this - I'm here with you.",
        "and my heart truly aches with yours. 💝 When pain hits this deeply, it can feel like drowning in emotions, but look - you're here, sharing your truth with me. That's profound strength.",
      ],
      medium: [
        "and I can feel the sadness like a gentle rain cloud over your heart. 🌧️ These difficult emotions deserve compassion, especially from yourself.",
        "and there's a tenderness in your sadness that I want to honor. 💚 When we're going through tough times, even simple things can feel overwhelming.",
        "and I'm honored that you're sharing this vulnerable space with me. 🌸 Feelings are temporary visitors, not permanent residents.",
      ],
      low: [
        "and I notice a gentle melancholy that's part of the beautiful complexity of being human. 🌙",
        "and there's a softness to these feelings that deserves acknowledgment. 💜",
        "and I sense you're not feeling your brightest today, which is completely valid. 🌻",
      ],
    },
    anxiety: {
      high: [
        "and I can feel the intense anxiety radiating from your words. 💙 Anxiety at this level can feel like a storm in your chest, making everything seem threatening. You're being incredibly brave by reaching out.",
        "and I can sense the overwhelming worry you're carrying. 🤗 When anxiety hits this hard, it can feel like drowning in your own thoughts, but you're fighting back by being here.",
        "and I hear the fear and worry in every word. 💝 Anxiety can make the whole world feel unsafe, but you're in a safe space with me right now.",
      ],
      medium: [
        "and I can feel the nervous energy you're experiencing. 🌸 Sometimes our minds work overtime trying to protect us by creating worry.",
        "and that anxious feeling is so completely human and understandable. 💚 Our minds are amazing at scanning for problems, even when we wish they'd give us a break.",
        "and I can sense the underlying worry you're carrying. 🌺 Anxiety often whispers 'what if' scenarios that may never happen.",
      ],
      low: [
        "and I notice a gentle undercurrent of concern, which shows how thoughtful you are. 🌿",
        "and there's a touch of worry here that's completely normal when facing uncertainty. 💫",
        "and I can pick up on some unease, which I appreciate you sharing honestly. 🌻",
      ],
    },
    anger: {
      high: [
        "and I can feel the fierce fire of your anger, which is completely valid. 🔥 Sometimes anger is our inner warrior saying 'This is NOT okay!' Your feelings are telling you something important.",
        "and the intensity of your anger is palpable. 💥 When we feel rage this powerful, it usually means something we deeply care about has been threatened.",
        "and I can hear the roaring fire in your words. 🚨 Anger this intense is information - it's your soul's alarm system going off about something important.",
      ],
      medium: [
        "and I can sense the frustration and irritation bubbling up, which makes complete sense. 😤 It's natural to feel angry when things don't align with our needs.",
        "and there's clear frustration here that's actually valuable information about your boundaries. 💭 Sometimes anger is like a compass pointing toward what matters.",
        "and I understand you're feeling frustrated, which often happens when there's a mismatch between what we need and what we're experiencing. 🌪️",
      ],
      low: [
        "and I can sense some irritation or frustration simmering beneath the surface. 💭",
        "and there's a hint of annoyance that seems pretty understandable given the situation. 🌊",
        "and I notice some frustration that deserves to be acknowledged. 💙",
      ],
    },
    fear: {
      high: [
        "and I can feel the intense fear you're experiencing. 💙 Fear at this level can be absolutely paralyzing, but you're being so brave by facing it and sharing it.",
        "and the terror you're describing sounds overwhelming. 🫂 When fear grips us this tightly, it can feel like the world is full of dangers.",
        "and I can sense the deep fear that's gripping you right now. 💝 This kind of fear can make everything feel threatening and unsafe.",
      ],
      medium: [
        "and I can feel the worry and fear you're carrying. 🌸 Fear is our mind's way of trying to protect us, even when it feels uncomfortable.",
        "and there's a nervousness and fear that's completely understandable. 💚 Our fears often point to things we care deeply about.",
        "and I sense the apprehension you're feeling. 🌺 Fear can be our mind's way of preparing us for challenges.",
      ],
      low: [
        "and I notice some underlying concern or worry. 🌿",
        "and there's a touch of apprehension that makes sense. 💫",
        "and I can pick up on some unease about the situation. 🌻",
      ],
    },
  };

  const emotionResponses =
    responses[primaryEmotion as keyof typeof responses] || responses.sadness;
  const intensityLevel =
    intensity > 7 ? "high" : intensity > 4 ? "medium" : "low";
  const options = emotionResponses[intensityLevel];

  return options[Math.floor(Math.random() * options.length)];
}

function generateFollowUp(
  emotion: ReturnType<typeof analyzeMessageEmotion>,
  conversationInsights: ReturnType<typeof analyzeConversationFlow>,
  timeOfDay: string,
  recentMoods: MoodEntry[],
): string {
  const { primaryEmotion, intensity, sentiment } = emotion;
  const { topics, emotionalProgression, needsFollowUp } = conversationInsights;

  // Context-aware follow-ups
  const followUps = {
    joy: [
      "What's been the most wonderful part of this experience for you?",
      "How can we capture and extend this beautiful feeling?",
      "What would you like to do to celebrate this happiness?",
      "I'd love to hear more about what's bringing you such joy!",
    ],
    sadness: [
      "What would feel like the most supportive thing for you right now?",
      "Is there anything specific that's been weighing most heavily on your heart?",
      "What usually brings you even a small amount of comfort during difficult times?",
      "Would it help to talk about what's been most challenging today?",
    ],
    anxiety: [
      "What part of this situation feels like something you might have some control over?",
      "What tools or strategies have been your friends during anxious moments before?",
      "Would it help to focus on what you can influence today, rather than all the unknowns?",
      "What would help you feel just a little bit safer or more grounded right now?",
    ],
    anger: [
      "What core values or boundaries of yours feel like they've been crossed?",
      "What would need to change for you to feel truly respected and heard?",
      "What's the most important thing for others to understand about this situation?",
      "How would you like to channel this energy in a way that serves you?",
    ],
    fear: [
      "What would help you feel even slightly safer in this moment?",
      "What support systems or resources do you have available to you?",
      "Is there a part of this fear that feels manageable or within your control?",
      "What has helped you face difficult situations in the past?",
    ],
    confusion: [
      "What aspect of this situation feels most unclear to you?",
      "What information or support would help bring some clarity?",
      "Would it help to break this down into smaller, more manageable pieces?",
      "What does your intuition tell you about this situation?",
    ],
  };

  // Time-sensitive follow-ups
  const timeBasedFollowUps = {
    morning: "How would you like the rest of your day to unfold?",
    afternoon:
      "What would make the remainder of your day feel more aligned with what you need?",
    evening: "How are you feeling about winding down for the day?",
    night: "What would help you feel peaceful as you prepare for rest?",
  };

  const baseFollowUps =
    followUps[primaryEmotion as keyof typeof followUps] || followUps.sadness;
  const selectedFollowUp =
    baseFollowUps[Math.floor(Math.random() * baseFollowUps.length)];

  // Add time context for certain emotions and times
  if (
    (primaryEmotion === "anxiety" || primaryEmotion === "sadness") &&
    (timeOfDay === "evening" || timeOfDay === "night")
  ) {
    return `${selectedFollowUp} Also, ${timeBasedFollowUps[timeOfDay]}`;
  }

  return selectedFollowUp;
}

// Helper to determine time of day
export function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}
