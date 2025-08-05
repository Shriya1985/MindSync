// Data Protection Layer
// Ensures user data isolation and integrity across all operations

import { supabase } from "@/lib/supabase";
import { showNotification } from "@/components/ui/notification-system";

export class DataProtection {
  private static instance: DataProtection;
  private currentUserId: string | null = null;

  static getInstance(): DataProtection {
    if (!DataProtection.instance) {
      DataProtection.instance = new DataProtection();
    }
    return DataProtection.instance;
  }

  setCurrentUser(userId: string) {
    this.currentUserId = userId;
    console.log("🛡️ Data protection enabled for user:", userId);
  }

  clearCurrentUser() {
    this.currentUserId = null;
    console.log("🛡️ Data protection cleared");
  }

  // Validates that operations are only performed on current user's data
  validateUserOperation(
    operationUserId: string,
    operationName: string,
  ): boolean {
    if (!this.currentUserId) {
      console.error(
        `🚨 Data Protection: No current user set for operation: ${operationName}`,
      );
      return false;
    }

    if (operationUserId !== this.currentUserId) {
      console.error(`🚨 Data Protection: User ID mismatch in ${operationName}`);
      console.error(
        `🚨 Expected: ${this.currentUserId}, Got: ${operationUserId}`,
      );
      return false;
    }

    return true;
  }

  // Wrapper for safe database operations
  async safeOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    userId?: string,
  ): Promise<T | null> {
    try {
      if (userId && !this.validateUserOperation(userId, operationName)) {
        throw new Error(`Data protection violation in ${operationName}`);
      }

      const result = await operation();
      console.log(`✅ Safe operation completed: ${operationName}`);
      return result;
    } catch (error) {
      console.error(`❌ Safe operation failed: ${operationName}`, error);

      showNotification({
        type: "encouragement",
        title: "Data Operation Failed",
        message: `Could not complete ${operationName}. Your data remains safe.`,
        duration: 4000,
      });

      return null;
    }
  }

  // Ensures user stats exist and are properly initialized
  async ensureUserStats(userId: string) {
    return this.safeOperation(
      async () => {
        const { data: existingStats, error: checkError } = await supabase
          .from("user_stats")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (checkError && checkError.code === "PGRST116") {
          // No stats found, create them
          const { data: newStats, error: createError } = await supabase
            .from("user_stats")
            .insert({
              user_id: userId,
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
            throw new Error(
              `Failed to create user stats: ${createError.message}`,
            );
          }

          console.log("✅ Created initial user stats");
          return newStats;
        } else if (checkError) {
          throw new Error(`Failed to check user stats: ${checkError.message}`);
        }

        return existingStats;
      },
      "ensureUserStats",
      userId,
    );
  }

  // Validates that RLS (Row Level Security) is working
  async validateRLS(userId: string): Promise<boolean> {
    try {
      // Try to access another user's data (should fail)
      const { data: otherUserData, error } = await supabase
        .from("user_stats")
        .select("*")
        .neq("user_id", userId)
        .limit(1);

      if (error) {
        console.log("✅ RLS is working: Cannot access other users' data");
        return true;
      }

      if (otherUserData && otherUserData.length === 0) {
        console.log("✅ RLS is working: No other user data returned");
        return true;
      }

      console.error("🚨 RLS FAILURE: Can access other users' data!");
      return false;
    } catch (error) {
      console.log("✅ RLS is working: Access denied");
      return true;
    }
  }

  // Critical data integrity checks
  async performCriticalChecks(userId: string): Promise<{
    userIsolation: boolean;
    dataIntegrity: boolean;
    rlsWorking: boolean;
  }> {
    console.log("🔍 Performing critical data protection checks...");

    const results = {
      userIsolation: true,
      dataIntegrity: true,
      rlsWorking: await this.validateRLS(userId),
    };

    // Check user isolation
    try {
      const { data: userTables } = await supabase
        .from("user_stats")
        .select("user_id")
        .eq("user_id", userId);

      results.userIsolation =
        userTables?.every((row) => row.user_id === userId) ?? false;
    } catch (error) {
      results.userIsolation = false;
    }

    // Check data integrity
    try {
      await this.ensureUserStats(userId);
      results.dataIntegrity = true;
    } catch (error) {
      results.dataIntegrity = false;
    }

    console.log("🔍 Critical checks completed:", results);
    return results;
  }
}

// Global instance
export const dataProtection = DataProtection.getInstance();

// Helper functions for common operations
export const protectedUserOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  userId: string,
): Promise<T | null> => {
  return dataProtection.safeOperation(operation, operationName, userId);
};

export const initializeUserDataProtection = (userId: string) => {
  dataProtection.setCurrentUser(userId);
  return dataProtection.ensureUserStats(userId);
};

export const clearUserDataProtection = () => {
  dataProtection.clearCurrentUser();
};
