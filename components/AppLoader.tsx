import React from "react";
import Image from "next/image";
import logo1 from "@/assets/Logo1.png";

/** Tela de carregamento geral — branded e discreta. */
export default function AppLoader({ label = "A preparar o seu estudo…" }: { label?: string }) {
  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="relative">
        {/* halo pulsante */}
        <span className="absolute inset-0 -z-10 animate-ping rounded-3xl bg-brand opacity-20" />
        <span className="absolute -inset-3 -z-10 rounded-[2rem] bg-brand opacity-10 blur-xl" />
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand shadow-xl shadow-primary/25">
          <Image src={logo1} alt="" width={80} height={80} className="h-12 w-12 animate-[float_2.4s_ease-in-out_infinite] object-contain" priority />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: `${i * 140}ms` }}
            />
          ))}
        </div>
        <p className="font-display text-sm text-muted-foreground">{label}</p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
