import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, XCircle, Database, Wifi, WifiOff } from "lucide-react";

export function SupabaseTestPanel() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [tables, setTables] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { user, isAuthenticated } = useAuth();

  const expectedTables = [
    "profiles", "user_stats", "mood_entries", "journal_entries", 
    "chat_messages", "chat_sessions", "achievements", "daily_quests", "point_activities"
  ];

  useEffect(() => {
    if (isSupabaseConfigured) {
      checkConnection();
      checkTables();
    }
  }, []);

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      setConnectionStatus(error ? "disconnected" : "connected");
    } catch (error) {
      setConnectionStatus("disconnected");
    }
  };

  const checkTables = async () => {
    const results = [];
    const existingTables = [];

    for (const table of expectedTables) {
      try {
        const { data, error } = await supabase.from(table).select("*").limit(0);
        
        if (error) {
          results.push({ table, status: "missing", error: error.message });
        } else {
          results.push({ table, status: "exists" });
          existingTables.push(table);
        }
      } catch (err) {
        results.push({ table, status: "error", error: err.message });
      }
    }

    setTables(existingTables);
    setTestResults(results);
  };

  const runSetupTest = async () => {
    if (!isAuthenticated || !user) {
      alert("Please log in first to test database operations");
      return;
    }

    try {
      // Test adding a mood entry
      const testEntry = {
        user_id: user.id,
        mood: "test",
        rating: 5,
        emoji: "🧪",
        date: new Date().toISOString().split('T')[0],
        notes: "Test entry from Supabase integration"
      };

      const { data, error } = await supabase
        .from("mood_entries")
        .insert(testEntry)
        .select()
        .single();

      if (error) {
        alert(`Database test failed: ${error.message}`);
      } else {
        alert("✅ Database test successful! Test mood entry created.");
        
        // Clean up test entry
        await supabase.from("mood_entries").delete().eq("id", data.id);
      }
    } catch (error) {
      alert(`Database test error: ${error.message}`);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-amber-800">
            <WifiOff className="w-5 h-5" />
            <span>Supabase Not Configured</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700">
            Supabase is not configured. The app is using localStorage fallback.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Database className="w-5 h-5" />
          <span>Supabase Integration Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Connection:</span>
          {connectionStatus === "checking" && (
            <Badge variant="secondary">Checking...</Badge>
          )}
          {connectionStatus === "connected" && (
            <Badge className="bg-green-100 text-green-800">
              <Wifi className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
          {connectionStatus === "disconnected" && (
            <Badge variant="destructive">
              <WifiOff className="w-3 h-3 mr-1" />
              Disconnected
            </Badge>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Database Tables ({tables.length}/{expectedTables.length})</h4>
          <div className="grid grid-cols-1 gap-1 text-xs">
            {testResults.map(({ table, status, error }) => (
              <div key={table} className="flex items-center space-x-2">
                {status === "exists" ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-600" />
                )}
                <span className={status === "exists" ? "text-green-700" : "text-red-700"}>
                  {table}
                </span>
                {error && <span className="text-red-500 text-xs">({error})</span>}
              </div>
            ))}
          </div>
        </div>

        {isAuthenticated && tables.length > 0 && (
          <Button 
            onClick={runSetupTest}
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Test Database Operations
          </Button>
        )}

        {tables.length < expectedTables.length && (
          <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
            <strong>Setup needed:</strong> Run the migration SQL in your Supabase dashboard to create missing tables.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
