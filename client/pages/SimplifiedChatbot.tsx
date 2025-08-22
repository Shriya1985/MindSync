import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import {
  MessageCircle,
  Brain,
  Heart,
  Shield,
  Zap,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Minimize2
} from "lucide-react";

export default function SimplifiedChatbot() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastInteraction, setLastInteraction] = useState<Date | null>(null);

  const { userStats, addPoints } = useData();

  useEffect(() => {
    // Simulate loading time for the iframe
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Track user interaction for points
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Listen for messages from the iframe (if your chatbot sends them)
      if (event.origin === "https://buddy-empath-aid.vercel.app") {
        const now = new Date();
        const timeSinceLastInteraction = lastInteraction
          ? now.getTime() - lastInteraction.getTime()
          : 0;

        // Award points for meaningful interactions (every 5 minutes)
        if (timeSinceLastInteraction > 300000 || !lastInteraction) {
          addPoints(10, "Chatbot Interaction", "chatbot");
          setLastInteraction(now);

          showNotification({
            type: "encouragement",
            title: "Great conversation! 💬",
            message: "You earned 10 points for engaging with your AI companion.",
            duration: 3000,
          });
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [lastInteraction, addPoints]);

  const refreshChatbot = () => {
    setIsLoading(true);
    // Force reload the iframe
    const iframe = document.getElementById("chatbot-iframe") as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
    setTimeout(() => setIsLoading(false), 2000);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-sky-50">
      <Navigation />

      <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${
        isFullscreen ? "max-w-full" : "max-w-6xl"
      }`}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-mint-500 to-sky-500 rounded-2xl mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Buddy - Your AI Companion
          </h1>
          <p className="text-gray-600 mb-4">
            Powered by advanced empathetic AI • Share your thoughts in a safe, supportive space
          </p>

          {/* Stats and Controls */}
          <div className="flex justify-center items-center space-x-6 text-sm mb-6">
            <Badge variant="outline" className="bg-mint-100 text-mint-700 border-mint-300">
              Level {userStats.level} • {userStats.points} points
            </Badge>
            <div className="flex space-x-2">
              <Button
                onClick={refreshChatbot}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-mint-400"
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={toggleFullscreen}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-mint-400"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Chatbot Container */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Chatbot Header */}
            <div className="bg-gradient-to-r from-mint-500 to-sky-500 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Buddy Empath Aid</h3>
                    <div className="flex items-center space-x-1 text-sm text-white/80">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span>AI Companion • Always Here for You</span>
                    </div>
                  </div>
                </div>
                <a
                  href="https://buddy-empath-aid.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-mint-500 to-sky-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Loading your AI companion...
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Preparing a personalized wellness experience
                  </p>
                  <div className="flex justify-center mt-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-mint-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-mint-500 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-mint-500 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Embedded Chatbot */}
            <div className="relative">
              <iframe
                id="chatbot-iframe"
                src="https://buddy-empath-aid.vercel.app/"
                className={`w-full border-0 transition-all duration-300 ${
                  isFullscreen ? "h-[80vh]" : "h-[600px]"
                }`}
                title="Buddy - AI Mental Health Companion"
                onLoad={() => setIsLoading(false)}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                allow="microphone; camera; fullscreen"
              />
            </div>
          </CardContent>
        </Card>

        {/* Features Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg">
            <Heart className="w-8 h-8 text-mint-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">Empathetic AI</h4>
            <p className="text-sm text-gray-600">
              Advanced emotional intelligence for meaningful conversations
            </p>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg">
            <Shield className="w-8 h-8 text-sky-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">Privacy Protected</h4>
            <p className="text-sm text-gray-600">
              Your conversations are secure and confidential
            </p>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg">
            <Zap className="w-8 h-8 text-lavender-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">24/7 Available</h4>
            <p className="text-sm text-gray-600">
              Your AI companion is always ready to listen and support
            </p>
          </div>
        </div>

        {/* Integration Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-mint-100 text-mint-700 rounded-full text-sm">
            <Brain className="w-4 h-4" />
            <span>Powered by your custom Buddy Empath Aid chatbot</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
