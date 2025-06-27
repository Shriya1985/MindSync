import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useData } from "@/contexts/DataContext";
import {
  getCopingStrategies,
  analyzeEmotionalState,
  type CopingStrategy,
} from "@/utils/emotionAI";
import {
  Heart,
  ChevronDown,
  ChevronUp,
  Clock,
  PlayCircle,
  CheckCircle,
  Lightbulb,
  Wind,
  Brain,
  Activity,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CopingStrategies() {
  const [strategies, setStrategies] = useState<CopingStrategy[]>([]);
  const [openStrategy, setOpenStrategy] = useState<string | null>(null);
  const [completedStrategies, setCompletedStrategies] = useState<string[]>([]);
  const { moodEntries, journalEntries, chatMessages } = useData();

  useEffect(() => {
    // Analyze current emotional state from recent data
    const recentMoods = moodEntries.slice(0, 5);
    const recentJournals = journalEntries.slice(0, 3);

    if (recentMoods.length === 0 && recentJournals.length === 0) return;

    // Get the most recent text content for analysis
    const recentText =
      recentJournals.length > 0
        ? recentJournals[0].content
        : recentMoods.length > 0
          ? `I'm feeling ${recentMoods[0].mood.toLowerCase()}`
          : "";

    if (recentText) {
      const emotionalState = analyzeEmotionalState(
        recentText,
        recentMoods,
        recentJournals,
      );
      const recommendedStrategies = getCopingStrategies(
        emotionalState.primary,
        emotionalState.intensity,
      );
      setStrategies(recommendedStrategies);
    }

    // Load completed strategies from localStorage
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem(`coping_${today}`);
    if (saved) {
      setCompletedStrategies(JSON.parse(saved));
    }
  }, [moodEntries, journalEntries, chatMessages]);

  const markStrategyComplete = (strategyId: string) => {
    const newCompleted = [...completedStrategies, strategyId];
    setCompletedStrategies(newCompleted);

    // Save to localStorage
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`coping_${today}`, JSON.stringify(newCompleted));
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      breathing: Wind,
      grounding: Brain,
      cognitive: Lightbulb,
      physical: Activity,
      creative: Palette,
    };
    return icons[category as keyof typeof icons] || Heart;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      breathing: "from-cyan-500 to-blue-500",
      grounding: "from-green-500 to-emerald-500",
      cognitive: "from-purple-500 to-indigo-500",
      physical: "from-orange-500 to-red-500",
      creative: "from-pink-500 to-rose-500",
    };
    return (
      colors[category as keyof typeof colors] || "from-mint-500 to-sky-500"
    );
  };

  if (strategies.length === 0) return null;

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-mint-600" />
          <span>Personalized Coping Strategies</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Based on your recent mood and journal entries, here are some
          techniques that might help you right now.
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {strategies.map((strategy) => {
            const IconComponent = getCategoryIcon(strategy.category);
            const isCompleted = completedStrategies.includes(strategy.id);
            const isOpen = openStrategy === strategy.id;

            return (
              <Card
                key={strategy.id}
                className={cn(
                  "border-2 transition-all duration-300",
                  isCompleted
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 hover:border-mint-200",
                )}
              >
                <Collapsible
                  open={isOpen}
                  onOpenChange={() =>
                    setOpenStrategy(isOpen ? null : strategy.id)
                  }
                >
                  <CollapsibleTrigger asChild>
                    <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r ${getCategoryColor(strategy.category)}`}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4
                                className={cn(
                                  "font-semibold",
                                  isCompleted
                                    ? "text-green-700"
                                    : "text-gray-900",
                                )}
                              >
                                {strategy.icon} {strategy.title}
                              </h4>
                              {isCompleted && (
                                <Badge className="bg-green-100 text-green-700">
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {strategy.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{strategy.duration}</span>
                              </div>
                              <Badge
                                variant="secondary"
                                className="text-xs capitalize"
                              >
                                {strategy.category}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <PlayCircle className="w-5 h-5 text-mint-600" />
                          )}
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="pt-4 space-y-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">
                            Step-by-step guide:
                          </h5>
                          <ol className="space-y-2">
                            {strategy.steps.map((step, index) => (
                              <li
                                key={index}
                                className="flex items-start space-x-3 text-sm"
                              >
                                <span className="flex-shrink-0 w-6 h-6 bg-mint-100 text-mint-700 rounded-full flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </span>
                                <span className="text-gray-700 leading-relaxed">
                                  {step}
                                </span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {!isCompleted && (
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={() => markStrategyComplete(strategy.id)}
                              className="bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Complete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {/* Encouragement Message */}
        <div className="mt-6 p-4 bg-gradient-to-r from-mint-50 to-sky-50 rounded-lg border border-mint-200">
          <div className="flex items-center space-x-2 mb-2">
            <Heart className="w-5 h-5 text-mint-600" />
            <span className="font-semibold text-mint-900">Remember</span>
          </div>
          <p className="text-sm text-mint-700">
            These are tools to support you, not obligations. Choose what feels
            right for you in this moment. Your mental health journey is unique,
            and every small step counts. 💚
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
