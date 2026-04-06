# CLAUDE.md

This file provides context for Claude Code when working on this project.

## Project Overview

WhatPlace is a Chrome Extension (Manifest V3) that identifies real-world locations from any visible image or video on a webpage using Google Gemini's vision API.

## Architecture

- **No build step** — vanilla JS, no bundler or framework
- **No backend** — the extension calls the Gemini API directly from the browser
- **Chrome APIs used**: `chrome.tabs.captureVisibleTab`, `chrome.storage.sync`, `chrome.runtime`
- **Gemini model fallback chain**: 2.5 Flash → 2.0 Flash → 1.5 Flash → 1.5 Pro (both v1 and v1beta endpoints)

## Key Files

- `popup/popup.js` — main logic: tab capture, Gemini API call, result display, rate limit cooldown
- `popup/popup.css` — Material Design 3 tokens and styles using Inter font
- `options/options.js` — API key save/load via `chrome.storage.sync`
- `manifest.json` — extension manifest (MV3)
- `scripts/generate-icons.js` — generates PNG icons from source using `sharp`

## Development

- Load as unpacked extension in `chrome://extensions/` with Developer mode on
- API key is stored per-user in Chrome sync storage, not in code
- `npm run generate-icons` regenerates icon PNGs (requires `npm install` for `sharp`)

## Conventions

- All JS uses strict mode IIFEs — no modules, no imports
- CSS uses custom properties for MD3 design tokens
- No TypeScript, no linting config — keep it simple
