import type {
  ChatMessage,
  JournalEntry,
  MoodEntry,
} from "@/contexts/DataContext";

export type EmotionalState = {
  primary: string;
  intensity: number; // 1-10
  confidence: number; // 0-1
  secondaryEmotions: string[];
  triggers?: string[];
  trends: "improving" | "declining" | "stable";
};

export type CopingStrategy = {
  id: string;
  title: string;
  description: string;
  duration: string;
  steps: string[];
  category: "breathing" | "grounding" | "cognitive" | "physical" | "creative";
  icon: string;
};

export type DailyQuest = {
  id: string;
  title: string;
  description: string;
  category:
    | "gratitude"
    | "mindfulness"
    | "connection"
    | "movement"
    | "creativity";
  xp: number;
  completed: boolean;
  icon: string;
  difficulty: "easy" | "medium" | "hard";
};

// Advanced emotion detection from text
export function analyzeEmotionalState(
  text: string,
  recentMoods: MoodEntry[],
  recentJournals: JournalEntry[],
): EmotionalState {
  const emotionKeywords = {
    anxiety: [
      "anxious",
      "worried",
      "nervous",
      "stressed",
      "overwhelmed",
      "panic",
      "fear",
    ],
    depression: [
      "sad",
      "depressed",
      "hopeless",
      "empty",
      "worthless",
      "lonely",
      "down",
    ],
    anger: [
      "angry",
      "frustrated",
      "mad",
      "irritated",
      "furious",
      "annoyed",
      "rage",
    ],
    joy: [
      "happy",
      "excited",
      "elated",
      "cheerful",
      "delighted",
      "thrilled",
      "euphoric",
    ],
    calm: [
      "peaceful",
      "relaxed",
      "serene",
      "tranquil",
      "centered",
      "balanced",
      "zen",
    ],
    gratitude: ["grateful", "thankful", "blessed", "appreciative", "lucky"],
    hope: [
      "hopeful",
      "optimistic",
      "confident",
      "positive",
      "motivated",
      "determined",
    ],
    confusion: ["confused", "uncertain", "lost", "unclear", "puzzled", "mixed"],
  };

  const lowerText = text.toLowerCase();
  const emotionScores: Record<string, number> = {};

  // Analyze text for emotional keywords
  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    const matches = keywords.filter((keyword) => lowerText.includes(keyword));
    emotionScores[emotion] = matches.length;
  });

  // Consider recent mood history for context
  const recentAvgMood =
    recentMoods.length > 0
      ? recentMoods.reduce((sum, mood) => sum + mood.rating, 0) /
        recentMoods.length
      : 5;

  // Adjust scores based on mood trend
  if (recentAvgMood < 4) {
    emotionScores.depression += 1;
    emotionScores.anxiety += 0.5;
  } else if (recentAvgMood > 7) {
    emotionScores.joy += 1;
    emotionScores.calm += 0.5;
  }

  // Find primary emotion
  const primaryEmotion =
    Object.entries(emotionScores).reduce((a, b) =>
      emotionScores[a[0]] > emotionScores[b[0]] ? a : b,
    )[0] || "neutral";

  // Calculate intensity based on text length and keyword density
  const wordCount = text.split(" ").length;
  const keywordDensity =
    Object.values(emotionScores).reduce((sum, score) => sum + score, 0) /
    wordCount;
  const intensity = Math.min(
    10,
    Math.max(1, Math.round(keywordDensity * 10 + recentAvgMood)),
  );

  // Determine trend
  const moodTrend =
    recentMoods.length >= 3
      ? recentMoods
          .slice(0, 3)
          .every((mood, i, arr) => i === 0 || mood.rating >= arr[i - 1].rating)
        ? "improving"
        : recentMoods
              .slice(0, 3)
              .every(
                (mood, i, arr) => i === 0 || mood.rating <= arr[i - 1].rating,
              )
          ? "declining"
          : "stable"
      : "stable";

  return {
    primary: primaryEmotion,
    intensity,
    confidence: Math.min(1, keywordDensity + 0.3),
    secondaryEmotions: Object.entries(emotionScores)
      .filter(([emotion, score]) => emotion !== primaryEmotion && score > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([emotion]) => emotion),
    trends: moodTrend,
  };
}

