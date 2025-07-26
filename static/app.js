// FRONTEND hanya panggil backend Heroku (proxy)
const SEG_URL = "/segment";
const CLS_URL = "/classify";

const fileInput = document.getElementById("fileInput");
const btnRun    = document.getElementById("btnRun");
const imgCrop   = document.getElementById("crop");
const preResult = document.getElementById("result");

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

btnRun.onclick = async () => {
  if (!fileInput.files.length) {
    alert("Pilih gambar terlebih dulu!");
    return;
  }

  btnRun.disabled = true;
  preResult.textContent = "⏳ Processing…";

  try {
    const imgB64 = await fileToBase64(fileInput.files[0]);

    // 1. Panggil backend /segment
    const segRes = await fetch(SEG_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_b64: imgB64 })
    }).then(r => r.json());

    if (!segRes.crop) throw new Error("Segmentation error");
    imgCrop.src = "data:image/png;base64," + segRes.crop;

    // 2. Panggil backend /classify
    const clsRes = await fetch(CLS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_b64: segRes.crop })
    }).then(r => r.json());

    if (clsRes.error) throw new Error("Classification error");

    preResult.textContent =
      `Prediction : ${clsRes.predicted}\n` +
      `Confidence : ${clsRes.confidence}%`;

  } catch (err) {
    console.error(err);
    preResult.textContent = err.message || "Unexpected error";
  } finally {
    btnRun.disabled = false;
  }
};
