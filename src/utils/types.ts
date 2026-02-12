export interface TranslationRequest {
    type: 'REQUEST_TRANSLATION';
    text: string;
}

export type ExtensionMessage = TranslationRequest;

// API response from /api/translate
export interface TranslateResponse {
    translatedText: string;
    romanizedText: string;
}

// Cached translation data stored in browser.storage
export interface CachedTranslation {
    translatedText: string;
    romanizedText: string;
    error?: string; // Present when the translation request failed
}

// User preference for primary display
export type PrimaryDisplay = 'romanization' | 'translation';
