/**
 * Security utility functions for input validation and sanitization
 */

import type { GuessFeedback } from '@/types';

/**
 * Safely parse JSON with error handling and optional validation
 * @param item The string to parse
 * @param defaultValue Default value to return if parsing fails
 * @param validator Optional validation function
 * @returns Parsed value or default value
 */
export function safeParseJSON<T>(
  item: string | null,
  defaultValue: T,
  validator?: (value: unknown) => value is T
): T {
  if (!item) return defaultValue;

  try {
    const parsed: unknown = JSON.parse(item);

    // If validator is provided, use it to check the parsed value
    if (validator && !validator(parsed)) {
      return defaultValue;
    }

    return parsed as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Sanitize a string for use in CSS
 * @param value The value to sanitize
 * @returns Sanitized string safe for CSS
 */
export function sanitizeCSSValue(value: string): string {
  // Remove any potentially dangerous characters that could escape CSS context
  return value.replace(/[<>"'`\\\/\(\)\{\}]/g, '').trim();
}

/**
 * Sanitize a string for use as an identifier (IDs, class names, etc.)
 * @param name The name to sanitize
 * @returns Sanitized string containing only safe characters
 */
export function sanitizeIdentifier(name: string): string {
  // Only allow alphanumeric characters, hyphens, and underscores
  return name.replace(/[^a-zA-Z0-9\-_]/g, '');
}

/**
 * Generate a cryptographically secure random string
 * @param length The length of the random string (in bytes, will be doubled in hex)
 * @param prefix Optional prefix for the generated string
 * @returns Secure random string
 */
export function generateSecureId(length: number = 16, prefix?: string): string {
  const prefixStr = prefix ? `${prefix}-` : '';

  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    // Use crypto.getRandomValues for secure random generation
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return prefixStr + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback for environments without crypto API
    return prefixStr + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2);
  }
}

/**
 * Validate and sanitize localStorage data
 * @param key The localStorage key
 * @param validator Optional validation function
 * @returns Validated and sanitized data or null
 */
export function getSecureLocalStorageItem<T>(
  key: string,
  validator?: (value: unknown) => value is T
): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsed: unknown = JSON.parse(item);

    if (validator && !validator(parsed)) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed as T;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Type guard for validating game state
 */
export function isValidGameState(value: unknown): value is 'playing' | 'won' | 'lost' {
  return typeof value === 'string' && ['playing', 'won', 'lost'].includes(value);
}

/**
 * Type guard for validating array of guess feedback
 */
export function isGuessFeedback(value: unknown): value is GuessFeedback {
  // First, ensure it's a non-null object. This is a crucial first step.
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  // Now that we know it's an object, we can safely use the 'in' operator
  // to check for the existence of properties.
  return 'guessedTheoremName' in value && 'propertiesFeedback' in value && 'guessString' in value;
}
