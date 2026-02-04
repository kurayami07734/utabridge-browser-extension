import { useEffect, useState, useMemo } from 'react';
import { Tooltip } from '@mui/material';
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
    const { translation } = useTranslation(
        segment.text.trim(),
        segment.language ?? 'und',
        segment.type === 'translatable'
    );

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
 * 2. Translating only non-ASCII segments
 * 3. Reconstructing with translated segments + original delimiters/ASCII
 */
export function TextReplacer({ el, target }: Props) {
    const displayPref = useDisplayPreference();
    const originalText = useMemo(() => el.textContent ?? '', [el]);

    // Parse compound text asynchronously
    const [parsed, setParsed] = useState<ParsedCompoundText | null>(null);

    useEffect(() => {
        parseCompoundText(originalText, target.parseAs).then(setParsed);
    }, [originalText, target.parseAs]);

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
    const handleTranslation = useMemo(
        () => (text: string, translation: CachedTranslation) => {
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
    const isLoading =
        parsed?.hasTranslatable && translatableSegments.length > translations.size;

    // Apply text replacement
    useTextReplace({
        el,
        parsed,
        translations,
        loading: !!isLoading,
        displayPref,
        enabled: !!parsed?.hasTranslatable,
    });

    // Render segment translators (invisible, just for data fetching)
    const segmentTranslators = translatableSegments.map((segment) => (
        <SegmentTranslator
            key={segment.text}
            segment={segment}
            onTranslation={handleTranslation}
        />
    ));

    // Don't render tooltip if no translations available
    if (!parsed?.hasTranslatable || translations.size === 0) {
        return <>{segmentTranslators}</>;
    }

    // Combine secondary texts for tooltip (only translatable segments)
    const tooltipText = translatableSegments
        .map((s) => translations.get(s.text.trim())?.secondary)
        .filter(Boolean)
        .join(' • ');

    if (!tooltipText) {
        return <>{segmentTranslators}</>;
    }

    return (
        <>
            {segmentTranslators}
            <Tooltip
                title={tooltipText}
                placement={target.tooltip ?? 'top'}
                arrow
                slotProps={{ popper: { anchorEl: el } }}
            >
                <span style={{ display: 'none' }} />
            </Tooltip>
        </>
    );
}
