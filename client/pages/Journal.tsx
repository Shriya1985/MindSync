import { useState, useRef } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { useData, type JournalEntry } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import { JournalSummarizer } from "@/components/JournalSummarizer";
import { useMoodTheme } from "@/hooks/useMoodTheme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  PenTool,
  Sparkles,
  Save,
  Search,
  Filter,
  Calendar,
  Heart,
  Brain,
  TrendingUp,
  Plus,
  Edit3,
  Eye,
  Trash2,
  Clock,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

type JournalEntry = {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
  sentiment: "positive" | "neutral" | "negative";
  tags: string[];
  wordCount: number;
  aiPrompt?: string;
};

type SentimentAnalysis = {
  overall: "positive" | "neutral" | "negative";
  confidence: number;
  keywords: string[];
  emotions: { emotion: string; strength: number }[];
};

const journalEntries: JournalEntry[] = [
  {
    id: "1",
    title: "A Day of Small Victories",
    content:
      "Today was one of those days where everything just clicked. I woke up feeling refreshed, had a productive work session, and even managed to fit in a nice walk during lunch. It's amazing how the small things can make such a big difference in how I feel...",
    date: "2024-01-15",
    mood: "😊",
    sentiment: "positive",
    tags: ["gratitude", "productivity", "self-care"],
    wordCount: 156,
  },
  {
    id: "2",
    title: "Processing Some Anxiety",
    content:
      "Feeling a bit overwhelmed with work lately. There's this constant pressure to perform, and I find myself second-guessing every decision. I know this feeling will pass, but right now it feels quite heavy...",
    date: "2024-01-14",
    mood: "😰",
    sentiment: "negative",
    tags: ["anxiety", "work", "stress"],
    wordCount: 89,
    aiPrompt: "What specific aspect of work is causing you the most stress?",
  },
  {
    id: "3",
    title: "Mindful Morning Reflections",
    content:
      "Started the day with 10 minutes of meditation. It's incredible how this simple practice helps center my thoughts and set a positive tone for the day. I'm learning to appreciate these quiet moments...",
    date: "2024-01-13",
    mood: "😌",
    sentiment: "positive",
    tags: ["meditation", "mindfulness", "morning"],
    wordCount: 67,
  },
];

const aiPrompts = [
  "What made you feel this way today?",
  "How did you handle challenging moments?",
  "What are you grateful for right now?",
  "What would you tell a friend in this situation?",
  "How has your perspective on this changed?",
  "What patterns do you notice in your thoughts?",
  "What small step can you take tomorrow?",
  "How are you taking care of yourself today?",
];

const sentimentColors = {
  positive: "bg-green-100 text-green-700 border-green-200",
  neutral: "bg-gray-100 text-gray-700 border-gray-200",
  negative: "bg-orange-100 text-orange-700 border-orange-200",
};

