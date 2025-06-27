import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Brain,
  Shield,
  Users,
  Zap,
  Target,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Companion",
    description:
      "Meet Buddy, your empathetic AI that understands and responds to your emotional needs with personalized support.",
  },
  {
    icon: Heart,
    title: "Mood Tracking",
    description:
      "Beautiful visualizations and insights help you understand your emotional patterns over time.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your mental health data is encrypted and secure. We never share your personal information.",
  },
  {
    icon: Users,
    title: "Evidence-Based",
    description:
      "Built on proven mental health practices and cognitive behavioral therapy techniques.",
  },
];

const team = [
  {
    name: "Dr. Sarah Chen",
    role: "Clinical Psychologist",
    description:
      "15+ years in mental health, specializing in digital therapeutics",
  },
  {
    name: "Alex Rodriguez",
    role: "AI Engineer",
    description:
      "Expert in natural language processing and empathetic AI systems",
  },
  {
    name: "Maya Patel",
    role: "UX Designer",
    description:
      "Focused on creating calming, intuitive interfaces for wellness",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-sky-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-mint-500 to-sky-500 rounded-2xl mb-6">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-mint-600 to-sky-600 bg-clip-text text-transparent">
              MindSync
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We believe everyone deserves access to mental wellness support.
            MindSync combines AI technology with proven therapeutic practices to
            make mental health care more accessible, personal, and effective.
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-16 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Our Mission
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Mental health struggles affect millions of people worldwide,
                  yet access to quality care remains limited. We're changing
                  that by creating an AI companion that's available 24/7,
                  understands your unique needs, and grows with you on your
                  wellness journey.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">
                      Accessible mental health support
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">
                      Personalized AI interactions
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">
                      Privacy-focused platform
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">
                      Evidence-based approaches
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-mint-100 to-sky-100 rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4">🌱</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Growing Together
                  </h3>
                  <p className="text-gray-600">
                    Every small step in your mental wellness journey matters.
                    We're here to celebrate your progress and support you
                    through challenges.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How MindSync Helps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-mint-100 to-sky-100 rounded-xl flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-mint-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <Card className="mb-16 shadow-xl border-0 bg-gradient-to-r from-mint-500 to-sky-500 text-white">
          <CardContent className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">10k+</div>
                <div className="text-mint-100">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">500k+</div>
                <div className="text-mint-100">Conversations</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">95%</div>
                <div className="text-mint-100">Feel Better</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-mint-100">Available</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card
                key={index}
                className="shadow-lg border-0 bg-white/90 backdrop-blur-sm text-center"
              >
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-mint-100 to-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-mint-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <Badge className="mb-3 bg-mint-100 text-mint-700">
                    {member.role}
                  </Badge>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of people who are already improving their mental
              health with MindSync. Your wellness journey starts with a single
              step.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600 text-white"
              >
                <Link to="/auth">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-mint-300 text-mint-700 hover:bg-mint-50"
              >
                <Link to="/resources">Explore Resources</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
