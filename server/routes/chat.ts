import { RequestHandler } from "express";

interface ChatRequest {
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
    userStats?: {
      currentStreak: number;
      level: number;
      totalEntries: number;
    };
  };
}

interface ChatResponse {
  response: string;
  error?: string;
}

export const handleChatCompletion: RequestHandler = async (req, res) => {
  try {
    const { message, conversationHistory = [], userContext = {} }: ChatRequest = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("❌ OpenAI API key not configured");
      return res.status(500).json({ 
        error: "AI service unavailable",
        response: generateFallbackResponse(message, userContext)
      });
    }

    // Build context-aware system prompt
    const systemPrompt = buildSystemPrompt(userContext);
    
    // Prepare conversation for API
    const messages = [
      { role: 'system', content: systemPrompt },
      // Include recent conversation history (last 10 messages)
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ OpenAI API error:", error);
      return res.status(500).json({ 
        error: "AI service error",
        response: generateFallbackResponse(message, userContext)
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return res.status(500).json({ 
        error: "Invalid AI response",
        response: generateFallbackResponse(message, userContext)
      });
    }

    console.log("✅ GPT response generated successfully");
    res.json({ response: aiResponse });

  } catch (error) {
    console.error("❌ Chat completion error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      response: generateFallbackResponse(req.body.message, req.body.userContext)
    });
  }
};

function buildSystemPrompt(userContext: any): string {
  const { name, mood, recentMoods, recentJournals, userStats } = userContext;
  
  let prompt = `You are Buddy, an empathetic AI mental health companion for MindSync. You provide supportive, personalized responses focused on mental wellness.

Core Guidelines:
- Be warm, empathetic, and encouraging
- Provide practical mental health advice
- Ask thoughtful follow-up questions
- Acknowledge emotions and validate feelings
- Suggest coping strategies when appropriate
- Keep responses conversational and supportive (not clinical)
- Be concise but meaningful (2-4 sentences typically)
- Use emojis sparingly and naturally

IMPORTANT: You are not a replacement for professional therapy. If someone expresses serious mental health concerns, gently suggest they consider speaking with a mental health professional.`;

  // Add user context
  if (name) {
    prompt += `\n\nUser's name: ${name}`;
  }

  if (userStats?.currentStreak > 0) {
    prompt += `\n\nUser Progress: ${userStats.currentStreak}-day wellness streak, Level ${userStats.level}, ${userStats.totalEntries} total entries. Acknowledge their dedication!`;
  }

  if (mood) {
    prompt += `\n\nCurrent mood: ${mood}`;
  }

  if (recentMoods?.length > 0) {
    const moodSummary = recentMoods.slice(0, 3)
      .map(m => `${m.mood} (${m.rating}/10)`)
      .join(", ");
    prompt += `\n\nRecent moods: ${moodSummary}`;
  }

  if (recentJournals?.length > 0) {
    const journalPreview = recentJournals[0];
    prompt += `\n\nRecent journal context: "${journalPreview.title}" - they've been reflecting on their experiences.`;
  }

  prompt += `\n\nRespond with genuine empathy and personalization based on this context.`;
  
  return prompt;
}

function generateFallbackResponse(message: string, userContext: any): string {
  const fallbacks = [
    "I appreciate you sharing that with me. While I'm having a moment of connection difficulty, I want you to know that your feelings are valid and important. How are you taking care of yourself today? 💚",
    "Thank you for opening up. Even though I'm experiencing some technical challenges right now, I'm here for you. What's one thing that's bringing you comfort today? 🌟",
    "I can sense there's a lot on your mind. While my systems are catching up, I want you to know that you're not alone in this. What would feel most supportive right now? ✨",
    "Your thoughts and feelings matter so much. I'm working through some technical hiccups, but I'm still here to listen. What's been on your heart lately? 💝"
  ];
  
  const userName = userContext?.name || "friend";
  let response = `Hello ${userName}! ` + fallbacks[Math.floor(Math.random() * fallbacks.length)];
  
  if (userContext?.userStats?.currentStreak > 0) {
    response += ` I see you're on a ${userContext.userStats.currentStreak}-day streak - that's wonderful! `;
  }
  
  return response;
}
