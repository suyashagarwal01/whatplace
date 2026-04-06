# WhatPlace

A Chrome extension that identifies real-world locations from any image or video on the web with one click. Point it at a YouTube vlog, a travel photo, Google Street View, or any webpage — click **Find Location** and get the place name instantly.

Powered by **Google Gemini** vision AI. No backend server needed.

## Features

- **One-click location detection** — captures the visible tab as a screenshot and sends it to Gemini for identification
- **Works on any site** — YouTube, Vimeo, Instagram, Google Images, news articles, or any page with a visible image/video frame
- **Open in Google Maps** — click the result to view it on Maps
- **Automatic model fallback** — tries Gemini 2.5 Flash, 2.0 Flash, 1.5 Flash, and 1.5 Pro in order, so it works regardless of your API key's available models
- **Rate limit handling** — detects 429 errors and shows a 60-second cooldown timer
- **Clean MD3 UI** — Material Design 3 inspired popup with Inter font, soft blue primary palette

## How It Works

1. Click the WhatPlace extension icon on any webpage.
2. Press **Find Location**.
3. The extension captures a screenshot of the visible tab, sends it to the Gemini API with a vision prompt, and displays the identified location.

All processing goes through Google's Generative Language API. No data is stored by the extension.

## Setup

### 1. Get a Gemini API Key (free)

Go to [Google AI Studio](https://aistudio.google.com/apikey), sign in, and create an API key. The free tier is sufficient (~15 requests/minute, ~1500 requests/day).

### 2. Install the Extension

1. Open `chrome://extensions/` in Chrome.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select the `WhatPlace` project folder (the one containing `manifest.json`).

### 3. Set Your API Key

1. Click the WhatPlace extension icon.
2. Click **Settings (API key)** at the bottom.
3. Paste your Gemini API key and click **Save**.

## Project Structure

```
WhatPlace/
├── manifest.json          # Chrome Extension manifest (MV3)
├── package.json           # Dev dependencies (sharp for icon generation)
├── .env.example           # Example environment variables
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.css          # MD3-inspired styles (Inter, blue primary)
│   └── popup.js           # Tab capture, Gemini API calls, result display
├── options/
│   ├── options.html       # API key settings page
│   ├── options.css        # Settings page styles
│   └── options.js         # Save/load API key from chrome.storage.sync
├── icons/
│   ├── icon.svg           # Source SVG icon
│   ├── icon-source.png    # Source PNG
│   ├── icon16.png         # 16x16 toolbar icon
│   ├── icon48.png         # 48x48 icon
│   └── icon128.png        # 128x128 store icon
├── scripts/
│   └── generate-icons.js  # Generates PNG icons from source using sharp
└── .claude/
    └── settings.local.json # Claude Code local settings
```

## Tech Stack

- **Chrome Extension Manifest V3** — uses `activeTab`, `scripting`, and `storage` permissions
- **Google Gemini API** — vision model for location identification (direct API calls, no SDK)
- **Vanilla JS** — no frameworks, no build step
- **CSS** — custom Material Design 3 tokens, Inter font via Google Fonts

## Permissions

| Permission | Why |
|---|---|
| `activeTab` | Capture the visible tab screenshot when you click the button |
| `scripting` | Required for tab capture |
| `storage` | Store your API key locally (synced across your Chrome profile) |
| `host_permissions: <all_urls>` | Capture screenshots from any tab |
| `host_permissions: googleapis.com` | Call the Gemini API |

## Troubleshooting

| Issue | Fix |
|---|---|
| "API key not set" | Open Settings from the popup and save your Gemini API key |
| "Invalid API key or access denied" | Verify your key at [Google AI Studio](https://aistudio.google.com/apikey) |
| "Rate limit exceeded" | Free tier allows ~15 req/min. Wait for the cooldown timer |
| 404 / "model not found" | The extension tries multiple models automatically. If all fail, your key or region may not support them — regenerate at AI Studio |
| Wrong or no location | Pause the video on a clear shot of the place and try again |

## Customizing Icons

Replace the PNGs in `icons/` with your own, or edit `icons/icon.svg` and regenerate:

```bash
npm install
npm run generate-icons
```

## License

MIT
