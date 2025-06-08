import React from "react";

interface QuickReplyProps {
  text: string;
  onClick: () => void;
}

const QuickReply: React.FC<QuickReplyProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-gray-600 shadow-2xl px-3 py-1.5 rounded-full text-[12px] md:text-xs xl:text-sm  transition-colors focus:outline-none focus:ring-1 focus:ring-gray-300"
    >
      {text}
    </button>
  );
};

export default QuickReply;
