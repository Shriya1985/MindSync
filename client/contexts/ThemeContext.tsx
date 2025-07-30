import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useData } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";

export type GlobalTheme = {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  gradients: {
    primary: string;
    background: string;
    hero: string;
  };
  effects: {
    blur: string;
    shadow: string;
    border: string;
  };
};

export const globalThemes: Record<string, GlobalTheme> = {
  happy: {
    id: "happy",
    name: "Sunny Bliss",
    description: "Bright and energetic vibes",
    colors: {
      primary: "#f59e0b",
      secondary: "#fbbf24",
      accent: "#fb923c",
      background: "#fef3c7",
      surface: "#fffbeb",
      text: "#92400e",
      muted: "#d97706",
    },
    gradients: {
      primary: "from-yellow-400 to-orange-400",
      background: "from-yellow-50 via-orange-50 to-pink-50",
      hero: "from-yellow-100 to-orange-100",
    },
    effects: {
      blur: "backdrop-blur-sm",
      shadow: "shadow-yellow-200/50",
      border: "border-yellow-200",
    },
  },
  relaxed: {
    id: "relaxed",
    name: "Ocean Tranquil",
    description: "Calm and peaceful atmosphere",
    colors: {
      primary: "#0ea5e9",
      secondary: "#06b6d4",
      accent: "#0891b2",
      background: "#dbeafe",
      surface: "#f0f9ff",
      text: "#0c4a6e",
      muted: "#0284c7",
    },
    gradients: {
      primary: "from-blue-400 to-cyan-400",
      background: "from-blue-50 via-cyan-50 to-teal-50",
      hero: "from-blue-100 to-cyan-100",
    },
    effects: {
      blur: "backdrop-blur-sm",
      shadow: "shadow-blue-200/50",
      border: "border-blue-200",
    },
  },
  excited: {
    id: "excited",
    name: "Electric Energy",
    description: "Dynamic and vibrant energy",
    colors: {
      primary: "#a855f7",
      secondary: "#ec4899",
      accent: "#d946ef",
      background: "#f3e8ff",
      surface: "#faf5ff",
      text: "#581c87",
      muted: "#9333ea",
    },
    gradients: {
      primary: "from-purple-500 to-pink-500",
      background: "from-purple-50 via-pink-50 to-rose-50",
      hero: "from-purple-100 to-pink-100",
    },
    effects: {
      blur: "backdrop-blur-sm",
      shadow: "shadow-purple-200/50",
      border: "border-purple-200",
    },
  },
  peaceful: {
    id: "peaceful",
    name: "Forest Zen",
    description: "Serene natural harmony",
    colors: {
      primary: "#10b981",
      secondary: "#34d399",
      accent: "#059669",
      background: "#dcfce7",
      surface: "#f0fdf4",
      text: "#065f46",
      muted: "#047857",
    },
    gradients: {
      primary: "from-green-500 to-emerald-500",
      background: "from-green-50 via-emerald-50 to-mint-50",
      hero: "from-green-100 to-emerald-100",
    },
    effects: {
      blur: "backdrop-blur-sm",
      shadow: "shadow-green-200/50",
      border: "border-green-200",
    },
  },
  motivated: {
    id: "motivated",
    name: "Sunrise Power",
    description: "Determined and focused",
    colors: {
      primary: "#f97316",
      secondary: "#ef4444",
      accent: "#dc2626",
      background: "#fed7aa",
      surface: "#fff7ed",
      text: "#9a3412",
      muted: "#ea580c",
    },
    gradients: {
      primary: "from-orange-500 to-red-500",
      background: "from-orange-50 via-red-50 to-pink-50",
      hero: "from-orange-100 to-red-100",
    },
    effects: {
      blur: "backdrop-blur-sm",
      shadow: "shadow-orange-200/50",
      border: "border-orange-200",
    },
  },
  neutral: {
    id: "neutral",
    name: "Gentle Balance",
    description: "Balanced and centered",
    colors: {
      primary: "#6b7280",
      secondary: "#9ca3af",
      accent: "#4b5563",
      background: "#f9fafb",
      surface: "#ffffff",
      text: "#374151",
      muted: "#6b7280",
    },
    gradients: {
      primary: "from-gray-400 to-slate-400",
      background: "from-gray-50 via-slate-50 to-zinc-50",
      hero: "from-gray-100 to-slate-100",
    },
    effects: {
      blur: "backdrop-blur-sm",
      shadow: "shadow-gray-200/50",
      border: "border-gray-200",
    },
  },
};

