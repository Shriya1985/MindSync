import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BookOpen,
  Search,
  Heart,
  Brain,
  Lightbulb,
  Target,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  Shield,
  Wind,
} from "lucide-react";
import { cn } from "@/lib/utils";

type EmotionEntry = {
  id: string;
  name: string;
  emoji: string;
  category: "primary" | "secondary" | "complex";
  intensity: "low" | "medium" | "high";
  description: string;
  physicalSigns: string[];
  cognitivePatterns: string[];
  behaviors: string[];
  triggers: string[];
  managementStrategies: {
    immediate: string[];
    longTerm: string[];
    professional: string[];
  };
  relatedEmotions: string[];
  healthyExpression: string[];
  whenToSeekHelp: string[];
  color: string;
};

const emotions: EmotionEntry[] = [
  {
    id: "anxiety",
    name: "Anxiety",
    emoji: "😰",
    category: "primary",
    intensity: "medium",
    description:
      "A feeling of worry, nervousness, or unease about something with an uncertain outcome. Anxiety is our body's natural response to stress and can be helpful in small doses, but becomes problematic when it's persistent or overwhelming.",
    physicalSigns: [
      "Rapid heartbeat or palpitations",
      "Sweating or trembling",
      "Muscle tension",
      "Shortness of breath",
      "Nausea or stomach discomfort",
      "Headaches",
      "Fatigue or restlessness",
    ],
    cognitivePatterns: [
      "Racing thoughts",
      "Catastrophic thinking",
      "Worry about future events",
      "Difficulty concentrating",
      "Expecting the worst outcomes",
      "Overthinking situations",
    ],
    behaviors: [
      "Avoidance of anxiety-provoking situations",
      "Seeking constant reassurance",
      "Procrastination",
      "Restlessness or fidgeting",
      "Checking behaviors",
      "Difficulty making decisions",
    ],
    triggers: [
      "Uncertainty or unpredictability",
      "High-stress situations",
      "Social interactions",
      "Performance evaluations",
      "Health concerns",
      "Financial worries",
      "Major life changes",
    ],
    managementStrategies: {
      immediate: [
        "Deep breathing exercises (4-7-8 technique)",
        "Progressive muscle relaxation",
        "Grounding techniques (5-4-3-2-1)",
        "Mindfulness meditation",
        "Challenge negative thoughts",
        "Take a walk or do light exercise",
      ],
      longTerm: [
        "Regular exercise routine",
        "Consistent sleep schedule",
        "Limit caffeine and alcohol",
        "Practice daily mindfulness",
        "Build a support network",
        "Learn stress management skills",
      ],
      professional: [
        "Cognitive Behavioral Therapy (CBT)",
        "Exposure therapy",
        "Medication consultation",
        "EMDR for trauma-related anxiety",
        "Group therapy",
      ],
    },
    relatedEmotions: ["fear", "worry", "panic", "nervousness", "dread"],
    healthyExpression: [
      "Talk to trusted friends or family",
      "Write in a journal",
      "Practice relaxation techniques",
      "Engage in creative activities",
      "Exercise regularly",
    ],
    whenToSeekHelp: [
      "Anxiety interferes with daily activities",
      "Physical symptoms are severe",
      "Panic attacks occur frequently",
      "Avoidance behaviors increase",
      "Sleep or appetite are significantly affected",
    ],
    color: "from-orange-400 to-red-500",
  },
  {
    id: "depression",
    name: "Depression",
    emoji: "😔",
    category: "primary",
    intensity: "high",
    description:
      "A persistent feeling of sadness, hopelessness, and loss of interest in activities. Depression affects how you feel, think, and handle daily activities, and is more than just temporary sadness.",
    physicalSigns: [
      "Persistent fatigue or low energy",
      "Changes in appetite or weight",
      "Sleep disturbances",
      "Aches and pains without clear cause",
      "Slowed movements or speech",
      "Reduced physical activity",
    ],
    cognitivePatterns: [
      "Negative self-talk",
      "Feelings of worthlessness or guilt",
      "Difficulty concentrating",
      "Indecisiveness",
      "Memory problems",
      "Thoughts of death or suicide",
    ],
    behaviors: [
      "Withdrawal from social activities",
      "Neglecting personal hygiene",
      "Reduced productivity",
      "Increased substance use",
      "Irritability or anger outbursts",
      "Loss of interest in hobbies",
    ],
    triggers: [
      "Major life stressors",
      "Loss or grief",
      "Relationship problems",
      "Financial difficulties",
      "Health issues",
      "Seasonal changes",
      "Trauma or abuse",
    ],
    managementStrategies: {
      immediate: [
        "Reach out to support system",
        "Engage in small, manageable activities",
        "Practice self-compassion",
        "Maintain basic self-care",
        "Get sunlight exposure",
        "Listen to uplifting music",
      ],
      longTerm: [
        "Establish daily routines",
        "Regular exercise (even light walking)",
        "Nutritious eating habits",
        "Social connections",
        "Meaningful activities or volunteering",
        "Creative expression",
      ],
      professional: [
        "Psychotherapy (CBT, IPT, DBT)",
        "Antidepressant medication",
        "Light therapy for seasonal depression",
        "Support groups",
        "Intensive outpatient programs",
      ],
    },
    relatedEmotions: ["sadness", "hopelessness", "emptiness", "despair"],
    healthyExpression: [
      "Talk to mental health professionals",
      "Join support groups",
      "Express through art or writing",
      "Gentle physical activity",
      "Connect with understanding friends",
    ],
    whenToSeekHelp: [
      "Thoughts of self-harm or suicide",
      "Symptoms persist for more than 2 weeks",
      "Unable to perform daily tasks",
      "Substance abuse increases",
      "Social isolation becomes extreme",
    ],
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: "anger",
    name: "Anger",
    emoji: "😠",
    category: "primary",
    intensity: "high",
    description:
      "A strong feeling of displeasure or hostility often triggered when we perceive that our needs, boundaries, or values have been violated. Anger can be a healthy emotion when expressed appropriately.",
    physicalSigns: [
      "Increased heart rate",
      "Muscle tension",
      "Clenched fists or jaw",
      "Feeling hot or flushed",
      "Raised voice",
      "Aggressive posture",
    ],
    cognitivePatterns: [
      "Blame and judgment",
      "All-or-nothing thinking",
      "Rumination on perceived wrongs",
      "Difficulty seeing other perspectives",
      "Focus on unfairness",
    ],
    behaviors: [
      "Verbal or physical aggression",
      "Withdrawal or silent treatment",
      "Passive-aggressive actions",
      "Increased criticism",
      "Risk-taking behaviors",
      "Difficulty listening",
    ],
    triggers: [
      "Feeling disrespected or unheard",
      "Injustice or unfairness",
      "Frustration with obstacles",
      "Boundary violations",
      "Feeling threatened",
      "Past trauma triggers",
    ],
    managementStrategies: {
      immediate: [
        "Take a timeout before responding",
        "Deep breathing or counting to 10",
        "Physical exercise to release energy",
        "Express anger through writing",
        "Use 'I' statements instead of 'you' statements",
        "Remove yourself from the situation",
      ],
      longTerm: [
        "Identify personal triggers",
        "Develop assertiveness skills",
        "Practice regular stress reduction",
        "Build empathy and perspective-taking",
        "Learn conflict resolution skills",
      ],
      professional: [
        "Anger management classes",
        "Cognitive Behavioral Therapy",
        "Family or couples therapy",
        "Trauma therapy if applicable",
        "Group therapy",
      ],
    },
    relatedEmotions: ["frustration", "rage", "irritation", "resentment"],
    healthyExpression: [
      "Assert needs calmly and clearly",
      "Physical exercise or sports",
      "Creative expression (art, music)",
      "Productive problem-solving",
      "Advocate for positive change",
    ],
    whenToSeekHelp: [
      "Anger leads to violence or threats",
      "Relationships are being damaged",
      "Anger feels uncontrollable",
      "Substance use to cope with anger",
      "Legal or work problems due to anger",
    ],
    color: "from-red-500 to-orange-500",
  },
  {
    id: "joy",
    name: "Joy",
    emoji: "😊",
    category: "primary",
    intensity: "high",
    description:
      "A feeling of great pleasure, happiness, and contentment. Joy is often spontaneous and can arise from meaningful experiences, connections, or accomplishments.",
    physicalSigns: [
      "Smiling or laughing",
      "Increased energy",
      "Light, bouncy feeling",
      "Relaxed muscles",
      "Bright, alert expression",
      "Warm feeling in chest",
    ],
    cognitivePatterns: [
      "Optimistic thinking",
      "Gratitude and appreciation",
      "Present-moment awareness",
      "Creative and open mindset",
      "Positive memories surface easily",
    ],
    behaviors: [
      "Increased social engagement",
      "Generous and kind actions",
      "Playful or spontaneous behavior",
      "Sharing good news with others",
      "Seeking new experiences",
    ],
    triggers: [
      "Achieving personal goals",
      "Connecting with loved ones",
      "Experiencing beauty in nature",
      "Acts of kindness or service",
      "Creative expression",
      "Spiritual or meaningful moments",
    ],
    managementStrategies: {
      immediate: [
        "Savor the moment fully",
        "Share the joy with others",
        "Express gratitude",
        "Engage in celebration rituals",
        "Take photos or write about the experience",
      ],
      longTerm: [
        "Cultivate gratitude practices",
        "Build meaningful relationships",
        "Engage in activities that bring joy",
        "Practice mindfulness",
        "Set achievable goals",
      ],
      professional: [
        "Positive psychology therapy",
        "Life coaching",
        "Group activities or clubs",
        "Mindfulness-based interventions",
      ],
    },
    relatedEmotions: ["happiness", "delight", "elation", "contentment"],
    healthyExpression: [
      "Share with trusted people",
      "Celebrate appropriately",
      "Express through art or movement",
      "Practice gratitude",
      "Engage in play",
    ],
    whenToSeekHelp: [
      "Joy feels manic or out of control",
      "Unable to experience joy for long periods",
      "Joy is followed by extreme crashes",
      "Engaging in risky behavior while euphoric",
    ],
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: "sadness",
    name: "Sadness",
    emoji: "😢",
    category: "primary",
    intensity: "medium",
    description:
      "A natural emotional response to loss, disappointment, or difficult life circumstances. Sadness helps us process experiences and can deepen our empathy and connections with others.",
    physicalSigns: [
      "Tearfulness or crying",
      "Heavy feeling in chest",
      "Low energy or fatigue",
      "Slumped posture",
      "Slower movements",
      "Changes in appetite",
    ],
    cognitivePatterns: [
      "Reflection on loss or disappointment",
      "Nostalgia for better times",
      "Decreased motivation",
      "Focus on what's missing",
      "Contemplative thoughts",
    ],
    behaviors: [
      "Seeking comfort from others",
      "Withdrawal for reflection",
      "Reduced activity levels",
      "Listening to melancholy music",
      "Looking through old photos",
    ],
    triggers: [
      "Loss of loved ones",
      "End of relationships",
      "Disappointments or failures",
      "Separation from important people",
      "Nostalgic memories",
      "Witnessing others' pain",
    ],
    managementStrategies: {
      immediate: [
        "Allow yourself to feel the emotion",
        "Reach out for comfort and support",
        "Engage in gentle self-care",
        "Express through crying or talking",
        "Practice self-compassion",
      ],
      longTerm: [
        "Build support networks",
        "Engage in meaningful activities",
        "Practice gratitude",
        "Creative expression",
        "Volunteer or help others",
      ],
      professional: [
        "Grief counseling",
        "Supportive psychotherapy",
        "Support groups",
        "Art or music therapy",
      ],
    },
    relatedEmotions: ["grief", "melancholy", "sorrow", "disappointment"],
    healthyExpression: [
      "Talk to trusted friends or family",
      "Write in a journal",
      "Create art or music",
      "Allow tears to flow",
      "Seek comfort in nature",
    ],
    whenToSeekHelp: [
      "Sadness persists for weeks without relief",
      "Interferes with daily functioning",
      "Accompanied by thoughts of self-harm",
      "Leads to complete social isolation",
    ],
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "fear",
    name: "Fear",
    emoji: "😨",
    category: "primary",
    intensity: "high",
    description:
      "An adaptive emotion that alerts us to potential danger or threat. Fear can be rational (realistic threat) or irrational (phobia), and serves to protect us by preparing the body for fight, flight, or freeze responses.",
    physicalSigns: [
      "Rapid heartbeat",
      "Sweating or trembling",
      "Muscle tension",
      "Shallow breathing",
      "Nausea or dizziness",
      "Heightened alertness",
    ],
    cognitivePatterns: [
      "Anticipation of danger",
      "Difficulty concentrating on other topics",
      "Vivid imagination of worst-case scenarios",
      "Hypervigilance to threats",
      "Memory focus on past negative events",
    ],
    behaviors: [
      "Avoidance of feared situations",
      "Seeking safety or escape routes",
      "Freezing or inability to act",
      "Seeking reassurance from others",
      "Checking behaviors",
    ],
    triggers: [
      "Specific phobias (heights, spiders, etc.)",
      "Social situations",
      "Health concerns",
      "Past traumatic experiences",
      "Uncertainty about the future",
      "Threat to safety or security",
    ],
    managementStrategies: {
      immediate: [
        "Ground yourself using 5-4-3-2-1 technique",
        "Practice deep, slow breathing",
        "Challenge fearful thoughts with reality",
        "Use progressive muscle relaxation",
        "Seek safe space or trusted person",
      ],
      longTerm: [
        "Gradual exposure to feared situations",
        "Build confidence through skill development",
        "Learn about your specific fears",
        "Practice relaxation techniques regularly",
        "Build a support network",
      ],
      professional: [
        "Exposure therapy",
        "Cognitive Behavioral Therapy",
        "EMDR for trauma-related fears",
        "Systematic desensitization",
        "Medication for severe anxiety",
      ],
    },
    relatedEmotions: ["anxiety", "panic", "dread", "terror", "worry"],
    healthyExpression: [
      "Talk about fears with trusted people",
      "Face fears gradually and safely",
      "Use fear as information about values",
      "Practice courage in small steps",
    ],
    whenToSeekHelp: [
      "Fear significantly limits daily activities",
      "Panic attacks occur frequently",
      "Fear seems irrational but uncontrollable",
      "Avoidance behaviors increase over time",
    ],
    color: "from-purple-500 to-indigo-500",
  },
];

