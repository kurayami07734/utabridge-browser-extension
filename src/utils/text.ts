import type { CachedTranslation, PrimaryDisplay } from '@/utils/types';

// ─── SCRIPT DETECTION ──────────────────────────────────────────────────────

/**
 * Check if a character is a Latin-script letter.
 * Covers Basic Latin (A-Z, a-z), Latin-1 Supplement (À-ÿ),
 * Latin Extended-A (Ā-ſ), and Latin Extended-B (ƀ-ɏ).
 * This includes diacritics used in German, French, Spanish, etc.
 */
function isLatinLetter(code: number): boolean {
    return (
        (code >= 0x41 && code <= 0x5a) || // A-Z
        (code >= 0x61 && code <= 0x7a) || // a-z
        (code >= 0xc0 && code <= 0xff && code !== 0xd7 && code !== 0xf7) || // Latin-1 Supplement letters (À-ÿ, excluding × ÷)
        (code >= 0x0100 && code <= 0x024f) // Latin Extended-A + B
    );
}

/**
 * Check if a character is a "letter" (not space, punctuation, digits, or symbols).
 * Uses a broad heuristic: anything above 0x2F that isn't in known punctuation/symbol ranges.
 */
function isLetter(code: number): boolean {
    // Basic digit range
    if (code >= 0x30 && code <= 0x39) return false;
    // Basic ASCII punctuation/symbols/control (0x00-0x40 excluding digits, 0x5B-0x60, 0x7B-0x7F)
    if (code <= 0x40) return false;
    if (code >= 0x5b && code <= 0x60) return false;
    if (code >= 0x7b && code <= 0x7f) return false;
    // General punctuation, symbols, etc. (middle dot, bullet, dashes)
    if (code >= 0x2000 && code <= 0x206f) return false; // General Punctuation block
    if (code === 0xb7 || code === 0x2022 || code === 0x2023) return false; // ·, •, ‣
    // Everything else is treated as a letter
    return code > 0x7f || isLatinLetter(code);
}

/**
 * Check if text is predominantly Latin-script characters.
 * Returns true for English, German, French, Spanish, etc.
 * Returns false for Japanese, Korean, Chinese, Arabic, Thai, etc.
 *
 * Only considers "letter" characters (ignores spaces, digits, basic punctuation).
 * If ≥70% of letters are Latin, the text is considered "mostly Latin" and
 * does not need translation.
 */
export function isMostlyLatin(text: string): boolean {
    let latinCount = 0;
    let letterCount = 0;

    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (isLetter(code)) {
            letterCount++;
            if (isLatinLetter(code)) {
                latinCount++;
            }
        }
    }

    // No letters at all (e.g., pure punctuation/digits) — skip translation
    if (letterCount === 0) return true;

    return latinCount / letterCount >= 0.7;
}

// ─── DISPLAY HELPERS ───────────────────────────────────────────────────────

export const getPrimaryText = (t: CachedTranslation, pref: PrimaryDisplay): string =>
    pref === 'romanization' ? t.romanizedText : t.translatedText;

export const getSecondaryText = (t: CachedTranslation, pref: PrimaryDisplay): string =>
    pref === 'romanization' ? t.translatedText : t.romanizedText;

// ─── COMPOUND TEXT PARSING ─────────────────────────────────────────────────

/** Segment types for compound text */
export type SegmentType = 'delimiter' | 'ascii' | 'translatable';

export interface TextSegment {
    text: string;
    type: SegmentType;
}

export interface ParsedCompoundText {
    segments: TextSegment[];
    hasTranslatable: boolean; // Quick check if any translation needed
}

const DELIMITERS = {
    bullet: /(\s*[•·]\s*)/,
    comma: /(\s*,\s*)/,
};

/**
 * Parse compound text and classify each segment as translatable or not.
 *
 * Example: "日本語プレイリスト • Spotify"
 * Returns:
 *   segments: [
 *     { text: '日本語プレイリスト', type: 'translatable' },
 *     { text: ' • ', type: 'delimiter' },
 *     { text: 'Spotify', type: 'ascii' },
 *   ]
 *
 * Only 'translatable' segments should be sent to the backend.
 * Delimiters and Latin-script segments are preserved as-is.
 */
export function parseCompoundText(
    text: string,
    delimiterType?: 'bullet' | 'comma'
): ParsedCompoundText {
    // If no delimiter type, treat whole text as single segment
    if (!delimiterType) {
        const mostlyLatin = isMostlyLatin(text);
        return {
            segments: [
                {
                    text,
                    type: mostlyLatin ? 'ascii' : 'translatable',
                },
            ],
            hasTranslatable: !mostlyLatin,
        };
    }

    const regex = DELIMITERS[delimiterType];
    const parts = text.split(regex).filter(Boolean);

    const segments: TextSegment[] = parts.map((part): TextSegment => {
        // Check if this part is a delimiter
        if (regex.test(part)) {
            return { text: part, type: 'delimiter' };
        }

        // Check if content is mostly Latin script
        if (isMostlyLatin(part.trim())) {
            return { text: part, type: 'ascii' };
        }

        return {
            text: part,
            type: 'translatable',
        };
    });

    return {
        segments,
        hasTranslatable: segments.some((s) => s.type === 'translatable'),
    };
}

/**
 * Reconstruct text from segments, replacing translatable segments with translations.
 *
 * @param parsed - The parsed compound text
 * @param getTranslation - Function to get translation for a segment's original text
 * @returns Reconstructed string with translations applied
 */
export function reconstructText(
    parsed: ParsedCompoundText,
    getTranslation: (originalText: string) => string | null
): string {
    return parsed.segments
        .map((segment) => {
            if (segment.type === 'translatable') {
                // Use translation if available, otherwise keep original
                return getTranslation(segment.text.trim()) ?? segment.text;
            }
            // Delimiters and ASCII segments stay as-is
            return segment.text;
        })
        .join('');
}

/**
 * Extract only translatable segments from parsed text.
 * These are the ones that should be sent to the backend.
 * Filters out:
 * - Empty or whitespace-only segments
 * - Very short segments (1 char)
 * - Delimiter-only segments (•, ·, , etc.)
 */
export function getTranslatableSegments(parsed: ParsedCompoundText): TextSegment[] {
    // Common delimiters that might slip through language detection as "non-ASCII"
    const DELIMITER_CHARS = /^[\s•·,\-–—:;|/\\]+$/;

    return parsed.segments.filter((s) => {
        if (s.type !== 'translatable') return false;

        const trimmed = s.text.trim();

        // Skip empty, whitespace-only, or single character segments
        if (!trimmed || trimmed.length <= 1) return false;

        // Skip segments that are only delimiters/punctuation
        if (DELIMITER_CHARS.test(trimmed)) return false;

        return true;
    });
}
