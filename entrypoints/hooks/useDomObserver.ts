import { useEffect, useState } from 'react';
import { Strategies, ElementStrategy, UB_PROCESSED_ATTR } from '../../strategies';

export interface DiscoveredTarget {
    id: string;
    originalElement: HTMLElement;
    mountNode: HTMLElement;
    strategy: ElementStrategy;
}

export const useDomObserver = (enabled: boolean) => {
    const [targets, setTargets] = useState<DiscoveredTarget[]>([]);

    useEffect(() => {
        if (!enabled) {
            setTargets([]);
            // Cleanup attributes so we can re-discover them if re-enabled
            document.querySelectorAll('[data-ub-react-active]').forEach(el => {
                el.removeAttribute('data-ub-react-active');
                el.removeAttribute(UB_PROCESSED_ATTR);
            });
            return;
        }

        const scanStrategies = () => {
            const newTargets: DiscoveredTarget[] = [];

            Strategies.forEach(strategy => {
                const elements = document.querySelectorAll(strategy.targetSelector);
                elements.forEach(el => {
                    const element = el as HTMLElement;
                    if (element.getAttribute('data-ub-react-active')) return;

                    // Attempt to mount
                    const mountNode = strategy.mount(element);
                    if (mountNode) {
                        const uniqueId = `ub-${Math.random().toString(36).substr(2, 9)}`;
                        element.setAttribute('data-ub-react-active', uniqueId);
                        newTargets.push({
                            id: uniqueId,
                            originalElement: element,
                            mountNode,
                            strategy
                        });
                    }
                });
            });

            if (newTargets.length > 0) setTargets(prev => [...prev, ...newTargets]);
        };

        const observer = new MutationObserver((mutations) => {
            // Check for added nodes or any relevant change
            // We can optimize if needed, but simple scan is usually fast enough for limited strategies
            scanStrategies();
        });

        // Initial scan
        scanStrategies();

        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [enabled]);

    return targets;
};
