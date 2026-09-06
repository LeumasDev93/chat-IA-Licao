import React from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import logo2 from "@/assets/Logo2.png";

const ImageLoading: React.FC = () => (
  <div className="flex animate-fadeIn gap-3">
    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand ring-1 ring-border">
      <Image src={logo2} alt="" width={20} height={20} className="h-4 w-4 object-contain brightness-0 invert" />
    </div>

    <div className="min-w-0 flex-1">
      <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl rounded-tl-sm border border-border bg-surface-2">
        {/* shimmer */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <ImageIcon size={26} className="animate-pulse text-primary" />
          <span className="text-xs">Montando o infográfico da lição…</span>
          <span className="text-[10px] opacity-70">pode levar até 1 minuto</span>
        </div>
      </div>
    </div>

    <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
  </div>
);

export default ImageLoading;
