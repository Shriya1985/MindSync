import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import {
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

export function SupabaseConnectionStatus() {
  // Safe context access
  let dataContext;
  try {
    dataContext = useData();
  } catch (error) {
    console.error(
      "SupabaseConnectionStatus: DataContext not available:",
      error,
    );
    // Return minimal component if context fails
    return (
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-gray-100">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium text-gray-900">Database</span>
              <div className="text-sm text-gray-600">Initializing...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { testConnection, forceSync, runDatabaseDiagnostics } = dataContext;
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Test connection on mount
  useEffect(() => {
    checkConnection();

    // Check connection every 10 seconds for more responsive status
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    setIsTesting(true);
    try {
      // Add timeout to prevent hanging
      const connectionPromise = testConnection();
      const timeoutPromise = new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error("Connection test timeout")), 5000),
      );

      const status = await Promise.race([connectionPromise, timeoutPromise]);
      setIsConnected(status);
    } catch (error) {
      console.error("Connection test failed:", error);
      setIsConnected(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      // Add timeout to prevent hanging
      const syncPromise = forceSync();
      const timeoutPromise = new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error("Sync timeout")), 5000),
      );

      const success = await Promise.race([syncPromise, timeoutPromise]);
      if (success) {
        setLastSync(new Date());
        await checkConnection(); // Retest connection after sync
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDiagnostics = async () => {
    console.log("🔍 Running database diagnostics...");
    await runDatabaseDiagnostics();
    console.log("✅ Diagnostics complete - check console for results");
  };

  const getStatusColor = () => {
    if (isConnected === null) return "bg-gray-100";
    return isConnected ? "bg-green-100" : "bg-red-100";
  };

  const getStatusTextColor = () => {
    if (isConnected === null) return "text-gray-600";
    return isConnected ? "text-green-700" : "text-red-700";
  };

  const getStatusIcon = () => {
    if (isTesting) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (isConnected === null) return <Database className="w-4 h-4" />;
    return isConnected ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getStatusText = () => {
    if (isTesting) return "Testing...";
    if (isConnected === null) return "Unknown";
    return isConnected ? "Connected" : "Disconnected";
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${getStatusColor()}`}>
              {getStatusIcon()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">Supabase</span>
                <Badge
                  className={`${getStatusColor()} ${getStatusTextColor()}`}
                >
                  {getStatusText()}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                {lastSync ? (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Last sync: {lastSync.toLocaleTimeString()}</span>
                  </div>
                ) : (
                  "Real-time database sync"
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={checkConnection}
              disabled={isTesting}
              variant="outline"
              size="sm"
              title="Test Connection"
            >
              {isTesting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
            </Button>

            <Button
              onClick={handleForceSync}
              disabled={isSyncing || !isConnected}
              variant="outline"
              size="sm"
              title="Force Sync"
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
            </Button>

            <Button
              onClick={handleDiagnostics}
              variant="outline"
              size="sm"
              title="Run Diagnostics (Check Console)"
            >
              <AlertCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isConnected && (
          <div className="mt-3 text-xs text-green-600 bg-green-50 p-2 rounded">
            ✅ All changes are automatically saved to Supabase database
          </div>
        )}

        {isConnected === false && (
          <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded">
            ⚠️ Using offline mode - data will sync when connection is restored
          </div>
        )}
      </CardContent>
    </Card>
  );
}
