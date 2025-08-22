import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useData } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Clock,
  Heart,
  Wind,
  Leaf,
  Moon,
  Waves,
  Mountain,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MeditationType =
  | "breathing"
  | "mindfulness"
  | "sleep"
  | "anxiety"
  | "focus";

type MeditationSession = {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  type: MeditationType;
  instructor: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  videoUrl?: string;
  audioUrl?: string;
  icon: React.ComponentType<any>;
  color: string;
  script: string[];
};

const meditationSessions: MeditationSession[] = [
  {
    id: "box-breathing",
    title: "4-7-8 Calming Breath",
    description: "A powerful breathing technique to reduce anxiety and stress",
    duration: 5,
    type: "breathing",
    instructor: "MindSync Guide",
    difficulty: "beginner",
    icon: Wind,
    color: "from-cyan-500 to-blue-500",
    script: [
      "Find a comfortable seated position and close your eyes softly",
      "Place one hand on your chest and one on your belly",
      "Inhale slowly through your nose for 4 counts",
      "Hold your breath gently for 7 counts",
      "Exhale completely through your mouth for 8 counts",
      "Notice the calm spreading through your body",
      "Repeat this cycle, letting each breath soothe you deeper",
    ],
  },
  {
    id: "body-scan",
    title: "Progressive Body Scan",
    description: "Release tension and connect with your body mindfully",
    duration: 10,
    type: "mindfulness",
    instructor: "MindSync Guide",
    difficulty: "beginner",
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    script: [
      "Lie down comfortably and let your eyes close naturally",
      "Take three deep, centering breaths",
      "Focus on the top of your head, notice any sensations",
      "Slowly move your attention down to your forehead and eyes",
      "Continue down to your jaw, neck, and shoulders",
      "Notice your arms, hands, and fingers",
      "Breathe into your chest and heart space",
      "Let your attention rest on your stomach and back",
      "Feel your hips, thighs, and knees",
      "Finally, notice your calves, ankles, and feet",
      "Take a moment to feel your whole body at once",
    ],
  },
  {
    id: "anxiety-relief",
    title: "Anxiety Relief Meditation",
    description: "Calm your worried mind with gentle, grounding techniques",
    duration: 8,
    type: "anxiety",
    instructor: "MindSync Guide",
    difficulty: "beginner",
    icon: Leaf,
    color: "from-green-500 to-emerald-500",
    script: [
      "Sit comfortably and take a moment to settle in",
      "Notice that anxiety is just a feeling, temporary and passing",
      "Take a slow, deep breath and say 'I am safe right now'",
      "Feel your feet connected to the ground beneath you",
      "With each exhale, release tension from your shoulders",
      "Imagine roots growing from your body into the earth",
      "You are grounded, supported, and fundamentally okay",
      "Let worries float away like clouds in the sky",
      "Return to the simple rhythm of your breath",
    ],
  },
  {
    id: "sleep-preparation",
    title: "Deep Sleep Journey",
    description: "Prepare your mind and body for restorative sleep",
    duration: 15,
    type: "sleep",
    instructor: "MindSync Guide",
    difficulty: "beginner",
    icon: Moon,
    color: "from-indigo-500 to-purple-500",
    script: [
      "Settle into your bed and make yourself completely comfortable",
      "Let your eyes close and release the day behind you",
      "Take three slow, deep breaths to signal it's time to rest",
      "Starting with your toes, consciously relax each muscle",
      "Let go of any thoughts about tomorrow",
      "Imagine yourself in a peaceful, safe place",
      "Feel gratitude for your body and all it has done today",
      "With each breath, sink deeper into relaxation",
      "Trust that sleep will come naturally as you let go",
      "Allow yourself to drift into peaceful rest",
    ],
  },
  {
    id: "focus-clarity",
    title: "Focus & Mental Clarity",
    description: "Sharpen your attention and clear mental fog",
    duration: 12,
    type: "focus",
    instructor: "MindSync Guide",
    difficulty: "intermediate",
    icon: Sun,
    color: "from-yellow-500 to-orange-500",
    script: [
      "Sit with your spine straight but not rigid",
      "Choose a point of focus - your breath or a gentle sound",
      "When your mind wanders, gently return to your focus point",
      "Notice the space between thoughts",
      "Feel your mental clarity growing stronger",
      "Like training a muscle, each return to focus builds concentration",
      "Breathe energy and alertness into your mind",
      "Feel centered, clear, and ready for whatever comes next",
    ],
  },
];

