import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Tooltip } from './Tooltip'; // Wrapper for Floating UI

interface Props {
    mountNode: HTMLElement;
    originalElement: HTMLElement;
}

export const SongReplacer: React.FC<Props> = ({ mountNode, originalElement }) => {
    // We track the original text to translate/replace
    const [currentText, setCurrentText] = useState(originalElement.textContent || '');
    // Track if we are hovering the original element (managed via manual listeners)
    const [isHovered, setIsHovered] = useState(false);

    // Track the last replacement we wrote to the DOM to differentiate our writes from Spotify's
    const lastReplacementRef = useRef<string | null>(null);

    const hasNonAscii = /[^\x00-\x7F]/.test(currentText);

    // 1. Observer: Watch for external changes to the text (e.g. Spotify changing song)
    useLayoutEffect(() => {
        const observer = new MutationObserver(() => {
            const newText = originalElement.textContent || '';

            // If the text matches what we just wrote, ignore it (it's our change)
            if (newText === lastReplacementRef.current) return;

            // If it's different, it's a new song or a reset. Update state.
            if (newText !== currentText) {
                setCurrentText(newText);
            }
        });
        observer.observe(originalElement, { characterData: true, subtree: true, childList: true });
        return () => observer.disconnect();
    }, [originalElement, currentText]);

    // 2. Replacement Logic: modifying the DOM directly to preserve styles
    useLayoutEffect(() => {
        if (!hasNonAscii) {
            // Restore original text if we previously modified it, just in case
            if (lastReplacementRef.current && originalElement.textContent === lastReplacementRef.current) {
                originalElement.textContent = currentText;
            }
            return;
        }

        const staticContent = `Static Romaji Title ${currentText}`;

        // Apply replacement
        if (originalElement.textContent !== staticContent) {
            lastReplacementRef.current = staticContent;
            originalElement.textContent = staticContent;
        }

        // Cleanup: Disable/Unmount -> Restore original
        return () => {
            if (originalElement.textContent === staticContent) {
                originalElement.textContent = currentText;
            }
        };
    }, [currentText, hasNonAscii, originalElement]);

    // 3. Hover Listeners and Positioning
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!hasNonAscii) return;

        const updatePosition = () => {
            const rect = originalElement.getBoundingClientRect();
            setTooltipPos({
                x: rect.left + rect.width / 2,
                y: rect.top
            });
        };

        const onEnter = () => {
            updatePosition();
            setIsHovered(true);
        };
        const onLeave = () => setIsHovered(false);
        // Update position on scroll too, if feasible, but hover-trigger is usually enough for static

        originalElement.addEventListener('mouseenter', onEnter);
        originalElement.addEventListener('mouseleave', onLeave);
        // Also update on scroll/resize if user scrolls while hovering? 
        // For simplicity, let's stick to update-on-enter. 
        // Adding 'wheel' listener to window might be overkill/expensive.

        return () => {
            originalElement.removeEventListener('mouseenter', onEnter);
            originalElement.removeEventListener('mouseleave', onLeave);
        };
    }, [originalElement, hasNonAscii]);


    // If no replacement active, render nothing
    if (!hasNonAscii) return null;

    // Portal to document.body to escape layout constraints
    // Position fixed to placing it relative to viewport (matched with getBoundingClientRect)
    return createPortal(
        isHovered && (
            <div
                className="fixed px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-[9999] pointer-events-none shadow-lg transform -translate-x-1/2 -translate-y-full mb-1"
                style={{
                    left: tooltipPos.x,
                    top: tooltipPos.y
                }}
            >
                Original: {currentText}
            </div>
        ),
        document.body
    );
};
