export default async function handler(req, res) {
  const TARGET_URL =
    "https://script.google.com/macros/s/AKfycbzW8O42NFSodM3lndtKoHl8kH7KC3BqeVz8zJhYuO4GEON0RVOKc6EjYVCkE5qLh-89/exec";

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
