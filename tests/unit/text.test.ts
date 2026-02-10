import { describe, it, expect } from 'vitest';
import {
    isMostlyLatin,
    parseCompoundText,
    reconstructText,
    getTranslatableSegments,
} from '../../src/utils/text';

describe('text utilities', () => {
    // ─── Script Detection ────────────────────────────────────────────────────

    describe('isMostlyLatin', () => {
        it('returns true for plain English text', () => {
            expect(isMostlyLatin('Hello World')).toBe(true);
            expect(isMostlyLatin('123 ABC xyz')).toBe(true);
            expect(isMostlyLatin('Spotify')).toBe(true);
        });

        it('returns true for empty or punctuation-only text', () => {
            expect(isMostlyLatin('')).toBe(true);
            expect(isMostlyLatin('123')).toBe(true);
            expect(isMostlyLatin('---')).toBe(true);
        });

        it('returns true for German text (Latin + diacritics)', () => {
            expect(isMostlyLatin('Ärger über Brücke')).toBe(true);
            expect(isMostlyLatin('Straße')).toBe(true);
        });

        it('returns true for French text (Latin + accents)', () => {
            expect(isMostlyLatin('Café résumé')).toBe(true);
            expect(isMostlyLatin('Château élégant')).toBe(true);
        });

        it('returns true for Spanish text (Latin + tildes)', () => {
            expect(isMostlyLatin('Niño español')).toBe(true);
        });

        it('returns false for Japanese text', () => {
            expect(isMostlyLatin('こんにちは')).toBe(false);
            expect(isMostlyLatin('大原ゆい子')).toBe(false);
        });

        it('returns false for Korean text', () => {
            expect(isMostlyLatin('안녕하세요')).toBe(false);
        });

        it('returns false for Chinese text', () => {
            expect(isMostlyLatin('你好世界')).toBe(false);
        });

        it('returns false for mixed text with majority non-Latin', () => {
            expect(isMostlyLatin('Hello 世界大学')).toBe(false); // 5 Latin, 4 CJK → ~55% Latin < 70%
        });

        it('returns true for mixed text with majority Latin', () => {
            expect(isMostlyLatin('Hello World 日')).toBe(true); // 10 Latin, 1 CJK → ~91% Latin
        });

        it('returns false for Arabic text', () => {
            expect(isMostlyLatin('مرحبا بالعالم')).toBe(false);
        });
    });

    // ─── Compound Text Parsing ───────────────────────────────────────────────

    describe('parseCompoundText', () => {
        it('parses bullet-separated text with mixed content', () => {
            const result = parseCompoundText('日本語プレイリスト • Spotify', 'bullet');

            expect(result.hasTranslatable).toBe(true);
            expect(result.segments).toHaveLength(3);
            expect(result.segments[0]).toEqual({
                text: '日本語プレイリスト',
                type: 'translatable',
            });
            expect(result.segments[1]).toEqual({
                text: ' • ',
                type: 'delimiter',
            });
            expect(result.segments[2]).toEqual({
                text: 'Spotify',
                type: 'ascii',
            });
        });

        it('marks all-ASCII compound text correctly', () => {
            const result = parseCompoundText('Playlist • Spotify', 'bullet');

            expect(result.hasTranslatable).toBe(false);
            expect(result.segments.every((s) => s.type !== 'translatable')).toBe(true);
        });

        it('marks French text as non-translatable (Latin script)', () => {
            const result = parseCompoundText('Café résumé • Spotify', 'bullet');

            expect(result.hasTranslatable).toBe(false);
            expect(result.segments[0].type).toBe('ascii'); // French text treated as Latin
        });

        it('marks German text as non-translatable (Latin script)', () => {
            const result = parseCompoundText('Ärger über • Spotify', 'bullet');

            expect(result.hasTranslatable).toBe(false);
            expect(result.segments[0].type).toBe('ascii'); // German text treated as Latin
        });

        it('parses comma-separated artists', () => {
            const result = parseCompoundText('Artist1, 大原ゆい子, Artist2', 'comma');

            expect(result.segments).toHaveLength(5); // 3 artists + 2 commas
            expect(result.segments.filter((s) => s.type === 'translatable')).toHaveLength(1);
            expect(result.segments.filter((s) => s.type === 'ascii')).toHaveLength(2);
            expect(result.segments.filter((s) => s.type === 'delimiter')).toHaveLength(2);
        });

        it('handles single text without delimiter type', () => {
            const result = parseCompoundText('大原ゆい子');

            expect(result.segments).toHaveLength(1);
            expect(result.segments[0].type).toBe('translatable');
        });

        it('handles single Latin text without delimiter type', () => {
            const result = parseCompoundText('Hello World');

            expect(result.segments).toHaveLength(1);
            expect(result.segments[0].type).toBe('ascii');
            expect(result.hasTranslatable).toBe(false);
        });
    });

    describe('reconstructText', () => {
        it('replaces translatable segments with translations', () => {
            const parsed = parseCompoundText('日本語 • Spotify', 'bullet');

            // Mock translation lookup
            const getTranslation = (original: string) => {
                if (original === '日本語') return 'Japanese';
                return null;
            };

            const result = reconstructText(parsed, getTranslation);
            expect(result).toBe('Japanese • Spotify');
        });

        it('keeps original if translation not available', () => {
            const parsed = parseCompoundText('日本語 • Spotify', 'bullet');

            // No translations available
            const result = reconstructText(parsed, () => null);
            expect(result).toBe('日本語 • Spotify');
        });

        it('handles multiple translatable segments', () => {
            const parsed = parseCompoundText('アーティスト1, アーティスト2', 'comma');

            const translations = new Map([
                ['アーティスト1', 'Artist 1'],
                ['アーティスト2', 'Artist 2'],
            ]);

            const result = reconstructText(parsed, (t) => translations.get(t) ?? null);
            expect(result).toBe('Artist 1, Artist 2');
        });
    });

    describe('getTranslatableSegments', () => {
        it('extracts only translatable segments', () => {
            const parsed = parseCompoundText('日本語 • Spotify • 한국어', 'bullet');
            const translatable = getTranslatableSegments(parsed);

            expect(translatable).toHaveLength(2);
            expect(translatable.every((s) => s.type === 'translatable')).toBe(true);
        });

        it('filters out delimiter-only segments', () => {
            // Simulate a case where delimiter chars might slip through as "translatable"
            const parsed = {
                segments: [
                    { text: '日本語', type: 'translatable' as const },
                    { text: ' • ', type: 'delimiter' as const },
                    { text: '•', type: 'translatable' as const }, // Single delimiter char marked as translatable
                    { text: '  --  ', type: 'translatable' as const }, // Dashes only
                    { text: '', type: 'translatable' as const }, // Empty
                    { text: 'A', type: 'translatable' as const }, // Single char
                ],
                hasTranslatable: true,
            };
            const translatable = getTranslatableSegments(parsed);

            // Should only return the actual Japanese text
            expect(translatable).toHaveLength(1);
            expect(translatable[0].text).toBe('日本語');
        });
    });
});
