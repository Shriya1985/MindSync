import { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { showNotification } from "@/components/ui/notification-system";
import {
  User,
  Settings,
  Bell,
  Shield,
  Palette,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Trophy,
  Heart,
  Brain,
  Calendar,
  BarChart3,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "privacy" | "notifications" | "data";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { user, updateProfile, logout } = useAuth();
  const { userStats, moodEntries, journalEntries } = useData();

  // Initialize form data with user info
  useState(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
  });

  const handleSaveProfile = () => {
    // In a real app, this would update the user profile
    setIsEditing(false);
    showNotification({
      type: "encouragement",
      title: "Profile Updated! ✨",
      message: "Your profile has been successfully updated.",
      duration: 3000,
    });
  };

  const handleExportData = () => {
    const data = {
      profile: user,
      stats: userStats,
      moodEntries,
      journalEntries,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindsync-data-export.json";
    a.click();
    URL.revokeObjectURL(url);

    showNotification({
      type: "encouragement",
      title: "Data Exported! 📋",
      message: "Your MindSync data has been downloaded successfully.",
      duration: 3000,
    });
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      // In a real app, this would delete the account
      logout();
      showNotification({
        type: "encouragement",
        title: "Account Deleted",
        message: "Your account has been deleted. Take care! 💚",
        duration: 5000,
      });
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "data", label: "Data & Export", icon: Download },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-sky-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-mint-500 to-sky-500 rounded-2xl mb-6">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profile & Settings
          </h1>
          <p className="text-gray-600">
            Manage your account, privacy settings, and data preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                {/* User Info */}
                <div className="text-center mb-6">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-20 h-20 rounded-full mx-auto mb-4"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-mint-600" />
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {user?.name}
                  </h3>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                  <div className="flex items-center justify-center mt-3">
                    <Badge className="bg-mint-100 text-mint-700">
                      Level {userStats.level} • {userStats.points} points
                    </Badge>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab(tab.id as SettingsTab)}
                        className={cn(
                          "w-full justify-start",
                          activeTab === tab.id &&
                            "bg-mint-500 hover:bg-mint-600",
                        )}
                      >
                        <IconComponent className="w-4 h-4 mr-2" />
                        {tab.label}
                      </Button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-mint-500" />
                      <span className="text-sm text-gray-600">Entries</span>
                    </div>
                    <span className="font-semibold">
                      {userStats.totalEntries}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Edit3 className="w-4 h-4 text-sky-500" />
                      <span className="text-sm text-gray-600">Words</span>
                    </div>
                    <span className="font-semibold">
                      {userStats.totalWords}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Streak</span>
                    </div>
                    <span className="font-semibold">
                      {userStats.currentStreak}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">
                        Achievements
                      </span>
                    </div>
                    <span className="font-semibold">
                      {userStats.achievements.filter((a) => a.earned).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8">
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold text-gray-900">
                        Profile Information
                      </h2>
                      <Button
                        onClick={() => setIsEditing(!isEditing)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        {isEditing ? "Cancel" : "Edit"}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          disabled={!isEditing}
                          className="border-gray-200 focus:border-mint-300 focus:ring-mint-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          disabled={!isEditing}
                          className="border-gray-200 focus:border-mint-300 focus:ring-mint-200"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio (Optional)</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        disabled={!isEditing}
                        placeholder="Tell us a bit about yourself and your wellness journey..."
                        className="border-gray-200 focus:border-mint-300 focus:ring-mint-200"
                      />
                    </div>

                    {isEditing && (
                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Change Password
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="currentPassword">
                              Current Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="currentPassword"
                                type={showPassword ? "text" : "password"}
                                value={formData.currentPassword}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    currentPassword: e.target.value,
                                  })
                                }
                                className="border-gray-200 focus:border-mint-300 focus:ring-mint-200"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={formData.newPassword}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  newPassword: e.target.value,
                                })
                              }
                              className="border-gray-200 focus:border-mint-300 focus:ring-mint-200"
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirmPassword">
                              Confirm Password
                            </Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={formData.confirmPassword}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className="border-gray-200 focus:border-mint-300 focus:ring-mint-200"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {isEditing && (
                      <div className="flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          className="bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "privacy" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Privacy & Security
                    </h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-mint-50 rounded-lg border border-mint-200">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Data Encryption
                          </h3>
                          <p className="text-sm text-gray-600">
                            All your data is encrypted end-to-end
                          </p>
                        </div>
                        <Shield className="w-6 h-6 text-mint-600" />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Profile Visibility
                          </h3>
                          <p className="text-sm text-gray-600">
                            Keep your profile private
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Analytics Sharing
                          </h3>
                          <p className="text-sm text-gray-600">
                            Help improve MindSync with anonymous data
                          </p>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Two-Factor Authentication
                          </h3>
                          <p className="text-sm text-gray-600">
                            Add an extra layer of security
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Notification Preferences
                    </h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Daily Reminders
                          </h3>
                          <p className="text-sm text-gray-600">
                            Gentle reminders to check in with yourself
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Achievement Alerts
                          </h3>
                          <p className="text-sm text-gray-600">
                            Celebrations for milestones and streaks
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Weekly Insights
                          </h3>
                          <p className="text-sm text-gray-600">
                            Summary of your wellness journey
                          </p>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Resource Recommendations
                          </h3>
                          <p className="text-sm text-gray-600">
                            Personalized content suggestions
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "data" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Data Management
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border border-gray-200">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Download className="w-5 h-5" />
                            <span>Export Data</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">
                            Download all your MindSync data in JSON format.
                          </p>
                          <Button
                            onClick={handleExportData}
                            variant="outline"
                            className="w-full"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export All Data
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="border border-red-200">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2 text-red-700">
                            <Trash2 className="w-5 h-5" />
                            <span>Delete Account</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">
                            Permanently delete your account and all associated
                            data.
                          </p>
                          <Button
                            onClick={handleDeleteAccount}
                            variant="outline"
                            className="w-full border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Data Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-mint-600">
                              {moodEntries.length}
                            </div>
                            <div className="text-sm text-gray-600">
                              Mood Entries
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-sky-600">
                              {journalEntries.length}
                            </div>
                            <div className="text-sm text-gray-600">
                              Journal Entries
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-orange-600">
                              {userStats.totalWords}
                            </div>
                            <div className="text-sm text-gray-600">
                              Words Written
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">
                              {
                                userStats.achievements.filter((a) => a.earned)
                                  .length
                              }
                            </div>
                            <div className="text-sm text-gray-600">
                              Achievements
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
