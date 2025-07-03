import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  Database,
  ExternalLink,
  X,
  AlertCircle,
  CheckCircle,
  Cloud,
} from "lucide-react";

export function DatabaseSetupNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed this notice
    const dismissed = localStorage.getItem("database-setup-dismissed");

    if (!isSupabaseConfigured && !dismissed) {
      // Show notice after a short delay to not interrupt the initial load
      setTimeout(() => setIsVisible(true), 3000);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("database-setup-dismissed", "true");
  };

  const handleSetupLater = () => {
    setIsVisible(false);
    // Set a temporary dismiss that expires in 24 hours
    localStorage.setItem("database-setup-dismissed", "temp");
    setTimeout(
      () => {
        localStorage.removeItem("database-setup-dismissed");
      },
      24 * 60 * 60 * 1000,
    ); // 24 hours
  };

  if (!isVisible || isSupabaseConfigured || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <Card className="shadow-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 animate-in slide-in-from-top-4 duration-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <Database className="w-5 h-5 text-blue-600" />
              <span>Database Setup Available</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Currently using local storage</p>
              <p>
                Your data is saved locally but won't sync across devices. Set up
                a database for full features!
              </p>
            </div>
          </div>

          <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
              <Cloud className="w-4 h-4" />
              <span>Database Benefits:</span>
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Cross-device synchronization</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Secure cloud backup</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Never lose your data</span>
              </li>
            </ul>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={() =>
                window.open(
                  "https://github.com/your-repo/blob/main/SUPABASE_SETUP.md",
                  "_blank",
                )
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Setup Guide
            </Button>
            <Button
              onClick={handleSetupLater}
              variant="outline"
              className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 text-sm"
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-blue-600 text-center">
            Setup takes ~10 minutes • Free tier available
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
