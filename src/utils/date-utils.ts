/**
 * Date utility functions using date-fns 
 * Format-based approach (pure format patterns, no locales)
 * Supports flexible separators: dot (.), slash (/), hyphen (-)
 */

import { parse, format, isValid } from 'date-fns';

// Default format
let DEFAULT_FORMAT: string = 'dd.MM.yyyy';  // Format pattern (e.g., "dd.MM.yyyy", "MM/dd/yyyy")

/**
 * Set the global default format
 * @param formatStr - Format string (e.g., "dd.MM.yyyy", "MM/dd/yyyy", "yyyy-MM-dd")
 */
export function setDefaultFormat(formatStr: string): void {
    DEFAULT_FORMAT = formatStr;
}

/**
 * Get current default format
 */
export function getDefaultFormat(): string {
    return DEFAULT_FORMAT;
}

/**
 * Parse a date string with format string
 * Automatically tries variations with different separators (., /, -)
 * 
 * @param dateStr - Date string to parse (e.g., "15.04.2026", "15/04/2026", "15-04-2026")
 * @param formatStr - Format string (e.g., "dd.MM.yyyy")
 * @returns ISO string or null if invalid
 */
export function parse_date(dateStr: string, formatStr: string): string | null {
    if (!dateStr || !dateStr.trim()) return null;

    try {
        const trimmedStr = dateStr.trim();

        // Try with original format
        let parsed = parse(trimmedStr, formatStr, new Date());
        if (isValid(parsed)) return parsed.toISOString();

        // Try variations with different separators
        const separators = ['.', '/', '-'];
        for (const sep of separators) {
            const normalizedFormat = formatStr.replace(/[./\-]/g, sep);
            const normalizedStr = trimmedStr.replace(/[./\-]/g, sep);

            parsed = parse(normalizedStr, normalizedFormat, new Date());
            if (isValid(parsed)) return parsed.toISOString();
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * Smart parse with default format
 * Tries multiple separator variations
 * 
 * @param dateStr - Date string to parse
 * @param formatStr - Optional format (uses global default if not provided)
 * @returns ISO string or null if invalid
 */
export function parse_auto(dateStr: string, formatStr?: string): string | null {
    const fmt = formatStr || DEFAULT_FORMAT;
    return parse_date(dateStr, fmt);
}

/**
 * Format ISO date string with format string
 * 
 * @param isoDateStr - ISO date string from database
 * @param formatStr - Format string (e.g., "dd.MM.yyyy")
 * @returns Formatted date string
 */
export function format_date(isoDateStr: string, formatStr: string): string {
    try {
        const date = new Date(isoDateStr);
        if (!isValid(date)) return '';
        return format(date, formatStr);
    } catch {
        return '';
    }
}

/**
 * Format with default format
 * Uses global default format
 * 
 * @param isoDateStr - ISO date string from database
 * @param formatStr - Optional format (uses global default if not provided)
 * @returns Formatted date string
 */
export function format_auto(isoDateStr: string, formatStr?: string): string {
    const fmt = formatStr || DEFAULT_FORMAT;
    return format_date(isoDateStr, fmt);
}

/**
 * Convert Date object to ISO string (for storage)
 * @param date - Date object
 * @returns ISO string
 */
export function toISO(date: Date): string {
    if (!isValid(date)) throw new Error('Invalid date');
    return date.toISOString();
}

/**
 * Parse ISO string to Date object
 * @param isoStr - ISO date string
 * @returns Date object or null if invalid
 */
export function fromISO(isoStr: string): Date | null {
    const date = new Date(isoStr);
    return isValid(date) ? date : null;
}

/**
 * Get current date as ISO string
 */
export function now(): string {
    return new Date().toISOString();
}
