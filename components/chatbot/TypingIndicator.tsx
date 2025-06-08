import React from "react";
import { Bot } from "lucide-react";

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start animate-fadeIn">
      <div className="flex max-w-[80%] flex-row">
        <div className="flex-shrink-0 mr-2 self-end">
          <div className="bg-gray-600 w-8 h-8 rounded-full flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
        </div>

        <div>
          <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm">
            <div className="flex space-x-1">
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-left">
            respondendo...
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
