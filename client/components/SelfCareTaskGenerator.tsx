import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import {
  RefreshCw,
  Heart,
  Sparkles,
  Clock,
  Zap,
  Coffee,
  Music,
  TreePine,
  Droplets,
  Smile,
  Star,
  Sun,
  Wind,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SelfCareTask = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: "physical" | "mental" | "emotional" | "social" | "spiritual";
  duration: string;
  difficulty: "easy" | "medium" | "hard";
  color: string;
};

const selfCareTasks: SelfCareTask[] = [
  {
    id: "drink-water",
    title: "Drink a Glass of Water",
    description: "Hydrate your body and refresh your mind",
    icon: Droplets,
    category: "physical",
    duration: "1 min",
    difficulty: "easy",
    color: "from-blue-400 to-cyan-500",
  },
  {
    id: "deep-breaths",
    title: "Take 5 Deep Breaths",
    description: "Center yourself with mindful breathing",
    icon: Wind,
    category: "mental",
    duration: "2 min",
    difficulty: "easy",
    color: "from-green-400 to-emerald-500",
  },
  {
    id: "favorite-song",
    title: "Listen to Your Favorite Song",
    description: "Let music lift your spirits",
    icon: Music,
    category: "emotional",
    duration: "3-4 min",
    difficulty: "easy",
    color: "from-purple-400 to-pink-500",
  },
  {
    id: "stretch",
    title: "Do a Quick Stretch",
    description: "Release tension in your body",
    icon: Zap,
    category: "physical",
    duration: "3 min",
    difficulty: "easy",
    color: "from-orange-400 to-red-500",
  },
  {
    id: "gratitude",
    title: "Think of 3 Things You're Grateful For",
    description: "Shift your focus to positive moments",
    icon: Heart,
    category: "emotional",
    duration: "2 min",
    difficulty: "easy",
    color: "from-pink-400 to-rose-500",
  },
  {
    id: "smile",
    title: "Smile at Yourself in the Mirror",
    description: "Show yourself some kindness",
    icon: Smile,
    category: "emotional",
    duration: "1 min",
    difficulty: "easy",
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: "nature-glance",
    title: "Look Outside for 2 Minutes",
    description: "Connect with nature, even briefly",
    icon: TreePine,
    category: "mental",
    duration: "2 min",
    difficulty: "easy",
    color: "from-green-500 to-teal-500",
  },
  {
    id: "coffee-tea",
    title: "Make Your Favorite Warm Drink",
    description: "Create a moment of comfort",
    icon: Coffee,
    category: "physical",
    duration: "5 min",
    difficulty: "easy",
    color: "from-amber-400 to-brown-500",
  },
  {
    id: "text-friend",
    title: "Send a Kind Message to Someone",
    description: "Spread positivity and connect",
    icon: Heart,
    category: "social",
    duration: "3 min",
    difficulty: "medium",
    color: "from-indigo-400 to-purple-500",
  },
  {
    id: "tidy-space",
    title: "Organize One Small Area",
    description: "Clear space, clear mind",
    icon: Sparkles,
    category: "mental",
    duration: "5 min",
    difficulty: "medium",
    color: "from-mint-400 to-sky-500",
  },
  {
    id: "positive-affirmation",
    title: "Say a Positive Affirmation",
    description: "Remind yourself of your worth",
    icon: Star,
    category: "emotional",
    duration: "1 min",
    difficulty: "easy",
    color: "from-violet-400 to-purple-500",
  },
  {
    id: "wash-face",
    title: "Splash Cool Water on Your Face",
    description: "Refresh and reset your energy",
    icon: Droplets,
    category: "physical",
    duration: "2 min",
    difficulty: "easy",
    color: "from-cyan-400 to-blue-500",
  },
];

