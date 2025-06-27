import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import {
  MessageCircle,
  BarChart3,
  BookOpen,
  Shield,
  Zap,
  Heart,
  Brain,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "AI Companion",
    description:
      "Chat with our empathetic AI that understands your emotions and provides personalized support.",
    color: "from-mint-500 to-sky-500",
  },
  {
    icon: BarChart3,
    title: "Mood Tracking",
    description:
      "Visualize your emotional patterns with beautiful charts and insights to understand yourself better.",
    color: "from-sky-500 to-lavender-500",
  },
  {
    icon: BookOpen,
    title: "Smart Journal",
    description:
      "Express your thoughts freely with AI-powered prompts and sentiment analysis for deeper reflection.",
    color: "from-lavender-500 to-mint-500",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your mental health data is sacred. We use end-to-end encryption to keep your thoughts secure.",
    color: "from-mint-600 to-sky-600",
  },
];

const stats = [
  { value: "10k+", label: "Active Users", icon: Users },
  { value: "50k+", label: "Check-ins", icon: Heart },
  { value: "95%", label: "Feel Better", icon: Award },
  { value: "24/7", label: "AI Support", icon: Zap },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-sky-50">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-mint-200/30 to-sky-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-lavender-200/30 to-mint-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-6">
                <div className="flex items-center space-x-1 px-3 py-1 bg-mint-100 rounded-full text-mint-700 text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>AI-Powered Wellness</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Check in with your{" "}
                <span className="bg-gradient-to-r from-mint-600 to-sky-600 bg-clip-text text-transparent">
                  mind
                </span>
                . Every day.
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
                MindSync helps you understand your emotions, log your mood, and
                get support — all in one place. Your mental wellness journey
                starts here.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Link to="/chatbot" className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Start Chatting</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-mint-300 text-mint-700 hover:bg-mint-50 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Link to="/dashboard" className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Log Mood</span>
                  </Link>
                </Button>
              </div>

              <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4 text-mint-500" />
                  <span>Privacy Protected</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4 text-sky-500" />
                  <span>Always Free</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4 text-lavender-500" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-mint-100 to-sky-100 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4">
                  {/* Chat bubbles simulation */}
                  <div className="flex justify-end">
                    <div className="bg-mint-500 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-xs">
                      <p className="text-sm">I'm feeling a bit anxious today</p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 max-w-xs shadow-md">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 bg-gradient-to-br from-mint-400 to-sky-400 rounded-full flex items-center justify-center">
                          <Brain className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs text-gray-500">
                          MindSync AI
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        I understand that feeling. Let's explore what might be
                        causing this anxiety together. 💙
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-mint-500 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-xs">
                      <p className="text-sm">
                        That would really help, thank you
                      </p>
                    </div>
                  </div>

                  {/* Mood indicators */}
                  <div className="mt-6 p-4 bg-white/50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-2 text-center">
                      Today's Mood Check-in
                    </p>
                    <div className="flex justify-center space-x-2">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-sm">
                        😊
                      </div>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                        😔
                      </div>
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm border-2 border-mint-400">
                        😌
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-mint-200 rounded-full animate-pulse" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-sky-200 rounded-full animate-pulse delay-150" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-mint-100 to-sky-100 rounded-xl mb-4">
                  <stat.icon className="w-6 h-6 text-mint-600" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for{" "}
              <span className="bg-gradient-to-r from-mint-600 to-sky-600 bg-clip-text text-transparent">
                mental wellness
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines AI technology with proven
              mental health practices to support your emotional well-being.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/70 backdrop-blur-sm"
              >
                <CardContent className="p-8">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-mint-500 via-sky-500 to-lavender-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to begin your wellness journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of people who are already improving their mental
            health with MindSync. Start your free journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-mint-700 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Link to="/auth" className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-mint-700 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Link to="/resources" className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Explore Resources</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
