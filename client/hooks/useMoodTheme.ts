import { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";

export type MoodTheme = {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  gradient: string;
  emoji: string;
};

const moodThemes: Record<string, MoodTheme> = {
  happy: {
    name: "Sunshine",
    primary: "from-yellow-400 to-orange-500",
    secondary: "from-yellow-50 to-orange-50",
    accent: "text-yellow-600",
    background: "bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50",
    text: "text-yellow-900",
    gradient: "from-yellow-500 to-orange-500",
    emoji: "☀️",
  },
  sad: {
    name: "Gentle Rain",
    primary: "from-blue-400 to-indigo-500",
    secondary: "from-blue-50 to-indigo-50",
    accent: "text-blue-600",
    background: "bg-gradient-to-br from-blue-50 via-slate-50 to-gray-50",
    text: "text-blue-900",
    gradient: "from-blue-500 to-indigo-500",
    emoji: "🌧️",
  },
  anxious: {
    name: "Calming Waters",
    primary: "from-cyan-400 to-teal-500",
    secondary: "from-cyan-50 to-teal-50",
    accent: "text-cyan-600",
    background: "bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50",
    text: "text-cyan-900",
    gradient: "from-cyan-500 to-teal-500",
    emoji: "🌊",
  },
  angry: {
    name: "Sunset Calm",
    primary: "from-rose-400 to-pink-500",
    secondary: "from-rose-50 to-pink-50",
    accent: "text-rose-600",
    background: "bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50",
    text: "text-rose-900",
    gradient: "from-rose-500 to-pink-500",
    emoji: "🌅",
  },
  calm: {
    name: "Forest Peace",
    primary: "from-green-400 to-emerald-500",
    secondary: "from-green-50 to-emerald-50",
    accent: "text-green-600",
    background: "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50",
    text: "text-green-900",
    gradient: "from-green-500 to-emerald-500",
    emoji: "🌲",
  },
  excited: {
    name: "Electric Energy",
    primary: "from-purple-400 to-pink-500",
    secondary: "from-purple-50 to-pink-50",
    accent: "text-purple-600",
    background: "bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50",
    text: "text-purple-900",
    gradient: "from-purple-500 to-pink-500",
    emoji: "⚡",
  },
  neutral: {
    name: "Serene Mint",
    primary: "from-mint-400 to-sky-500",
    secondary: "from-mint-50 to-sky-50",
    accent: "text-mint-600",
    background: "bg-gradient-to-br from-mint-50 via-white to-sky-50",
    text: "text-mint-900",
    gradient: "from-mint-500 to-sky-500",
    emoji: "🍃",
  },
};

export function useMoodTheme() {
  const [currentTheme, setCurrentTheme] = useState<MoodTheme>(
    moodThemes.neutral,
  );
  const { moodEntries, journalEntries } = useData();

  useEffect(() => {
    // Get the most recent mood data
    const recentMood = moodEntries[0];
    const recentJournal = journalEntries[0];

    if (!recentMood && !recentJournal) {
      setCurrentTheme(moodThemes.neutral);
      return;
    }

    let dominantEmotion = "neutral";

    // Determine emotion from recent mood entry
    if (recentMood) {
      if (recentMood.rating >= 8) dominantEmotion = "happy";
      else if (recentMood.rating <= 3) dominantEmotion = "sad";
      else if (recentMood.rating >= 7) dominantEmotion = "calm";
      else if (recentMood.rating <= 4) dominantEmotion = "anxious";

      // Check for specific mood types
      if (recentMood.mood.toLowerCase().includes("excited"))
        dominantEmotion = "excited";
      if (recentMood.mood.toLowerCase().includes("angry"))
        dominantEmotion = "angry";
      if (recentMood.mood.toLowerCase().includes("anxious"))
        dominantEmotion = "anxious";
      if (recentMood.mood.toLowerCase().includes("calm"))
        dominantEmotion = "calm";
    }

    // Consider journal sentiment as well
    if (recentJournal) {
      const journalDate = new Date(recentJournal.date);
      const today = new Date();
      const isToday =
        journalDate.toDateString() === today.toDateString() ||
        (today.getTime() - journalDate.getTime()) / (1000 * 60 * 60 * 24) < 1;

      if (isToday) {
        if (recentJournal.sentiment === "positive" && !recentMood) {
          dominantEmotion = "happy";
        } else if (recentJournal.sentiment === "negative" && !recentMood) {
          dominantEmotion = "sad";
        }
      }
    }

    const newTheme = moodThemes[dominantEmotion] || moodThemes.neutral;
    setCurrentTheme(newTheme);
  }, [moodEntries, journalEntries]);

  const setTheme = (emotion: string) => {
    const theme = moodThemes[emotion] || moodThemes.neutral;
    setCurrentTheme(theme);
  };

  return {
    currentTheme,
    setTheme,
    availableThemes: moodThemes,
  };
}
