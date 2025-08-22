import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useData } from "@/contexts/DataContext";
import {
  Trophy,
  Star,
  Crown,
  Zap,
  Target,
  Award,
  Flame,
  BookOpen,
  MessageCircle,
  Heart,
  Brain,
  Calendar,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type LevelInfo = {
  level: number;
  title: string;
  xpRequired: number;
  xpForNext: number;
  color: string;
  icon: React.ComponentType<any>;
  perks: string[];
};

type BadgeType = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "streak" | "milestone" | "special" | "achievement";
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  requirement?: number;
};

const getLevelInfo = (xp: number): LevelInfo => {
  const levels = [
    {
      level: 1,
      title: "Wellness Seedling",
      xpRequired: 0,
      xpForNext: 100,
      color: "from-green-400 to-emerald-500",
      icon: Star,
      perks: ["Daily quests", "Basic mood tracking"],
    },
    {
      level: 2,
      title: "Mindful Explorer",
      xpRequired: 100,
      xpForNext: 250,
      color: "from-blue-400 to-cyan-500",
      icon: Target,
      perks: ["Coping strategies", "Mood predictions"],
    },
    {
      level: 3,
      title: "Self-Care Enthusiast",
      xpRequired: 250,
      xpForNext: 500,
      color: "from-purple-400 to-pink-500",
      icon: Heart,
      perks: ["Advanced insights", "Personalized themes"],
    },
    {
      level: 4,
      title: "Wellness Warrior",
      xpRequired: 500,
      xpForNext: 1000,
      color: "from-orange-400 to-red-500",
      icon: Award,
      perks: ["Custom quests", "Detailed analytics"],
    },
    {
      level: 5,
      title: "Mindfulness Master",
      xpRequired: 1000,
      xpForNext: 2000,
      color: "from-indigo-400 to-purple-500",
      icon: Brain,
      perks: ["Mentor features", "Community access"],
    },
    {
      level: 6,
      title: "Zen Guardian",
      xpRequired: 2000,
      xpForNext: 5000,
      color: "from-pink-400 to-rose-500",
      icon: Crown,
      perks: ["Premium insights", "Advanced AI features"],
    },
    {
      level: 7,
      title: "Enlightened Soul",
      xpRequired: 5000,
      xpForNext: Infinity,
      color: "from-yellow-400 to-orange-500",
      icon: Sparkles,
      perks: ["All features unlocked", "Legendary status"],
    },
  ];

  const currentLevel = [...levels].reverse().find((level) => xp >= level.xpRequired);
  return currentLevel || levels[0];
};

