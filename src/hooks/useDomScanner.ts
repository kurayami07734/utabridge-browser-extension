import { useEffect, useState, useCallback } from 'react';
import { TARGETS, PROCESSED_ATTR, isSpotify, type TextTarget } from '@/config/spotify';

export interface Target {
    uid: string;
    el: HTMLElement;
    target: TextTarget;
}

export interface DomScannerResult {
    targets: Target[];
    reset: () => void;
}

/**
 * Scans DOM for elements matching TARGETS.
 * Marks processed elements to avoid duplicates.
 * Also observes document.head for title changes.
 *
 * Returns targets and a reset function to clear all targets
 * (used when extension is disabled to trigger cleanup).
 */
export function useDomScanner(enabled: boolean): DomScannerResult {
    const [targets, setTargets] = useState<Target[]>([]);

    // Reset function to clear all targets and remove processed markers
    const reset = useCallback(() => {
        setTargets((prev) => {
            // Remove the processed attribute so elements can be re-scanned if re-enabled
            prev.forEach((t) => t.el.removeAttribute(PROCESSED_ATTR));
            return [];
        });
    }, []);

    useEffect(() => {
        if (!enabled || !isSpotify()) return;

        const scan = () => {
            const found: Target[] = [];
            for (const target of TARGETS) {
                document.querySelectorAll<HTMLElement>(target.selector).forEach((el) => {
                    if (!el.hasAttribute(PROCESSED_ATTR)) {
                        el.setAttribute(PROCESSED_ATTR, '1');
                        found.push({ uid: crypto.randomUUID(), el, target });
                    }
                });
            }
            if (found.length) setTargets((prev) => [...prev, ...found]);
        };

        scan();

        // Observe body for DOM changes
        const bodyObserver = new MutationObserver(scan);
        bodyObserver.observe(document.body, { childList: true, subtree: true });

        // Observe head for title changes
        // The title element's text is a child text node, so we need characterData
        const headObserver = new MutationObserver((mutations) => {
            let needsRescan = false;

            for (const mutation of mutations) {
                // Handle title child nodes changing (Spotify replaces the text node)
                if (mutation.type === 'childList') {
                    const target = mutation.target;
                    if (target instanceof HTMLElement && target.tagName === 'TITLE') {
                        target.removeAttribute(PROCESSED_ATTR);
                        needsRescan = true;
                    }
                }
                // Handle text content changes within title
                else if (mutation.type === 'characterData') {
                    const parent = mutation.target.parentElement;
                    if (parent?.tagName === 'TITLE') {
                        parent.removeAttribute(PROCESSED_ATTR);
                        needsRescan = true;
                    }
                }
            }

            if (needsRescan) scan();
        });
        headObserver.observe(document.head, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        return () => {
            bodyObserver.disconnect();
            headObserver.disconnect();
        };
    }, [enabled]);

    return { targets, reset };
}
