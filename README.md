# Free QR Generator

Create styled, print-ready QR codes right in your browser — links, WiFi credentials, and contact cards. No signup, no server, no tracking.

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![No Signup](https://img.shields.io/badge/signup-not%20required-brightgreen.svg)](https://afnan-samin.github.io/free_qr/)
[![Client Side](https://img.shields.io/badge/100%25-client--side-blue.svg)](https://afnan-samin.github.io/free_qr/)
[![GitHub Pages](https://img.shields.io/badge/hosted-GitHub%20Pages-222222.svg)](https://afnan-samin.github.io/free_qr/)

**Live demo:** https://afnan-samin.github.io/free_qr/

![QR code linking to the live demo](https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://afnan-samin.github.io/free_qr/)

## Highlights

- **3 QR types** — Link/Text, WiFi login, and contact (vCard) cards
- **On-brand styling** — logo, dot styles, colors, and one-click brand presets
- **Print-ready export** — PNG, JPG, SVG (vector), and PDF up to 4096px
- **Bulk workflows** — 200 codes at once as ZIP or an A4 print sheet
- **Built-in scanner** — verify codes with camera, image upload, or clipboard paste
- **Private by design** — everything runs locally; nothing is ever uploaded

## Features

### Generate

- **Link / Text** — any URL or plain text with live preview
- **WiFi** — SSID, password, WPA / WEP / open security, and hidden-network support; scanning joins the network instantly
- **Contact card (vCard)** — name, digits-only phone validation, email, company, website, and address; scanning saves the contact in one tap
- **Auto scan-check** — every generated code is decoded in the background to warn you if a logo or color choice breaks scannability

### Customize

- 6 dot styles: square, dots, rounded, extra-rounded, classy, classy-rounded
- Custom QR and background colors with scannability guard (identical colors are rejected)
- Logo upload (PNG / JPG / SVG / WEBP, up to 2MB) — any aspect ratio is auto-fitted to a square, plus drag & drop and clipboard paste
- **Save / load brand preset** — colors, style, and logo stored locally
- Optional caption baked under the QR (PNG / JPG / PDF)

### Export

| Format | Best for |
| ------ | -------- |
| PNG / JPG | Sharing online, up to 4096px |
| SVG | Logos, banners, any zoom level (stays perfectly sharp) |
| PDF | Printing and paperwork |

### Bulk

- Paste a list or upload `.txt` / `.csv` (one entry per line, drag & drop supported) — up to 200 codes
- **Download all as ZIP** (PNG) with progress bar
- **A4 print sheet** (PDF, 20 labeled codes per page) for stickers and packaging

### Scan & History

- **Scan tab** — live camera decoding plus image upload, drag & drop, and clipboard paste; copy text or open links directly
- **Local history** — every code you generate stays in this browser only (localStorage), reopen or delete anytime, clear-all behind a confirmation

### Experience

- Dark / light theme (remembered per device)
- Fully responsive — full generator on mobile
- Toast notifications, confirm dialogs for destructive actions, per-field clear buttons

## How to use

No build step — it's plain HTML, CSS, and JavaScript via CDN.

```bash
git clone https://github.com/afnan-samin/free_qr.git
cd free_qr
# then open index.html in a browser
```

To host it yourself, deploy the folder as-is to GitHub Pages, Netlify, Vercel, or any static host.

### Bulk list format

One entry per line (`.csv` uses the first column):

```text
https://myshop.com/product-1
https://myshop.com/product-2
https://myshop.com/product-3
```

## Privacy

Everything runs client-side. Your links, passwords, contacts, logos, and history never leave your browser — history and presets live in `localStorage` only and disappear if site data is cleared or incognito mode is used.

## Built with

- [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) — styled QR rendering
- [jsQR](https://github.com/cozmo/jsQR) — camera / image decoding and scan verification
- [JSZip](https://stuk.github.io/jszip/) + [FileSaver.js](https://github.com/eligrey/FileSaver.js/) — bulk ZIP download
- [jsPDF](https://github.com/parallax/jsPDF) — PDF and print-sheet export
- Google Fonts (Plus Jakarta Sans, Inter, JetBrains Mono) — typography

## Project structure

```text
free_qr/
├── index.html   # markup for generator, bulk, history, and scan
├── style.css    # dark/light glassmorphism theme + responsive layout
├── script.js    # generation, bulk, history, scanning, presets
└── LICENSE      # MIT
```

## Contributing

Issues and pull requests are welcome — new QR types, export formats, accessibility, or performance ideas. Keep it dependency-light and client-side.

## License

MIT © Afnan Samin — free for personal and commercial use.
