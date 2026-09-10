# Free QR Generator

Live demo: **https://afnan-samin.github.io/free_qr/**

100% free. No signup. Mobile friendly. Open source (MIT).

![QR Demo](https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://afnan-samin.github.io/free_qr/)

## Features

1. **Single QR code** — Link/Text, **WiFi** (name, password, security type), **Contact card** (name, phone, email) with instant preview
2. **Logo in the center** — add your brand logo (square PNG works best, max 2MB)
3. **Styles** — dots, rounded, classy; custom colors and background; 256 / 512 / 1024px
4. **Download** — `PNG` • `JPG` • `SVG` (best for print) • `PDF`
5. **Bulk QR codes** — upload a `.csv` / `.txt` file or paste a list (one per line) → up to 200 codes → download as **ZIP (PNG)**
6. **History** — your last 20 QR codes are saved in the browser, reload or delete anytime

## How to use

Just open `index.html` — no build step. Ready to deploy on GitHub Pages.

```bash
git clone https://github.com/afnan-samin/free_qr.git
cd free_qr
# then open index.html in a browser
```

Bulk file format (`bulk-sample.txt`):

```text
https://site1.com
https://site2.com
https://site3.com
```

## Built with

- [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) — styled QR codes with logo
- [JSZip](https://stuk.github.io/jszip/) + [FileSaver.js](https://github.com/eligrey/FileSaver.js/) — bulk ZIP download
- [jsPDF](https://github.com/parallax/jsPDF) — PDF export
- Plain HTML/CSS/JS, CDN only

## Repository checklist

- [x] MIT License
- [ ] Add the website link and topics in About: `qr-code` `javascript` `open-source` `github-pages` `bulk-qr`
- [ ] Add a screenshot or GIF to this README
- [ ] Keep the Issues tab enabled

## Contributing

Pull requests and issues are welcome — new QR types, dark mode, higher bulk limits, anything.

## License

MIT © Afnan Samin — free for personal and commercial use.
