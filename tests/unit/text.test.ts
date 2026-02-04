import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    isAsciiOnly,
    detectLanguage,
    parseCompoundText,
    reconstructText,
    getTranslatableSegments,
} from '../../src/utils/text';

// Mock chrome.i18n.detectLanguage for unit tests
const mockDetectLanguage = vi.fn();
vi.stubGlobal('chrome', {
    i18n: {
        detectLanguage: mockDetectLanguage,
    },
});

describe('text utilities', () => {
    beforeEach(() => {
        mockDetectLanguage.mockReset();
    });

    // ─── ASCII Detection ─────────────────────────────────────────────────────

    describe('isAsciiOnly', () => {
        it('returns true for ASCII text', () => {
            expect(isAsciiOnly('Hello World')).toBe(true);
            expect(isAsciiOnly('123 ABC xyz')).toBe(true);
            expect(isAsciiOnly('')).toBe(true);
        });

        it('returns false for non-ASCII text', () => {
            expect(isAsciiOnly('こんにちは')).toBe(false);
            expect(isAsciiOnly('Hello 世界')).toBe(false);
            expect(isAsciiOnly('안녕하세요')).toBe(false);
            expect(isAsciiOnly('Playlist • Artist')).toBe(false); // • is not ASCII
        });
    });

    // ─── Async Language Detection ────────────────────────────────────────────

    describe('detectLanguage', () => {
        it('skips ASCII-only text', async () => {
            const result = await detectLanguage('Hello World');
            expect(result).toEqual({
                text: 'Hello World',
                language: null,
                needsTranslation: false,
            });
            expect(mockDetectLanguage).not.toHaveBeenCalled();
        });

        it('detects Japanese text', async () => {
            mockDetectLanguage.mockImplementation((_, cb) => {
                cb({ languages: [{ language: 'ja', percentage: 95 }] });
            });

            const result = await detectLanguage('大原ゆい子');
            expect(result).toEqual({
                text: '大原ゆい子',
                language: 'ja',
                needsTranslation: true,
            });
        });

        it('sends any detected language to backend', async () => {
            // Use French text with non-ASCII character so it passes the ASCII check
            mockDetectLanguage.mockImplementation((_, cb) => {
                cb({ languages: [{ language: 'fr', percentage: 90 }] });
            });

            const result = await detectLanguage('Café résumé');
            expect(result.language).toBe('fr');
            expect(result.needsTranslation).toBe(true);
        });

        it('uses "und" for low confidence detection', async () => {
            mockDetectLanguage.mockImplementation((_, cb) => {
                cb({ languages: [{ language: 'unknown', percentage: 30 }] });
            });

            const result = await detectLanguage('Some mixed テキスト');
            expect(result.language).toBe('und'); // undetermined
            expect(result.needsTranslation).toBe(true);
        });
    });

    // ─── Compound Text Parsing ───────────────────────────────────────────────

    describe('parseCompoundText', () => {
        beforeEach(() => {
            // Setup language detection mocks for different text types
            mockDetectLanguage.mockImplementation((text, cb) => {
                // Japanese text detection
                if (/[\u3040-\u30ff\u4e00-\u9faf]/.test(text)) {
                    cb({ languages: [{ language: 'ja', percentage: 95 }] });
                } else if (/[\uac00-\ud7af]/.test(text)) {
                    // Korean
                    cb({ languages: [{ language: 'ko', percentage: 95 }] });
                } else {
                    // Default - not called for ASCII text due to fast path
                    cb({ languages: [] });
                }
            });
        });

        it('parses bullet-separated text with mixed content', async () => {
            const result = await parseCompoundText('日本語プレイリスト • Spotify', 'bullet');

            expect(result.hasTranslatable).toBe(true);
            expect(result.segments).toHaveLength(3);
            expect(result.segments[0]).toEqual({
                text: '日本語プレイリスト',
                type: 'translatable',
                language: 'ja',
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

        it('marks all-ASCII compound text correctly', async () => {
            const result = await parseCompoundText('Playlist • Spotify', 'bullet');

            expect(result.hasTranslatable).toBe(false);
            expect(result.segments.every((s) => s.type !== 'translatable')).toBe(true);
        });

        it('parses comma-separated artists', async () => {
            const result = await parseCompoundText('Artist1, 大原ゆい子, Artist2', 'comma');

            expect(result.segments).toHaveLength(5); // 3 artists + 2 commas
            expect(result.segments.filter((s) => s.type === 'translatable')).toHaveLength(1);
            expect(result.segments.filter((s) => s.type === 'ascii')).toHaveLength(2);
            expect(result.segments.filter((s) => s.type === 'delimiter')).toHaveLength(2);
        });

        it('handles single text without delimiter type', async () => {
            const result = await parseCompoundText('大原ゆい子');

            expect(result.segments).toHaveLength(1);
            expect(result.segments[0].type).toBe('translatable');
            expect(result.segments[0].language).toBe('ja');
        });
    });

    describe('reconstructText', () => {
        beforeEach(() => {
            mockDetectLanguage.mockImplementation((text, cb) => {
                if (/[\u3040-\u30ff\u4e00-\u9faf]/.test(text)) {
                    cb({ languages: [{ language: 'ja', percentage: 95 }] });
                } else {
                    cb({ languages: [] });
                }
            });
        });

        it('replaces translatable segments with translations', async () => {
            const parsed = await parseCompoundText('日本語 • Spotify', 'bullet');

            // Mock translation lookup
            const getTranslation = (original: string) => {
                if (original === '日本語') return 'Japanese';
                return null;
            };

            const result = reconstructText(parsed, getTranslation);
            expect(result).toBe('Japanese • Spotify');
        });

        it('keeps original if translation not available', async () => {
            const parsed = await parseCompoundText('日本語 • Spotify', 'bullet');

            // No translations available
            const result = reconstructText(parsed, () => null);
            expect(result).toBe('日本語 • Spotify');
        });

        it('handles multiple translatable segments', async () => {
            const parsed = await parseCompoundText('アーティスト1, アーティスト2', 'comma');

            const translations = new Map([
                ['アーティスト1', 'Artist 1'],
                ['アーティスト2', 'Artist 2'],
            ]);

            const result = reconstructText(parsed, (t) => translations.get(t) ?? null);
            expect(result).toBe('Artist 1, Artist 2');
        });
    });

    describe('getTranslatableSegments', () => {
        beforeEach(() => {
            mockDetectLanguage.mockImplementation((text, cb) => {
                if (/[\u3040-\u30ff\u4e00-\u9faf]/.test(text)) {
                    cb({ languages: [{ language: 'ja', percentage: 95 }] });
                } else if (/[\uac00-\ud7af]/.test(text)) {
                    cb({ languages: [{ language: 'ko', percentage: 95 }] });
                } else {
                    cb({ languages: [] });
                }
            });
        });

        it('extracts only translatable segments', async () => {
            const parsed = await parseCompoundText('日本語 • Spotify • 한국어', 'bullet');
            const translatable = getTranslatableSegments(parsed);

            expect(translatable).toHaveLength(2);
            expect(translatable.every((s) => s.type === 'translatable')).toBe(true);
        });

        it('filters out delimiter-only segments', async () => {
            // Simulate a case where delimiter chars might slip through as "translatable"
            const parsed = {
                segments: [
                    { text: '日本語', type: 'translatable' as const, language: 'ja' },
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
