import { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
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
    title: "Understanding Anxiety: A Complete Guide",
    description:
      "Learn about the science behind anxiety and practical strategies to manage anxious thoughts and feelings.",
    type: "article",
    category: "anxiety",
    url: "#",
    rating: 4.8,
    duration: "10 min read",
    author: "Dr. Sarah Johnson",
    isFree: true,
    tags: ["anxiety", "coping", "mental health"],
  },
  {
    id: "2",
    title: "Mindful Mornings: Daily Meditation Practice",
    description:
      "Start your day with intention through guided meditation practices designed for beginners and experts alike.",
    type: "podcast",
    category: "mindfulness",
    url: "#",
    rating: 4.9,
    duration: "15-30 min",
    author: "Mindful Living Podcast",
    isFree: true,
    tags: ["meditation", "morning routine", "mindfulness"],
  },
  {
    id: "3",
    title: "CBT Techniques for Managing Depression",
    description:
      "Learn cognitive behavioral therapy techniques that can help identify and change negative thought patterns.",
    type: "video",
    category: "depression",
    url: "#",
    rating: 4.7,
    duration: "25 min",
    author: "Mental Health Academy",
    isFree: true,
    tags: ["CBT", "depression", "therapy"],
  },
  {
    id: "4",
    title: "Building Healthy Relationships",
    description:
      "Comprehensive course on communication skills, boundary setting, and maintaining healthy connections.",
    type: "course",
    category: "relationships",
    url: "#",
    rating: 4.6,
    duration: "3 hours",
    author: "Relationship Institute",
    isFree: false,
    tags: ["communication", "boundaries", "relationships"],
  },
  {
    id: "5",
    title: "Calm - Meditation and Sleep",
    description:
      "Popular meditation app with guided sessions, sleep stories, and relaxing soundscapes.",
    type: "app",
    category: "mindfulness",
    url: "#",
    rating: 4.8,
    author: "Calm Inc.",
    isFree: false,
    tags: ["meditation", "sleep", "app"],
  },
  {
    id: "6",
    title: "Sleep Better Tonight: Science-Based Tips",
    description:
      "Evidence-based strategies for improving sleep quality and establishing healthy sleep habits.",
    type: "article",
    category: "sleep",
    url: "#",
    rating: 4.5,
    duration: "8 min read",
    author: "Sleep Foundation",
    isFree: true,
    tags: ["sleep hygiene", "insomnia", "wellness"],
  },
  {
    id: "7",
    title: "Stress Management in the Workplace",
    description:
      "Practical techniques for managing work-related stress and maintaining work-life balance.",
    type: "video",
    category: "stress",
    url: "#",
    rating: 4.4,
    duration: "18 min",
    author: "Workplace Wellness",
    isFree: true,
    tags: ["work stress", "productivity", "balance"],
  },
  {
    id: "8",
    title: "The Happiness Lab Podcast",
    description:
      "Yale professor Dr. Laurie Santos explores the science of happiness and well-being.",
    type: "podcast",
    category: "productivity",
    url: "#",
    rating: 4.9,
    duration: "30-45 min",
    author: "Dr. Laurie Santos",
    isFree: true,
    tags: ["happiness", "psychology", "science"],
  },
];

const helplines = [
  {
    country: "United States",
    services: [
      {
        name: "National Suicide Prevention Lifeline",
        number: "988",
        available: "24/7",
      },
      {
        name: "Crisis Text Line",
        number: "Text HOME to 741741",
        available: "24/7",
      },
      {
        name: "NAMI Helpline",
        number: "1-800-950-NAMI",
        available: "Mon-Fri 10am-10pm ET",
      },
    ],
  },
  {
    country: "United Kingdom",
    services: [
      { name: "Samaritans", number: "116 123", available: "24/7" },
      {
        name: "Mind Infoline",
        number: "0300 123 3393",
        available: "Mon-Fri 9am-6pm",
      },
      {
        name: "Crisis Text Line",
        number: "Text SHOUT to 85258",
        available: "24/7",
      },
    ],
  },
  {
    country: "Canada",
    services: [
      {
        name: "Talk Suicide Canada",
        number: "1-833-456-4566",
        available: "24/7",
      },
      { name: "Kids Help Phone", number: "1-800-668-6868", available: "24/7" },
      {
        name: "Crisis Services Canada",
        number: "1-833-456-4566",
        available: "24/7",
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
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-sky-50">
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
            Curated articles, podcasts, videos, and support resources to support
            your mental wellness journey
          </p>
        </div>

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
                          {resource.author && <span>by {resource.author}</span>}
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
                    Try adjusting your search terms or filters to find resources
                    that match your needs.
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
                <CardTitle className="text-lg">Browse by Category</CardTitle>
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
                  If you're experiencing a mental health crisis, please reach
                  out for immediate help:
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
      </div>

      <Footer />
    </div>
  );
}
