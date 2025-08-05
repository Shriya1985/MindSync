import { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { localStorageService } from "@/lib/localStorage";
import { showNotification } from "@/components/ui/notification-system";
import { dataProtection } from "@/utils/dataProtection";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  preferences?: any;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from Supabase
  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar_url,
        bio: profile.bio,
        preferences: profile.preferences,
      };
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isSupabaseConfigured) {
          // Use Supabase authentication
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.error("Error getting session:", error);
            setIsLoading(false);
            return;
          }

          if (session?.user) {
            const userProfile = await fetchUserProfile(session.user);
            setUser(userProfile);
          }
        } else {
          // Fallback to localStorage
          const currentUser = localStorageService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    if (isSupabaseConfigured) {
      // Listen for auth changes only if Supabase is configured
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const userProfile = await fetchUserProfile(session.user);
          setUser(userProfile);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (isSupabaseConfigured) {
        // Use Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Supabase login error:", error);
          let errorMessage = error.message;

          // Provide more helpful error messages
          if (error.message.includes("email not confirmed")) {
            errorMessage = "Please check your email and click the confirmation link, or contact support.";
          } else if (error.message.includes("Invalid login credentials")) {
            errorMessage = "Invalid email or password. Please check your credentials.";
          }

          showNotification({
            type: "encouragement",
            title: "Login Failed",
            message: errorMessage,
            duration: 5000,
          });
          return false;
        }

        if (data.user) {
          const userProfile = await fetchUserProfile(data.user);
          setUser(userProfile);

          // Initialize data protection for this user
          dataProtection.setCurrentUser(data.user.id);
          await dataProtection.ensureUserStats(data.user.id);

          // Run critical data integrity checks
          const checks = await dataProtection.performCriticalChecks(data.user.id);

          if (!checks.rlsWorking) {
            console.error("🚨 CRITICAL: Row Level Security not working!");
            showNotification({
              type: "encouragement",
              title: "Security Warning",
              message: "Data isolation issue detected. Please contact support.",
              duration: 10000,
            });
          }

          showNotification({
            type: "encouragement",
            title: "Welcome back! 🎉",
            message: `Good to see you again, ${userProfile?.name || "there"}! Your data is secure.`,
            duration: 3000,
          });
          return true;
        }
      } else {
        // Fallback to localStorage
        const result = await localStorageService.login(email, password);

        if (result.success && result.user) {
          setUser(result.user);
          showNotification({
            type: "encouragement",
            title: "Welcome back! 🎉",
            message: `Good to see you again, ${result.user.name}! (Using local storage)`,
            duration: 3000,
          });
          return true;
        } else {
          showNotification({
            type: "encouragement",
            title: "Login Failed",
            message: result.error || "Invalid credentials",
            duration: 3000,
          });
          return false;
        }
      }

      return false;
    } catch (error) {
      showNotification({
        type: "encouragement",
        title: "Login Error",
        message: "Something went wrong. Please try again.",
        duration: 3000,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (isSupabaseConfigured) {
        // Use Supabase authentication
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            },
            emailRedirectTo: undefined, // Skip email confirmation for development
          },
        });

        if (error) {
          showNotification({
            type: "encouragement",
            title: "Registration Failed",
            message: error.message,
            duration: 3000,
          });
          return false;
        }

        if (data.user) {
          // Initialize data protection for new user
          dataProtection.setCurrentUser(data.user.id);
          await dataProtection.ensureUserStats(data.user.id);

          // Profile will be created automatically by the database trigger
          showNotification({
            type: "encouragement",
            title: "Welcome to MindSync! 🌟",
            message: `Account created successfully for ${name}! Your secure data space is ready.`,
            duration: 4000,
          });
          return true;
        }
      } else {
        // Fallback to localStorage
        const result = await localStorageService.register(
          name,
          email,
          password,
        );

        if (result.success && result.user) {
          setUser(result.user);
          showNotification({
            type: "encouragement",
            title: "Welcome to MindSync! 🌟",
            message: `Account created successfully for ${name}! (Using local storage)`,
            duration: 4000,
          });
          return true;
        } else {
          showNotification({
            type: "encouragement",
            title: "Registration Failed",
            message: result.error || "Could not create account",
            duration: 3000,
          });
          return false;
        }
      }

      return false;
    } catch (error) {
      showNotification({
        type: "encouragement",
        title: "Registration Error",
        message: "Something went wrong. Please try again.",
        duration: 3000,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      } else {
        localStorageService.logout();
      }
      setUser(null);
      showNotification({
        type: "encouragement",
        title: "See you soon! 👋",
        message: "You've been logged out successfully.",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false;

      const updates = {
        name: data.name,
        bio: data.bio,
        avatar_url: data.avatar,
        preferences: data.preferences,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        return false;
      }

      // Update local user state
      setUser({ ...user, ...data });
      return true;
    } catch (error) {
      console.error("Error in updateProfile:", error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
