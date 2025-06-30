import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { useTheme, globalThemes } from "@/contexts/ThemeContext";
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

export function MoodResponsiveUI() {
  const { moodEntries } = useData();
  const { currentTheme, setTheme, isAutoMode, setAutoMode, resetTheme } =
    useTheme();
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

  // Auto-detect mood and apply theme
  const autoDetectMoodTheme = () => {
    if (!isAutoMode) return;

    const latestMood = getLatestMood();
    if (!latestMood) return;

    setIsAutoDetecting(true);
    setLastMoodUsed(latestMood.mood);

    // Use the global theme context to apply mood theme
    setTimeout(() => {
      setIsAutoDetecting(false);
    }, 1000);
  };

  // Manual theme selection
  const selectTheme = (themeKey: string) => {
    setTheme(themeKey);
    setLastMoodUsed(null);
  };

  // Auto-detect on mood changes
  useEffect(() => {
    if (isAutoMode && moodEntries.length > 0) {
      const timer = setTimeout(() => {
        autoDetectMoodTheme();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [moodEntries, isAutoMode]);

  const toggleAutoMode = () => {
    setAutoMode(!isAutoMode);
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
            "p-6 rounded-xl border-2 border-white/50",
            `bg-gradient-to-br ${currentTheme.gradients.background}`,
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  `bg-gradient-to-r ${currentTheme.gradients.primary}`,
                )}
              >
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: currentTheme.colors.text }}
                >
                  {currentTheme.name}
                </h3>
                <p
                  className="text-sm opacity-80"
                  style={{ color: currentTheme.colors.text }}
                >
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
              className="bg-white/20 backdrop-blur-sm"
              style={{ color: currentTheme.colors.text }}
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
              variant={isAutoMode ? "default" : "outline"}
              size="sm"
              className={
                isAutoMode
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  : ""
              }
            >
              {isAutoMode ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <p className="text-sm text-gray-600">
            {isAutoMode
              ? "Your entire interface theme automatically changes based on your latest mood entry"
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
            {Object.entries(globalThemes).map(([key, theme]) => {
              const isActive = theme.id === currentTheme.id;

              return (
                <div
                  key={key}
                  onClick={() => selectTheme(key)}
                  className={cn(
                    "relative p-4 rounded-lg cursor-pointer transition-all duration-200",
                    `bg-gradient-to-br ${theme.gradients.background}`,
                    "border-2 hover:scale-105",
                    isActive
                      ? "border-purple-400 ring-2 ring-purple-200"
                      : "border-white/50 hover:border-purple-200",
                  )}
                >
                  <div className="text-center space-y-2">
                    <div
                      className={cn(
                        "w-8 h-8 mx-auto rounded-full flex items-center justify-center",
                        `bg-gradient-to-r ${theme.gradients.primary}`,
                      )}
                    >
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                    <div>
                      <p
                        className="font-medium text-sm"
                        style={{ color: theme.colors.text }}
                      >
                        {theme.name}
                      </p>
                      <p
                        className="text-xs opacity-70"
                        style={{ color: theme.colors.text }}
                      >
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
            disabled={!isAutoMode || moodEntries.length === 0}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Detect Current Mood</span>
          </Button>

          <Button
            onClick={resetTheme}
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
              {Object.keys(globalThemes).length}
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