export function GamificationSystem() {
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const { userStats, moodEntries, journalEntries, chatMessages } = useData();

  // Initialize and update badges based on user activity
  useEffect(() => {
    const allBadges: BadgeType[] = [
      // Streak Badges
      {
        id: "first_step",
        name: "First Step",
        description: "Made your first wellness entry",
        icon: "🌱",
        category: "milestone",
        rarity: "common",
        unlocked: userStats.totalEntries > 0,
        unlockedDate:
          userStats.totalEntries > 0 ? new Date().toISOString() : undefined,
      },
      {
        id: "week_warrior",
        name: "Week Warrior",
        description: "7-day wellness streak",
        icon: "🔥",
        category: "streak",
        rarity: "common",
        unlocked: userStats.currentStreak >= 7,
        progress: userStats.currentStreak,
        requirement: 7,
      },
      {
        id: "month_master",
        name: "Month Master",
        description: "30-day wellness streak",
        icon: "💎",
        category: "streak",
        rarity: "rare",
        unlocked: userStats.currentStreak >= 30,
        progress: userStats.currentStreak,
        requirement: 30,
      },
      {
        id: "century_champion",
        name: "Century Champion",
        description: "100-day wellness streak",
        icon: "👑",
        category: "streak",
        rarity: "legendary",
        unlocked: userStats.currentStreak >= 100,
        progress: userStats.currentStreak,
        requirement: 100,
      },

      // Activity Badges
      {
        id: "chat_companion",
        name: "Chat Companion",
        description: "Had 25 conversations with Buddy",
        icon: "💬",
        category: "achievement",
        rarity: "common",
        unlocked: Array.isArray(chatMessages)
          ? chatMessages.filter((m) => m.sender === "user").length >= 25
          : false,
        progress: Array.isArray(chatMessages)
          ? chatMessages.filter((m) => m.sender === "user").length
          : 0,
        requirement: 25,
      },
      {
        id: "journal_enthusiast",
        name: "Journal Enthusiast",
        description: "Written 10 journal entries",
        icon: "📖",
        category: "achievement",
        rarity: "common",
        unlocked: Array.isArray(journalEntries)
          ? journalEntries.length >= 10
          : false,
        progress: Array.isArray(journalEntries) ? journalEntries.length : 0,
        requirement: 10,
      },
      {
        id: "word_wizard",
        name: "Word Wizard",
        description: "Written 1,000+ words total",
        icon: "✍️",
        category: "milestone",
        rarity: "rare",
        unlocked: userStats.totalWords >= 1000,
        progress: userStats.totalWords,
        requirement: 1000,
      },
      {
        id: "mood_master",
        name: "Mood Master",
        description: "Logged 50 mood entries",
        icon: "🎭",
        category: "achievement",
        rarity: "rare",
        unlocked: Array.isArray(moodEntries) ? moodEntries.length >= 50 : false,
        progress: Array.isArray(moodEntries) ? moodEntries.length : 0,
        requirement: 50,
      },

      // Level Badges
      {
        id: "level_up_3",
        name: "Rising Star",
        description: "Reached level 3",
        icon: "⭐",
        category: "milestone",
        rarity: "common",
        unlocked: userStats.level >= 3,
      },
      {
        id: "level_up_5",
        name: "Wellness Guru",
        description: "Reached level 5",
        icon: "🧘",
        category: "milestone",
        rarity: "epic",
        unlocked: userStats.level >= 5,
      },

      // Special Badges
      {
        id: "positive_vibes",
        name: "Positive Vibes",
        description: "75% of entries are positive",
        icon: "☀️",
        category: "special",
        rarity: "rare",
        unlocked:
          userStats.totalEntries > 0 &&
          userStats.positiveEntries / userStats.totalEntries >= 0.75,
      },
      {
        id: "deep_thinker",
        name: "Deep Thinker",
        description: "Written entries with 500+ words",
        icon: "🤔",
        category: "special",
        rarity: "epic",
        unlocked:
          Array.isArray(journalEntries) &&
          journalEntries.some((entry) => entry.wordCount >= 500),
      },
      {
        id: "consistency_king",
        name: "Consistency Crown",
        description: "No gaps in wellness tracking for 2 weeks",
        icon: "👑",
        category: "special",
        rarity: "legendary",
        unlocked: userStats.currentStreak >= 14,
      },
      {
        id: "gratitude_heart",
        name: "Grateful Heart",
        description: "Mentioned gratitude 10+ times",
        icon: "💝",
        category: "special",
        rarity: "rare",
        unlocked: (() => {
          try {
            const journals = Array.isArray(journalEntries)
              ? journalEntries
              : [];
            const chats = Array.isArray(chatMessages) ? chatMessages : [];
            const allContent = [
              ...journals.map((j) => j.content || ""),
              ...chats.map((m) => m.content || ""),
            ]
              .join(" ")
              .toLowerCase();
            return (
              allContent.includes("grateful") || allContent.includes("thankful")
            );
          } catch (error) {
            return false;
          }
        })(),
      },
    ];

    setBadges(allBadges);
  }, [userStats, moodEntries, journalEntries, chatMessages]);

  const currentLevel = getLevelInfo(userStats.points);
  const nextLevel = getLevelInfo(userStats.points + 1);
  const progressToNext =
    nextLevel.level === currentLevel.level
      ? 100
      : ((userStats.points - currentLevel.xpRequired) /
          (nextLevel.xpRequired - currentLevel.xpRequired)) *
        100;

  const unlockedBadges = badges.filter((badge) => badge.unlocked);
  const recentBadges = unlockedBadges.slice(-3);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "rare":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "epic":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "legendary":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const IconComponent = currentLevel.icon;

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${currentLevel.color}`} />
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${currentLevel.color}`}
              >
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  Level {currentLevel.level}
                </h3>
                <p className="text-gray-600">{currentLevel.title}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {(userStats?.points || 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">XP</div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Progress to next level */}
            {nextLevel.level > currentLevel.level && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Progress to Level {nextLevel.level}
                  </span>
                  <span className="font-medium">
                    {userStats.points - currentLevel.xpRequired} /{" "}
                    {nextLevel.xpRequired - currentLevel.xpRequired} XP
                  </span>
                </div>
                <Progress value={progressToNext} className="h-3" />
                <p className="text-xs text-gray-500">
                  {nextLevel.xpRequired - userStats.points} XP until{" "}
                  {nextLevel.title}
                </p>
              </div>
            )}

            {/* Current Level Perks */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Current Level Perks:
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentLevel.perks.map((perk, index) => (
                  <Badge
                    key={index}
                    className="bg-mint-100 text-mint-700"
                    variant="secondary"
                  >
                    {perk}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Badges */}
      {recentBadges.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span>Recent Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={cn(
                    "p-4 rounded-lg border-2 text-center",
                    getRarityColor(badge.rarity),
                  )}
                >
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <h4 className="font-semibold mb-1">{badge.name}</h4>
                  <p className="text-xs opacity-80">{badge.description}</p>
                  <Badge className="mt-2 text-xs capitalize">
                    {badge.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Badges */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span>
                Badge Collection ({unlockedBadges.length}/{badges.length})
              </span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllBadges(!showAllBadges)}
            >
              {showAllBadges ? "Show Less" : "Show All"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(showAllBadges ? badges : badges.filter((b) => b.unlocked))
              .slice(0, showAllBadges ? undefined : 12)
              .map((badge) => (
                <div
                  key={badge.id}
                  className={cn(
                    "p-3 rounded-lg border-2 text-center transition-all duration-300",
                    badge.unlocked
                      ? getRarityColor(badge.rarity)
                      : "bg-gray-50 text-gray-400 border-gray-200 opacity-50",
                  )}
                >
                  <div className="text-2xl mb-2">
                    {badge.unlocked ? badge.icon : "🔒"}
                  </div>
                  <h4 className="font-semibold text-xs mb-1">{badge.name}</h4>
                  <p className="text-xs opacity-80 leading-tight">
                    {badge.description}
                  </p>
                  {badge.progress !== undefined && badge.requirement && (
                    <div className="mt-2">
                      <Progress
                        value={(badge.progress / badge.requirement) * 100}
                        className="h-1"
                      />
                      <p className="text-xs mt-1">
                        {badge.progress}/{badge.requirement}
                      </p>
                    </div>
                  )}
                  <Badge className="mt-2 text-xs capitalize">
                    {badge.rarity}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
