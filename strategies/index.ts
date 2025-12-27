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
    ),
    // Entity Header - Title (e.g. Album/Track Name)
    new StandardInjectionStrategy(
        'header-title',
        '[data-testid="entityTitle"] h1'
    ),
    // Entity Header - Creator (e.g. Artist Name)
    new StandardInjectionStrategy(
        'header-creator',
        '[data-testid="creator-link"]'
    ),
    // Sticky Topbar - Title (appears on scroll)
    new StandardInjectionStrategy(
        'topbar-title',
        '[data-testid="topbar-content"] span[draggable="true"]'
    ),
    // Track Artist Card (Bottom of track page)
    new DetachedInjectionStrategy(
        'track-artist-card',
        '[data-testid="track-artist-link-card"] a div'
    ),
    // Track Row - Album Link
    new DetachedInjectionStrategy(
        'track-row-album',
        '[data-testid="tracklist-row"] [role="gridcell"] a[href^="/album/"]'
    )
];

export * from './ElementStrategy';
