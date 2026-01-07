import type { TranslateResponse } from '../entrypoints/utils/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Fetches translation and romanization from the API
 * @param text - The text to translate
 * @param from - Source language (default: 'ja')
 * @param to - Target language (default: 'en')
 * @returns TranslateResponse with translatedText and romanizedText
 */
export const fetchTranslation = async (
    text: string,
    from: string = 'ja',
    to: string = 'en'
): Promise<TranslateResponse> => {
    const url = new URL('/api/translate', API_BASE_URL);
    url.searchParams.set('text', text);
    url.searchParams.set('from', from);
    url.searchParams.set('to', to);

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
    }

    const data: TranslateResponse = await response.json();
    return data;
};

/**
 * Checks if the API is healthy
 * @returns true if API is healthy
 */
export const checkApiHealth = async (): Promise<boolean> => {
    try {
        const url = new URL('/api/health', API_BASE_URL);
        const response = await fetch(url.toString());

        if (!response.ok) return false;

        const data = await response.json();
        return data.health === 'ok' || data.health === 'UP';
    } catch {
        return false;
    }
};
