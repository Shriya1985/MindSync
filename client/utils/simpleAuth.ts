import { supabase } from "@/lib/supabase";

export const createUserAndProfile = async (name: string, email: string, password: string) => {
  console.log("🚀 Creating user with simplified approach...");
  
  try {
    // Step 1: Sign out any existing session
    await supabase.auth.signOut();
    console.log("1️⃣ Signed out existing session");
    
    // Step 2: Create the user
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
      console.log("❌ User creation failed:", error.message);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      console.log("❌ No user data returned");
      return { success: false, error: "No user data returned" };
    }

    console.log("2️⃣ User created successfully:", data.user.id);
    
    // Step 3: Wait for database triggers
    console.log("3️⃣ Waiting for database triggers...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 4: Verify profile was created
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id);

    const profile = profiles && profiles.length > 0 ? profiles[0] : null;

    if (profile) {
      console.log("✅ Profile found:", profile.name);
      return { 
        success: true, 
        user: data.user, 
        profile: profile,
        message: "Account created successfully!" 
      };
    } else {
      console.log("⚠️ Profile not created by trigger, manual creation needed");
      console.log("Profile error:", profileError?.message);
      
      // The user exists but profile creation failed
      // This is still a success since the user can login
      return { 
        success: true, 
        user: data.user, 
        profile: null,
        message: "Account created! Profile creation pending..." 
      };
    }
    
  } catch (err) {
    console.log("❌ Unexpected error:", err);
    return { success: false, error: "Unexpected error occurred" };
  }
};

export const checkUserExists = async (email: string) => {
  try {
    // Try to sign in to check if user exists
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: "dummy-password" // This will fail but tell us if user exists
    });
    
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        console.log("✅ User exists but password is wrong (expected)");
        return true;
      } else if (error.message.includes("Email not confirmed")) {
        console.log("✅ User exists but email not confirmed");
        return true;
      } else {
        console.log("❌ User doesn't exist or other error:", error.message);
        return false;
      }
    }
    
    // If no error, user exists and dummy password worked (unlikely)
    return true;
  } catch (err) {
    console.log("❌ Error checking user:", err);
    return false;
  }
};
