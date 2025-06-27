import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  Mic,
  MoreVertical,
  Brain,
  Heart,
  Zap,
  Smile,
  Frown,
  Meh,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  mood?: string;
};

type MoodOption = {
  emoji: string;
  label: string;
  value: string;
  color: string;
};

const moodOptions: MoodOption[] = [
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
    color: "bg-orange-100 text-orange-700",
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
    color: "bg-red-100 text-red-700",
  },
  {
    emoji: "😴",
    label: "Tired",
    value: "tired",
    color: "bg-purple-100 text-purple-700",
  },
  {
    emoji: "🤔",
    label: "Confused",
    value: "confused",
    color: "bg-gray-100 text-gray-700",
  },
  {
    emoji: "✨",
    label: "Excited",
    value: "excited",
    color: "bg-pink-100 text-pink-700",
  },
];

const aiResponses = [
  "I understand how you're feeling. Can you tell me more about what's been on your mind today?",
  "Thank you for sharing that with me. Your feelings are completely valid. 💙",
  "It sounds like you're going through a lot right now. Remember, it's okay to take things one step at a time.",
  "I'm here to listen and support you. Would you like to explore some coping strategies together?",
  "That's a really insightful observation about yourself. Self-awareness is an important step in mental wellness.",
  "I hear that you're feeling overwhelmed. Let's break this down into smaller, manageable pieces.",
  "Your mental health journey is unique to you, and every small step forward matters.",
  "It's wonderful that you're taking time to check in with yourself today. How can I best support you right now?",
];

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your MindSync AI companion. I'm here to listen, support, and help you explore your thoughts and feelings. How are you doing today? 💚",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const simulateAIResponse = () => {
    setIsTyping(true);
    setTimeout(
      () => {
        const randomResponse =
          aiResponses[Math.floor(Math.random() * aiResponses.length)];
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: randomResponse,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      },
      1500 + Math.random() * 1000,
    );
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      mood: selectedMood || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setSelectedMood(null);
    simulateAIResponse();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        content:
          "Hello! I'm your MindSync AI companion. I'm here to listen, support, and help you explore your thoughts and feelings. How are you doing today? 💚",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-sky-50">
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
          <p className="text-gray-600">
            Share your thoughts and feelings in a safe, supportive space
          </p>
        </div>

        {/* Chat Container */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-[600px] flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-mint-400 to-sky-400 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">MindSync AI</h3>
                <div className="flex items-center space-x-1 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Online & Ready to Help</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
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
            {messages.map((message) => (
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
                      <span className="text-xs text-gray-500">MindSync AI</span>
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
                    <span className="text-xs text-gray-500">MindSync AI</span>
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
                Quick mood:
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

        {/* Features Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Heart className="w-4 h-4 text-mint-500" />
            <span>Empathetic AI responses</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Zap className="w-4 h-4 text-sky-500" />
            <span>Real-time mood tracking</span>
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
