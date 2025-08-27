import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Database,
  Shield,
  User,
  Zap,
} from "lucide-react";
import {
  runSupabaseHealthCheck,
  type HealthCheckResult,
} from "@/utils/supabaseHealthCheck";

export default function SupabaseHealthCheck() {
  const [result, setResult] = useState<HealthCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runCheck = async () => {
    setIsLoading(true);
    try {
      console.log("🚀 Starting health check...");

      // Add overall timeout of 10 seconds
      const healthCheckPromise = runSupabaseHealthCheck();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Health check timed out after 10 seconds")),
          10000,
        ),
      );

      const checkResult = await Promise.race([
        healthCheckPromise,
        timeoutPromise,
      ]);
      setResult(checkResult);
      console.log("✅ Health check completed successfully");
    } catch (error: any) {
      console.error("❌ Health check failed:", error);

      // Create a fallback result if the check fails completely
      const fallbackResult = {
        configured: false,
        connected: false,
        authenticated: false,
        rlsWorking: false,
        details: [],
        errors: [`Health check failed: ${error.message}`],
      };
      setResult(fallbackResult);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  const getStatusIcon = (status: boolean, loading: boolean = false) => {
    if (loading) return <RefreshCw className="w-4 h-4 animate-spin" />;
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getOverallStatus = () => {
    if (!result) return { text: "Checking...", color: "gray" };

    if (result.configured && result.connected && result.errors.length === 0) {
      return { text: "Ready for Deployment", color: "green" };
    } else if (result.configured && result.connected) {
      return { text: "Needs Attention", color: "yellow" };
    } else {
      return { text: "Not Ready", color: "red" };
    }
  };

  const status = getOverallStatus();

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Database className="w-5 h-5" />
          Supabase Connection Status
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              status.color === "green"
                ? "default"
                : status.color === "yellow"
                  ? "secondary"
                  : "destructive"
            }
            className="flex items-center gap-1"
          >
            {status.color === "green" && <CheckCircle className="w-3 h-3" />}
            {status.color === "yellow" && <AlertCircle className="w-3 h-3" />}
            {status.color === "red" && <XCircle className="w-3 h-3" />}
            {status.text}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={runCheck}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            {getStatusIcon(result?.configured || false, isLoading)}
            <span className="text-sm">Configuration</span>
          </div>

          <div className="flex items-center gap-2">
            {getStatusIcon(result?.connected || false, isLoading)}
            <span className="text-sm">Connection</span>
          </div>

          <div className="flex items-center gap-2">
            {getStatusIcon(result?.authenticated || false, isLoading)}
            <User className="w-4 h-4" />
            <span className="text-sm">Authentication</span>
          </div>

          <div className="flex items-center gap-2">
            {getStatusIcon(result?.rlsWorking || false, isLoading)}
            <Shield className="w-4 h-4" />
            <span className="text-sm">Security (RLS)</span>
          </div>
        </div>

        {/* Details */}
        {result && result.details.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-700 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Working Features:
            </h4>
            <div className="space-y-1">
              {result.details.map((detail, index) => (
                <div
                  key={index}
                  className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded"
                >
                  {detail}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors */}
        {result && result.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-700 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Issues Found:
            </h4>
            <div className="space-y-1">
              {result.errors.map((error, index) => (
                <div
                  key={index}
                  className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded"
                >
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deployment Readiness */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Deployment Status:</span>
            <div className="flex items-center gap-2">
              <Zap
                className={`w-4 h-4 ${status.color === "green" ? "text-green-500" : "text-gray-400"}`}
              />
              <span
                className={`text-sm font-medium ${
                  status.color === "green"
                    ? "text-green-700"
                    : status.color === "yellow"
                      ? "text-yellow-700"
                      : "text-red-700"
                }`}
              >
                {status.text}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
