/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { MessageType } from "@/types";

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isBot = message.sender === "bot";

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex ${
        isBot ? "justify-start" : "justify-end"
      } animate-fadeIn`}
    >
      <div
        className={`flex max-w-[80%] ${
          isBot ? "flex-row" : "flex-row-reverse"
        }`}
      >
        <div className={`flex-shrink-0 ${isBot ? "mr-2" : "ml-2"} self-end`}>
          {isBot ? (
            <div className="bg-gray-600 w-8 h-8 rounded-full flex items-center justify-center">
              <Bot size={18} className="" />
            </div>
          ) : (
            <div className="bg-gray-500 w-8 h-8 rounded-full flex items-center justify-center">
              <User size={18} className="" />
            </div>
          )}
        </div>

        <div>
          <div
            className={`px-4 py-3 rounded-2xl prose prose-sm ${
              isBot ? "bg-gray-600  rounded-bl-none" : " rounded-br-none"
            } shadow-sm`}
          >
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    className="text-blue-600 underline hover:text-blue-800"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
          <div
            className={`text-xs text-gray-500 mt-1 ${
              isBot ? "text-left" : "text-right"
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
