import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useData } from "@/contexts/DataContext";
import {
  Heart,
  TrendingUp,
  BookOpen,
  MessageCircle,
  Star,
  Sparkles,
  Brain,
  Target,
} from "lucide-react";

type PersonalityTrait = {
  name: string;
  percentage: number;
  description: string;
  color: string;
  icon: React.ComponentType<any>;
};

type Insight = {
  title: string;
  message: string;
  type: "strength" | "growth" | "pattern";
  icon: React.ComponentType<any>;
};

export function PersonalityInsights() {
  const { journalEntries, moodEntries, chatMessages, userStats } = useData();

  // Calculate personality traits based on user data
  const calculateTraits = (): PersonalityTrait[] => {
    const totalEntries = journalEntries.length + moodEntries.length;
    const positiveEntries = [
      ...journalEntries.filter((entry) => entry.sentiment === "positive"),
      ...moodEntries.filter((entry) => entry.rating >= 7),
    ].length;

    const reflectiveEntries = journalEntries.filter(
      (entry) => entry.wordCount > 100,
    ).length;

    const consistencyScore = Math.min(userStats.currentStreak * 10, 100);
    const positivityScore =
      totalEntries > 0 ? (positiveEntries / totalEntries) * 100 : 50;
    const reflectivenessScore =
      journalEntries.length > 0
        ? (reflectiveEntries / journalEntries.length) * 100
        : 30;
    const engagementScore = Math.min(
      (chatMessages.filter((m) => m.sender === "user").length * 5 +
        journalEntries.length * 10) /
        10,
      100,
    );

    return [
      {
        name: "Optimism",
        percentage: Math.round(positivityScore),
        description: "Your positive outlook and resilience",
        color: "bg-yellow-100 text-yellow-700",
        icon: Heart,
      },
      {
        name: "Self-Reflection",
        percentage: Math.round(reflectivenessScore),
        description: "Your depth of introspection and self-awareness",
        color: "bg-purple-100 text-purple-700",
        icon: Brain,
      },
      {
        name: "Consistency",
        percentage: Math.round(consistencyScore),
        description: "Your commitment to personal growth",
        color: "bg-green-100 text-green-700",
        icon: Target,
      },
      {
        name: "Engagement",
        percentage: Math.round(engagementScore),
        description: "Your active participation in wellness",
        color: "bg-blue-100 text-blue-700",
        icon: TrendingUp,
      },
    ];
  };

  // Generate personalized insights
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    const traits = calculateTraits();

    // Optimism insights
    const optimismTrait = traits.find((t) => t.name === "Optimism");
    if (optimismTrait && optimismTrait.percentage > 70) {
      insights.push({
        title: "Natural Optimist",
        message:
          "You have a wonderful ability to see the bright side of situations. Your positive energy is one of your greatest strengths!",
        type: "strength",
        icon: Heart,
      });
    } else if (optimismTrait && optimismTrait.percentage < 40) {
      insights.push({
        title: "Growing Resilience",
        message:
          "You're on a journey of building resilience. Remember, every small step towards positivity counts and builds your inner strength.",
        type: "growth",
        icon: TrendingUp,
      });
    }

    // Consistency insights
    const consistencyTrait = traits.find((t) => t.name === "Consistency");
    if (consistencyTrait && consistencyTrait.percentage > 60) {
      insights.push({
        title: "Dedicated Achiever",
        message:
          "Your consistency in checking in with yourself shows remarkable self-discipline. This habit will serve you well in all areas of life!",
        type: "strength",
        icon: Target,
      });
    }

    // Reflection insights
    const reflectionTrait = traits.find((t) => t.name === "Self-Reflection");
    if (reflectionTrait && reflectionTrait.percentage > 60) {
      insights.push({
        title: "Deep Thinker",
        message:
          "You have a gift for introspection and deep thinking. Your detailed journal entries show your commitment to understanding yourself.",
        type: "strength",
        icon: BookOpen,
      });
    }

    // Pattern insights based on data
    if (journalEntries.length > 5) {
      const recentTags = journalEntries
        .slice(0, 5)
        .flatMap((entry) => entry.tags)
        .reduce(
          (acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

      const topTag = Object.entries(recentTags).sort((a, b) => b[1] - a[1])[0];
      if (topTag) {
        insights.push({
          title: "Focus Pattern",
          message: `You've been reflecting a lot on "${topTag[0]}" lately. This shows your mind is actively processing and growing in this area.`,
          type: "pattern",
          icon: Brain,
        });
      }
    }

    // Engagement insights
    if (chatMessages.filter((m) => m.sender === "user").length > 10) {
      insights.push({
        title: "Open Communicator",
        message:
          "You're comfortable sharing your thoughts with Buddy. This openness to dialogue is a valuable trait for personal growth and relationships.",
        type: "strength",
        icon: MessageCircle,
      });
    }

    // Default encouraging insight if no specific ones apply
    if (insights.length === 0) {
      insights.push({
        title: "Beginning Your Journey",
        message:
          "You're taking the beautiful first steps towards better mental wellness. Every entry, every check-in, is building a stronger, more self-aware you.",
        type: "growth",
        icon: Sparkles,
      });
    }

    return insights.slice(0, 3); // Limit to 3 insights
  };

  const traits = calculateTraits();
  const insights = generateInsights();

  const getInsightColor = (type: string) => {
    switch (type) {
      case "strength":
        return "from-green-500 to-emerald-500";
      case "growth":
        return "from-blue-500 to-sky-500";
      case "pattern":
        return "from-purple-500 to-pink-500";
      default:
        return "from-mint-500 to-sky-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Personality Traits */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-mint-600" />
            <span>Your Personality Strengths</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {traits.map((trait, index) => {
              const IconComponent = trait.icon;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4 text-mint-600" />
                      <span className="font-medium text-gray-900">
                        {trait.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {trait.percentage}%
                    </span>
                  </div>
                  <Progress value={trait.percentage} className="h-2" />
                  <p className="text-xs text-gray-600">{trait.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Personality Insights */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-mint-600" />
            <span>Personal Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-gray-100 bg-gradient-to-r from-mint-50 to-sky-50"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${getInsightColor(insight.type)}`}
                    >
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {insight.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {insight.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {insight.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
