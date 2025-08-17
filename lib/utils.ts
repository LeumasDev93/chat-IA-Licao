import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Contador para garantir IDs únicos mesmo em execuções muito rápidas
let idCounter = 0;

/**
 * Gera um ID único baseado em timestamp, contador e string aleatória
 * @param prefix - Prefixo opcional para o ID
 * @returns ID único
 */
export function generateUniqueId(prefix?: string): string {
  const timestamp = Date.now();
  const counter = ++idCounter;
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${timestamp}_${counter}_${random}` : `${timestamp}_${counter}_${random}`;
}

