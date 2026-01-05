import { WebsiteProfile } from './core/WebsiteProfile';
import { SpotifyProfile } from './profiles/SpotifyProfile';

const profiles: WebsiteProfile[] = [new SpotifyProfile()];

export function getProfileForUrl(url: string): WebsiteProfile | undefined {
    return profiles.find((p) => p.matches(url));
}

export * from './core/DOMElement';
export * from './core/WebsiteProfile';
