import "./global.css";
import "./theme.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { NotificationSystem } from "@/components/ui/notification-system";
import { ThemeStatus } from "@/components/ThemeStatus";
import { DatabaseSetupNotice } from "@/components/DatabaseSetupNotice";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DataContextErrorBoundary } from "@/components/DataContextErrorBoundary";
import Index from "./pages/Index";
import SimplifiedChatbot from "./pages/SimplifiedChatbot";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Resources from "./pages/Resources";
import Techniques from "./pages/Techniques";
import Profile from "./pages/Profile";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <DataContextErrorBoundary>
          <DataProvider key="data-provider">
          <ThemeProvider>
            <BrowserRouter>
              <NotificationSystem />
              <DatabaseSetupNotice />
              <ThemeStatus />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route
                  path="/chatbot"
                  element={
                    <ProtectedRoute>
                      <SimplifiedChatbot />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/journal"
                  element={
                    <ProtectedRoute>
                      <Journal />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resources"
                  element={
                    <ProtectedRoute>
                      <Resources />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/techniques"
                  element={
                    <ProtectedRoute>
                      <Techniques />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/about" element={<About />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/auth" element={<Auth />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
          </DataProvider>
        </DataContextErrorBoundary>
      </AuthProvider>
    </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

// Ensure we only create root once
const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<App />);
