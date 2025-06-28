import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import { showNotification } from "@/components/ui/notification-system";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (
    updates: Partial<AuthUser>,
  ) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!session;

  // Load user profile from database
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error loading user profile:", error);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        avatar: data.avatar,
      };
    } catch (error) {
      console.error("Error loading user profile:", error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id).then(setUser);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (session?.user) {
        const userProfile = await loadUserProfile(session.user.id);
        setUser(userProfile);

        if (event === "SIGNED_IN") {
          showNotification({
            type: "encouragement",
            title: "Welcome back! 🌟",
            message:
              "Great to see you again! Ready to continue your wellness journey?",
            duration: 4000,
          });
        }
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("🔐 Attempting login for:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Supabase auth error:", error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log("✅ Login successful for user:", data.user.id);
        const userProfile = await loadUserProfile(data.user.id);
        setUser(userProfile);
      }

      return { success: true };
    } catch (error) {
      console.error("❌ Network/Connection error:", error);

      // More specific error messages
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          error:
            "Connection failed. Please check your Supabase configuration and internet connection.",
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
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
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Profile will be created automatically by trigger
        showNotification({
          type: "achievement",
          title: "Welcome to MindSync! 🎉",
          message:
            "Your account has been created successfully. Start your wellness journey!",
          duration: 6000,
        });
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);

      showNotification({
        type: "encouragement",
        title: "See you soon! 👋",
        message: "Thanks for taking care of your mental health today.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: updates.name,
          avatar: updates.avatar,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update local user state
      setUser((prev) => (prev ? { ...prev, ...updates } : null));

      showNotification({
        type: "achievement",
        title: "Profile Updated! ✨",
        message: "Your profile changes have been saved successfully.",
        duration: 3000,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Update failed",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
