export const UB_PROCESSED_ATTR = 'data-ub-processed';
export const UB_MOUNT_CLASS = 'ub-mount-point';
export const UB_STRATEGY_ID_ATTR = 'data-ub-strategy-id';

export type InjectionType = 'standard' | 'detached';
export type TooltipPlacement = 'top' | 'bottom';

export class DOMElement {
    public id: string;
    public selector: string;
    public tooltipPlacement: TooltipPlacement = 'top';
    public injectionType: InjectionType = 'standard';

    constructor(selector: string) {
        this.selector = selector;
        // Default ID to selector for debugging, can be overridden
        this.id = selector;
    }

    /**
     * Set a friendly ID for debugging (appears in DOM as data-ub-strategy-id)
     */
    withId(id: string): this {
        this.id = id;
        return this;
    }

    /**
     * Set tooltip placement
     */
    withPlacement(placement: TooltipPlacement): this {
        this.tooltipPlacement = placement;
        return this;
    }

    /**
     * Set injection type:
     * - 'standard': Injects as a sibling (good for static content)
     * - 'detached': Injects into body (good for React/volatile content)
     */
    withInjectionType(type: InjectionType): this {
        this.injectionType = type;
        return this;
    }

    /**
     * Helper for detached (body) injection
     */
    asDetached(): this {
        return this.withInjectionType('detached');
    }

    validate(element: HTMLElement): boolean {
        // Prevent double-processing
        return !element.getAttribute(UB_PROCESSED_ATTR);
    }

    mount(element: HTMLElement): HTMLElement | null {
        if (!this.validate(element)) return null;

        // Mark element as processed
        element.setAttribute(UB_PROCESSED_ATTR, 'true');

        // Create mount point
        const mountPoint = document.createElement('div');
        mountPoint.className = UB_MOUNT_CLASS;
        mountPoint.style.display = 'none';
        mountPoint.setAttribute(UB_STRATEGY_ID_ATTR, this.id);

        if (this.injectionType === 'standard') {
            // Insert after the element
            element.parentElement?.insertBefore(mountPoint, element.nextSibling);
        } else {
            // Append to body (detached)
            document.body.appendChild(mountPoint);
        }

        return mountPoint;
    }

    getOriginalText(element: HTMLElement): string {
        return element.textContent || '';
    }

    applyReplacement(element: HTMLElement, newText: string): void {
        element.textContent = newText;
    }
}
