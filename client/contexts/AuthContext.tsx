import { createContext, useContext, useEffect, useState } from "react";
import { xanoClient, TokenManager, type XanoUser } from "@/lib/xano";
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

  // Convert XanoUser to AuthUser
  const convertXanoUser = (xanoUser: XanoUser): AuthUser => ({
    id: xanoUser.id.toString(),
    email: xanoUser.email,
    name: xanoUser.name,
    avatar: xanoUser.avatar,
  });

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = TokenManager.getToken();

      if (token) {
        try {
          const xanoUser = await xanoClient.getProfile();
          setUser(convertXanoUser(xanoUser));
        } catch (error) {
          console.error("Failed to get user profile:", error);
          TokenManager.removeToken();
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("🔐 Attempting login for:", email);

      const response = await xanoClient.login(email, password);

      // Store the auth token
      TokenManager.setToken(response.authToken);

      // Set user state
      const authUser = convertXanoUser(response.user);
      setUser(authUser);

      console.log("✅ Login successful for user:", authUser.id);

      showNotification({
        type: "encouragement",
        title: "Welcome back! 🌟",
        message:
          "Great to see you again! Ready to continue your wellness journey?",
        duration: 4000,
      });

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
      const response = await xanoClient.signup(email, password, name);

      // Store the auth token
      TokenManager.setToken(response.authToken);

      // Set user state
      const authUser = convertXanoUser(response.user);
      setUser(authUser);

      showNotification({
        type: "achievement",
        title: "Welcome to MindSync! 🎉",
        message:
          "Your account has been created successfully. Start your wellness journey!",
        duration: 6000,
      });

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
      await xanoClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      TokenManager.removeToken();
      setUser(null);

      showNotification({
        type: "encouragement",
        title: "See you soon! 👋",
        message: "Thanks for taking care of your mental health today.",
        duration: 3000,
      });
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const xanoUpdates = {
        name: updates.name,
        avatar: updates.avatar,
      };

      const updatedXanoUser = await xanoClient.updateProfile(xanoUpdates);

      // Update local user state
      const updatedAuthUser = convertXanoUser(updatedXanoUser);
      setUser(updatedAuthUser);

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