export function EmotionEncyclopedia() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openEmotions, setOpenEmotions] = useState<string[]>([]);

  const toggleEmotion = (emotionId: string) => {
    setOpenEmotions((prev) =>
      prev.includes(emotionId)
        ? prev.filter((id) => id !== emotionId)
        : [...prev, emotionId],
    );
  };

  const filteredEmotions = emotions.filter((emotion) => {
    const matchesSearch =
      emotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emotion.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emotion.triggers.some((trigger) =>
        trigger.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || emotion.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "low":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "high":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-mint-600" />
          <span>Emotion Encyclopedia</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Learn about common emotions and discover healthy ways to understand
          and manage them
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search emotions, triggers, or symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-mint-300 focus:ring-mint-200"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedCategory("all")}
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                className={
                  selectedCategory === "all"
                    ? "bg-mint-500 hover:bg-mint-600"
                    : ""
                }
              >
                All
              </Button>
              <Button
                onClick={() => setSelectedCategory("primary")}
                variant={selectedCategory === "primary" ? "default" : "outline"}
                size="sm"
                className={
                  selectedCategory === "primary"
                    ? "bg-mint-500 hover:bg-mint-600"
                    : ""
                }
              >
                Primary
              </Button>
              <Button
                onClick={() => setSelectedCategory("secondary")}
                variant={
                  selectedCategory === "secondary" ? "default" : "outline"
                }
                size="sm"
                className={
                  selectedCategory === "secondary"
                    ? "bg-mint-500 hover:bg-mint-600"
                    : ""
                }
              >
                Secondary
              </Button>
              <Button
                onClick={() => setSelectedCategory("complex")}
                variant={selectedCategory === "complex" ? "default" : "outline"}
                size="sm"
                className={
                  selectedCategory === "complex"
                    ? "bg-mint-500 hover:bg-mint-600"
                    : ""
                }
              >
                Complex
              </Button>
            </div>
          </div>

          {/* Emotions List */}
          <div className="space-y-4">
            {filteredEmotions.map((emotion) => {
              const isOpen = openEmotions.includes(emotion.id);

              return (
                <Card
                  key={emotion.id}
                  className="border-2 border-gray-200 hover:border-mint-200 transition-all duration-300"
                >
                  <Collapsible
                    open={isOpen}
                    onOpenChange={() => toggleEmotion(emotion.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-3xl">{emotion.emoji}</span>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {emotion.name}
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge
                                  className={getIntensityColor(
                                    emotion.intensity,
                                  )}
                                  variant="secondary"
                                >
                                  {emotion.intensity} intensity
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {emotion.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="pt-4 space-y-6">
                          {/* Description */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                              <Info className="w-4 h-4" />
                              <span>What is {emotion.name}?</span>
                            </h4>
                            <p className="text-gray-700 leading-relaxed">
                              {emotion.description}
                            </p>
                          </div>

                          {/* Physical Signs */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                              <Heart className="w-4 h-4" />
                              <span>Physical Signs</span>
                            </h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {emotion.physicalSigns.map((sign, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-gray-700 flex items-start space-x-2"
                                >
                                  <span className="text-mint-500 mt-1">•</span>
                                  <span>{sign}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Triggers */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                              <Zap className="w-4 h-4" />
                              <span>Common Triggers</span>
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {emotion.triggers.map((trigger, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs border-orange-200 text-orange-700"
                                >
                                  {trigger}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Management Strategies */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                              <Target className="w-4 h-4" />
                              <span>Management Strategies</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <h5 className="font-medium text-green-900 mb-2 flex items-center space-x-1">
                                  <Wind className="w-3 h-3" />
                                  <span>Immediate Relief</span>
                                </h5>
                                <ul className="space-y-1">
                                  {emotion.managementStrategies.immediate.map(
                                    (strategy, index) => (
                                      <li
                                        key={index}
                                        className="text-xs text-green-700"
                                      >
                                        • {strategy}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>

                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <h5 className="font-medium text-blue-900 mb-2 flex items-center space-x-1">
                                  <Shield className="w-3 h-3" />
                                  <span>Long-term</span>
                                </h5>
                                <ul className="space-y-1">
                                  {emotion.managementStrategies.longTerm.map(
                                    (strategy, index) => (
                                      <li
                                        key={index}
                                        className="text-xs text-blue-700"
                                      >
                                        • {strategy}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>

                              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <h5 className="font-medium text-purple-900 mb-2 flex items-center space-x-1">
                                  <Brain className="w-3 h-3" />
                                  <span>Professional Help</span>
                                </h5>
                                <ul className="space-y-1">
                                  {emotion.managementStrategies.professional.map(
                                    (strategy, index) => (
                                      <li
                                        key={index}
                                        className="text-xs text-purple-700"
                                      >
                                        • {strategy}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* When to Seek Help */}
                          {emotion.whenToSeekHelp.length > 0 && (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                              <h4 className="font-semibold text-red-900 mb-2 flex items-center space-x-2">
                                <Lightbulb className="w-4 h-4" />
                                <span>When to Seek Professional Help</span>
                              </h4>
                              <ul className="space-y-1">
                                {emotion.whenToSeekHelp.map((sign, index) => (
                                  <li
                                    key={index}
                                    className="text-sm text-red-700 flex items-start space-x-2"
                                  >
                                    <span className="text-red-500 mt-1">•</span>
                                    <span>{sign}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Related Emotions */}
                          {emotion.relatedEmotions.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                Related Emotions
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {emotion.relatedEmotions.map(
                                  (related, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs border-mint-200 text-mint-700"
                                    >
                                      {related}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>

          {/* No Results */}
          {filteredEmotions.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No emotions found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or category filters.
              </p>
            </div>
          )}

          {/* Educational Note */}
          <div className="p-4 bg-mint-50 rounded-lg border border-mint-200">
            <p className="text-sm text-mint-700">
              <strong>💡 Remember:</strong> All emotions are valid and serve a
              purpose. This encyclopedia is for educational purposes and doesn't
              replace professional mental health advice. If you're experiencing
              persistent or severe emotional distress, please consider speaking
              with a mental health professional.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
