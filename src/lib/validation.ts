/**
 * Utility functions for validating emails and Romanian phone numbers.
 */

/**
 * Validates email address format enforcing domain name and valid TLD extension.
 * Rejects invalid email strings, missing TLDs, or single-character TLDs.
 *
 * @param email - The email string to validate
 * @returns `true` if valid, `false` otherwise
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.includes("..")) return false;
  // Standard RFC-compatible regex requiring at least a 2-letter TLD (e.g. .com, .ro, .org, .net)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
}

/**
 * Validates simple 10-digit Romanian phone number format without prefix (+4 or +40).
 * Requires exactly 10 digits starting with '0' (e.g., 0723456789, 02xxxxxxx, 03xxxxxxx), containing only numbers.
 * Rejects spaces, dots, dashes, and country prefixes like +4.
 *
 * @param phone - The phone number string to validate
 * @returns `true` if valid, `false` otherwise
 */
export function isValidRomanianPhone(phone: string | null | undefined): boolean {
  if (!phone || typeof phone !== "string") return false;
  const trimmed = phone.trim();
  // 10 digits starting with 02, 03, or 07
  const phoneRegex = /^0[237]\d{8}$/;
  return phoneRegex.test(trimmed);
}

/**
 * Validates website URL format requiring http:// or https:// scheme and a valid domain/hostname structure.
 * Rejects invalid URLs or URLs with unsupported schemes (e.g., ftp://, javascript:).
 *
 * @param url - The URL string to validate
 * @returns `true` if valid, `false` otherwise
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
