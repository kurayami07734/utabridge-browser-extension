import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TranslationService } from '../../services/TranslationService';

// Mock the global 'browser' object
const storageMap = new Map<string, any>();
const listeners = new Set<Function>();

const mockBrowser = {
    storage: {
        local: {
            get: vi.fn((key: string) => {
                return Promise.resolve({ [key]: storageMap.get(key) });
            }),
            set: vi.fn((obj: Record<string, any>) => {
                Object.entries(obj).forEach(([k, v]) => storageMap.set(k, v));
                // Trigger listeners
                listeners.forEach(l => l({ [Object.keys(obj)[0]]: { newValue: Object.values(obj)[0] } }, 'local'));
                return Promise.resolve();
            }),
        },
        onChanged: {
            addListener: vi.fn((l: Function) => listeners.add(l)),
            removeListener: vi.fn((l: Function) => listeners.delete(l)),
        },
    },
    runtime: {
        sendMessage: vi.fn().mockResolvedValue(undefined),
    },
};

// Assign to global
(global as any).browser = mockBrowser;

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

        it('should return value for existing cache', async () => {
            storageMap.set('translation_Song Title', 'Romaji Title');
            const result = await TranslationService.get('Song Title');
            expect(result).toBe('Romaji Title');
        });
    });

    describe('set', () => {
        it('should store value in cache', async () => {
            await TranslationService.set('New Song', 'Romaji New');
            expect(storageMap.get('translation_New Song')).toBe('Romaji New');
        });
    });

    describe('observe', () => {
        it('should return cached value immediately if available', () => {
            storageMap.set('translation_Cached Song', 'Cached Romaji');
            const callback = vi.fn();

            const unsubscribe = TranslationService.observe('Cached Song', callback);

            // Since get is async, we need to wait briefly or just expect it to be called eventually
            // In the implementation, observe calls get().then().
            // use vi.waitFor to wait for the callback
            return vi.waitFor(() => {
                expect(callback).toHaveBeenCalledWith('Cached Romaji');
                expect(mockBrowser.runtime.sendMessage).not.toHaveBeenCalled();
            });
        });

        it('should trigger API request and return null first if missing', async () => {
            const callback = vi.fn();
            TranslationService.observe('Unknown Song', callback);

            await vi.waitFor(() => {
                expect(callback).toHaveBeenCalledWith(null);
            });

            expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
                type: 'REQUEST_TRANSLATION',
                text: 'Unknown Song',
            });
        });

        it('should notify listener when storage updates', async () => {
            const callback = vi.fn();
            TranslationService.observe('Future Song', callback);

            await vi.waitFor(() => {
                expect(callback).toHaveBeenCalledWith(null);
            });

            // Simulate Background script updating storage
            const changes = { 'translation_Future Song': { newValue: 'Future Romaji' } };
            // listeners.forEach(l => l(changes, 'local')); 
            // Instead of manual trigger, let's use the actual set method which triggers our mock listeners
            await mockBrowser.storage.local.set({ 'translation_Future Song': 'Future Romaji' });

            await vi.waitFor(() => {
                expect(callback).toHaveBeenCalledWith('Future Romaji');
            });
        });
    });
});
