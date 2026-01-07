import { useLayoutEffect, useState, useRef, useCallback } from 'react';
import { DOMElement } from '@/core/DOMElement';

interface UseElementTextResult {
    /** The current text content of the element */
    currentText: string;
    /** Ref to track the last replacement we made (to avoid reacting to our own changes) */
    lastReplacementRef: React.RefObject<string | null>;
    /** Reset the translation state (called when text changes) */
    resetTranslation: () => void;
}

/**
 * Hook to observe DOM text changes on the original element.
 * Detects when the element's text changes (e.g., new song playing).
 */
export function useElementText(
    originalElement: HTMLElement,
    strategy: DOMElement,
    onTextChange?: () => void
): UseElementTextResult {
    const [currentText, setCurrentText] = useState(() => strategy.getOriginalText(originalElement));
    const lastReplacementRef = useRef<string | null>(null);

    const resetTranslation = useCallback(() => {
        onTextChange?.();
    }, [onTextChange]);

    useLayoutEffect(() => {
        const observer = new MutationObserver(() => {
            const newText = strategy.getOriginalText(originalElement);

            // If the text matches what we just wrote, ignore it (it's our change)
            if (newText === lastReplacementRef.current) return;

            // If it's different, it's a new song or a reset. Update state.
            if (newText !== currentText) {
                setCurrentText(newText);
                resetTranslation();
            }
        });

        observer.observe(originalElement, {
            characterData: true,
            subtree: true,
            childList: true,
        });

        return () => observer.disconnect();
    }, [originalElement, currentText, strategy, resetTranslation]);

    return { currentText, lastReplacementRef, resetTranslation };
}
