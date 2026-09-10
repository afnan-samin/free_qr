/* Free QR Generator — qr-code-styling + wifi/vcard + history + bulk */
let logoDataUrl = "";
let qrType = "text";
let currentPayload = "https://github.com/afnan-samin/free_qr";
const HIST_KEY = "freeqr_history_v1";
const HIST_MAX = 20;

const $ = (id) => document.getElementById(id);
const TYPE_LABEL = { text: "Link", wifi: "WiFi", vcard: "Contact" };

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 2600);
}

const qrCode = new QRCodeStyling({
  width: 300, height: 300, type: "canvas",
  data: currentPayload, image: "", margin: 10,
  qrOptions: { errorCorrectionLevel: "H" },
  dotsOptions: { color: "#000000", type: "dots" },
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
    if (!silent) toast(built.error);
    return false;
  }
  currentPayload = built.data;
  const color = $("qr-color").value;
  const bg = $("qr-bg").value;
  const style = $("qr-style").value;
  if (color.toLowerCase() === bg.toLowerCase()) {
    toast("QR color and background are the same — it won't scan!");
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
    toast("QR code is ready");
  }
  return true;
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

/* ---------- logo ---------- */
$("qr-logo").addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (!f) return;
  if (!/^image\//.test(f.type)) { toast("Please choose an image file (PNG/JPG/SVG)"); return; }
  if (f.size > 2 * 1024 * 1024) { toast("Please keep the logo under 2MB (square PNG works best)"); return; }
  const r = new FileReader();
  r.onload = (ev) => {
    logoDataUrl = ev.target.result;
    $("btn-remove-logo").classList.remove("hidden");
    generateQR(true);
    toast("Logo added");
  };
  r.onerror = () => toast("Could not read the logo file");
  r.readAsDataURL(f);
});
function removeLogo() {
  logoDataUrl = "";
  $("qr-logo").value = "";
  $("btn-remove-logo").classList.add("hidden");
  generateQR(true);
}

/* ---------- downloads ---------- */
async function downloadQR(ext) {
  if (!generateQR(true)) { toast("Please make a valid QR code first"); return; }
  const size = qrCode._exportSize || 512;
  const name = "qr-" + Date.now();
  try {
    if (ext === "pdf") {
      const blob = await qrCode.getBlob("png");
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.src = url;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: "px", format: [size + 40, size + 96] });
      pdf.setFontSize(16);
      pdf.text("Scan Me", (size + 40) / 2, 28, { align: "center" });
      pdf.addImage(img, "PNG", 20, 44, size, size);
      pdf.setFontSize(9);
      pdf.text(window.location.href, (size + 40) / 2, size + 72, { align: "center" });
      pdf.save(name + ".pdf");
      URL.revokeObjectURL(url);
      toast("PDF downloaded");
      return;
    }
    await qrCode.download({ name, extension: ext });
    const b = buildPayload();
    if (!b.error) saveHistory(b.label, currentPayload);
    toast(ext.toUpperCase() + " downloaded");
  } catch (e) { toast("Download failed: " + e.message); }
}

/* ---------- tabs ---------- */
function switchTab(which) {
  ["single", "bulk", "history"].forEach(k => {
    $("tab-" + k).classList.toggle("active", k === which);
    $("panel-" + k).classList.toggle("hidden", k !== which);
  });
  if (which === "history") renderHistory();
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
$("bulk-file").addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (!f) return;
  if (f.size > 2 * 1024 * 1024) { toast("Please keep the file under 2MB"); return; }
  const r = new FileReader();
  r.onload = (ev) => {
    let txt = String(ev.target.result || "");
    if (/\.csv$/i.test(f.name)) {
      txt = txt.split(/\r?\n/).map(line => line.split(",")[0].trim().replace(/^"|"$/g, "")).join("\n");
    }
    $("bulk-text").value = txt;
    refreshCount();
    toast("File loaded");
  };
  r.readAsText(f);
});
function safeName(s, i) {
  const n = s.replace(/https?:\/\//, "").replace(/[^\w\-]+/g, "-").slice(0, 40) || ("qr-" + i);
  return (i + 1) + "-" + n + ".png";
}
async function generateBulk() {
  let lines = parseLines($("bulk-text").value);
  if (!lines.length) { toast("Upload a file or type a list first (one per line)"); return; }
  if (lines.length > 200) lines = lines.slice(0, 200);
  const color = $("qr-color").value, bg = $("qr-bg").value, style = $("qr-style").value;
  const btn = $("btn-bulk");
  btn.disabled = true; btn.textContent = "Making ZIP, please wait...";
  const wrap = $("bulk-progress-wrap"), bar = $("bulk-progress");
  wrap.classList.remove("hidden");
  try {
    const zip = new JSZip();
    for (let i = 0; i < lines.length; i++) {
      const q = new QRCodeStyling({
        width: 512, height: 512, type: "canvas", data: lines[i],
        image: logoDataUrl || "", margin: 10,
        qrOptions: { errorCorrectionLevel: "H" },
        dotsOptions: { color, type: style },
        backgroundOptions: { color: bg },
        imageOptions: { crossOrigin: "anonymous", margin: 6, imageSize: 0.4 }
      });
      const blob = await q.getBlob("png");
      zip.file(safeName(lines[i], i), blob);
      bar.style.width = Math.round(((i + 1) / lines.length) * 100) + "%";
    }
    const out = await zip.generateAsync({ type: "blob" });
    saveAs(out, "bulk-qr-" + Date.now() + ".zip");
    toast(lines.length + " QR codes downloaded as ZIP");
  } catch (e) { toast("Bulk failed: " + e.message); }
  wrap.classList.add("hidden"); bar.style.width = "0%";
  btn.disabled = false; btn.textContent = "Download all as ZIP";
}

/* ---------- history ---------- */
function getHistory() {
  try { return JSON.parse(localStorage.getItem(HIST_KEY) || "[]"); }
  catch { return []; }
}
function saveHistory(label, data) {
  try {
    let h = getHistory().filter(x => x.data !== data);
    h.unshift({ label, data, time: Date.now(), type: qrType });
    h = h.slice(0, HIST_MAX);
    localStorage.setItem(HIST_KEY, JSON.stringify(h));
    $("hist-badge").textContent = h.length;
  } catch { /* private mode */ }
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
      toast("Loaded from history");
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
  toast("History cleared");
}

/* ---------- init ---------- */
$("hist-badge").textContent = getHistory().length;
refreshCount();
generateQR(true);
