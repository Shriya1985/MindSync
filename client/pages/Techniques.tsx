import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useData } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import { useMoodTheme } from "@/hooks/useMoodTheme";
import {
  analyzeEmotionalState,
  getCopingStrategies,
  type CopingStrategy,
} from "@/utils/emotionAI";
import {
  Heart,
  Wind,
  Brain,
  Activity,
  Palette,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Star,
  Sparkles,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons = {
  breathing: Wind,
  grounding: Heart,
  cognitive: Brain,
  physical: Activity,
  creative: Palette,
};

const categoryColors = {
  breathing: "from-cyan-500 to-blue-500",
  grounding: "from-emerald-500 to-teal-500",
  cognitive: "from-purple-500 to-violet-500",
  physical: "from-orange-500 to-red-500",
  creative: "from-pink-500 to-rose-500",
};

export default function Techniques() {
  const [selectedStrategy, setSelectedStrategy] =
    useState<CopingStrategy | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [completedStrategies, setCompletedStrategies] = useState<Set<string>>(
    new Set(),
  );

  const { moodEntries, journalEntries, addPoints } = useData();
  const { currentTheme } = useMoodTheme();

  // Analyze current emotional state to recommend strategies
  const currentEmotionalState = analyzeEmotionalState(
    "Current state analysis",
    moodEntries.slice(0, 5),
    journalEntries.slice(0, 3),
  );

  const recommendedStrategies = getCopingStrategies(
    currentEmotionalState.primary,
    currentEmotionalState.intensity,
  );

  // Get all available strategies for browsing
  const allStrategies = [
    ...getCopingStrategies("anxiety", 8),
    ...getCopingStrategies("depression", 8),
    ...getCopingStrategies("anger", 8),
  ].filter(
    (strategy, index, self) =>
      index === self.findIndex((s) => s.id === strategy.id),
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && selectedStrategy) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, selectedStrategy]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startStrategy = (strategy: CopingStrategy) => {
    setSelectedStrategy(strategy);
    setCurrentStep(0);
    setTimer(0);
    setIsActive(false);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    if (!isActive) {
      showNotification({
        type: "encouragement",
        title: "Practice Started! 🌟",
        message: `You're taking a meaningful step toward wellness. Take your time with each step.`,
        duration: 3000,
      });
    }
  };

  const nextStep = () => {
    if (selectedStrategy && currentStep < selectedStrategy.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeStrategy = () => {
    if (!selectedStrategy) return;

    const newCompletedStrategies = new Set(completedStrategies);
    newCompletedStrategies.add(selectedStrategy.id);
    setCompletedStrategies(newCompletedStrategies);

    // Award points based on strategy difficulty
    const pointsMap = { easy: 10, medium: 20, hard: 30 };
    const points =
      pointsMap[
        selectedStrategy.steps.length > 4
          ? "hard"
          : selectedStrategy.steps.length > 2
            ? "medium"
            : "easy"
      ];

    addPoints(points, "Completed coping strategy");

    showNotification({
      type: "achievement",
      title: "Strategy Completed! 🎉",
      message: `Wonderful! You've completed "${selectedStrategy.title}" and earned ${points} points. How do you feel now?`,
      duration: 5000,
    });

    setSelectedStrategy(null);
    setIsActive(false);
    setTimer(0);
    setCurrentStep(0);
  };

  const StrategyCard = ({ strategy }: { strategy: CopingStrategy }) => {
    const IconComponent = categoryIcons[strategy.category];
    const isCompleted = completedStrategies.has(strategy.id);

    return (
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
          isCompleted && "ring-2 ring-green-200 bg-green-50/50",
        )}
        onClick={() => startStrategy(strategy)}
      >
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r",
                categoryColors[strategy.category],
              )}
            >
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">
                  {strategy.title}
                </h3>
                {isCompleted && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {strategy.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="text-xs">
                    {strategy.icon} {strategy.category}
                  </Badge>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {strategy.duration}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  {isCompleted ? "Practice Again" : "Start"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`min-h-screen ${currentTheme.background}`}>
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-mint-500 to-sky-500 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Coping Techniques
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Practice evidence-based techniques to manage your emotions and build
            resilience. Take your time with each exercise and remember - every
            step counts.
          </p>
        </div>

        {/* Current Emotional State */}
        <Card className="mb-8 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Personalized Recommendations
              </h2>
              <Badge variant="outline" className="text-sm">
                Based on your recent activity
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Primary Emotion
                  </p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {currentEmotionalState.primary}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Intensity</p>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={currentEmotionalState.intensity * 10}
                      className="w-16"
                    />
                    <span className="text-sm font-medium">
                      {currentEmotionalState.intensity}/10
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Practice Session */}
        {selectedStrategy && (
          <Card className="mb-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r",
                      categoryColors[selectedStrategy.category],
                    )}
                  >
                    <span className="text-lg">{selectedStrategy.icon}</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {selectedStrategy.title}
                    </CardTitle>
                    <p className="text-gray-600">
                      {selectedStrategy.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedStrategy(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Timer and Controls */}
                <div className="lg:col-span-1">
                  <Card className="bg-gray-50 border-0">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {formatTime(timer)}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Session time</p>
                      <div className="space-y-2">
                        <Button
                          onClick={toggleTimer}
                          className="w-full bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600"
                        >
                          {isActive ? (
                            <Pause className="w-4 h-4 mr-2" />
                          ) : (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          {isActive ? "Pause" : "Start Timer"}
                        </Button>
                        <Button
                          onClick={completeStrategy}
                          variant="outline"
                          className="w-full"
                        >
                          <Award className="w-4 h-4 mr-2" />
                          Mark Complete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Steps */}
                <div className="lg:col-span-2">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        Step {currentStep + 1} of{" "}
                        {selectedStrategy.steps.length}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {Math.round(
                          ((currentStep + 1) / selectedStrategy.steps.length) *
                            100,
                        )}
                        % complete
                      </div>
                    </div>
                    <Progress
                      value={
                        ((currentStep + 1) / selectedStrategy.steps.length) *
                        100
                      }
                      className="mb-4"
                    />
                  </div>

                  <Card className="bg-blue-50 border-blue-200 mb-4">
                    <CardContent className="p-6">
                      <p className="text-blue-900 leading-relaxed text-lg">
                        {selectedStrategy.steps[currentStep]}
                      </p>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button
                      onClick={previousStep}
                      disabled={currentStep === 0}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={nextStep}
                      disabled={
                        currentStep === selectedStrategy.steps.length - 1
                      }
                      className="bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommended Techniques */}
        {!selectedStrategy && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Recommended for You
              </h2>
              <p className="text-gray-600">
                Based on your current emotional state and recent activity
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {recommendedStrategies.map((strategy) => (
                <StrategyCard key={strategy.id} strategy={strategy} />
              ))}
            </div>

            {/* All Techniques */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                All Techniques
              </h2>
              <p className="text-gray-600">
                Explore our complete library of coping strategies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allStrategies.map((strategy) => (
                <StrategyCard key={strategy.id} strategy={strategy} />
              ))}
            </div>
          </>
        )}

        {/* Progress Summary */}
        {completedStrategies.size > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Great Progress!
                  </h3>
                  <p className="text-gray-600">
                    You've completed {completedStrategies.size} coping
                    techniques. Every practice session builds your emotional
                    resilience.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
