import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useData } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import { generateDailyQuests, type DailyQuest } from "@/utils/emotionAI";
import {
  Target,
  Star,
  Trophy,
  CheckCircle,
  Clock,
  Zap,
  Gift,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DailyQuests() {
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const {
    journalEntries,
    moodEntries,
    chatMessages,
    userStats,
    addPoints,
    completeDailyQuest,
  } = useData();

  // Load completed quests from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem(`quests_${today}`);
    if (saved) {
      setCompletedToday(JSON.parse(saved));
    }
  }, []);

  // Generate or load daily quests
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const savedQuests = localStorage.getItem(`daily_quests_${today}`);

    if (savedQuests) {
      // Load saved quests for today
      const parsedQuests = JSON.parse(savedQuests);
      const updatedQuests = parsedQuests.map((quest: DailyQuest) => ({
        ...quest,
        completed: completedToday.includes(quest.id),
      }));
      setQuests(updatedQuests);
    } else {
      // Generate new quests for today
      const userHistory = {
        journals: Array.isArray(journalEntries) ? journalEntries : [],
        moods: Array.isArray(moodEntries) ? moodEntries : [],
        chats: Array.isArray(chatMessages) ? chatMessages : [],
      };

      const dailyQuests = generateDailyQuests(userHistory, completedToday);

      // Save new quests for today
      localStorage.setItem(
        `daily_quests_${today}`,
        JSON.stringify(dailyQuests),
      );

      const updatedQuests = dailyQuests.map((quest) => ({
        ...quest,
        completed: completedToday.includes(quest.id),
      }));

      setQuests(updatedQuests);
    }
  }, [journalEntries, moodEntries, chatMessages, completedToday]);

  const completeQuest = async (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.completed) return;

    const newCompleted = [...completedToday, questId];
    setCompletedToday(newCompleted);

    // Save to localStorage
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`quests_${today}`, JSON.stringify(newCompleted));

    // Update quest state
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completed: true } : q)),
    );

    // Award XP through data context and mark quest as completed
    try {
      await addPoints(quest.xp, `Daily Quest: ${quest.title}`);
      await completeDailyQuest(questId);
    } catch (error) {
      console.error("Error completing quest:", error);
      // Quest is still marked as completed locally, so continue with notification
    }

    // Show celebration notification
    showNotification({
      type: "achievement",
      title: "Quest Complete! 🎉",
      message: `Great job! You earned ${quest.xp} XP for "${quest.title}". Keep up the amazing work!`,
      duration: 4000,
    });

    // Check for daily completion bonus
    const completedCount = newCompleted.length;
    if (completedCount === quests.length && quests.length > 0) {
      await addPoints(50, "Daily Quest Completion Bonus");
      setTimeout(() => {
        showNotification({
          type: "milestone",
          title: "Daily Champion! 🏆",
          message: "You completed all your daily quests! Bonus 50 XP awarded!",
          duration: 6000,
        });
      }, 1000);
    }
  };

  const resetQuests = () => {
    const today = new Date().toISOString().split("T")[0];

    // Clear completed status
    setCompletedToday([]);
    localStorage.removeItem(`quests_${today}`);
    localStorage.removeItem(`daily_quests_${today}`);

    // Generate fresh quests
    const userHistory = {
      journals: journalEntries,
      moods: moodEntries,
      chats: chatMessages,
    };

    const newQuests = generateDailyQuests(userHistory, []);
    localStorage.setItem(`daily_quests_${today}`, JSON.stringify(newQuests));
    setQuests(newQuests);

    showNotification({
      type: "encouragement",
      title: "Fresh Quests Generated! 🔄",
      message: "Your daily quests have been refreshed with new challenges!",
      duration: 3000,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      gratitude: "🙏",
      mindfulness: "🧘",
      connection: "💬",
      movement: "🚶",
      creativity: "🎨",
    };
    return icons[category as keyof typeof icons] || "⭐";
  };

  const totalXP = quests.reduce(
    (sum, quest) => sum + (quest.completed ? quest.xp : 0),
    0,
  );
  const maxXP = quests.reduce((sum, quest) => sum + quest.xp, 0);
  const completionPercentage = maxXP > 0 ? (totalXP / maxXP) * 100 : 0;

  if (quests.length === 0) return null;

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-mint-600" />
            <span>Daily Self-Care Quests</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {totalXP} / {maxXP} XP
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetQuests}
              className="text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Today's Progress</span>
            <span>
              {completedToday.length} / {quests.length} completed
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          {completionPercentage === 100 && (
            <div className="flex items-center space-x-1 text-sm text-green-600">
              <Trophy className="w-4 h-4" />
              <span>All quests completed! You're a wellness champion!</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {quests.map((quest, index) => (
            <div
              key={quest.id}
              className={cn(
                "p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.01]",
                quest.completed
                  ? "border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-mint-300 hover:bg-gradient-to-r hover:from-mint-50 hover:to-sky-50 hover:shadow-lg",
                "animate-in slide-in-from-top-2",
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">
                    {quest.completed ? "✅" : getCategoryIcon(quest.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4
                        className={cn(
                          "font-semibold",
                          quest.completed
                            ? "text-green-700 line-through"
                            : "text-gray-900",
                        )}
                      >
                        {quest.title}
                      </h4>
                      <Badge
                        className={getDifficultyColor(quest.difficulty)}
                        variant="secondary"
                      >
                        {quest.difficulty}
                      </Badge>
                    </div>
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        quest.completed ? "text-green-600" : "text-gray-600",
                      )}
                    >
                      {quest.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>{quest.xp} XP</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span className="capitalize">{quest.category}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  {quest.completed ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Complete!</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => completeQuest(quest.id)}
                      size="sm"
                      className="bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Daily Bonus Info */}
        {completedToday.length < quests.length && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <Gift className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-900">Daily Bonus</span>
            </div>
            <p className="text-sm text-purple-700">
              Complete all quests today to earn a bonus 50 XP and unlock special
              achievements!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
