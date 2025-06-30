import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import {
  Heart,
  Sparkles,
  Zap,
  Sun,
  Cloud,
  Star,
  Smile,
  Coffee,
  Mountain,
  Waves,
  Flame,
  Snowflake,
  PlayCircle,
  Volume2,
  VolumeX,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MoodReaction = {
  id: string;
  mood: string;
  animation: string;
  description: string;
  icon: typeof Heart;
  color: string;
  bgColor: string;
  particles: string;
  sound?: string;
  message: string;
  duration: number;
};

const moodReactions: MoodReaction[] = [
  {
    id: "happy",
    mood: "happy",
    animation: "bounce-celebration",
    description: "Joyful celebration with confetti",
    icon: Sun,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    particles: "confetti",
    message: "Wonderful! Your happiness is contagious! ✨",
    duration: 3000,
  },
  {
    id: "excited",
    mood: "excited",
    animation: "electric-pulse",
    description: "Electric energy burst",
    icon: Zap,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    particles: "sparks",
    message: "Amazing energy! You're absolutely electrifying! ⚡",
    duration: 2500,
  },
  {
    id: "peaceful",
    mood: "peaceful",
    animation: "gentle-wave",
    description: "Calm rippling waves",
    icon: Waves,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    particles: "ripples",
    message: "So serene... breathe in that peaceful energy 🌊",
    duration: 4000,
  },
  {
    id: "motivated",
    mood: "motivated",
    animation: "rising-flame",
    description: "Rising flame of determination",
    icon: Flame,
    color: "text-red-500",
    bgColor: "bg-red-50",
    particles: "flames",
    message: "That's the spirit! Your motivation is inspiring! 🔥",
    duration: 3000,
  },
  {
    id: "grateful",
    mood: "grateful",
    animation: "warm-glow",
    description: "Warm glowing embrace",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-50",
    particles: "hearts",
    message: "Beautiful gratitude radiates from within you 💗",
    duration: 3500,
  },
  {
    id: "relaxed",
    mood: "relaxed",
    animation: "soft-float",
    description: "Gentle floating clouds",
    icon: Cloud,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    particles: "clouds",
    message: "Ahh, such lovely relaxation... drift peacefully ☁️",
    duration: 4000,
  },
  {
    id: "focused",
    mood: "focused",
    animation: "laser-beam",
    description: "Focused beam of light",
    icon: Star,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    particles: "beams",
    message: "Incredible focus! You're locked in and ready! ⭐",
    duration: 2000,
  },
  {
    id: "content",
    mood: "content",
    animation: "cozy-warmth",
    description: "Cozy warm blanket feeling",
    icon: Coffee,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    particles: "warmth",
    message: "So wonderfully content... embrace this moment ☕",
    duration: 3500,
  },
  {
    id: "optimistic",
    mood: "optimistic",
    animation: "sunrise-burst",
    description: "Bright sunrise burst",
    icon: Mountain,
    color: "text-orange-400",
    bgColor: "bg-orange-50",
    particles: "rays",
    message: "Brilliant optimism! The future looks bright! 🌅",
    duration: 3000,
  },
  {
    id: "calm",
    mood: "calm",
    animation: "zen-circle",
    description: "Peaceful zen circles",
    icon: Snowflake,
    color: "text-teal-500",
    bgColor: "bg-teal-50",
    particles: "zen",
    message: "Pure calm flows through you like gentle water 🧘",
    duration: 4000,
  },
];

export function MoodReactions() {
  const [currentReaction, setCurrentReaction] = useState<MoodReaction | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reactionHistory, setReactionHistory] = useState<string[]>([]);
  const [autoTrigger, setAutoTrigger] = useState(true);
  const { moodEntries, addPoints } = useData();

  // Load settings from localStorage
  useEffect(() => {
    const savedSound = localStorage.getItem("mood-reactions-sound");
    const savedAuto = localStorage.getItem("mood-reactions-auto");

    if (savedSound !== null) setSoundEnabled(savedSound === "true");
    if (savedAuto !== null) setAutoTrigger(savedAuto === "true");

    const history = localStorage.getItem("mood-reactions-history");
    if (history) setReactionHistory(JSON.parse(history));
  }, []);

  // Auto-trigger reactions on new mood entries
  useEffect(() => {
    if (autoTrigger && moodEntries.length > 0) {
      const latestMood = moodEntries[moodEntries.length - 1];
      const reaction = findReactionForMood(latestMood.mood);

      if (reaction && !reactionHistory.includes(latestMood.id)) {
        setTimeout(() => {
          triggerReaction(reaction, latestMood.id);
        }, 1000);
      }
    }
  }, [moodEntries, autoTrigger]);

  // Find appropriate reaction for mood
  const findReactionForMood = (mood: string): MoodReaction | null => {
    const moodLower = mood.toLowerCase();

    // Direct match
    let reaction = moodReactions.find((r) => r.mood === moodLower);
    if (reaction) return reaction;

    // Fuzzy matching
    const moodMappings: Record<string, string> = {
      joyful: "happy",
      elated: "happy",
      cheerful: "happy",
      energetic: "excited",
      pumped: "excited",
      thrilled: "excited",
      serene: "peaceful",
      tranquil: "peaceful",
      zen: "calm",
      determined: "motivated",
      driven: "motivated",
      thankful: "grateful",
      blessed: "grateful",
      chill: "relaxed",
      mellow: "relaxed",
      concentrated: "focused",
      sharp: "focused",
      satisfied: "content",
      comfortable: "content",
      hopeful: "optimistic",
      positive: "optimistic",
    };

    const mappedMood = moodMappings[moodLower];
    if (mappedMood) {
      reaction = moodReactions.find((r) => r.mood === mappedMood);
    }

    return reaction || null;
  };

  // Trigger a reaction animation
  const triggerReaction = (reaction: MoodReaction, moodId?: string) => {
    if (isPlaying) return;

    setCurrentReaction(reaction);
    setIsPlaying(true);

    // Add to history
    if (moodId) {
      const newHistory = [...reactionHistory, moodId];
      setReactionHistory(newHistory);
      localStorage.setItem(
        "mood-reactions-history",
        JSON.stringify(newHistory),
      );
    }

    // Show notification with reaction message
    showNotification({
      type: "encouragement",
      title: "✨ Mood Reaction!",
      message: reaction.message,
      duration: reaction.duration,
    });

    // Award points for triggering reaction
    addPoints(3, "Mood reaction triggered");

    // Play sound effect (simulated)
    if (soundEnabled) {
      // In a real app, this would play actual sound
      console.log(`Playing sound for ${reaction.mood} mood`);
    }

    // Stop animation after duration
    setTimeout(() => {
      setIsPlaying(false);
      setTimeout(() => setCurrentReaction(null), 500);
    }, reaction.duration);
  };

  // Manual reaction trigger
  const playReaction = (reaction: MoodReaction) => {
    triggerReaction(reaction);
  };

  // Toggle settings
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("mood-reactions-sound", newValue.toString());
  };

  const toggleAutoTrigger = () => {
    const newValue = !autoTrigger;
    setAutoTrigger(newValue);
    localStorage.setItem("mood-reactions-auto", newValue.toString());
  };

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-violet-600" />
          <span>Mood Reactions</span>
        </CardTitle>
        <p className="text-gray-600">
          Visual celebrations and feedback for your emotions
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Reaction Display */}
        <div className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
          {currentReaction ? (
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-500",
                currentReaction.bgColor,
                isPlaying ? "opacity-100" : "opacity-70",
              )}
            >
              {/* Main Animation Area */}
              <div
                className={cn(
                  "relative transition-all duration-1000",
                  isPlaying ? "scale-100 opacity-100" : "scale-75 opacity-50",
                )}
              >
                <div
                  className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center shadow-lg",
                    "bg-white border-4 border-white/50",
                    // Animation classes would be applied here
                    isPlaying &&
                      currentReaction.animation === "bounce-celebration" &&
                      "animate-bounce",
                    isPlaying &&
                      currentReaction.animation === "electric-pulse" &&
                      "animate-pulse",
                    isPlaying &&
                      currentReaction.animation === "gentle-wave" &&
                      "animate-ping",
                    isPlaying &&
                      currentReaction.animation === "rising-flame" &&
                      "animate-bounce",
                    isPlaying &&
                      currentReaction.animation === "warm-glow" &&
                      "animate-pulse",
                    isPlaying &&
                      currentReaction.animation === "soft-float" &&
                      "animate-pulse",
                    isPlaying &&
                      currentReaction.animation === "laser-beam" &&
                      "animate-ping",
                    isPlaying &&
                      currentReaction.animation === "cozy-warmth" &&
                      "animate-pulse",
                    isPlaying &&
                      currentReaction.animation === "sunrise-burst" &&
                      "animate-bounce",
                    isPlaying &&
                      currentReaction.animation === "zen-circle" &&
                      "animate-spin",
                  )}
                >
                  <currentReaction.icon
                    className={cn("w-12 h-12", currentReaction.color)}
                  />
                </div>

                {/* Particle Effects */}
                {isPlaying && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Simplified particle effects - in a real app these would be more sophisticated */}
                    {currentReaction.particles === "confetti" && (
                      <div className="absolute inset-0">
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "absolute w-2 h-2 rounded-full animate-ping",
                              [
                                "bg-yellow-400",
                                "bg-pink-400",
                                "bg-blue-400",
                                "bg-green-400",
                              ][i % 4],
                            )}
                            style={{
                              left: `${20 + ((i * 60) % 80)}%`,
                              top: `${20 + ((i * 40) % 60)}%`,
                              animationDelay: `${i * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {currentReaction.particles === "hearts" && (
                      <div className="absolute inset-0">
                        {[...Array(8)].map((_, i) => (
                          <Heart
                            key={i}
                            className={cn(
                              "absolute w-4 h-4 text-pink-400 animate-bounce fill-current",
                            )}
                            style={{
                              left: `${30 + ((i * 50) % 60)}%`,
                              top: `${30 + ((i * 30) % 50)}%`,
                              animationDelay: `${i * 0.2}s`,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {currentReaction.particles === "sparks" && (
                      <div className="absolute inset-0">
                        {[...Array(10)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "absolute w-3 h-3 text-orange-400 animate-ping fill-current",
                            )}
                            style={{
                              left: `${25 + ((i * 45) % 70)}%`,
                              top: `${25 + ((i * 35) % 65)}%`,
                              animationDelay: `${i * 0.15}s`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Reaction message */}
              {isPlaying && (
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-lg font-medium text-gray-800 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2">
                    {currentReaction.message}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <Sparkles className="w-16 h-16 text-gray-400 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-600">
                  Ready to React!
                </h3>
                <p className="text-sm text-gray-500">
                  {autoTrigger
                    ? "Reactions will appear when you log moods"
                    : "Choose a reaction to preview"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <Button
              onClick={toggleSound}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
              <span>Sound</span>
            </Button>

            <Button
              onClick={toggleAutoTrigger}
              variant={autoTrigger ? "default" : "outline"}
              size="sm"
              className={autoTrigger ? "bg-violet-500 hover:bg-violet-600" : ""}
            >
              <Settings className="w-4 h-4 mr-2" />
              Auto-trigger
            </Button>
          </div>

          <Badge className="bg-violet-100 text-violet-700">
            {reactionHistory.length} reactions triggered
          </Badge>
        </div>

        {/* Reaction Gallery */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
            <PlayCircle className="w-5 h-5" />
            <span>Try a Reaction</span>
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {moodReactions.map((reaction) => {
              const IconComponent = reaction.icon;

              return (
                <div
                  key={reaction.id}
                  onClick={() => !isPlaying && playReaction(reaction)}
                  className={cn(
                    "p-4 rounded-lg cursor-pointer transition-all duration-200 text-center",
                    reaction.bgColor,
                    "border-2 border-white/50 hover:border-violet-300",
                    isPlaying
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105 hover:shadow-md",
                    currentReaction?.id === reaction.id &&
                      "ring-2 ring-violet-300",
                  )}
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-full bg-white/60 flex items-center justify-center">
                      <IconComponent
                        className={cn("w-6 h-6", reaction.color)}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm capitalize">
                        {reaction.mood}
                      </p>
                      <p className="text-xs text-gray-600">
                        {reaction.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
          <h4 className="font-semibold text-violet-900 mb-2 flex items-center space-x-2">
            <Smile className="w-5 h-5" />
            <span>How Mood Reactions Work</span>
          </h4>
          <ul className="text-sm text-violet-800 space-y-1">
            <li>• Log a mood to trigger automatic visual reactions</li>
            <li>• Each emotion gets unique animations and particles</li>
            <li>• Reactions include encouraging messages and sounds</li>
            <li>• Earn points for engaging with your emotions</li>
          </ul>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-violet-600">
              {moodReactions.length}
            </p>
            <p className="text-xs text-gray-600">Unique Reactions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-violet-600">
              {reactionHistory.length}
            </p>
            <p className="text-xs text-gray-600">Times Triggered</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-violet-600">
              {autoTrigger ? "ON" : "OFF"}
            </p>
            <p className="text-xs text-gray-600">Auto Mode</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