export function SelfCareTaskGenerator() {
  const [currentTask, setCurrentTask] = useState<SelfCareTask | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [spinRotation, setSpinRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const { addPoints } = useData();

  const generateNewTask = () => {
    if (isSpinning) return;

    setIsSpinning(true);

    // Animated spinning effect
    const spinDuration = 2000;
    const finalRotation = spinRotation + 720 + Math.random() * 360;
    setSpinRotation(finalRotation);

    setTimeout(() => {
      const randomTask =
        selfCareTasks[Math.floor(Math.random() * selfCareTasks.length)];
      setCurrentTask(randomTask);
      setIsSpinning(false);

      showNotification({
        type: "encouragement",
        title: "New Self-Care Task! ✨",
        message: `Try this: ${randomTask.title}`,
        duration: 4000,
      });
    }, spinDuration);
  };

  const completeTask = async () => {
    if (!currentTask) return;

    setCompletedTasks((prev) => [...prev, currentTask.id]);
    await addPoints(10, `Completed self-care task: ${currentTask.title}`);

    showNotification({
      type: "achievement",
      title: "Task Completed! 🎉",
      message: `Great job! You earned 10 points for taking care of yourself.`,
      duration: 4000,
    });

    // Generate a new task after completing one
    setTimeout(() => {
      generateNewTask();
    }, 1500);
  };

  // Auto-generate first task on mount
  useEffect(() => {
    if (!currentTask) {
      generateNewTask();
    }
  }, []);

  const getTasksByCategory = (category: string) => {
    return selfCareTasks.filter((task) => task.category === category);
  };

  const categoryColors = {
    physical: "from-orange-500 to-red-500",
    mental: "from-green-500 to-emerald-500",
    emotional: "from-pink-500 to-rose-500",
    social: "from-indigo-500 to-purple-500",
    spiritual: "from-violet-500 to-purple-500",
  };

  const categoryIcons = {
    physical: Zap,
    mental: Sun,
    emotional: Heart,
    social: Smile,
    spiritual: Star,
  };

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Sparkles className="w-6 h-6 text-mint-600" />
          <span>Self-Care Task Generator</span>
        </CardTitle>
        <p className="text-gray-600">
          Discover quick self-care activities to brighten your day
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Spinning Wheel Visual */}
        <div className="flex justify-center">
          <div className="relative">
            <div
              ref={wheelRef}
              className={cn(
                "w-48 h-48 rounded-full border-8 border-gradient-to-r from-mint-500 to-sky-500 relative overflow-hidden transition-transform duration-2000 ease-out",
                isSpinning && "animate-spin",
              )}
              style={{
                transform: `rotate(${spinRotation}deg)`,
                background: `conic-gradient(${selfCareTasks
                  .map((task, index) => {
                    const angle = (360 / selfCareTasks.length) * index;
                    return `${task.color.split(" ")[1]} ${angle}deg ${angle + 360 / selfCareTasks.length}deg`;
                  })
                  .join(", ")})`,
              }}
            >
              {/* Wheel segments */}
              {selfCareTasks.map((task, index) => {
                const angle = (360 / selfCareTasks.length) * index;
                const IconComponent = task.icon;
                return (
                  <div
                    key={task.id}
                    className="absolute w-6 h-6 flex items-center justify-center text-white"
                    style={{
                      transform: `rotate(${angle + 15}deg) translateY(-80px)`,
                      transformOrigin: "center 80px",
                    }}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                );
              })}

              {/* Center circle */}
              <div className="absolute inset-0 m-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <RefreshCw
                  className={cn(
                    "w-8 h-8 text-mint-600",
                    isSpinning && "animate-spin",
                  )}
                />
              </div>
            </div>

            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-4 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-b-full shadow-lg"></div>
            </div>
          </div>
        </div>

        {/* Current Task Display */}
        {currentTask && !isSpinning && (
          <Card
            className={cn(
              "bg-gradient-to-r p-6 text-white shadow-lg",
              currentTask.color,
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <currentTask.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{currentTask.title}</h3>
                  <p className="text-white/90">{currentTask.description}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-white/20 text-white border-white/30 mb-1">
                  {currentTask.category}
                </Badge>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{currentTask.duration}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={completeTask}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                ✓ Mark Complete
              </Button>
              <Button
                onClick={generateNewTask}
                disabled={isSpinning}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw
                  className={cn("w-4 h-4", isSpinning && "animate-spin")}
                />
              </Button>
            </div>
          </Card>
        )}

        {/* Spin Button */}
        {!isSpinning && (
          <div className="text-center">
            <Button
              onClick={generateNewTask}
              disabled={isSpinning}
              size="lg"
              className="bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600 text-white shadow-lg"
            >
              <RefreshCw
                className={cn("w-5 h-5 mr-2", isSpinning && "animate-spin")}
              />
              {currentTask ? "Spin Again" : "Spin the Wheel"}
            </Button>
          </div>
        )}

        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-mint-600">
              {completedTasks.length}
            </div>
            <div className="text-sm text-gray-600">Tasks Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-sky-600">
              {completedTasks.length * 10}
            </div>
            <div className="text-sm text-gray-600">Points Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {
                new Set(
                  completedTasks.map(
                    (id) => selfCareTasks.find((t) => t.id === id)?.category,
                  ),
                ).size
              }
            </div>
            <div className="text-sm text-gray-600">Categories Tried</div>
          </div>
        </div>

        {/* Quick Category Buttons */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Browse by Category:</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(categoryColors).map(([category, color]) => {
              const IconComponent =
                categoryIcons[category as keyof typeof categoryIcons];
              const taskCount = getTasksByCategory(category).length;

              return (
                <Button
                  key={category}
                  onClick={() => {
                    const categoryTasks = getTasksByCategory(category);
                    const randomTask =
                      categoryTasks[
                        Math.floor(Math.random() * categoryTasks.length)
                      ];
                    setCurrentTask(randomTask);
                  }}
                  variant="outline"
                  size="sm"
                  className="h-auto p-3 flex flex-col space-y-1 hover:shadow-md"
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-xs font-medium capitalize">
                    {category}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {taskCount}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Motivation */}
        <div className="p-4 bg-gradient-to-r from-mint-50 to-sky-50 rounded-lg border border-mint-200 text-center">
          <p className="text-sm text-mint-700">
            <strong>💚 Remember:</strong> Small acts of self-care create big
            changes. Every moment you spend caring for yourself matters!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
