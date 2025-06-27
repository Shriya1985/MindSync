import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import {
  Heart,
  RefreshCw,
  Share2,
  BookOpen,
  Star,
  Sparkles,
  Sun,
  Smile,
  Shield,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AffirmationCategory =
  | "self-love"
  | "strength"
  | "calm"
  | "motivation"
  | "healing"
  | "gratitude"
  | "confidence"
  | "peace";

type Affirmation = {
  id: string;
  text: string;
  category: AffirmationCategory;
  mood: string[];
  author?: string;
  icon: string;
  color: string;
};

const affirmations: Affirmation[] = [
  // Self-Love
  {
    id: "self-love-1",
    text: "I am worthy of love, care, and compassion, especially from myself.",
    category: "self-love",
    mood: ["sad", "low", "depressed"],
    icon: "💝",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "self-love-2",
    text: "I accept myself completely and embrace my unique journey.",
    category: "self-love",
    mood: ["insecure", "doubtful"],
    icon: "🌺",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "self-love-3",
    text: "My imperfections make me human, and my humanity is beautiful.",
    category: "self-love",
    mood: ["perfectionist", "self-critical"],
    icon: "🦋",
    color: "from-pink-500 to-rose-500",
  },

  // Strength
  {
    id: "strength-1",
    text: "I have overcome challenges before, and I have the strength to overcome this too.",
    category: "strength",
    mood: ["overwhelmed", "difficult", "struggling"],
    icon: "💪",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "strength-2",
    text: "Every challenge I face is an opportunity to discover how resilient I am.",
    category: "strength",
    mood: ["anxious", "fearful", "uncertain"],
    icon: "🔥",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "strength-3",
    text: "I am braver than I believe, stronger than I seem, and more capable than I imagine.",
    category: "strength",
    mood: ["weak", "powerless", "defeated"],
    icon: "🦁",
    color: "from-orange-500 to-red-500",
  },

  // Calm
  {
    id: "calm-1",
    text: "I breathe in peace and breathe out tension. I am centered and calm.",
    category: "calm",
    mood: ["anxious", "stressed", "overwhelmed"],
    icon: "🧘",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "calm-2",
    text: "In this moment, I am safe. In this breath, I find peace.",
    category: "calm",
    mood: ["panic", "worried", "restless"],
    icon: "🌊",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "calm-3",
    text: "Like still water, I reflect clearly and respond with wisdom.",
    category: "calm",
    mood: ["reactive", "emotional", "chaotic"],
    icon: "🌙",
    color: "from-blue-500 to-cyan-500",
  },

  // Motivation
  {
    id: "motivation-1",
    text: "Today I choose progress over perfection and action over hesitation.",
    category: "motivation",
    mood: ["lazy", "unmotivated", "stuck"],
    icon: "⚡",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "motivation-2",
    text: "I have the power to create positive change in my life, starting now.",
    category: "motivation",
    mood: ["hopeless", "powerless", "stagnant"],
    icon: "🌟",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "motivation-3",
    text: "Every small step I take is leading me toward my goals and dreams.",
    category: "motivation",
    mood: ["discouraged", "impatient", "frustrated"],
    icon: "🚀",
    color: "from-yellow-500 to-orange-500",
  },

  // Healing
  {
    id: "healing-1",
    text: "I am healing a little more each day, in ways both seen and unseen.",
    category: "healing",
    mood: ["hurt", "wounded", "broken"],
    icon: "🌱",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "healing-2",
    text: "My heart is strong enough to heal and wise enough to learn.",
    category: "healing",
    mood: ["heartbroken", "betrayed", "disappointed"],
    icon: "💚",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "healing-3",
    text: "I give myself permission to heal at my own pace, with patience and compassion.",
    category: "healing",
    mood: ["impatient", "self-critical", "rushed"],
    icon: "🕊️",
    color: "from-green-500 to-emerald-500",
  },

  // Gratitude
  {
    id: "gratitude-1",
    text: "I am grateful for this moment, this breath, and this opportunity to grow.",
    category: "gratitude",
    mood: ["ungrateful", "entitled", "negative"],
    icon: "🙏",
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: "gratitude-2",
    text: "Even in difficult times, I can find something to appreciate about my journey.",
    category: "gratitude",
    mood: ["bitter", "resentful", "victim"],
    icon: "✨",
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: "gratitude-3",
    text: "My life is filled with small miracles and moments of beauty.",
    category: "gratitude",
    mood: ["pessimistic", "cynical", "jaded"],
    icon: "🌈",
    color: "from-purple-500 to-indigo-500",
  },

  // Confidence
  {
    id: "confidence-1",
    text: "I trust my instincts and believe in my ability to make good decisions.",
    category: "confidence",
    mood: ["doubtful", "insecure", "indecisive"],
    icon: "👑",
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: "confidence-2",
    text: "I am enough, exactly as I am, and I continue to grow every day.",
    category: "confidence",
    mood: ["inadequate", "not enough", "comparing"],
    icon: "💎",
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: "confidence-3",
    text: "I speak my truth with kindness and stand in my authentic power.",
    category: "confidence",
    mood: ["voiceless", "timid", "people-pleasing"],
    icon: "🦋",
    color: "from-indigo-500 to-purple-500",
  },

  // Peace
  {
    id: "peace-1",
    text: "I release what I cannot control and focus my energy on what I can influence.",
    category: "peace",
    mood: ["controlling", "anxious", "worried"],
    icon: "☮️",
    color: "from-teal-500 to-cyan-500",
  },
  {
    id: "peace-2",
    text: "Inner peace is my natural state, and I return to it easily and often.",
    category: "peace",
    mood: ["chaotic", "turbulent", "restless"],
    icon: "🕊️",
    color: "from-teal-500 to-cyan-500",
  },
  {
    id: "peace-3",
    text: "I am at peace with my past, present with this moment, and hopeful for my future.",
    category: "peace",
    mood: ["regretful", "guilty", "anxious about future"],
    icon: "🌸",
    color: "from-teal-500 to-cyan-500",
  },
];

export function DailyAffirmation() {
  const [currentAffirmation, setCurrentAffirmation] =
    useState<Affirmation | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { moodEntries, journalEntries } = useData();

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("affirmation_favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Auto-select affirmation based on recent mood
    selectPersonalizedAffirmation();
  }, [moodEntries, journalEntries]);

  const selectPersonalizedAffirmation = () => {
    const recentMood = moodEntries[0];
    const recentJournal = journalEntries[0];

    let relevantAffirmations = [...affirmations];

    // Filter based on recent mood
    if (recentMood) {
      const moodText = recentMood.mood.toLowerCase();
      const rating = recentMood.rating;

      // Match affirmations to current emotional state
      const matchingAffirmations = affirmations.filter((affirmation) =>
        affirmation.mood.some((mood) => moodText.includes(mood)),
      );

      if (matchingAffirmations.length > 0) {
        relevantAffirmations = matchingAffirmations;
      } else {
        // Fallback based on rating
        if (rating <= 3) {
          relevantAffirmations = affirmations.filter((a) =>
            ["self-love", "healing", "strength"].includes(a.category),
          );
        } else if (rating <= 5) {
          relevantAffirmations = affirmations.filter((a) =>
            ["calm", "strength", "peace"].includes(a.category),
          );
        } else if (rating >= 8) {
          relevantAffirmations = affirmations.filter((a) =>
            ["gratitude", "confidence", "motivation"].includes(a.category),
          );
        }
      }
    }

    // Consider journal sentiment
    if (recentJournal) {
      if (recentJournal.sentiment === "negative") {
        relevantAffirmations = affirmations.filter((a) =>
          ["self-love", "healing", "calm", "strength"].includes(a.category),
        );
      } else if (recentJournal.sentiment === "positive") {
        relevantAffirmations = affirmations.filter((a) =>
          ["gratitude", "confidence", "motivation"].includes(a.category),
        );
      }
    }

    // Check if user has seen today's affirmation
    const today = new Date().toISOString().split("T")[0];
    const savedToday = localStorage.getItem(`affirmation_${today}`);

    if (savedToday) {
      const savedAffirmation = affirmations.find((a) => a.id === savedToday);
      if (savedAffirmation) {
        setCurrentAffirmation(savedAffirmation);
        return;
      }
    }

    // Select random affirmation from relevant ones
    const randomAffirmation =
      relevantAffirmations[
        Math.floor(Math.random() * relevantAffirmations.length)
      ];

    setCurrentAffirmation(randomAffirmation);
    localStorage.setItem(`affirmation_${today}`, randomAffirmation.id);
  };

  const getNewAffirmation = () => {
    const otherAffirmations = affirmations.filter(
      (a) => a.id !== currentAffirmation?.id,
    );
    const newAffirmation =
      otherAffirmations[Math.floor(Math.random() * otherAffirmations.length)];
    setCurrentAffirmation(newAffirmation);

    showNotification({
      type: "encouragement",
      title: "New Affirmation 🌟",
      message: "Here's a fresh affirmation to inspire your day!",
      duration: 3000,
    });
  };

  const toggleFavorite = (affirmationId: string) => {
    const newFavorites = favorites.includes(affirmationId)
      ? favorites.filter((id) => id !== affirmationId)
      : [...favorites, affirmationId];

    setFavorites(newFavorites);
    localStorage.setItem("affirmation_favorites", JSON.stringify(newFavorites));
  };

  const shareAffirmation = () => {
    if (currentAffirmation && navigator.share) {
      navigator.share({
        title: "Daily Affirmation",
        text: `${currentAffirmation.text} - From MindSync`,
      });
    } else if (currentAffirmation) {
      navigator.clipboard.writeText(currentAffirmation.text);
      showNotification({
        type: "encouragement",
        title: "Copied! 📋",
        message: "Affirmation copied to clipboard",
        duration: 2000,
      });
    }
  };

  const getCategoryIcon = (category: AffirmationCategory) => {
    const icons = {
      "self-love": Heart,
      strength: Shield,
      calm: Sun,
      motivation: Zap,
      healing: Sparkles,
      gratitude: Star,
      confidence: Smile,
      peace: BookOpen,
    };
    return icons[category] || Heart;
  };

  if (!currentAffirmation) return null;

  const CategoryIcon = getCategoryIcon(currentAffirmation.category);

  return (
    <div className="space-y-4">
      {/* Main Affirmation Card */}
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${currentAffirmation.color}`} />

        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CategoryIcon className="w-5 h-5 text-mint-600" />
              <span>Daily Affirmation</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="capitalize" variant="secondary">
                {currentAffirmation.category.replace("-", " ")}
              </Badge>
              <span className="text-2xl">{currentAffirmation.icon}</span>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Affirmation Text */}
            <div className="text-center p-6 bg-gradient-to-r from-mint-50 to-sky-50 rounded-lg border border-mint-200">
              <blockquote className="text-lg md:text-xl text-gray-800 leading-relaxed font-medium italic">
                "{currentAffirmation.text}"
              </blockquote>
              {currentAffirmation.author && (
                <cite className="text-sm text-gray-600 mt-3 block">
                  — {currentAffirmation.author}
                </cite>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-3">
              <Button
                onClick={() => toggleFavorite(currentAffirmation.id)}
                variant="outline"
                size="sm"
                className={cn(
                  favorites.includes(currentAffirmation.id) &&
                    "bg-pink-50 border-pink-300 text-pink-700",
                )}
              >
                <Heart
                  className={cn(
                    "w-4 h-4 mr-2",
                    favorites.includes(currentAffirmation.id) && "fill-current",
                  )}
                />
                {favorites.includes(currentAffirmation.id)
                  ? "Favorited"
                  : "Favorite"}
              </Button>

              <Button
                onClick={getNewAffirmation}
                variant="outline"
                size="sm"
                className="border-mint-300 text-mint-700 hover:bg-mint-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                New Affirmation
              </Button>

              <Button
                onClick={shareAffirmation}
                variant="outline"
                size="sm"
                className="border-sky-300 text-sky-700 hover:bg-sky-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Personalization Note */}
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-700 text-center">
                <strong>✨ Personalized for you:</strong> This affirmation was
                selected based on your recent mood and journal entries to
                provide the support you need today.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favorite Affirmations */}
      {favorites.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-pink-600" />
                <span>Your Favorites</span>
              </CardTitle>
              <Button
                onClick={() => setShowAll(!showAll)}
                variant="ghost"
                size="sm"
              >
                {showAll ? "Show Less" : `View All (${favorites.length})`}
              </Button>
            </div>
          </CardHeader>

          {showAll && (
            <CardContent>
              <div className="space-y-3">
                {favorites.map((favoriteId) => {
                  const affirmation = affirmations.find(
                    (a) => a.id === favoriteId,
                  );
                  if (!affirmation) return null;

                  return (
                    <div
                      key={favoriteId}
                      className="p-3 bg-pink-50 rounded-lg border border-pink-200 cursor-pointer hover:bg-pink-100 transition-colors"
                      onClick={() => setCurrentAffirmation(affirmation)}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">{affirmation.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 italic">
                            "{affirmation.text}"
                          </p>
                          <Badge
                            className="mt-1 text-xs capitalize"
                            variant="secondary"
                          >
                            {affirmation.category.replace("-", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
