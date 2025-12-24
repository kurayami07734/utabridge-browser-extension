// components/SongReplacer.tsx
import React, { useEffect, useState } from 'react';
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

    // Keep the observer to handle Spotify recycling rows (Virtualization)
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const newText = originalElement.textContent || '';
            if (newText !== currentText) setCurrentText(newText);
        });
        observer.observe(originalElement, { characterData: true, subtree: true, childList: true });
        return () => observer.disconnect();
    }, [originalElement, currentText]);

    // RENDER: Static Replacement
    return createPortal(
        <div className="ub-song-container flex items-center gap-2">
            <Tooltip content={`Original: ${currentText}`}>
                <span
                    className="font-medium text-green-400 hover:underline cursor-help"
                    title="Static Replacement"
                >
                    {/* STATIC STRING FOR ITERATION 1 */}
                    Static Romaji Title
                </span>
            </Tooltip>

            {/* Optional: Debug indicator to show it's working */}
            <span className="text-[10px] text-gray-500 border border-gray-600 px-1 rounded">
                v0.1
            </span>
        </div>,
        mountNode
    );
};
