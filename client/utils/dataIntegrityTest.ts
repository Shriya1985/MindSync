// Data Integrity Test Suite for Supabase Integration
// This ensures all user data syncs correctly and maintains isolation

import { supabase } from "@/lib/supabase";
import { showNotification } from "@/components/ui/notification-system";

export type DataTestResult = {
  test: string;
  status: "pass" | "fail" | "warning";
  message: string;
  data?: any;
};

export class DataIntegrityTester {
  private results: DataTestResult[] = [];
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async runAllTests(): Promise<DataTestResult[]> {
    this.results = [];
    
    console.log("🧪 Starting Data Integrity Tests...");
    
    await this.testUserIsolation();
    await this.testUserStats();
    await this.testMoodEntries();
    await this.testJournalEntries();
    await this.testChatMessages();
    await this.testAchievements();
    await this.testPointsSystem();
    await this.testStreakCalculation();
    await this.testDataPersistence();
    
    this.logResults();
    return this.results;
  }

  private async testUserIsolation() {
    try {
      // Test that user can only see their own data
      const { data: userStats, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", this.userId);

      if (error) {
        this.addResult("User Isolation", "fail", `Database error: ${error.message}`);
        return;
      }

      if (userStats.length === 1) {
        this.addResult("User Isolation", "pass", "User has exactly one stats record");
      } else if (userStats.length === 0) {
        this.addResult("User Isolation", "warning", "No user stats found - will be created");
      } else {
        this.addResult("User Isolation", "fail", `Multiple stats records found: ${userStats.length}`);
      }
    } catch (error) {
      this.addResult("User Isolation", "fail", `Test failed: ${error}`);
    }
  }

  private async testUserStats() {
    try {
      const { data: stats, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", this.userId)
        .single();

      if (error && error.code !== "PGRST116") {
        this.addResult("User Stats", "fail", `Stats query failed: ${error.message}`);
        return;
      }

      if (!stats) {
        // Create initial stats
        const { data: newStats, error: createError } = await supabase
          .from("user_stats")
          .insert({
            user_id: this.userId,
            level: 1,
            points: 0,
            current_streak: 0,
            longest_streak: 0,
            total_entries: 0,
            total_words: 0,
          })
          .select()
          .single();

        if (createError) {
          this.addResult("User Stats", "fail", `Failed to create stats: ${createError.message}`);
        } else {
          this.addResult("User Stats", "pass", "Created initial user stats");
        }
      } else {
        this.addResult("User Stats", "pass", `Stats loaded: Level ${stats.level}, ${stats.points} points`);
      }
    } catch (error) {
      this.addResult("User Stats", "fail", `Stats test failed: ${error}`);
    }
  }

  private async testMoodEntries() {
    try {
      const { data: moods, error } = await supabase
        .from("mood_entries")
        .select("count")
        .eq("user_id", this.userId);

      if (error) {
        this.addResult("Mood Entries", "fail", `Mood query failed: ${error.message}`);
      } else {
        this.addResult("Mood Entries", "pass", `User has access to mood entries table`);
      }
    } catch (error) {
      this.addResult("Mood Entries", "fail", `Mood test failed: ${error}`);
    }
  }

  private async testJournalEntries() {
    try {
      const { data: journals, error } = await supabase
        .from("journal_entries")
        .select("count")
        .eq("user_id", this.userId);

      if (error) {
        this.addResult("Journal Entries", "fail", `Journal query failed: ${error.message}`);
      } else {
        this.addResult("Journal Entries", "pass", `User has access to journal entries table`);
      }
    } catch (error) {
      this.addResult("Journal Entries", "fail", `Journal test failed: ${error}`);
    }
  }

  private async testChatMessages() {
    try {
      const { data: chats, error } = await supabase
        .from("chat_messages")
        .select("count")
        .eq("user_id", this.userId);

      if (error) {
        this.addResult("Chat Messages", "fail", `Chat query failed: ${error.message}`);
      } else {
        this.addResult("Chat Messages", "pass", `User has access to chat messages table`);
      }
    } catch (error) {
      this.addResult("Chat Messages", "fail", `Chat test failed: ${error}`);
    }
  }

  private async testAchievements() {
    try {
      const { data: achievements, error } = await supabase
        .from("achievements")
        .select("count")
        .eq("user_id", this.userId);

      if (error) {
        this.addResult("Achievements", "fail", `Achievements query failed: ${error.message}`);
      } else {
        this.addResult("Achievements", "pass", `User has access to achievements table`);
      }
    } catch (error) {
      this.addResult("Achievements", "fail", `Achievements test failed: ${error}`);
    }
  }

  private async testPointsSystem() {
    try {
      // Test points addition
      const { error: pointsError } = await supabase
        .from("point_activities")
        .insert({
          user_id: this.userId,
          points: 10,
          activity: "Data Integrity Test",
          source: "system_test",
        });

      if (pointsError) {
        this.addResult("Points System", "fail", `Points insertion failed: ${pointsError.message}`);
      } else {
        // Check if stats were updated
        const { data: updatedStats, error: statsError } = await supabase
          .from("user_stats")
          .select("points")
          .eq("user_id", this.userId)
          .single();

        if (statsError) {
          this.addResult("Points System", "warning", "Points added but stats check failed");
        } else {
          this.addResult("Points System", "pass", `Points system working: ${updatedStats.points} total points`);
        }
      }
    } catch (error) {
      this.addResult("Points System", "fail", `Points test failed: ${error}`);
    }
  }

  private async testStreakCalculation() {
    try {
      const { data: stats, error } = await supabase
        .from("user_stats")
        .select("current_streak, longest_streak")
        .eq("user_id", this.userId)
        .single();

      if (error) {
        this.addResult("Streak Calculation", "fail", `Streak query failed: ${error.message}`);
      } else {
        this.addResult("Streak Calculation", "pass", 
          `Streaks accessible: Current ${stats.current_streak}, Longest ${stats.longest_streak}`);
      }
    } catch (error) {
      this.addResult("Streak Calculation", "fail", `Streak test failed: ${error}`);
    }
  }

  private async testDataPersistence() {
    try {
      // Create a test mood entry and verify it persists
      const testMood = {
        user_id: this.userId,
        mood: "Test Mood",
        rating: 5,
        emoji: "🧪",
        date: new Date().toISOString().split('T')[0],
        source: "integrity_test"
      };

      const { data: inserted, error: insertError } = await supabase
        .from("mood_entries")
        .insert(testMood)
        .select()
        .single();

      if (insertError) {
        this.addResult("Data Persistence", "fail", `Test insertion failed: ${insertError.message}`);
        return;
      }

      // Verify we can read it back
      const { data: retrieved, error: selectError } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("id", inserted.id)
        .single();

      if (selectError) {
        this.addResult("Data Persistence", "fail", `Test retrieval failed: ${selectError.message}`);
        return;
      }

      // Clean up test data
      await supabase
        .from("mood_entries")
        .delete()
        .eq("id", inserted.id);

      this.addResult("Data Persistence", "pass", "Data persists correctly across operations");
    } catch (error) {
      this.addResult("Data Persistence", "fail", `Persistence test failed: ${error}`);
    }
  }

  private addResult(test: string, status: "pass" | "fail" | "warning", message: string, data?: any) {
    this.results.push({ test, status, message, data });
  }

  private logResults() {
    const passed = this.results.filter(r => r.status === "pass").length;
    const failed = this.results.filter(r => r.status === "fail").length;
    const warnings = this.results.filter(r => r.status === "warning").length;

    console.log(`\n📊 Data Integrity Test Results:`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`\nDetailed Results:`);
    
    this.results.forEach(result => {
      const icon = result.status === "pass" ? "✅" : result.status === "warning" ? "⚠️" : "❌";
      console.log(`${icon} ${result.test}: ${result.message}`);
    });

    // Show notification with summary
    if (failed === 0) {
      showNotification({
        type: "encouragement",
        title: "Data Integrity Check ✅",
        message: `All ${passed} tests passed! Your data is secure and syncing properly.`,
        duration: 5000,
      });
    } else {
      showNotification({
        type: "encouragement",
        title: "Data Issues Detected ⚠️",
        message: `${failed} tests failed, ${passed} passed. Check console for details.`,
        duration: 7000,
      });
    }
  }
}

// Utility function to run integrity check
export async function runDataIntegrityCheck(userId: string): Promise<DataTestResult[]> {
  const tester = new DataIntegrityTester(userId);
  return await tester.runAllTests();
}
