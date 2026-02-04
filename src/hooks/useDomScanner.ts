import { useEffect, useState } from 'react';
import { TARGETS, PROCESSED_ATTR, isSpotify, type TextTarget } from '@/config/spotify';

export interface Target {
    uid: string;
    el: HTMLElement;
    target: TextTarget;
}

/**
 * Scans DOM for elements matching TARGETS.
 * Marks processed elements to avoid duplicates.
 */
export function useDomScanner(enabled: boolean): Target[] {
    const [targets, setTargets] = useState<Target[]>([]);

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
        const observer = new MutationObserver(scan);
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [enabled]);

    return targets;
}
