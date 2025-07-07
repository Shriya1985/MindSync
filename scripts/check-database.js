import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ehyxltlcioovssbpttch.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoeXhsdGxjaW9vdnNzYnB0dGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDQ5NTgsImV4cCI6MjA2NjY4MDk1OH0.VoVZlcAst1uwzLccPsqIVbsSQEfGgy4OTOBHfjfEwdM";

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🔍 Checking database structure...");

// Check what tables exist
const expectedTables = [
  "profiles",
  "user_stats",
  "mood_entries",
  "journal_entries",
  "chat_messages",
  "chat_sessions",
  "achievements",
  "daily_quests",
  "point_activities",
];

async function checkTables() {
  console.log("\n📋 Expected tables for the application:");
  console.log(expectedTables.join(", "));

  console.log("\n🔎 Checking each table...\n");

  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(0);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: EXISTS`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  console.log("\n🧪 Testing basic operations...");

  // Test auth
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log("🔐 Auth system:", error ? "❌ Error" : "✅ Working");
  } catch (err) {
    console.log("🔐 Auth system: ❌ Error");
  }
}

checkTables()
  .then(() => {
    console.log("\n✨ Database check complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Check failed:", err);
    process.exit(1);
  });
