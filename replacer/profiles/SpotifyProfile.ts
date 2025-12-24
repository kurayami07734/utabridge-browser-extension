import { DOMElement } from '../core/DOMElement';
import { WebsiteProfile } from '../core/WebsiteProfile';

export class SpotifyProfile implements WebsiteProfile {
    name = 'Spotify';

    matches(url: string): boolean {
        return url.includes('open.spotify.com');
    }

    elements: DOMElement[] = [
        // Tracklist Rows (e.g. in playlists)
        new DOMElement('[data-testid="tracklist-row"] [data-testid="internal-track-link"]')
            .withId('track-row'),

        // Now Playing Widget (Bottom Bar) - Title
        new DOMElement('[data-testid="now-playing-widget"] [data-testid="context-item-info-title"]')
            .withId('np-widget-title'),

        // Now Playing Widget (Bottom Bar) - Artist
        new DOMElement('[data-testid="now-playing-widget"] [data-testid="context-item-info-artist"]')
            .withId('np-widget-artist')
            .asDetached(),

        // Now Playing View (Sidebar) - Title (Footer/Queue)
        new DOMElement('[id="Desktop_PanelContainer_Id"] [data-testid="context-item-info-title"]')
            .withId('np-view-title')
            .withPlacement('bottom'),

        // Now Playing View (Sidebar) - Header Title (H1)
        new DOMElement('[id="Desktop_PanelContainer_Id"] h1')
            .withId('np-view-h1')
            .withPlacement('bottom'),

        // Now Playing View (Sidebar) - Artist (Footer/Queue)
        new DOMElement('[id="Desktop_PanelContainer_Id"] [data-testid="context-item-info-artist"]')
            .withId('np-view-artist')
            .withPlacement('bottom')
            .asDetached(),

        // Now Playing View (Sidebar) - Header Artist Link
        new DOMElement('[id="Desktop_PanelContainer_Id"] a[href^="/artist/"]')
            .withId('np-view-artist-link')
            .withPlacement('bottom')
            .asDetached(),

        // Grid View - Track Title (e.g. Artist Top Tracks)
        new DOMElement('[data-testid="tracklist-row"] [role="gridcell"] a[href^="/track/"]')
            .withId('grid-track'),

        // Grid View - Artist Name (e.g. Artist Top Tracks)
        new DOMElement('[data-testid="tracklist-row"] [role="gridcell"] a[href^="/artist/"]')
            .withId('grid-artist'),

        // Entity Header - Title (e.g. Album/Track Name)
        new DOMElement('[data-testid="entityTitle"] h1')
            .withId('header-title'),

        // Entity Header - Creator (e.g. Artist Name)
        new DOMElement('[data-testid="creator-link"]')
            .withId('header-creator'),

        // Sticky Topbar - Title (appears on scroll)
        new DOMElement('[data-testid="topbar-content"] span[draggable="true"]')
            .withId('topbar-title'),

        // Track Artist Card (Bottom of track page)
        new DOMElement('[data-testid="track-artist-link-card"] a div')
            .withId('track-artist-card')
            .asDetached(),

        // Track Row - Album Link
        new DOMElement('[data-testid="tracklist-row"] [role="gridcell"] a[href^="/album/"]')
            .withId('track-row-album')
            .asDetached(),

        // Carousel Card - Title (Albums/Playlists)
        new DOMElement('[data-encore-id="card"] [data-encore-id="cardTitle"] span')
            .withId('card-title')
            .asDetached(),

        // Carousel Card - Description/Subtitle
        new DOMElement('[data-encore-id="card"] [data-encore-id="cardSubtitle"], [data-encore-id="card"] [data-encore-id="cardDescription"]')
            .withId('card-description')
            .asDetached(),

        // Song Credits - Name (excludes Role)
        new DOMElement('[data-testid="credits-artist-row"] [data-encore-id="text"]:not([data-testid="artist-row-role"])')
            .withId('credits-row-name'),

        // Song Credits - Role (e.g. Composer)
        new DOMElement('[data-testid="artist-row-role"]')
            .withId('credits-row-role'),

        // List Row - Title (Queue, etc.)
        new DOMElement('[data-encore-id="listRowTitle"] > span')
            .withId('list-row-title')
            .asDetached(),

        // List Row - Subtitle Link (Queue Artist)
        new DOMElement('[data-encore-id="listRowSubtitle"] a')
            .withId('list-row-subtitle-link')
            .asDetached(),

        // List Row - Subtitle Text (No Link, e.g. 'Single • Artist')
        new DOMElement('[data-encore-id="listRowSubtitle"]:not(:has(a))')
            .withId('list-row-subtitle-text')
            .asDetached(),

        // Global Fallback - Entity Links (Search, Shelves, etc. without specific IDs)
        new DOMElement('a[href*="/album/"] [data-encore-id="text"], a[href*="/artist/"] [data-encore-id="text"], a[href*="/playlist/"] [data-encore-id="text"]')
            .withId('global-entity-link')
            .asDetached()
    ];
}
