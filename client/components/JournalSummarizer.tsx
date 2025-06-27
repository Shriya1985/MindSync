import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { predictMood } from "@/utils/emotionAI";
import {
  Brain,
  TrendingUp,
  Eye,
  Sparkles,
  BarChart3,
  Heart,
  Calendar,
  Target,
  BookOpen,
} from "lucide-react";

export function JournalSummarizer() {
  const [insights, setInsights] = useState<any>(null);
  const { journalEntries, moodEntries, chatMessages } = useData();

  useEffect(() => {
    if (journalEntries.length === 0) return;

    // Analyze recent journal entries for patterns
    const recentEntries = journalEntries.slice(0, 7); // Last 7 entries
    const allTags = recentEntries.flatMap((entry) => entry.tags);
    const tagFrequency = allTags.reduce(
      (acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Analyze sentiment trends
    const sentimentTrend = recentEntries.map((entry) => entry.sentiment);
    const positiveTrend = sentimentTrend.filter((s) => s === "positive").length;
    const negativeTrend = sentimentTrend.filter((s) => s === "negative").length;

    // Word count trends
    const avgWordCount =
      recentEntries.reduce((sum, entry) => sum + entry.wordCount, 0) /
      recentEntries.length;

    // Get mood prediction
    const moodPrediction = predictMood({
      journals: journalEntries,
      moods: moodEntries,
      chats: chatMessages,
    });

    // Generate writing patterns insight
    const writingPatterns = analyzeWritingPatterns(recentEntries);

    setInsights({
      topTags,
      sentimentTrend: {
        positive: positiveTrend,
        negative: negativeTrend,
        neutral: sentimentTrend.length - positiveTrend - negativeTrend,
      },
      avgWordCount: Math.round(avgWordCount),
      moodPrediction,
      writingPatterns,
      totalEntries: journalEntries.length,
      totalWords: journalEntries.reduce(
        (sum, entry) => sum + entry.wordCount,
        0,
      ),
    });
  }, [journalEntries, moodEntries, chatMessages]);

  const analyzeWritingPatterns = (entries: any[]) => {
    const patterns = [];

    // Check writing frequency
    const daysSinceFirst =
      entries.length > 1
        ? Math.floor(
            (new Date().getTime() -
              new Date(entries[entries.length - 1].date).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 1;
    const frequency = entries.length / Math.max(daysSinceFirst, 1);

    if (frequency > 0.8) {
      patterns.push({
        type: "frequency",
        message: "You're maintaining excellent writing consistency!",
        icon: "📅",
      });
    } else if (frequency > 0.4) {
      patterns.push({
        type: "frequency",
        message: "Good writing rhythm - you're building a healthy habit!",
        icon: "✨",
      });
    } else {
      patterns.push({
        type: "frequency",
        message:
          "Consider writing more regularly to deepen your self-reflection",
        icon: "🎯",
      });
    }

    // Check word count patterns
    const longEntries = entries.filter((entry) => entry.wordCount > 200).length;
    if (longEntries > entries.length * 0.6) {
      patterns.push({
        type: "depth",
        message: "You engage in deep, thoughtful reflection - excellent!",
        icon: "🧠",
      });
    }

    // Check emotional range
    const uniqueSentiments = new Set(entries.map((entry) => entry.sentiment));
    if (uniqueSentiments.size >= 2) {
      patterns.push({
        type: "emotional",
        message: "You're exploring a healthy range of emotions in your writing",
        icon: "🌈",
      });
    }

    return patterns;
  };

  if (!insights || journalEntries.length < 2) return null;

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span>AI Journal Insights</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Patterns and themes discovered from your recent entries
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Mood Prediction */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Mood Forecast</h4>
            </div>
            <p className="text-blue-800 mb-2">
              Based on your patterns, your predicted mood:{" "}
              <strong>{insights.moodPrediction.predicted}/10</strong>
            </p>
            <div className="space-y-1">
              {insights.moodPrediction.factors.map(
                (factor: string, index: number) => (
                  <Badge
                    key={index}
                    className="mr-2 mb-1 bg-blue-100 text-blue-700"
                  >
                    {factor}
                  </Badge>
                ),
              )}
            </div>
          </div>

          {/* Top Themes */}
          {insights.topTags.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-5 h-5 text-mint-600" />
                <h4 className="font-semibold text-gray-900">
                  Recurring Themes
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {insights.topTags.map(
                  ([tag, count]: [string, number], index: number) => (
                    <Badge
                      key={index}
                      className="bg-mint-100 text-mint-700 hover:bg-mint-200 transition-colors"
                    >
                      #{tag} ({count})
                    </Badge>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Sentiment Analysis */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Heart className="w-5 h-5 text-pink-600" />
              <h4 className="font-semibold text-gray-900">
                Emotional Landscape
              </h4>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">
                  {insights.sentimentTrend.positive}
                </div>
                <div className="text-sm text-green-600">Positive</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-700">
                  {insights.sentimentTrend.neutral}
                </div>
                <div className="text-sm text-gray-600">Neutral</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-700">
                  {insights.sentimentTrend.negative}
                </div>
                <div className="text-sm text-orange-600">Challenging</div>
              </div>
            </div>
          </div>

          {/* Writing Statistics */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <BarChart3 className="w-5 h-5 text-sky-600" />
              <h4 className="font-semibold text-gray-900">Writing Analytics</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
                <div className="text-xl font-bold text-sky-700">
                  {insights.totalEntries}
                </div>
                <div className="text-sm text-sky-600">Total Entries</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-xl font-bold text-purple-700">
                  {insights.totalWords.toLocaleString()}
                </div>
                <div className="text-sm text-purple-600">Total Words</div>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="text-xl font-bold text-indigo-700">
                  {insights.avgWordCount}
                </div>
                <div className="text-sm text-indigo-600">Avg Words</div>
              </div>
              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                <div className="text-xl font-bold text-teal-700">
                  {Math.round(
                    (insights.sentimentTrend.positive /
                      (insights.sentimentTrend.positive +
                        insights.sentimentTrend.negative +
                        insights.sentimentTrend.neutral)) *
                      100,
                  )}
                  %
                </div>
                <div className="text-sm text-teal-600">Positive Rate</div>
              </div>
            </div>
          </div>

          {/* Writing Patterns */}
          {insights.writingPatterns.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Eye className="w-5 h-5 text-amber-600" />
                <h4 className="font-semibold text-gray-900">
                  Writing Patterns
                </h4>
              </div>
              <div className="space-y-2">
                {insights.writingPatterns.map((pattern: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 bg-amber-50 rounded-lg border border-amber-200"
                  >
                    <span className="text-lg">{pattern.icon}</span>
                    <span className="text-amber-800">{pattern.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
