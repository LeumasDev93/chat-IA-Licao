import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  try {
    return value.toLocaleString('pt-CV', {
      style: 'currency',
      currency: 'CVE', // Código oficial ISO 4217 é "CVE"
    });
  } catch {
    return `${value.toFixed(2)} CVE`;
  }
}