// Generate emotion-aware responses
export function generateEmotionAwareResponse(
  userMessage: string,
  emotionalState: EmotionalState,
  userHistory: {
    chats: ChatMessage[];
    journals: JournalEntry[];
    moods: MoodEntry[];
  },
): string {
  const { primary, intensity, trends } = emotionalState;

  const responseTemplates = {
    anxiety: {
      high: [
        "I can sense you're feeling quite anxious right now. That's completely understandable - anxiety can feel overwhelming. Let's take this one step at a time. Can you tell me what's weighing most heavily on your mind?",
        "Your anxiety is very real and valid. When we feel this way, our minds can spiral. I'm here to help ground you. What would help you feel safer in this moment?",
        "I hear the worry in your words. Anxiety can make everything feel urgent and scary. You're being so brave by reaching out. What's one small thing that usually brings you comfort?",
      ],
      medium: [
        "I can tell you're feeling anxious about this. It's natural to feel this way when facing uncertainty. What aspects of this situation feel most manageable to you right now?",
        "That anxious feeling is your mind trying to protect you, even if it doesn't feel helpful right now. What's helped you through similar feelings before?",
        "I understand you're feeling worried. Sometimes when we're anxious, it helps to focus on what we can control. What feels within your power right now?",
      ],
      low: [
        "I notice some concern in what you're sharing. It's good that you're aware of these feelings. How would you like to approach this situation?",
        "There seems to be some worry here, which is completely normal. What's your intuition telling you about how to move forward?",
        "I can sense some unease. Sometimes acknowledging these feelings is the first step. What would make you feel more at peace with this?",
      ],
    },
    depression: {
      high: [
        "I can feel the heaviness in your words, and I want you to know that you're not alone in this darkness. What you're experiencing is real and difficult, but you've shown incredible strength by reaching out. What's one tiny thing that felt okay today?",
        "The sadness you're carrying sounds so painful. Depression can make everything feel impossible, but you're here, and that matters more than you know. Is there anything that brought even a moment of relief recently?",
        "I hear how hard things are for you right now. When we're in deep pain like this, even breathing can feel difficult. You're doing better than you think. What's keeping you going today?",
      ],
      medium: [
        "I can sense the sadness you're carrying. Depression can make everything feel gray and difficult. What's been the hardest part of your day?",
        "There's a heaviness in what you're sharing. When you're feeling this way, even small tasks can feel overwhelming. What feels most important to focus on right now?",
        "I understand you're going through a difficult time. Sometimes when we're low, it helps to acknowledge the struggle. What would bring you a small sense of accomplishment today?",
      ],
      low: [
        "I notice you might be feeling down. It's okay to have these low moments - they're part of being human. What usually helps lift your spirits a little?",
        "There seems to be some sadness here. Sometimes naming these feelings can help. What would make today feel a bit brighter for you?",
        "I can sense you're not feeling your best. That's completely valid. What's one thing you're looking forward to, even if it's small?",
      ],
    },
    joy: {
      high: [
        "Your joy is absolutely radiating through your words! This kind of happiness is beautiful to witness. What's bringing you such wonderful feelings today?",
        "I can feel your excitement and it's contagious! It's amazing when life feels this bright. How can you carry this positive energy into the rest of your day?",
        "The happiness in your message is lighting up our conversation! These moments of pure joy are precious. What makes this feeling so special for you?",
      ],
      medium: [
        "I can hear the happiness in what you're sharing! It's wonderful when things feel positive and hopeful. What's contributing to this good feeling?",
        "There's such lovely positive energy in your words. It's beautiful when we can appreciate the good moments. What's been going particularly well for you?",
        "I sense contentment and joy in your message. These feelings are so nourishing for our souls. What would you like to celebrate about today?",
      ],
      low: [
        "I can sense some positive feelings coming through. It's nice when things feel a bit brighter. What's been working well for you lately?",
        "There's a gentle happiness in what you're sharing. Sometimes these quieter moments of contentment are just as valuable. What's bringing you peace today?",
        "I notice some optimism in your words. It's lovely when we can find these moments of lightness. What's helping you feel more positive?",
      ],
    },
    anger: {
      high: [
        "I can feel the intensity of your anger, and it's completely valid to feel this way. Sometimes rage is our soul's way of saying something isn't right. What injustice or boundary crossing has triggered this feeling?",
        "Your anger is powerful and real. When we feel this furious, there's usually something important underneath. What values of yours feel like they've been violated?",
        "I hear the fire in your words. Anger can be overwhelming, but it often points to something that matters deeply to you. What needs to change for you to feel respected?",
      ],
      medium: [
        "I can sense the frustration you're experiencing. It's natural to feel angry when things don't go as expected. What aspect of this situation feels most unfair to you?",
        "There's clear irritation in what you're sharing. Sometimes anger is information - what is this feeling trying to tell you about your needs or boundaries?",
        "I understand you're feeling frustrated. These feelings often arise when our expectations clash with reality. What would need to happen for you to feel heard?",
      ],
      low: [
        "I notice some annoyance in your words. It's okay to feel irritated sometimes. What's been testing your patience lately?",
        "There seems to be some frustration here. Minor irritations can build up over time. What would help you feel more at ease with this situation?",
        "I can sense you're feeling a bit bothered by this. Sometimes acknowledging these smaller frustrations prevents them from growing. What's on your mind?",
      ],
    },
    calm: {
      high: [
        "There's such beautiful serenity in your words. This kind of deep peace is precious. What practices or experiences have brought you to this wonderful state of calm?",
        "I can feel the tranquility radiating from your message. When we find this level of inner peace, it's worth celebrating. How can you nurture and maintain this feeling?",
        "Your sense of calm is truly inspiring. These moments of deep centeredness are gifts. What wisdom has this peaceful state brought you today?",
      ],
      medium: [
        "I sense a lovely calmness in what you're sharing. It's wonderful when our minds and hearts feel settled. What's been helping you maintain this balance?",
        "There's a gentle peace in your words. This kind of equilibrium is so valuable in our busy world. What practices support your sense of calm?",
        "I can feel the steadiness in your energy. When we're centered like this, everything feels more manageable. What's anchoring you in this peaceful space?",
      ],
      low: [
        "I notice a quiet calmness in your message. Sometimes these gentle moments of peace are exactly what we need. What's bringing you this sense of ease?",
        "There's a subtle serenity in what you're sharing. These softer moments of tranquility can be just as meaningful. What's helping you feel grounded today?",
        "I sense some inner stillness in your words. It's lovely when our thoughts feel less chaotic. What's supporting this sense of clarity for you?",
      ],
    },
  };

  const intensityLevel =
    intensity >= 7 ? "high" : intensity >= 4 ? "medium" : "low";
  const templates =
    responseTemplates[primary as keyof typeof responseTemplates] ||
    responseTemplates.calm;
  const responses = templates[intensityLevel];

  return responses[Math.floor(Math.random() * responses.length)];
}

