import { useEffect, useState, useMemo, useCallback } from 'react';
import tippy, { Instance as TippyInstance, followCursor } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { useDisplayPreference } from '@/hooks/useDisplayPreference';
import { useTranslation } from '@/hooks/useTranslation';
import { useTextReplace } from '@/hooks/useTextReplace';
import {
    parseCompoundText,
    getTranslatableSegments,
    getPrimaryText,
    getSecondaryText,
    type ParsedCompoundText,
    type TextSegment,
} from '@/utils/text';
import type { TextTarget } from '@/config/spotify';
import type { CachedTranslation } from '@/utils/types';

interface Props {
    el: HTMLElement;
    target: TextTarget;
}

/**
 * Component to translate a single translatable segment.
 * Uses the useTranslation hook to fetch and cache translations.
 */
function SegmentTranslator({
    segment,
    onTranslation,
}: {
    segment: TextSegment;
    onTranslation: (text: string, translation: CachedTranslation) => void;
}) {
    const { translation } = useTranslation(segment.text.trim(), segment.type === 'translatable');

    useEffect(() => {
        if (translation) {
            onTranslation(segment.text.trim(), translation);
        }
    }, [translation, segment.text, onTranslation]);

    return null; // This component doesn't render anything visible
}

/**
 * Handles translation and tooltip for a single element.
 * Supports compound text (e.g., "日本語 • Spotify") by:
 * 1. Splitting on delimiters
 * 2. Translating only non-Latin-script segments
 * 3. Reconstructing with translated segments + original delimiters/Latin text
 */
export function TextReplacer({ el, target }: Props) {
    const displayPref = useDisplayPreference();
    const originalText = useMemo(() => el.textContent ?? '', [el]);

    // Parse compound text (synchronous — no async language detection)
    const parsed = useMemo<ParsedCompoundText | null>(
        () => parseCompoundText(originalText, target.parseAs),
        [originalText, target.parseAs]
    );

    // Get translatable segments
    const translatableSegments = useMemo(
        () => (parsed ? getTranslatableSegments(parsed) : []),
        [parsed]
    );

    // Track translations for each segment
    const [translations, setTranslations] = useState<
        Map<string, { primary: string; secondary: string }>
    >(new Map());

    // Callback for when a segment translation is received
    const handleTranslation = useCallback(
        (text: string, translation: CachedTranslation) => {
            setTranslations((prev) => {
                const next = new Map(prev);
                next.set(text, {
                    primary: getPrimaryText(translation, displayPref),
                    secondary: getSecondaryText(translation, displayPref),
                });
                return next;
            });
        },
        [displayPref]
    );

    // Determine loading state
    const isLoading = parsed?.hasTranslatable && translatableSegments.length > translations.size;

    // Apply text replacement — returns the element currently in the DOM
    // (may be a clone of `el` to preserve classes and structure)
    const activeEl = useTextReplace({
        el,
        parsed,
        translations,
        loading: !!isLoading,
        displayPref,
        enabled: !!parsed?.hasTranslatable,
    });

    // Combine secondary texts for tooltip (only translatable segments)
    const tooltipText = useMemo(() => {
        if (!parsed?.hasTranslatable || translations.size === 0) return '';
        return translatableSegments
            .map((s) => translations.get(s.text.trim())?.secondary)
            .filter(Boolean)
            .join(' • ');
    }, [parsed, translatableSegments, translations]);

    // Setup Tippy tooltip on the active element (clone or original)
    useEffect(() => {
        // Skip tooltip for title element (browser tab) - not visible on page
        const isTitle = activeEl.tagName === 'TITLE';
        if (!tooltipText || isTitle) return;

        const instance: TippyInstance = tippy(activeEl, {
            content: tooltipText,
            placement: target.tooltip === 'bottom' ? 'bottom' : 'top',
            arrow: false,
            animation: 'fade',
            theme: 'spotify',
            delay: [200, 0], // Show after 200ms, hide immediately
            duration: [150, 100],
            appendTo: document.body,
            followCursor: true,
            plugins: [followCursor],
        });

        return () => {
            instance.destroy();
        };
    }, [activeEl, tooltipText, target.tooltip]);

    // Render segment translators (invisible, just for data fetching)
    return (
        <>
            {translatableSegments.map((segment) => (
                <SegmentTranslator
                    key={segment.text}
                    segment={segment}
                    onTranslation={handleTranslation}
                />
            ))}
        </>
    );
}
