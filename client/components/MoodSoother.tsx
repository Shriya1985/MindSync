import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Waves,
  Cloud,
  TreePine,
  Flame,
  Bird,
  Sun,
  Moon,
  Coffee,
  Wind,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AmbientSound = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  audioUrl: string; // In real app, these would be actual audio files
  mood: "calm" | "focused" | "energetic" | "sleepy";
};

type VisualScene = {
  id: string;
  name: string;
  description: string;
  gradient: string;
  particles?: "rain" | "snow" | "stars" | "leaves";
  animation: string;
  mood: "calm" | "peaceful" | "energetic" | "cozy";
};

const ambientSounds: AmbientSound[] = [
  {
    id: "ocean-waves",
    name: "Ocean Waves",
    description: "Gentle waves lapping against the shore",
    icon: Waves,
    color: "from-blue-400 to-cyan-500",
    audioUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav",
    mood: "calm",
  },
  {
    id: "rain-forest",
    name: "Forest Rain",
    description: "Soft raindrops in a lush forest",
    icon: TreePine,
    color: "from-green-400 to-emerald-500",
    audioUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav",
    mood: "calm",
  },
  {
    id: "thunderstorm",
    name: "Distant Thunder",
    description: "Gentle thunderstorm far away",
    icon: Cloud,
    color: "from-gray-400 to-slate-500",
    audioUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/ImperialMarch60.wav",
    mood: "calm",
  },
  {
    id: "crackling-fire",
    name: "Cozy Fireplace",
    description: "Warm crackling fireplace",
    icon: Flame,
    color: "from-orange-400 to-red-500",
    audioUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav",
    mood: "cozy",
  },
  {
    id: "birds-chirping",
    name: "Morning Birds",
    description: "Cheerful birds singing at dawn",
    icon: Bird,
    color: "from-yellow-400 to-orange-500",
    audioUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther60.wav",
    mood: "energetic",
  },
  {
    id: "white-noise",
    name: "White Noise",
    description: "Consistent background noise for focus",
    icon: Wind,
    color: "from-purple-400 to-indigo-500",
    audioUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav",
    mood: "focused",
  },
  {
    id: "cafe-ambience",
    name: "Café Ambience",
    description: "Bustling coffee shop atmosphere",
    icon: Coffee,
    color: "from-amber-400 to-brown-500",
    audioUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/gettysburg10.wav",
    mood: "focused",
  },
  {
    id: "night-sounds",
    name: "Peaceful Night",
    description: "Gentle evening crickets and breeze",
    icon: Moon,
    color: "from-indigo-400 to-purple-500",
    audioUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav",
    mood: "sleepy",
  },
];

const visualScenes: VisualScene[] = [
  {
    id: "ocean-sunset",
    name: "Ocean Sunset",
    description: "Peaceful sunset over calm waters",
    gradient: "from-orange-300 via-pink-300 to-purple-400",
    particles: "stars",
    animation: "gentle-waves",
    mood: "peaceful",
  },
  {
    id: "forest-clearing",
    name: "Forest Clearing",
    description: "Sunlight filtering through trees",
    gradient: "from-green-200 via-emerald-300 to-teal-400",
    particles: "leaves",
    animation: "swaying-trees",
    mood: "calm",
  },
  {
    id: "starry-night",
    name: "Starry Night",
    description: "Twinkling stars in the night sky",
    gradient: "from-indigo-900 via-purple-800 to-blue-900",
    particles: "stars",
    animation: "twinkling",
    mood: "peaceful",
  },
  {
    id: "cozy-cabin",
    name: "Cozy Cabin",
    description: "Warm firelight in a mountain cabin",
    gradient: "from-orange-200 via-amber-300 to-yellow-400",
    particles: "leaves",
    animation: "firelight-flicker",
    mood: "calm",
  },
  {
    id: "spring-meadow",
    name: "Spring Meadow",
    description: "Blooming flowers in a sunny field",
    gradient: "from-yellow-200 via-green-200 to-blue-200",
    particles: "leaves",
    animation: "flower-sway",
    mood: "energetic",
  },
];

