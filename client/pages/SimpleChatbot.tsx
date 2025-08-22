import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useData, type ChatMessage } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import {
  generateContextualResponse,
  getTimeOfDay,
  type ConversationContext,
} from "@/utils/conversationAI";
import { useMoodTheme } from "@/hooks/useMoodTheme";
import { MessageCircle, Send, Brain, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SimpleChatbot() {
  const { currentTheme } = useMoodTheme();
  const {
    chatMessages,
    moodEntries,
    journalEntries,
    addChatMessage,
    addPoints,
  } = useData();

  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

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

    await addChatMessage(userChatMessage);

    // Add points for engagement
    await addPoints(5, "Chat message", "chatbot");

    // Generate AI response
    setIsTyping(true);

    setTimeout(
      async () => {
        try {
          // Build conversation context
          const context: ConversationContext = {
            userMessage,
            recentMessages: Array.isArray(chatMessages)
              ? chatMessages.slice(-10)
              : [],
            recentMoods: Array.isArray(moodEntries)
              ? moodEntries.slice(0, 5)
              : [],
            recentJournals: Array.isArray(journalEntries)
              ? journalEntries.slice(0, 3)
              : [],
            timeOfDay: getTimeOfDay(),
            conversationLength: Array.isArray(chatMessages)
              ? chatMessages.length
              : 0,
          };

          // Generate contextual response
          const aiResponse = generateContextualResponse(context);

          const aiChatMessage: Omit<ChatMessage, "id" | "timestamp"> = {
            content: aiResponse,
            sender: "ai",
            sentiment: "positive",
          };

          await addChatMessage(aiChatMessage);

          // Add bonus points for meaningful conversation
          if (
            Array.isArray(chatMessages) &&
            chatMessages.length > 0 &&
            chatMessages.length % 5 === 0
          ) {
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
          await addChatMessage(fallbackResponse);
        } finally {
          setIsTyping(false);
          setSelectedMood(""); // Clear mood selection after sending
        }
      },
      1000 + Math.random() * 2000,
    ); // Realistic typing delay
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

  const currentMessages = Array.isArray(chatMessages) ? chatMessages : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-blue-100">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  gradientClass,
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
              <div className="h-96 overflow-y-auto p-6">
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
              </div>

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