// Get coping strategies based on emotion
export function getCopingStrategies(
  emotion: string,
  intensity: number,
): CopingStrategy[] {
  const strategies: Record<string, CopingStrategy[]> = {
    anxiety: [
      {
        id: "box-breathing",
        title: "4-7-8 Breathing",
        description: "A calming breathing technique to reduce anxiety",
        duration: "5 minutes",
        steps: [
          "Sit comfortably and close your eyes",
          "Inhale through your nose for 4 counts",
          "Hold your breath for 7 counts",
          "Exhale through your mouth for 8 counts",
          "Repeat 4-6 times",
        ],
        category: "breathing",
        icon: "🫁",
      },
      {
        id: "grounding-5-4-3-2-1",
        title: "5-4-3-2-1 Grounding",
        description: "Use your senses to anchor yourself in the present moment",
        duration: "3-5 minutes",
        steps: [
          "Name 5 things you can see",
          "Name 4 things you can touch",
          "Name 3 things you can hear",
          "Name 2 things you can smell",
          "Name 1 thing you can taste",
        ],
        category: "grounding",
        icon: "🌱",
      },
      {
        id: "progressive-muscle",
        title: "Progressive Muscle Relaxation",
        description: "Release physical tension to calm your mind",
        duration: "10-15 minutes",
        steps: [
          "Start with your toes, tense for 5 seconds then release",
          "Move up to your calves, repeat the process",
          "Continue with thighs, abdomen, arms, and face",
          "Notice the contrast between tension and relaxation",
          "Breathe deeply throughout the process",
        ],
        category: "physical",
        icon: "💪",
      },
    ],
    depression: [
      {
        id: "gentle-movement",
        title: "Gentle Movement",
        description: "Light physical activity to boost mood naturally",
        duration: "10-20 minutes",
        steps: [
          "Step outside or near a window",
          "Start with gentle stretching",
          "Take a short walk, even if just around your space",
          "Notice how your body feels as you move",
          "Appreciate that you're taking care of yourself",
        ],
        category: "physical",
        icon: "🚶",
      },
      {
        id: "gratitude-practice",
        title: "Three Good Things",
        description: "Shift focus to positive aspects of your day",
        duration: "5-10 minutes",
        steps: [
          "Think of three things that went well today",
          "They can be tiny (like enjoying a cup of tea)",
          "Write them down or say them aloud",
          "For each one, reflect on why it was meaningful",
          "Notice how focusing on good things affects your mood",
        ],
        category: "cognitive",
        icon: "🙏",
      },
      {
        id: "creative-expression",
        title: "Creative Expression",
        description: "Use creativity to process and express emotions",
        duration: "15-30 minutes",
        steps: [
          "Choose any creative medium (drawing, writing, music)",
          "Don't worry about quality or outcome",
          "Express whatever you're feeling",
          "Let your emotions guide the creation",
          "Appreciate the act of creating something unique",
        ],
        category: "creative",
        icon: "���",
      },
    ],
    anger: [
      {
        id: "cool-down-breathing",
        title: "Cool Down Breathing",
        description: "Regulate intense emotions through controlled breathing",
        duration: "5-7 minutes",
        steps: [
          "Take a step back from the situation if possible",
          "Breathe in slowly for 6 counts",
          "Hold for 2 counts",
          "Exhale slowly for 8 counts",
          "Repeat until you feel your body relaxing",
        ],
        category: "breathing",
        icon: "❄️",
      },
      {
        id: "physical-release",
        title: "Physical Energy Release",
        description: "Channel angry energy into physical movement",
        duration: "10-15 minutes",
        steps: [
          "Do jumping jacks or run in place",
          "Punch a pillow or do push-ups against a wall",
          "Go for a brisk walk or run",
          "Focus on releasing the physical tension",
          "Notice how the movement affects your emotional state",
        ],
        category: "physical",
        icon: "⚡",
      },
      {
        id: "cognitive-reframe",
        title: "Perspective Shift",
        description: "Challenge angry thoughts with balanced thinking",
        duration: "10-15 minutes",
        steps: [
          "Write down what's making you angry",
          'Ask yourself: "Is this thought 100% true?"',
          "Consider other possible explanations",
          "Think about how you'll view this in a week",
          "Choose a more balanced perspective to focus on",
        ],
        category: "cognitive",
        icon: "🔄",
      },
    ],
  };

  const emotionStrategies = strategies[emotion] || strategies.anxiety;

  // Return different number of strategies based on intensity
  if (intensity >= 7) return emotionStrategies; // All strategies for high intensity
  if (intensity >= 4) return emotionStrategies.slice(0, 2); // Top 2 for medium
  return emotionStrategies.slice(0, 1); // Just 1 for low intensity
}

