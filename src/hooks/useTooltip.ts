import { useEffect, useState } from 'react';
import type { TooltipPlacement } from '@/core/DOMElement';

interface Position {
    x: number;
    y: number;
}

interface UseTooltipResult {
    isVisible: boolean;
    position: Position;
    placement: TooltipPlacement;
    setIsVisible: (visible: boolean) => void;
}

/**
 * Hook to manage tooltip visibility and positioning for an element.
 */
export function useTooltip(
    element: HTMLElement,
    enabled: boolean,
    placement: TooltipPlacement = 'top'
): UseTooltipResult {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

    useEffect(() => {
        if (!enabled) {
            setIsVisible(false);
            return;
        }

        const updatePosition = () => {
            const rect = element.getBoundingClientRect();
            setPosition({
                x: rect.left + rect.width / 2,
                y: placement === 'bottom' ? rect.bottom : rect.top,
            });
        };

        const onEnter = () => {
            updatePosition();
            setIsVisible(true);
        };

        const onLeave = () => {
            setIsVisible(false);
        };

        element.addEventListener('mouseenter', onEnter);
        element.addEventListener('mouseleave', onLeave);

        return () => {
            element.removeEventListener('mouseenter', onEnter);
            element.removeEventListener('mouseleave', onLeave);
        };
    }, [element, enabled, placement]);

    return { isVisible, position, placement, setIsVisible };
}
