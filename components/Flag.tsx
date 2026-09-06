import React from "react";
import type { Language } from "@/contexts/LanguageContext";

/**
 * Bandeiras em SVG inline — não dependem de suporte a emoji do sistema
 * (o Windows/Chrome não renderiza emoji de bandeira).
 * Desenhos simplificados, apenas reconhecíveis.
 */

const flags: Record<Language, React.ReactNode> = {
  pt: (
    <>
      <rect width="9" height="14" fill="#046a38" />
      <rect x="9" width="11" height="14" fill="#da291c" />
      <circle cx="9" cy="7" r="3" fill="#ffd100" stroke="#fff" strokeWidth="0.6" />
      <circle cx="9" cy="7" r="1.5" fill="#046a38" />
    </>
  ),
  en: (
    <>
      <rect width="20" height="14" fill="#b31942" />
      {[1, 3, 5, 7, 9, 11, 13].map((y) => (
        <rect key={y} y={y} width="20" height="1" fill="#fff" />
      ))}
      <rect width="9" height="8" fill="#0a3161" />
    </>
  ),
  es: (
    <>
      <rect width="20" height="14" fill="#c60b1e" />
      <rect y="3.5" width="20" height="7" fill="#ffc400" />
    </>
  ),
  fr: (
    <>
      <rect width="20" height="14" fill="#fff" />
      <rect width="6.7" height="14" fill="#002395" />
      <rect x="13.3" width="6.7" height="14" fill="#ed2939" />
    </>
  ),
  krioulu: (
    <>
      <rect width="20" height="14" fill="#003893" />
      <rect y="7" width="20" height="2.2" fill="#fff" />
      <rect y="9.2" width="20" height="1.4" fill="#cf142b" />
      <rect y="10.6" width="20" height="2.2" fill="#fff" />
      <circle cx="8" cy="8" r="3.4" fill="none" stroke="#f7d116" strokeWidth="0.7" />
    </>
  ),
};

export default function Flag({
  code,
  className = "",
  size = 20,
}: {
  code: Language;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 20 14"
      width={size}
      height={(size * 14) / 20}
      className={`inline-block flex-shrink-0 rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] ${className}`}
      role="img"
      aria-hidden="true"
    >
      {flags[code]}
    </svg>
  );
}
