import React, { Component, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

export class DataContextErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error("DataContextErrorBoundary caught error:", error);
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("DataContext error details:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;

    if (newRetryCount <= 3) {
      console.log(`🔄 Retrying DataContext (attempt ${newRetryCount}/3)`);
      this.setState({
        hasError: false,
        error: null,
        retryCount: newRetryCount,
      });
    } else {
      console.log("🔄 Max retries reached, forcing page reload");
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const isContextError = this.state.error?.message?.includes(
        "useData must be used within a DataProvider",
      );

      return (
        <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-sky-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {isContextError ? "Context Loading Issue" : "App Error"}
              </h2>

              <p className="text-gray-600 mb-4">
                {isContextError
                  ? "The app data system is initializing. This usually resolves automatically."
                  : "Something went wrong. Please try again."}
              </p>

              <div className="text-sm text-gray-500 mb-6">
                Retry attempt: {this.state.retryCount}/3
              </div>

              <div className="space-y-3">
                <Button
                  onClick={this.handleRetry}
                  className="w-full bg-mint-500 hover:bg-mint-600"
                  disabled={this.state.retryCount >= 3}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {this.state.retryCount >= 3
                    ? "Reloading Page..."
                    : "Try Again"}
                </Button>

                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Reload Page
                </Button>
              </div>

              {import.meta.env.DEV && (
                <details className="mt-4 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer">
                    Debug Info (Development)
                  </summary>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
