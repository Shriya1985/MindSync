import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import {
  Heart,
  TrendingUp,
  Sparkles,
  Brain,
  Star,
  MessageCircle,
  BookOpen,
  Calendar,
} from "lucide-react";

export function EncouragingInsights() {
  const { journalEntries, moodEntries, chatMessages, userStats } = useData();

  // Get recent activities (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  const recentJournalEntries = (journalEntries || []).filter(
    (entry) => entry.date >= sevenDaysAgoStr,
  );
  const recentMoodEntries = (moodEntries || []).filter(
    (entry) => entry.date >= sevenDaysAgoStr,
  );
  const recentChatMessages = (chatMessages || []).filter(
    (msg) =>
      msg.sender === "user" &&
      msg.timestamp.toISOString().split("T")[0] >= sevenDaysAgoStr,
  );

  const generatePersonalizedInsight = () => {
    const insights = [];

    // Activity-based insights
    if (recentJournalEntries.length > 0) {
      const totalWords = recentJournalEntries.reduce(
        (sum, entry) => sum + entry.wordCount,
        0,
      );
      const avgWordsPerEntry = Math.round(
        totalWords / recentJournalEntries.length,
      );

      if (avgWordsPerEntry > 100) {
        insights.push({
          type: "reflection",
          icon: BookOpen,
          title: "Deep Reflector",
          message: `You've been doing amazing deep reflection lately! Your recent journal entries average ${avgWordsPerEntry} words, showing your commitment to self-understanding.`,
          color: "from-purple-500 to-pink-500",
        });
      } else {
        insights.push({
          type: "reflection",
          icon: BookOpen,
          title: "Growing Awareness",
          message: `You've written ${recentJournalEntries.length} journal entries this week. Every word you write is a step toward greater self-awareness!`,
          color: "from-purple-500 to-pink-500",
        });
      }
    }

    // Mood tracking insights
    if (recentMoodEntries.length > 0) {
      const avgMood =
        recentMoodEntries.reduce((sum, entry) => sum + entry.rating, 0) /
        recentMoodEntries.length;
      const positiveEntries = recentMoodEntries.filter(
        (entry) => entry.rating >= 7,
      ).length;

      if (avgMood >= 7) {
        insights.push({
          type: "mood",
          icon: Heart,
          title: "Radiating Positivity",
          message: `Your mood has been wonderfully positive this week! You're averaging ${avgMood.toFixed(1)}/10. Your positive energy is inspiring!`,
          color: "from-yellow-500 to-orange-500",
        });
      } else if (avgMood >= 5) {
        insights.push({
          type: "mood",
          icon: TrendingUp,
          title: "Steady Progress",
          message: `You're maintaining a balanced mood this week. Remember, every small step counts in your wellness journey!`,
          color: "from-green-500 to-emerald-500",
        });
      } else {
        insights.push({
          type: "support",
          icon: Heart,
          title: "You're Not Alone",
          message: `This week has been challenging, but you're still here, still checking in. That shows incredible strength. Buddy is always here to support you.`,
          color: "from-mint-500 to-sky-500",
        });
      }
    }

    // Chat activity insights
    if (recentChatMessages.length > 0) {
      insights.push({
        type: "connection",
        icon: MessageCircle,
        title: "Open Communicator",
        message: `You've had ${recentChatMessages.length} meaningful conversations with Buddy this week. Your openness to dialogue is a beautiful strength!`,
        color: "from-blue-500 to-sky-500",
      });
    }

    // Streak insights
    if (userStats?.currentStreak > 0) {
      if (userStats.currentStreak >= 7) {
        insights.push({
          type: "consistency",
          icon: Star,
          title: "Consistency Champion",
          message: `${userStats.currentStreak} days of consistency! Your dedication to self-care is absolutely admirable. Keep this beautiful momentum going!`,
          color: "from-orange-500 to-red-500",
        });
      } else {
        insights.push({
          type: "growth",
          icon: Calendar,
          title: "Building Habits",
          message: `${userStats.currentStreak} days strong! You're building something beautiful - a habit of caring for your mental wellness.`,
          color: "from-green-500 to-teal-500",
        });
      }
    }

    // Level-based insights
    if (userStats?.level >= 3) {
      insights.push({
        type: "achievement",
        icon: Star,
        title: "Wellness Warrior",
        message: `Level ${userStats.level} achieved! You've earned ${userStats.points} points on your wellness journey. Your growth is remarkable!`,
        color: "from-purple-500 to-indigo-500",
      });
    }

    // Default encouraging message if no specific insights
    if (insights.length === 0) {
      insights.push({
        type: "encouragement",
        icon: Sparkles,
        title: "Welcome to Your Journey",
        message:
          "Every great journey begins with a single step. You're here, you're present, and that's already something to celebrate!",
        color: "from-mint-500 to-sky-500",
      });
    }

    // Return up to 2 insights
    return insights.slice(0, 2);
  };

  const insights = generatePersonalizedInsight();

  if (insights.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      {insights.map((insight, index) => {
        const IconComponent = insight.icon;
        return (
          <Card
            key={index}
            className="shadow-lg border-0 bg-white/90 backdrop-blur-sm overflow-hidden"
          >
            <div className={`h-1 bg-gradient-to-r ${insight.color}`} />
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${insight.color}`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {insight.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="text-xs capitalize bg-gray-100 text-gray-600"
                    >
                      Personal Insight
                    </Badge>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
