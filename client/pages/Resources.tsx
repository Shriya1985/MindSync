import { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { GuidedMeditation } from "@/components/GuidedMeditation";
import { MoodSoother } from "@/components/MoodSoother";
import { MoodPlaylists } from "@/components/MoodPlaylists";
import { DailyAffirmation } from "@/components/DailyAffirmation";
import { EmotionEncyclopedia } from "@/components/EmotionEncyclopedia";
import { VoiceJournaling } from "@/components/VoiceJournaling";
import { SelfCareTaskGenerator } from "@/components/SelfCareTaskGenerator";
import { AccessibilitySettings } from "@/components/AccessibilitySettings";
import { MoodResponsiveUI } from "@/components/MoodResponsiveUI";
import { AIChatModes } from "@/components/AIChatModes";
import { DailyQuotes } from "@/components/DailyQuotes";
import { MoodReactions } from "@/components/MoodReactions";
import { useMoodTheme } from "@/hooks/useMoodTheme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Headphones,
  Video,
  Search,
  Filter,
  Heart,
  Phone,
  Globe,
  ExternalLink,
  Star,
  Clock,
  Users,
  Bookmark,
  Play,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ResourceType =
  | "article"
  | "podcast"
  | "video"
  | "course"
  | "app"
  | "helpline";
type Category =
  | "anxiety"
  | "depression"
  | "stress"
  | "mindfulness"
  | "relationships"
  | "sleep"
  | "productivity"
  | "crisis";

type Resource = {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  category: Category;
  url: string;
  rating: number;
  duration?: string;
  author?: string;
  imageUrl?: string;
  isFree: boolean;
  isBookmarked?: boolean;
  tags: string[];
};

const resources: Resource[] = [
  {
    id: "1",
    title: "Mental Health and Wellbeing - WHO Guide",
    description:
      "Comprehensive guide by World Health Organization on understanding mental health, signs to watch for, and practical strategies.",
    type: "article",
    category: "anxiety",
    url: "https://www.who.int/news-room/fact-sheets/detail/mental-disorders",
    rating: 4.9,
    duration: "12 min read",
    author: "World Health Organization",
    isFree: true,
    tags: ["WHO", "mental health", "awareness"],
  },
  {
    id: "2",
    title: "Headspace: Meditation and Mindfulness",
    description:
      "Popular app with guided meditations, sleep stories, and mindfulness exercises. Available in Hindi and English.",
    type: "app",
    category: "mindfulness",
    url: "https://www.headspace.com",
    rating: 4.8,
    author: "Headspace Inc.",
    isFree: false,
    tags: ["meditation", "mindfulness", "sleep"],
  },
  {
    id: "3",
    title: "Understanding Depression - NIMHANS",
    description:
      "Educational resource from India's premier mental health institute on recognizing and managing depression.",
    type: "article",
    category: "depression",
    url: "https://nimhans.ac.in/mental-health-resources/",
    rating: 4.7,
    duration: "15 min read",
    author: "NIMHANS, Bangalore",
    isFree: true,
    tags: ["depression", "NIMHANS", "treatment"],
  },
  {
    id: "4",
    title: "Therapy with Dr. Shefali Batra",
    description:
      "Leading Indian psychiatrist Dr. Shefali Batra's YouTube channel with practical mental health tips and therapy insights.",
    type: "video",
    category: "mindfulness",
    url: "https://www.youtube.com/@DrShefaliBatra",
    rating: 4.6,
    duration: "10-20 min",
    author: "Dr. Shefali Batra",
    isFree: true,
    tags: ["therapy", "Indian expert", "practical tips"],
  },
  {
    id: "5",
    title: "Kaha Mind - Indian Mental Health Platform",
    description:
      "India-focused mental health platform offering counseling, therapy sessions, and wellness programs in multiple languages.",
    type: "app",
    category: "anxiety",
    url: "https://www.kahaminds.com",
    rating: 4.5,
    author: "Kaha Minds",
    isFree: false,
    tags: ["Indian platform", "therapy", "multilingual"],
  },
  {
    id: "6",
    title: "Stress Management - Indian Institute of Science",
    description:
      "Research-backed techniques for stress management developed specifically for Indian workplace and academic environments.",
    type: "article",
    category: "stress",
    url: "https://iisc.ac.in/student-wellness/",
    rating: 4.4,
    duration: "20 min read",
    author: "IISc Bangalore",
    isFree: true,
    tags: ["stress", "research", "workplace"],
  },
  {
    id: "7",
    title: "Wysa - AI Mental Health App",
    description:
      "AI-powered mental health support developed in India. Offers 24/7 emotional support and evidence-based techniques.",
    type: "app",
    category: "anxiety",
    url: "https://www.wysa.io",
    rating: 4.3,
    duration: "24/7 access",
    author: "Wysa Ltd",
    isFree: true,
    tags: ["AI support", "Indian app", "24/7"],
  },
  {
    id: "8",
    title: "The Mindful Indian Podcast",
    description:
      "Podcast exploring mindfulness and mental wellness through an Indian cultural lens, featuring expert guests and practical advice.",
    type: "podcast",
    category: "mindfulness",
    url: "https://open.spotify.com/show/mindful-indian",
    rating: 4.6,
    duration: "25-40 min",
    author: "Mindful India Network",
    isFree: true,
    tags: ["Indian culture", "mindfulness", "experts"],
  },
  {
    id: "9",
    title: "Sleep Stories in Hindi - Calm",
    description:
      "Soothing bedtime stories and sleep meditations available in Hindi and other Indian languages.",
    type: "podcast",
    category: "sleep",
    url: "https://www.calm.com/sleep-stories-hindi",
    rating: 4.7,
    duration: "20-45 min",
    author: "Calm",
    isFree: false,
    tags: ["Hindi", "sleep", "stories"],
  },
  {
    id: "10",
    title: "Mental Health First Aid India",
    description:
      "Comprehensive course on recognizing mental health issues and providing initial support, adapted for Indian contexts.",
    type: "course",
    category: "depression",
    url: "https://mhfaindia.org",
    rating: 4.8,
    duration: "8 hours",
    author: "Mental Health First Aid India",
    isFree: true,
    tags: ["first aid", "training", "Indian context"],
  },
  {
    id: "11",
    title: "Relationships in Indian Families",
    description:
      "Navigating complex family dynamics, generational differences, and building healthy boundaries in Indian family structures.",
    type: "article",
    category: "relationships",
    url: "https://www.psychologytoday.com/intl/blog/indian-families",
    rating: 4.5,
    duration: "18 min read",
    author: "Dr. Ritu Priya",
    isFree: true,
    tags: ["family", "Indian culture", "boundaries"],
  },
  {
    id: "12",
    title: "Student Mental Health - Kiran Helpline Resources",
    description:
      "Educational videos and resources specifically designed for Indian students dealing with academic pressure and career stress.",
    type: "video",
    category: "stress",
    url: "https://kiranmentalhealth.org/student-resources",
    rating: 4.6,
    duration: "15-30 min",
    author: "Kiran Mental Health",
    isFree: true,
    tags: ["students", "academic pressure", "career stress"],
  },
];

const helplines = [
  {
    country: "India - National Helplines",
    services: [
      {
        name: "Kiran Mental Health Helpline",
        number: "1800-599-0019",
        available: "24/7 (Toll-free)",
      },
      {
        name: "National Suicide Prevention Helpline",
        number: "022-2754 6669",
        available: "24/7",
      },
      {
        name: "Vandrevala Foundation Helpline",
        number: "9999 666 555",
        available: "24/7 (Toll-free)",
      },
      {
        name: "NIMHANS Helpline",
        number: "080-2699 5000",
        available: "Mon-Sat 9am-5pm",
      },
    ],
  },
  {
    country: "India - State Helplines",
    services: [
      {
        name: "Karnataka State Mental Health Helpline",
        number: "080-2549 5000",
        available: "24/7",
      },
      {
        name: "Tamil Nadu Sneha Suicide Prevention",
        number: "044-2464 0050",
        available: "24/7",
      },
      {
        name: "Maharashtra Manas Helpline",
        number: "022-2754 6669",
        available: "Mon-Sat 9am-9pm",
      },
      {
        name: "Delhi Mental Health Helpline",
        number: "011-2389 2870",
        available: "Mon-Fri 9am-6pm",
      },
    ],
  },
  {
    country: "India - Specialized Support",
    services: [
      {
        name: "iCall (TISS Mumbai)",
        number: "9152 987 821",
        available: "Mon-Sat 8am-10pm",
      },
      {
        name: "Fortis Stress Helpline",
        number: "8376 804 102",
        available: "24/7",
      },
      {
        name: "Parivarthan Counselling",
        number: "7676 602 602",
        available: "Mon-Sat 10am-6pm",
      },
      {
        name: "Sumaitri (Delhi NCR)",
        number: "011-2338 9090",
        available: "Daily 2pm-10pm",
      },
    ],
  },
];

const categories = [
  { value: "all", label: "All Resources", icon: BookOpen },
  { value: "anxiety", label: "Anxiety", icon: Heart },
  { value: "depression", label: "Depression", icon: Users },
  { value: "stress", label: "Stress", icon: Headphones },
  { value: "mindfulness", label: "Mindfulness", icon: Star },
  { value: "relationships", label: "Relationships", icon: Users },
  { value: "sleep", label: "Sleep", icon: Clock },
  { value: "productivity", label: "Productivity", icon: BookOpen },
];

const resourceTypeIcons = {
  article: BookOpen,
  podcast: Headphones,
  video: Video,
  course: BookOpen,
  app: Download,
  helpline: Phone,
};

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<"resources" | "wellness">(
    "wellness",
  );
  const { currentTheme } = useMoodTheme();

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || resource.category === selectedCategory;
    const matchesType =
      selectedType === "all" || resource.type === selectedType;
    const matchesBookmark = !bookmarkedOnly || resource.isBookmarked;

    return matchesSearch && matchesCategory && matchesType && matchesBookmark;
  });

  const toggleBookmark = (resourceId: string) => {
    // In a real app, this would update the database
    console.log("Toggle bookmark for resource:", resourceId);
  };

  return (
    <div className={`min-h-screen ${currentTheme.background}`}>
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-mint-500 to-sky-500 rounded-2xl mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mental Health Resources
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Interactive wellness tools and curated content to support your
            mental health journey
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-200">
            <Button
              onClick={() => setActiveTab("wellness")}
              variant={activeTab === "wellness" ? "default" : "ghost"}
              className={
                activeTab === "wellness"
                  ? "bg-mint-500 hover:bg-mint-600 text-white"
                  : ""
              }
            >
              🧘 Wellness Tools
            </Button>
            <Button
              onClick={() => setActiveTab("resources")}
              variant={activeTab === "resources" ? "default" : "ghost"}
              className={
                activeTab === "resources"
                  ? "bg-mint-500 hover:bg-mint-600 text-white"
                  : ""
              }
            >
              📚 Learning Resources
            </Button>
          </div>
        </div>

        {/* Wellness Tools Tab */}
        {activeTab === "wellness" && (
          <div className="space-y-8">
            {/* Daily Inspiration */}
            <DailyQuotes />

            {/* Mood Reactions */}
            <MoodReactions />

            {/* AI Chat Modes */}
            <AIChatModes />

            {/* Voice Journaling */}
            <VoiceJournaling />

            {/* Self-Care Task Generator */}
            <SelfCareTaskGenerator />

            {/* Mood-Responsive UI */}
            <MoodResponsiveUI />

            {/* Daily Affirmation */}
            <DailyAffirmation />

            {/* Guided Meditation */}
            <GuidedMeditation />

            {/* Mood Soother */}
            <MoodSoother />

            {/* Music Playlists */}
            <MoodPlaylists />

            {/* Emotion Encyclopedia */}
            <EmotionEncyclopedia />

            {/* Accessibility Settings */}
            <AccessibilitySettings />
          </div>
        )}

        {/* Learning Resources Tab */}
        {activeTab === "resources" && (
          <>
            {/* Search and Filters */}
            <Card className="mb-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search resources, topics, or keywords..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-mint-300 focus:ring-mint-200"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-mint-300 focus:ring-mint-200"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-mint-300 focus:ring-mint-200"
                    >
                      <option value="all">All Types</option>
                      <option value="article">Articles</option>
                      <option value="podcast">Podcasts</option>
                      <option value="video">Videos</option>
                      <option value="course">Courses</option>
                      <option value="app">Apps</option>
                    </select>
                    <Button
                      variant={bookmarkedOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
                      className={
                        bookmarkedOnly ? "bg-mint-500 hover:bg-mint-600" : ""
                      }
                    >
                      <Bookmark className="w-4 h-4 mr-2" />
                      Saved
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Resources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredResources.map((resource) => {
                    const IconComponent = resourceTypeIcons[resource.type];
                    return (
                      <Card
                        key={resource.id}
                        className="shadow-md border-0 bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-mint-100 rounded-lg flex items-center justify-center">
                                <IconComponent className="w-5 h-5 text-mint-600" />
                              </div>
                              <div>
                                <Badge
                                  variant="secondary"
                                  className="text-xs mb-1 capitalize"
                                >
                                  {resource.type}
                                </Badge>
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "w-3 h-3",
                                        i < Math.floor(resource.rating)
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300",
                                      )}
                                    />
                                  ))}
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({resource.rating})
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleBookmark(resource.id)}
                              className="text-gray-400 hover:text-mint-600"
                            >
                              <Bookmark
                                className={cn(
                                  "w-4 h-4",
                                  resource.isBookmarked &&
                                    "fill-current text-mint-600",
                                )}
                              />
                            </Button>
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-mint-600 transition-colors">
                            {resource.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {resource.description}
                          </p>

                          <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-gray-500">
                              {resource.author && (
                                <span>by {resource.author}</span>
                              )}
                              {resource.duration && (
                                <span className="flex items-center mt-1">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {resource.duration}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {resource.isFree ? (
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  Free
                                </Badge>
                              ) : (
                                <Badge className="bg-orange-100 text-orange-700 text-xs">
                                  Premium
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-4">
                            {resource.tags.slice(0, 3).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs border-mint-200 text-mint-700"
                              >
                                #{tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600 text-white"
                            >
                              {resource.type === "app" ? (
                                <>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </>
                              ) : resource.type === "video" ||
                                resource.type === "podcast" ? (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Play
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View
                                </>
                              )}
                            </Button>
                            <Badge className="capitalize text-xs bg-gray-100 text-gray-700">
                              {resource.category}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {filteredResources.length === 0 && (
                  <Card className="shadow-md border-0 bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No resources found
                      </h3>
                      <p className="text-gray-600">
                        Try adjusting your search terms or filters to find
                        resources that match your needs.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Categories */}
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Browse by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categories.slice(1).map((category) => {
                        const IconComponent = category.icon;
                        const count = resources.filter(
                          (r) => r.category === category.value,
                        ).length;
                        return (
                          <Button
                            key={category.value}
                            variant={
                              selectedCategory === category.value
                                ? "default"
                                : "ghost"
                            }
                            size="sm"
                            onClick={() => setSelectedCategory(category.value)}
                            className={cn(
                              "w-full justify-between",
                              selectedCategory === category.value &&
                                "bg-mint-500 hover:bg-mint-600",
                            )}
                          >
                            <div className="flex items-center space-x-2">
                              <IconComponent className="w-4 h-4" />
                              <span>{category.label}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {count}
                            </Badge>
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Crisis Support */}
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm border-l-4 border-l-red-500">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-700 flex items-center space-x-2">
                      <Phone className="w-5 h-5" />
                      <span>Crisis Support</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      If you're experiencing a mental health crisis, please
                      reach out for immediate help:
                    </p>
                    <div className="space-y-4">
                      {helplines.map((helpline, index) => (
                        <div key={index}>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {helpline.country}
                          </h4>
                          <div className="space-y-2">
                            {helpline.services.map((service, serviceIndex) => (
                              <div
                                key={serviceIndex}
                                className="p-3 bg-red-50 rounded-lg border border-red-200"
                              >
                                <div className="font-medium text-red-800 text-sm">
                                  {service.name}
                                </div>
                                <div className="font-mono text-red-700 text-sm">
                                  {service.number}
                                </div>
                                <div className="text-xs text-red-600">
                                  {service.available}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <Bookmark className="w-4 h-4 mr-2" />
                        View Saved Resources
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Resource Guide
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Submit a Resource
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
