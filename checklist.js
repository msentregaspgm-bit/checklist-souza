// Proxy compatível entre Vercel e Google Apps Script
export default async function handler(req, res) {
  const TARGET_URL =
    "https://script.google.com/macros/s/AKfycbyHPCOhlA55vbvak_KqdIEZtSBqRtvBC1l1kTY5vjN1tGm36arLV9GcJrfnzpwNS5-m/exec";

  try {
    // O Google Apps Script espera o corpo como texto puro
    const response = await fetch(TARGET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(req.body),
      redirect: "follow",
    });

    const text = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.status(200).json({ result: text });
  } catch (err) {
    console.error("Erro no proxy checklist.js:", err);
    res
      .status(500)
      .json({ error: "Erro no proxy da Vercel", details: err.message });
  }
}
