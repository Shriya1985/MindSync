import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useData } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Heart,
  Brain,
  Zap,
  Smile,
  Plus,
  ChevronDown,
  Filter,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MoodEntry = {
  id: string;
  date: string;
  mood: string;
  rating: number;
  emoji: string;
  note?: string;
  activities?: string[];
};

type Streak = {
  current: number;
  longest: number;
  type: string;
};

const moodData: MoodEntry[] = [
  {
    id: "1",
    date: "2024-01-15",
    mood: "Happy",
    rating: 8,
    emoji: "😊",
    activities: ["Exercise", "Reading"],
  },
  {
    id: "2",
    date: "2024-01-14",
    mood: "Calm",
    rating: 7,
    emoji: "😌",
    activities: ["Meditation"],
  },
  {
    id: "3",
    date: "2024-01-13",
    mood: "Anxious",
    rating: 4,
    emoji: "😰",
    note: "Work stress",
  },
  {
    id: "4",
    date: "2024-01-12",
    mood: "Excited",
    rating: 9,
    emoji: "✨",
    activities: ["Friends", "Creativity"],
  },
  {
    id: "5",
    date: "2024-01-11",
    mood: "Tired",
    rating: 5,
    emoji: "😴",
  },
  {
    id: "6",
    date: "2024-01-10",
    mood: "Happy",
    rating: 8,
    emoji: "😊",
    activities: ["Exercise", "Music"],
  },
  {
    id: "7",
    date: "2024-01-09",
    mood: "Calm",
    rating: 7,
    emoji: "😌",
    activities: ["Nature"],
  },
];

const streaks: Streak[] = [
  { current: 7, longest: 12, type: "Daily Check-ins" },
  { current: 3, longest: 8, type: "Meditation" },
  { current: 5, longest: 15, type: "Positive Moods" },
];

const weeklyMoodChart = [
  { day: "Mon", rating: 7, emoji: "😌" },
  { day: "Tue", rating: 5, emoji: "😴" },
  { day: "Wed", rating: 8, emoji: "😊" },
  { day: "Thu", rating: 4, emoji: "😰" },
  { day: "Fri", rating: 9, emoji: "✨" },
  { day: "Sat", rating: 7, emoji: "😌" },
  { day: "Sun", rating: 8, emoji: "😊" },
];

const achievements = [
  {
    title: "First Check-in",
    description: "Completed your first mood entry",
    icon: Heart,
    earned: true,
    color: "text-pink-500",
  },
  {
    title: "Week Warrior",
    description: "7 consecutive daily check-ins",
    icon: Calendar,
    earned: true,
    color: "text-mint-500",
  },
  {
    title: "Mindful Moments",
    description: "10 meditation sessions logged",
    icon: Brain,
    earned: false,
    color: "text-sky-500",
  },
  {
    title: "Happiness Streak",
    description: "5 positive mood days in a row",
    icon: Smile,
    earned: true,
    color: "text-yellow-500",
  },
];

