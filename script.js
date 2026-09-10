let qrcode;

function generateQR() {
  const text = document.getElementById("qr-text").value;
  const color = document.getElementById("qr-color").value;
  
  if(!text) { alert("Age text likhun"); return; }
  
  document.getElementById("qrcode").innerHTML = "";
  
  qrcode = new QRCode(document.getElementById("qrcode"), {
    text: text,
    width: 256,
    height: 256,
    colorDark: color,
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

function downloadQR() {
  const img = document.querySelector("#qrcode img");
  if(!img) { alert("Age QR generate korun"); return; }
  
  const a = document.createElement('a');
  a.href = img.src;
  a.download = "qr-code.jpg";
  a.click();
}