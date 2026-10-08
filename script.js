/* Free QR Generator — qr-code-styling + wifi/vcard + history + bulk + scan */
let logoDataUrl = "";
let qrType = "text";
let currentPayload = "https://github.com/afnan-samin/free_qr";
const HIST_KEY = "freeqr_history_v1";
const THEME_KEY = "freeqr_theme";
const BRAND_KEY = "freeqr_brand_v1";

const $ = (id) => document.getElementById(id);
const TYPE_LABEL = { text: "Link", wifi: "WiFi", vcard: "Contact" };

/* ---------- notifications (stacked — several can show at once) ---------- */
const NOTIF_DURATION = 2500;

function notify(message, type) {
  const stack = $("notif-stack");
  const el = document.createElement("div");
  el.className = "notif notif-" + (type || "info");
  el.innerHTML =
    '<span class="notif-msg"></span>' +
    '<button class="notif-close" aria-label="Close">&times;</button>' +
    '<div class="notif-bar"></div>';
  el.querySelector(".notif-msg").textContent = message;
  stack.prepend(el);

  let dismissed = false;
  const timer = setTimeout(dismiss, NOTIF_DURATION);
  const bar = el.querySelector(".notif-bar");

  requestAnimationFrame(() => {
    el.classList.add("in");
    bar.style.transitionDuration = NOTIF_DURATION + "ms";
    requestAnimationFrame(() => { bar.style.width = "0%"; });
  });

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(timer);
    el.classList.remove("in");
    el.classList.add("out");
    setTimeout(() => el.remove(), 220);
  }
  el.querySelector(".notif-close").addEventListener("click", dismiss);
}

/* ---------- theme (dark / light) ---------- */
function applyTheme(mode) {
  document.documentElement.setAttribute("data-theme", mode);
  document.documentElement.style.colorScheme = mode;
}
function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch { /* private mode */ }
  applyTheme(saved === "light" ? "light" : "dark");
}
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch { /* private mode */ }
}
initTheme();

const qrCode = new QRCodeStyling({
  width: 300, height: 300, type: "canvas",
  data: currentPayload, image: "", margin: 10,
  qrOptions: { errorCorrectionLevel: "H" },
  dotsOptions: { color: "#000000", type: "classy-rounded" },
  cornersSquareOptions: { color: "#000000", type: "square" },
  cornersDotOptions: { color: "#000000", type: "square" },
  backgroundOptions: { color: "#ffffff" },
  imageOptions: { crossOrigin: "anonymous", margin: 6, imageSize: 0.4 }
});
qrCode.append($("qr-preview"));
qrCode._exportSize = 512;

/* ---------- QR types ---------- */
function setType(t) {
  qrType = t;
  document.querySelectorAll(".type-pill").forEach(b =>
    b.classList.toggle("active", b.dataset.type === t));
  $("form-text").classList.toggle("hidden", t !== "text");
  $("form-wifi").classList.toggle("hidden", t !== "wifi");
  $("form-vcard").classList.toggle("hidden", t !== "vcard");
  generateQR(true);
}

