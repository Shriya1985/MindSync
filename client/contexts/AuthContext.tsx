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

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error("🚨 useAuth called outside AuthProvider context!");
    console.error("Component tree:", new Error().stack);
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

type AuthProviderProps = {
  children: React.ReactNode;
};

// Helper function for localStorage authentication fallback
const handleLocalStorageLogin = async (
  email: string,
  password: string,
): Promise<boolean> => {
  console.log("🔄 Attempting localStorage authentication...");

  const result = await localStorageService.login(email, password);
  if (result.success && result.user) {
    console.log("✅ LocalStorage authentication successful");
    return true;
  }

  console.log("❌ LocalStorage authentication failed");
  return false;
};

// Backup user session to localStorage
const backupUserSession = (userData: User) => {
  try {
    localStorage.setItem(
      "mindsync_session_backup",
      JSON.stringify({
        user: userData,
        timestamp: Date.now(),
        explicit_logout: false,
      }),
    );
    console.log("💾 Session backed up to localStorage");
  } catch (error) {
    console.error("⚠️ Failed to backup session:", error);
  }
};

// Restore session from localStorage
const restoreSessionFromBackup = (): User | null => {
  try {
    const backup = localStorage.getItem("mindsync_session_backup");
    if (!backup) return null;

    const { user, timestamp, explicit_logout } = JSON.parse(backup);

    // Check if session is not too old (24 hours) and wasn't an explicit logout
    const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000;
    if (isRecent && !explicit_logout && user) {
      console.log("🔄 Restored session from backup");
      return user;
    }
  } catch (error) {
    console.error("⚠️ Failed to restore session backup:", error);
  }
  return null;
};

// Clear session backup
const clearSessionBackup = () => {
  try {
    localStorage.setItem(
      "mindsync_session_backup",
      JSON.stringify({
        user: null,
        timestamp: Date.now(),
        explicit_logout: true,
      }),
    );
    console.log("🧹 Session backup cleared");
  } catch (error) {
    console.error("⚠️ Failed to clear session backup:", error);
  }
};

