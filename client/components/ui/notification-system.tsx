import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Trophy, Flame, Star, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationType =
  | "achievement"
  | "streak"
  | "milestone"
  | "encouragement";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

const notificationIcons = {
  achievement: Trophy,
  streak: Flame,
  milestone: Star,
  encouragement: Gift,
};

const notificationColors = {
  achievement: "from-yellow-500 to-orange-500",
  streak: "from-red-500 to-orange-500",
  milestone: "from-purple-500 to-pink-500",
  encouragement: "from-mint-500 to-sky-500",
};

let notificationQueue: Notification[] = [];
let notifyCallback: ((notifications: Notification[]) => void) | null = null;
let notificationCounter = 0;

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    notifyCallback = setNotifications;
    return () => {
      notifyCallback = null;
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications]);

  return (
    <div className="fixed top-12 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => {
        const IconComponent = notificationIcons[notification.type];
        return (
          <Card
            key={notification.id}
            className={cn(
              "shadow-2xl border-2 border-white/20 overflow-hidden animate-in slide-in-from-right-full duration-500",
              "bg-white backdrop-blur-md",
              "hover:shadow-3xl transition-all duration-200",
            )}
          >
            <div
              className={cn(
                "h-2 bg-gradient-to-r",
                notificationColors[notification.type],
              )}
            />
            <CardContent className="p-5">
              <div className="flex items-start space-x-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r shadow-lg",
                    notificationColors[notification.type],
                  )}
                >
                  {notification.icon ? (
                    <span className="text-xl">{notification.icon}</span>
                  ) : (
                    <IconComponent className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-gray-900 mb-2">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {notification.message}
                  </p>
                  {notification.action && (
                    <Button
                      size="sm"
                      onClick={notification.action.onClick}
                      className="mt-2 bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                    >
                      {notification.action.label}
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function showNotification(notification: Omit<Notification, "id">) {
  const newNotification: Notification = {
    ...notification,
    id: `notification-${Date.now()}-${++notificationCounter}`,
    duration: notification.duration || 5000,
  };

  notificationQueue.push(newNotification);

  if (notifyCallback) {
    notifyCallback([...notificationQueue]);
  }

  // Clean up queue after notification expires
  setTimeout(() => {
    notificationQueue = notificationQueue.filter(
      (n) => n.id !== newNotification.id,
    );
  }, newNotification.duration || 5000);
}
