# UtaBridge Technical Documentation

This document provides detailed technical documentation for developers who want to understand, maintain, or contribute to the UtaBridge browser extension.

## Table of Contents

- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Core Concepts](#core-concepts)
- [Source Code Reference](#source-code-reference)
    - [Entry Points](#entry-points)
    - [Components](#components)
    - [Hooks](#hooks)
    - [Services](#services)
    - [Core Classes](#core-classes)
    - [Profiles](#profiles)
    - [Utilities](#utilities)
- [Data Flow](#data-flow)
- [Testing](#testing)
- [Build & Development](#build--development)

---

## Project Structure

```
src/
├── entrypoints/           # WXT entry points
│   ├── background.ts      # Service worker (handles API calls)
│   ├── content.tsx        # Content script (injected into Spotify)
│   └── popup/             # Extension popup UI
│       ├── App.tsx
│       ├── index.html
│       └── main.tsx
├── components/            # React components
│   ├── SongReplacer.tsx   # Main translation replacement component
│   └── Tooltip.tsx        # Reusable tooltip component
├── hooks/                 # Custom React hooks
│   ├── useDomObserver.ts  # Discovers target elements on page
│   ├── useDisplayPreference.ts
│   ├── useElementText.ts
│   ├── useTranslation.ts
│   ├── useTooltip.ts
│   └── useDOMReplacement.ts
├── services/              # Business logic & API
│   ├── api.ts             # API client for translation backend
│   ├── RequestQueue.ts    # Concurrency limiter for API calls
│   └── TranslationService.ts  # Cache & messaging layer
├── core/                  # Core element detection classes
│   ├── DOMElement.ts      # Represents a targetable UI element
│   └── WebsiteProfile.ts  # Interface for website configurations
├── profiles/              # Website-specific configurations
│   └── SpotifyProfile.ts  # Spotify element definitions
├── utils/                 # Shared utilities
│   ├── dom.ts             # DOM manipulation helpers
│   ├── storage.ts         # Browser storage wrappers
│   ├── text.ts            # Text utilities (Japanese detection, etc.)
│   └── types.ts           # TypeScript type definitions
└── index.ts               # Profile registry & exports
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CONTENT SCRIPT                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌──────────────┐    ┌────────────────────┐  │
│  │ useDomObserver │→│ SongReplacer │→│ DOM Replacement    │  │
│  │ (finds elements)│  │ (orchestrates)│  │ (mutates page)     │  │
│  └─────────────┘    └──────────────┘    └────────────────────┘  │
│         ↓                  ↑                                     │
│  ┌─────────────┐    ┌──────────────┐                            │
│  │ SpotifyProfile │  │ TranslationService │←─ Cache (storage)   │
│  │ (element defs) │  │ (cache + messaging) │                    │
│  └─────────────┘    └──────────────┘                            │
│                            ↓ (message)                          │
├─────────────────────────────────────────────────────────────────┤
│                       BACKGROUND SCRIPT                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ Message Handler │→│ RequestQueue │→│ API Client   │       │
│  │ (receives reqs) │  │ (rate limits) │  │ (calls backend)│     │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                ↓                 │
│                                     ┌──────────────────┐        │
│                                     │ Translation API  │        │
│                                     │ (external backend)│       │
│                                     └──────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Concepts

### Profile-Based Element Targeting

UtaBridge uses a **profile-based architecture** to manage which UI elements to target on different websites.

- **`WebsiteProfile`**: Interface defining a website configuration with domain matching and element definitions.
- **`SpotifyProfile`**: Concrete implementation containing all Spotify-specific element selectors.
- **`DOMElement`**: Represents a single targetable UI component with configuration options.

### Injection Modes

1. **Standard Injection**: The React mount point is created as a sibling to the target element. Works for most static content.

2. **Detached Injection** (`.asDetached()`): The mount point is appended to `document.body`. Required for React-managed UIs (like Spotify) where modifying the DOM directly can cause crashes.

### Translation Flow

1. User loads Spotify → Content script runs
2. `useDomObserver` scans for elements matching profile selectors
3. For each element with Japanese text:
    - Check cache in `browser.storage.local`
    - If cached → display immediately
    - If not cached → show loading indicator, request from background
4. Background script calls translation API, stores result
5. Storage change triggers update in content script

---

## Source Code Reference

### Entry Points

#### `src/entrypoints/background.ts`

The service worker that runs in the background. Responsibilities:

- Listen for `REQUEST_TRANSLATION` messages from content scripts
- Queue translation requests to avoid rate limiting
- Call the translation API and store results in cache
- Handle concurrent request limiting via `RequestQueue`

#### `src/entrypoints/content.tsx`

The content script injected into Spotify pages. Responsibilities:

- Create the React root element for the extension
- Watch for extension enabled/disabled state
- Use `useDomObserver` to discover target elements
- Render `SongReplacer` components for each discovered element

#### `src/entrypoints/popup/`

The extension popup UI. Allows users to:

- Enable/disable the extension
- Switch between romanization and translation as primary display

---

### Components

#### `src/components/SongReplacer.tsx`

The main component that handles text replacement for a single element.

**Props:**

- `originalElement: HTMLElement` - The DOM element to modify
- `strategy: DOMElement` - Configuration for this element type

**Behavior:**

1. Watches for text changes on the element
2. Detects Japanese text using regex
3. Fetches translation from cache/API
4. Replaces element text with translation
5. Shows tooltip with secondary text on hover

#### `src/components/Tooltip.tsx`

A reusable portal-based tooltip component.

**Props:**

- `isVisible: boolean` - Whether to show the tooltip
- `position: { x: number, y: number }` - Screen position
- `placement: 'top' | 'bottom'` - Direction relative to anchor
- `children: ReactNode` - Tooltip content

---

### Hooks

#### `src/hooks/useDomObserver.ts`

Discovers target elements on the page matching profile selectors.

**Returns:** `DiscoveredTarget[]` - Array of found elements with metadata

**Behavior:**

- Uses MutationObserver to detect DOM changes
- Scans for elements matching current profile's selectors
- Creates mount points for React components
- Tracks processed elements to avoid duplicates

#### `src/hooks/useDisplayPreference.ts`

Watches the user's display preference (romanization or translation).

**Returns:** `PrimaryDisplay` - Either `'romanization'` or `'translation'`

#### `src/hooks/useElementText.ts`

Observes text changes on a DOM element.

**Parameters:**

- `originalElement: HTMLElement` - Element to watch
- `strategy: DOMElement` - Strategy for reading text

**Returns:**

- `currentText: string` - Current text content
- `lastReplacementRef: RefObject` - Tracks our last replacement

#### `src/hooks/useTranslation.ts`

Subscribes to translation updates from the TranslationService.

**Parameters:**

- `text: string` - Text to translate
- `enabled: boolean` - Whether to fetch translation

**Returns:**

- `translation: CachedTranslation | null`
- `isLoading: boolean`
- `reset: () => void`

#### `src/hooks/useTooltip.ts`

Manages tooltip visibility and positioning.

**Parameters:**

- `element: HTMLElement` - Anchor element
- `enabled: boolean` - Whether to enable tooltip
- `placement: TooltipPlacement` - Position direction

**Returns:**

- `isVisible: boolean`
- `position: { x: number, y: number }`
- `placement: TooltipPlacement`

#### `src/hooks/useDOMReplacement.ts`

Applies DOM text replacement based on translation state.

**Parameters:** Object containing originalElement, strategy, translation state, etc.

**Behavior:**

- Calculates display text based on user preference
- Shows loading indicator while fetching
- Replaces element text via strategy
- Restores original text on unmount

---

### Services

#### `src/services/TranslationService.ts`

Manages the translation cache and messaging layer.

**Static Methods:**

- `get(text: string): Promise<CachedTranslation | null>` - Fetch from cache
- `set(text: string, translation: CachedTranslation): Promise<void>` - Store in cache
- `observe(text: string, callback): () => void` - Subscribe to translation updates

**Cache Key Format:** `translation_{text}`

#### `src/services/RequestQueue.ts`

Limits concurrent API requests to prevent rate limiting.

**Constructor:** `new RequestQueue(maxConcurrent: number)`

**Methods:**

- `add(task: () => Promise<T>): Promise<T>` - Queue a task

#### `src/services/api.ts`

API client for the translation backend.

**Functions:**

- `fetchTranslation(text: string): Promise<TranslateResponse>` - Call translation API

---

### Core Classes

#### `src/core/DOMElement.ts`

Represents a targetable UI element with configuration.

**Properties:**

- `selector: string` - CSS selector to find elements
- `id: string` - Unique identifier for this element type
- `tooltipPlacement: TooltipPlacement` - Tooltip direction
- `isDetached: boolean` - Whether to use detached injection

**Fluent Methods:**

- `.withId(id: string)` - Set identifier
- `.withPlacement(placement)` - Set tooltip placement
- `.asDetached()` - Enable detached injection mode

**Methods:**

- `getOriginalText(element): string` - Extract text from element
- `applyReplacement(element, text): void` - Replace element text
- `mount(element): HTMLElement | null` - Create React mount point

#### `src/core/WebsiteProfile.ts`

Interface for website configurations.

**Properties:**

- `name: string` - Profile name
- `elements: DOMElement[]` - List of target elements

**Methods:**

- `matches(url: string): boolean` - Check if profile applies to URL

---

### Profiles

#### `src/profiles/SpotifyProfile.ts`

Defines all UI elements UtaBridge targets on Spotify.

**Elements Include:**

- Track list rows (playlists, albums)
- Now Playing widget (bottom bar)
- Now Playing view (sidebar)
- Entity headers (album/track pages)
- Artist pages
- Queue view
- And more...

---

### Utilities

#### `src/utils/text.ts`

Text processing utilities.

- `hasJapaneseText(text): boolean` - Detect Japanese characters
- `getPrimaryText(translation, pref): string` - Get primary display text
- `getSecondaryText(translation, pref): string` - Get tooltip text

#### `src/utils/types.ts`

TypeScript type definitions.

```typescript
interface CachedTranslation {
    translatedText: string;
    romanizedText: string;
}

type PrimaryDisplay = 'romanization' | 'translation';
```

#### `src/utils/storage.ts`

Browser storage wrappers using WXT's storage API.

- `isExtensionEnabled` - Toggle extension on/off
- `primaryDisplay` - User's display preference

#### `src/utils/dom.ts`

DOM manipulation helpers.

- Functions for creating mount points
- Constants like `UB_PROCESSED_ATTR`

---

## Data Flow

### Translation Request Flow

```
1. SongReplacer detects Japanese text "夜に駆ける"
2. useTranslation calls TranslationService.observe("夜に駆ける")
3. TranslationService checks cache → miss
4. TranslationService sends message to background:
   { type: "REQUEST_TRANSLATION", text: "夜に駆ける" }
5. Background receives message, adds to RequestQueue
6. RequestQueue calls api.fetchTranslation("夜に駆ける")
7. API returns { romanizedText: "Yoru ni Kakeru", translatedText: "Racing into the Night" }
8. Background calls TranslationService.set() to cache result
9. Storage change triggers observer callback in content script
10. SongReplacer updates display with translation
```

### User Preference Flow

```
1. User clicks popup toggle for "Translation" mode
2. primaryDisplay.setValue('translation') called
3. Storage update fires
4. useDisplayPreference hook receives new value
5. All SongReplacer components re-render with new preference
6. Text updates from "Yoru ni Kakeru" to "Racing into the Night"
```

---

## Testing

### Unit Tests (`tests/unit/`)

Run with: `pnpm test:unit`

- `TranslationService.test.ts` - Tests cache get/set/observe behavior

### E2E Tests (`tests/`)

Run with: `pnpm test:e2e`

- `locators.spec.ts` - Validates all Spotify element selectors against HTML fixtures
- `integration/installation.spec.ts` - Tests extension installation

### Test Fixtures (`tests/fixtures/`)

HTML snapshots of Spotify pages for testing selectors:

- `album_view.html`
- `artist_view.html`
- `playlist_view.html`
- `queue_open_view.html`
- `song_view.html`

---

## Build & Development

### Commands

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start development server with hot reload |
| `pnpm build`     | Build production extension               |
| `pnpm lint`      | Run ESLint                               |
| `pnpm format`    | Format code with Prettier                |
| `pnpm test`      | Run all tests                            |
| `pnpm test:unit` | Run unit tests only                      |
| `pnpm test:e2e`  | Run E2E tests only                       |

### Development Workflow

1. Run `pnpm dev` to start development server
2. Load `.output/chrome-mv3-dev` in Chrome as unpacked extension
3. Make changes - extension auto-reloads
4. Run `pnpm lint && pnpm test` before committing

### Environment Variables

Create `.env` file based on `.env.example`:

```
VITE_API_BASE_URL=https://your-api-endpoint.com
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and add tests
4. Ensure all checks pass: `pnpm build && pnpm lint && pnpm test`
5. Submit a pull request

---

## License

See LICENSE file in repository root.
