import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TranslationService } from '../../src/services/TranslationService';
import type { CachedTranslation } from '../../src/utils/types';

// Mock the global 'browser' object
const storageMap = new Map<string, unknown>();
const listeners = new Set<(changes: Record<string, unknown>, areaName: string) => void>();

const mockBrowser = {
    storage: {
        local: {
            get: vi.fn((key: string) => {
                return Promise.resolve({ [key]: storageMap.get(key) });
            }),
            set: vi.fn((obj: Record<string, unknown>) => {
                Object.entries(obj).forEach(([k, v]) => storageMap.set(k, v));
                // Trigger listeners
                listeners.forEach((l) =>
                    l({ [Object.keys(obj)[0]]: { newValue: Object.values(obj)[0] } }, 'local')
                );
                return Promise.resolve();
            }),
        },
        onChanged: {
            addListener: vi.fn((l: (changes: Record<string, unknown>, areaName: string) => void) =>
                listeners.add(l)
            ),
            removeListener: vi.fn(
                (l: (changes: Record<string, unknown>, areaName: string) => void) =>
                    listeners.delete(l)
            ),
        },
    },
    runtime: {
        sendMessage: vi.fn().mockResolvedValue(undefined),
    },
};

// Assign to global
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).browser = mockBrowser;

// Helper to create a CachedTranslation object
function createTranslation(romanized: string, translated: string): CachedTranslation {
    return {
        romanizedText: romanized,
        translatedText: translated,
    };
}

describe('TranslationService', () => {
    beforeEach(() => {
        storageMap.clear();
        listeners.clear();
        vi.clearAllMocks();
    });

    describe('get', () => {
        it('should return null for missing cache', async () => {
            const result = await TranslationService.get('Song Title');
            expect(result).toBeNull();
        });

        it('should return CachedTranslation object for existing cache', async () => {
            const cachedValue = createTranslation('Romaji Title', 'Translated Title');
            storageMap.set('translation_Song Title', cachedValue);

            const result = await TranslationService.get('Song Title');

            expect(result).toEqual(cachedValue);
            expect(result?.romanizedText).toBe('Romaji Title');
            expect(result?.translatedText).toBe('Translated Title');
        });
    });

    describe('set', () => {
        it('should store CachedTranslation object in cache', async () => {
            const translation = createTranslation('Romaji New', 'Translated New');

            await TranslationService.set('New Song', translation);

            expect(storageMap.get('translation_New Song')).toEqual(translation);
        });
    });

    describe('observe', () => {
        it('should return cached CachedTranslation immediately if available', () => {
            const cachedValue = createTranslation('Cached Romaji', 'Cached Translation');
            storageMap.set('translation_Cached Song', cachedValue);
            const callback = vi.fn();

            TranslationService.observe('Cached Song', 'ja', callback);

            // Since get is async, we need to wait briefly or just expect it to be called eventually
            // In the implementation, observe calls get().then().
            // use vi.waitFor to wait for the callback
            return vi.waitFor(() => {
                expect(callback).toHaveBeenCalledWith(cachedValue);
                expect(mockBrowser.runtime.sendMessage).not.toHaveBeenCalled();
            });
        });

        it('should trigger API request and return null first if missing', async () => {
            const callback = vi.fn();
            TranslationService.observe('Unknown Song', 'ja', callback);

            await vi.waitFor(() => {
                expect(callback).toHaveBeenCalledWith(null);
            });

            expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
                type: 'REQUEST_TRANSLATION',
                text: 'Unknown Song',
                sourceLanguage: 'ja',
            });
        });

        it('should notify listener when storage updates with CachedTranslation', async () => {
            const callback = vi.fn();
            TranslationService.observe('Future Song', 'ja', callback);

            await vi.waitFor(() => {
                expect(callback).toHaveBeenCalledWith(null);
            });

            // Simulate Background script updating storage with a CachedTranslation object
            const futureTranslation = createTranslation('Future Romaji', 'Future Translation');
            await mockBrowser.storage.local.set({
                'translation_Future Song': futureTranslation,
            });

            await vi.waitFor(() => {
                expect(callback).toHaveBeenCalledWith(futureTranslation);
            });
        });
    });
});