// Generate daily quests based on user patterns
export function generateDailyQuests(
  userHistory: {
    journals: JournalEntry[];
    moods: MoodEntry[];
    chats: ChatMessage[];
  },
  completedQuests: string[] = [],
): DailyQuest[] {
  const allQuests: DailyQuest[] = [
    {
      id: "gratitude-three",
      title: "Gratitude Practice",
      description: "Write down 3 things you're grateful for today",
      category: "gratitude",
      xp: 15,
      completed: false,
      icon: "🙏",
      difficulty: "easy",
    },
    {
      id: "mindful-breathing",
      title: "Mindful Breathing",
      description: "Take 5 deep, conscious breaths",
      category: "mindfulness",
      xp: 10,
      completed: false,
      icon: "🫁",
      difficulty: "easy",
    },
    {
      id: "mood-check",
      title: "Mood Check-In",
      description: "Log your current mood and reflect on what influenced it",
      category: "mindfulness",
      xp: 10,
      completed: false,
      icon: "😊",
      difficulty: "easy",
    },
    {
      id: "journal-reflection",
      title: "Daily Reflection",
      description: "Write about your day for at least 100 words",
      category: "mindfulness",
      xp: 20,
      completed: false,
      icon: "📖",
      difficulty: "medium",
    },
    {
      id: "connect-someone",
      title: "Connect with Someone",
      description: "Reach out to a friend, family member, or loved one",
      category: "connection",
      xp: 25,
      completed: false,
      icon: "💬",
      difficulty: "medium",
    },
    {
      id: "gentle-movement",
      title: "Gentle Movement",
      description: "Do 10 minutes of any physical activity you enjoy",
      category: "movement",
      xp: 20,
      completed: false,
      icon: "🚶",
      difficulty: "medium",
    },
    {
      id: "creative-moment",
      title: "Creative Expression",
      description: "Spend 15 minutes on any creative activity",
      category: "creativity",
      xp: 25,
      completed: false,
      icon: "🎨",
      difficulty: "medium",
    },
    {
      id: "nature-connection",
      title: "Nature Connection",
      description: "Spend time outdoors or with plants/nature",
      category: "mindfulness",
      xp: 15,
      completed: false,
      icon: "🌿",
      difficulty: "easy",
    },
    {
      id: "self-compassion",
      title: "Self-Compassion Practice",
      description: "Write yourself a kind, encouraging note",
      category: "mindfulness",
      xp: 20,
      completed: false,
      icon: "💝",
      difficulty: "medium",
    },
    {
      id: "digital-detox",
      title: "Mindful Tech Break",
      description: "Take a 30-minute break from social media/news",
      category: "mindfulness",
      xp: 30,
      completed: false,
      icon: "📱",
      difficulty: "hard",
    },
  ];

  // Filter out completed quests and select 3-4 personalized ones
  const availableQuests = allQuests.filter(
    (quest) => !completedQuests.includes(quest.id),
  );

  // Personalize based on user patterns
  const recentMoodAvg =
    userHistory.moods.length > 0
      ? userHistory.moods
          .slice(0, 5)
          .reduce((sum, mood) => sum + mood.rating, 0) /
        Math.min(5, userHistory.moods.length)
      : 5;

  let recommendedQuests = [...availableQuests];

  // If user has been low, prioritize mood-boosting activities
  if (recentMoodAvg < 4) {
    recommendedQuests = recommendedQuests.sort((a, b) => {
      const moodBoostingCategories = ["gratitude", "movement", "connection"];
      const aBoosts = moodBoostingCategories.includes(a.category) ? 1 : 0;
      const bBoosts = moodBoostingCategories.includes(b.category) ? 1 : 0;
      return bBoosts - aBoosts;
    });
  }

  // If user hasn't journaled recently, prioritize reflection
  const hasRecentJournal = userHistory.journals.some((journal) => {
    const journalDate = new Date(journal.date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return journalDate >= yesterday;
  });

  if (!hasRecentJournal) {
    recommendedQuests = recommendedQuests.sort((a, b) => {
      return a.id === "journal-reflection"
        ? -1
        : b.id === "journal-reflection"
          ? 1
          : 0;
    });
  }

  return recommendedQuests.slice(0, 4);
}

// Predict mood based on patterns
export function predictMood(userHistory: {
  journals: JournalEntry[];
  moods: MoodEntry[];
  chats: ChatMessage[];
}): { predicted: number; confidence: number; factors: string[] } {
  const { journals, moods, chats } = userHistory;

  if (moods.length < 3) {
    return { predicted: 5, confidence: 0.1, factors: ["Not enough data"] };
  }

  // Analyze recent trends
  const recentMoods = moods.slice(0, 7); // Last 7 entries
  const moodTrend =
    recentMoods.length >= 3
      ? recentMoods.slice(0, 3).reduce((sum, mood) => sum + mood.rating, 0) / 3
      : recentMoods[0].rating;

  // Consider day of week patterns
  const today = new Date().getDay();
  const sameDayMoods = moods.filter(
    (mood) => new Date(mood.date).getDay() === today,
  );
  const dayAverage =
    sameDayMoods.length > 0
      ? sameDayMoods.reduce((sum, mood) => sum + mood.rating, 0) /
        sameDayMoods.length
      : moodTrend;

  // Journal sentiment influence
  const recentJournals = journals.slice(0, 3);
  const positiveJournals = recentJournals.filter(
    (j) => j.sentiment === "positive",
  ).length;
  const sentimentBoost =
    (positiveJournals / Math.max(1, recentJournals.length)) * 0.5;

  // Chat activity influence (more engagement = slight mood boost)
  const recentChats = chats.filter((chat) => {
    const chatDate = new Date(chat.timestamp);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return chatDate >= threeDaysAgo && chat.sender === "user";
  });
  const engagementBoost = Math.min(0.5, recentChats.length * 0.1);

  // Calculate prediction
  const basePrediction = moodTrend * 0.6 + dayAverage * 0.4;
  const predicted = Math.max(
    1,
    Math.min(10, basePrediction + sentimentBoost + engagementBoost),
  );

  // Calculate confidence based on data consistency
  const moodVariance =
    recentMoods.reduce(
      (sum, mood) => sum + Math.pow(mood.rating - moodTrend, 2),
      0,
    ) / recentMoods.length;
  const confidence = Math.max(0.1, Math.min(1, 1 - moodVariance / 10));

  // Identify key factors
  const factors = [];
  if (moodTrend > 6) factors.push("Recent positive mood trend");
  if (moodTrend < 4) factors.push("Recent challenging period");
  if (positiveJournals > 0) factors.push("Positive journaling");
  if (engagementBoost > 0.2) factors.push("Active self-care engagement");
  if (sameDayMoods.length > 0)
    factors.push(
      `${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today]} pattern`,
    );

  return { predicted: Math.round(predicted * 10) / 10, confidence, factors };
}
