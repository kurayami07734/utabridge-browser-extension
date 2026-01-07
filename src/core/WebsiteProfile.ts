import { DOMElement } from './DOMElement';

export interface WebsiteProfile {
    name: string;
    elements: DOMElement[];

    /**
     * Check if this profile applies to the given URL
     */
    matches(url: string): boolean;
}
