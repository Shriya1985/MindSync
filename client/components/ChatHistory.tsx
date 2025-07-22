import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useData } from "@/contexts/DataContext";
import { formatDistanceToNow } from "date-fns";
import {
  MessageCircle,
  Calendar,
  Trash2,
  Clock,
  User,
  Bot,
  Heart,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHistoryProps {
  onClose: () => void;
  onSelectSession?: (sessionId: string) => void;
}

export function ChatHistory({ onClose, onSelectSession }: ChatHistoryProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const {
    chatSessions,
    chatMessages,
    loadChatSession,
    deleteChatSession,
    currentSessionId,
  } = useData();

  // Group messages by date
  const messagesByDate = chatMessages.reduce((acc, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, typeof chatMessages>);

  // Group sessions by date
  const sessionsByDate = chatSessions.reduce((acc, session) => {
    const date = new Date(session.created_at).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {} as Record<string, typeof chatSessions>);

  const uniqueDates = Object.keys(messagesByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this conversation?")) {
      await deleteChatSession(sessionId);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    await loadChatSession(sessionId);
    onSelectSession?.(sessionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Chat History</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex min-h-0">
          {/* Sidebar - Sessions by Date */}
          <div className="w-1/3 pr-4 border-r">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {uniqueDates.map((date) => (
                  <div key={date} className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {formatDistanceToNow(new Date(date), { addSuffix: true })}
                    </h3>
                    
                    {/* Sessions for this date */}
                    {sessionsByDate[date]?.map((session) => (
                      <Card
                        key={session.id}
                        className={cn(
                          "p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                          currentSessionId === session.id && "ring-2 ring-primary"
                        )}
                        onClick={() => handleSelectSession(session.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">
                              {session.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {session.message_count} messages
                            </p>
                            {session.mood && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                <Heart className="w-3 h-3 mr-1" />
                                {session.mood}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDeleteSession(session.id, e)}
                              className="p-1 h-auto opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}

                    {/* Messages without sessions for this date */}
                    {messagesByDate[date] && !sessionsByDate[date] && (
                      <Card
                        className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium">
                              Conversation
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {messagesByDate[date].length} messages
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Card>
                    )}
                  </div>
                ))}

                {uniqueDates.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start chatting to see your history here</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content - Message Preview */}
          <div className="flex-1 pl-4">
            {selectedDate && messagesByDate[selectedDate] ? (
              <div className="h-full flex flex-col">
                <div className="flex-shrink-0 mb-4">
                  <h3 className="text-lg font-semibold">
                    {new Date(selectedDate).toLocaleDateString()}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {messagesByDate[selectedDate].length} messages
                  </p>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="space-y-4">
                    {messagesByDate[selectedDate].map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          message.sender === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg p-3",
                            message.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {message.sender === "user" ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                            <span className="text-xs opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                          {message.mood && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              {message.mood}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to view details</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
