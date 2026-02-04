import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Extension Installation', () => {
    // eslint-disable-next-line no-empty-pattern
    test('should load the extension', async ({}, testInfo) => {
        // Skip in CI - extension loading requires headed Chrome and doesn't work reliably in GitHub Actions
        if (process.env.CI) {
            testInfo.skip(true, 'Extension tests require headed Chrome');
        }

        const pathToExtension = path.resolve(process.cwd(), '.output/chrome-mv3');
        if (!fs.existsSync(pathToExtension)) test.skip(true, 'Build not found');

        const userDataDir = path.resolve(process.cwd(), `.tmp/playwright-user-data-${Date.now()}`);
        let context;

        try {
            context = await chromium.launchPersistentContext(userDataDir, {
                headless: false,
                args: [
                    `--disable-extensions-except=${pathToExtension}`,
                    `--load-extension=${pathToExtension}`,
                ],
            });

            const page = await context.newPage();
            await page.goto('chrome://extensions');

            expect(await page.title()).toBe('Extensions');
            await expect(page.getByRole('heading', { name: 'UtaBridge' })).toBeVisible();
        } finally {
            // Ensure context is closed to prevent worker teardown timeout
            if (context) {
                await context.close();
            }
            // Clean up temp user data directory
            if (fs.existsSync(userDataDir)) {
                fs.rmSync(userDataDir, { recursive: true, force: true });
            }
        }
    });
});
