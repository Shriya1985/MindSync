import { createContext, useContext, useEffect, useState } from "react";
import { localStorageService, type LocalUser } from "@/lib/localStorage";
import { showNotification } from "@/components/ui/notification-system";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
};

type AuthContextType = {
  user: AuthUser | null;
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
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Convert LocalUser to AuthUser
  const convertLocalUser = (localUser: LocalUser): AuthUser => ({
    id: localUser.id,
    email: localUser.email,
    name: localUser.name,
    avatar: localUser.avatar,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const currentUser = localStorageService.getCurrentUser();
    if (currentUser) {
      setUser(convertLocalUser(currentUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("🔐 Attempting login for:", email);

      const result = localStorageService.login(email, password);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      if (result.user) {
        const authUser = convertLocalUser(result.user);
        setUser(authUser);

        console.log("✅ Login successful for user:", authUser.id);

        showNotification({
          type: "encouragement",
          title: "Welcome back! 🌟",
          message:
            "Great to see you again! Ready to continue your wellness journey?",
          duration: 4000,
        });
      }

      return { success: true };
    } catch (error) {
      console.error("❌ Login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const result = localStorageService.register(email, password, name);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      if (result.user) {
        const authUser = convertLocalUser(result.user);
        setUser(authUser);

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
      localStorageService.logout();
      setUser(null);

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
      const updatedUser = localStorageService.updateUser(user.id, updates);

      if (!updatedUser) {
        return { success: false, error: "Failed to update profile" };
      }

      // Update local user state
      setUser(convertLocalUser(updatedUser));

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
