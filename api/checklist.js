export default async function handler(req, res) {
  const TARGET_URL =
    "https://script.google.com/macros/s/AKfycbyJbwS4d9c14RHrTNBjbrRlTQfZg3728tzSDOvH_kxBvenJrD4xn1wS7UGJsh7nS3VE/exec";

  try {
    const response = await fetch(TARGET_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(req.body)
    });
    const text = await response.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ result: text });
  } catch (err) {
    console.error("Erro no proxy:", err);
    res.status(500).json({ error: "Erro no proxy da Vercel", details: err.message });
  }
}