export default function Journal() {
  const [isWriting, setIsWriting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [currentEntry, setCurrentEntry] = useState({
    title: "",
    content: "",
    tags: "",
  });
  const [showAnalysis, setShowAnalysis] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { journalEntries, addJournalEntry, userStats, getStreakInfo, addPoints } =
    useData();
  const { currentTheme } = useMoodTheme();

  const filteredEntries = (
    Array.isArray(journalEntries) ? journalEntries : []
  ).filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    return matchesSearch;
  });

  const handleSaveEntry = () => {
    if (!currentEntry.title.trim() || !currentEntry.content.trim()) return;

    // Calculate word count
    const wordCount = currentEntry.content.split(/\s+/).filter(Boolean).length;

    // Determine sentiment based on content
    const content = currentEntry.content.toLowerCase();
    let sentiment: "positive" | "neutral" | "negative" = "neutral";

    const positiveWords = [
      "happy",
      "grateful",
      "joy",
      "love",
      "amazing",
      "wonderful",
      "great",
      "good",
      "excited",
      "proud",
    ];
    const negativeWords = [
      "sad",
      "angry",
      "frustrated",
      "depressed",
      "anxious",
      "worried",
      "terrible",
      "awful",
      "hate",
    ];

    const positiveCount = positiveWords.filter((word) =>
      content.includes(word),
    ).length;
    const negativeCount = negativeWords.filter((word) =>
      content.includes(word),
    ).length;

    if (positiveCount > negativeCount) sentiment = "positive";
    else if (negativeCount > positiveCount) sentiment = "negative";

    // Create new journal entry
    const newEntry: Omit<JournalEntry, "id"> = {
      title: currentEntry.title,
      content: currentEntry.content,
      date: new Date().toISOString().split("T")[0],
      sentiment,
      tags: currentEntry.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      wordCount,
    };

    addJournalEntry(newEntry);

    // Award points for journaling
    const basePoints = 10;
    const bonusPoints = wordCount >= 300 ? 5 : 0; // Bonus for longer entries
    const totalPoints = basePoints + bonusPoints;

    await addPoints(totalPoints, `Journal Entry: ${currentEntry.title}`, "journaling");

    // Show success notification
    showNotification({
      type: "encouragement",
      title: "Journal Entry Saved! 📖",
      message: `Great work! You wrote ${wordCount} words and earned ${totalPoints} points. Keep reflecting!`,
      duration: 5000,
    });

    // Check for achievements
    const streakInfo = getStreakInfo();
    if (streakInfo.current > 0 && streakInfo.current % 5 === 0) {
      showNotification({
        type: "achievement",
        title: "Writing Streak Achievement! ✨",
        message: `Incredible! You've been journaling for ${streakInfo.current} days straight!`,
        duration: 6000,
      });
    }

    if (wordCount >= 500) {
      showNotification({
        type: "milestone",
        title: "Word Milestone! 📝",
        message: `Amazing! You wrote ${wordCount} words in this entry. That's some deep reflection!`,
        duration: 4000,
      });
    }

    // Reset form
    setCurrentEntry({ title: "", content: "", tags: "" });
    setIsWriting(false);
  };

  const getRandomPrompt = () => {
    return aiPrompts[Math.floor(Math.random() * aiPrompts.length)];
  };

  const insertPrompt = (prompt: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const currentContent = currentEntry.content;
      const newContent = currentContent
        ? `${currentContent}\n\n${prompt}\n`
        : `${prompt}\n`;
      setCurrentEntry({ ...currentEntry, content: newContent });
      textarea.focus();
    }
  };

  const stats = {
    totalEntries: journalEntries.length,
    totalWords: (Array.isArray(journalEntries) ? journalEntries : []).reduce(
      (sum, entry) => sum + entry.wordCount,
      0,
    ),
    streakDays: 7,
    positiveEntries: (Array.isArray(journalEntries)
      ? journalEntries
      : []
    ).filter((e) => e.sentiment === "positive").length,
  };

  return (
    <div className={`min-h-screen ${currentTheme.background}`}>
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Personal Journal
            </h1>
            <p className="text-gray-600">
              Express your thoughts and discover insights with AI-powered
              reflection
            </p>
          </div>
          <Button
            onClick={() => setIsWriting(!isWriting)}
            className="mt-4 md:mt-0 bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-mint-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-4 h-4 text-mint-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalEntries}
              </p>
              <p className="text-sm text-gray-600">Entries</p>
            </CardContent>
          </Card>
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Edit3 className="w-4 h-4 text-sky-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalWords}
              </p>
              <p className="text-sm text-gray-600">Words</p>
            </CardContent>
          </Card>
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.streakDays}
              </p>
              <p className="text-sm text-gray-600">Day Streak</p>
            </CardContent>
          </Card>
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((stats.positiveEntries / stats.totalEntries) * 100)}
                %
              </p>
              <p className="text-sm text-gray-600">Positive</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Writing Area */}
            {isWriting && (
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PenTool className="w-5 h-5 text-mint-600" />
                    <span>New Journal Entry</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Give your entry a title..."
                      value={currentEntry.title}
                      onChange={(e) =>
                        setCurrentEntry({
                          ...currentEntry,
                          title: e.target.value,
                        })
                      }
                      className="border-gray-200 focus:border-mint-300 focus:ring-mint-200"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="content">Your thoughts...</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => insertPrompt(getRandomPrompt())}
                        className="text-xs border-mint-200 text-mint-600 hover:bg-mint-50"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Prompt
                      </Button>
                    </div>
                    <Textarea
                      ref={textareaRef}
                      id="content"
                      placeholder="Start writing your thoughts, feelings, or experiences..."
                      rows={8}
                      value={currentEntry.content}
                      onChange={(e) =>
                        setCurrentEntry({
                          ...currentEntry,
                          content: e.target.value,
                        })
                      }
                      className="border-gray-200 focus:border-mint-300 focus:ring-mint-200 resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="mood, work, gratitude, reflection..."
                      value={currentEntry.tags}
                      onChange={(e) =>
                        setCurrentEntry({
                          ...currentEntry,
                          tags: e.target.value,
                        })
                      }
                      className="border-gray-200 focus:border-mint-300 focus:ring-mint-200"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-gray-500">
                      {currentEntry.content.split(" ").filter(Boolean).length}{" "}
                      words
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsWriting(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveEntry}
                        disabled={
                          !currentEntry.title.trim() ||
                          !currentEntry.content.trim()
                        }
                        className="bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Entry
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search and Filter */}
            <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search your entries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-mint-300 focus:ring-mint-200"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="border-gray-200 text-gray-600"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Journal Entries */}
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <Card
                  key={entry.id}
                  className="shadow-md border-0 bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {entry.mood && (
                          <span className="text-2xl">{entry.mood}</span>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {entry.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{entry.date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Edit3 className="w-3 h-3" />
                              <span>{entry.wordCount} words</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={cn(
                            "text-xs",
                            sentimentColors[entry.sentiment],
                          )}
                        >
                          {entry.sentiment}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowAnalysis(
                              showAnalysis === entry.id ? null : entry.id,
                            )
                          }
                          className="text-gray-500 hover:text-mint-600"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {entry.content}
                    </p>

                    {entry.aiPrompt && (
                      <div className="p-3 bg-mint-50 rounded-lg border border-mint-200 mb-4">
                        <div className="flex items-center space-x-2 mb-1">
                          <Brain className="w-4 h-4 text-mint-600" />
                          <span className="text-sm font-medium text-mint-700">
                            AI Reflection Prompt
                          </span>
                        </div>
                        <p className="text-sm text-mint-600">
                          {entry.aiPrompt}
                        </p>
                      </div>
                    )}

                    {showAnalysis === entry.id && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                          AI Sentiment Analysis
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Overall Mood:</span>
                            <Badge
                              className={cn(
                                "ml-2",
                                sentimentColors[entry.sentiment],
                              )}
                            >
                              {entry.sentiment}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-gray-600">Confidence:</span>
                            <span className="ml-2 font-medium">87%</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="text-gray-600 text-sm">
                            Key themes:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {["progress", "gratitude", "growth"].map(
                              (theme) => (
                                <Badge
                                  key={theme}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {theme}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs border-mint-200 text-mint-700"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Journal Summary */}
            <JournalSummarizer />
            {/* AI Prompts */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-mint-600" />
                  <span>Reflection Prompts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiPrompts.slice(0, 4).map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => insertPrompt(prompt)}
                      className="w-full text-left justify-start text-sm h-auto p-3 border-mint-200 text-mint-700 hover:bg-mint-50"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Insights */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-sky-600" />
                  <span>Recent Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-700 font-medium mb-1">
                      Positive Pattern Detected
                    </p>
                    <p className="text-green-600">
                      You've mentioned "gratitude" in 3 recent entries. This
                      shows growing emotional awareness.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-700 font-medium mb-1">
                      Writing Consistency
                    </p>
                    <p className="text-blue-600">
                      You're on a 7-day writing streak! Consistent journaling
                      can improve mental clarity.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Gratitude Entry
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Daily Reflection
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Goal Progress
                  </Button>
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
