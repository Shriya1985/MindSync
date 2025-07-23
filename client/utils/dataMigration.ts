import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { localStorageService } from "@/lib/localStorage";
import { showNotification } from "@/components/ui/notification-system";

export const migrateLocalStorageToSupabase = async (userId: string) => {
  if (!userId || !isSupabaseConfigured) {
    console.log("❌ Cannot migrate: No user ID or Supabase not configured");
    return false;
  }

  try {
    const localData = localStorageService.getAllUserData();
    console.log("🔄 Checking for localStorage data to migrate...", localData);

    let migrationCount = 0;

    // Migrate journal entries
    if (localData.journalEntries?.length > 0) {
      console.log(`📝 Migrating ${localData.journalEntries.length} journal entries...`);
      
      for (const entry of localData.journalEntries) {
        try {
          // Check if entry already exists
          const { data: existing } = await supabase
            .from("journal_entries")
            .select("id")
            .eq("user_id", userId)
            .eq("title", entry.title)
            .eq("date", entry.date)
            .single();

          if (existing) {
            console.log(`⏭️ Skipping duplicate journal entry: ${entry.title}`);
            continue;
          }

          const { data, error } = await supabase
            .from("journal_entries")
            .insert({
              user_id: userId,
              title: entry.title,
              content: entry.content,
              sentiment: entry.sentiment,
              word_count: entry.wordCount || entry.content.split(' ').length,
              tags: entry.tags || [],
              date: entry.date,
            })
            .select()
            .single();

          if (error) {
            console.error(`❌ Error migrating journal entry "${entry.title}":`, error);
          } else {
            migrationCount++;
            console.log(`✅ Migrated journal entry: ${entry.title}`);
          }
        } catch (err) {
          console.error(`❌ Error processing journal entry "${entry.title}":`, err);
        }
      }
    }

    // Migrate mood entries
    if (localData.moodEntries?.length > 0) {
      console.log(`😊 Migrating ${localData.moodEntries.length} mood entries...`);
      
      for (const entry of localData.moodEntries) {
        try {
          // Check if entry already exists
          const { data: existing } = await supabase
            .from("mood_entries")
            .select("id")
            .eq("user_id", userId)
            .eq("mood", entry.mood)
            .eq("date", entry.date)
            .single();

          if (existing) {
            console.log(`⏭️ Skipping duplicate mood entry: ${entry.mood} on ${entry.date}`);
            continue;
          }

          const { data, error } = await supabase
            .from("mood_entries")
            .insert({
              user_id: userId,
              mood: entry.mood,
              rating: entry.rating,
              emoji: entry.emoji,
              notes: entry.notes || '',
              source: entry.source || 'manual',
              date: entry.date,
            })
            .select()
            .single();

          if (error) {
            console.error(`❌ Error migrating mood entry "${entry.mood}":`, error);
          } else {
            migrationCount++;
            console.log(`✅ Migrated mood entry: ${entry.mood}`);
          }
        } catch (err) {
          console.error(`❌ Error processing mood entry "${entry.mood}":`, err);
        }
      }
    }

    if (migrationCount > 0) {
      showNotification({
        type: "encouragement",
        title: "Data Migration Complete! 🎉",
        message: `Successfully migrated ${migrationCount} entries to the cloud database.`,
        duration: 5000,
      });
      console.log(`🎉 Migration complete! Migrated ${migrationCount} total entries.`);
      return true;
    } else {
      console.log("ℹ️ No new data to migrate.");
      return false;
    }

  } catch (error) {
    console.error("❌ Error during data migration:", error);
    showNotification({
      type: "encouragement",
      title: "Migration Error",
      message: "There was an issue migrating your data. Check console for details.",
      duration: 5000,
    });
    return false;
  }
};

// Function to check what data exists locally vs in Supabase
export const checkDataSources = async (userId: string) => {
  const localData = localStorageService.getAllUserData();
  
  console.log("📊 Data Sources Analysis:");
  console.log("Local Storage:", {
    journalEntries: localData.journalEntries?.length || 0,
    moodEntries: localData.moodEntries?.length || 0,
    chatMessages: localData.chatMessages?.length || 0,
  });

  if (isSupabaseConfigured && userId) {
    try {
      const { data: journals } = await supabase
        .from("journal_entries")
        .select("id")
        .eq("user_id", userId);

      const { data: moods } = await supabase
        .from("mood_entries")
        .select("id")
        .eq("user_id", userId);

      const { data: chats } = await supabase
        .from("chat_messages")
        .select("id")
        .eq("user_id", userId);

      console.log("Supabase Database:", {
        journalEntries: journals?.length || 0,
        moodEntries: moods?.length || 0,
        chatMessages: chats?.length || 0,
      });
    } catch (error) {
      console.error("❌ Error checking Supabase data:", error);
    }
  } else {
    console.log("Supabase: Not configured or no user ID");
  }
};
