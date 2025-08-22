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
  const result = await localStorageService.login(email, password);

  if (result.success && result.user) {
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
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // BULLETPROOF: Store user in both state and localStorage for persistence
  const [sessionBackup, setSessionBackup] = useState<User | null>(null);

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
      setSessionBackup(userData);
      console.log("🔒 Session backed up to localStorage");
    } catch (error) {
      console.error("Failed to backup session:", error);
    }
  };

  // Restore user session from localStorage
  const restoreUserSession = (): User | null => {
    try {
      const backup = localStorage.getItem("mindsync_session_backup");
      if (backup) {
        const parsed = JSON.parse(backup);
        // Check if session is recent (within 7 days) and not explicitly logged out
        const isRecent =
          Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000;
        if (isRecent && !parsed.explicit_logout && parsed.user) {
          console.log("🔓 Restored session from localStorage backup");
          return parsed.user;
        }
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
    }
    return null;
  };

  // Clear session backup (only on explicit logout)
  const clearSessionBackup = () => {
    try {
      const backup = localStorage.getItem("mindsync_session_backup");
      if (backup) {
        const parsed = JSON.parse(backup);
        parsed.explicit_logout = true;
        localStorage.setItem("mindsync_session_backup", JSON.stringify(parsed));
      }
      setSessionBackup(null);
      console.log("🗑️ Session backup cleared");
    } catch (error) {
      console.error("Failed to clear session backup:", error);
    }
  };

  // Fetch user profile from Supabase with quick timeout and fallback
  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log(
        "🔍 Attempting quick profile fetch for user:",
        supabaseUser.id,
      );

      // Reduce timeout to 2 seconds for faster fallback
      const profilePromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Profile fetch timeout")), 2000),
      );

      const { data: profile, error } = (await Promise.race([
        profilePromise,
        timeoutPromise,
      ])) as any;

      if (error) {
        console.log("⚠️ Profile fetch failed:", error.message);
        // Return null to trigger fallback in calling code
        return null;
      }

      console.log("✅ Profile fetched successfully");
      return {
        id: profile.id,
        name: profile.name || supabaseUser.user_metadata?.name || "User",
        email: profile.email || supabaseUser.email || "",
        avatar: profile.avatar_url,
        bio: profile.bio,
        preferences: profile.preferences || {},
      };
    } catch (error) {
      console.log("⚠️ Profile fetch exception:", error.message);
      // Return null to trigger fallback
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔄 Initializing authentication...");

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn(
          "⚠️ Auth initialization timeout, setting loading to false",
        );
        setIsLoading(false);
      }, 10000); // 10 second timeout

      try {
        // FIRST: Try to restore from localStorage backup (fastest)
        const restoredUser = restoreUserSession();
        if (restoredUser) {
          console.log("⚡ Using restored session, setting user immediately");
          setUser(restoredUser);
          setIsLoading(false);
          // Continue with Supabase check in background but don't block UI
        }

        if (isSupabaseConfigured) {
          console.log("🔧 Using Supabase authentication");

          // Use Supabase authentication with retry for tab changes
          let session = null;
          let error = null;

          // Try to get session with retry logic
          for (let attempt = 0; attempt < 3; attempt++) {
            const result = await supabase.auth.getSession();
            session = result.data.session;
            error = result.error;

            if (!error || session) break;

            console.log(`🔄 Session retry ${attempt + 1}/3`);
            await new Promise((resolve) => setTimeout(resolve, 500));
          }

          if (error && !session) {
            console.error("❌ Error getting session after retries:", error);
            // Don't clear user if we have a backup
            if (!restoredUser) {
              clearTimeout(timeoutId);
              setIsLoading(false);
              return;
            } else {
              console.log("✅ Using backup session despite Supabase error");
              clearTimeout(timeoutId);
              return;
            }
          }

          console.log("📋 Session check complete:", !!session?.user);

          if (session?.user) {
            console.log("👤 User found, attempting to fetch profile...");

            try {
              const userProfile = await fetchUserProfile(session.user);
              if (userProfile) {
                console.log("✅ User profile loaded:", userProfile.email);
                setUser(userProfile);
                backupUserSession(userProfile); // Backup the session
              } else {
                console.log(
                  "⚠️ Profile fetch failed, creating fallback profile...",
                );

                // Try to create a basic profile in database
                const fallbackUser = {
                  id: session.user.id,
                  name:
                    session.user.user_metadata?.name ||
                    session.user.email?.split("@")[0] ||
                    "User",
                  email: session.user.email || "",
                  avatar: session.user.user_metadata?.avatar_url,
                  bio: undefined,
                  preferences: {},
                };

                // Attempt to create profile (non-blocking)
                supabase
                  .from("profiles")
                  .insert({
                    id: session.user.id,
                    email: session.user.email,
                    name: fallbackUser.name,
                    avatar_url: fallbackUser.avatar,
                  })
                  .then(({ error }) => {
                    if (error) {
                      console.log(
                        "ℹ️ Profile creation skipped:",
                        error.message,
                      );
                    } else {
                      console.log("✅ Profile created successfully");
                    }
                  });

                setUser(fallbackUser);
              }
            } catch (error) {
              console.error("❌ Profile fetch error, using fallback:", error);
              // Always set user even if profile fetch completely fails
              setUser({
                id: session.user.id,
                name:
                  session.user.user_metadata?.name ||
                  session.user.email?.split("@")[0] ||
                  "User",
                email: session.user.email || "",
                avatar: session.user.user_metadata?.avatar_url,
                bio: undefined,
                preferences: {},
              });
            }
          } else {
            console.log("ℹ️ No active session found");
          }
        } else {
          console.log("💾 Using localStorage fallback");

          // Fallback to localStorage
          const currentUser = localStorageService.getCurrentUser();
          if (currentUser) {
            console.log("✅ LocalStorage user found:", currentUser.email);
            setUser(currentUser);
          } else {
            console.log("ℹ️ No localStorage user found");
          }
        }
      } catch (error) {
        console.error("❌ Error initializing auth:", error);
      } finally {
        clearTimeout(timeoutId);
        console.log(
          "�� Auth initialization complete, setting loading to false",
        );
        setIsLoading(false);
      }
    };

    initializeAuth();

    // BULLETPROOF: Protect against browser events that might trigger logout
    const protectAgainstBrowserEvents = () => {
      // Prevent any focus/blur events from affecting auth
      const handleVisibilityChange = () => {
        console.log("👁️ Page visibility changed - protecting user session");
        // Restore user if somehow lost during tab change
        if (!user && sessionBackup) {
          console.log("🔧 Restoring user after visibility change");
          setUser(sessionBackup);
        }
      };

      const handleFocus = () => {
        console.log("👁️ Window focused - protecting user session");
        // Restore user if somehow lost during focus change
        if (!user && sessionBackup) {
          console.log("🔧 Restoring user after focus");
          setUser(sessionBackup);
        }
      };

      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        // Prevent any unload events from triggering logout
        console.log("🚪 Page unloading - session will be preserved");
        // Don't actually prevent unload, just log it
      };

      // Add event listeners
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("focus", handleFocus);
      window.addEventListener("blur", handleFocus); // Also protect on blur
      window.addEventListener("beforeunload", handleBeforeUnload);

      // Cleanup function
      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
        window.removeEventListener("focus", handleFocus);
        window.removeEventListener("blur", handleFocus);
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    };

    const cleanupBrowserEvents = protectAgainstBrowserEvents();

    if (isSupabaseConfigured) {
      // BULLETPROOF AUTH: Completely ignore all automatic events
      let isExplicitLogout = false;

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(
          "🔄 Auth state change:",
          event,
          "Session user:",
          !!session?.user,
          "Current user:",
          !!user,
          "Explicit logout:",
          isExplicitLogout,
        );

        // ABSOLUTELY BULLETPROOF: Only handle explicit actions
        switch (event) {
          case "SIGNED_IN":
            console.log("✅ User signed in, updating profile");
            if (session?.user) {
              const userProfile = await fetchUserProfile(session.user);
              if (userProfile) {
                setUser(userProfile);
                backupUserSession(userProfile);
              }
              isExplicitLogout = false;
            }
            setIsLoading(false);
            break;

          case "SIGNED_OUT":
            // ABSOLUTELY ONLY logout if explicit AND we have backup confirmation
            const backup = localStorage.getItem("mindsync_session_backup");
            let shouldLogout = false;

            try {
              if (backup) {
                const parsed = JSON.parse(backup);
                shouldLogout = parsed.explicit_logout === true;
              }
            } catch (e) {
              shouldLogout = isExplicitLogout;
            }

            if (shouldLogout && isExplicitLogout) {
              console.log("👋 CONFIRMED explicit logout - clearing user state");
              setUser(null);
              clearSessionBackup();
              isExplicitLogout = false;
            } else {
              console.log(
                "🛡️ PROTECTED: Ignoring SIGNED_OUT event - keeping user logged in",
              );
              // If we have a backup and current user is null, restore it
              if (!user && sessionBackup) {
                console.log(
                  "🔄 Restoring user from backup due to false logout",
                );
                setUser(sessionBackup);
              }
            }
            setIsLoading(false);
            break;

          case "TOKEN_REFRESHED":
            console.log("🔄 Token refreshed - maintaining user session");
            // Ensure user is still set
            if (!user && sessionBackup) {
              console.log("🔧 Restoring user after token refresh");
              setUser(sessionBackup);
            }
            setIsLoading(false);
            break;

          case "INITIAL_SESSION":
            console.log("🎯 Initial session check:", !!session?.user);
            if (session?.user && !user) {
              const userProfile = await fetchUserProfile(session.user);
              if (userProfile) {
                setUser(userProfile);
                backupUserSession(userProfile);
              }
            }
            setIsLoading(false);
            break;

          default:
            console.log(`🛡️ IGNORING ${event} - user session protected`);
            // NEVER EVER change user state for any other events
            break;
        }
      });

      // Store the logout flag setter for the logout function
      (window as any).__setExplicitLogout = (value: boolean) => {
        isExplicitLogout = value;
      };

      return () => {
        subscription.unsubscribe();
        cleanupBrowserEvents();
      };
    } else {
      return cleanupBrowserEvents;
    }
  }, []);

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

          if (data?.user) {
            const userProfile = await fetchUserProfile(data.user);
            setUser(userProfile);
            backupUserSession(userProfile); // Backup session immediately

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
      console.log("🚪 EXPLICIT LOGOUT - User clicked logout button");
      console.trace();

      // Mark as explicit logout in backup FIRST
      clearSessionBackup();

      // Set explicit logout flag BEFORE calling signOut
      if ((window as any).__setExplicitLogout) {
        (window as any).__setExplicitLogout(true);
      }

      if (isSupabaseConfigured) {
        console.log("🔧 Calling Supabase signOut with explicit flag");
        await supabase.auth.signOut();
      } else {
        console.log("💾 Using localStorage logout");
        localStorageService.logout();
      }

      // Clear data protection
      dataProtection.clearCurrentUser();

      // Clear user state
      setUser(null);

      showNotification({
        type: "encouragement",
        title: "Logged out securely 🛡️",
        message: "Your data is safe. See you next time!",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error during logout:", error);
      // Clear everything on error
      clearSessionBackup();
      setUser(null);
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