function escWifi(s) {
  return (s || "").replace(/([\\;,:"])/g, "\\$1");
}

$("wifi-enc").addEventListener("change", () => {
  $("wifi-pass").classList.toggle("hidden", $("wifi-enc").value === "nopass");
});

/* ---------- phone number: digits only ---------- */
let _phoneWarnLock = false;
$("vc-phone").addEventListener("input", (e) => {
  const clean = e.target.value.replace(/\D/g, "");
  if (clean !== e.target.value) {
    e.target.value = clean;
    if (!_phoneWarnLock) {
      _phoneWarnLock = true;
      notify("Only numbers are allowed in the phone number field", "error");
      setTimeout(() => { _phoneWarnLock = false; }, 1500);
    }
  }
});

function buildPayload() {
  if (qrType === "wifi") {
    const ssid = $("wifi-ssid").value.trim();
    const pass = $("wifi-pass").value;
    const enc = $("wifi-enc").value;
    const hidden = $("wifi-hidden").checked ? "true" : "false";
    if (!ssid) return { error: "Please enter the WiFi name" };
    if (enc === "nopass") return { data: `WIFI:T:nopass;S:${escWifi(ssid)};H:${hidden};;`, label: "WiFi: " + ssid };
    if (!pass) return { error: "Please enter the WiFi password (or choose No password)" };
    return { data: `WIFI:T:${enc};S:${escWifi(ssid)};P:${escWifi(pass)};H:${hidden};;`, label: "WiFi: " + ssid };
  }
  if (qrType === "vcard") {
    const name = $("vc-name").value.trim();
    const phone = $("vc-phone").value.trim();
    const email = $("vc-email").value.trim();
    const org = $("vc-org").value.trim();
    const url = $("vc-url").value.trim();
    const addr = $("vc-addr").value.trim();
    if (!name) return { error: "Please enter a name for the contact card" };
    if (!phone) return { error: "Please enter a phone number for the contact card" };
    const v = ["BEGIN:VCARD", "VERSION:3.0", `FN:${name}`, `TEL;TYPE=CELL:${phone}`];
    if (email) v.push(`EMAIL:${email}`);
    if (org) v.push(`ORG:${org}`);
    if (url) v.push(`URL:${url}`);
    if (addr) v.push(`ADR:;;${addr};;;;`);
    v.push("END:VCARD");
    return { data: v.join("\n"), label: "Contact: " + name };
  }
  const t = $("qr-text").value.trim();
  if (!t) return { error: "Please type a link or some text first" };
  return { data: t, label: t.length > 42 ? t.slice(0, 42) + "…" : t };
}

/* ---------- generate ---------- */
function generateQR(silent) {
  const built = buildPayload();
  if (built.error) {
    if (!silent) notify(built.error, "error");
    return false;
  }
  currentPayload = built.data;
  updateLinkPreview(currentPayload);
  const color = $("qr-color").value;
  const bg = $("qr-bg").value;
  const style = $("qr-style").value;
  if (color.toLowerCase() === bg.toLowerCase()) {
    if (!silent) notify("QR color and background are the same — it won't scan!", "error");
    return false;
  }
  qrCode.update({
    data: currentPayload, width: 300, height: 300,
    image: logoDataUrl || "",
    dotsOptions: { color, type: style },
    cornersSquareOptions: { color },
    cornersDotOptions: { color },
    backgroundOptions: { color: bg }
  });
  qrCode._exportSize = parseInt($("qr-size").value, 10);
  $("qr-payload").textContent = currentPayload.length > 90
    ? currentPayload.slice(0, 90) + "…" : currentPayload;
  if (!silent) {
    saveHistory(built.label, currentPayload);
    notify("QR code is ready", "success");
    verifyScanFromPreview();
  }
  return true;
}

// Shows the auto link-preview card below the generator only when the
// current QR payload is an http(s) link; hidden for WiFi, contact, or plain text.
function updateLinkPreview(payload) {
  const box = $("link-preview");
  if (!box) return;
  const url = (payload || "").trim();
  if (!/^https?:\/\//i.test(url)) { box.classList.add("hidden"); return; }
  const short = url.length > 80 ? url.slice(0, 80) + "…" : url;
  $("link-preview-url").textContent = short;
  $("link-preview-url").href = url;
  $("link-preview-open").href = url;
  if (isPanelVisible("panel-single")) box.classList.remove("hidden");
}
function copyLinkPreview() {
  const url = $("link-preview-url").href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => notify("Link copied to clipboard", "success"))
      .catch(() => notify("Couldn't copy — please select and copy the link manually", "error"));
  } else {
    notify("Copying isn't supported here — please select and copy the link manually", "error");
  }
}

// live preview (debounced)
let _t;
document.querySelectorAll("#panel-single input, #panel-single select").forEach(el => {
  el.addEventListener("input", () => {
    if (el.id === "qr-logo" || el.id === "qr-size") return;
    clearTimeout(_t);
    _t = setTimeout(() => generateQR(true), 450);
  });
});
$("qr-size").addEventListener("change", () => {
  qrCode._exportSize = parseInt($("qr-size").value, 10);
});

// clear-button visibility follows content
document.querySelectorAll("#form-text input, #form-wifi input, #form-wifi select, #form-vcard input").forEach((el) => {
  el.addEventListener("input", refreshClearButtons);
  el.addEventListener("change", refreshClearButtons);
});
$("bulk-text").addEventListener("input", refreshClearButtons);

/* ---------- scan-verify: decode the freshly-rendered preview and make sure
   it actually reads back the payload you typed. Catches the case where a
   big logo or low-contrast colors quietly broke the code. ---------- */
function verifyScanFromPreview() {
  if (typeof jsQR !== "function") return; // library failed to load — fail open, don't block the user
  const canvas = document.querySelector("#qr-preview canvas");
  if (!canvas) return;
  setTimeout(() => {
    try {
      const ctx = canvas.getContext("2d");
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imgData.data, canvas.width, canvas.height);
      if (!result || result.data !== currentPayload) {
        notify("Heads up: this QR might not scan reliably — try a smaller logo or higher-contrast colors.", "error");
      }
    } catch (e) {
      console.error("Scan verification skipped:", e);
    }
  }, 150);
}

/* ---------- logo (any ratio accepted, auto-fit to a square, up to 2MB) ---------- */
const LOGO_MAX_BYTES = 2 * 1024 * 1024;
const LOGO_DEFAULT_HINT = "Drag & drop or paste from clipboard · up to 2MB";

function handleLogoFile(f) {
  if (!f) return;
  if (!/^image\//.test(f.type || "")) {
    notify("Please choose an image file (PNG/JPG/SVG/WEBP)", "error");
    $("qr-logo").value = "";
    return;
  }
  if (f.size > LOGO_MAX_BYTES) {
    notify("That logo is too big — please keep it under 2MB", "error");
    $("qr-logo").value = "";
    return;
  }
  const r = new FileReader();
  r.onload = (ev) => {
    const dataUrl = ev.target.result;
    const img = new Image();
    img.onload = () => {
      squareFitLogo(img, (squaredDataUrl) => acceptLogo(squaredDataUrl, f.name));
    };
    img.onerror = () => {
      // Some browsers are picky loading certain SVGs as <img> — fall back
      // to the original file rather than blocking the upload entirely.
      acceptLogo(dataUrl, f.name);
    };
    img.src = dataUrl;
  };
  r.onerror = () => notify("Could not read the logo file", "error");
  r.readAsDataURL(f);
}
$("qr-logo").addEventListener("change", (e) => {
  handleLogoFile(e.target.files[0]);
});

// Draws any-ratio image centered onto a transparent square canvas ("contain"
// fit) so it always ends up perfectly 1:1 without stretching or cropping.
function squareFitLogo(img, done) {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (!w || !h || w === h) { done(img.src); return; }
  const side = Math.max(w, h);
  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext("2d");
  const dx = (side - w) / 2;
  const dy = (side - h) / 2;
  ctx.drawImage(img, dx, dy, w, h);
  try {
    done(canvas.toDataURL("image/png"));
  } catch {
    done(img.src); // e.g. a tainted canvas — fall back to the original
  }
}

function acceptLogo(dataUrl, filename) {
  logoDataUrl = dataUrl;
  $("btn-remove-logo").classList.remove("hidden");
  $("logo-filename").textContent = filename;
  generateQR(true);
  notify("Logo added", "success");
}
function removeLogo() {
  logoDataUrl = "";
  $("qr-logo").value = "";
  $("btn-remove-logo").classList.add("hidden");
  $("logo-filename").textContent = LOGO_DEFAULT_HINT;
  generateQR(true);
}

/* ---------- brand preset (color + background + style + logo) ---------- */
function saveBrandPreset() {
  const preset = {
    color: $("qr-color").value,
    bg: $("qr-bg").value,
    style: $("qr-style").value,
    logo: logoDataUrl || ""
  };
  try {
    localStorage.setItem(BRAND_KEY, JSON.stringify(preset));
    $("btn-load-brand").classList.remove("hidden");
    notify("Saved as your brand preset", "success");
  } catch {
    notify("Couldn't save the preset — your browser storage may be full", "error");
  }
}
function loadBrandPreset() {
  let p = null;
  try { p = JSON.parse(localStorage.getItem(BRAND_KEY) || "null"); } catch { /* ignore */ }
  if (!p) { notify("No saved brand preset yet", "error"); return; }
  $("qr-color").value = p.color || "#000000";
  $("qr-bg").value = p.bg || "#ffffff";
  $("qr-style").value = p.style || "classy-rounded";
  $("qr-color-hex").textContent = $("qr-color").value;
  $("qr-bg-hex").textContent = $("qr-bg").value;
  if (p.logo) {
    logoDataUrl = p.logo;
    $("btn-remove-logo").classList.remove("hidden");
    $("logo-filename").textContent = "Loaded from your saved brand";
  }
  generateQR(true);
  notify("Brand preset loaded", "success");
}
function initBrandPresetUI() {
  try {
    if (localStorage.getItem(BRAND_KEY)) $("btn-load-brand").classList.remove("hidden");
  } catch { /* private mode */ }
}

/* ---------- optional caption baked under the QR (PNG/JPG/PDF only) ---------- */
$("caption-toggle").addEventListener("change", () => {
  $("caption-text").classList.toggle("hidden", !$("caption-toggle").checked);
});

// Draws the QR image onto a taller canvas with an optional caption below —
// used so PNG/JPG/PDF exports can include a "Scan Me"-style label.
function drawCaptionedCanvas(img, size, captionText) {
  const padBottom = captionText ? Math.round(size * 0.14) : 0;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size + padBottom;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = $("qr-bg").value || "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, size, size);
  if (captionText) {
    ctx.fillStyle = $("qr-color").value || "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "600 " + Math.round(size * 0.055) + "px Inter, sans-serif";
    ctx.fillText(captionText, size / 2, size + padBottom / 2);
  }
  return canvas;
}

/* ---------- downloads ---------- */
async function downloadQR(ext) {
  if (!generateQR(true)) { notify("Please make a valid QR code first", "error"); return; }
  const size = qrCode._exportSize || 512;
  const name = "qr-" + Date.now();
  const wantCaption = $("caption-toggle").checked;
  const captionText = wantCaption ? ($("caption-text").value.trim() || "Scan Me") : "";

  try {
    if (ext === "svg") {
      // SVG stays a plain vector code — captions aren't baked in for this format.
      await qrCode.download({ name, extension: "svg" });
      const b = buildPayload();
      if (!b.error) saveHistory(b.label, currentPayload);
      notify("SVG downloaded", "success");
      return;
    }

    const rawExt = ext === "pdf" ? "png" : ext;
    const blob = await qrCode.getRawData(rawExt);
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
    const canvas = drawCaptionedCanvas(img, size, captionText);
    URL.revokeObjectURL(url);

    if (ext === "pdf") {
      const w = canvas.width, h = canvas.height;
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: "px", format: [w + 40, h + 40] });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 20, 20, w, h);
      pdf.setFontSize(9);
      pdf.text(window.location.href, (w + 40) / 2, h + 34, { align: "center" });
      pdf.save(name + ".pdf");
      notify("PDF downloaded", "success");
    } else {
      const mime = ext === "jpeg" ? "image/jpeg" : "image/png";
      await new Promise((resolve) => {
        canvas.toBlob((outBlob) => {
          saveAs(outBlob, name + "." + (ext === "jpeg" ? "jpg" : "png"));
          resolve();
        }, mime, 0.95);
      });
      notify(ext.toUpperCase() + " downloaded", "success");
    }

    const b = buildPayload();
    if (!b.error) saveHistory(b.label, currentPayload);
  } catch (e) {
    console.error("Download failed:", e);
    notify("Couldn't create that download — please try again.", "error");
  }
}

