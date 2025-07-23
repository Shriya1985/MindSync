import { supabase } from "@/lib/supabase";
import { localStorageService } from "@/lib/localStorage";

export const clearAllAuthStates = () => {
  console.log("🧹 Clearing all authentication states...");
  
  // Clear localStorage auth data
  localStorage.removeItem("mindsync_current_user");
  localStorage.removeItem("mindsync_users");
  
  // Clear any session storage
  sessionStorage.clear();
  
  // Sign out from Supabase (if signed in)
  supabase.auth.signOut();
  
  console.log("✅ All authentication states cleared");
};

export const forceCleanRegistration = async (name: string, email: string, password: string) => {
  console.log("🔄 Starting clean registration process...");
  
  // First, clear all existing states
  clearAllAuthStates();
  
  // Wait a moment for cleanup
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Attempt fresh registration with Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
        },
        emailRedirectTo: undefined, // Skip email confirmation for development
      },
    });

    if (error) {
      console.error("❌ Supabase registration error:", error);
      
      // If Supabase fails, try localStorage as fallback
      console.log("🔄 Falling back to localStorage registration...");
      const localResult = await localStorageService.register(name, email, password);
      
      if (localResult.success) {
        console.log("✅ User created in localStorage");
        return {
          success: true,
          user: localResult.user,
          message: "Account created successfully (using local storage)"
        };
      } else {
        return {
          success: false,
          error: localResult.error || "Registration failed"
        };
      }
    }

    if (data.user) {
      console.log("✅ User created in Supabase:", data.user.id);
      return {
        success: true,
        user: data.user,
        message: "Account created successfully in cloud database"
      };
    }

    return {
      success: false,
      error: "Unknown registration error"
    };

  } catch (error) {
    console.error("❌ Registration error:", error);
    return {
      success: false,
      error: "Registration failed due to technical error"
    };
  }
};

export const checkAuthStates = () => {
  console.log("🔍 Checking authentication states:");
  
  // Check localStorage
  const localUser = localStorage.getItem("mindsync_current_user");
  const localUsers = localStorage.getItem("mindsync_users");
  
  console.log("Local Storage:", {
    currentUser: localUser ? JSON.parse(localUser) : null,
    userCount: localUsers ? JSON.parse(localUsers).length : 0
  });
  
  // Check Supabase session
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      console.log("Supabase Session Error:", error);
    } else {
      console.log("Supabase Session:", session?.user ? {
        id: session.user.id,
        email: session.user.email
      } : null);
    }
  });
};
