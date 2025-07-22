import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useData, type ChatMessage } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import { MessageCircle, Send, Brain, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateGeminiResponse } from "@/utils/geminiChatAPI";

export default function SimplifiedChatbot() {
  const [inputValue, setInputValue] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { addChatMessage, userStats } = useData();

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: "welcome-" + Date.now(),
      content:
        "Hello! I'm Buddy, your AI companion. How are you feeling today?",
      sender: "ai",
      timestamp: new Date(),
    };
    setLocalMessages([welcomeMessage]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages, isTyping]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await generateGeminiResponse(userMessage, {
        recentMessages: localMessages,
        recentMoods: [],
        recentJournals: [],
        userStats: userStats,
        userName: "Friend",
        currentMood: undefined
      });
      return response;
    } catch (error) {
      console.error("Error getting AI response:", error);
      // Fallback to simple response if AI fails
      const fallbackResponses = [
        "Thank you for sharing that with me. How does that make you feel?",
        "I hear you. That sounds important to you. Can you tell me more?",
        "I appreciate you opening up about this. What's been on your mind?",
      ];
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return; // Prevent multiple calls

    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      content: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    // Add user message to local state immediately
    setLocalMessages((prev) => [...prev, userMessage]);

    // Save to database
    try {
      await addChatMessage({
        content: userMessage.content,
        sender: "user",
      });
    } catch (error) {
      console.error("Error saving user message:", error);
    }

    const messageText = inputValue.trim();
    setInputValue("");
    setIsTyping(true);

    // Get AI response
    try {
      const aiResponseContent = await generateAIResponse(messageText);

      const aiResponse: ChatMessage = {
        id: "ai-" + Date.now(),
        content: aiResponseContent,
        sender: "ai",
        timestamp: new Date(),
      };

      // Add AI response to local state
      setLocalMessages((prev) => [...prev, aiResponse]);

      // Save AI response to database
      try {
        await addChatMessage({
          content: aiResponse.content,
          sender: "ai",
        });
      } catch (error) {
        console.error("Error saving AI message:", error);
      }

      setIsTyping(false);
    } catch (error) {
      console.error("Error generating AI response:", error);
      setIsTyping(false);
      showNotification("Sorry, I'm having trouble responding right now. Please try again.", "error");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-sky-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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
          <div className="text-sm text-gray-500">
            Level {userStats.level} • {userStats.points} points
          </div>
        </div>

        {/* Chat Container */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {localMessages.map((message) => (
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
                      <Brain className="w-4 h-4 text-mint-500" />
                      <span className="text-xs text-gray-500">Buddy</span>
                    </div>
                  )}
                  {message.sender === "user" && (
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-white/80" />
                      <span className="text-xs text-white/80">You</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
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
                    <Brain className="w-4 h-4 text-mint-500" />
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

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="border-gray-200 focus:border-mint-300 focus:ring-mint-200"
                  disabled={isTyping}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Status */}
        <div className="mt-4 text-center text-sm text-gray-500">
          {localMessages.length > 1 ? (
            <span>
              Conversation active • {localMessages.length - 1} messages
              exchanged
            </span>
          ) : (
            <span>Ready to chat • Messages are automatically saved</span>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
