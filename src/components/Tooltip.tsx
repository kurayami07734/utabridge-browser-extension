import React from 'react';
import { createPortal } from 'react-dom';
import type { TooltipPlacement } from '@/core/DOMElement';

interface Position {
    x: number;
    y: number;
}

interface Props {
    /** Whether the tooltip is visible */
    isVisible: boolean;
    /** Position of the tooltip (centered on x, anchored on y) */
    position: Position;
    /** Placement relative to the anchor element */
    placement?: TooltipPlacement;
    /** Content to display in the tooltip */
    children: React.ReactNode;
}

/**
 * A portal-based tooltip that renders at the document body.
 * Styled to match Spotify's native tooltip appearance.
 */
export const Tooltip: React.FC<Props> = ({ isVisible, position, placement = 'top', children }) => {
    if (!isVisible) return null;

    const isBottom = placement === 'bottom';

    const baseClasses =
        'fixed bg-[#282828] text-white text-[13px] font-medium rounded opacity-100 z-[9999] pointer-events-none shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform -translate-x-1/2';

    const placementClasses = isBottom
        ? "mt-2 after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-[6px] after:border-b-[#282828] after:border-x-transparent after:border-t-transparent"
        : "-translate-y-full mb-2 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[6px] after:border-t-[#282828] after:border-x-transparent after:border-b-transparent";

    return createPortal(
        <div
            className={`${baseClasses} ${placementClasses}`}
            style={{
                left: position.x,
                top: position.y,
                padding: '6px',
            }}
        >
            {children}
        </div>,
        document.body
    );
};
