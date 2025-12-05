// Proxy CORS Anywhere para listar máquinas do Apps Script
export default async function handler(req, res) {
  const TARGET_URL =
    "https://script.google.com/macros/s/AKfycbykn3KYg8LpGoIKTAD4RcGa_9Zuu59L4Xz0BOwHsHahmKx0J5tEGS6zQkF9IksOMzIm/exec";

  try {
    const response = await fetch(TARGET_URL, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json,text/plain,*/*"
      }
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = [];
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.status(200).json(data);
  } catch (err) {
    console.error("Erro proxy máquinas:", err);
    res.status(500).json({ error: "Erro no proxy Vercel", details: err.message });
  }
}
