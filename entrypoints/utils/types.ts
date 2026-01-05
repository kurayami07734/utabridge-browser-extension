export interface TranslationRequest {
    type: 'REQUEST_TRANSLATION';
    text: string;
}

export type ExtensionMessage = TranslationRequest;
