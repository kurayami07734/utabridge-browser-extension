import { useEffect, useState, useCallback } from 'react';
import { TranslationService } from '@/services/TranslationService';
import type { CachedTranslation } from '@/utils/types';

interface UseTranslationResult {
    translation: CachedTranslation | null;
    isLoading: boolean;
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

    const reset = useCallback(() => {
        setTranslation(null);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!enabled) {
            reset();
            return;
        }

        const unsubscribe = TranslationService.observe(text, (result) => {
            if (result) {
                setTranslation(result);
                setIsLoading(false);
            } else {
                setTranslation(null);
                setIsLoading(true);
            }
        });

        return unsubscribe;
    }, [text, enabled, reset]);

    return { translation, isLoading, reset };
}
