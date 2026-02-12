import { useLayoutEffect, useRef, useState } from 'react';
import type { PrimaryDisplay } from '@/utils/types';
import { type ParsedCompoundText, reconstructText } from '@/utils/text';

interface Props {
    el: HTMLElement;
    parsed: ParsedCompoundText | null;
    translations: Map<string, { primary: string; secondary: string }>;
    loading: boolean;
    displayPref: PrimaryDisplay;
    enabled: boolean;
}

/**
 * Creates a deep clone of the element with only text nodes updated.
 * All classes, attributes, child elements, and DOM structure are preserved.
 */
function cloneWithNewText(el: HTMLElement, newText: string): HTMLElement {
    const clone = el.cloneNode(true) as HTMLElement;

    // Walk text nodes in the clone and update them
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
    const firstTextNode = walker.nextNode();

    if (firstTextNode) {
        // Put all text in first text node, clear any remaining ones
        firstTextNode.nodeValue = newText;
        let next;
        while ((next = walker.nextNode())) {
            (next as Text).nodeValue = '';
        }
    } else {
        // No text nodes exist — append one
        clone.appendChild(document.createTextNode(newText));
    }

    return clone;
}

/**
 * Replaces element text with translations using a clone-and-replace approach.
 *
 * Instead of mutating the original element (which can destroy child elements
 * and their classes like `standalone-ellipsis-one-line`), this hook:
 * 1. Deep-clones the original element (preserving ALL classes, attributes, structure)
 * 2. Updates only text nodes in the clone
 * 3. Swaps the clone into the DOM in place of the original
 * 4. On cleanup, swaps the original back
 *
 * Returns the element currently in the DOM (clone or original),
 * so callers can attach tooltips etc. to the correct node.
 */
export function useTextReplace({
    el,
    parsed,
    translations,
    loading,
    displayPref,
    enabled,
}: Props): HTMLElement {
    const [activeEl, setActiveEl] = useState<HTMLElement>(el);

    useLayoutEffect(() => {
        if (!enabled) return;

        const isTitle = el.tagName === 'TITLE';

        // Show subtle loading state (skip for title - can't style browser tab)
        if (loading && !isTitle) {
            el.classList.add('ub-loading');
            return () => {
                el.classList.remove('ub-loading');
            };
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

        // Skip if text hasn't actually changed
        if (el.textContent === newText) return;

        // Title element: just set text directly (can't be styled, no truncation concern)
        if (isTitle) {
            el.textContent = newText;
            return;
        }

        // Clone the original element with updated text
        // This preserves all classes, attributes, and child element structure
        const clone = cloneWithNewText(el, newText);

        // Swap clone into the DOM
        el.parentNode?.replaceChild(clone, el);
        setActiveEl(clone);

        return () => {
            // Swap original back in
            if (clone.parentNode) {
                clone.parentNode.replaceChild(el, clone);
            }
            setActiveEl(el);
        };
    }, [el, parsed, translations, loading, displayPref, enabled]);

    return activeEl;
}
