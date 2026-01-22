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
    /** Callback when dismiss button is clicked */
    onDismiss?: () => void;
    /** Content to display in the tooltip */
    children: React.ReactNode;
}

export const Tooltip: React.FC<Props> = ({
    isVisible,
    position,
    placement = 'top',
    onDismiss,
    children,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    if (!isVisible) return null;

    const isBottom = placement === 'bottom';

    const baseClasses =
        'fixed bg-[#282828] text-white text-[13px] font-medium rounded opacity-100 z-[9999] shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform -translate-x-1/2';

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
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {onDismiss && isHovered && (
                <button
                    onClick={onDismiss}
                    className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-zinc-600 hover:bg-zinc-500 transition-colors cursor-pointer z-10"
                    aria-label="Close tooltip"
                >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                            d="M1 1L9 9M9 1L1 9"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            )}
            {children}
        </div>,
        document.body
    );
};