/* ---------- tabs ---------- */
function switchTab(which) {
  ["single", "bulk", "history", "scan"].forEach(k => {
    $("tab-" + k).classList.toggle("active", k === which);
    $("panel-" + k).classList.toggle("hidden", k !== which);
  });
  if (which === "history") renderHistory();
  if (which !== "scan") stopCamera();
  if (which === "single") updateLinkPreview(currentPayload);
  else $("link-preview").classList.add("hidden");
}

/* ---------- bulk ---------- */
function parseLines(text) {
  return text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
}
function refreshCount() {
  const n = parseLines($("bulk-text").value).length;
  $("bulk-count").textContent = n + (n === 1 ? " line" : " lines") + (n > 200 ? " (using the first 200)" : "");
}
$("bulk-text").addEventListener("input", refreshCount);
function handleBulkFile(f) {
  if (!f) return;
  if (f.size > 2 * 1024 * 1024) {
    notify("Please keep the file under 2MB", "error");
    $("bulk-file").value = "";
    return;
  }
  const r = new FileReader();
  r.onload = (ev) => {
    let txt = String(ev.target.result || "");
    if (/\.csv$/i.test(f.name)) {
      txt = txt.split(/\r?\n/).map(line => line.split(",")[0].trim().replace(/^"|"$/g, "")).join("\n");
    }
    $("bulk-text").value = txt;
    $("bulk-filename").textContent = f.name;
    refreshCount();
    notify("File loaded", "success");
  };
  r.onerror = () => notify("Could not read that file", "error");
  r.readAsText(f);
}
$("bulk-file").addEventListener("change", (e) => {
  handleBulkFile(e.target.files[0]);
});
function safeName(s, i) {
  const n = s.replace(/https?:\/\//, "").replace(/[^\w\-]+/g, "-").slice(0, 40) || ("qr-" + i);
  return (i + 1) + "-" + n + ".png";
}
async function generateBulk() {
  let lines = parseLines($("bulk-text").value);
  if (!lines.length) { notify("Upload a file or type a list first (one per line)", "error"); return; }
  if (lines.length > 200) lines = lines.slice(0, 200);
  const color = $("qr-color").value, bg = $("qr-bg").value, style = $("qr-style").value;
  const btn = $("btn-bulk");
  btn.disabled = true; btn.textContent = "Making ZIP, please wait...";
  const wrap = $("bulk-progress-wrap"), bar = $("bulk-progress");
  wrap.classList.remove("hidden");
  let okCount = 0, failCount = 0;
  try {
    const zip = new JSZip();
    for (let i = 0; i < lines.length; i++) {
      try {
        const q = new QRCodeStyling({
          width: 512, height: 512, type: "canvas", data: lines[i],
          image: logoDataUrl || "", margin: 10,
          qrOptions: { errorCorrectionLevel: "H" },
          dotsOptions: { color, type: style },
          backgroundOptions: { color: bg },
          imageOptions: { crossOrigin: "anonymous", margin: 6, imageSize: 0.4 }
        });
        const blob = await q.getRawData("png");
        zip.file(safeName(lines[i], i), blob);
        okCount++;
      } catch (itemErr) {
        console.error("Skipped a bulk line:", lines[i], itemErr);
        failCount++;
      }
      bar.style.width = Math.round(((i + 1) / lines.length) * 100) + "%";
    }
    if (!okCount) {
      notify("Couldn't create any QR codes from that list — please check the entries and try again.", "error");
    } else {
      const out = await zip.generateAsync({ type: "blob" });
      saveAs(out, "bulk-qr-" + Date.now() + ".zip");
      if (failCount) {
        notify(okCount + " QR codes downloaded — " + failCount + " entr" + (failCount === 1 ? "y" : "ies") + " couldn't be turned into a QR code and were skipped.", "info");
      } else {
        notify(okCount + " QR codes downloaded as ZIP", "success");
      }
    }
  } catch (e) {
    console.error("Bulk generation failed:", e);
    notify("Something went wrong preparing your ZIP file — please try again.", "error");
  }
  wrap.classList.add("hidden"); bar.style.width = "0%";
  btn.disabled = false; btn.textContent = "Download all as ZIP";
}

/* ---------- bulk: printable A4 label sheet (PDF, grid layout) ---------- */
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}
async function generateBulkSheet() {
  let lines = parseLines($("bulk-text").value);
  if (!lines.length) { notify("Upload a file or type a list first (one per line)", "error"); return; }
  if (lines.length > 200) lines = lines.slice(0, 200);
  const color = $("qr-color").value, bg = $("qr-bg").value, style = $("qr-style").value;
  const btn = $("btn-bulk-sheet");
  btn.disabled = true; btn.textContent = "Building sheet, please wait...";
  const wrap = $("bulk-progress-wrap"), bar = $("bulk-progress");
  wrap.classList.remove("hidden");

  const COLS = 4, ROWS = 5, PER_PAGE = COLS * ROWS;
  const PAGE_W = 210, PAGE_H = 297, MARGIN = 10; // A4, mm
  const cellW = (PAGE_W - MARGIN * 2) / COLS;
  const cellH = (PAGE_H - MARGIN * 2) / ROWS;
  const qrSize = Math.min(cellW, cellH) - 14;

  let okCount = 0, failCount = 0, placed = 0;
  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    for (let i = 0; i < lines.length; i++) {
      try {
        const q = new QRCodeStyling({
          width: 300, height: 300, type: "canvas", data: lines[i],
          image: logoDataUrl || "", margin: 8,
          qrOptions: { errorCorrectionLevel: "H" },
          dotsOptions: { color, type: style },
          backgroundOptions: { color: bg },
          imageOptions: { crossOrigin: "anonymous", margin: 6, imageSize: 0.4 }
        });
        const blob = await q.getRawData("png");
        const dataUrl = await blobToDataUrl(blob);

        if (placed > 0 && placed % PER_PAGE === 0) pdf.addPage();
        const posInPage = placed % PER_PAGE;
        const col = posInPage % COLS, row = Math.floor(posInPage / COLS);
        const x = MARGIN + col * cellW + (cellW - qrSize) / 2;
        const y = MARGIN + row * cellH + 2;
        pdf.addImage(dataUrl, "PNG", x, y, qrSize, qrSize);
        pdf.setFontSize(7);
        const label = lines[i].length > 28 ? lines[i].slice(0, 28) + "…" : lines[i];
        pdf.text(label, MARGIN + col * cellW + cellW / 2, y + qrSize + 5, { align: "center", maxWidth: cellW - 4 });

        placed++;
        okCount++;
      } catch (itemErr) {
        console.error("Skipped a sheet line:", lines[i], itemErr);
        failCount++;
      }
      bar.style.width = Math.round(((i + 1) / lines.length) * 100) + "%";
    }
    if (!okCount) {
      notify("Couldn't build a print sheet from that list — please check the entries and try again.", "error");
    } else {
      pdf.save("qr-sheet-" + Date.now() + ".pdf");
      notify(okCount + " QR codes laid out on a printable sheet" + (failCount ? " — " + failCount + " skipped" : ""), "success");
    }
  } catch (e) {
    console.error("Sheet generation failed:", e);
    notify("Something went wrong building the sheet — please try again.", "error");
  }
  wrap.classList.add("hidden"); bar.style.width = "0%";
  btn.disabled = false; btn.textContent = "Print sheet (A4 PDF, 20 per page)";
}

