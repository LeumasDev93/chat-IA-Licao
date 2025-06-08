import { useTheme } from "@/contexts/ThemeContext";
import React from "react";

interface QuickReplyProps {
  text: string;
  onClick: () => void;
}

const QuickReply: React.FC<QuickReplyProps> = ({ text, onClick }) => {
  const { theme } = useTheme();
  console.log("Theme in QuickReply:", theme);

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[12px] md:text-xs xl:text-sm transition-colors focus:outline-none focus:ring-1 ${
        theme === "dark"
          ? "bg-gray-600 text-white shadow-2xl focus:ring-gray-300 hover:bg-gray-700"
          : "bg-gray-200 text-gray-800 shadow-md focus:ring-blue-500 hover:bg-gray-300"
      }`}
    >
      {text}
    </button>
  );
};

export default QuickReply;
