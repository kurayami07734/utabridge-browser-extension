import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

import { DOMElement } from '../replacer/core/DOMElement';
import { TranslationService } from '../services/TranslationService';

interface Props {
    originalElement: HTMLElement;
    strategy: DOMElement;
}

export const SongReplacer: React.FC<Props> = ({ originalElement, strategy }) => {
    const [currentText, setCurrentText] = useState(strategy.getOriginalText(originalElement));
    const [isHovered, setIsHovered] = useState(false);

    const [translation, setTranslation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const lastReplacementRef = useRef<string | null>(null);

    const hasNonAscii = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(
        currentText
    );

    useLayoutEffect(() => {
        const observer = new MutationObserver(() => {
            const newText = strategy.getOriginalText(originalElement);

            // If the text matches what we just wrote, ignore it (it's our change)
            if (newText === lastReplacementRef.current) return;

            // If it's different, it's a new song or a reset. Update state.
            if (newText !== currentText) {
                setCurrentText(newText);
                setTranslation(null);
                setIsLoading(false);
            }
        });
        observer.observe(originalElement, { characterData: true, subtree: true, childList: true });
        return () => observer.disconnect();
    }, [originalElement, currentText, strategy]);

    useEffect(() => {
        if (!hasNonAscii) return;

        const unsubscribe = TranslationService.observe(currentText, (result) => {
            if (result) {
                setTranslation(result);
                setIsLoading(false);
            } else {
                setTranslation(null);
                setIsLoading(true);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [currentText, hasNonAscii]);

    useLayoutEffect(() => {
        if (!hasNonAscii) {
            // Restore original if needed
            if (
                lastReplacementRef.current &&
                strategy.getOriginalText(originalElement) === lastReplacementRef.current
            ) {
                strategy.applyReplacement(originalElement, currentText);
            }
            return;
        }

        let newContent = currentText;
        if (isLoading) {
            newContent = `(Wait...) ${currentText}`;
        } else if (translation) {
            newContent = translation;
        }

        // Apply replacement
        if (strategy.getOriginalText(originalElement) !== newContent) {
            lastReplacementRef.current = newContent;
            strategy.applyReplacement(originalElement, newContent);
        }

        return () => {
            if (strategy.getOriginalText(originalElement) === newContent) {
                strategy.applyReplacement(originalElement, currentText);
            }
        };
    }, [currentText, translation, isLoading, hasNonAscii, originalElement, strategy]);

    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!hasNonAscii) return;

        const updatePosition = () => {
            const rect = originalElement.getBoundingClientRect();
            const placement = strategy.tooltipPlacement || 'top';
            setTooltipPos({
                x: rect.left + rect.width / 2,
                y: placement === 'bottom' ? rect.bottom : rect.top,
            });
        };

        const onEnter = () => {
            updatePosition();
            setIsHovered(true);
        };
        const onLeave = () => setIsHovered(false);

        originalElement.addEventListener('mouseenter', onEnter);
        originalElement.addEventListener('mouseleave', onLeave);

        return () => {
            originalElement.removeEventListener('mouseenter', onEnter);
            originalElement.removeEventListener('mouseleave', onLeave);
        };
    }, [originalElement, hasNonAscii, strategy]);

    if (!hasNonAscii) return null;

    const placement = strategy.tooltipPlacement || 'top';
    const isBottom = placement === 'bottom';

    const baseClasses =
        'fixed bg-[#282828] text-white text-[13px] font-medium rounded opacity-100 z-[9999] pointer-events-none shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform -translate-x-1/2';
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
                    padding: '6px',
                }}
            >
                {currentText}
            </div>
        ),
        document.body
    );
};
