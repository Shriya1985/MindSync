import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useData, type ChatMessage } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import {
  generateContextualResponse,
  getTimeOfDay,
  type ConversationContext,
} from "@/utils/conversationAI";
import {
  generateSessionTitle,
  analyzeSessionMood,
  generateSessionSummary,
  groupSessionsByDate,
  getSessionMoodIcon,
  formatSessionTime,
  type ChatSession,
} from "@/utils/chatSessions";
import { useMoodTheme } from "@/hooks/useMoodTheme";
import {
  MessageCircle,
  Send,
  Plus,
  History,
  Trash2,
  ArrowLeft,
  MoreHorizontal,
  Clock,
  Sparkles,
  Brain,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "chat" | "history";

export default function EnhancedChatbot() {
  const navigate = useNavigate();
  const { currentTheme } = useMoodTheme();
  const {
    chatMessages,
    moodEntries,
    journalEntries,
    chatSessions,
    currentSessionId,
    addChatMessage,
    createChatSession,
    getChatSessions,
    loadChatSession,
    deleteChatSession,
    getCurrentSessionMessages,
    addPoints,
  } = useData();

  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentMessages = getCurrentSessionMessages();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isTyping]);

  // Create initial session if none exists
  useEffect(() => {
    if (!currentSessionId && viewMode === "chat") {
      console.log("Creating initial session...");
      createChatSession()
        .then((sessionId) => {
          console.log("Created session:", sessionId);
        })
        .catch((err) => {
          console.error("Failed to create session:", err);
        });
    }
  }, [currentSessionId, viewMode, createChatSession]);

  const handleSendMessage = async () => {
    if (!message.trim() || isTyping) return;

    const userMessage = message.trim();
    setMessage("");

    // Add user message
    const userChatMessage: Omit<ChatMessage, "id" | "timestamp"> = {
      content: userMessage,
      sender: "user",
      mood: selectedMood || undefined,
    };

    await addChatMessage(userChatMessage, currentSessionId || undefined);

    // Add points for engagement
    await addPoints(5, "Chat message", "chatbot");

    // Generate AI response
    setIsTyping(true);

    // Build conversation context
    const context: ConversationContext = {
      userMessage,
      recentMessages: currentMessages.slice(-10), // Last 10 messages for context
      recentMoods: Array.isArray(moodEntries) ? moodEntries.slice(0, 5) : [],
      recentJournals: Array.isArray(journalEntries)
        ? journalEntries.slice(0, 3)
        : [],
      timeOfDay: getTimeOfDay(),
      conversationLength: currentMessages.length,
    };

    setTimeout(
      async () => {
        try {
          // Generate contextual response
          const aiResponse = generateContextualResponse(context);

          const aiChatMessage: Omit<ChatMessage, "id" | "timestamp"> = {
            content: aiResponse,
            sender: "ai",
            sentiment: "positive", // Could be enhanced with sentiment analysis
          };

          await addChatMessage(aiChatMessage, currentSessionId || undefined);

          // Add bonus points for meaningful conversation
          if (currentMessages.length > 0 && currentMessages.length % 5 === 0) {
            await addPoints(10, "Meaningful conversation", "chatbot");
            showNotification({
              type: "achievement",
              title: "Great Conversation! 💬",
              message: "You've been having a meaningful dialogue! +10 XP",
              duration: 4000,
            });
          }
        } catch (error) {
          console.error("Error generating AI response:", error);
          const fallbackResponse: Omit<ChatMessage, "id" | "timestamp"> = {
            content:
              "I'm here to listen and support you. Sometimes I need a moment to process my thoughts. Could you tell me more about what's on your mind?",
            sender: "ai",
          };
          await addChatMessage(fallbackResponse, currentSessionId || undefined);
        } finally {
          setIsTyping(false);
          setSelectedMood(""); // Clear mood selection after sending
        }
      },
      1000 + Math.random() * 2000,
    ); // Realistic typing delay
  };

  const handleNewChat = async () => {
    const sessionId = await createChatSession();
    setViewMode("chat");
  };

  const handleLoadSession = async (session: ChatSession) => {
    await loadChatSession(session.id);
    setViewMode("chat");
  };

  const handleDeleteSession = async (
    sessionId: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      await deleteChatSession(sessionId);
    }
  };

  const moodOptions = [
    {
      emoji: "😊",
      label: "Happy",
      value: "happy",
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      emoji: "😔",
      label: "Sad",
      value: "sad",
      color: "bg-blue-100 text-blue-700",
    },
    {
      emoji: "😰",
      label: "Anxious",
      value: "anxious",
      color: "bg-red-100 text-red-700",
    },
    {
      emoji: "😌",
      label: "Calm",
      value: "calm",
      color: "bg-green-100 text-green-700",
    },
    {
      emoji: "😤",
      label: "Frustrated",
      value: "frustrated",
      color: "bg-orange-100 text-orange-700",
    },
    {
      emoji: "😴",
      label: "Tired",
      value: "tired",
      color: "bg-purple-100 text-purple-700",
    },
    {
      emoji: "✨",
      label: "Excited",
      value: "excited",
      color: "bg-pink-100 text-pink-700",
    },
    {
      emoji: "😕",
      label: "Confused",
      value: "confused",
      color: "bg-gray-100 text-gray-700",
    },
  ];

  const sessions = getChatSessions();
  const groupedSessions = groupSessionsByDate(sessions);

  if (viewMode === "history") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-blue-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("chat")}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Chat</span>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                    <History className="w-8 h-8 text-mint-600" />
                    <span>Chat History</span>
                  </h1>
                  <p className="text-gray-600">
                    Review your past conversations
                  </p>
                </div>
              </div>
              <Button
                onClick={handleNewChat}
                className="bg-mint-600 hover:bg-mint-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>

            {/* Sessions List */}
            <div className="space-y-6">
              {sessions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No conversations yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start your first conversation with your mental health
                      companion
                    </p>
                    <Button
                      onClick={handleNewChat}
                      className="bg-mint-600 hover:bg-mint-700"
                    >
                      Start Chatting
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Today */}
                  {groupedSessions.today.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">
                        Today
                      </h2>
                      <div className="space-y-3">
                        {groupedSessions.today.map((session) => (
                          <SessionCard
                            key={session.id}
                            session={session}
                            onLoad={() => handleLoadSession(session)}
                            onDelete={(e) => handleDeleteSession(session.id, e)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Yesterday */}
                  {groupedSessions.yesterday.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">
                        Yesterday
                      </h2>
                      <div className="space-y-3">
                        {groupedSessions.yesterday.map((session) => (
                          <SessionCard
                            key={session.id}
                            session={session}
                            onLoad={() => handleLoadSession(session)}
                            onDelete={(e) => handleDeleteSession(session.id, e)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* This Week */}
                  {groupedSessions.thisWeek.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">
                        This Week
                      </h2>
                      <div className="space-y-3">
                        {groupedSessions.thisWeek.map((session) => (
                          <SessionCard
                            key={session.id}
                            session={session}
                            onLoad={() => handleLoadSession(session)}
                            onDelete={(e) => handleDeleteSession(session.id, e)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Older */}
                  {groupedSessions.older.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">
                        Older
                      </h2>
                      <div className="space-y-3">
                        {groupedSessions.older.map((session) => (
                          <SessionCard
                            key={session.id}
                            session={session}
                            onLoad={() => handleLoadSession(session)}
                            onDelete={(e) => handleDeleteSession(session.id, e)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-blue-100">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r",
                    currentTheme.gradient,
                  )}
                >
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span>Mental Health Companion</span>
              </h1>
              <p className="text-gray-600">
                Your empathetic AI companion for emotional support
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setViewMode("history")}
                className="flex items-center space-x-2"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </Button>
              <Button
                onClick={handleNewChat}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </Button>
            </div>
          </div>

          {/* Chat Interface */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-mint-500 to-sky-500 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900">
                      Buddy
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {isTyping ? "Typing..." : "Online • Always here for you"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-mint-100 text-mint-700"
                >
                  {currentMessages.length} messages
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Messages */}
              <ScrollArea className="h-96 p-6">
                {currentMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-mint-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Welcome to Your Mental Health Companion
                    </h3>
                    <p className="text-gray-600 mb-4 max-w-md mx-auto">
                      I'm here to provide emotional support, listen to your
                      thoughts, and help you navigate your feelings. What's on
                      your mind today?
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        "I'm feeling anxious",
                        "I had a great day",
                        "I need someone to talk to",
                        "I'm struggling with something",
                      ].map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => setMessage(suggestion)}
                          className="text-xs"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-start space-x-3",
                          msg.sender === "user"
                            ? "flex-row-reverse space-x-reverse"
                            : "flex-row",
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                            msg.sender === "user"
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                              : "bg-gradient-to-r from-mint-500 to-sky-500 text-white",
                          )}
                        >
                          {msg.sender === "user" ? "You" : "🤖"}
                        </div>
                        <div
                          className={cn(
                            "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl",
                            msg.sender === "user"
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                              : "bg-gray-100 text-gray-900",
                          )}
                        >
                          <p className="text-sm leading-relaxed">
                            {msg.content}
                          </p>
                          {msg.mood && (
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs">
                                Feeling: {msg.mood}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-mint-500 to-sky-500 flex items-center justify-center">
                          <span className="text-white text-sm">🤖</span>
                        </div>
                        <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Mood Selection */}
              {!isTyping && (
                <div className="border-t border-gray-200/50 p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    How are you feeling right now? (Optional)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {moodOptions.map((mood) => (
                      <Button
                        key={mood.value}
                        variant={
                          selectedMood === mood.value ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setSelectedMood(
                            selectedMood === mood.value ? "" : mood.value,
                          )
                        }
                        className={cn(
                          "text-xs",
                          selectedMood === mood.value
                            ? "bg-mint-600 hover:bg-mint-700"
                            : "hover:bg-gray-50",
                        )}
                      >
                        <span className="mr-1">{mood.emoji}</span>
                        {mood.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-gray-200/50 p-4">
                <div className="flex items-center space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share what's on your mind..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isTyping}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isTyping}
                    className="bg-mint-600 hover:bg-mint-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Session Card Component
function SessionCard({
  session,
  onLoad,
  onDelete,
}: {
  session: ChatSession;
  onLoad: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const moodIcon = getSessionMoodIcon(session.mood || "neutral");
  const timeFormatted = formatSessionTime(session.createdAt);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200/50 bg-white/90 backdrop-blur-sm"
      onClick={onLoad}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="text-2xl">{moodIcon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {session.title}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{timeFormatted}</span>
                <span>•</span>
                <span>{session.messageCount} messages</span>
              </div>
              {session.summary && (
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {session.summary}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
