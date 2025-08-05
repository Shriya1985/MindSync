import { ReactNode, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Emergency bypass for stuck loading after 15 seconds
  const [emergencyBypass, setEmergencyBypass] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        console.warn(
          "🚨 Emergency bypass: Auth loading took too long, redirecting to auth page",
        );
        setEmergencyBypass(true);
      }, 15000); // 15 second emergency bypass

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Emergency redirect if stuck loading
  if (emergencyBypass) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-sky-50 flex items-center justify-center">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-mint-500 to-sky-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading MindSync...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to auth page if not authenticated, preserving the intended destination
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
