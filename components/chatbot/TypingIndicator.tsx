import React, { useEffect, useState } from "react";
import { Bot } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const TypingIndicator: React.FC = () => {
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const getSystemTheme = () => (mediaQuery.matches ? "dark" : "light");

    const handleThemeChange = () => {
      if (theme === "system") {
        setResolvedTheme(getSystemTheme());
      }
    };

    if (theme === "system") {
      setResolvedTheme(getSystemTheme());
      mediaQuery.addEventListener("change", handleThemeChange);
    } else {
      setResolvedTheme(theme === "dark" ? "dark" : "light");
    }

    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, [theme]);

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex justify-start animate-fadeIn">
      <div className="flex max-w-[80%] flex-row">
        <div className="flex-shrink-0 mr-2 self-end">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            <Bot size={18} />
          </div>
        </div>

        <div>
          <div
            className={`px-4 py-3 rounded-2xl rounded-bl-none shadow-sm ${
              isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
            }`}
          >
            <div className="flex space-x-1">
              <div
                className={`w-2 h-2 rounded-full animate-bounce ${
                  isDark ? "bg-gray-300" : "bg-gray-500"
                }`}
                style={{ animationDelay: "0ms" }}
              />
              <div
                className={`w-2 h-2 rounded-full animate-bounce ${
                  isDark ? "bg-gray-300" : "bg-gray-500"
                }`}
                style={{ animationDelay: "150ms" }}
              />
              <div
                className={`w-2 h-2 rounded-full animate-bounce ${
                  isDark ? "bg-gray-300" : "bg-gray-500"
                }`}
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
          <div
            className={`text-xs mt-1 text-left ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            respondendo...
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
