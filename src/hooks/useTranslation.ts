import { useEffect, useState, useCallback } from 'react';
import { TranslationService } from '@/services/TranslationService';
import type { CachedTranslation } from '@/utils/types';

interface UseTranslationResult {
    translation: CachedTranslation | null;
    isLoading: boolean;
    error: string | null;
    reset: () => void;
}

/**
 * Hook to subscribe to translation updates for the given text.
 * Handles loading state and caching via TranslationService.
 *
 * @param text - The text to translate
 * @param enabled - Whether translation is enabled for this text
 */
export function useTranslation(text: string, enabled: boolean): UseTranslationResult {
    const [translation, setTranslation] = useState<CachedTranslation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reset = useCallback(() => {
        setTranslation(null);
        setIsLoading(false);
        setError(null);
    }, []);

    useEffect(() => {
        if (!enabled) {
            reset();
            return;
        }

        const unsubscribe = TranslationService.observe(text, (result) => {
            if (result) {
                if (result.error) {
                    // Error response — stop loading, don't set translation
                    setTranslation(null);
                    setIsLoading(false);
                    setError(result.error);
                } else {
                    setTranslation(result);
                    setIsLoading(false);
                    setError(null);
                }
            } else {
                setTranslation(null);
                setIsLoading(true);
                setError(null);
            }
        });

        return unsubscribe;
    }, [text, enabled, reset]);

    return { translation, isLoading, error, reset };
}
