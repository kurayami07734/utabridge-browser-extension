import type { CachedTranslation, PrimaryDisplay } from '@/utils/types';

/**
 * Regex pattern for Japanese text (Hiragana, Katakana, Kanji, etc.)
 */
const NON_ASCII_PATTERN = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;

/**
 * Checks if the given text contains Japanese characters.
 */
export function hasJapaneseText(text: string): boolean {
    return NON_ASCII_PATTERN.test(text);
}

/**
 * Gets the primary display text based on user preference.
 */
export function getPrimaryText(
    translation: CachedTranslation,
    displayPref: PrimaryDisplay
): string {
    return displayPref === 'romanization' ? translation.romanizedText : translation.translatedText;
}

/**
 * Gets the secondary display text (for tooltip) based on user preference.
 */
export function getSecondaryText(
    translation: CachedTranslation,
    displayPref: PrimaryDisplay
): string {
    return displayPref === 'romanization' ? translation.translatedText : translation.romanizedText;
}
