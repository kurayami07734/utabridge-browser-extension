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
    /**
     * If true, this selector is verified in live Spotify but not present
     * in test fixtures. Tests will skip validating these selectors.
     */
    liveOnly?: boolean;
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
    // Note: Artist links in tracklist are covered by 'list-link' below

    // ═══════════════════════════════════════════════════════════════════════════
    // NOW PLAYING WIDGET (bottom bar) - verified in live Spotify, not in fixtures
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'np-title',
        selector: '[data-testid="now-playing-widget"] [data-testid="context-item-info-title"] div',
        liveOnly: true,
    },
    {
        id: 'np-artist',
        selector: '[data-testid="now-playing-widget"] [data-testid="context-item-info-artist"] a',
        liveOnly: true,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // NOW PLAYING PANEL (right sidebar when expanded) - verified in live Spotify, not in fixtures
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'panel-title',
        selector: '[data-testid="context-item-info-title"] div[data-encore-id="text"]',
        tooltip: 'bottom',
        liveOnly: true,
    },
    {
        id: 'panel-artist',
        selector: '[data-testid="context-item-info-artist"] a',
        tooltip: 'bottom',
        liveOnly: true,
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
    // CREDITS PANEL (song view, now playing panel)
    // ═══════════════════════════════════════════════════════════════════════════
    { id: 'credits-artist', selector: '[data-testid="artist-row-credits-link"]' },
    {
        id: 'credits-name',
        selector:
            '[data-testid="credits-artist-row"] span[data-encore-id="text"]:not([data-testid])',
    },
    // Note: artist-row-role is English ("Main Artist, Composer") - no translation needed

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
];

/** Attribute to mark processed elements */
export const PROCESSED_ATTR = 'data-ub';

/** Check if current page is Spotify */
export const isSpotify = (): boolean => location.hostname === 'open.spotify.com';
