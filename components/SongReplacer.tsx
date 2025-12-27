import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Tooltip } from './Tooltip'; // Wrapper for Floating UI

interface Props {
    mountNode: HTMLElement;
    originalElement: HTMLElement;
}

export const SongReplacer: React.FC<Props> = ({ mountNode, originalElement }) => {
    // We still track the original text to prove we can read it
    // (This is useful for debugging: "Is this row actually 'Idol'?")
    const [currentText, setCurrentText] = useState(originalElement.textContent || '');
    const [isOverflowing, setIsOverflowing] = useState(false);
    const textContainerRef = useRef<HTMLDivElement>(null);

    // Keep the observer to handle Spotify recycling rows (Virtualization)
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const newText = originalElement.textContent || '';
            if (newText !== currentText) setCurrentText(newText);
        });
        observer.observe(originalElement, { characterData: true, subtree: true, childList: true });
        return () => observer.disconnect();
    }, [originalElement, currentText]);

    // Reset overflow state when text changes to re-measure
    useLayoutEffect(() => {
        setIsOverflowing(false);
    }, [currentText]);

    // Check for overflow
    useLayoutEffect(() => {
        if (!isOverflowing && textContainerRef.current) {
            const { scrollWidth, clientWidth } = textContainerRef.current;
            if (scrollWidth > clientWidth) {
                setIsOverflowing(true);
            }
        }
    }, [currentText, isOverflowing]);

    const staticContent = `Static Romaji Title ${currentText}`;

    // RENDER: Static Replacement
    return createPortal(
        <div className="ub-song-container flex items-center gap-2 w-full max-w-full overflow-hidden">
            <div
                ref={textContainerRef}
                className="flex-1 min-w-0 overflow-hidden"
            >
                {isOverflowing ? (
                    <div className="ub-marquee-wrapper">
                        <div className="ub-marquee-inner ub-animate-marquee pr-8">
                            <Tooltip content={`Original: ${currentText}`}>
                                <span className="font-medium text-green-400 hover:underline cursor-help mr-8">
                                    {staticContent}
                                </span>
                            </Tooltip>
                            <Tooltip content={`Original: ${currentText}`}>
                                <span className="font-medium text-green-400 hover:underline cursor-help mr-8">
                                    {staticContent}
                                </span>
                            </Tooltip>
                        </div>
                    </div>
                ) : (
                    <Tooltip content={`Original: ${currentText}`}>
                        <span
                            className="font-medium text-green-400 hover:underline cursor-help truncate block"
                            title="Static Replacement"
                        >
                            {staticContent}
                        </span>
                    </Tooltip>
                )}
            </div>

            {/* Optional: Debug indicator to show it's working */}
            <span className="text-[10px] text-gray-500 border border-gray-600 px-1 rounded shrink-0">
                v0.1
            </span>
        </div>,
        mountNode
    );
};
