import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Extension Installation', () => {
    test('should load the extension', async () => {
        const pathToExtension = path.resolve(process.cwd(), '.output/chrome-mv3');
        if (!fs.existsSync(pathToExtension)) test.skip(true, 'Build not found');

        const userDataDir = path.resolve(process.cwd(), `.tmp/playwright-user-data-${Date.now()}`);
        const context = await chromium.launchPersistentContext(userDataDir, {
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

        await context.close();
    });
});
