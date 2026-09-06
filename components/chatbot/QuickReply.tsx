import React from "react";

interface QuickReplyProps {
  text: string;
  onClick: () => void;
}

const QuickReply: React.FC<QuickReplyProps> = ({ text, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="whitespace-nowrap rounded-full border border-border bg-surface px-3.5 py-1.5
                 text-xs font-medium text-muted-foreground shadow-sm transition-all
                 hover:border-primary/40 hover:bg-accent hover:text-foreground
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50
                 active:scale-[0.97]"
    >
      {text}
    </button>
  );
};

export default QuickReply;