/* ---------- history (no cap — keeps everything this browser generates) ---------- */
function getHistory() {
  try { return JSON.parse(localStorage.getItem(HIST_KEY) || "[]"); }
  catch { return []; }
}
function saveHistory(label, data) {
  try {
    let h = getHistory().filter(x => x.data !== data);
    h.unshift({ label, data, time: Date.now(), type: qrType });
    localStorage.setItem(HIST_KEY, JSON.stringify(h));
    $("hist-badge").textContent = h.length;
  } catch { /* private mode / storage full */ }
}
function renderHistory() {
  const h = getHistory();
  $("hist-badge").textContent = h.length;
  const box = $("history-list");
  if (!h.length) {
    box.innerHTML = '<p class="empty">Nothing here yet — make your first QR code above.</p>';
    return;
  }
  box.innerHTML = "";
  h.forEach((x, i) => {
    const d = document.createElement("div");
    d.className = "hist-item";
    const date = new Date(x.time).toLocaleString();
    d.innerHTML = `<div class="hist-meta"><b></b><small></small></div>
      <div class="hist-actions"><button>Open</button><button class="del">X</button></div>`;
    d.querySelector("b").textContent = x.label;
    d.querySelector("small").textContent = (TYPE_LABEL[x.type] || "Link") + " • " + date;
    d.querySelector("button").onclick = () => {
      if (x.type && x.type !== qrType) setType(x.type);
      if (x.type === "text" || !x.type) $("qr-text").value = x.data.length < 200 ? x.data : "";
      currentPayload = x.data;
      qrCode.update({ data: currentPayload });
      $("qr-payload").textContent = x.data.slice(0, 90);
      switchTab("single");
      notify("Loaded from history", "success");
    };
    d.querySelector(".del").onclick = () => {
      const nh = getHistory(); nh.splice(i, 1);
      localStorage.setItem(HIST_KEY, JSON.stringify(nh));
      renderHistory();
    };
    box.appendChild(d);
  });
}
function clearHistory() {
  localStorage.removeItem(HIST_KEY);
  renderHistory();
  notify("History cleared", "success");
}

