import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Define the PROCESSED_ATTR locally to avoid import issues
const PROCESSED_ATTR = 'data-ub';

// Mock the isSpotify function and TARGETS before importing the hook
vi.mock('../../src/config/spotify', () => ({
    isSpotify: () => true,
    TARGETS: [{ id: 'test-target', selector: '[data-testid="test-element"]' }],
    PROCESSED_ATTR: 'data-ub',
}));

// Import after mocking
import { useDomScanner } from '../../src/hooks/useDomScanner';

describe('useDomScanner - Global Toggle', () => {
    let testElement: HTMLElement;

    beforeEach(() => {
        // Create a test element in the DOM
        testElement = document.createElement('div');
        testElement.setAttribute('data-testid', 'test-element');
        testElement.textContent = 'Original Text';
        document.body.appendChild(testElement);
    });

    afterEach(() => {
        // Clean up
        if (testElement.parentNode) {
            testElement.remove();
        }
        // Remove processed attribute if it exists
        testElement.removeAttribute(PROCESSED_ATTR);
        vi.clearAllMocks();
    });

    it('should find and return targets when enabled', async () => {
        const { result } = renderHook(() => useDomScanner(true));

        // Wait for the effect to run
        await act(async () => {
            await new Promise((r) => setTimeout(r, 50));
        });

        expect(result.current.targets.length).toBe(1);
        expect(result.current.targets[0].el).toBe(testElement);
        expect(testElement.hasAttribute(PROCESSED_ATTR)).toBe(true);
    });

    it('should not find targets when disabled', () => {
        const { result } = renderHook(() => useDomScanner(false));

        expect(result.current.targets.length).toBe(0);
        expect(testElement.hasAttribute(PROCESSED_ATTR)).toBe(false);
    });

    it('should clear targets and remove markers when reset is called', async () => {
        const { result } = renderHook(() => useDomScanner(true));

        // Wait for initial scan
        await act(async () => {
            await new Promise((r) => setTimeout(r, 50));
        });

        expect(result.current.targets.length).toBe(1);
        expect(testElement.hasAttribute(PROCESSED_ATTR)).toBe(true);

        // Call reset
        act(() => {
            result.current.reset();
        });

        expect(result.current.targets.length).toBe(0);
        expect(testElement.hasAttribute(PROCESSED_ATTR)).toBe(false);
    });

    it('should allow re-scanning after reset', async () => {
        const { result, rerender } = renderHook(({ enabled }) => useDomScanner(enabled), {
            initialProps: { enabled: true },
        });

        // Initial scan
        await act(async () => {
            await new Promise((r) => setTimeout(r, 50));
        });
        expect(result.current.targets.length).toBe(1);

        // Disable and reset
        rerender({ enabled: false });
        act(() => {
            result.current.reset();
        });
        expect(result.current.targets.length).toBe(0);
        expect(testElement.hasAttribute(PROCESSED_ATTR)).toBe(false);

        // Re-enable - should find element again
        rerender({ enabled: true });
        await act(async () => {
            await new Promise((r) => setTimeout(r, 50));
        });

        expect(result.current.targets.length).toBe(1);
        expect(testElement.hasAttribute(PROCESSED_ATTR)).toBe(true);
    });

    it('reset function should be stable (not change between renders)', () => {
        const { result, rerender } = renderHook(() => useDomScanner(true));

        const resetFn1 = result.current.reset;

        rerender();

        const resetFn2 = result.current.reset;

        expect(resetFn1).toBe(resetFn2);
    });
});