export function MoodSoother() {
  const [selectedSound, setSelectedSound] = useState<AmbientSound | null>(null);
  const [selectedScene, setSelectedScene] = useState<VisualScene | null>(
    visualScenes[0],
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [sessionTime, setSessionTime] = useState(0);
  const [showParticles, setShowParticles] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { moodEntries } = useData();

  // Update audio source and volume when sound or volume changes
  useEffect(() => {
    if (audioRef.current && selectedSound) {
      audioRef.current.src = selectedSound.audioUrl;
      audioRef.current.loop = true;
      audioRef.current.volume = volume[0] / 100;
    }
  }, [selectedSound, volume]);

  useEffect(() => {
    // Auto-select scene and sound based on recent mood
    const recentMood = moodEntries[0];
    if (recentMood) {
      if (recentMood.rating <= 4) {
        // Low mood - calming sounds and visuals
        setSelectedSound(ambientSounds.find((s) => s.id === "ocean-waves")!);
        setSelectedScene(visualScenes.find((s) => s.id === "ocean-sunset")!);
      } else if (recentMood.rating >= 8) {
        // High mood - energetic
        setSelectedSound(ambientSounds.find((s) => s.id === "forest-birds")!);
        setSelectedScene(visualScenes.find((s) => s.id === "spring-meadow")!);
      } else {
        // Neutral mood - peaceful
        setSelectedSound(ambientSounds.find((s) => s.id === "forest-rain")!);
        setSelectedScene(visualScenes.find((s) => s.id === "forest-clearing")!);
      }
    }
  }, [moodEntries]);

  const togglePlayback = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.warn(
          "Audio playback failed, generating synthetic sound:",
          error,
        );
        // Fallback: Generate synthetic ambient sound using Web Audio API
        generateAmbientSound();
      });
    }
    setIsPlaying(true);

    // Start session timer
    intervalRef.current = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);
  };

  // Generate synthetic ambient sound using Web Audio API
  const generateAmbientSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Create a gentle, ambient sound
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // Low A note

      // Gentle volume
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

      oscillator.start();

      // Clean up after session
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 30000); // 30 seconds
    } catch (error) {
      console.warn("Web Audio API not available:", error);
      // Ultimate fallback - visual feedback only
      showNotification({
        type: "encouragement",
        title: "🎵 Visual Mode",
        message: "Audio not available, enjoy the visual experience!",
        duration: 3000,
      });
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetSession = () => {
    pauseAudio();
    setSessionTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const ParticleSystem = ({ type }: { type: string }) => {
    if (!showParticles || !type) return null;

    const particles = Array.from({ length: 20 }, (_, i) => (
      <div
        key={i}
        className={cn(
          "absolute opacity-70 animate-pulse",
          type === "stars" && "w-1 h-1 bg-white rounded-full",
          type === "leaves" && "w-2 h-2 bg-green-300 rounded-full",
          type === "rain" && "w-px h-4 bg-blue-300",
        )}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 2}s`,
        }}
      />
    ));

    return <div className="absolute inset-0 overflow-hidden">{particles}</div>;
  };

  const InteractiveElement = ({ x, y }: { x: number; y: number }) => (
    <div
      className="absolute w-4 h-4 bg-white/30 rounded-full animate-ping"
      style={{ left: x - 8, top: y - 8 }}
    />
  );

  const [ripples, setRipples] = useState<
    { x: number; y: number; id: number }[]
  >([]);

  const handleSceneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Visual Scene */}
      <Card className="shadow-xl border-0 overflow-hidden bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sun className="w-5 h-5 text-yellow-600" />
            <span>Mood Soother</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Interactive visuals and ambient sounds to calm your mind
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {/* Main Visual Area */}
          <div
            className={cn(
              "relative h-64 bg-gradient-to-br cursor-pointer transition-all duration-1000",
              selectedScene?.gradient || "from-mint-200 to-sky-300",
            )}
            onClick={handleSceneClick}
          >
            {/* Particle System */}
            <ParticleSystem type={selectedScene?.particles || ""} />

            {/* Interactive Ripples */}
            {ripples.map((ripple) => (
              <InteractiveElement key={ripple.id} x={ripple.x} y={ripple.y} />
            ))}

            {/* Scene Info Overlay */}
            <div className="absolute bottom-4 left-4 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <h4 className="text-white font-semibold text-sm">
                {selectedScene?.name}
              </h4>
              <p className="text-white/80 text-xs">
                {selectedScene?.description}
              </p>
            </div>

            {/* Controls Overlay */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowParticles(!showParticles);
                }}
                variant="ghost"
                size="sm"
                className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/30"
              >
                {showParticles ? "Hide Effects" : "Show Effects"}
              </Button>
            </div>

            {/* Session Timer */}
            {sessionTime > 0 && (
              <div className="absolute bottom-4 right-4 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2">
                <span className="text-white text-sm font-mono">
                  {formatTime(sessionTime)}
                </span>
              </div>
            )}
          </div>

          {/* Scene Selection */}
          <div className="p-4 border-t border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-3">Visual Scenes</h5>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {visualScenes.map((scene) => (
                <Button
                  key={scene.id}
                  onClick={() => setSelectedScene(scene)}
                  variant={
                    selectedScene?.id === scene.id ? "default" : "outline"
                  }
                  size="sm"
                  className={cn(
                    "h-auto p-2 flex flex-col space-y-1",
                    selectedScene?.id === scene.id &&
                      "bg-mint-500 hover:bg-mint-600",
                  )}
                >
                  <span className="text-xs font-medium">{scene.name}</span>
                  <Badge className="text-xs" variant="secondary">
                    {scene.mood}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ambient Sounds */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-purple-600" />
            <span>Ambient Sounds</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Currently Playing */}
            {selectedSound && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r ${selectedSound.color}`}
                    >
                      <selectedSound.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {selectedSound.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {selectedSound.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button onClick={resetSession} variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={togglePlayback}
                      className={`bg-gradient-to-r ${selectedSound.color} hover:opacity-90 text-white`}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Volume Control */}
                <div className="flex items-center space-x-3">
                  <VolumeX className="w-4 h-4 text-gray-500" />
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Volume2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500 w-8">
                    {volume[0]}%
                  </span>
                </div>
              </div>
            )}

            {/* Sound Selection Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ambientSounds.map((sound) => {
                const IconComponent = sound.icon;
                return (
                  <Button
                    key={sound.id}
                    onClick={() => setSelectedSound(sound)}
                    variant={
                      selectedSound?.id === sound.id ? "default" : "outline"
                    }
                    className={cn(
                      "h-auto p-3 flex flex-col space-y-2",
                      selectedSound?.id === sound.id &&
                        "bg-mint-500 hover:bg-mint-600",
                    )}
                  >
                    <IconComponent className="w-6 h-6" />
                    <span className="text-xs font-medium text-center">
                      {sound.name}
                    </span>
                    <Badge className="text-xs" variant="secondary">
                      {sound.mood}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            {/* Tips */}
            <div className="p-3 bg-mint-50 rounded-lg border border-mint-200">
              <p className="text-sm text-mint-700">
                <strong>💡 Tip:</strong> Click anywhere on the visual scene to
                create calming ripple effects. Combine sounds and visuals that
                match your current mood for the best experience.
              </p>
            </div>
          </div>
        </CardContent>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          loop
          preload="metadata"
          style={{ display: "none" }}
          onLoadedData={() => {
            if (audioRef.current) {
              audioRef.current.volume = volume[0] / 100;
            }
          }}
          onError={(e) => {
            console.warn("Audio loading failed:", e);
            showNotification({
              type: "encouragement",
              title: "🎵 Visual Mode",
              message: "Audio not available, enjoy the visual experience!",
              duration: 3000,
            });
          }}
          onCanPlay={() => {
            console.log("Audio ready to play");
          }}
        />
      </Card>
    </div>
  );
}
