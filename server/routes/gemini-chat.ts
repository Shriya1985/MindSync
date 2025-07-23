import { RequestHandler } from "express";

interface GeminiChatRequest {
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
  sessionId?: string;
}

interface GeminiChatResponse {
  response: string;
  error?: string;
  sessionId?: string;
}

// Session storage for conversation context (can be moved to database later)
const sessionStore = new Map<string, Array<{
  role: 'user' | 'model';
  parts: [{ text: string }];
  timestamp: string;
}>>();

export const handleGeminiChat: RequestHandler = async (req, res) => {
  try {
    const { 
      message, 
      conversationHistory = [], 
      userContext = {},
      sessionId = generateSessionId()
    }: GeminiChatRequest = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ Google Gemini API key not configured");
      return res.status(500).json({ 
        error: "AI service unavailable",
        response: generateFallbackResponse(message, userContext),
        sessionId
      });
    }

    // Get or create session history
    let sessionHistory = sessionStore.get(sessionId) || [];

    // Build context-aware system instruction
    const systemInstruction = buildSystemInstruction(userContext);
    
    // Prepare conversation history for Gemini
    const geminiHistory = prepareGeminiHistory(conversationHistory, sessionHistory);
    
    // Add current user message to session
    const userMessage = {
      role: 'user' as const,
      parts: [{ text: message }],
      timestamp: new Date().toISOString()
    };

    // Call Google Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          ...geminiHistory,
          userMessage
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
          stopSequences: []
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Gemini API error:", error);
      return res.status(500).json({ 
        error: "AI service error",
        response: generateFallbackResponse(message, userContext),
        sessionId
      });
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      console.error("❌ Invalid Gemini response structure:", data);
      return res.status(500).json({ 
        error: "Invalid AI response",
        response: generateFallbackResponse(message, userContext),
        sessionId
      });
    }

    // Store conversation in session
    sessionHistory.push(userMessage);
    sessionHistory.push({
      role: 'model',
      parts: [{ text: aiResponse }],
      timestamp: new Date().toISOString()
    });

    // Keep only last 20 messages to manage memory
    if (sessionHistory.length > 20) {
      sessionHistory = sessionHistory.slice(-20);
    }

    sessionStore.set(sessionId, sessionHistory);

    console.log("✅ Gemini response generated successfully");
    res.json({ 
      response: aiResponse,
      sessionId
    });

  } catch (error) {
    console.error("❌ Gemini chat error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      response: generateFallbackResponse(req.body.message, req.body.userContext),
      sessionId: req.body.sessionId || generateSessionId()
    });
  }
};

function buildSystemInstruction(userContext: any): string {
  const { name, mood, recentMoods, recentJournals, userStats } = userContext;
  
  let instruction = `You are Buddy, an empathetic AI mental health companion for MindSync. You provide supportive, personalized responses focused on mental wellness.

Core Guidelines:
- Be warm, empathetic, and encouraging
- Provide practical mental health advice and coping strategies
- Ask thoughtful follow-up questions to deepen understanding
- Acknowledge emotions and validate feelings
- Suggest appropriate self-care activities when relevant
- Keep responses conversational and supportive (not clinical)
- Be concise but meaningful (2-4 sentences typically)
- Use emojis sparingly and naturally
- Remember previous conversation context to build rapport

IMPORTANT: You are not a replacement for professional therapy. If someone expresses serious mental health concerns, gently suggest they consider speaking with a mental health professional.`;

  // Add personalized context
  if (name) {
    instruction += `\n\nUser's name: ${name} (use this to personalize responses)`;
  }

  if (userStats?.currentStreak > 0) {
    instruction += `\n\nUser Progress: They have a ${userStats.currentStreak}-day wellness streak, Level ${userStats.level}, with ${userStats.totalEntries} total entries. Acknowledge their dedication and progress!`;
  }

  if (mood) {
    instruction += `\n\nCurrent detected mood: ${mood} (respond appropriately to their emotional state)`;
  }

  if (recentMoods?.length > 0) {
    const moodSummary = recentMoods.slice(0, 3)
      .map(m => `${m.mood} (${m.rating}/10)`)
      .join(", ");
    instruction += `\n\nRecent mood pattern: ${moodSummary} (use this to understand their emotional trends)`;
  }

  if (recentJournals?.length > 0) {
    const journalPreview = recentJournals[0];
    instruction += `\n\nRecent journal context: They wrote about "${journalPreview.title}" - showing they're actively reflecting on their experiences.`;
  }

  instruction += `\n\nRespond with genuine empathy and personalization based on this context. Build on the conversation naturally.`;
  
  return instruction;
}

function prepareGeminiHistory(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp?: string }>,
  sessionHistory: Array<{ role: 'user' | 'model'; parts: [{ text: string }]; timestamp: string }>
): Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> {
  // Use session history if available, otherwise convert conversation history
  if (sessionHistory.length > 0) {
    return sessionHistory.map(msg => ({
      role: msg.role,
      parts: msg.parts
    }));
  }

  // Convert from the frontend format to Gemini format
  return conversationHistory.slice(-10).map(msg => ({
    role: msg.role === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: msg.content }]
  }));
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

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Test endpoint for Gemini connection
export const testGeminiConnection: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.json({
        status: "error",
        message: "❌ Google Gemini API key not configured",
        instructions: "Set GEMINI_API_KEY environment variable with your Google Gemini API key"
      });
    }

    // Test API connection with a simple request
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: "Say 'Hello! Gemini integration is working!' in exactly those words." }]
        }],
        generationConfig: {
          maxOutputTokens: 50
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return res.json({
        status: "error",
        message: "❌ Gemini API connection failed",
        error: error,
        suggestions: [
          "Check if your API key is valid",
          "Ensure Gemini API is enabled in Google Cloud Console",
          "Verify you have sufficient quota"
        ]
      });
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({
      status: "success",
      message: "✅ Gemini integration working perfectly!",
      response: aiResponse,
      model: "gemini-1.5-flash"
    });

  } catch (error) {
    res.json({
      status: "error",
      message: "❌ Test failed",
      error: error.message,
      instructions: "Check server logs for detailed error information"
    });
  }
};

// Clean up old sessions periodically (can be moved to a proper database later)
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [sessionId, history] of sessionStore.entries()) {
    const lastMessage = history[history.length - 1];
    if (lastMessage && new Date(lastMessage.timestamp).getTime() < oneHourAgo) {
      sessionStore.delete(sessionId);
    }
  }
}, 15 * 60 * 1000); // Clean every 15 minutes
