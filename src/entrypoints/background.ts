import { fetchTranslation, checkApiHealth } from '@/services/api';
import { RequestQueue } from '@/services/RequestQueue';
import { TranslationService } from '@/services/TranslationService';
import { apiHealth } from '@/utils/storage';
import { ExtensionMessage } from '@/utils/types';
import { InvalidTokenError, RateLimitError } from '@/utils/errors';

export default defineBackground(() => {
    const queue = new RequestQueue(2);
    const pendingRequests = new Set<string>();

    async function updateHealthStatus() {
        const isHealthy = await checkApiHealth();
        await apiHealth.setValue(isHealthy);
    }

    setInterval(updateHealthStatus, 30000);
    updateHealthStatus();

    browser.runtime.onMessage.addListener((message: unknown) => {
        const msg = message as ExtensionMessage;
        if (msg && msg.type === 'REQUEST_TRANSLATION' && msg.text) {
            handleTranslationRequest(msg.text, msg.sourceLanguage);
        }
    });

    async function handleTranslationRequest(text: string, sourceLanguage: string) {
        const isHealthy = await apiHealth.getValue();
        if (!isHealthy) {
            console.warn('[Background] API unhealthy, skipping translation request');
            return;
        }

        if (pendingRequests.has(text)) return;

        const key = `translation_${text}`;
        const stored = await browser.storage.local.get(key);
        if (stored[key]) return;

        pendingRequests.add(text);

        queue.add(async () => {
            try {
                // Use detected source language instead of hardcoded 'ja'
                const result = await fetchTranslation(text, sourceLanguage, 'en');
                await TranslationService.set(text, {
                    translatedText: result.translatedText,
                    romanizedText: result.romanizedText,
                });
            } catch (e) {
                if (e instanceof InvalidTokenError) {
                    console.warn('[Background] Auth required:', e.message);
                } else if (e instanceof RateLimitError) {
                    console.warn('[Background] Rate limited, will retry later');
                } else {
                    console.error('[Background] Translation failed:', text, e);
                }
            } finally {
                pendingRequests.delete(text);
            }
        });
    }
});
