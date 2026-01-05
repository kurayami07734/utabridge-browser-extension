import { ExtensionMessage } from '../entrypoints/utils/types';

export class TranslationService {
    private static getCacheKey(text: string): string {
        return `translation_${text}`;
    }

    static async get(text: string): Promise<string | null> {
        try {
            const key = this.getCacheKey(text);
            const stored = await browser.storage.local.get(key);
            return (stored[key] as string) || null;
        } catch (e) {
            console.error('[TranslationService] Error getting from cache', e);
            return null;
        }
    }

    static async set(text: string, translation: string): Promise<void> {
        try {
            const key = this.getCacheKey(text);
            await browser.storage.local.set({ [key]: translation });
        } catch (e) {
            console.error('[TranslationService] Error setting cache', e);
        }
    }

    private static async requestApi(text: string): Promise<void> {
        try {
            await browser.runtime.sendMessage({
                type: 'REQUEST_TRANSLATION',
                text: text,
            } as ExtensionMessage);
        } catch (e) {
            console.error('[TranslationService] Failed to send translation request', e);
        }
    }

    static observe(text: string, onUpdate: (translation: string | null) => void): () => void {
        const key = this.getCacheKey(text);
        let active = true;

        // Listener for storage changes
        const listener = (changes: Record<string, { newValue?: unknown }>, areaName: string) => {
            if (areaName === 'local' && changes[key]) {
                if (active) {
                    onUpdate(changes[key].newValue as string);
                }
            }
        };

        // 1. Setup listener
        browser.storage.onChanged.addListener(listener);

        // 2. Check cache initial state
        this.get(text).then((cached) => {
            if (!active) return;

            if (cached) {
                onUpdate(cached);
            } else {
                // 3. If NOT in cache, request it
                onUpdate(null); // Explicitly say "I don't have it yet"
                this.requestApi(text);
            }
        });

        // Cleanup
        return () => {
            active = false;
            browser.storage.onChanged.removeListener(listener);
        };
    }
}
