import { useLayoutEffect, useRef, useEffect } from 'react';
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
 * Checks if element content overflows its container.
 */
function isOverflowing(el: HTMLElement): boolean {
    return el.scrollWidth > el.clientWidth;
}

/**
 * Applies marquee effect to an overflowing element.
 * Returns a cleanup function.
 */
function applyMarquee(el: HTMLElement, text: string): () => void {
    const originalHTML = el.innerHTML;

    // Create marquee structure:
    // <span class="ub-marquee-wrapper">
    //   <span class="ub-marquee-inner ub-animate-marquee">
    //     <span>text</span>
    //     <span style="padding-left: 2em">text</span> (duplicate for seamless loop)
    //   </span>
    // </span>
    el.innerHTML = '';
    const wrapper = document.createElement('span');
    wrapper.className = 'ub-marquee-wrapper';
    wrapper.style.display = 'inline-block';
    wrapper.style.maxWidth = '100%';

    const inner = document.createElement('span');
    inner.className = 'ub-marquee-inner ub-animate-marquee';

    const text1 = document.createElement('span');
    text1.textContent = text;

    const text2 = document.createElement('span');
    text2.textContent = text;
    text2.style.paddingLeft = '2em';

    inner.appendChild(text1);
    inner.appendChild(text2);
    wrapper.appendChild(inner);
    el.appendChild(wrapper);

    return () => {
        el.innerHTML = originalHTML;
    };
}

/**
 * Replaces element text with translations.
 * Handles compound text by reconstructing with translated segments.
 * Tracks original text and restores on unmount.
 * Applies marquee effect if text overflows.
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
    const marqueeCleanup = useRef<(() => void) | null>(null);

    useLayoutEffect(() => {
        if (!enabled) return;

        // Capture ref values at effect start (React hooks lint rule)
        const originalText = original.current;

        // Check if this is the title element (browser tab)
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

        // Apply if different
        if (el.textContent !== newText) {
            el.textContent = newText;
        }

        // Restore on cleanup (skip for title - it changes frequently)
        if (!isTitle) {
            return () => {
                // Clean up marquee if it was applied
                if (marqueeCleanup.current) {
                    marqueeCleanup.current();
                    marqueeCleanup.current = null;
                }
                el.textContent = originalText;
            };
        }
    }, [el, parsed, translations, loading, displayPref, enabled]);

    // Check for overflow after render and apply marquee if needed
    useEffect(() => {
        if (!enabled || !parsed?.hasTranslatable || translations.size === 0) return;
        if (el.tagName === 'TITLE') return; // Skip for title

        // Wait for next frame to ensure layout is complete
        const frame = requestAnimationFrame(() => {
            if (isOverflowing(el) && !marqueeCleanup.current) {
                marqueeCleanup.current = applyMarquee(el, el.textContent ?? '');
            }
        });

        return () => cancelAnimationFrame(frame);
    }, [el, enabled, parsed, translations]);

    return original.current;
}
