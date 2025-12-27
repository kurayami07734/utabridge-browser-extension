import { useEffect, useState } from 'react';
import { prepareMountPoint } from '../utils/dom';

const TARGET_SELECTOR = [
    '[data-testid="tracklist-row"] [data-testid="internal-track-link"]',
    '[data-testid="context-item-info-title"]'
].join(',');

export interface DiscoveredTarget {
    id: string;
    originalElement: HTMLElement;
    mountNode: HTMLElement;
}

export const useDomObserver = (enabled: boolean) => {
    const [targets, setTargets] = useState<DiscoveredTarget[]>([]);

    useEffect(() => {
        if (!enabled) {
            setTargets([]);
            // Cleanup attributes so we can re-discover them if re-enabled
            document.querySelectorAll('[data-ub-react-active]').forEach(el => {
                el.removeAttribute('data-ub-react-active');
            });
            return;
        }

        const observer = new MutationObserver((mutations) => {
            // Optimization: Check if nodes were actually added
            if (!mutations.some(m => m.addedNodes.length > 0)) return;

            const elements = document.querySelectorAll(TARGET_SELECTOR);
            const newTargets: DiscoveredTarget[] = [];

            elements.forEach((el) => {
                const element = el as HTMLElement;
                if (element.getAttribute('data-ub-react-active')) return;

                const mountNode = prepareMountPoint(element);
                if (mountNode) {
                    const uniqueId = `ub-${Math.random().toString(36).substr(2, 9)}`;
                    element.setAttribute('data-ub-react-active', uniqueId);
                    newTargets.push({ id: uniqueId, originalElement: element, mountNode });
                }
            });

            if (newTargets.length > 0) setTargets(p => [...p, ...newTargets]);
        });

        // Initial scan
        const initialElements = document.querySelectorAll(TARGET_SELECTOR);
        if (initialElements.length > 0) {
            // We need to trigger the logic manually or just let observer handle subsequent.
            // But if enabled toggles true, we might miss existing.
            // Re-use logic or just rely on observer? Observer only sees mutations.
            // We MUST do an initial scan.
            const newTargets: DiscoveredTarget[] = [];
            initialElements.forEach((el) => {
                const element = el as HTMLElement;
                if (element.getAttribute('data-ub-react-active')) return;

                const mountNode = prepareMountPoint(element);
                if (mountNode) {
                    const uniqueId = `ub-${Math.random().toString(36).substr(2, 9)}`;
                    element.setAttribute('data-ub-react-active', uniqueId);
                    newTargets.push({ id: uniqueId, originalElement: element, mountNode });
                }
            });
            if (newTargets.length > 0) setTargets(p => [...p, ...newTargets]);
        }

        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [enabled]);

    return targets;
};
