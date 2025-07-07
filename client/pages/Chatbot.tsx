import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useData, type ChatMessage } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import {
  analyzeEmotionalState,
  generateEmotionAwareResponse,
  getCopingStrategies,
} from "@/utils/emotionAI";
import { useMoodTheme } from "@/hooks/useMoodTheme";
import { CopingStrategies } from "@/components/CopingStrategies";
import {
  MessageCircle,
  Send,
  Mic,
  MoreVertical,
  Brain,
  Heart,
  Zap,
  RefreshCw,
  TrendingUp,
  Award,
  History,
  Clock,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MoodOption = {
  emoji: string;
  label: string;
  value: string;
  color: string;
  rating: number;
};

const moodOptions: MoodOption[] = [
  {
    emoji: "😊",
    label: "Happy",
    value: "happy",
    color: "bg-yellow-100 text-yellow-700",
    rating: 8,
  },
  {
    emoji: "😔",
    label: "Sad",
    value: "sad",
    color: "bg-blue-100 text-blue-700",
    rating: 3,
  },
  {
    emoji: "😰",
    label: "Anxious",
    value: "anxious",
    color: "bg-orange-100 text-orange-700",
    rating: 4,
  },
  {
    emoji: "😌",
    label: "Calm",
    value: "calm",
    color: "bg-green-100 text-green-700",
    rating: 7,
  },
  {
    emoji: "😤",
    label: "Frustrated",
    value: "frustrated",
    color: "bg-red-100 text-red-700",
    rating: 4,
  },
  {
    emoji: "😴",
    label: "Tired",
    value: "tired",
    color: "bg-purple-100 text-purple-700",
    rating: 5,
  },
  {
    emoji: "🤔",
    label: "Confused",
    value: "confused",
    color: "bg-gray-100 text-gray-700",
    rating: 5,
  },
  {
    emoji: "✨",
    label: "Excited",
    value: "excited",
    color: "bg-pink-100 text-pink-700",
    rating: 9,
  },
];

// Enhanced AI response system
const generateAIResponse = (userMessage: string, mood?: string): string => {
  const message = userMessage.toLowerCase();

  // Mood-specific responses
  if (mood) {
    const moodResponses = {
      happy: [
        "I'm so glad to hear you're feeling happy! What's contributing to this positive mood today? 😊",
        "That's wonderful! Your happiness is contagious. Would you like to share what's making you feel this way?",
        "I love hearing when you're in a good mood! Let's capture this moment - what made today special?",
      ],
      sad: [
        "I hear that you're feeling sad right now, and that's completely okay. Your feelings are valid. Would you like to talk about what's on your heart? 💙",
        "Thank you for trusting me with how you're feeling. Sadness is a natural emotion. I'm here to listen - what's weighing on you today?",
        "I'm sorry you're going through a difficult time. Sometimes it helps to express these feelings. What would you like to share with me?",
      ],
      anxious: [
        "I understand you're feeling anxious. Anxiety can be overwhelming, but you're not alone. What specifically is causing you worry today?",
        "Anxiety is challenging, and I want you to know it's okay to feel this way. Let's work through this together - what's on your mind?",
        "I hear your anxiety, and I'm here to support you. Sometimes talking about our worries can help. What's making you feel anxious right now?",
      ],
      calm: [
        "It's beautiful that you're feeling calm. This peaceful state is so valuable. What's helping you feel centered today?",
        "I'm glad you're experiencing calmness. These moments of peace are precious. How did you cultivate this feeling?",
        "Your sense of calm is wonderful. What practices or thoughts are contributing to this peaceful state?",
      ],
      frustrated: [
        "I can sense your frustration, and those feelings are completely understandable. What's causing this frustration for you?",
        "Frustration can be really draining. I'm here to listen without judgment. What's been particularly challenging today?",
        "Thank you for sharing your frustration with me. These feelings are valid. What situation is causing you to feel this way?",
      ],
      tired: [
        "It sounds like you're feeling drained. Rest is so important for our wellbeing. What's been wearing you out lately?",
        "I hear that you're tired. Sometimes our bodies and minds need extra care. What kind of tiredness are you experiencing?",
        "Feeling tired is your body's way of asking for care. What do you think would help you feel more energized?",
      ],
      excited: [
        "Your excitement is infectious! I love your energy. What's got you feeling so enthusiastic today? ✨",
        "How wonderful that you're feeling excited! This positive energy is amazing. Tell me more about what's sparking this feeling!",
        "I can feel your excitement through your words! What's happening that's making you feel so energized?",
      ],
      confused: [
        "It's okay to feel confused - sometimes life presents us with complex situations. What's causing this uncertainty for you?",
        "Confusion is a natural response to challenging situations. I'm here to help you think through whatever is on your mind.",
        "Thank you for sharing that you're feeling confused. Sometimes talking through our thoughts can bring clarity. What's puzzling you?",
      ],
    };

    const responses = moodResponses[mood as keyof typeof moodResponses];
    if (responses) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // Keyword-based responses
  if (
    message.includes("work") ||
    message.includes("job") ||
    message.includes("career")
  ) {
    return "Work can be a significant source of both stress and fulfillment. What aspects of your work situation would you like to explore? I'm here to help you process these feelings.";
  }

  if (
    message.includes("relationship") ||
    message.includes("friend") ||
    message.includes("family")
  ) {
    return "Relationships are such an important part of our lives and can bring both joy and challenges. What's happening in your relationships that you'd like to talk about?";
  }

  if (
    message.includes("sleep") ||
    message.includes("tired") ||
    message.includes("exhausted")
  ) {
    return "Sleep and rest are fundamental to our mental health. How has your sleep been lately? Sometimes discussing our rest patterns can reveal important insights about our wellbeing.";
  }

  if (
    message.includes("stress") ||
    message.includes("overwhelmed") ||
    message.includes("pressure")
  ) {
    return "Stress and feeling overwhelmed are common experiences, especially in today's world. You're not alone in feeling this way. What's contributing most to your stress right now?";
  }

  if (
    message.includes("goal") ||
    message.includes("future") ||
    message.includes("plan")
  ) {
    return "It's wonderful that you're thinking about your goals and future! Having direction can be so empowering. What aspirations or plans are on your mind?";
  }

  if (
    message.includes("grateful") ||
    message.includes("thankful") ||
    message.includes("appreciate")
  ) {
    return "Gratitude is such a powerful practice for mental wellness! I'm glad you're noticing things to appreciate. What are you feeling most grateful for right now?";
  }

  if (
    message.includes("progress") ||
    message.includes("better") ||
    message.includes("improving")
  ) {
    return "Recognizing progress is so important! Every step forward, no matter how small, is worth celebrating. What improvements have you noticed in yourself lately?";
  }

  // Default empathetic responses
  const defaultResponses = [
    "Thank you for sharing that with me. Your thoughts and feelings matter. How has this been affecting you lately?",
    "I appreciate you opening up about this. Sometimes just expressing our thoughts can be helpful. What would you like to explore further?",
    "I'm here to listen and support you. Your experiences are valid and important. How are you taking care of yourself through this?",
    "It sounds like you have a lot on your mind. I'm glad you're taking time to reflect and share. What feels most important to talk about right now?",
    "Thank you for trusting me with your thoughts. Processing our feelings is such an important part of mental wellness. What insights are you having about this situation?",
    "I hear you, and I want you to know that you're not alone in feeling this way. What kind of support feels most helpful to you right now?",
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

export default function Chatbot() {
  const [inputValue, setInputValue] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    chatMessages,
    chatSessions,
    addChatMessage,
    addMoodEntry,
    userStats,
    addPoints,
    getStreakInfo,
    moodEntries,
    journalEntries,
    getRecentChatContext,
    getCurrentSessionMessages,
    createChatSession,
    loadChatSession,
    deleteChatSession,
    currentSessionId,
  } = useData();

  // Get current messages from DataContext (after useData hook)
  const currentMessages = chatMessages || [];
  const { currentTheme } = useMoodTheme();

  // Debug logging
  useEffect(() => {
    console.log("Chatbot - Current messages:", currentMessages.length);
    console.log("Chatbot - All chat messages:", chatMessages?.length || 0);
  }, [currentMessages, chatMessages]);

  // Initialize with welcome message
  useEffect(() => {
    if (currentMessages.length === 0 && !isTyping) {
      console.log("Adding welcome message...");
      addChatMessage({
        content:
          "Hello! I'm Buddy, your MindSync AI companion. I'm here to listen, support, and help you explore your thoughts and feelings. How are you doing today? 💚",
        sender: "ai",
      });
    }
  }, [currentMessages.length, addChatMessage, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Only scroll when a new message is added or AI is typing
    if (currentMessages.length > 0 || isTyping) {
      scrollToBottom();
    }
  }, [currentMessages.length, isTyping]);

  const simulateAIResponse = async (userMessage: string, mood?: string) => {
    setIsTyping(true);
    setShowProgress(true);

    // Add realistic delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1500 + Math.random() * 1000),
    );

    try {
      // Analyze emotional state from the user's message
      let emotionalState;
      try {
        emotionalState = analyzeEmotionalState(
          userMessage,
          Array.isArray(moodEntries) ? moodEntries.slice(0, 5) : [],
          Array.isArray(journalEntries) ? journalEntries.slice(0, 3) : [],
        );
      } catch (error) {
        console.error("Error analyzing emotional state:", error);
        emotionalState = { intensity: 3, primary: "neutral" }; // fallback
      }

      // Get recent chat context for better responses
      const recentContext = getRecentChatContext();

      // Generate emotion-aware response with enhanced context
      const aiResponseContent = generateEmotionAwareResponse(
        userMessage,
        emotionalState,
        {
          chats: recentContext, // Use recent context instead of all messages
          journals: Array.isArray(journalEntries)
            ? journalEntries.slice(0, 3)
            : [],
          moods: Array.isArray(moodEntries) ? moodEntries.slice(0, 5) : [],
        },
      );

      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        content: aiResponseContent,
        sender: "ai",
        timestamp: new Date(),
        sentiment: "positive" as any,
      };

      // Add AI response to database
      await addChatMessage(aiMessage);

      // Check for streak achievement
      const streakInfo = getStreakInfo();
      if (streakInfo.current > 0 && streakInfo.current % 3 === 0) {
        showNotification({
          type: "streak",
          title: "Chat Streak! 🔥",
          message: `Amazing! You've had ${streakInfo.current} days of wellness check-ins. Keep up the great work!`,
          duration: 6000,
        });
      }

      // Show coping strategies if high intensity negative emotion
      if (
        emotionalState &&
        emotionalState.intensity >= 6 &&
        ["anxiety", "depression", "anger"].includes(emotionalState.primary)
      ) {
        setTimeout(() => {
          showNotification({
            type: "encouragement",
            title: "Coping Techniques Available 🌟",
            message: `I've prepared some personalized techniques that might help you feel better. Would you like to practice them now?`,
            duration: 8000,
            action: {
              label: "Practice Techniques",
              onClick: () => navigate("/techniques"),
            },
          });
        }, 2000);
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
      // Fallback response
      const fallbackMessage: ChatMessage = {
        id: Date.now().toString(),
        content:
          "I'm here to listen and support you. Sometimes I need a moment to process my thoughts. Could you tell me more about what's on your mind?",
        sender: "ai",
        timestamp: new Date(),
        sentiment: "neutral" as any,
      };
      await addChatMessage(fallbackMessage);
    } finally {
      setIsTyping(false);
      setShowProgress(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const selectedMoodOption = selectedMood
      ? moodOptions.find((m) => m.value === selectedMood)
      : undefined;

    const messageText = inputValue;
    const currentMood = selectedMood;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageText,
      sender: "user",
      timestamp: new Date(),
      mood: currentMood || undefined,
      sentiment: selectedMoodOption?.rating
        ? selectedMoodOption.rating >= 7
          ? "positive"
          : selectedMoodOption.rating <= 4
            ? "negative"
            : "neutral"
        : undefined,
    };

    // Add to database
    await addChatMessage(userMessage);

    // Also add mood entry if mood was selected
    if (currentMood && selectedMoodOption) {
      addMoodEntry({
        date: new Date().toISOString().split("T")[0],
        mood: selectedMoodOption.label,
        rating: selectedMoodOption.rating,
        emoji: selectedMoodOption.emoji,
        source: "chatbot",
      });

      // Show encouraging notification
      showNotification({
        type: "encouragement",
        title: "Mood Logged! 🎉",
        message: `Thanks for sharing that you're feeling ${selectedMoodOption.label}. Every check-in helps build your wellness journey!`,
        duration: 4000,
      });
    }

    setInputValue("");
    setSelectedMood(null);
    await simulateAIResponse(messageText, currentMood || undefined);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = async () => {
    // Clear chat history from database would require a clearChatHistory function
    // For now, just reload the page to refresh
    window.location.reload();
  };

  const streakInfo = getStreakInfo();

  return (
    <div className={`min-h-screen ${currentTheme.background}`}>
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Stats */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-mint-500 to-sky-500 rounded-2xl mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Companion Chat
          </h1>
          <p className="text-gray-600 mb-4">
            Share your thoughts and feelings in a safe, supportive space
          </p>

          {/* Progress Stats */}
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-1">
              <Award className="w-4 h-4 text-mint-500" />
              <span className="text-gray-600">
                Level {userStats.level} • {userStats.points} points
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-gray-600">
                {streakInfo.current} day streak
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center space-x-1"
              >
                <History className="w-4 h-4" />
                <span>Chat History</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-6">
          {/* Chat History Sidebar */}
          {showHistory && (
            <Card className="w-80 shadow-lg border-0 bg-white/90 backdrop-blur-sm flex flex-col h-[600px]">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <History className="w-5 h-5 mr-2 text-mint-500" />
                  Previous Conversations
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {chatSessions && chatSessions.length > 0 ? (
                  <div className="space-y-3">
                    {chatSessions.map((session) => (
                      <div
                        key={session.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-colors",
                          currentSessionId === session.id
                            ? "border-mint-200 bg-mint-50"
                            : "border-gray-200 hover:border-mint-200 hover:bg-gray-50",
                        )}
                        onClick={() => loadChatSession(session.id)}
                      >
                        <div className="font-medium text-sm text-gray-900 mb-1 truncate">
                          {session.title || "Untitled Chat"}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 space-x-2">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(session.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>{session.messageCount} messages</span>
                        </div>
                        {session.mood && (
                          <div className="mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {session.mood}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No previous conversations yet</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-100">
                <Button
                  onClick={() => createChatSession()}
                  variant="outline"
                  className="w-full text-mint-600 border-mint-200 hover:bg-mint-50"
                >
                  Start New Chat
                </Button>
              </div>
            </Card>
          )}

          {/* Chat Container */}
          <Card
            className={cn(
              "shadow-xl border-0 bg-white/90 backdrop-blur-sm h-[600px] flex flex-col",
              showHistory ? "flex-1" : "w-full max-w-4xl mx-auto",
            )}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-mint-400 to-sky-400 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Buddy</h3>
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Your AI Companion • Ready to Listen</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {showProgress && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-16 bg-gray-200 rounded-full h-1">
                      <div className="bg-mint-500 h-1 rounded-full animate-pulse w-1/2" />
                    </div>
                    <span>Processing...</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 break-words",
                      message.sender === "user"
                        ? "bg-gradient-to-r from-mint-500 to-sky-500 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md",
                    )}
                  >
                    {message.sender === "ai" && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-5 h-5 bg-gradient-to-br from-mint-400 to-sky-400 rounded-full flex items-center justify-center">
                          <Brain className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs text-gray-500">Buddy</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    {message.mood && (
                      <div className="mt-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            moodOptions.find((m) => m.value === message.mood)
                              ?.color,
                          )}
                        >
                          {
                            moodOptions.find((m) => m.value === message.mood)
                              ?.emoji
                          }{" "}
                          {
                            moodOptions.find((m) => m.value === message.mood)
                              ?.label
                          }
                        </Badge>
                      </div>
                    )}
                    <div
                      className={cn(
                        "text-xs mt-2 opacity-70",
                        message.sender === "user"
                          ? "text-white/80"
                          : "text-gray-500",
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%]">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-mint-400 to-sky-400 rounded-full flex items-center justify-center">
                        <Brain className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs text-gray-500">Buddy</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Mood Picker */}
            <div className="px-4 py-2 border-t border-gray-100">
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  How are you feeling?
                </span>
                {moodOptions.map((mood) => (
                  <Button
                    key={mood.value}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedMood(
                        selectedMood === mood.value ? null : mood.value,
                      )
                    }
                    className={cn(
                      "flex-shrink-0 text-sm",
                      selectedMood === mood.value
                        ? "border-mint-300 bg-mint-50 text-mint-700"
                        : "border-gray-200 hover:border-mint-200",
                    )}
                  >
                    <span className="mr-1">{mood.emoji}</span>
                    {mood.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share what's on your mind..."
                    className="resize-none border-gray-200 focus:border-mint-300 focus:ring-mint-200"
                    disabled={isTyping}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 text-gray-500 hover:text-mint-600 hover:border-mint-300"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Coping Strategies */}
        <div className="mt-8">
          <CopingStrategies />
        </div>

        {/* Features Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Heart className="w-4 h-4 text-mint-500" />
            <span>Contextual AI responses</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 text-sky-500" />
            <span>Progress tracking</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Brain className="w-4 h-4 text-lavender-500" />
            <span>Privacy-first conversations</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
