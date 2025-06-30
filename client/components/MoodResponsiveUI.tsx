import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import {
  Palette,
  Eye,
  Settings,
  RefreshCw,
  Sun,
  Moon,
  Cloud,
  Sparkles,
  Heart,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MoodTheme = {
  name: string;
  background: string;
  accent: string;
  text: string;
  description: string;
  icon: typeof Sun;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
  };
};

const moodThemes: Record<string, MoodTheme> = {
  happy: {
    name: "Sunny Day",
    background: "from-yellow-100 via-orange-50 to-pink-50",
    accent: "from-yellow-400 to-orange-400",
    text: "text-yellow-800",
    description: "Bright and energetic vibes",
    icon: Sun,
    colors: {
      primary: "#f59e0b",
      secondary: "#fbbf24",
      background: "#fef3c7",
      surface: "#fffbeb",
    },
  },
  relaxed: {
    name: "Ocean Breeze",
    background: "from-blue-50 via-cyan-50 to-teal-50",
    accent: "from-blue-400 to-teal-400",
    text: "text-blue-800",
    description: "Calm and peaceful atmosphere",
    icon: Cloud,
    colors: {
      primary: "#0ea5e9",
      secondary: "#06b6d4",
      background: "#dbeafe",
      surface: "#f0f9ff",
    },
  },
  excited: {
    name: "Electric Energy",
    background: "from-purple-100 via-pink-50 to-red-50",
    accent: "from-purple-500 to-pink-500",
    text: "text-purple-800",
    description: "Dynamic and vibrant energy",
    icon: Zap,
    colors: {
      primary: "#a855f7",
      secondary: "#ec4899",
      background: "#f3e8ff",
      surface: "#faf5ff",
    },
  },
  peaceful: {
    name: "Forest Zen",
    background: "from-green-50 via-emerald-50 to-mint-50",
    accent: "from-green-400 to-emerald-400",
    text: "text-green-800",
    description: "Serene natural harmony",
    icon: Sparkles,
    colors: {
      primary: "#10b981",
      secondary: "#34d399",
      background: "#dcfce7",
      surface: "#f0fdf4",
    },
  },
  motivated: {
    name: "Sunrise Energy",
    background: "from-orange-100 via-red-50 to-pink-50",
    accent: "from-orange-500 to-red-500",
    text: "text-orange-800",
    description: "Determined and focused",
    icon: Heart,
    colors: {
      primary: "#f97316",
      secondary: "#ef4444",
      background: "#fed7aa",
      surface: "#fff7ed",
    },
  },
  neutral: {
    name: "Gentle Balance",
    background: "from-gray-50 via-slate-50 to-zinc-50",
    accent: "from-gray-400 to-slate-400",
    text: "text-gray-800",
    description: "Balanced and centered",
    icon: Moon,
    colors: {
      primary: "#6b7280",
      secondary: "#9ca3af",
      background: "#f9fafb",
      surface: "#ffffff",
    },
  },
};

const defaultTheme = moodThemes.neutral;

