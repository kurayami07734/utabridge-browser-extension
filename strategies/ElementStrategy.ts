export interface ElementStrategy {
    /**
     * Unique identifier for the strategy (for debugging/react keys)
     */
    id: string;

    /**
     * The CSS selector to find candidate elements for this strategy.
     */
    targetSelector: string;

    /**
     * Optional validation to check if this specific element instance is valid
     * (e.g. check parent attributes if selector is too broad).
     */
    validate(element: HTMLElement): boolean;

    /**
     * Get the original text content from the element.
     */
    getOriginalText(element: HTMLElement): string;

    /**
     * Apply the replacement text to the element.
     */
    applyReplacement(element: HTMLElement, newText: string): void;

    /**
     * Create and return a mount point for the React component.
     * This method handles where the mount point is injected (sibling vs body).
     */
    mount(element: HTMLElement): HTMLElement | null;
}

export const UB_PROCESSED_ATTR = 'data-ub-processed';
export const UB_MOUNT_CLASS = 'ub-mount-point';
