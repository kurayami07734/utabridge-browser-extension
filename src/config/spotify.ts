/**
 * TextTarget configuration for Spotify elements.
 * Pure data - no classes, no methods.
 */
export interface TextTarget {
    /** Unique identifier for this TextTarget */
    id: string;
    /** CSS selector to find elements */
    selector: string;
    /** Tooltip placement (default: 'top') */
    tooltip?: 'top' | 'bottom';
    /**
     * If set, parse compound text (e.g., "Playlist • Artist")
     * Only translates segments with non-ASCII text
     */
    parseAs?: 'bullet' | 'comma';
}

/**
 * All TARGETS for Spotify.
 * Order matters - first match wins.
 *
 * VERIFIED against fixtures: album_view, artist_view, playlist_view, queue_open_view, song_view
 */
export const TARGETS: TextTarget[] = [
    // ═══════════════════════════════════════════════════════════════════════════
    // TRACKLIST (album page, playlist page)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'track-link',
        selector: '[data-testid="tracklist-row"] [data-testid="internal-track-link"]',
    },
    {
        // Artist links in tracklist row (not covered by listRowSubtitle)
        id: 'tracklist-artist',
        selector: '[data-testid="tracklist-row"] span[data-encore-id="text"] a[href^="/artist"]',
    },
    {
        // Album links in tracklist row (column 3)
        id: 'tracklist-album',
        selector: '[data-testid="tracklist-row"] span[data-encore-id="text"] a[href^="/album"]',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // NOW PLAYING WIDGET (bottom bar) - verified in live Spotify
    // Structure: [data-testid="now-playing-widget"] contains:
    //   - Title: [data-testid="context-item-link"] (the <a> tag with song name)
    //   - Artist: [data-testid="context-item-info-artist"] (the <a> tag IS the element)
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'np-title',
        selector: '[data-testid="now-playing-widget"] [data-testid="context-item-info-title"]',
    },
    {
        id: 'np-artist',
        selector: '[data-testid="now-playing-widget"] [data-testid="context-item-info-artist"]',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // NOW PLAYING PANEL (right sidebar when expanded) - verified in live Spotify
    // The panel has aria-label="Now playing view" or class NowPlayingView
    // ═══════════════════════════════════════════════════════════════════════════
    {
        // Header row title (the h1 in the panel header)
        id: 'panel-header-title',
        selector: 'aside[aria-label="Now playing view"] h1[data-encore-id="text"]',
        tooltip: 'bottom',
    },
    {
        // Main content title link
        id: 'panel-title',
        selector: 'aside[aria-label="Now playing view"] [data-testid="context-item-info-title"]',
        tooltip: 'bottom',
    },
    {
        id: 'panel-artist',
        selector: 'aside[aria-label="Now playing view"] [data-testid="context-item-info-artist"]',
        tooltip: 'bottom',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ENTITY PAGES (album, playlist, track header)
    // ═══════════════════════════════════════════════════════════════════════════
    { id: 'entity-title', selector: '[data-testid="entityTitle"] h1' },
    { id: 'creator-link', selector: '[data-testid="creator-link"]' },

    // ═══════════════════════════════════════════════════════════════════════════
    // CARDS (home page shelves, artist discography, recommendations)
    // ═══════════════════════════════════════════════════════════════════════════
    { id: 'card-title', selector: '[data-encore-id="cardTitle"] span' },
    {
        id: 'card-subtitle',
        selector: '[data-encore-id="cardSubtitle"]',
        parseAs: 'bullet',
    },
    // Note: cardSubtitle contains "2001 • Album" or "Playlist • username" patterns

    // ═══════════════════════════════════════════════════════════════════════════
    // LIST ROWS (queue, sidebar playlists, search results)
    // ═══════════════════════════════════════════════════════════════════════════
    { id: 'list-title', selector: '[data-encore-id="listRowTitle"] > span' },
    {
        id: 'list-subtitle',
        selector: '[data-encore-id="listRowSubtitle"]:not(:has(a))',
        parseAs: 'bullet',
    },
    { id: 'list-link', selector: '[data-encore-id="listRowSubtitle"] a' },

    // ═══════════════════════════════════════════════════════════════════════════
    // CREDITS (in now playing panel and song page)
    // Credits rows use listRow with aria-labelledby containing "artist" or person name
    // ═══════════════════════════════════════════════════════════════════════════
    {
        // Credits artist link (linked to Spotify profile)
        id: 'credits-artist-link',
        selector:
            'aside[aria-label="Now playing view"] [data-encore-id="listRow"] a[href^="/artist"]',
    },
    {
        // Credits name span (not linked - person without Spotify profile)
        id: 'credits-name',
        selector:
            'aside[aria-label="Now playing view"] [data-encore-id="listRow"] span[data-encore-id="text"]:not([data-testid])',
    },
    // Note: listRowSubtitle in credits contains roles like "Main Artist, Composer" - no translation needed

    // ═══════════════════════════════════════════════════════════════════════════
    // ARTIST PAGE
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'artist-name',
        selector: '[data-testid="adaptiveEntityTitle"] [data-encore-id="adaptiveTitle"]',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // TOPBAR (scrolled state - shows title)
    // ═══════════════════════════════════════════════════════════════════════════
    { id: 'topbar', selector: '[data-testid="topbar-content"] span[draggable="true"]' },

    // ═══════════════════════════════════════════════════════════════════════════
    // DOCUMENT TITLE (browser tab - in <head>)
    // Format: "Song • Artist" or "Artist • Playlist • Spotify"
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'document-title',
        selector: 'head > title',
        parseAs: 'bullet',
    },
];

/** Attribute to mark processed elements */
export const PROCESSED_ATTR = 'data-ub';

/** Check if current page is Spotify */
export const isSpotify = (): boolean => location.hostname === 'open.spotify.com';
