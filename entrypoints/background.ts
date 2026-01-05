import { fetchTranslation } from '../services/api';
import { RequestQueue } from '../services/RequestQueue';
import { TranslationService } from '../services/TranslationService';
import { ExtensionMessage } from './utils/types';

export default defineBackground(() => {
  const queue = new RequestQueue(2);
  const pendingRequests = new Set<string>();

  browser.runtime.onMessage.addListener((message: unknown) => {
    const msg = message as ExtensionMessage;
    if (msg && msg.type === 'REQUEST_TRANSLATION' && msg.text) {
      handleTranslationRequest(msg.text);
    }
  });

  async function handleTranslationRequest(text: string) {
    if (pendingRequests.has(text)) return;

    const key = `translation_${text}`;

    const stored = await browser.storage.local.get(key);
    if (stored[key]) return;

    pendingRequests.add(text);

    queue.add(async () => {
      try {
        const result = await fetchTranslation(text);
        await TranslationService.set(text, result);
      } catch (e) {
        console.error('Translation failed for:', text, e);
        // Optionally handle split retry logic or error states here
      } finally {
        pendingRequests.delete(text);
      }
    });
  }
});
