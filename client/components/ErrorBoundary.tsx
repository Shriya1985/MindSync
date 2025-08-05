import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleRefresh = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl mb-4 mx-auto">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center">
                We encountered an unexpected error. Don't worry, your data is safe.
                Please try refreshing the page or return to the homepage.
              </p>
              
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <summary className="cursor-pointer font-medium text-red-800 mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="text-sm text-red-700 font-mono whitespace-pre-wrap">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={this.handleRefresh}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
