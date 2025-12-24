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

export const useDomObserver = () => {
    const [targets, setTargets] = useState<DiscoveredTarget[]>([]);

    useEffect(() => {
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

        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, []);

    return targets;
};
