import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const supabaseUrl = "https://ehyxltlcioovssbpttch.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoeXhsdGxjaW9vdnNzYnB0dGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDQ5NTgsImV4cCI6MjA2NjY4MDk1OH0.VoVZlcAst1uwzLccPsqIVbsSQEfGgy4OTOBHfjfEwdM";

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🔍 Checking database connection...");

async function checkDatabaseTables() {
  const expectedTables = [
    "profiles", "user_stats", "mood_entries", "journal_entries", 
    "chat_messages", "chat_sessions", "achievements", "daily_quests", "point_activities"
  ];

  console.log("\n📋 Checking for required tables...");
  
  let missingTables = [];
  
  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(0);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        missingTables.push(table);
      } else {
        console.log(`✅ ${table}: EXISTS`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
      missingTables.push(table);
    }
  }

  return missingTables;
}

async function setupDatabase() {
  try {
    console.log("\n🔧 Setting up Supabase database schema...");
    
    const missingTables = await checkDatabaseTables();
    
    if (missingTables.length === 0) {
      console.log("\n✅ All required tables exist! Database is ready.");
      return true;
    }

    console.log(`\n⚠️ Missing tables: ${missingTables.join(", ")}`);
    console.log("📄 Please run the migration SQL in your Supabase dashboard:");
    console.log("1. Go to your Supabase dashboard");
    console.log("2. Navigate to SQL Editor");
    console.log("3. Copy and paste the contents of: supabase/migrations/002_safe_migration.sql");
    console.log("4. Execute the query");
    
    return false;
  } catch (error) {
    console.error("��� Database setup failed:", error);
    return false;
  }
}

async function testBasicOperations() {
  console.log("\n🧪 Testing basic operations...");
  
  try {
    // Test auth
    const { data: session, error: authError } = await supabase.auth.getSession();
    console.log("🔐 Auth system:", authError ? "❌ Error" : "✅ Working");
    
    // Test database connection
    const { data, error } = await supabase.from("profiles").select("count").limit(1);
    console.log("💾 Database connection:", error ? "❌ Error" : "✅ Working");
    
    return !authError && !error;
  } catch (error) {
    console.error("🧪 Test failed:", error);
    return false;
  }
}

// Run the setup
setupDatabase()
  .then(async (success) => {
    if (success) {
      await testBasicOperations();
      console.log("\n🎉 Database setup complete!");
      console.log("Your app is now ready to use Supabase instead of localStorage.");
    } else {
      console.log("\n⚠️ Database setup incomplete. Please follow the manual steps above.");
    }
  })
  .catch((error) => {
    console.error("❌ Setup failed:", error);
  });
