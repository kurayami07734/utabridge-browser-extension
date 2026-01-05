# UtaBridge

[![CI checks](https://github.com/kurayami07734/utabridge-browser-extension/actions/workflows/ci.yml/badge.svg)](https://github.com/kurayami07734/utabridge-browser-extension/actions/workflows/ci.yml)

A project to help non-japanese speakers read the song titles, artist titles
and more in their native script. Originally intended to be used with spotify.

## Architecture

This extension uses a profile-based architecture to manage element targeting across different websites.

### Class Hierarchy

- **`WebsiteProfile`** (`strategies/core/WebsiteProfile.ts`)
    - Defines the contract for a website configuration.
    - Each profile supports a specific domain (e.g., `open.spotify.com`) and contains a list of targeted elements.

- **`SpotifyProfile`** (`strategies/profiles/SpotifyProfile.ts`)
    - The concrete implementation for Spotify.
    - Defines the list of all UI elements (strategies) that UtaBridge interacts with on Spotify.

- **`DOMElement`** (`strategies/core/DOMElement.ts`)
    - Represents a single targetable UI component (e.g., "Now Playing Title", "Track Row").
    - **Fluent API**: Configured via chainable methods (e.g., `.withId(...)`, `.asDetached()`).
    - **Injection Logic**: Handles creating the React mount point, either as a sibling (standard) or appended to the body (detached).

### Core Concepts

- **Standard Injection**: The tooltip anchor is injected directly next to the target element in the DOM. Used for static content.
- **Detached Injection** (`.asDetached()`): The tooltip anchor is injected into `document.body`. This is required for React-heavy UIs (like Spotify) where modifying the React-managed DOM structure directly can cause crashes or content implementation issues.
