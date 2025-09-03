import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Rocket,
  Database,
  Shield,
  Key,
} from "lucide-react";
import {
  runDeploymentTest,
  formatDeploymentReport,
  type DeploymentTestResult,
} from "@/utils/deploymentTest";

export default function DeploymentTest() {
  const [result, setResult] = useState<DeploymentTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    try {
      const testResult = await runDeploymentTest();
      setResult(testResult);

      // Also log the formatted report to console
      const report = formatDeploymentReport(testResult);
      console.log(report);
    } catch (error) {
      console.error("Deployment test failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getOverallStatus = () => {
    if (!result) return { text: "Not Tested", color: "gray" };

    if (result.overallReady) {
      return { text: "Ready for Deployment", color: "green" };
    } else {
      return { text: "Issues Found", color: "red" };
    }
  };

  const status = getOverallStatus();

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Rocket className="w-5 h-5" />
          Deployment Readiness Test
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              status.color === "green"
                ? "default"
                : status.color === "red"
                  ? "destructive"
                  : "secondary"
            }
            className="flex items-center gap-1"
          >
            {status.color === "green" && <CheckCircle className="w-3 h-3" />}
            {status.color === "red" && <XCircle className="w-3 h-3" />}
            {status.color === "gray" && <AlertCircle className="w-3 h-3" />}
            {status.text}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={runTest}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Testing..." : "Run Test"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {result && (
          <>
            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(result.supabaseConfigured)}
                <Database className="w-4 h-4" />
                <span className="text-sm">Supabase Configured</span>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(result.connectionWorking)}
                <Database className="w-4 h-4" />
                <span className="text-sm">Connection Working</span>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(result.authWorking)}
                <Key className="w-4 h-4" />
                <span className="text-sm">Authentication Ready</span>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(result.databaseTablesExist)}
                <Database className="w-4 h-4" />
                <span className="text-sm">Database Tables</span>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(result.rlsEnabled)}
                <Shield className="w-4 h-4" />
                <span className="text-sm">Security (RLS)</span>
              </div>
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
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

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-blue-700 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Recommendations:
                </h4>
                <div className="space-y-1">
                  {result.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded"
                    >
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deployment Status */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Deployment Status:</span>
                <div className="flex items-center gap-2">
                  <Rocket
                    className={`w-4 h-4 ${
                      result.overallReady ? "text-green-500" : "text-red-500"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      result.overallReady ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {result.overallReady
                      ? "Ready for Production"
                      : "Needs Configuration"}
                  </span>
                </div>
              </div>

              {result.overallReady && (
                <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                  🎉 All systems operational! Your app is ready for deployment.
                </div>
              )}
            </div>
          </>
        )}

        {!result && (
          <div className="text-center py-8">
            <Rocket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Click "Run Test" to check deployment readiness
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
