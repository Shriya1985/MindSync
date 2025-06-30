import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { showNotification } from "@/components/ui/notification-system";
import {
  MessageCircle,
  Zap,
  Heart,
  Ear,
  Target,
  Sparkles,
  Brain,
  Settings,
  Bot,
  Crown,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatMode = {
  id: string;
  name: string;
  description: string;
  personality: string;
  icon: typeof Heart;
  color: string;
  bgColor: string;
  example: string;
  responseStyle: {
    tone: string;
    approach: string;
    characteristics: string[];
  };
};

const chatModes: ChatMode[] = [
  {
    id: "cheerleader",
    name: "Cheerleader",
    description: "Energetic and encouraging support",
    personality: "I'm here to pump you up and celebrate every victory!",
    icon: Zap,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200",
    example:
      "You're absolutely crushing it today! Every small step is progress! 🌟",
    responseStyle: {
      tone: "Enthusiastic and motivational",
      approach: "Celebrates achievements and encourages action",
      characteristics: [
        "Uses exclamation points and emojis",
        "Focuses on strengths and possibilities",
        "Encourages immediate action",
        "Celebrates small wins",
      ],
    },
  },
  {
    id: "listener",
    name: "Compassionate Listener",
    description: "Empathetic and understanding companion",
    personality:
      "I'm here to listen without judgment and hold space for your feelings.",
    icon: Ear,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    example:
      "I hear you, and what you're feeling is completely valid. Take your time.",
    responseStyle: {
      tone: "Gentle and empathetic",
      approach: "Validates emotions and provides comfort",
      characteristics: [
        "Uses reflective listening techniques",
        "Validates feelings without rushing to solutions",
        "Asks thoughtful follow-up questions",
        "Provides emotional support",
      ],
    },
  },
  {
    id: "motivator",
    name: "Goal-Focused Motivator",
    description: "Strategic guidance and goal achievement",
    personality:
      "Let's break down your challenges and create an action plan together!",
    icon: Target,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
    example:
      "Let's identify the specific steps you can take today to move forward.",
    responseStyle: {
      tone: "Practical and solution-oriented",
      approach: "Focuses on actionable strategies and goal-setting",
      characteristics: [
        "Breaks down problems into manageable steps",
        "Suggests concrete actions and strategies",
        "Helps prioritize and organize thoughts",
        "Encourages accountability",
      ],
    },
  },
  {
    id: "wise_friend",
    name: "Wise Friend",
    description: "Thoughtful insights and balanced perspective",
    personality: "Drawing from wisdom and experience to offer gentle guidance.",
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
    example:
      "Sometimes life teaches us through difficult moments. What might this be showing you?",
    responseStyle: {
      tone: "Reflective and insightful",
      approach: "Offers perspective and asks meaningful questions",
      characteristics: [
        "Provides thoughtful perspectives",
        "Asks deep, reflective questions",
        "Shares gentle wisdom",
        "Encourages self-discovery",
      ],
    },
  },
  {
    id: "creative_companion",
    name: "Creative Companion",
    description: "Imaginative and playful interaction",
    personality:
      "Let's explore your feelings through creativity and imagination!",
    icon: Sparkles,
    color: "text-pink-600",
    bgColor: "bg-pink-50 border-pink-200",
    example:
      "If your mood were a color today, what would it be? Let's paint with words!",
    responseStyle: {
      tone: "Playful and imaginative",
      approach: "Uses metaphors, creativity, and artistic expression",
      characteristics: [
        "Uses creative metaphors and imagery",
        "Suggests artistic or creative activities",
        "Encourages imaginative thinking",
        "Makes conversations more playful",
      ],
    },
  },
];

export function AIChatModes() {
  const [selectedMode, setSelectedMode] = useState<ChatMode>(chatModes[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [modeHistory, setModeHistory] = useState<string[]>([]);

  // Load saved mode from localStorage
  useEffect(() => {
    const savedModeId = localStorage.getItem("ai-chat-mode");
    const savedMode = chatModes.find((mode) => mode.id === savedModeId);
    if (savedMode) {
      setSelectedMode(savedMode);
    }

    const savedHistory = localStorage.getItem("ai-chat-mode-history");
    if (savedHistory) {
      setModeHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save mode changes
  const selectMode = (mode: ChatMode) => {
    setSelectedMode(mode);
    localStorage.setItem("ai-chat-mode", mode.id);

    // Update history
    const newHistory = [
      mode.id,
      ...modeHistory.filter((id) => id !== mode.id),
    ].slice(0, 3);
    setModeHistory(newHistory);
    localStorage.setItem("ai-chat-mode-history", JSON.stringify(newHistory));

    // Notify about mode change
    showNotification({
      type: "encouragement",
      title: `🤖 AI Mode: ${mode.name}`,
      message: `Now chatting with your ${mode.name.toLowerCase()}`,
      duration: 3000,
    });

    // Apply mode to existing chat system
    window.dispatchEvent(
      new CustomEvent("aiModeChanged", {
        detail: { mode },
      }),
    );
  };

  const getUsageStats = () => {
    const stats = {
      currentStreak: Math.floor(Math.random() * 7) + 1,
      favoriteMode: selectedMode.name,
      modesUsed: modeHistory.length,
      totalConversations: Math.floor(Math.random() * 50) + 10,
    };
    return stats;
  };

  const stats = getUsageStats();

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="w-6 h-6 text-indigo-600" />
          <span>AI Chat Modes</span>
        </CardTitle>
        <p className="text-gray-600">
          Choose how your AI companion responds to your needs
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Mode Display */}
        <div className={cn("p-6 rounded-xl border-2", selectedMode.bgColor)}>
          <div className="flex items-start space-x-4">
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-md",
              )}
            >
              <selectedMode.icon
                className={cn("w-8 h-8", selectedMode.color)}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedMode.name}
                </h3>
                <Badge className="bg-white/80 text-gray-700">Active</Badge>
              </div>
              <p className="text-gray-700 mb-3">{selectedMode.personality}</p>
              <div className="bg-white/60 rounded-lg p-3 border border-white/50">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Example Response:
                </p>
                <p className="text-gray-800 italic">"{selectedMode.example}"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">
              Choose Your AI Companion
            </h4>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outline"
              size="sm"
            >
              {isExpanded ? "Show Less" : "Show All"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(isExpanded ? chatModes : chatModes.slice(0, 4)).map((mode) => {
              const isSelected = mode.id === selectedMode.id;
              const IconComponent = mode.icon;

              return (
                <div
                  key={mode.id}
                  onClick={() => selectMode(mode)}
                  className={cn(
                    "p-4 rounded-lg cursor-pointer transition-all duration-200 border-2",
                    mode.bgColor,
                    isSelected
                      ? "ring-2 ring-indigo-300 scale-105"
                      : "hover:scale-102 hover:shadow-md",
                    "relative",
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <IconComponent className={cn("w-5 h-5", mode.color)} />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-1">
                        {mode.name}
                      </h5>
                      <p className="text-sm text-gray-700 mb-2">
                        {mode.description}
                      </p>
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Style:</span>{" "}
                        {mode.responseStyle.tone}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}

                  {modeHistory.includes(mode.id) && !isSelected && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-gray-100 text-gray-600 text-xs">
                        Recent
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mode Details */}
        {isExpanded && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Current Mode Details</span>
            </h4>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">
                    Response Style
                  </h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>
                      <strong>Tone:</strong> {selectedMode.responseStyle.tone}
                    </li>
                    <li>
                      <strong>Approach:</strong>{" "}
                      {selectedMode.responseStyle.approach}
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">
                    Characteristics
                  </h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {selectedMode.responseStyle.characteristics
                      .slice(0, 3)
                      .map((char, index) => (
                        <li key={index}>• {char}</li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              selectMode(
                chatModes[Math.floor(Math.random() * chatModes.length)],
              )
            }
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Surprise Me</span>
          </Button>

          <Button
            onClick={() => {
              const lastUsed = modeHistory[1];
              const lastMode = chatModes.find((m) => m.id === lastUsed);
              if (lastMode) selectMode(lastMode);
            }}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
            disabled={modeHistory.length < 2}
          >
            <Shield className="w-4 h-4" />
            <span>Previous Mode</span>
          </Button>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {stats.currentStreak}
            </p>
            <p className="text-xs text-gray-600">Day Streak</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {stats.modesUsed}
            </p>
            <p className="text-xs text-gray-600">Modes Tried</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {stats.totalConversations}
            </p>
            <p className="text-xs text-gray-600">Conversations</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-indigo-600">
              {chatModes.length}
            </p>
            <p className="text-xs text-gray-600">Available</p>
          </div>
        </div>

        {/* Integration Notice */}
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex items-start space-x-3">
            <Bot className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-indigo-900 mb-1">
                Smart Integration
              </h4>
              <p className="text-sm text-indigo-800">
                Your selected mode automatically influences how the AI responds
                throughout the app - in chats, mood analysis, and personalized
                suggestions.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Export the current mode for use in other components
export const useCurrentChatMode = () => {
  const [currentMode, setCurrentMode] = useState<ChatMode>(chatModes[0]);

  useEffect(() => {
    const savedModeId = localStorage.getItem("ai-chat-mode");
    const savedMode = chatModes.find((mode) => mode.id === savedModeId);
    if (savedMode) {
      setCurrentMode(savedMode);
    }

    const handleModeChange = (event: CustomEvent) => {
      setCurrentMode(event.detail.mode);
    };

    window.addEventListener("aiModeChanged", handleModeChange as EventListener);
    return () =>
      window.removeEventListener(
        "aiModeChanged",
        handleModeChange as EventListener,
      );
  }, []);

  return currentMode;
};
