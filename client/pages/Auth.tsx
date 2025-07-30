import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { showNotification } from "@/components/ui/notification-system";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Sparkles,
  Brain,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  clearAllAuthStates,
  forceCleanRegistration,
  checkAuthStates,
} from "@/utils/authReset";
import {
  testSupabaseAuth,
  createTestUser,
  testLogin,
  resetAuthCompletely,
} from "@/utils/authTest";
import { createUserAndProfile } from "@/utils/simpleAuth";

type AuthMode = "login" | "register";

const motivationalTexts = [
  "Every journey begins with a single step 🌱",
  "Your mental wellness matters 💚",
  "You're taking care of yourself today ✨",
  "Small steps lead to big changes 🦋",
  "You deserve peace and happiness 🌸",
];

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    rememberMe: false,
  });
  const [currentMotivation] = useState(
    motivationalTexts[Math.floor(Math.random() * motivationalTexts.length)],
  );

  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated - using useEffect to avoid setState during render
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state?.from?.pathname]);

  // Don't render the form if user is authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Auth reset functions
  const handleAuthReset = () => {
    clearAllAuthStates();
    setError(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
      rememberMe: false,
    });
    showNotification(
      "All authentication states cleared. Try registering again.",
      "info",
    );
  };

  const handleForceRegistration = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    const result = await forceCleanRegistration(
      formData.name.trim(),
      formData.email.trim().toLowerCase(),
      formData.password,
    );

    if (result.success) {
      showNotification(result.message, "success");
      // Redirect to dashboard
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let result;

      if (mode === "login") {
        const email = formData.email.trim().toLowerCase();
        result = await login(email, formData.password);
      } else {
        // Validate form for registration
        const email = formData.email.trim().toLowerCase();
        const name = formData.name.trim();

        if (!name) {
          setError("Please enter your name");
          setIsLoading(false);
          return;
        }

        if (!email) {
          setError("Please enter your email");
          setIsLoading(false);
          return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setError("Please enter a valid email address");
          setIsLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters");
          setIsLoading(false);
          return;
        }

        if (!formData.agreeToTerms) {
          setError("Please agree to the terms and conditions");
          setIsLoading(false);
          return;
        }

        result = await register(name, email, formData.password);
      }

      if (result.success) {
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        setError(
          result.error ||
            "Authentication failed. Please check your credentials.",
        );
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    "AI-powered emotional support",
    "Private mood tracking",
    "Personalized insights",
    "24/7 availability",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-sky-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Welcome Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-mint-500 to-sky-500 rounded-2xl mb-6">
              <Heart className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Let's check in.{" "}
              <span className="bg-gradient-to-r from-mint-600 to-sky-600 bg-clip-text text-transparent">
                One step at a time.
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              Join thousands of people on their mental wellness journey with
              MindSync. Your personal AI companion is waiting to support you.
            </p>

            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-mint-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gradient-to-r from-mint-100 to-sky-100 rounded-xl border border-mint-200">
              <div className="flex items-center space-x-2 text-mint-700">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">{currentMotivation}</span>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-mint-400 to-sky-400 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {mode === "login" ? "Welcome Back" : "Create Account"}
                  </h2>
                  <p className="text-gray-600">
                    {mode === "login"
                      ? "Continue your wellness journey"
                      : "Start your mental wellness journey"}
                  </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setMode("login")}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
                      mode === "login"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900",
                    )}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setMode("register")}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
                      mode === "register"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900",
                    )}
                  >
                    Sign Up
                  </button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "register" && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="border-gray-200 focus:border-mint-300 focus:ring-mint-200"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="pl-10 border-gray-200 focus:border-mint-300 focus:ring-mint-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className="pl-10 pr-10 border-gray-200 focus:border-mint-300 focus:ring-mint-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {mode === "register" && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          className="pl-10 border-gray-200 focus:border-mint-300 focus:ring-mint-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    {mode === "login" && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberMe"
                          checked={formData.rememberMe}
                          onCheckedChange={(checked) =>
                            handleInputChange("rememberMe", !!checked)
                          }
                          className="border-gray-300 data-[state=checked]:bg-mint-500 data-[state=checked]:border-mint-500"
                        />
                        <Label
                          htmlFor="rememberMe"
                          className="text-sm text-gray-600"
                        >
                          Remember me
                        </Label>
                      </div>
                    )}

                    {mode === "register" && (
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) =>
                            handleInputChange("agreeToTerms", !!checked)
                          }
                          className="mt-1 border-gray-300 data-[state=checked]:bg-mint-500 data-[state=checked]:border-mint-500"
                        />
                        <Label
                          htmlFor="agreeToTerms"
                          className="text-sm text-gray-600 leading-relaxed"
                        >
                          I agree to the{" "}
                          <Link
                            to="/terms"
                            className="text-mint-600 hover:text-mint-700 underline"
                          >
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            to="/privacy"
                            className="text-mint-600 hover:text-mint-700 underline"
                          >
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {mode === "login"
                          ? "Signing In..."
                          : "Creating Account..."}
                      </>
                    ) : (
                      <>
                        {mode === "login" ? "Sign In" : "Create Account"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  {mode === "login" && (
                    <div className="text-center">
                      <Link
                        to="/forgot-password"
                        className="text-sm text-mint-600 hover:text-mint-700 underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  )}
                </form>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-gray-200 hover:bg-gray-50"
                    size="lg"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </div>

                <div className="text-center p-4 bg-gradient-to-r from-mint-50 to-sky-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-mint-500" />
                    <span>Your privacy and security are our top priority</span>
                  </div>
                </div>

                {/* Debug Panel - Remove after fixing auth issues */}
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-3">
                    Authentication Troubleshooting
                  </p>
                  <div className="flex flex-col space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => testSupabaseAuth()}
                      className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      Test Supabase Setup
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => resetAuthCompletely()}
                      className="text-xs border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Complete Auth Reset
                    </Button>
                    {mode === "register" && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          onClick={async () => {
                            const result = await createUserAndProfile(
                              formData.name.trim(),
                              formData.email.trim().toLowerCase(),
                              formData.password,
                            );

                            if (result.success) {
                              showNotification(result.message, "success");
                              // Navigate to dashboard
                              const from =
                                location.state?.from?.pathname || "/dashboard";
                              navigate(from, { replace: true });
                            } else {
                              setError(result.error);
                            }
                          }}
                          disabled={
                            isLoading ||
                            !formData.email ||
                            !formData.password ||
                            !formData.name
                          }
                          className="text-xs bg-green-600 hover:bg-green-700 text-white"
                        >
                          ✨ Simple Registration
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() =>
                            createTestUser(
                              formData.email.trim().toLowerCase(),
                              formData.password,
                              formData.name.trim(),
                            )
                          }
                          disabled={
                            isLoading ||
                            !formData.email ||
                            !formData.password ||
                            !formData.name
                          }
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          🧪 Test Registration
                        </Button>
                      </>
                    )}
                    {mode === "login" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          testLogin(
                            formData.email.trim().toLowerCase(),
                            formData.password,
                          )
                        }
                        disabled={
                          isLoading || !formData.email || !formData.password
                        }
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Test Login
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Check console (F12) for detailed output
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
