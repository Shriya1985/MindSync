import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Database, Wifi } from "lucide-react";
import { testSupabaseConnection, isSupabaseConfigured } from "@/lib/supabase";
import { showNotification } from "@/components/ui/notification-system";

interface SupabaseEnforcerProps {
  children: React.ReactNode;
  onConnectionEstablished?: () => void;
}

export default function SupabaseEnforcer({ 
  children, 
  onConnectionEstablished 
}: SupabaseEnforcerProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [hasChecked, setHasChecked] = useState(false);

  const testConnection = async () => {
    if (!isSupabaseConfigured) {
      showNotification({
        type: "encouragement",
        title: "Configuration Required",
        message: "Supabase must be configured to use this application.",
        duration: 5000,
      });
      return false;
    }

    setIsRetrying(true);
    try {
      const connected = await testSupabaseConnection();
      setIsConnected(connected);
      setHasChecked(true);
      
      if (connected) {
        console.log("✅ Supabase connection established");
        onConnectionEstablished?.();
        showNotification({
          type: "encouragement",
          title: "Connected",
          message: "Successfully connected to database.",
          duration: 2000,
        });
      } else {
        console.error("❌ Supabase connection failed");
        setRetryCount(prev => prev + 1);
      }
      
      return connected;
    } catch (error) {
      console.error("Connection test error:", error);
      setIsConnected(false);
      setRetryCount(prev => prev + 1);
      return false;
    } finally {
      setIsRetrying(false);
    }
  };

  // Auto-retry logic
  useEffect(() => {
    if (!hasChecked) {
      testConnection();
    }
  }, [hasChecked]);

  useEffect(() => {
    if (!isConnected && hasChecked && retryCount > 0 && retryCount < 5) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000); // Exponential backoff
      console.log(`🔄 Retrying connection in ${retryDelay}ms (attempt ${retryCount}/5)`);
      
      const timer = setTimeout(() => {
        testConnection();
      }, retryDelay);

      return () => clearTimeout(timer);
    }
  }, [isConnected, hasChecked, retryCount]);

  const handleManualRetry = () => {
    setRetryCount(0);
    testConnection();
  };

  // Show connection screen if not connected
  if (!isConnected && hasChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-sky-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Database className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Database Connection Required</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  {!isSupabaseConfigured 
                    ? "Supabase not configured" 
                    : "Unable to connect to database"}
                </span>
              </div>
              
              {retryCount > 0 && retryCount < 5 && (
                <div className="text-xs text-gray-500">
                  Retry attempt {retryCount}/5
                </div>
              )}
              
              {retryCount >= 5 && (
                <div className="text-xs text-red-500">
                  Maximum retry attempts reached. Please check your connection.
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleManualRetry} 
                disabled={isRetrying}
                className="w-full"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 mr-2" />
                    Retry Connection
                  </>
                )}
              </Button>
              
              <div className="text-xs text-gray-600 space-y-1">
                <p>Make sure:</p>
                <ul className="text-left space-y-1">
                  <li>• Your internet connection is working</li>
                  <li>• Supabase project is active</li>
                  <li>• CORS settings allow your domain</li>
                  <li>• Database migrations are complete</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading while checking initial connection
  if (!hasChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-mint-600 animate-spin" />
          </div>
          <p className="text-gray-600">Connecting to database...</p>
        </div>
      </div>
    );
  }

  // Render children once connected
  return <>{children}</>;
}