/* ---------- confirm modal (shared by every destructive "clear" action) ---------- */
let _confirmAction = null;
function showConfirm(opts) {
  $("confirm-title").textContent = opts.title || "Are you sure?";
  $("confirm-msg").textContent = opts.message || "This can't be undone.";
  $("confirm-ok").textContent = opts.okText || "Confirm";
  _confirmAction = typeof opts.onOk === "function" ? opts.onOk : null;
  $("confirm-modal").classList.remove("hidden");
}
function confirmClearHistory() {
  showConfirm({
    title: "Clear all history?",
    message: "This deletes every saved QR code from this browser. This can't be undone.",
    okText: "Delete all",
    onOk: clearHistory
  });
}
function hideConfirmModal() {
  $("confirm-modal").classList.add("hidden");
  _confirmAction = null;
}
$("confirm-cancel").addEventListener("click", hideConfirmModal);
$("confirm-ok").addEventListener("click", () => {
  const fn = _confirmAction;
  _confirmAction = null;
  $("confirm-modal").classList.add("hidden");
  if (fn) fn();
});
$("confirm-modal").addEventListener("click", (e) => {
  if (e.target.id === "confirm-modal") hideConfirmModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$("confirm-modal").classList.contains("hidden")) hideConfirmModal();
});

/* ---------- clear buttons (one per input mode, always behind a confirm) ---------- */
const CLEAR_LABEL = { text: "link / text", wifi: "WiFi details", vcard: "contact details", bulk: "bulk list" };
function hasInputContent(mode) {
  if (mode === "text") return $("qr-text").value.trim() !== "";
  if (mode === "wifi") return $("wifi-ssid").value.trim() !== "" || $("wifi-pass").value !== "" || $("wifi-hidden").checked;
  if (mode === "vcard") return ["vc-name", "vc-phone", "vc-email", "vc-org", "vc-url", "vc-addr"].some((id) => $(id).value.trim() !== "");
  if (mode === "bulk") return $("bulk-text").value.trim() !== "";
  return false;
}
function confirmClearInputs(mode) {
  if (!hasInputContent(mode)) { notify("Nothing to clear", "info"); return; }
  showConfirm({
    title: "Clear " + (CLEAR_LABEL[mode] || "inputs") + "?",
    message: "This removes everything you typed here. This can't be undone.",
    okText: "Clear",
    onOk: () => clearInputs(mode)
  });
}
function clearInputs(mode) {
  if (mode === "text") {
    $("qr-text").value = "";
    updateLinkPreview("");
  } else if (mode === "wifi") {
    $("wifi-ssid").value = "";
    $("wifi-pass").value = "";
    $("wifi-enc").value = "WPA";
    $("wifi-hidden").checked = false;
    $("wifi-pass").classList.remove("hidden");
  } else if (mode === "vcard") {
    ["vc-name", "vc-phone", "vc-email", "vc-org", "vc-url", "vc-addr"].forEach((id) => { $(id).value = ""; });
  } else if (mode === "bulk") {
    $("bulk-text").value = "";
    $("bulk-file").value = "";
    $("bulk-filename").textContent = "Drag & drop supported · one link per line";
    refreshCount();
  }
  refreshClearButtons();
  if (mode === "bulk") notify("Bulk list cleared", "success");
  else { generateQR(true); notify("Cleared", "success"); }
}
function refreshClearButtons() {
  const map = { text: "btn-clear-text", wifi: "btn-clear-wifi", vcard: "btn-clear-vcard", bulk: "btn-clear-bulk" };
  Object.keys(map).forEach((mode) => {
    const btn = $(map[mode]);
    if (btn) btn.classList.toggle("hidden", !hasInputContent(mode));
  });
}
function confirmClearScan() {
  if ($("scan-result").classList.contains("hidden")) { notify("Nothing to clear", "info"); return; }
  showConfirm({
    title: "Clear scan result?",
    message: "This removes the decoded text from the screen. This can't be undone.",
    okText: "Clear",
    onOk: () => {
      $("scan-result").classList.add("hidden");
      $("scan-result-text").textContent = "";
      $("scan-file").value = "";
      notify("Scan result cleared", "success");
    }
  });
}

