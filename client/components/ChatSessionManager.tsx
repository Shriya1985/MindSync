import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { chatStorageUtils } from "@/utils/geminiChatAPI";
import {
  MessageCircle,
  Download,
  Trash2,
  Database,
  RefreshCw,
  Info,
} from "lucide-react";

export function ChatSessionManager() {
  const [sessions, setSessions] = useState<any>({});
  const [stats, setStats] = useState({ totalSessions: 0, totalMessages: 0 });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const allSessions = chatStorageUtils.getAllConversations();
    setSessions(allSessions);

    // Calculate stats
    const sessionCount = Object.keys(allSessions).length;
    const messageCount = Object.values(allSessions).reduce(
      (total: number, session: any) => total + (session.messages?.length || 0),
      0
    );

    setStats({
      totalSessions: sessionCount,
      totalMessages: messageCount,
    });
  };

  const exportSessions = () => {
    const exportData = chatStorageUtils.exportForDatabase();
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindsync-chat-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllSessions = () => {
    if (confirm("Are you sure you want to clear all chat sessions? This cannot be undone.")) {
      chatStorageUtils.clearAllSessions();
      loadSessions();
    }
  };

  const startNewConversation = () => {
    const newSessionId = chatStorageUtils.startNewConversation();
    loadSessions();
    return newSessionId;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <span>Chat Session Manager</span>
          <Badge variant="secondary" className="ml-auto">
            Local Storage
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
            <div className="text-sm text-blue-600">Chat Sessions</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.totalMessages}</div>
            <div className="text-sm text-green-600">Total Messages</div>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Database Migration Ready</p>
              <p>
                Your conversations are stored locally and structured for easy database migration. 
                Export your data when you're ready to connect to your database.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={exportSessions}
            variant="outline"
            className="flex items-center space-x-2"
            disabled={stats.totalSessions === 0}
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </Button>
          
          <Button
            onClick={() => startNewConversation()}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Session</span>
          </Button>
        </div>

        {/* Session List */}
        {stats.totalSessions > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Recent Sessions</h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {Object.entries(sessions)
                .sort(([,a]: any, [,b]: any) => 
                  new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
                )
                .slice(0, 5)
                .map(([sessionId, session]: [string, any]) => (
                  <div
                    key={sessionId}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                  >
                    <div>
                      <span className="font-medium">
                        {sessionId.slice(0, 12)}...
                      </span>
                      <span className="text-gray-500 ml-2">
                        {session.messages?.length || 0} messages
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(session.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Database Migration Example */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Database Schema Example</span>
          </div>
          <pre className="text-xs text-gray-600 overflow-x-auto">
{`CREATE TABLE chat_sessions (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  created_at TIMESTAMP,
  last_message_at TIMESTAMP
);

CREATE TABLE chat_messages (
  id VARCHAR PRIMARY KEY,
  session_id VARCHAR REFERENCES chat_sessions(id),
  content TEXT NOT NULL,
  sender ENUM('user', 'ai') NOT NULL,
  mood VARCHAR,
  sentiment VARCHAR,
  created_at TIMESTAMP
);`}
          </pre>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t">
          <Button
            onClick={clearAllSessions}
            variant="destructive"
            size="sm"
            className="flex items-center space-x-2"
            disabled={stats.totalSessions === 0}
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Sessions</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
