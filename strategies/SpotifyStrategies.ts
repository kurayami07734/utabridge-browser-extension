import { ElementStrategy, UB_MOUNT_CLASS, UB_PROCESSED_ATTR } from './ElementStrategy';

abstract class BaseStrategy implements ElementStrategy {
    abstract id: string;
    abstract targetSelector: string;

    validate(element: HTMLElement): boolean {
        // Default check: prevent double-processing
        return !element.getAttribute(UB_PROCESSED_ATTR);
    }

    getOriginalText(element: HTMLElement): string {
        return element.textContent || '';
    }

    applyReplacement(element: HTMLElement, newText: string): void {
        element.textContent = newText;
    }

    protected createMountElement(): HTMLDivElement {
        const mount = document.createElement('div');
        mount.className = UB_MOUNT_CLASS;
        mount.style.display = 'none'; // logic handles tooltips via portals now
        return mount;
    }

    protected markProcessed(element: HTMLElement): void {
        element.setAttribute(UB_PROCESSED_ATTR, 'true');
    }

    abstract mount(element: HTMLElement): HTMLElement | null;
}

/**
 * Standard strategy for Track List Rows and Now Playing Title.
 * Injects the mount point as a sibling (standard behavior).
 */
export class StandardInjectionStrategy extends BaseStrategy {
    constructor(
        public id: string,
        public targetSelector: string
    ) {
        super();
    }

    mount(element: HTMLElement): HTMLElement | null {
        if (!this.validate(element)) return null;

        this.markProcessed(element);

        const mountPoint = this.createMountElement();
        // Standard injection: Insert after the element
        element.parentElement?.insertBefore(mountPoint, element.nextSibling);

        return mountPoint;
    }
}

/**
 * Special strategy for the Now Playing Artist.
 * Injects the mount point into document.body to avoid React VDOM conflicts
 * that cause the artist name node to be wiped on re-renders.
 */
export class DetachedInjectionStrategy extends BaseStrategy {
    constructor(
        public id: string,
        public targetSelector: string
    ) {
        super();
    }

    mount(element: HTMLElement): HTMLElement | null {
        if (!this.validate(element)) return null;

        this.markProcessed(element);

        const mountPoint = this.createMountElement();
        // Detached injection: Append to body to bypass Spotify's React tree
        document.body.appendChild(mountPoint);

        return mountPoint;
    }
}
