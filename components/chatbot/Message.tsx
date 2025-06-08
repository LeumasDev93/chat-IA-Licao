/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { MessageType } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
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

  const isBot = message.sender === "bot";
  const isDark = resolvedTheme === "dark";

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const userBubbleClass = isDark
    ? "bg-blue-600 text-white"
    : "bg-blue-100 text-gray-900";

  const userAvatarClass = isDark
    ? "bg-blue-700 text-white"
    : "bg-blue-200 text-blue-800";

  const botBubbleClass = isDark
    ? "bg-gray-800 text-white"
    : "bg-gray-100 text-gray-900";

  const botAvatarClass = isDark
    ? "bg-gray-700 text-white"
    : "bg-gray-200 text-gray-800";

  return (
    <div
      className={`flex ${
        isBot ? "justify-start" : "justify-end"
      } animate-fadeIn`}
    >
      <div
        className={`flex max-w-[90%] sm:max-w-[100%] ${
          isBot ? "flex-row" : "flex-row-reverse"
        }`}
      >
        <div className={`flex-shrink-0 ${isBot ? "mr-2" : "ml-2"} self-end`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isBot ? botAvatarClass : userAvatarClass
            }`}
          >
            {isBot ? <Bot size={18} /> : <User size={18} />}
          </div>
        </div>

        <div>
          <div
            className={`px-4 py-3 rounded-2xl prose prose-sm shadow-sm ${
              isBot
                ? `${botBubbleClass} rounded-bl-none`
                : `${userBubbleClass} rounded-br-none`
            }`}
          >
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    className={`underline ${
                      isBot
                        ? isDark
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-600 hover:text-gray-800"
                        : isDark
                        ? "text-blue-200 hover:text-white"
                        : "text-blue-700 hover:text-blue-900"
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                p: ({ node, ...props }) => <p {...props} className="my-1" />,
                strong: ({ node, ...props }) => (
                  <strong {...props} className="font-semibold" />
                ),
                em: ({ node, ...props }) => (
                  <em {...props} className="italic" />
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
          <div
            className={`text-xs mt-1 ${
              isBot
                ? isDark
                  ? "text-gray-400 text-left"
                  : "text-gray-500 text-left"
                : isDark
                ? "text-blue-300 text-right"
                : "text-blue-600 text-right"
            }`}
          >
            {formattedTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
