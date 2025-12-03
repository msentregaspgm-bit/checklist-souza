// Proxy da Vercel para enviar checklists ao Google Apps Script
export default async function handler(req, res) {
  const TARGET_URL = "https://script.google.com/macros/s/AKfycbzlHcLcPfDvlxythlC1VneFWmicWkTdTy9K1e-kCrDQV_VEPwIqNts2EKIg-k9gNeTL/exec";
  try {
    const response = await fetch(TARGET_URL, {
      method: "POST",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json,text/plain,*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.status(200).json({ result: text });
  } catch (err) {
    res.status(500).json({ error: "Erro no proxy Vercel", details: err.message });
  }
}
