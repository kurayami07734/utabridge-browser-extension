import { useLayoutEffect } from 'react';
import { DOMElement } from '@/core/DOMElement';
import type { CachedTranslation, PrimaryDisplay } from '@/utils/types';
import { getPrimaryText } from '@/utils/text';

interface UseDOMReplacementParams {
    originalElement: HTMLElement;
    strategy: DOMElement;
    currentText: string;
    translation: CachedTranslation | null;
    isLoading: boolean;
    displayPref: PrimaryDisplay;
    enabled: boolean;
    lastReplacementRef: React.RefObject<string | null>;
}

/**
 * Hook to apply DOM replacement based on translation state.
 * Handles the actual mutation of the DOM element text.
 */
export function useDOMReplacement({
    originalElement,
    strategy,
    currentText,
    translation,
    isLoading,
    displayPref,
    enabled,
    lastReplacementRef,
}: UseDOMReplacementParams): void {
    useLayoutEffect(() => {
        if (!enabled) {
            // Restore original if we previously replaced it
            if (
                lastReplacementRef.current &&
                strategy.getOriginalText(originalElement) === lastReplacementRef.current
            ) {
                strategy.applyReplacement(originalElement, currentText);
                lastReplacementRef.current = null;
            }
            return;
        }

        // Determine what content to display
        let newContent = currentText;
        if (isLoading) {
            newContent = `(Wait...) ${currentText}`;
        } else if (translation) {
            newContent = getPrimaryText(translation, displayPref);
        }

        // Apply replacement only if different from current
        if (strategy.getOriginalText(originalElement) !== newContent) {
            lastReplacementRef.current = newContent;
            strategy.applyReplacement(originalElement, newContent);
        }

        // Cleanup: restore original text when unmounting
        return () => {
            if (strategy.getOriginalText(originalElement) === newContent) {
                strategy.applyReplacement(originalElement, currentText);
            }
        };
    }, [
        currentText,
        translation,
        isLoading,
        enabled,
        originalElement,
        strategy,
        displayPref,
        lastReplacementRef,
    ]);
}
