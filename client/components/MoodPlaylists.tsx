import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import {
  Music,
  ExternalLink,
  RefreshCw,
  Heart,
  Zap,
  Cloud,
  Sun,
  Moon,
  Coffee,
  Headphones,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MoodPlaylist = {
  id: string;
  name: string;
  description: string;
  mood: string;
  genre: string;
  platform: "spotify" | "youtube" | "apple";
  url: string;
  artist?: string;
  duration: string;
  tracks: number;
  icon: React.ComponentType<any>;
  color: string;
};

const moodPlaylists: Record<string, MoodPlaylist[]> = {
  happy: [
    {
      id: "happy-vibes",
      name: "Feel Good Favorites",
      description: "Uplifting songs to boost your mood",
      mood: "happy",
      genre: "Pop",
      platform: "spotify",
      url: "https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd",
      duration: "2h 30m",
      tracks: 50,
      icon: Sun,
      color: "from-yellow-400 to-orange-500",
    },
    {
      id: "energy-boost",
      name: "Energy Boost",
      description: "High-energy tracks to get you moving",
      mood: "happy",
      genre: "Dance",
      platform: "youtube",
      url: "https://youtube.com/playlist?list=PLrJDpYKmGSKUDLV-MdU4z01ufYFUphwTd",
      duration: "1h 45m",
      tracks: 35,
      icon: Zap,
      color: "from-orange-400 to-red-500",
    },
  ],
  sad: [
    {
      id: "gentle-comfort",
      name: "Gentle Comfort",
      description: "Soothing melodies for when you need care",
      mood: "sad",
      genre: "Indie",
      platform: "spotify",
      url: "https://open.spotify.com/playlist/37i9dQZF1DWX83CujKHHOn",
      duration: "1h 20m",
      tracks: 25,
      icon: Cloud,
      color: "from-blue-400 to-indigo-500",
    },
    {
      id: "healing-sounds",
      name: "Healing Sounds",
      description: "Peaceful music for emotional healing",
      mood: "sad",
      genre: "Ambient",
      platform: "youtube",
      url: "https://youtube.com/playlist?list=PLrJDpYKmGSKUDLV-MdU4z01ufYFUphwTd",
      duration: "2h 10m",
      tracks: 30,
      icon: Heart,
      color: "from-purple-400 to-pink-500",
    },
  ],
  anxious: [
    {
      id: "calm-focus",
      name: "Calm & Focus",
      description: "Peaceful instrumentals to center your mind",
      mood: "anxious",
      genre: "Classical",
      platform: "spotify",
      url: "https://open.spotify.com/playlist/37i9dQZF1DWZd79rJ6a7lp",
      duration: "3h 15m",
      tracks: 60,
      icon: Headphones,
      color: "from-green-400 to-teal-500",
    },
    {
      id: "breathing-space",
      name: "Breathing Space",
      description: "Gentle sounds for anxiety relief",
      mood: "anxious",
      genre: "Nature",
      platform: "youtube",
      url: "https://youtube.com/playlist?list=PLrJDpYKmGSKUDLV-MdU4z01ufYFUphwTd",
      duration: "2h 0m",
      tracks: 20,
      icon: Cloud,
      color: "from-cyan-400 to-blue-500",
    },
  ],
  calm: [
    {
      id: "peaceful-moments",
      name: "Peaceful Moments",
      description: "Serene music for quiet reflection",
      mood: "calm",
      genre: "Acoustic",
      platform: "spotify",
      url: "https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u",
      duration: "1h 50m",
      tracks: 28,
      icon: Moon,
      color: "from-indigo-400 to-purple-500",
    },
    {
      id: "coffee-shop",
      name: "Coffee Shop Vibes",
      description: "Cozy background music for relaxation",
      mood: "calm",
      genre: "Lo-Fi",
      platform: "youtube",
      url: "https://youtube.com/playlist?list=PLrJDpYKmGSKUDLV-MdU4z01ufYFUphwTd",
      duration: "4h 0m",
      tracks: 80,
      icon: Coffee,
      color: "from-amber-400 to-orange-500",
    },
  ],
  focused: [
    {
      id: "deep-focus",
      name: "Deep Focus",
      description: "Instrumental music for concentration",
      mood: "focused",
      genre: "Electronic",
      platform: "spotify",
      url: "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn",
      duration: "2h 45m",
      tracks: 45,
      icon: Zap,
      color: "from-purple-400 to-indigo-500",
    },
    {
      id: "study-beats",
      name: "Study Beats",
      description: "Lo-fi hip hop for productivity",
      mood: "focused",
      genre: "Lo-Fi Hip Hop",
      platform: "youtube",
      url: "https://youtube.com/playlist?list=PLrJDpYKmGSKUDLV-MdU4z01ufYFUphwTd",
      duration: "6h 0m",
      tracks: 100,
      icon: Coffee,
      color: "from-green-400 to-blue-500",
    },
  ],
};

export function MoodPlaylists() {
  const [selectedMood, setSelectedMood] = useState<string>("calm");
  const [currentPlaylists, setCurrentPlaylists] = useState<MoodPlaylist[]>([]);
  const { moodEntries, journalEntries } = useData();

  useEffect(() => {
    // Auto-detect mood from recent entries
    const recentMood = moodEntries[0];
    const recentJournal = journalEntries[0];

    let detectedMood = "calm";

    if (recentMood) {
      if (recentMood.rating >= 8) detectedMood = "happy";
      else if (recentMood.rating <= 3) detectedMood = "sad";
      else if (recentMood.rating <= 4) detectedMood = "anxious";
      else if (recentMood.rating >= 7) detectedMood = "calm";

      // Check specific mood keywords
      const moodLower = recentMood.mood.toLowerCase();
      if (moodLower.includes("anxious") || moodLower.includes("worried"))
        detectedMood = "anxious";
      if (moodLower.includes("happy") || moodLower.includes("excited"))
        detectedMood = "happy";
      if (moodLower.includes("sad") || moodLower.includes("down"))
        detectedMood = "sad";
      if (moodLower.includes("focused") || moodLower.includes("motivated"))
        detectedMood = "focused";
    }

    if (
      recentJournal &&
      (!recentMood || new Date(recentJournal.date) > new Date(recentMood.date))
    ) {
      if (recentJournal.sentiment === "positive") detectedMood = "happy";
      else if (recentJournal.sentiment === "negative") detectedMood = "sad";
    }

    setSelectedMood(detectedMood);
    setCurrentPlaylists(moodPlaylists[detectedMood] || moodPlaylists.calm);
  }, [moodEntries, journalEntries]);

  const handleMoodChange = (mood: string) => {
    setSelectedMood(mood);
    setCurrentPlaylists(moodPlaylists[mood] || []);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "spotify":
        return "🎵";
      case "youtube":
        return "▶️";
      case "apple":
        return "🍎";
      default:
        return "🎵";
    }
  };

  const openPlaylist = (playlist: MoodPlaylist) => {
    window.open(playlist.url, "_blank");
  };

  const moodOptions = [
    { id: "happy", label: "Happy", icon: Sun, color: "text-yellow-600" },
    { id: "calm", label: "Calm", icon: Moon, color: "text-indigo-600" },
    { id: "sad", label: "Sad", icon: Cloud, color: "text-blue-600" },
    { id: "anxious", label: "Anxious", icon: Heart, color: "text-green-600" },
    { id: "focused", label: "Focused", icon: Zap, color: "text-purple-600" },
  ];

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Music className="w-5 h-5 text-mint-600" />
          <span>Mood-Based Playlists</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Discover music that matches your current emotional state
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Mood Detection */}
          <div className="p-4 bg-gradient-to-r from-mint-50 to-sky-50 rounded-lg border border-mint-200">
            <div className="flex items-center space-x-2 mb-2">
              <RefreshCw className="w-4 h-4 text-mint-600" />
              <span className="font-semibold text-mint-900">
                Auto-Detected Mood
              </span>
            </div>
            <p className="text-sm text-mint-700">
              Based on your recent entries, we think you're feeling{" "}
              <strong className="capitalize">{selectedMood}</strong>. We've
              curated playlists to match!
            </p>
          </div>

          {/* Mood Selector */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Choose Your Mood
            </h4>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((mood) => {
                const IconComponent = mood.icon;
                return (
                  <Button
                    key={mood.id}
                    onClick={() => handleMoodChange(mood.id)}
                    variant={selectedMood === mood.id ? "default" : "outline"}
                    className={cn(
                      "flex items-center space-x-2",
                      selectedMood === mood.id &&
                        "bg-mint-500 hover:bg-mint-600",
                    )}
                  >
                    <IconComponent className={cn("w-4 h-4", mood.color)} />
                    <span>{mood.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Playlist Grid */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 capitalize">
              {selectedMood} Playlists
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPlaylists.map((playlist) => {
                const IconComponent = playlist.icon;
                return (
                  <Card
                    key={playlist.id}
                    className="border-2 border-gray-200 hover:border-mint-200 transition-all duration-300 hover:shadow-md cursor-pointer group"
                    onClick={() => openPlaylist(playlist)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${playlist.color} group-hover:scale-105 transition-transform`}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="font-semibold text-gray-900">
                              {playlist.name}
                            </h5>
                            <span className="text-lg">
                              {getPlatformIcon(playlist.platform)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                            {playlist.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span>{playlist.tracks} tracks</span>
                              <span>{playlist.duration}</span>
                              <Badge variant="secondary" className="text-xs">
                                {playlist.genre}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={cn(
                              "text-xs capitalize",
                              selectedMood === playlist.mood
                                ? "bg-mint-100 text-mint-700"
                                : "bg-gray-100 text-gray-600",
                            )}
                          >
                            {playlist.mood}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {playlist.platform}
                          </Badge>
                        </div>

                        <Button
                          size="sm"
                          className={`bg-gradient-to-r ${playlist.color} hover:opacity-90 text-white`}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Listen
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Platform Links */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-2">
              Music Platforms
            </h5>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open("https://open.spotify.com", "_blank")
                }
                className="flex items-center space-x-2"
              >
                <span>🎵</span>
                <span>Open Spotify</span>
                <ExternalLink className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://youtube.com", "_blank")}
                className="flex items-center space-x-2"
              >
                <span>▶️</span>
                <span>Open YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://music.apple.com", "_blank")}
                className="flex items-center space-x-2"
              >
                <span>��</span>
                <span>Apple Music</span>
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Tip */}
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-700">
              <strong>💡 Music Therapy Tip:</strong> Music can significantly
              impact your mood. Choose uplifting songs when you want energy, or
              calming melodies when you need to relax. Let the rhythm guide your
              emotions! 🎶
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
