import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes text for search comparisons by converting to lowercase and stripping
 * combining diacritical marks (e.g. 'ă', 'â' -> 'a', 'î' -> 'i', 'ș', 'ş' -> 's', 'ț', 'ţ' -> 't', 'é' -> 'e', etc.).
 *
 * @param text The input string to normalize
 * @returns Normalized diacritic-insensitive, lowercased string
 */
export function normalizeSearchText(text?: string | null): string {
  if (!text) return "";
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim();
}
