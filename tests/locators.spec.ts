import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { TARGETS } from '../src/config/spotify';

const fixturesDir = path.resolve(process.cwd(), 'tests/fixtures');
const htmlFixtures: Record<string, string> = {};

// Load all HTML files from the fixtures directory
if (fs.existsSync(fixturesDir)) {
    const files = fs.readdirSync(fixturesDir).filter((f) => f.endsWith('.html'));
    for (const file of files) {
        htmlFixtures[file] = fs.readFileSync(path.join(fixturesDir, file), 'utf-8');
    }
}

test.describe('Spotify Locators', () => {
    for (const target of TARGETS) {
        test(`should find element: ${target.id}`, async ({ page }) => {
            let found = false;
            const foundIn: string[] = [];

            // Check against EVERY loaded fixture
            // Each test checks if the locator is present in ANY of the provided HTML snapshots.
            for (const [fileName, html] of Object.entries(htmlFixtures)) {
                // Use 'domcontentloaded' to avoid waiting for external resources (images, fonts)
                // which may never load in test environment
                await page.setContent(html, { waitUntil: 'domcontentloaded' });
                const count = await page.locator(target.selector).count();
                if (count > 0) {
                    found = true;
                    foundIn.push(`${fileName} (${count})`);
                }
            }

            console.log(`[${target.id}] Found in: ${foundIn.join(', ') || 'NONE'}`);

            // The locator must exist in AT LEAST ONE of the provided fixtures
            expect(
                found,
                `Locator '${target.id}' (${target.selector}) not found in any fixture.`
            ).toBe(true);
        });
    }
});
