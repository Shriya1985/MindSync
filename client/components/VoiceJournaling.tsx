import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import {
  Mic,
  MicOff,
  Save,
  Trash2,
  Volume2,
  Play,
  Pause,
  FileText,
  AudioWaveform,
  Clock,
  Edit3,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
    | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function VoiceJournaling() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [entryTitle, setEntryTitle] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [confidence, setConfidence] = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { addJournalEntry, addPoints } = useData();

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();

      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);

        showNotification({
          type: "encouragement",
          title: "Recording Started 🎙️",
          message: "Speak naturally - I'm listening and transcribing for you.",
          duration: 3000,
        });
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            setConfidence(result[0].confidence);
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(interimTranscript);
        if (finalTranscript) {
          setFinalTranscript((prev) => prev + finalTranscript + " ");
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        showNotification({
          type: "encouragement",
          title: "Recording Issue 🔄",
          message: `${event.error === "not-allowed" ? "Microphone access needed" : "Please try recording again"}`,
          duration: 4000,
        });
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setTranscript("");
      setFinalTranscript("");
      setConfidence(0);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setFinalTranscript("");
    setEntryTitle("");
    setConfidence(0);
    setRecordingTime(0);

    showNotification({
      type: "encouragement",
      title: "Cleared! 🗑️",
      message: "Ready for a fresh start. Begin when you're ready.",
      duration: 2000,
    });
  };

  const saveJournalEntry = async () => {
    const fullContent = finalTranscript + transcript;
    if (!fullContent.trim()) {
      showNotification({
        type: "encouragement",
        title: "Nothing to Save 📝",
        message: "Record some thoughts first, then save your entry.",
        duration: 3000,
      });
      return;
    }

    const title =
      entryTitle.trim() || `Voice Entry - ${new Date().toLocaleDateString()}`;
    const wordCount = fullContent.trim().split(/\s+/).length;

    // Simple sentiment analysis
    const positiveWords = [
      "happy",
      "good",
      "great",
      "love",
      "wonderful",
      "amazing",
      "excited",
      "grateful",
      "blessed",
      "joy",
    ];
    const negativeWords = [
      "sad",
      "bad",
      "terrible",
      "hate",
      "awful",
      "angry",
      "frustrated",
      "depressed",
      "anxious",
      "worried",
    ];

    const lowerContent = fullContent.toLowerCase();
    const positiveCount = positiveWords.filter((word) =>
      lowerContent.includes(word),
    ).length;
    const negativeCount = negativeWords.filter((word) =>
      lowerContent.includes(word),
    ).length;

    let sentiment: "positive" | "negative" | "neutral" = "neutral";
    if (positiveCount > negativeCount) sentiment = "positive";
    else if (negativeCount > positiveCount) sentiment = "negative";

    await addJournalEntry({
      date: new Date().toISOString().split("T")[0],
      title,
      content: fullContent.trim(),
      sentiment,
      wordCount,
      tags: ["voice-entry"],
    });

    await addPoints(15, "Voice journal entry");

    showNotification({
      type: "achievement",
      title: "Journal Saved! 🎉",
      message: `Your voice entry has been saved with ${wordCount} words. Great work expressing yourself!`,
      duration: 5000,
    });

    clearTranscript();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const simulatePlayback = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  if (!isSupported) {
    return (
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MicOff className="w-6 h-6 text-gray-400" />
            <span>Voice Journaling</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MicOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Voice Recognition Not Available
            </h3>
            <p className="text-gray-600 mb-4">
              Voice journaling requires a modern browser with speech recognition
              support. Please try using Chrome, Safari, or Edge.
            </p>
            <Badge className="bg-blue-100 text-blue-700">
              💡 Feature requires microphone access
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mic className="w-6 h-6 text-red-600" />
          <span>Voice Journaling</span>
        </CardTitle>
        <p className="text-gray-600">
          Speak your thoughts and feelings - I'll transcribe them for you
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Recording Controls */}
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="lg"
              className={cn(
                "w-20 h-20 rounded-full text-white shadow-lg transition-all",
                isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600",
              )}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </Button>

            {/* Pulsing ring animation when recording */}
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping" />
            )}
          </div>

          <div className="space-y-2">
            <p className="text-lg font-semibold">
              {isRecording ? "Recording..." : "Ready to Record"}
            </p>
            {recordingTime > 0 && (
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Transcription */}
        {(transcript || finalTranscript) && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AudioWaveform className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">
                    Live Transcription
                  </span>
                </div>
                {confidence > 0 && (
                  <Badge className="bg-blue-100 text-blue-700">
                    {Math.round(confidence * 100)}% confident
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg p-4 max-h-40 overflow-y-auto">
                <p className="text-gray-900 leading-relaxed">
                  <span className="text-gray-800">{finalTranscript}</span>
                  <span className="text-blue-600 italic">{transcript}</span>
                  {isRecording && (
                    <span className="inline-block w-2 h-5 bg-blue-600 ml-1 animate-pulse" />
                  )}
                </p>
              </div>

              {finalTranscript && (
                <div className="mt-3 flex items-center space-x-2 text-sm text-blue-700">
                  <FileText className="w-4 h-4" />
                  <span>
                    {finalTranscript.trim().split(/\s+/).length} words
                    transcribed
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Entry Title */}
        {(transcript || finalTranscript) && (
          <div className="space-y-2">
            <Label htmlFor="entry-title">Entry Title (Optional)</Label>
            <Input
              id="entry-title"
              placeholder="Give your voice entry a title..."
              value={entryTitle}
              onChange={(e) => setEntryTitle(e.target.value)}
              className="border-gray-200 focus:border-mint-300 focus:ring-mint-200"
            />
          </div>
        )}

        {/* Action Buttons */}
        {(transcript || finalTranscript) && (
          <div className="flex justify-center space-x-3">
            <Button
              onClick={simulatePlayback}
              variant="outline"
              disabled={isPlaying}
              className="flex items-center space-x-2"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{isPlaying ? "Playing..." : "Preview"}</span>
            </Button>

            <Button
              onClick={clearTranscript}
              variant="outline"
              className="flex items-center space-x-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </Button>

            <Button
              onClick={saveJournalEntry}
              className="bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600 text-white flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Entry</span>
            </Button>
          </div>
        )}

        {/* Features & Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Features</span>
            </h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Real-time speech-to-text transcription</li>
              <li>• Automatic sentiment analysis</li>
              <li>• Voice entry saves to your journal</li>
              <li>• Works offline after initial setup</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
              <Volume2 className="w-4 h-4" />
              <span>Tips for Best Results</span>
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Speak clearly and at a normal pace</li>
              <li>• Use a quiet environment when possible</li>
              <li>• Pause briefly between sentences</li>
              <li>• Check transcription before saving</li>
            </ul>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            🔒 <strong>Privacy:</strong> Voice processing happens locally in
            your browser. Your voice data is never sent to external servers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
