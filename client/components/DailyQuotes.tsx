import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import {
  Quote,
  Heart,
  Share2,
  Bookmark,
  RefreshCw,
  Filter,
  Calendar,
  Star,
  Lightbulb,
  Users,
  Mountain,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type QuoteCategory =
  | "motivation"
  | "anxiety"
  | "depression"
  | "mindfulness"
  | "success"
  | "resilience"
  | "gratitude"
  | "self-love";

type DailyQuote = {
  id: string;
  text: string;
  author: string;
  category: QuoteCategory;
  tags: string[];
  source?: string;
  difficulty?: "easy" | "medium" | "deep";
  timeOfDay?: "morning" | "afternoon" | "evening" | "anytime";
};

const quotes: DailyQuote[] = [
  {
    id: "1",
    text: "You are braver than you believe, stronger than you seem, and smarter than you think.",
    author: "A.A. Milne",
    category: "motivation",
    tags: ["courage", "self-belief", "strength"],
    difficulty: "easy",
    timeOfDay: "morning",
  },
  {
    id: "2",
    text: "The present moment is the only time over which we have dominion.",
    author: "Thích Nhất Hạnh",
    category: "mindfulness",
    tags: ["presence", "mindfulness", "awareness"],
    difficulty: "medium",
    timeOfDay: "anytime",
  },
  {
    id: "3",
    text: "Anxiety is the dizziness of freedom.",
    author: "Søren Kierkegaard",
    category: "anxiety",
    tags: ["anxiety", "freedom", "choice"],
    difficulty: "deep",
    timeOfDay: "evening",
  },
  {
    id: "4",
    text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson",
    category: "resilience",
    tags: ["inner strength", "potential", "self-worth"],
    difficulty: "medium",
    timeOfDay: "anytime",
  },
  {
    id: "5",
    text: "The only way out is through.",
    author: "Robert Frost",
    category: "depression",
    tags: ["perseverance", "healing", "journey"],
    difficulty: "easy",
    timeOfDay: "afternoon",
  },
  {
    id: "6",
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    category: "self-love",
    tags: ["authenticity", "uniqueness", "self-acceptance"],
    difficulty: "easy",
    timeOfDay: "morning",
  },
  {
    id: "7",
    text: "Gratitude turns what we have into enough.",
    author: "Anonymous",
    category: "gratitude",
    tags: ["gratitude", "contentment", "abundance"],
    difficulty: "easy",
    timeOfDay: "evening",
  },
  {
    id: "8",
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "success",
    tags: ["persistence", "courage", "resilience"],
    difficulty: "medium",
    timeOfDay: "afternoon",
  },
  {
    id: "9",
    text: "Between stimulus and response there is a space. In that space is our power to choose our response.",
    author: "Viktor Frankl",
    category: "mindfulness",
    tags: ["choice", "awareness", "response"],
    difficulty: "deep",
    timeOfDay: "anytime",
  },
  {
    id: "10",
    text: "The wound is the place where the Light enters you.",
    author: "Rumi",
    category: "resilience",
    tags: ["healing", "growth", "transformation"],
    difficulty: "deep",
    timeOfDay: "evening",
  },
  {
    id: "11",
    text: "You have been assigned this mountain to show others it can be moved.",
    author: "Mel Robbins",
    category: "motivation",
    tags: ["challenge", "inspiration", "leadership"],
    difficulty: "medium",
    timeOfDay: "morning",
  },
  {
    id: "12",
    text: "Anxiety does not empty tomorrow of its sorrows, but only empties today of its strength.",
    author: "Charles Spurgeon",
    category: "anxiety",
    tags: ["present moment", "strength", "worry"],
    difficulty: "medium",
    timeOfDay: "afternoon",
  },
  {
    id: "13",
    text: "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.",
    author: "Rumi",
    category: "self-love",
    tags: ["love", "self-discovery", "barriers"],
    difficulty: "deep",
    timeOfDay: "evening",
  },
  {
    id: "14",
    text: "Happiness is not something ready made. It comes from your own actions.",
    author: "Dalai Lama",
    category: "motivation",
    tags: ["happiness", "action", "responsibility"],
    difficulty: "medium",
    timeOfDay: "morning",
  },
  {
    id: "15",
    text: "In the depths of winter, I finally learned that within me there lay an invincible summer.",
    author: "Albert Camus",
    category: "depression",
    tags: ["inner strength", "hope", "resilience"],
    difficulty: "deep",
    timeOfDay: "anytime",
  },
];

const categories = [
  { value: "all", label: "All Categories", icon: Quote, color: "gray" },
  { value: "motivation", label: "Motivation", icon: Mountain, color: "orange" },
  { value: "anxiety", label: "Anxiety Relief", icon: Heart, color: "blue" },
  { value: "depression", label: "Hope & Healing", icon: Sun, color: "yellow" },
  {
    value: "mindfulness",
    label: "Mindfulness",
    icon: Lightbulb,
    color: "purple",
  },
  { value: "success", label: "Success", icon: Star, color: "green" },
  { value: "resilience", label: "Resilience", icon: Mountain, color: "red" },
  { value: "gratitude", label: "Gratitude", icon: Heart, color: "pink" },
  { value: "self-love", label: "Self-Love", icon: Users, color: "indigo" },
];

export function DailyQuotes() {
  const [currentQuote, setCurrentQuote] = useState<DailyQuote>(quotes[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [bookmarkedQuotes, setBookmarkedQuotes] = useState<string[]>([]);
  const [quotesHistory, setQuotesHistory] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { moodEntries, addPoints } = useData();

  // Get current time of day
  const getCurrentTimeOfDay = (): "morning" | "afternoon" | "evening" => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  // Get today's date string
  const getTodayDateString = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Load daily quote
  const getDailyQuote = () => {
    const today = getTodayDateString();
    const savedQuote = localStorage.getItem(`daily-quote-${today}`);

    if (savedQuote) {
      const quote = quotes.find((q) => q.id === savedQuote);
      if (quote) return quote;
    }

    // Generate new daily quote based on current mood and time
    const timeOfDay = getCurrentTimeOfDay();
    const recentMood = moodEntries[moodEntries.length - 1];

    let filteredQuotes = quotes;

    // Filter by time of day preference
    const timeFilteredQuotes = quotes.filter(
      (q) => q.timeOfDay === timeOfDay || q.timeOfDay === "anytime",
    );
    if (timeFilteredQuotes.length > 0) {
      filteredQuotes = timeFilteredQuotes;
    }

    // Filter by mood if available
    if (recentMood) {
      const moodToCategory: Record<string, QuoteCategory[]> = {
        anxious: ["anxiety", "mindfulness"],
        sad: ["depression", "resilience", "self-love"],
        happy: ["gratitude", "success"],
        motivated: ["motivation", "success"],
        peaceful: ["mindfulness", "gratitude"],
        stressed: ["anxiety", "mindfulness"],
      };

      const relevantCategories = moodToCategory[recentMood.mood.toLowerCase()];
      if (relevantCategories) {
        const moodQuotes = filteredQuotes.filter((q) =>
          relevantCategories.includes(q.category),
        );
        if (moodQuotes.length > 0) {
          filteredQuotes = moodQuotes;
        }
      }
    }

    // Select random quote from filtered options
    const randomQuote =
      filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];

    // Save for today
    localStorage.setItem(`daily-quote-${today}`, randomQuote.id);

    return randomQuote;
  };

  // Initialize quote and load bookmarks
  useEffect(() => {
    const dailyQuote = getDailyQuote();
    setCurrentQuote(dailyQuote);

    const saved = localStorage.getItem("bookmarked-quotes");
    if (saved) {
      setBookmarkedQuotes(JSON.parse(saved));
    }

    const history = localStorage.getItem("quotes-history");
    if (history) {
      setQuotesHistory(JSON.parse(history));
    }
  }, [moodEntries]);

  // Get filtered quotes
  const getFilteredQuotes = () => {
    if (selectedCategory === "all") return quotes;
    return quotes.filter((q) => q.category === selectedCategory);
  };

  // Change quote with animation
  const changeQuote = (newQuote?: DailyQuote) => {
    setIsTransitioning(true);

    setTimeout(() => {
      let quote: DailyQuote;

      if (newQuote) {
        quote = newQuote;
      } else {
        const filteredQuotes = getFilteredQuotes();
        const availableQuotes = filteredQuotes.filter(
          (q) => q.id !== currentQuote.id,
        );
        quote =
          availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
      }

      setCurrentQuote(quote);

      // Add to history
      const newHistory = [
        quote.id,
        ...quotesHistory.filter((id) => id !== quote.id),
      ].slice(0, 10);
      setQuotesHistory(newHistory);
      localStorage.setItem("quotes-history", JSON.stringify(newHistory));

      setIsTransitioning(false);
    }, 300);
  };

  // Toggle bookmark
  const toggleBookmark = (quoteId: string) => {
    const newBookmarks = bookmarkedQuotes.includes(quoteId)
      ? bookmarkedQuotes.filter((id) => id !== quoteId)
      : [...bookmarkedQuotes, quoteId];

    setBookmarkedQuotes(newBookmarks);
    localStorage.setItem("bookmarked-quotes", JSON.stringify(newBookmarks));

    showNotification({
      type: "encouragement",
      title: bookmarkedQuotes.includes(quoteId)
        ? "📚 Bookmark Removed"
        : "⭐ Quote Saved!",
      message: bookmarkedQuotes.includes(quoteId)
        ? "Quote removed from your collection"
        : "Quote added to your saved collection",
      duration: 2000,
    });

    if (!bookmarkedQuotes.includes(quoteId)) {
      addPoints(5, "Quote bookmarked");
    }
  };

  // Share quote
  const shareQuote = async () => {
    const text = `"${currentQuote.text}" - ${currentQuote.author}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Daily Quote",
          text: text,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(text);
      showNotification({
        type: "encouragement",
        title: "📋 Copied!",
        message: "Quote copied to clipboard",
        duration: 2000,
      });
    }
  };

  const isBookmarked = bookmarkedQuotes.includes(currentQuote.id);
  const category = categories.find((c) => c.value === currentQuote.category);
  const timeOfDay = getCurrentTimeOfDay();

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Quote className="w-6 h-6 text-emerald-600" />
          <span>Daily Inspiration</span>
        </CardTitle>
        <p className="text-gray-600">
          Personalized quotes to uplift and inspire your day
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Quote Display */}
        <div
          className={cn(
            "relative p-8 rounded-2xl bg-gradient-to-br transition-all duration-500",
            isTransitioning ? "opacity-50 scale-95" : "opacity-100 scale-100",
            timeOfDay === "morning"
              ? "from-orange-50 to-yellow-50 border-orange-200"
              : timeOfDay === "afternoon"
                ? "from-blue-50 to-cyan-50 border-blue-200"
                : "from-purple-50 to-indigo-50 border-purple-200",
            "border-2",
          )}
        >
          {/* Time of day indicator */}
          <div className="absolute top-4 right-4">
            {timeOfDay === "morning" && (
              <Sun className="w-6 h-6 text-orange-500" />
            )}
            {timeOfDay === "afternoon" && (
              <Star className="w-6 h-6 text-blue-500" />
            )}
            {timeOfDay === "evening" && (
              <Moon className="w-6 h-6 text-purple-500" />
            )}
          </div>

          <div className="text-center space-y-6">
            <Quote className="w-12 h-12 text-gray-400 mx-auto" />

            <blockquote className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed">
              "{currentQuote.text}"
            </blockquote>

            <div className="space-y-2">
              <cite className="text-lg font-semibold text-gray-700">
                — {currentQuote.author}
              </cite>

              <div className="flex justify-center space-x-2">
                {category && (
                  <Badge
                    className={cn(
                      "px-3 py-1",
                      `bg-${category.color}-100 text-${category.color}-700`,
                    )}
                  >
                    {category.label}
                  </Badge>
                )}
                <Badge className="bg-gray-100 text-gray-700 capitalize">
                  {currentQuote.difficulty}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3">
          <Button
            onClick={() => toggleBookmark(currentQuote.id)}
            variant="outline"
            size="sm"
            className={cn(
              "flex items-center space-x-2",
              isBookmarked && "bg-yellow-50 border-yellow-300 text-yellow-700",
            )}
          >
            <Bookmark
              className={cn("w-4 h-4", isBookmarked && "fill-current")}
            />
            <span>{isBookmarked ? "Saved" : "Save"}</span>
          </Button>

          <Button
            onClick={shareQuote}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </Button>

          <Button
            onClick={() => changeQuote()}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
            disabled={isTransitioning}
          >
            <RefreshCw
              className={cn("w-4 h-4", isTransitioning && "animate-spin")}
            />
            <span>New Quote</span>
          </Button>
        </div>

        {/* Category Filter */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold">Browse by Category</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = selectedCategory === cat.value;

              return (
                <Button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "flex items-center space-x-2 justify-start",
                    isSelected && "bg-emerald-500 hover:bg-emerald-600",
                  )}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-xs">{cat.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <Calendar className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="font-semibold text-emerald-900">Daily Refresh</h4>
            <p className="text-sm text-emerald-700">New quote every day</p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Bookmark className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-blue-900">Saved Quotes</h4>
            <p className="text-sm text-blue-700">
              {bookmarkedQuotes.length} bookmarked
            </p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-purple-900">Mood-Matched</h4>
            <p className="text-sm text-purple-700">Personalized for you</p>
          </div>
        </div>

        {/* Tags for current quote */}
        {currentQuote.tags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">
              Related Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentQuote.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs border-emerald-200 text-emerald-700"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {quotes.length}
            </p>
            <p className="text-xs text-gray-600">Total Quotes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {bookmarkedQuotes.length}
            </p>
            <p className="text-xs text-gray-600">Bookmarked</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {quotesHistory.length}
            </p>
            <p className="text-xs text-gray-600">Viewed Today</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
