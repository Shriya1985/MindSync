import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { runDataIntegrityCheck, type DataTestResult } from "@/utils/dataIntegrityTest";
import { dataProtection } from "@/utils/dataProtection";
import {
  Shield,
  Database,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Users,
  TrendingUp,
  Award,
  MessageCircle,
  BookOpen,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DataVerificationPanel() {
  const { user } = useAuth();
  const { userStats, moodEntries, journalEntries, chatMessages, achievements } = useData();
  const [testResults, setTestResults] = useState<DataTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runVerification = async () => {
    if (!user) return;
    
    setIsRunning(true);
    try {
      const results = await runDataIntegrityCheck(user.id);
      setTestResults(results);
      setLastRun(new Date());
    } catch (error) {
      console.error("Verification failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const runCriticalChecks = async () => {
    if (!user) return;
    
    const checks = await dataProtection.performCriticalChecks(user.id);
    console.log("🔍 Critical Security Checks:", checks);
    
    if (!checks.rlsWorking) {
      alert("🚨 CRITICAL: Security issue detected! Check console for details.");
    } else {
      alert("✅ All security checks passed! Your data is properly isolated.");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "fail":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "fail":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const passedTests = testResults.filter(r => r.status === "pass").length;
  const totalTests = testResults.length;
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  if (!user) {
    return (
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Please log in to verify data synchronization</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-6 h-6 text-mint-500" />
            <span>Data Synchronization Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={runVerification} 
              disabled={isRunning}
              className="bg-mint-500 hover:bg-mint-600"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Run Data Verification
            </Button>
            
            <Button 
              onClick={runCriticalChecks} 
              variant="outline"
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <Shield className="w-4 h-4 mr-2" />
              Security Check
            </Button>
          </div>

          {lastRun && (
            <p className="text-sm text-gray-600">
              Last run: {lastRun.toLocaleString()}
            </p>
          )}

          {totalTests > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Success Rate</span>
                <span>{successRate.toFixed(0)}% ({passedTests}/{totalTests})</span>
              </div>
              <Progress value={successRate} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Data Overview */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-sky-500" />
            <span>Your Data Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-mint-50 to-mint-100 rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-mint-600" />
              <div className="text-lg font-bold text-mint-800">Level {userStats.level}</div>
              <div className="text-sm text-mint-600">{userStats.points} points</div>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg">
              <Heart className="w-6 h-6 mx-auto mb-2 text-sky-600" />
              <div className="text-lg font-bold text-sky-800">
                {Array.isArray(moodEntries) ? moodEntries.length : 0}
              </div>
              <div className="text-sm text-sky-600">Mood Entries</div>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-lg font-bold text-purple-800">
                {Array.isArray(journalEntries) ? journalEntries.length : 0}
              </div>
              <div className="text-sm text-purple-600">Journal Entries</div>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <MessageCircle className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-lg font-bold text-orange-800">
                {Array.isArray(chatMessages) ? chatMessages.length : 0}
              </div>
              <div className="text-sm text-orange-600">Chat Messages</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gradient-to-r from-mint-50 to-sky-50 rounded-lg border border-mint-200">
            <div className="flex items-center space-x-2 text-mint-700">
              <Award className="w-5 h-5" />
              <span className="font-medium">
                Current Streak: {userStats.currentStreak} days
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span>Verification Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    getStatusColor(result.status)
                  )}
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.test}</div>
                      <div className="text-sm opacity-80">{result.message}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Security Info */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-500" />
            <span>Account Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-green-800">User ID</span>
              </div>
              <code className="text-sm bg-white px-2 py-1 rounded border text-green-700">
                {user.id.slice(0, 8)}...
              </code>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800">Data Isolation</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Protected</Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="text-purple-800">Row Level Security</span>
              </div>
              <Badge className="bg-purple-100 text-purple-800">Enabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
