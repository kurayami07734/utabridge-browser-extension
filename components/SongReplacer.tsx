import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

import { DOMElement } from '../replacer/core/DOMElement';

interface Props {
    originalElement: HTMLElement;
    strategy: DOMElement;
}

export const SongReplacer: React.FC<Props> = ({ originalElement, strategy }) => {
    // We track the original text to translate/replace
    const [currentText, setCurrentText] = useState(strategy.getOriginalText(originalElement));
    // Track if we are hovering the original element (managed via manual listeners)
    const [isHovered, setIsHovered] = useState(false);

    // Track the last replacement we wrote to the DOM to differentiate our writes from Spotify's
    const lastReplacementRef = useRef<string | null>(null);

    // Check for Japanese/CJK characters specifically to avoid triggering on simple punctuation (like '•')
    const hasNonAscii = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(currentText);

    // 1. Observer: Watch for external changes to the text (e.g. Spotify changing song)
    useLayoutEffect(() => {
        const observer = new MutationObserver(() => {
            const newText = strategy.getOriginalText(originalElement);

            // If the text matches what we just wrote, ignore it (it's our change)
            if (newText === lastReplacementRef.current) return;

            // If it's different, it's a new song or a reset. Update state.
            if (newText !== currentText) {
                setCurrentText(newText);
            }
        });
        observer.observe(originalElement, { characterData: true, subtree: true, childList: true });
        return () => observer.disconnect();
    }, [originalElement, currentText, strategy]);

    // 2. Replacement Logic: modifying the DOM directly to preserve styles
    useLayoutEffect(() => {
        if (!hasNonAscii) {
            // Restore original text if we previously modified it, just in case
            if (lastReplacementRef.current && strategy.getOriginalText(originalElement) === lastReplacementRef.current) {
                strategy.applyReplacement(originalElement, currentText);
            }
            return;
        }

        let newContent = `Static Romaji Title ${currentText}`;

        // Feature: Handle "Type • Name" strings (e.g. "Single • Artist") or "Artist • Title"
        // We want to preserve the "Single • " part if it's ASCII and only replace the Name.
        const separator = ' • ';
        if (currentText.includes(separator)) {
            const parts = currentText.split(separator);
            const replacedParts = parts.map(part => {
                // Check each part for CJK
                if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(part)) {
                    return `Static Romaji Title ${part}`;
                }
                return part;
            });
            newContent = replacedParts.join(separator);
        }

        // Apply replacement
        if (strategy.getOriginalText(originalElement) !== newContent) {
            lastReplacementRef.current = newContent;
            strategy.applyReplacement(originalElement, newContent);
        }

        // Cleanup: Disable/Unmount -> Restore original
        return () => {
            if (strategy.getOriginalText(originalElement) === newContent) {
                strategy.applyReplacement(originalElement, currentText);
            }
        };
    }, [currentText, hasNonAscii, originalElement, strategy]);

    // 3. Hover Listeners and Positioning
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!hasNonAscii) return;

        const updatePosition = () => {
            const rect = originalElement.getBoundingClientRect();
            const placement = strategy.tooltipPlacement || 'top';
            setTooltipPos({
                x: rect.left + rect.width / 2,
                y: placement === 'bottom' ? rect.bottom : rect.top
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
    const placement = strategy.tooltipPlacement || 'top';
    const isBottom = placement === 'bottom';

    // Using inline styles for box-model properties to ensure they apply over any external CSS resets
    const baseClasses = "fixed bg-[#282828] text-white text-[13px] font-medium rounded opacity-100 z-[9999] pointer-events-none shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform -translate-x-1/2";
    const placementClasses = isBottom
        ? "mt-2 after:content-[''] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-[6px] after:border-b-[#282828] after:border-x-transparent after:border-t-transparent"
        : "-translate-y-full mb-2 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[6px] after:border-t-[#282828] after:border-x-transparent after:border-b-transparent";

    return createPortal(
        isHovered && (
            <div
                className={`${baseClasses} ${placementClasses}`}
                style={{
                    left: tooltipPos.x,
                    top: tooltipPos.y,
                    padding: '6px', // Force padding
                }}
            >
                {currentText}
            </div>
        ),
        document.body
    );
};
