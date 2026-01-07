# 🎵 UtaBridge

[![CI checks](https://github.com/kurayami07734/utabridge-browser-extension/actions/workflows/ci.yml/badge.svg)](https://github.com/kurayami07734/utabridge-browser-extension/actions/workflows/ci.yml)

**UtaBridge** is a browser extension that translates Japanese song titles, artist names, and album names on Spotify into readable romanized or translated text.

## ✨ What It Does

Ever been listening to a great J-Pop playlist and wished you could read the song titles? UtaBridge automatically:

- 🔤 **Romanizes** Japanese text (e.g., `夜に駆ける` → `Yoru ni Kakeru`)
- 🌐 **Translates** to English (e.g., `夜に駆ける` → `Racing into the Night`)
- 💬 **Shows both** – hover over any title to see the alternative version

## 🎬 Video Demo

https://github.com/user-attachments/assets/2fd5cb99-017f-40cc-8f6c-5c95cff94c82

## 🚀 Getting Started

### Installation

1. Download the latest release from the [Releases page](https://github.com/kurayami07734/utabridge-browser-extension/releases)
2. Unzip the file
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" (toggle in top right)
5. Click "Load unpacked" and select the unzipped folder
6. Open [Spotify Web Player](https://open.spotify.com) and enjoy!

### Usage

- **Toggle** the extension on/off from the popup menu
- **Switch** between showing romanization or translation as the primary display
- **Hover** over any translated text to see the alternative version

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

## 📖 Documentation

For detailed technical documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md).

## 🤝 Contributing

Contributions are welcome! Please read the [documentation](./DOCUMENTATION.md) first to understand the codebase.

## 📄 License

MIT License - see LICENSE file for details.
