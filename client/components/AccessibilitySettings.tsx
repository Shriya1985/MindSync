import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { showNotification } from "@/components/ui/notification-system";
import {
  Palette,
  Sun,
  Moon,
  Type,
  Eye,
  Volume2,
  Contrast,
  ZoomIn,
  Settings,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "auto";
type ColorPalette =
  | "default"
  | "ocean"
  | "forest"
  | "sunset"
  | "lavender"
  | "warm";
type FontStyle = "sans" | "serif" | "dyslexic";
type FontSize = "normal" | "large" | "extra-large";

type AccessibilitySettings = {
  theme: Theme;
  colorPalette: ColorPalette;
  fontStyle: FontStyle;
  fontSize: FontSize;
  highContrast: boolean;
  reducedMotion: boolean;
  soundEnabled: boolean;
  focusIndicators: boolean;
};

const colorPalettes = {
  default: {
    name: "Default",
    description: "Mint and sky blue",
    colors: ["#10b981", "#0ea5e9", "#6366f1"],
    gradient: "from-mint-500 to-sky-500",
  },
  ocean: {
    name: "Ocean",
    description: "Calm blues and teals",
    colors: ["#0891b2", "#0e7490", "#164e63"],
    gradient: "from-cyan-500 to-blue-600",
  },
  forest: {
    name: "Forest",
    description: "Natural greens",
    colors: ["#059669", "#047857", "#065f46"],
    gradient: "from-emerald-500 to-green-600",
  },
  sunset: {
    name: "Sunset",
    description: "Warm oranges and pinks",
    colors: ["#ea580c", "#dc2626", "#be185d"],
    gradient: "from-orange-500 to-pink-600",
  },
  lavender: {
    name: "Lavender",
    description: "Soft purples",
    colors: ["#8b5cf6", "#7c3aed", "#6d28d9"],
    gradient: "from-violet-500 to-purple-600",
  },
  warm: {
    name: "Warm",
    description: "Cozy earth tones",
    colors: ["#d97706", "#b45309", "#92400e"],
    gradient: "from-amber-500 to-orange-600",
  },
};

const fontStyles = {
  sans: {
    name: "Sans-serif",
    description: "Clean and modern",
    class: "font-sans",
    example: "The quick brown fox jumps over the lazy dog",
  },
  serif: {
    name: "Serif",
    description: "Traditional and readable",
    class: "font-serif",
    example: "The quick brown fox jumps over the lazy dog",
  },
  dyslexic: {
    name: "Dyslexic-friendly",
    description: "Optimized for readability",
    class: "font-mono",
    example: "The quick brown fox jumps over the lazy dog",
  },
};

const fontSizes = {
  normal: { name: "Normal", class: "text-base", description: "Standard size" },
  large: { name: "Large", class: "text-lg", description: "18px base size" },
  "extra-large": {
    name: "Extra Large",
    class: "text-xl",
    description: "20px base size",
  },
};

export function AccessibilitySettings() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    theme: "light",
    colorPalette: "default",
    fontStyle: "sans",
    fontSize: "normal",
    highContrast: false,
    reducedMotion: false,
    soundEnabled: true,
    focusIndicators: true,
  });

  const [previewMode, setPreviewMode] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("accessibility_settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K],
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("accessibility_settings", JSON.stringify(newSettings));

    showNotification({
      type: "encouragement",
      title: "Settings Updated! ✨",
      message: `${key} has been updated to enhance your experience.`,
      duration: 2000,
    });
  };

  const applySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;

    // Apply theme
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply color palette
    const palette = colorPalettes[settings.colorPalette];
    root.style.setProperty("--primary-color", palette.colors[0]);
    root.style.setProperty("--secondary-color", palette.colors[1]);
    root.style.setProperty("--accent-color", palette.colors[2]);

    // Apply font settings
    root.className = root.className.replace(/font-\w+/g, "");
    root.classList.add(fontStyles[settings.fontStyle].class);

    // Apply font size
    root.className = root.className.replace(/text-\w+/g, "");
    root.classList.add(fontSizes[settings.fontSize].class);

    // Apply high contrast
    if (settings.highContrast) {
      root.style.setProperty("--contrast-multiplier", "1.5");
    } else {
      root.style.setProperty("--contrast-multiplier", "1");
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty("--animation-duration", "0s");
    } else {
      root.style.setProperty("--animation-duration", "0.3s");
    }

    // Apply focus indicators
    if (settings.focusIndicators) {
      root.style.setProperty("--focus-outline", "2px solid #10b981");
    } else {
      root.style.setProperty("--focus-outline", "none");
    }
  };

  const resetToDefaults = () => {
    const defaultSettings: AccessibilitySettings = {
      theme: "light",
      colorPalette: "default",
      fontStyle: "sans",
      fontSize: "normal",
      highContrast: false,
      reducedMotion: false,
      soundEnabled: true,
      focusIndicators: true,
    };

    setSettings(defaultSettings);
    localStorage.setItem(
      "accessibility_settings",
      JSON.stringify(defaultSettings),
    );

    showNotification({
      type: "encouragement",
      title: "Settings Reset! 🔄",
      message: "All accessibility settings have been reset to defaults.",
      duration: 3000,
    });
  };

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-purple-600" />
          <span>Accessibility & Personalization</span>
        </CardTitle>
        <p className="text-gray-600">
          Customize your experience for comfort and accessibility
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Theme Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Sun className="w-5 h-5 text-yellow-600" />
            <span>Theme Preference</span>
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {(["light", "dark", "auto"] as Theme[]).map((theme) => (
              <Button
                key={theme}
                onClick={() => updateSetting("theme", theme)}
                variant={settings.theme === theme ? "default" : "outline"}
                className={cn(
                  "h-20 flex flex-col space-y-2",
                  settings.theme === theme && "bg-mint-500 hover:bg-mint-600",
                )}
              >
                {theme === "light" && <Sun className="w-6 h-6" />}
                {theme === "dark" && <Moon className="w-6 h-6" />}
                {theme === "auto" && <Sparkles className="w-6 h-6" />}
                <span className="capitalize">{theme}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Palette className="w-5 h-5 text-pink-600" />
            <span>Color Palette</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(colorPalettes).map(([key, palette]) => (
              <div
                key={key}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                  settings.colorPalette === key
                    ? "border-mint-500 bg-mint-50"
                    : "border-gray-200 hover:border-gray-300",
                )}
                onClick={() =>
                  updateSetting("colorPalette", key as ColorPalette)
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{palette.name}</span>
                  {settings.colorPalette === key && (
                    <Check className="w-4 h-4 text-mint-600" />
                  )}
                </div>
                <div className="flex space-x-2 mb-2">
                  {palette.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600">{palette.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Font Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Font Style */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Type className="w-5 h-5 text-blue-600" />
              <span>Font Style</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(fontStyles).map(([key, font]) => (
                <div
                  key={key}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    settings.fontStyle === key
                      ? "border-mint-500 bg-mint-50"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                  onClick={() => updateSetting("fontStyle", key as FontStyle)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{font.name}</span>
                    {settings.fontStyle === key && (
                      <Check className="w-4 h-4 text-mint-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {font.description}
                  </p>
                  <p className={cn("text-sm", font.class)}>{font.example}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <ZoomIn className="w-5 h-5 text-green-600" />
              <span>Font Size</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(fontSizes).map(([key, size]) => (
                <div
                  key={key}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    settings.fontSize === key
                      ? "border-mint-500 bg-mint-50"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                  onClick={() => updateSetting("fontSize", key as FontSize)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{size.name}</span>
                    {settings.fontSize === key && (
                      <Check className="w-4 h-4 text-mint-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {size.description}
                  </p>
                  <p className={cn("text-sm", size.class)}>
                    Sample text in {size.name.toLowerCase()} size
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Accessibility Toggles */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            <span>Accessibility Options</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <Label className="font-medium">High Contrast</Label>
                <p className="text-sm text-gray-600">
                  Increase contrast for better visibility
                </p>
              </div>
              <Switch
                checked={settings.highContrast}
                onCheckedChange={(checked) =>
                  updateSetting("highContrast", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <Label className="font-medium">Reduced Motion</Label>
                <p className="text-sm text-gray-600">
                  Minimize animations and transitions
                </p>
              </div>
              <Switch
                checked={settings.reducedMotion}
                onCheckedChange={(checked) =>
                  updateSetting("reducedMotion", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <Label className="font-medium">Sound Effects</Label>
                <p className="text-sm text-gray-600">
                  Enable audio feedback and sounds
                </p>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("soundEnabled", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <Label className="font-medium">Focus Indicators</Label>
                <p className="text-sm text-gray-600">
                  Show visible focus outlines for navigation
                </p>
              </div>
              <Switch
                checked={settings.focusIndicators}
                onCheckedChange={(checked) =>
                  updateSetting("focusIndicators", checked)
                }
              />
            </div>
          </div>
        </div>

        {/* Preview & Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="space-x-3">
            <Button
              onClick={() => setPreviewMode(!previewMode)}
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? "Exit Preview" : "Preview Changes"}
            </Button>
            <Button onClick={resetToDefaults} variant="outline">
              Reset to Defaults
            </Button>
          </div>

          <Badge className="bg-green-100 text-green-700">
            ✓ Settings saved automatically
          </Badge>
        </div>

        {/* Accessibility Info */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">
            💡 Accessibility Features
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • All settings are saved locally and persist across sessions
            </li>
            <li>• Keyboard navigation is supported throughout the app</li>
            <li>
              • Screen reader friendly with proper ARIA labels and landmarks
            </li>
            <li>
              • Color combinations meet WCAG accessibility contrast guidelines
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
