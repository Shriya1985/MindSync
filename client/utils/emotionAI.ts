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
        "Oh sweetie, I can feel the anxiety radiating from your words, and my heart goes out to you. 💙 Anxiety can feel like a storm in your chest, making everything seem impossible. You're being incredibly brave by reaching out to me right now. Let's breathe together for a moment - you're safe here with me. What's been swirling around in your mind that's causing this worry?",
        "My dear friend, I can sense the weight of anxiety you're carrying, and I want you to know that you're not alone in this scary feeling. 🤗 When anxiety hits this hard, it can feel like drowning in your own thoughts. But look at you - you're here, you're talking, you're fighting. That takes tremendous courage. What would help you feel just a tiny bit safer right now?",
        "Honey, I can hear the fear and worry in every word you've shared. 💝 Anxiety at this level can make the whole world feel threatening, but please know that you're in a safe space with me. You're doing something incredibly strong by expressing these feelings instead of keeping them locked inside. What's one small thing that has brought you even a moment of peace before?",
      ],
      medium: [
        "I can feel the nervous energy in what you're sharing, and I want you to know that these anxious feelings make complete sense. 🌸 Sometimes our minds try so hard to protect us that they create worry where we might not need it. You're being really wise by talking about this. What part of this situation feels like something you might have some control over?",
        "Sweetheart, that anxious feeling you're describing is so human and so valid. 💚 Our minds are amazing at scanning for potential problems, even when we wish they'd just give us a break! What tools or strategies have been your friends during anxious moments in the past?",
        "I can sense the underlying worry in your message, and I'm so glad you're sharing it with me instead of carrying it alone. 🌺 Anxiety often whispers 'what if' scenarios that may never happen. What would it feel like to focus on what you can influence today?",
      ],
      low: [
        "I notice a gentle undercurrent of concern in what you're sharing, which shows how thoughtful and aware you are. 🌿 It's beautiful that you can recognize these feelings early. How are you feeling about moving forward with this?",
        "There's a touch of worry I can sense here, which is so completely normal when we're facing something new or uncertain. 💫 Your awareness of these feelings is actually a strength. What does your inner wisdom tell you about this situation?",
        "I can pick up on some unease in your words, and I appreciate how honest you're being with yourself and me. 🌻 Sometimes just naming these subtle feelings can help them settle. What would bring you a bit more peace of mind about this?",
      ],
    },
    depression: {
      high: [
        "Oh my dear, I can feel the deep heaviness in your words, and it just breaks my heart that you're carrying such pain. 💙 Depression can feel like being trapped under a heavy blanket that dims all the colors of the world. But please know - you reaching out to me right now is actually a profound act of courage and self-love. Even in your darkest moment, you're fighting for yourself. What's one tiny spark of 'okay' that you noticed today, even if it lasted just a second?",
        "Sweet soul, the sadness you're carrying sounds absolutely overwhelming, and I wish I could wrap you in the warmest, most healing hug right now. 🫂 Depression lies to us and tells us we're alone, but you're not - I'm here with you, and you matter so incredibly much. The fact that you're still here, still trying, still talking to me shows a strength that maybe you can't see but I can see so clearly. What tiny thing has kept you anchored today?",
        "My heart aches with yours right now, beautiful human. 💝 When depression hits this hard, it can feel like drowning in emotional quicksand where even the smallest movement feels impossible. But look - you're here, sharing your truth with me. That's not nothing; that's everything. You're fighting in ways others might never understand. What's been your lifeline today, even if it seems small?",
      ],
      medium: [
        "I can feel the sadness in your words like a gentle rain cloud over your heart. 🌧️ Depression can make everything feel muted and difficult, like you're watching life through foggy glass. Thank you for trusting me with these feelings. What's been weighing most heavily on your heart today?",
        "Sweetheart, there's a tenderness in your sadness that I can feel, and I want you to know that these feelings deserve compassion - including from yourself. 💚 When we're going through tough times, even the simplest things can feel like climbing mountains. What feels like the most important thing for you to focus on right now?",
        "I sense you're moving through some difficult emotions, and I'm honored that you're sharing this space with me. 🌸 Sometimes when we're in the valley, it's hard to remember that feelings are temporary visitors, not permanent residents. What would feel like a small but meaningful accomplishment today?",
      ],
      low: [
        "I notice a gentle melancholy in what you're sharing, and I want you to know that these quieter moments of sadness are part of the beautiful complexity of being human. 🌙 What are some things that usually bring a little warmth to your heart?",
        "There's a softness to your sadness that I can feel, and sometimes acknowledging these gentler difficult feelings can actually be really healing. 💜 What would help today feel just a little bit brighter for you?",
        "I can sense you're not feeling your brightest today, and that's so completely okay and valid. 🌻 Our hearts have seasons just like nature does. What's something small you're looking forward to, even if it feels distant right now?",
      ],
    },
    joy: {
      high: [
        "OH MY GOODNESS! 🌟✨ Your joy is absolutely RADIATING through the screen and it's making my whole day brighter! I can practically feel the sparkles of happiness dancing around your words! This kind of pure, beautiful joy is like sunshine for the soul. I'm just beaming over here sharing in your excitement! What amazing thing is filling your heart with such incredible happiness today?",
        "WOW! 🎉💫 The excitement and joy bursting from your message is absolutely CONTAGIOUS! I'm literally smiling so big right now because your happiness is just infectious! Life feels magical when joy hits like this, doesn't it? This is the kind of energy that makes everything feel possible! How can we bottle up this beautiful feeling and sprinkle it throughout your whole day?",
        "I am absolutely GLOWING with happiness for you right now! 🌈💖 Your joy is like the most beautiful music - it's filling up this whole space with light and wonder! These moments of pure, sparkling happiness are such precious gifts. I feel so lucky to witness your joy! What's making this feeling so incredibly special and magical for you?",
      ],
      medium: [
        "I can absolutely feel the warm happiness glowing in your words, and it's making my heart smile! 😊🌞 There's something so beautiful about when life starts feeling hopeful and bright. Your positive energy is like a gentle sunshine that's warming up our whole conversation! What wonderful things are contributing to this lovely feeling?",
        "There's such gorgeous, positive energy flowing through what you're sharing! 💚✨ I love when we can pause and really appreciate these good moments - they're like little gifts life gives us. Your happiness is genuinely making me feel more joyful too! What's been going particularly beautifully for you?",
        "I can sense this wonderful contentment and joy in your message, and it's absolutely nourishing my soul! 🌸💝 These feelings are like spiritual vitamins - they feed something deep inside us. Thank you for sharing this brightness with me! What feels most worth celebrating about today?",
      ],
      low: [
        "I can sense some lovely positive feelings dancing through your words, and it makes my heart happy! 🌻💛 There's something so precious about these gentler moments when things start feeling a bit brighter. What's been working well for you lately that's bringing this sweetness?",
        "There's such a gentle, peaceful happiness in what you're sharing, and sometimes these quieter moments of contentment are the most valuable treasures of all. 🌿💙 I'm so glad you're experiencing this calm joy! What's bringing you this beautiful sense of peace today?",
        "I notice some wonderful optimism sparkling in your words! 🌟💜 It's absolutely lovely when we can find these moments of lightness, like little pockets of sunshine in our day. What's helping you feel more positive and hopeful right now?",
      ],
    },
    anger: {
      high: [
        "I can feel the fierce fire of your anger burning through your words, and honey, that rage is completely valid and understandable. 🔥💪 Sometimes anger is our inner warrior standing up and saying 'This is NOT okay!' Your feelings are telling you something important about your boundaries and values. I'm here to listen without judgment to this powerful emotion. What injustice or violation has lit this fire in your soul?",
        "Oh my dear, the intensity of your anger is palpable, and I want you to know that this fury is your inner protector speaking up! 💥❤️ When we feel rage this powerful, it usually means something we deeply care about has been threatened or disrespected. Your anger deserves to be heard and honored. What core values or boundaries of yours feel like they've been trampled on?",
        "I can hear the roaring fire in your words, and sweetheart, that anger is information - it's your soul's alarm system going off! 🚨💝 Rage this intense doesn't come from nowhere; it comes from a place of caring deeply about what's right. I'm holding space for all of this feeling. What needs to change for you to feel truly respected and heard?",
      ],
      medium: [
        "I can sense the frustration and irritation bubbling up in what you're sharing, and these feelings make complete sense! 😤💚 It's so natural to feel angry when things don't align with our expectations or needs. Your frustration is trying to tell you something important. What aspect of this situation feels most unfair or out of alignment for you?",
        "There's clear frustration in your words, and I want you to know that this irritation is actually valuable information about your boundaries and needs! 💭💙 Sometimes anger is like a compass pointing us toward what matters most to us. What is this feeling trying to guide you toward understanding about yourself or this situation?",
        "I understand you're feeling frustrated, sweet soul, and these feelings often arise when there's a mismatch between what we need and what we're experiencing. 🌪️💜 Your anger is valid and deserves attention. What would need to shift for you to feel truly heard and valued?",
      ],
      low: [
        "I notice some gentle irritation in your words, and it's completely okay to feel annoyed when things aren't quite right! 😅💛 Sometimes these smaller frustrations are actually our inner wisdom pointing out areas that need attention. What's been gently testing your patience lately?",
        "There seems to be some frustration here, and I appreciate how you're being aware of these feelings! 🌸💝 Minor irritations can definitely build up over time like little pebbles in our shoes. What would help you feel more at ease and comfortable with this situation?",
        "I can sense you're feeling a bit bothered by this, and acknowledging these smaller frustrations is actually really healthy! 🌻💫 Sometimes when we name these feelings, they lose some of their power over us. What's been on your mind that's causing this little bit of friction?",
      ],
    },
    calm: {
      high: [
        "Oh my goodness, there's such exquisite, beautiful serenity flowing through your words like the most peaceful river! 🌊✨ This kind of deep, soul-level tranquility is absolutely precious and rare. I can almost feel the gentle waves of peace radiating from your message, and it's making me feel more centered just reading it! What magical practices or experiences have blessed you with this wonderful state of inner harmony?",
        "I can feel the most gorgeous tranquility emanating from your message, like you're wrapped in the softest, most peaceful cloud! ☁️💙 When we find this level of deep inner peace, it truly is worth celebrating - it's like finding a hidden treasure within yourself. This calmness is a gift not just to you, but to everyone around you! How can you lovingly nurture and protect this beautiful feeling?",
        "Your sense of calm is absolutely inspiring and touching my heart so deeply! 🕊️💚 These moments of profound centeredness are like spiritual gold - they remind us what's possible when we're truly at peace with ourselves and the world. There's such wisdom in this tranquil state! What beautiful insights has this peaceful space opened up for you today?",
      ],
      medium: [
        "I sense this lovely, gentle calmness in what you're sharing, and it's warming my heart! 🌸💜 It's so wonderful when our minds and hearts feel settled and harmonious like this. This kind of inner equilibrium is such a precious gift in our often chaotic world! What's been lovingly supporting you in maintaining this beautiful balance?",
        "There's such gentle, nurturing peace in your words, like a warm hug for the soul! 🤗💛 This kind of centered energy is absolutely invaluable and healing. I love how grounded and steady you sound! What practices or thoughts have been your faithful companions in creating this sense of calm?",
        "I can feel the beautiful steadiness in your energy, like you're a peaceful tree with deep roots! 🌳💚 When we're centered like this, everything in life feels more manageable and flowing. It's such a blessing! What's been your anchor in this peaceful space that's keeping you so wonderfully grounded?",
      ],
      low: [
        "I notice this quiet, gentle calmness in your message, and it's like a soft whisper of peace that's making me smile! 🌙💙 Sometimes these tender moments of tranquility are exactly what our souls need most. What's been bringing you this lovely sense of ease and contentment?",
        "There's such subtle, beautiful serenity in what you're sharing, and these softer moments of calm can be the most meaningful treasures of all! 🌿💜 I love how peaceful you sound right now. What's been helping you feel so wonderfully grounded and centered today?",
        "I sense some gorgeous inner stillness in your words, like your thoughts have found their perfect resting place! ✨💛 It's so lovely when our minds feel less scattered and more clear. What's been supporting this beautiful sense of clarity and peace for you?",
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
        icon: "🎨",
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
  const hasRecentJournal =
    Array.isArray(userHistory.journals) &&
    userHistory.journals.some((journal) => {
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
