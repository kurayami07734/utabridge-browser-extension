import { useLayoutEffect, useRef } from 'react';
import type { PrimaryDisplay } from '@/utils/types';
import { getPrimaryText, type ParsedCompoundText, reconstructText } from '@/utils/text';

interface Props {
    el: HTMLElement;
    parsed: ParsedCompoundText | null;
    translations: Map<string, { primary: string; secondary: string }>;
    loading: boolean;
    displayPref: PrimaryDisplay;
    enabled: boolean;
}

/**
 * Replaces element text with translations.
 * Handles compound text by reconstructing with translated segments.
 * Tracks original text and restores on unmount.
 */
export function useTextReplace({
    el,
    parsed,
    translations,
    loading,
    displayPref,
    enabled,
}: Props): string {
    const original = useRef(el.textContent ?? '');

    useLayoutEffect(() => {
        if (!enabled) return;

        // Show loading indicator
        if (loading) {
            el.textContent = `⏳ ${original.current}`;
            return;
        }

        // No parsed content yet, keep original
        if (!parsed) return;

        // No translations needed or available yet
        if (!parsed.hasTranslatable || translations.size === 0) {
            return;
        }

        // Reconstruct text with translations
        const newText = reconstructText(parsed, (originalSegment) => {
            const t = translations.get(originalSegment);
            return t?.primary ?? null;
        });

        // Apply if different
        if (el.textContent !== newText) {
            el.textContent = newText;
        }

        // Restore on cleanup
        return () => {
            el.textContent = original.current;
        };
    }, [el, parsed, translations, loading, displayPref, enabled]);

    return original.current;
}
