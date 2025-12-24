
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
    mountPoint.style.display = 'inline-flex';
    mountPoint.style.alignItems = 'center';

    // 4. Inject AFTER original
    originalElement.parentElement?.insertBefore(mountPoint, originalElement.nextSibling);

    // 5. Hide Original (Non-destructive)
    originalElement.style.visibility = 'hidden';
    originalElement.style.position = 'absolute';
    originalElement.style.width = '1px';
    originalElement.style.height = '1px';
    originalElement.style.overflow = 'hidden';

    return mountPoint;
};