export function GuidedMeditation() {
  const [selectedSession, setSelectedSession] =
    useState<MeditationSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [showVisualizer, setShowVisualizer] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { addMoodEntry } = useData();

  const startSession = (session: MeditationSession) => {
    setSelectedSession(session);
    setCurrentStep(0);
    setSessionTime(0);
    setIsPlaying(true);

    // Start timer
    intervalRef.current = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);

    showNotification({
      type: "encouragement",
      title: "Meditation Started 🧘",
      message: `Beginning "${session.title}". Find a comfortable position and breathe deeply.`,
      duration: 3000,
    });
  };

  const pauseSession = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resumeSession = () => {
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);
  };

  const endSession = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (selectedSession && sessionTime > 60) {
      // Log as a positive mood entry
      addMoodEntry({
        date: new Date().toISOString().split("T")[0],
        mood: "Calm",
        rating: 8,
        emoji: "���",
        notes: "meditation",
        source: "dashboard",
      });

      showNotification({
        type: "achievement",
        title: "Meditation Complete! ✨",
        message: `Great job! You meditated for ${Math.floor(sessionTime / 60)} minutes. Your mind thanks you.`,
        duration: 5000,
      });
    }

    setSelectedSession(null);
    setSessionTime(0);
    setCurrentStep(0);
  };

  const resetSession = () => {
    pauseSession();
    setCurrentStep(0);
    setSessionTime(0);
  };

  useEffect(() => {
    if (selectedSession && isPlaying && sessionTime > 0) {
      const stepDuration =
        (selectedSession.duration * 60) / selectedSession.script.length;
      const newStep = Math.floor(sessionTime / stepDuration);
      if (newStep < selectedSession.script.length && newStep !== currentStep) {
        setCurrentStep(newStep);
      }

      // Auto-end session when complete
      if (sessionTime >= selectedSession.duration * 60) {
        endSession();
      }
    }
  }, [sessionTime, selectedSession, isPlaying, currentStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    if (!selectedSession) return 0;
    return (sessionTime / (selectedSession.duration * 60)) * 100;
  };

  const BreathingVisualizer = () => {
    if (!selectedSession || selectedSession.type !== "breathing") return null;

    return (
      <div className="flex items-center justify-center py-8">
        <div
          className={cn(
            "w-32 h-32 rounded-full bg-gradient-to-r",
            selectedSession.color,
            "opacity-70 transition-all duration-4000 ease-in-out",
            isPlaying ? "scale-110" : "scale-100",
          )}
          style={{
            animation: isPlaying ? "breathe 8s infinite ease-in-out" : "none",
          }}
        />
        <style>{`
          @keyframes breathe {
            0%,
            100% {
              transform: scale(1);
              opacity: 0.7;
            }
            25% {
              transform: scale(1.2);
              opacity: 1;
            }
            75% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
        `}</style>
      </div>
    );
  };

  if (selectedSession) {
    return (
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${selectedSession.color}`}
              >
                <selectedSession.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {selectedSession.title}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {selectedSession.instructor}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={endSession}
              className="text-gray-500 hover:text-gray-700"
            >
              End Session
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>
                  {formatTime(sessionTime)} / {selectedSession.duration}m
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>

            {/* Breathing Visualizer */}
            <BreathingVisualizer />

            {/* Current Instruction */}
            <div className="text-center p-6 bg-gradient-to-r from-mint-50 to-sky-50 rounded-lg border border-mint-200">
              <h3 className="font-semibold text-gray-900 mb-3">Current Step</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                {selectedSession.script[currentStep] ||
                  "Take a moment to center yourself..."}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button onClick={resetSession} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>

              <Button
                onClick={isPlaying ? pauseSession : resumeSession}
                className={`bg-gradient-to-r ${selectedSession.color} hover:opacity-90 text-white px-8`}
                size="lg"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Resume
                  </>
                )}
              </Button>

              <Button onClick={endSession} variant="outline" size="sm">
                Complete
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-3">
              <Volume2 className="w-4 h-4 text-gray-500" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-8">{volume[0]}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wind className="w-5 h-5 text-mint-600" />
          <span>Guided Meditations</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Choose a guided session to center your mind and find inner peace
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meditationSessions.map((session) => {
            const IconComponent = session.icon;
            return (
              <Card
                key={session.id}
                className="border-2 border-gray-200 hover:border-mint-200 transition-all duration-300 hover:shadow-md cursor-pointer"
                onClick={() => startSession(session)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r ${session.color}`}
                    >
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {session.title}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {session.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                        {session.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{session.duration} min</span>
                        </div>
                        <span className="capitalize">{session.type}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className={`w-full mt-3 bg-gradient-to-r ${session.color} hover:opacity-90 text-white`}
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Session
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
