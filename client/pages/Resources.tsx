import { useState, useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { GuidedMeditation } from "@/components/GuidedMeditation";
import { MoodSoother } from "@/components/MoodSoother";
import { MoodPlaylists } from "@/components/MoodPlaylists";
import { DailyAffirmation } from "@/components/DailyAffirmation";
import { EmotionEncyclopedia } from "@/components/EmotionEncyclopedia";
import { VoiceJournaling } from "@/components/VoiceJournaling";
import { SelfCareTaskGenerator } from "@/components/SelfCareTaskGenerator";
import { DailyQuotes } from "@/components/DailyQuotes";
import { MoodReactions } from "@/components/MoodReactions";
import { useMoodTheme } from "@/hooks/useMoodTheme";
import { useData } from "@/contexts/DataContext";
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
  // Anxiety Resources
  {
    id: "1",
    title: "Anxiety and Panic Disorders - NIMHANS",
    description:
      "Comprehensive guide on understanding, recognizing, and managing anxiety disorders by India's leading mental health institute.",
    type: "article",
    category: "anxiety",
    url: "https://nimhans.ac.in/departments/psychiatry/",
    rating: 4.9,
    duration: "15 min read",
    author: "NIMHANS, Bangalore",
    isFree: true,
    tags: ["anxiety", "panic", "treatment", "Indian medical"],
  },
  {
    id: "2",
    title: "Calm App - Anxiety Relief Programs",
    description:
      "Evidence-based anxiety management programs with daily sessions, breathing exercises, and calming sounds.",
    type: "app",
    category: "anxiety",
    url: "https://www.calm.com/anxiety",
    rating: 4.8,
    author: "Calm Inc.",
    isFree: false,
    tags: ["anxiety relief", "meditation", "breathing"],
  },
  {
    id: "3",
    title: "Dr. Aparna Khandelwal - Anxiety Management",
    description:
      "Renowned Indian psychiatrist's YouTube series on practical anxiety management techniques and coping strategies.",
    type: "video",
    category: "anxiety",
    url: "https://www.youtube.com/@DrAparnaKhandelwal",
    rating: 4.7,
    duration: "20-30 min",
    author: "Dr. Aparna Khandelwal",
    isFree: true,
    tags: ["Indian expert", "anxiety techniques", "practical"],
  },
  {
    id: "4",
    title: "Anxiety Relief Podcast - Indian Perspectives",
    description:
      "Weekly podcast addressing anxiety from Indian cultural contexts, featuring mental health professionals and real stories.",
    type: "podcast",
    category: "anxiety",
    url: "https://open.spotify.com/show/anxiety-relief-india",
    rating: 4.6,
    duration: "30-45 min",
    author: "Mental Health India Network",
    isFree: true,
    tags: ["Indian context", "cultural", "real stories"],
  },

  // Depression Resources
  {
    id: "5",
    title: "Understanding Depression - All India Institute of Medical Sciences",
    description:
      "Clinical guide to depression symptoms, causes, and treatment options by AIIMS psychiatry department.",
    type: "article",
    category: "depression",
    url: "https://www.aiims.edu/en/patient-care/departments/psychiatry.html",
    rating: 4.9,
    duration: "18 min read",
    author: "AIIMS, New Delhi",
    isFree: true,
    tags: ["depression", "clinical", "AIIMS", "treatment"],
  },
  {
    id: "6",
    title: "Headspace - Depression and Sadness",
    description:
      "Guided meditations and mindfulness exercises specifically designed for managing depression and low mood.",
    type: "app",
    category: "depression",
    url: "https://www.headspace.com/depression",
    rating: 4.8,
    author: "Headspace Inc.",
    isFree: false,
    tags: ["depression", "meditation", "mood"],
  },
  {
    id: "7",
    title: "Dr. Shivani Misri Sadhoo - Depression Therapy",
    description:
      "Leading Indian psychologist's comprehensive video series on cognitive behavioral therapy for depression.",
    type: "video",
    category: "depression",
    url: "https://www.youtube.com/@DrShivaniMisriSadhoo",
    rating: 4.7,
    duration: "25-40 min",
    author: "Dr. Shivani Misri Sadhoo",
    isFree: true,
    tags: ["CBT", "Indian therapist", "depression therapy"],
  },

  // Stress Management Resources
  {
    id: "8",
    title: "Workplace Stress Management - IIT Bombay",
    description:
      "Research-based stress management techniques for Indian professionals, covering work-life balance and burnout prevention.",
    type: "course",
    category: "stress",
    url: "https://www.iitb.ac.in/wellness/stress-management",
    rating: 4.8,
    duration: "6 hours",
    author: "IIT Bombay Wellness Center",
    isFree: true,
    tags: ["workplace stress", "IIT", "professionals", "burnout"],
  },
  {
    id: "9",
    title: "Stress & Anxiety Companion - Sanvello",
    description:
      "AI-powered stress tracking and management app with personalized coping strategies and mood tracking.",
    type: "app",
    category: "stress",
    url: "https://www.sanvello.com",
    rating: 4.5,
    author: "Sanvello Inc.",
    isFree: true,
    tags: ["stress tracking", "AI", "coping strategies"],
  },
  {
    id: "10",
    title: "Academic Stress - Student Helpline India",
    description:
      "Specialized resources for Indian students dealing with exam pressure, career stress, and academic anxiety.",
    type: "video",
    category: "stress",
    url: "https://www.youtube.com/@StudentHelplineIndia",
    rating: 4.6,
    duration: "15-25 min",
    author: "Student Helpline India",
    isFree: true,
    tags: ["academic stress", "students", "exam pressure"],
  },

  // Mindfulness Resources
  {
    id: "11",
    title: "Mindfulness-Based Stress Reduction - Tata Institute",
    description:
      "Scientific approach to mindfulness meditation developed by Tata Institute for Indian practitioners.",
    type: "course",
    category: "mindfulness",
    url: "https://www.tifr.res.in/wellness/mindfulness",
    rating: 4.9,
    duration: "8 weeks",
    author: "Tata Institute of Fundamental Research",
    isFree: true,
    tags: ["MBSR", "scientific", "Tata Institute"],
  },
  {
    id: "12",
    title: "Insight Timer - Indian Meditation Teachers",
    description:
      "Free meditation app featuring renowned Indian teachers, Sanskrit chants, and culturally relevant mindfulness practices.",
    type: "app",
    category: "mindfulness",
    url: "https://insighttimer.com/indian-teachers",
    rating: 4.8,
    author: "Insight Network Inc.",
    isFree: true,
    tags: ["Indian teachers", "Sanskrit", "cultural"],
  },
  {
    id: "13",
    title: "The Mindful Indian Podcast",
    description:
      "Weekly discussions on mindfulness practice in Indian context, featuring interviews with spiritual teachers and mental health experts.",
    type: "podcast",
    category: "mindfulness",
    url: "https://open.spotify.com/show/mindful-indian-podcast",
    rating: 4.7,
    duration: "30-50 min",
    author: "Mindful India Network",
    isFree: true,
    tags: ["Indian spirituality", "experts", "weekly"],
  },

  // Relationship Resources
  {
    id: "14",
    title: "Family Dynamics in Indian Context - Psychology Today",
    description:
      "Understanding complex Indian family relationships, generational conflicts, and building healthy boundaries.",
    type: "article",
    category: "relationships",
    url: "https://www.psychologytoday.com/intl/blog/indian-family-dynamics",
    rating: 4.6,
    duration: "22 min read",
    author: "Dr. Seema Hingorrany",
    isFree: true,
    tags: ["Indian families", "boundaries", "generations"],
  },
  {
    id: "15",
    title: "Couples Therapy India - Dr. Kersi Chavda",
    description:
      "Expert guidance on relationship issues specific to Indian couples, including arranged marriages and cultural pressures.",
    type: "video",
    category: "relationships",
    url: "https://www.youtube.com/@DrKersiChavda",
    rating: 4.5,
    duration: "35-45 min",
    author: "Dr. Kersi Chavda",
    isFree: true,
    tags: ["couples therapy", "Indian marriage", "cultural"],
  },

  // Sleep Resources
  {
    id: "16",
    title: "Sleep Hygiene Guidelines - Indian Sleep Research Society",
    description:
      "Evidence-based sleep recommendations adapted for Indian climate, lifestyle, and cultural practices.",
    type: "article",
    category: "sleep",
    url: "https://sleepresearchsociety.in/guidelines",
    rating: 4.8,
    duration: "12 min read",
    author: "Indian Sleep Research Society",
    isFree: true,
    tags: ["sleep hygiene", "Indian climate", "research"],
  },
  {
    id: "17",
    title: "Sleep Stories in Hindi - Calm",
    description:
      "Soothing bedtime stories narrated in Hindi, featuring Indian folklore and calming nature sounds.",
    type: "podcast",
    category: "sleep",
    url: "https://www.calm.com/sleep-stories-hindi",
    rating: 4.7,
    duration: "20-45 min",
    author: "Calm India",
    isFree: false,
    tags: ["Hindi", "folklore", "bedtime"],
  },

  // Productivity Resources
  {
    id: "18",
    title: "Work-Life Balance for Indian Professionals - LinkedIn Learning",
    description:
      "Strategies for managing career demands while maintaining mental health in Indian corporate culture.",
    type: "course",
    category: "productivity",
    url: "https://www.linkedin.com/learning/work-life-balance-india",
    rating: 4.5,
    duration: "4 hours",
    author: "LinkedIn Learning India",
    isFree: false,
    tags: ["work-life balance", "corporate", "professional"],
  },
  {
    id: "19",
    title: "Focus and Concentration - Ravi Shankar Art of Living",
    description:
      "Ancient Indian techniques for improving focus, concentration, and mental clarity through breathing and meditation.",
    type: "video",
    category: "productivity",
    url: "https://www.artofliving.org/in-en/focus-techniques",
    rating: 4.6,
    duration: "30-40 min",
    author: "Art of Living Foundation",
    isFree: true,
    tags: ["ancient techniques", "breathing", "concentration"],
  },

  // Crisis Support Resources
  {
    id: "20",
    title: "Crisis Intervention Training - NIMHANS",
    description:
      "Professional training course on recognizing mental health crises and providing immediate support.",
    type: "course",
    category: "depression",
    url: "https://nimhans.ac.in/training/crisis-intervention",
    rating: 4.9,
    duration: "16 hours",
    author: "NIMHANS, Bangalore",
    isFree: true,
    tags: ["crisis intervention", "training", "professional"],
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
  {
    value: "anxiety",
    label: "Anxiety Relief",
    icon: Heart,
    emotions: ["anxious", "worried", "nervous", "stressed"],
  },
  {
    value: "depression",
    label: "Mood Support",
    icon: Users,
    emotions: ["sad", "depressed", "low", "hopeless"],
  },
  {
    value: "stress",
    label: "Stress Management",
    icon: Headphones,
    emotions: ["stressed", "overwhelmed", "tense", "pressured"],
  },
  {
    value: "mindfulness",
    label: "Mindfulness",
    icon: Star,
    emotions: ["restless", "distracted", "unfocused"],
  },
  {
    value: "relationships",
    label: "Relationships",
    icon: Users,
    emotions: ["lonely", "isolated", "misunderstood"],
  },
  {
    value: "sleep",
    label: "Sleep & Rest",
    icon: Clock,
    emotions: ["tired", "exhausted", "restless"],
  },
  {
    value: "productivity",
    label: "Focus & Growth",
    icon: BookOpen,
    emotions: ["unmotivated", "procrastinating", "unfocused"],
  },
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
  const [moodBasedSuggestions, setMoodBasedSuggestions] = useState<Resource[]>(
    [],
  );
  const { currentTheme } = useMoodTheme();
  const { moodEntries, addPoints } = useData();

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.tags && Array.isArray(resource.tags) && resource.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      ));

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

  // Get mood-based resource suggestions
  const getMoodBasedSuggestions = () => {
    if (!Array.isArray(moodEntries) || moodEntries.length === 0) return [];

    const latestMood = moodEntries[moodEntries.length - 1];
    if (!latestMood || !latestMood.mood) return [];

    const moodLower = latestMood.mood.toLowerCase();

    // Find categories that match current mood
    const relevantCategories = categories.filter((cat) =>
      cat.emotions && Array.isArray(cat.emotions) && cat.emotions.some(
        (emotion) => moodLower.includes(emotion) || emotion.includes(moodLower),
      ),
    );

    if (relevantCategories.length === 0) return [];

    // Get resources from relevant categories
    const suggestions = resources
      .filter((resource) =>
        relevantCategories.some((cat) => cat.value === resource.category),
      )
      .slice(0, 6); // Limit to 6 suggestions

    return suggestions;
  };

  // Update suggestions when mood entries change
  useEffect(() => {
    setMoodBasedSuggestions(getMoodBasedSuggestions());
  }, [moodEntries]);

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
              ��� Learning Resources
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

            {/* Voice Journaling */}
            <VoiceJournaling />

            {/* Self-Care Task Generator */}
            <SelfCareTaskGenerator />

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
          </div>
        )}

        {/* Learning Resources Tab */}
        {activeTab === "resources" && (
          <>
            {/* Mood-Based Suggestions */}
            {moodBasedSuggestions.length > 0 && (
              <Card className="mb-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    <span>Recommended for Your Current Mood</span>
                  </CardTitle>
                  <p className="text-gray-600">
                    Based on your recent mood entry:{" "}
                    <span className="font-semibold text-pink-600">
                      {moodEntries && moodEntries.length > 0 ? moodEntries[moodEntries.length - 1]?.mood : "No mood logged"}
                    </span>
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {moodBasedSuggestions.map((resource) => {
                      const IconComponent = resourceTypeIcons[resource.type];
                      return (
                        <Card
                          key={resource.id}
                          className="p-4 hover:shadow-md transition-all duration-200 border border-pink-200 bg-pink-50/50"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-4 h-4 text-pink-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {resource.title}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {resource.author}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                            {resource.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge className="bg-pink-100 text-pink-700 text-xs capitalize">
                              {resource.category}
                            </Badge>
                            <Button
                              size="sm"
                              onClick={async () => {
                                window.open(resource.url, "_blank");
                                await addPoints(
                                  5,
                                  `Explored Resource: ${resource.title}`,
                                  "resources",
                                );
                              }}
                              className="bg-pink-500 hover:bg-pink-600 text-white text-xs px-3 py-1"
                            >
                              View
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

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
