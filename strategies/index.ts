import { ElementStrategy } from './ElementStrategy';
import { StandardInjectionStrategy, DetachedInjectionStrategy } from './SpotifyStrategies';

export const Strategies: ElementStrategy[] = [
    // Tracklist Rows (e.g. in playlists)
    new StandardInjectionStrategy(
        'track-row',
        '[data-testid="tracklist-row"] [data-testid="internal-track-link"]'
    ),
    // Now Playing Widget - Title
    new StandardInjectionStrategy(
        'np-title',
        '[data-testid="context-item-info-title"]'
    ),
    // Now Playing Widget - Artist (Needs detached injection)
    new DetachedInjectionStrategy(
        'np-artist',
        '[data-testid="context-item-info-artist"]'
    ),
    // Grid View - Track Title (e.g. Artist Top Tracks)
    new StandardInjectionStrategy(
        'grid-track',
        '[data-testid="tracklist-row"] [role="gridcell"] a[href^="/track/"]'
    ),
    // Grid View - Artist Name (e.g. Artist Top Tracks)
    new StandardInjectionStrategy(
        'grid-artist',
        '[data-testid="tracklist-row"] [role="gridcell"] a[href^="/artist/"]'
    )
];

export * from './ElementStrategy';
