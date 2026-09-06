import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import logo2 from "@/assets/Logo2.png";

const TypingIndicator: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex animate-fadeIn gap-3">
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand ring-1 ring-border">
        <Image src={logo2} alt="" width={20} height={20} className="h-full w-full object-cover" />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-3 shadow-sm">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <span className="pl-1 text-xs text-muted-foreground">{t("typing")}</span>
      </div>
    </div>
  );
};

export default TypingIndicator;