type ThemeContextType = {
  currentTheme: GlobalTheme;
  setTheme: (themeId: string) => void;
  isAutoMode: boolean;
  setAutoMode: (enabled: boolean) => void;
  applyMoodTheme: (mood: string) => void;
  resetTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<GlobalTheme>(
    globalThemes.neutral,
  );
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [lastMoodProcessed, setLastMoodProcessed] = useState<string | null>(
    null,
  );

  // Safely get mood entries with error handling
  let moodEntries: any[] = [];
  try {
    const dataContext = useData();
    moodEntries = dataContext?.moodEntries || [];
  } catch (error) {
    console.warn("ThemeProvider: DataContext not available yet, using empty mood entries");
    moodEntries = [];
  }

  // Map moods to themes
  const moodToThemeMap: Record<string, string> = {
    happy: "happy",
    joyful: "happy",
    content: "happy",
    cheerful: "happy",
    elated: "happy",

    relaxed: "relaxed",
    calm: "relaxed",
    peaceful: "peaceful",
    zen: "peaceful",
    serene: "peaceful",
    tranquil: "relaxed",

    excited: "excited",
    energetic: "excited",
    pumped: "excited",
    thrilled: "excited",

    motivated: "motivated",
    determined: "motivated",
    focused: "motivated",
    driven: "motivated",

    neutral: "neutral",
    okay: "neutral",
    fine: "neutral",
    meh: "neutral",
  };

  // Apply theme to CSS custom properties
  const applyThemeToDocument = (theme: GlobalTheme) => {
    const root = document.documentElement;

    // Apply comprehensive CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply gradient custom properties
    Object.entries(theme.gradients).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-${key}`, value);
    });

    // Apply effect custom properties
    Object.entries(theme.effects).forEach(([key, value]) => {
      root.style.setProperty(`--effect-${key}`, value);
    });

    // Apply theme classes to body for global styling
    document.body.className = document.body.className
      .split(" ")
      .filter((cls) => !cls.startsWith("theme-"))
      .concat([`theme-${theme.id}`])
      .join(" ");

    // Update main background with current theme
    document.body.style.background = `linear-gradient(135deg, ${theme.colors.background}, ${theme.colors.surface})`;
    document.body.style.minHeight = "100vh";

    // Apply to main container elements
    const containers = document.querySelectorAll("[data-theme-container]");
    containers.forEach((container) => {
      (container as HTMLElement).style.background =
        `linear-gradient(135deg, ${theme.colors.background}, ${theme.colors.surface})`;
    });

    // Update navigation and cards
    const navElements = document.querySelectorAll("nav, .nav");
    navElements.forEach((nav) => {
      (nav as HTMLElement).style.background = `${theme.colors.surface}dd`;
      (nav as HTMLElement).style.backdropFilter = "blur(12px)";
      (nav as HTMLElement).style.borderColor = theme.colors.primary + "40";
    });

    // Update card elements
    const cardElements = document.querySelectorAll(".card, [data-theme-card]");
    cardElements.forEach((card) => {
      (card as HTMLElement).style.background = `${theme.colors.surface}f0`;
      (card as HTMLElement).style.backdropFilter = "blur(8px)";
      (card as HTMLElement).style.borderColor = theme.colors.primary + "30";
    });
  };

  // Set theme manually
  const setTheme = (themeId: string) => {
    const theme = globalThemes[themeId];
    if (theme) {
      setCurrentTheme(theme);
      applyThemeToDocument(theme);
      localStorage.setItem("global-theme", themeId);
      localStorage.setItem("theme-auto-mode", "false");
      setIsAutoMode(false);

      showNotification({
        type: "encouragement",
        title: `🎨 ${theme.name} Theme Applied!`,
        message: `Your entire interface is now styled with ${theme.description.toLowerCase()}`,
        duration: 4000,
      });
    }
  };

  // Apply mood-based theme
  const applyMoodTheme = (mood: string) => {
    if (!isAutoMode) return;

    const moodLower = mood.toLowerCase();
    const themeId = moodToThemeMap[moodLower] || "neutral";
    const theme = globalThemes[themeId];

    if (theme && theme.id !== currentTheme.id) {
      setCurrentTheme(theme);
      applyThemeToDocument(theme);

      showNotification({
        type: "encouragement",
        title: `✨ Mood Theme: ${theme.name}`,
        message: `Your interface adapted to your ${mood} mood`,
        duration: 5000,
      });

      // Trigger mood reaction
      window.dispatchEvent(
        new CustomEvent("triggerMoodReaction", {
          detail: { mood, theme },
        }),
      );
    }
  };

  // Toggle auto mode
  const setAutoMode = (enabled: boolean) => {
    setIsAutoMode(enabled);
    localStorage.setItem("theme-auto-mode", enabled.toString());

    if (enabled && moodEntries.length > 0) {
      const latestMood = moodEntries[moodEntries.length - 1];
      applyMoodTheme(latestMood.mood);
    }
  };

  // Reset to neutral theme
  const resetTheme = () => {
    setCurrentTheme(globalThemes.neutral);
    applyThemeToDocument(globalThemes.neutral);
    localStorage.removeItem("global-theme");
    setIsAutoMode(true);
    localStorage.setItem("theme-auto-mode", "true");

    showNotification({
      type: "encouragement",
      title: "🔄 Theme Reset",
      message: "Returned to balanced neutral theme",
      duration: 3000,
    });
  };

  // Auto-apply theme based on mood changes
  useEffect(() => {
    if (isAutoMode && moodEntries.length > 0) {
      const latestMood = moodEntries[moodEntries.length - 1];

      // Only process if this is a new mood entry
      if (latestMood.id !== lastMoodProcessed) {
        setLastMoodProcessed(latestMood.id);

        setTimeout(() => {
          applyMoodTheme(latestMood.mood);
        }, 1000); // Small delay for better UX
      }
    }
  }, [moodEntries, isAutoMode]);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("global-theme");
    const savedAutoMode = localStorage.getItem("theme-auto-mode");

    if (savedAutoMode !== null) {
      setIsAutoMode(savedAutoMode === "true");
    }

    if (savedTheme && globalThemes[savedTheme]) {
      const theme = globalThemes[savedTheme];
      setCurrentTheme(theme);
      applyThemeToDocument(theme);
    } else {
      // Apply default theme
      applyThemeToDocument(globalThemes.neutral);
    }
  }, []);

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    isAutoMode,
    setAutoMode,
    applyMoodTheme,
    resetTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