export function MoodResponsiveUI() {
  const { moodEntries, userStats } = useData();
  const [currentTheme, setCurrentTheme] = useState<MoodTheme>(defaultTheme);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [lastMoodUsed, setLastMoodUsed] = useState<string | null>(null);

  // Get the latest mood entry
  const getLatestMood = () => {
    if (moodEntries.length === 0) return null;
    const sortedEntries = [...moodEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    return sortedEntries[0];
  };

  // Apply theme to document root
  const applyTheme = (theme: MoodTheme) => {
    const root = document.documentElement;
    root.style.setProperty("--mood-primary", theme.colors.primary);
    root.style.setProperty("--mood-secondary", theme.colors.secondary);
    root.style.setProperty("--mood-background", theme.colors.background);
    root.style.setProperty("--mood-surface", theme.colors.surface);

    // Update CSS classes for components using mood-responsive styles
    const moodElements = document.querySelectorAll("[data-mood-responsive]");
    moodElements.forEach((element) => {
      element.className = element.className.replace(
        /mood-bg-\w+/g,
        `mood-bg-${theme.name.toLowerCase().replace(/\s+/g, "-")}`,
      );
    });
  };

  // Auto-detect mood and apply theme
  const autoDetectMoodTheme = () => {
    if (!isEnabled) return;

    const latestMood = getLatestMood();
    if (!latestMood) return;

    // Map mood entries to theme keys
    const moodToThemeMap: Record<string, string> = {
      happy: "happy",
      joyful: "happy",
      content: "happy",
      relaxed: "relaxed",
      calm: "relaxed",
      peaceful: "peaceful",
      zen: "peaceful",
      excited: "excited",
      energetic: "excited",
      motivated: "motivated",
      determined: "motivated",
      focused: "motivated",
      neutral: "neutral",
      okay: "neutral",
      fine: "neutral",
    };

    const themeKey = moodToThemeMap[latestMood.mood.toLowerCase()] || "neutral";
    const newTheme = moodThemes[themeKey] || defaultTheme;

    if (newTheme.name !== currentTheme.name) {
      setCurrentTheme(newTheme);
      setLastMoodUsed(latestMood.mood);
      applyTheme(newTheme);

      showNotification({
        type: "encouragement",
        title: "🎨 Theme Updated!",
        message: `Switched to "${newTheme.name}" theme based on your ${latestMood.mood} mood`,
        duration: 4000,
      });
    }
  };

  // Manual theme selection
  const selectTheme = (themeKey: string) => {
    const theme = moodThemes[themeKey] || defaultTheme;
    setCurrentTheme(theme);
    applyTheme(theme);
    setLastMoodUsed(null);

    showNotification({
      type: "encouragement",
      title: "✨ Theme Changed!",
      message: `Now using "${theme.name}" theme`,
      duration: 3000,
    });
  };

  // Auto-detect on mood changes
  useEffect(() => {
    if (isEnabled && moodEntries.length > 0) {
      const timer = setTimeout(() => {
        setIsAutoDetecting(true);
        autoDetectMoodTheme();
        setTimeout(() => setIsAutoDetecting(false), 1000);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [moodEntries, isEnabled]);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("mood-responsive-theme");
    const savedEnabled = localStorage.getItem("mood-responsive-enabled");

    if (savedTheme && moodThemes[savedTheme]) {
      const theme = moodThemes[savedTheme];
      setCurrentTheme(theme);
      applyTheme(theme);
    }

    if (savedEnabled !== null) {
      setIsEnabled(savedEnabled === "true");
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("mood-responsive-enabled", isEnabled.toString());
  }, [isEnabled]);

  const toggleAutoMode = () => {
    setIsEnabled(!isEnabled);
    if (!isEnabled) {
      autoDetectMoodTheme();
    }
  };

  const resetToDefault = () => {
    setCurrentTheme(defaultTheme);
    applyTheme(defaultTheme);
    setLastMoodUsed(null);
    localStorage.removeItem("mood-responsive-theme");

    showNotification({
      type: "encouragement",
      title: "🔄 Reset Complete",
      message: "Theme reset to default settings",
      duration: 3000,
    });
  };

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="w-6 h-6 text-purple-600" />
          <span>Mood-Responsive UI</span>
        </CardTitle>
        <p className="text-gray-600">
          Your interface adapts to your emotional state automatically
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Theme Display */}
        <div
          className={cn(
            "p-6 rounded-xl bg-gradient-to-br",
            currentTheme.background,
            "border-2 border-white/50",
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-full bg-gradient-to-r flex items-center justify-center",
                  currentTheme.accent,
                )}
              >
                <currentTheme.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={cn("text-xl font-bold", currentTheme.text)}>
                  {currentTheme.name}
                </h3>
                <p className={cn("text-sm opacity-80", currentTheme.text)}>
                  {currentTheme.description}
                </p>
              </div>
            </div>
            {isAutoDetecting && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Detecting...</span>
              </div>
            )}
          </div>

          {lastMoodUsed && (
            <Badge
              className={cn("bg-white/20 backdrop-blur-sm", currentTheme.text)}
            >
              Based on your "{lastMoodUsed}" mood
            </Badge>
          )}
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <span className="font-semibold">Auto Theme Detection</span>
            </div>
            <Button
              onClick={toggleAutoMode}
              variant={isEnabled ? "default" : "outline"}
              size="sm"
              className={
                isEnabled
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  : ""
              }
            >
              {isEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <p className="text-sm text-gray-600">
            {isEnabled
              ? "Your interface theme automatically changes based on your latest mood entry"
              : "Manual theme selection is active"}
          </p>
        </div>

        {/* Theme Gallery */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Available Themes</span>
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(moodThemes).map(([key, theme]) => {
              const IconComponent = theme.icon;
              const isActive = theme.name === currentTheme.name;

              return (
                <div
                  key={key}
                  onClick={() => selectTheme(key)}
                  className={cn(
                    "relative p-4 rounded-lg cursor-pointer transition-all duration-200",
                    `bg-gradient-to-br ${theme.background}`,
                    "border-2 hover:scale-105",
                    isActive
                      ? "border-purple-400 ring-2 ring-purple-200"
                      : "border-white/50 hover:border-purple-200",
                  )}
                >
                  <div className="text-center space-y-2">
                    <div
                      className={cn(
                        "w-8 h-8 mx-auto rounded-full bg-gradient-to-r flex items-center justify-center",
                        theme.accent,
                      )}
                    >
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className={cn("font-medium text-sm", theme.text)}>
                        {theme.name}
                      </p>
                      <p className={cn("text-xs opacity-70", theme.text)}>
                        {theme.description}
                      </p>
                    </div>
                  </div>

                  {isActive && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={autoDetectMoodTheme}
            variant="outline"
            className="flex items-center space-x-2"
            disabled={!isEnabled || moodEntries.length === 0}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Detect Current Mood</span>
          </Button>

          <Button
            onClick={resetToDefault}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Reset to Default</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {moodEntries.length}
            </p>
            <p className="text-sm text-gray-600">Mood Entries</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {Object.keys(moodThemes).length}
            </p>
            <p className="text-sm text-gray-600">Available Themes</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-2">How It Works</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Log your mood to trigger automatic theme changes</li>
            <li>• Each mood maps to a unique visual theme</li>
            <li>• Themes affect colors, backgrounds, and visual mood</li>
            <li>• Manual override available anytime</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
