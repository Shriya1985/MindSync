import { useState, useEffect } from "react";
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

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => {
        const IconComponent = notificationIcons[notification.type];
        return (
          <Card
            key={notification.id}
            className={cn(
              "shadow-2xl border-0 overflow-hidden animate-in slide-in-from-right-full duration-300",
              "bg-white/95 backdrop-blur-sm",
            )}
          >
            <div
              className={cn(
                "h-1 bg-gradient-to-r",
                notificationColors[notification.type],
              )}
            />
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r",
                    notificationColors[notification.type],
                  )}
                >
                  {notification.icon ? (
                    <span className="text-lg">{notification.icon}</span>
                  ) : (
                    <IconComponent className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {notification.message}
                  </p>
                  {notification.action && (
                    <Button
                      size="sm"
                      onClick={notification.action.onClick}
                      className="mt-2 bg-gradient-to-r from-mint-500 to-sky-500 hover:from-mint-600 hover:to-sky-600 text-white"
                    >
                      {notification.action.label}
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600 p-1"
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
    id: Date.now().toString(),
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
