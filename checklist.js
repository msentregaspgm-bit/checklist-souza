export default async function handler(req, res) {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbw15T-ZOIYi4eeDxS5h8jfYDLCSIB38ujsDsGlz4H_NB_tZnvpthypXsjxkNbiAd5mq/exec";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
      redirect: "follow",
    });

    const text = await response.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ result: text });
  } catch (err) {
    res.status(500).json({
      error: "Erro ao enviar checklist",
      details: err.message,
    });
  }
}
