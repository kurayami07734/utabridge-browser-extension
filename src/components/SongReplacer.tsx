import React from 'react';

import { DOMElement } from '@/core/DOMElement';
import { Tooltip } from '@/components/Tooltip';
import { hasJapaneseText, getSecondaryText } from '@/utils/text';

import { useDisplayPreference } from '@/hooks/useDisplayPreference';
import { useElementText } from '@/hooks/useElementText';
import { useTranslation } from '@/hooks/useTranslation';
import { useTooltip } from '@/hooks/useTooltip';
import { useDOMReplacement } from '@/hooks/useDOMReplacement';

interface Props {
    originalElement: HTMLElement;
    strategy: DOMElement;
}

/**
 * SongReplacer component that:
 * 1. Observes text changes on the original DOM element
 * 2. Fetches translations for Japanese text
 * 3. Replaces the element's text with the translation
 * 4. Shows a tooltip with the secondary translation on hover
 */
export const SongReplacer: React.FC<Props> = ({ originalElement, strategy }) => {
    // Get user's display preference (romanization or translation)
    const displayPref = useDisplayPreference();

    // Track the current text and detect changes
    const { currentText, lastReplacementRef } = useElementText(originalElement, strategy);

    // Check if text contains Japanese characters
    const shouldProcess = hasJapaneseText(currentText);

    // Fetch translation when text changes
    const { translation, isLoading, reset } = useTranslation(currentText, shouldProcess);

    // Reset translation state when text changes
    React.useEffect(() => {
        // This callback is passed to useElementText but we also reset here
        // when shouldProcess becomes false
        if (!shouldProcess) {
            reset();
        }
    }, [shouldProcess, reset]);

    // Handle tooltip hover state and position
    const { isVisible, position, placement, setIsVisible } = useTooltip(
        originalElement,
        shouldProcess,
        strategy.tooltipPlacement
    );

    // Apply DOM replacement
    useDOMReplacement({
        originalElement,
        strategy,
        currentText,
        translation,
        isLoading,
        displayPref,
        enabled: shouldProcess,
        lastReplacementRef,
    });

    // Don't render anything if text doesn't need processing
    if (!shouldProcess) return null;

    // Determine tooltip content (secondary text)
    const tooltipContent = translation ? getSecondaryText(translation, displayPref) : currentText;

    const handleDismiss = () => setIsVisible(false);

    return (
        <Tooltip
            isVisible={isVisible}
            position={position}
            placement={placement}
            onDismiss={handleDismiss}
        >
            {tooltipContent}
        </Tooltip>
    );
};
