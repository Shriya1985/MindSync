import { useTheme } from "@/contexts/ThemeContext";

export function ThemeStatus() {
  const { currentTheme, isAutoMode } = useTheme();

  return (
    <div
      className="fixed bottom-4 left-4 z-40 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/20"
      style={{ borderColor: currentTheme.colors.primary + "40" }}
    >
      <div className="flex items-center space-x-2">
        <div
          className="w-3 h-3 rounded-full border border-gray-300"
          style={{ backgroundColor: currentTheme.colors.primary }}
        />
        <span className="text-xs font-medium text-gray-700">
          {currentTheme.name} {isAutoMode ? "(Auto)" : "(Manual)"}
        </span>
      </div>
    </div>
  );
}
