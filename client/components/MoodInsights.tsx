import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { extractMoodFromText } from "@/utils/emotionAI";
import { formatDistanceToNow } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  Brain,
  BookOpen,
  MessageCircle,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MoodInsights() {
  const { moodEntries, journalEntries, chatMessages } = useData();

  // Analyze mood trends from all sources
  const getMoodTrends = () => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    // Ensure we have arrays to work with
    const safeMoodEntries = Array.isArray(moodEntries) ? moodEntries : [];
    const safeJournalEntries = Array.isArray(journalEntries) ? journalEntries : [];
    const safeChatMessages = Array.isArray(chatMessages) ? chatMessages : [];

    // Get mood data from different sources
    const explicitMoods = safeMoodEntries
      .filter(entry => new Date(entry.date) >= last7Days)
      .map(entry => ({
        source: "explicit",
        mood: entry.mood,
        rating: entry.rating,
        date: entry.date,
        emoji: entry.emoji
      }));

    // Extract mood from journal entries
    const journalMoods = safeJournalEntries
      .filter(entry => new Date(entry.date) >= last7Days)
      .map(entry => {
        const extracted = extractMoodFromText(entry.content + " " + entry.title);
        return {
          source: "journal",
          mood: extracted.mood,
          rating: extracted.rating,
          confidence: extracted.confidence,
          date: entry.date,
          emoji: extracted.emoji,
          title: entry.title
        };
      })
      .filter(entry => entry.confidence > 0.3); // Only high-confidence extractions

    // Extract mood from chat messages (user messages only)
    const chatMoods = safeChatMessages
      .filter(msg =>
        msg.sender === "user" &&
        new Date(msg.timestamp) >= last7Days &&
        msg.content.length > 20 // Meaningful messages only
      )
      .map(msg => {
        const extracted = extractMoodFromText(msg.content);
        return {
          source: "chat",
          mood: extracted.mood,
          rating: extracted.rating,
          confidence: extracted.confidence,
          date: new Date(msg.timestamp).toISOString().split('T')[0],
          emoji: extracted.emoji,
          preview: msg.content.slice(0, 50) + "..."
        };
      })
      .filter(entry => entry.confidence > 0.4); // Higher threshold for chat

    const allMoods = [...explicitMoods, ...journalMoods, ...chatMoods];
    
    // Calculate trend
    const sortedMoods = allMoods.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const recentMoods = sortedMoods.slice(-3);
    const olderMoods = sortedMoods.slice(-6, -3);

    let trend = "stable";
    if (recentMoods.length > 0 && olderMoods.length > 0) {
      const recentAvg = recentMoods.reduce((sum, m) => sum + m.rating, 0) / recentMoods.length;
      const olderAvg = olderMoods.reduce((sum, m) => sum + m.rating, 0) / olderMoods.length;
      
      if (recentAvg > olderAvg + 0.5) trend = "improving";
      else if (recentAvg < olderAvg - 0.5) trend = "declining";
    }

    // Get mood distribution
    const moodCounts: Record<string, number> = {};
    allMoods.forEach(mood => {
      moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
    });

    const topMoods = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([mood, count]) => ({
        mood,
        count,
        percentage: Math.round((count / allMoods.length) * 100)
      }));

    return { allMoods, trend, topMoods };
  };

  const { allMoods, trend, topMoods } = getMoodTrends();

  const getTrendIcon = () => {
    switch (trend) {
      case "improving": return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "declining": return <TrendingDown className="w-5 h-5 text-red-600" />;
      default: return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "improving": return "text-green-600 bg-green-50 border-green-200";
      case "declining": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "explicit": return <Heart className="w-4 h-4" />;
      case "journal": return <BookOpen className="w-4 h-4" />;
      case "chat": return <MessageCircle className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  if (allMoods.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Mood Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No mood data yet</p>
            <p className="text-sm">Start journaling or logging moods to see insights here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Mood Insights</span>
          <Badge variant="secondary" className="ml-auto">
            Last 7 days
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trend Overview */}
        <div className={`p-4 rounded-lg border ${getTrendColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getTrendIcon()}
              <span className="font-medium">
                Your mood is {trend === "stable" ? "staying stable" : trend}
              </span>
            </div>
            <span className="text-sm opacity-75">
              {allMoods.length} data points
            </span>
          </div>
        </div>

        {/* Top Moods */}
        <div>
          <h4 className="font-medium mb-3">Most Common Moods</h4>
          <div className="space-y-2">
            {topMoods.map(({ mood, count, percentage }) => (
              <div key={mood} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {allMoods.find(m => m.mood === mood)?.emoji || "😐"}
                  </span>
                  <span className="capitalize">{mood}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-mint-500 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Mood Sources */}
        <div>
          <h4 className="font-medium mb-3">Recent Mood Detections</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {allMoods.slice(-5).reverse().map((mood, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {getSourceIcon(mood.source)}
                  <span className="text-lg">{mood.emoji}</span>
                  <div>
                    <span className="text-sm font-medium capitalize">{mood.mood}</span>
                    {mood.source === "journal" && mood.title && (
                      <p className="text-xs text-gray-600 truncate max-w-32">
                        from "{mood.title}"
                      </p>
                    )}
                    {mood.source === "chat" && mood.preview && (
                      <p className="text-xs text-gray-600 truncate max-w-32">
                        "{mood.preview}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      mood.source === "explicit" && "bg-red-100 text-red-700",
                      mood.source === "journal" && "bg-green-100 text-green-700",
                      mood.source === "chat" && "bg-blue-100 text-blue-700"
                    )}
                  >
                    {mood.source}
                  </Badge>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(mood.date), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
