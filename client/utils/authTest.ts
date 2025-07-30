import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const testSupabaseAuth = async () => {
  console.log("🧪 === SUPABASE AUTHENTICATION TEST ===");
  
  // Test 1: Configuration check
  console.log("1️⃣ Configuration Check:");
  console.log("  URL:", import.meta.env.VITE_SUPABASE_URL);
  console.log("  Key Present:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  console.log("  isSupabaseConfigured:", isSupabaseConfigured);
  
  if (!isSupabaseConfigured) {
    console.log("❌ Supabase not configured - this is the problem!");
    return false;
  }
  
  // Test 2: Basic connection
  console.log("2️⃣ Connection Test:");
  try {
    const { data, error } = await supabase.from("profiles").select("count").limit(1);
    if (error) {
      console.log("❌ Connection failed:", error.message);
      return false;
    }
    console.log("✅ Connection successful");
  } catch (err) {
    console.log("❌ Connection error:", err);
    return false;
  }
  
  // Test 3: Check current session
  console.log("3️⃣ Session Check:");
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.log("❌ Session error:", error.message);
    } else if (session) {
      console.log("✅ Active session found:", session.user.email);
    } else {
      console.log("ℹ️ No active session");
    }
  } catch (err) {
    console.log("❌ Session check failed:", err);
  }
  
  console.log("🧪 === TEST COMPLETE ===");
  return true;
};

export const createTestUser = async (email: string, password: string, name: string) => {
  console.log("👤 Creating test user...");
  
  if (!isSupabaseConfigured) {
    console.log("❌ Cannot create user: Supabase not configured");
    return false;
  }
  
  try {
    // First, sign out any existing session
    await supabase.auth.signOut();
    
    // Create user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      console.log("❌ Signup error:", error.message);
      return false;
    }

    if (data.user) {
      console.log("✅ User created:", data.user.id);
      
      // Check if profile was created by trigger
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.log("⚠️ Profile not found, creating manually...");
        
        // Create profile manually
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            email: email,
            name: name,
            bio: '',
            preferences: {}
          });

        if (insertError) {
          console.log("❌ Failed to create profile:", insertError.message);
        } else {
          console.log("✅ Profile created manually");
        }
      } else {
        console.log("✅ Profile created by trigger:", profile.name);
      }
      
      return true;
    }
    
    return false;
  } catch (err) {
    console.log("❌ Error creating user:", err);
    return false;
  }
};

export const testLogin = async (email: string, password: string) => {
  console.log("🔑 Testing login...");
  
  if (!isSupabaseConfigured) {
    console.log("❌ Cannot test login: Supabase not configured");
    return false;
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("❌ Login error:", error.message);
      return false;
    }

    if (data.user) {
      console.log("✅ Login successful:", data.user.email);
      
      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.log("⚠️ Profile not found for logged in user");
      } else {
        console.log("✅ Profile loaded:", profile.name);
      }
      
      return true;
    }
    
    return false;
  } catch (err) {
    console.log("❌ Login test failed:", err);
    return false;
  }
};

export const resetAuthCompletely = async () => {
  console.log("🧹 === COMPLETE AUTH RESET ===");
  
  // 1. Sign out from Supabase
  try {
    await supabase.auth.signOut();
    console.log("✅ Signed out from Supabase");
  } catch (err) {
    console.log("⚠️ Supabase signout error:", err);
  }
  
  // 2. Clear all localStorage
  [
    'mindsync_current_user',
    'mindsync_users',
    'mindsync_user_stats',
    'mindsync_mood_entries',
    'mindsync_journal_entries',
    'mindsync_chat_messages',
    'mindsync_achievements',
    'mindsync_daily_quests',
    'mindsync_coping_sessions'
  ].forEach(key => {
    localStorage.removeItem(key);
  });
  console.log("✅ localStorage cleared");
  
  // 3. Clear session storage
  sessionStorage.clear();
  console.log("✅ sessionStorage cleared");
  
  console.log("🧹 === RESET COMPLETE ===");
  console.log("💡 Please refresh the page and try registering again");
};
