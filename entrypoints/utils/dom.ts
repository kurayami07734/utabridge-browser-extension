
export const UB_PROCESSED_ATTR = 'data-ub-processed';
export const UB_MOUNT_CLASS = 'ub-mount-point';

export const prepareMountPoint = (originalElement: HTMLElement): HTMLElement | null => {
    // 1. Avoid double-injection
    if (originalElement.getAttribute(UB_PROCESSED_ATTR)) {
        return originalElement.parentElement?.querySelector(`.${UB_MOUNT_CLASS}`) as HTMLElement;
    }

    // 2. Mark processed
    originalElement.setAttribute(UB_PROCESSED_ATTR, 'true');

    // 3. Create Mount Point
    const mountPoint = document.createElement('div');
    mountPoint.className = UB_MOUNT_CLASS;
    // Zero-layout container that allows children (Tooltips) to be visible
    mountPoint.style.display = 'inline-block';
    mountPoint.style.width = '0px';
    mountPoint.style.height = '0px';
    mountPoint.style.overflow = 'visible';
    mountPoint.style.verticalAlign = 'middle'; // Align with text if possible

    // 4. Inject AFTER original
    originalElement.parentElement?.insertBefore(mountPoint, originalElement.nextSibling);
    return mountPoint;
};