/* ---------- scan: camera + upload-an-image decoding ---------- */
let scanStream = null;
let scanLoopId = null;

async function toggleCamera() {
  if (scanStream) { stopCamera(); return; }
  if (typeof jsQR !== "function") {
    notify("Scanner library failed to load — please refresh and try again.", "error");
    return;
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    notify("Your browser doesn't support camera access here — try uploading an image instead.", "error");
    return;
  }
  try {
    scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
  } catch (e) {
    notify("Couldn't access the camera — check your browser's camera permission.", "error");
    return;
  }
  const video = $("scan-video");
  video.srcObject = scanStream;
  video.classList.remove("hidden");
  try { await video.play(); } catch { /* some browsers auto-play once metadata loads */ }
  $("btn-cam-toggle").textContent = "Stop camera";
  scanLoop();
}
function stopCamera() {
  if (scanStream) {
    scanStream.getTracks().forEach((t) => t.stop());
    scanStream = null;
  }
  if (scanLoopId) { cancelAnimationFrame(scanLoopId); scanLoopId = null; }
  $("scan-video").classList.add("hidden");
  $("btn-cam-toggle").textContent = "Use camera";
}
function scanLoop() {
  const video = $("scan-video"), canvas = $("scan-canvas");
  if (!scanStream) return;
  if (video.readyState !== video.HAVE_ENOUGH_DATA) {
    scanLoopId = requestAnimationFrame(scanLoop);
    return;
  }
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = jsQR(imgData.data, canvas.width, canvas.height);
    if (result && result.data) {
      showScanResult(result.data);
      stopCamera();
      return;
    }
  } catch (e) {
    console.error("Camera scan frame skipped:", e);
  }
  scanLoopId = requestAnimationFrame(scanLoop);
}
function showScanResult(text) {
  $("scan-result").classList.remove("hidden");
  $("scan-result-text").textContent = text;
  const openLink = $("scan-open");
  if (/^https?:\/\//i.test(text)) {
    openLink.href = text;
    openLink.classList.remove("hidden");
  } else {
    openLink.classList.add("hidden");
  }
  notify("QR code decoded", "success");
}
$("scan-copy").addEventListener("click", () => {
  const text = $("scan-result-text").textContent;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => notify("Copied to clipboard", "success"))
      .catch(() => notify("Couldn't copy — please select and copy the text manually", "error"));
  } else {
    notify("Copying isn't supported here — please select and copy the text manually", "error");
  }
});
function handleScanFile(f) {
  if (!f) return;
  if (!/^image\//.test(f.type || "")) {
    notify("Please choose an image file (PNG/JPG/WEBP)", "error");
    $("scan-file").value = "";
    return;
  }
  if (typeof jsQR !== "function") {
    notify("Scanner library failed to load — please refresh and try again.", "error");
    return;
  }
  const url = URL.createObjectURL(f);
  const img = new Image();
  img.onload = () => {
    try {
      const canvas = $("scan-canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imgData.data, canvas.width, canvas.height);
      if (result && result.data) showScanResult(result.data);
      else notify("Couldn't find a QR code in that image", "error");
    } catch (err) {
      console.error("Image scan failed:", err);
      notify("Couldn't read that image — please try another one", "error");
    } finally {
      URL.revokeObjectURL(url);
      $("scan-file").value = "";
    }
  };
  img.onerror = () => {
    notify("Could not read that image", "error");
    URL.revokeObjectURL(url);
  };
  img.src = url;
}
$("scan-file").addEventListener("change", (e) => {
  handleScanFile(e.target.files[0]);
});

/* ---------- drag & drop + paste (screenshots) for all upload dropzones ---------- */
function wireDropzone(zoneId, onFile) {
  const zone = $(zoneId);
  if (!zone) return;
  if (!zone.hasAttribute("tabindex")) zone.setAttribute("tabindex", "0");
  zone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const targetId = zone.getAttribute("for");
      const input = targetId
        ? document.getElementById(targetId)
        : zone.querySelector('input[type="file"]');
      if (input) input.click();
    }
  });
  ["dragenter", "dragover"].forEach((ev) =>
    zone.addEventListener(ev, (e) => {
      e.preventDefault();
      zone.classList.add("dragover");
    })
  );
  ["dragleave", "drop"].forEach((ev) =>
    zone.addEventListener(ev, (e) => {
      e.preventDefault();
      if (ev === "dragleave" && e.relatedTarget && zone.contains(e.relatedTarget)) return;
      zone.classList.remove("dragover");
    })
  );
  zone.addEventListener("drop", (e) => {
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) onFile(f);
  });
}

function isPanelVisible(id) {
  const el = $(id);
  return !!(el && !el.classList.contains("hidden"));
}

wireDropzone("logo-dropzone", handleLogoFile);
wireDropzone("bulk-dropzone", handleBulkFile);
wireDropzone("scan-dropzone", handleScanFile);

// Clipboard paste (e.g. a screenshot): the pasted file goes to whichever upload panel is open.
document.addEventListener("paste", (e) => {
  const files = (e.clipboardData && e.clipboardData.files) || [];
  if (!files.length) return; // plain-text paste — let inputs handle it natively
  const f = files[0];
  const isImage = /^image\//.test(f.type || "");
  if (isPanelVisible("panel-scan") && isImage) {
    e.preventDefault();
    handleScanFile(f);
  } else if (isPanelVisible("panel-bulk") && !isImage) {
    e.preventDefault();
    handleBulkFile(f);
  } else if (isPanelVisible("panel-single") && isImage) {
    e.preventDefault();
    handleLogoFile(f);
  }
});

/* ---------- init ---------- */
$("hist-badge").textContent = getHistory().length;
refreshCount();
initBrandPresetUI();
generateQR(true);
refreshClearButtons();
