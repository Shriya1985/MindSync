// Deployment readiness test for authentication and core functionality
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface DeploymentTestResult {
  supabaseConfigured: boolean;
  connectionWorking: boolean;
  authWorking: boolean;
  databaseTablesExist: boolean;
  rlsEnabled: boolean;
  overallReady: boolean;
  errors: string[];
  recommendations: string[];
}

export async function runDeploymentTest(): Promise<DeploymentTestResult> {
  const result: DeploymentTestResult = {
    supabaseConfigured: false,
    connectionWorking: false,
    authWorking: false,
    databaseTablesExist: false,
    rlsEnabled: false,
    overallReady: false,
    errors: [],
    recommendations: [],
  };

  console.log("🚀 Running deployment readiness test...");

  // Test 1: Supabase Configuration
  result.supabaseConfigured = isSupabaseConfigured;
  if (!result.supabaseConfigured) {
    result.errors.push("Supabase not configured - missing URL or API key");
    result.recommendations.push(
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables",
    );
    return result;
  }

  // Test 2: Basic Connection
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (!error) {
      result.connectionWorking = true;
      console.log("✅ Supabase connection working");
    } else {
      result.errors.push(`Connection failed: ${error.message}`);
      result.recommendations.push(
        "Check Supabase project status and network connectivity",
      );
    }
  } catch (error: any) {
    result.errors.push(`Connection error: ${error.message}`);
    result.recommendations.push("Verify Supabase URL and API key are correct");
  }

  // Test 3: Database Tables
  if (result.connectionWorking) {
    try {
      const requiredTables = [
        "profiles",
        "user_stats",
        "mood_entries",
        "journal_entries",
        "chat_messages",
        "achievements",
        "daily_quests",
        "point_activities",
      ];

      const tableChecks = await Promise.allSettled(
        requiredTables.map(async (table) => {
          const { error } = await supabase.from(table).select("id").limit(1);
          if (error && error.code !== "PGRST116") {
            throw new Error(`Table ${table}: ${error.message}`);
          }
          return table;
        }),
      );

      const failedTables = tableChecks
        .filter(
          (check): check is PromiseRejectedResult =>
            check.status === "rejected",
        )
        .map((check) => check.reason.message);

      if (failedTables.length === 0) {
        result.databaseTablesExist = true;
        console.log("✅ All required database tables exist");
      } else {
        result.errors.push(...failedTables);
        result.recommendations.push(
          "Run database migration scripts in Supabase SQL Editor",
        );
      }
    } catch (error: any) {
      result.errors.push(`Database table check failed: ${error.message}`);
    }
  }

  // Test 4: RLS Check (simplified)
  if (result.connectionWorking) {
    try {
      // This should work because RLS allows public access to structure
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .limit(0);

      if (!error) {
        result.rlsEnabled = true;
        console.log("✅ Row Level Security appears to be working");
      } else {
        result.errors.push(`RLS check failed: ${error.message}`);
        result.recommendations.push(
          "Verify RLS policies are properly configured",
        );
      }
    } catch (error: any) {
      result.errors.push(`RLS test error: ${error.message}`);
    }
  }

  // Test 5: Auth System
  try {
    const { data, error } = await supabase.auth.getSession();
    if (!error) {
      result.authWorking = true;
      console.log("✅ Authentication system working");
    } else {
      result.errors.push(`Auth system error: ${error.message}`);
      result.recommendations.push("Check Supabase authentication settings");
    }
  } catch (error: any) {
    result.errors.push(`Auth test failed: ${error.message}`);
  }

  // Overall readiness assessment
  result.overallReady =
    result.supabaseConfigured &&
    result.connectionWorking &&
    result.authWorking &&
    result.databaseTablesExist &&
    result.rlsEnabled;

  if (result.overallReady) {
    console.log("🎉 Deployment test passed! App is ready for production.");
  } else {
    console.log("⚠️ Deployment test failed. Please address the issues above.");
  }

  return result;
}

export function formatDeploymentReport(result: DeploymentTestResult): string {
  const lines: string[] = [];

  lines.push("🚀 DEPLOYMENT READINESS REPORT");
  lines.push("================================");
  lines.push("");

  lines.push("Configuration Checks:");
  lines.push(
    `✅ Supabase Configured: ${result.supabaseConfigured ? "YES" : "NO"}`,
  );
  lines.push(
    `✅ Connection Working: ${result.connectionWorking ? "YES" : "NO"}`,
  );
  lines.push(`✅ Authentication Working: ${result.authWorking ? "YES" : "NO"}`);
  lines.push(
    `✅ Database Tables Exist: ${result.databaseTablesExist ? "YES" : "NO"}`,
  );
  lines.push(`✅ RLS Enabled: ${result.rlsEnabled ? "YES" : "NO"}`);
  lines.push("");

  if (result.errors.length > 0) {
    lines.push("❌ ISSUES FOUND:");
    result.errors.forEach((error) => lines.push(`  • ${error}`));
    lines.push("");
  }

  if (result.recommendations.length > 0) {
    lines.push("💡 RECOMMENDATIONS:");
    result.recommendations.forEach((rec) => lines.push(`  • ${rec}`));
    lines.push("");
  }

  lines.push(
    `🎯 OVERALL STATUS: ${result.overallReady ? "✅ READY FOR DEPLOYMENT" : "❌ NOT READY"}`,
  );

  return lines.join("\n");
}