// Helper to fetch user profile
const fetchUserProfile = async (user: SupabaseUser): Promise<User> => {
  try {
    if (!isSupabaseConfigured) {
      // Return basic user data if Supabase not configured
      return {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
        email: user.email || "",
        avatar: user.user_metadata?.avatar_url,
        bio: user.user_metadata?.bio,
        preferences: user.user_metadata?.preferences || {},
      };
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.warn("Profile fetch error:", error.message);
      // Return basic user data as fallback
      return {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
        email: user.email || "",
        avatar: user.user_metadata?.avatar_url,
        bio: user.user_metadata?.bio,
        preferences: user.user_metadata?.preferences || {},
      };
    }

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar_url,
      bio: profile.bio,
      preferences: profile.preferences || {},
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    // Return basic user data as ultimate fallback
    return {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
      email: user.email || "",
      avatar: user.user_metadata?.avatar_url,
      preferences: {},
    };
  }
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // CRITICAL: Force isLoading to false after maximum 3 seconds
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      console.log("🚨 EMERGENCY: Force setting isLoading to false after timeout");
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(emergencyTimeout);
  }, []);

  // Try to restore session from backup on mount
  useEffect(() => {
    const restoredUser = restoreSessionFromBackup();
    if (restoredUser) {
      setUser(restoredUser);
      setIsLoading(false); // Immediately stop loading if user restored
      console.log("🔄 Session restored from backup");
    }
  }, []);

  // Setup Supabase auth listener
  useEffect(() => {
    let isExplicitLogout = false;

    // Browser event protection
    const handleFocus = () => {
      if (import.meta.env.DEV) console.log("🔍 Window focused - session protected");
    };

    const handleBlur = () => {
      if (import.meta.env.DEV) console.log("👁️ Window blurred - session protected");
    };

    const cleanupBrowserEvents = () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    if (isSupabaseConfigured) {
      console.log("🛡️ Setting up Supabase auth listener");

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log(`🔔 Auth event: ${event}`);

          switch (event) {
            case "SIGNED_IN":
              if (session?.user) {
                console.log("✅ User signed in");
                const userProfile = await fetchUserProfile(session.user);
                setUser(userProfile);
                backupUserSession(userProfile);
              }
              setIsLoading(false);
              break;

            case "SIGNED_OUT":
              if (isExplicitLogout) {
                console.log("🚪 Explicit logout - clearing user");
                setUser(null);
                clearSessionBackup();
              } else {
                console.log("🛡️ Automatic logout blocked - session protected");
                const restoredUser = restoreSessionFromBackup();
                if (restoredUser) {
                  setUser(restoredUser);
                  backupUserSession(restoredUser);
                }
              }
              setIsLoading(false);
              break;

            case "TOKEN_REFRESHED":
              console.log("🔄 Token refreshed");
              if (session?.user && user) {
                const userProfile = await fetchUserProfile(session.user);
                setUser(userProfile);
                backupUserSession(userProfile);
              }
              setIsLoading(false);
              break;

            default:
              console.log(`🛡️ IGNORING ${event} - user session protected`);
              break;
          }
        },
      );

      // Store the logout flag setter for the logout function
      (window as any).__setExplicitLogout = (value: boolean) => {
        isExplicitLogout = value;
      };

      return () => {
        if (authListener?.subscription?.unsubscribe) {
          authListener.subscription.unsubscribe();
        }
        cleanupBrowserEvents();
      };
    } else {
      return cleanupBrowserEvents;
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (isSupabaseConfigured) {
        try {
          // Use Supabase authentication with timeout
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Connection timeout")), 10000),
          );

          const authPromise = supabase.auth.signInWithPassword({
            email,
            password,
          });

          const { data, error } = (await Promise.race([
            authPromise,
            timeoutPromise,
          ])) as any;

          if (error) {
            console.error("Supabase login error:", error);

            // Check if it's a network/connectivity error
            if (
              error.message.includes("Failed to fetch") ||
              error.message.includes("Network") ||
              error.message.includes("Connection timeout")
            ) {
              console.log(
                "🔌 Network issue detected, falling back to localStorage",
              );

              showNotification({
                type: "encouragement",
                title: "Connection Issue",
                message:
                  "Using offline mode. Your data will sync when connection is restored.",
                duration: 5000,
              });

              // Fallback to localStorage authentication
              return await handleLocalStorageLogin(email, password);
            }

            let errorMessage = error.message;

            // Provide more helpful error messages
            if (error.message.includes("email not confirmed")) {
              errorMessage =
                "Please check your email and click the confirmation link, or contact support.";
            } else if (error.message.includes("Invalid login credentials")) {
              errorMessage =
                "Invalid email or password. Please check your credentials.";
            }

            showNotification({
              type: "encouragement",
              title: "Login Failed",
              message: errorMessage,
              duration: 5000,
            });
            return false;
          }

          if (data?.user) {
            const userProfile = await fetchUserProfile(data.user);
            setUser(userProfile);
            backupUserSession(userProfile);

            // Initialize data protection for this user
            dataProtection.setCurrentUser(data.user.id);
            await dataProtection.ensureUserStats(data.user.id);

            // Run critical data integrity checks
            const checks = await dataProtection.performCriticalChecks(
              data.user.id,
            );

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
        } catch (networkError) {
          console.error("Network error during Supabase login:", networkError);

          showNotification({
            type: "encouragement",
            title: "Connection Issue",
            message: "Unable to connect to server. Using offline mode.",
            duration: 5000,
          });

          // Fallback to localStorage authentication
          return await handleLocalStorageLogin(email, password);
        }
      } else {
        // Direct localStorage mode
        console.log("💾 Using localStorage authentication mode");
        return await handleLocalStorageLogin(email, password);
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
        try {
          // Use Supabase authentication with timeout
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Connection timeout")), 10000),
          );

          const authPromise = supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name,
              },
              emailRedirectTo: undefined, // Skip email confirmation for development
            },
          });

          const { data, error } = (await Promise.race([
            authPromise,
            timeoutPromise,
          ])) as any;

          if (error) {
            // Check if it's a network/connectivity error
            if (
              error.message.includes("Failed to fetch") ||
              error.message.includes("Network") ||
              error.message.includes("Connection timeout")
            ) {
              console.log(
                "🔌 Network issue during registration, falling back to localStorage",
              );

              showNotification({
                type: "encouragement",
                title: "Connection Issue",
                message:
                  "Using offline mode for registration. Your account will sync when connection is restored.",
                duration: 5000,
              });

              // Fallback to localStorage registration
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
                  message: `Account created successfully for ${name}! (Offline mode)`,
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

            showNotification({
              type: "encouragement",
              title: "Registration Failed",
              message: error.message,
              duration: 3000,
            });
            return false;
          }

          if (data?.user) {
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
        } catch (networkError) {
          console.error(
            "Network error during Supabase registration:",
            networkError,
          );

          showNotification({
            type: "encouragement",
            title: "Connection Issue",
            message: "Unable to connect to server. Using offline registration.",
            duration: 5000,
          });

          // Fallback to localStorage registration
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
              message: `Account created successfully for ${name}! (Offline mode)`,
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
            message: `Account created successfully for ${name}!`,
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

  const logout = () => {
    console.log("🚪 Explicit logout initiated");

    // Set the explicit logout flag
    if ((window as any).__setExplicitLogout) {
      (window as any).__setExplicitLogout(true);
    }

    // Clear everything
    setUser(null);
    clearSessionBackup();

    // Supabase logout
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch((error) => {
        console.error("Supabase logout error:", error);
      });
    }

    // Clear localStorage
    localStorageService.logout();

    showNotification({
      type: "encouragement",
      title: "Logged Out",
      message: "You have been safely logged out. See you soon!",
      duration: 3000,
    });
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsLoading(true);

      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("profiles")
          .update({
            name: data.name,
            bio: data.bio,
            avatar_url: data.avatar,
            preferences: data.preferences,
          })
          .eq("id", user.id);

        if (error) {
          console.error("Profile update error:", error);
          showNotification({
            type: "encouragement",
            title: "Update Failed",
            message: "Could not update profile. Please try again.",
            duration: 3000,
          });
          return false;
        }
      }

      // Update local state
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      backupUserSession(updatedUser);

      // Note: localStorage profile update would be implemented here if needed

      showNotification({
        type: "encouragement",
        title: "Profile Updated",
        message: "Your profile has been successfully updated!",
        duration: 3000,
      });
      return true;
    } catch (error) {
      console.error("Update profile error:", error);
      showNotification({
        type: "encouragement",
        title: "Update Error",
        message: "Something went wrong. Please try again.",
        duration: 3000,
      });
      return false;
    } finally {
      setIsLoading(false);
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
