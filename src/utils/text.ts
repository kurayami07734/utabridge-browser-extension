import type { CachedTranslation, PrimaryDisplay } from '@/utils/types';

// ─── CHROME API TYPES ──────────────────────────────────────────────────────

interface LanguageDetectionResult {
    languages: Array<{
        language: string;
        percentage: number;
    }>;
}

declare const chrome: {
    i18n: {
        detectLanguage: (text: string, callback: (result: LanguageDetectionResult) => void) => void;
    };
};

// ─── LANGUAGE DETECTION ────────────────────────────────────────────────────

export interface DetectedText {
    text: string;
    language: string | null; // Language code from Chrome's detector (e.g., 'ja', 'ko', 'zh', 'fr')
    needsTranslation: boolean;
}

/**
 * Quick check if text is ASCII-only (no translation needed).
 * ASCII characters are in the range 0-127.
 */
export function isAsciiOnly(text: string): boolean {
    for (let i = 0; i < text.length; i++) {
        if (text.charCodeAt(i) > 127) {
            return false;
        }
    }
    return true;
}

/**
 * Detect language of text using browser's built-in detector.
 * Returns the detected language code (or null for ASCII-only text).
 *
 * Uses chrome.i18n.detectLanguage() which runs locally (no network).
 * We don't validate language codes - backend uses Google Cloud Translate
 * which supports 100+ languages. If translation fails, we skip replacement.
 */
export async function detectLanguage(text: string): Promise<DetectedText> {
    // Fast path: ASCII-only text doesn't need translation
    if (isAsciiOnly(text)) {
        return { text, language: null, needsTranslation: false };
    }

    // Use Chrome's built-in language detector
    return new Promise((resolve) => {
        chrome.i18n.detectLanguage(text, (result) => {
            const topLang = result.languages[0];

            if (topLang && topLang.percentage > 50) {
                // Send whatever language Chrome detected - backend handles validation
                resolve({
                    text,
                    language: topLang.language,
                    needsTranslation: true,
                });
            } else {
                // Low confidence or no detection - still try if text has non-ASCII
                resolve({ text, language: 'und', needsTranslation: true }); // 'und' = undetermined
            }
        });
    });
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
    language?: string; // Only set for 'translatable' segments
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
 * Parse compound text and detect language for each non-ASCII segment.
 *
 * Example: "日本語プレイリスト • Spotify"
 * Returns:
 *   segments: [
 *     { text: '日本語プレイリスト', type: 'translatable', language: 'ja' },
 *     { text: ' • ', type: 'delimiter' },
 *     { text: 'Spotify', type: 'ascii' },
 *   ]
 *
 * Only 'translatable' segments should be sent to the backend.
 * Delimiters and ASCII segments are preserved as-is.
 */
export async function parseCompoundText(
    text: string,
    delimiterType?: 'bullet' | 'comma'
): Promise<ParsedCompoundText> {
    // If no delimiter type, treat whole text as single segment
    if (!delimiterType) {
        const detected = await detectLanguage(text);
        return {
            segments: [
                {
                    text,
                    type: detected.needsTranslation ? 'translatable' : 'ascii',
                    language: detected.language ?? undefined,
                },
            ],
            hasTranslatable: detected.needsTranslation,
        };
    }

    const regex = DELIMITERS[delimiterType];
    const parts = text.split(regex).filter(Boolean);

    // Process each part in parallel
    const segments: TextSegment[] = await Promise.all(
        parts.map(async (part): Promise<TextSegment> => {
            // Check if this part is a delimiter
            if (regex.test(part)) {
                return { text: part, type: 'delimiter' };
            }

            // Detect language for content segments
            const detected = await detectLanguage(part.trim());

            if (!detected.needsTranslation) {
                return { text: part, type: 'ascii' };
            }

            return {
                text: part,
                type: 'translatable',
                language: detected.language ?? undefined,
            };
        })
    );

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
