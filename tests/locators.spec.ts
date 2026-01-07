import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { SpotifyProfile } from '../src/profiles/SpotifyProfile';

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
    const profile = new SpotifyProfile();

    // Iterate over all defined strategies
    for (const elementStrategy of profile.elements) {
        test(`should find element: ${elementStrategy.id}`, async ({ page }) => {
            let found = false;
            const foundInParams: string[] = [];

            // Check against EVERY loaded fixture
            // Each test checks if the locator is present in ANY of the provided HTML snapshots.
            // This satisfies the requirement that "not all elements will be visible at the same time"
            // by allowing the user to provide multiple snapshots (e.g. playlist.html, artist.html).
            for (const [fileName, html] of Object.entries(htmlFixtures)) {
                await page.setContent(html);
                const count = await page.locator(elementStrategy.selector).count();
                if (count > 0) {
                    found = true;
                    foundInParams.push(`${fileName} (${count})`);
                }
            }

            console.log(`[${elementStrategy.id}] Found in: ${foundInParams.join(', ') || 'NONE'}`);

            // The locator must exist in AT LEAST ONE of the provided fixtures
            expect(
                found,
                `Locator '${elementStrategy.id}' (${elementStrategy.selector}) not found in any fixture.`
            ).toBe(true);
        });
    }
});
