import { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronUp,
  Search,
  HelpCircle,
  MessageCircle,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: "general" | "privacy" | "features" | "technical";
};

const faqs: FAQItem[] = [
  {
    id: "1",
    question: "What is MindSync and how does it work?",
    answer:
      "MindSync is an AI-powered mental wellness companion that helps you track your mood, journal your thoughts, and receive personalized support. Our AI companion, Buddy, uses advanced natural language processing to provide empathetic responses and helpful insights based on proven mental health practices.",
    category: "general",
  },
  {
    id: "2",
    question: "Is MindSync free to use?",
    answer:
      "Yes! MindSync offers a comprehensive free tier that includes mood tracking, journaling, AI conversations with Buddy, and access to mental health resources. We believe mental wellness support should be accessible to everyone.",
    category: "general",
  },
  {
    id: "3",
    question: "How does Buddy understand and respond to my emotions?",
    answer:
      "Buddy uses advanced sentiment analysis and natural language processing to understand the emotional context of your messages. Our AI is trained on therapeutic conversation patterns and uses evidence-based approaches like cognitive behavioral therapy techniques to provide helpful, empathetic responses.",
    category: "features",
  },
  {
    id: "4",
    question: "Is my personal data and mental health information secure?",
    answer:
      "Absolutely. We use end-to-end encryption to protect all your data. Your conversations with Buddy, journal entries, and mood data are never shared with third parties. We follow strict HIPAA-like privacy standards and give you full control over your data, including the ability to export or delete it at any time.",
    category: "privacy",
  },
  {
    id: "5",
    question:
      "Can MindSync replace therapy or professional mental health care?",
    answer:
      "No, MindSync is designed to complement, not replace, professional mental health care. While Buddy can provide support and coping strategies, we always recommend consulting with licensed mental health professionals for serious concerns. MindSync includes crisis resources and encourages users to seek professional help when needed.",
    category: "general",
  },
  {
    id: "6",
    question: "How do mood tracking and insights work?",
    answer:
      "You can log your mood using emojis, ratings, and optional notes throughout the day. MindSync analyzes your patterns over time to show trends, identify triggers, and celebrate positive streaks. The insights help you understand your emotional patterns and track your wellness journey progress.",
    category: "features",
  },
  {
    id: "7",
    question: "What kind of mental health resources are available?",
    answer:
      "MindSync provides a curated library of articles, podcasts, videos, and apps focused on mental wellness. Resources cover topics like anxiety management, mindfulness, sleep improvement, and relationship skills. We also provide crisis helpline numbers for different countries.",
    category: "features",
  },
  {
    id: "8",
    question: "Can I export my data?",
    answer:
      "Yes! You have full control over your data. You can export all your journal entries, mood logs, and conversation history as a JSON file from your profile settings. This ensures you always have access to your wellness journey data.",
    category: "privacy",
  },
  {
    id: "9",
    question: "What happens if I'm in crisis or having suicidal thoughts?",
    answer:
      "If you express thoughts of self-harm or suicide, Buddy will immediately provide crisis resources and encourage you to contact emergency services or crisis helplines. MindSync includes quick access to crisis support numbers for different countries. Please always reach out to emergency services or call a crisis helpline if you're in immediate danger.",
    category: "general",
  },
  {
    id: "10",
    question: "Does MindSync work on mobile devices?",
    answer:
      "Yes! MindSync is fully responsive and works great on smartphones, tablets, and desktop computers. You can access all features through your web browser, making it easy to check in with your mental wellness wherever you are.",
    category: "technical",
  },
  {
    id: "11",
    question: "How often should I use MindSync?",
    answer:
      "Use MindSync as often as feels helpful to you! Many users find daily check-ins beneficial for building self-awareness and maintaining wellness habits. Even a few minutes each day for mood logging or chatting with Buddy can make a positive difference in your mental wellness journey.",
    category: "general",
  },
  {
    id: "12",
    question: "Can I delete my account and data?",
    answer:
      "Yes, you can permanently delete your account and all associated data at any time from your profile settings. Once deleted, all your information is permanently removed from our servers and cannot be recovered.",
    category: "privacy",
  },
];

const categories = [
  { id: "all", name: "All Questions", count: faqs.length },
  {
    id: "general",
    name: "General",
    count: faqs.filter((f) => f.category === "general").length,
  },
  {
    id: "features",
    name: "Features",
    count: faqs.filter((f) => f.category === "features").length,
  },
  {
    id: "privacy",
    name: "Privacy & Security",
    count: faqs.filter((f) => f.category === "privacy").length,
  },
  {
    id: "technical",
    name: "Technical",
    count: faqs.filter((f) => f.category === "technical").length,
  },
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-sky-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-mint-500 to-sky-500 rounded-2xl mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about MindSync, your mental
            wellness companion.
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search frequently asked questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-mint-300 focus:ring-mint-200"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory === category.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      selectedCategory === category.id &&
                        "bg-mint-500 hover:bg-mint-600",
                    )}
                  >
                    {category.name} ({category.count})
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Items */}
        <div className="space-y-4 mb-12">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <Card
                key={faq.id}
                className="shadow-md border-0 bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    {openItems.includes(faq.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {openItems.includes(faq.id) && (
                    <div className="px-6 pb-6">
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="shadow-md border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No questions found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or browse different
                  categories.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still Have Questions?
            </h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600 text-white"
              >
                <a href="mailto:support@mindsync.app">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </a>
              </Button>
              <Button
                variant="outline"
                className="border-mint-300 text-mint-700 hover:bg-mint-50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Live Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