const emotions = [
  { name: "Happy", count: 12, color: "bg-yellow-200", percentage: 30 },
  { name: "Calm", count: 8, color: "bg-green-200", percentage: 20 },
  { name: "Anxious", count: 6, color: "bg-orange-200", percentage: 15 },
  { name: "Excited", count: 5, color: "bg-pink-200", percentage: 12.5 },
  { name: "Tired", count: 4, color: "bg-purple-200", percentage: 10 },
  { name: "Sad", count: 3, color: "bg-blue-200", percentage: 7.5 },
  { name: "Other", count: 2, color: "bg-gray-200", percentage: 5 },
];

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [currentMood, setCurrentMood] = useState<string | null>(null);

  const {
    moodEntries,
    journalEntries,
    userStats,
    addMoodEntry,
    getStreakInfo,
  } = useData();

  const averageMood = 6.8;
  const moodTrend = "+12%";
  const totalEntries = moodData.length;

  const quickMoodOptions = [
    { emoji: "😊", label: "Happy", value: "happy" },
    { emoji: "😔", label: "Sad", value: "sad" },
    { emoji: "😰", label: "Anxious", value: "anxious" },
    { emoji: "😌", label: "Calm", value: "calm" },
    { emoji: "😤", label: "Frustrated", value: "frustrated" },
    { emoji: "😴", label: "Tired", value: "tired" },
    { emoji: "✨", label: "Excited", value: "excited" },
    { emoji: "🤔", label: "Confused", value: "confused" },
  ];

  const handleQuickMoodLog = (mood: string) => {
    setCurrentMood(mood);
    // In a real app, this would save the mood entry
    console.log("Mood logged:", mood);
    setTimeout(() => setCurrentMood(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-sky-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Wellness Dashboard
            </h1>
            <p className="text-gray-600">
              Track your emotional journey and celebrate your progress
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Button variant="outline" className="border-gray-200 text-gray-600">
              <Filter className="w-4 h-4 mr-2" />
              Filter
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className="border-gray-200 text-gray-600">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Quick Mood Log */}
        <Card className="mb-8 shadow-lg border-0 bg-gradient-to-r from-mint-100 to-sky-100">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Quick Mood Check-in
                </h3>
                <p className="text-gray-600">How are you feeling right now?</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickMoodOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickMoodLog(option.value)}
                    className={cn(
                      "bg-white border-white hover:bg-gray-50",
                      currentMood === option.value &&
                        "bg-mint-200 border-mint-300",
                    )}
                    disabled={!!currentMood}
                  >
                    <span className="mr-1">{option.emoji}</span>
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            {currentMood && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-mint-200">
                <p className="text-sm text-mint-700 font-medium">
                  ✅ Mood logged successfully! Keep up the great work.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Mood</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {averageMood}/10
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    {moodTrend} from last week
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-mint-100 to-sky-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-mint-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalEntries}
                  </p>
                  <p className="text-sm text-gray-500">This month</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-lavender-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">7 days</p>
                  <p className="text-sm text-orange-600 font-medium">
                    Keep it up!
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Achievements</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {achievements.filter((a) => a.earned).length}/
                    {achievements.length}
                  </p>
                  <p className="text-sm text-purple-600 font-medium">
                    Unlocked
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Weekly Mood Chart */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">
                    This Week's Mood
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={selectedPeriod === "7d" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPeriod("7d")}
                      className={
                        selectedPeriod === "7d"
                          ? "bg-mint-500 hover:bg-mint-600"
                          : ""
                      }
                    >
                      7D
                    </Button>
                    <Button
                      variant={selectedPeriod === "30d" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPeriod("30d")}
                      className={
                        selectedPeriod === "30d"
                          ? "bg-mint-500 hover:bg-mint-600"
                          : ""
                      }
                    >
                      30D
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyMoodChart.map((day, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{day.emoji}</span>
                        <span className="font-medium text-gray-900">
                          {day.day}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-mint-400 to-sky-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${day.rating * 10}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-8">
                          {day.rating}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Mood Entries */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Recent Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moodData.slice(0, 5).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-mint-200 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{entry.emoji}</span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {entry.mood}
                          </p>
                          <p className="text-sm text-gray-500">{entry.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {entry.activities && (
                          <div className="flex space-x-1">
                            {entry.activities.map((activity, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs"
                              >
                                {activity}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <span className="font-semibold text-gray-900">
                          {entry.rating}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Emotion Breakdown */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Emotion Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emotions.map((emotion, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          {emotion.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {emotion.count} entries
                        </span>
                      </div>
                      <Progress
                        value={emotion.percentage}
                        className="h-2"
                        // className={cn("h-2", emotion.color)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Streaks */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Your Streaks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {streaks.map((streak, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-gradient-to-r from-mint-50 to-sky-50 border border-mint-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {streak.type}
                        </span>
                        <Zap className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-2xl font-bold text-mint-600">
                            {streak.current}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            current
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Best: {streak.longest}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg transition-all",
                        achievement.earned
                          ? "bg-gradient-to-r from-mint-50 to-sky-50 border border-mint-200"
                          : "bg-gray-50 opacity-60",
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          achievement.earned
                            ? "bg-white shadow-sm"
                            : "bg-gray-200",
                        )}
                      >
                        <achievement.icon
                          className={cn(
                            "w-5 h-5",
                            achievement.earned
                              ? achievement.color
                              : "text-gray-400",
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className={cn(
                            "font-medium",
                            achievement.earned
                              ? "text-gray-900"
                              : "text-gray-500",
                          )}
                        >
                          {achievement.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.earned && (
                        <div className="w-6 h-6 bg-mint-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
