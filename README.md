# ⚡ Free QR Generator Pro

Live demo: **https://afnan-samin.github.io/free_qr/**

100% Free • No signup • Mobile friendly • Open Source (MIT)

![QR Demo](https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://afnan-samin.github.io/free_qr/)

## ✨ Features

1. **Single QR** — Text/URL, **WiFi** (SSID/pass/security), **vCard** (name/phone/email) → instant preview
2. **Logo in center** — brand logo/photo boshao (square PNG best, 2MB max)
3. **Styles** — dots / rounded / classy, custom color + background, 256 / 512 / 1024px
4. **Download** — `PNG` • `JPG` • `SVG` (print best) • `PDF`
5. **Bulk QR** — `.csv` / `.txt` upload ba paste (proti line-e 1 ta) → max 200 ta → **ZIP (PNG)** download
6. **History** — last 20 ta QR localStorage-e save, reload/delete/clear

## 🚀 Use

Just open `index.html` — no build step. GitHub Pages-e deploy ready.

```bash
git clone https://github.com/afnan-samin/free_qr.git
cd free_qr
# index.html open koro
```

Bulk file format (`bulk-sample.txt`):
```
https://site1.com
https://site2.com
BKash 017XXXXXXXX
```

## 🛠 Stack

- [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) — styled QR + logo
- [JSZip](https://stuk.github.io/jszip/) + [FileSaver.js](https://github.com/eligrey/FileSaver.js/) — bulk ZIP
- [jsPDF](https://github.com/parallax/jsPDF) — PDF export
- Pure HTML/CSS/JS, CDN only

## 📌 Repo tips (done checklist)

- [x] MIT License
- [ ] About-e website link + topics: `qr-code` `javascript` `open-source` `github-pages` `bulk-qr`
- [ ] README-te screenshot/GIF add koro
- [ ] Issues tab ON rakho

## 🤝 Contribute

PR / Issue welcome! Logo version, bulk limit barano, dark mode — jekono feature request dao.

## 📄 License

MIT © Afnan Samin — free for personal + commercial use.
