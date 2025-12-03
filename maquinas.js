export default async function handler(req, res) {
  const API_URL = "https://script.google.com/macros/s/AKfycbw15T-ZOIYi4eeDxS5h8jfYDLCSIB38ujsDsGlz4H_NB_tZnvpthypXsjxkNbiAd5mq/exec";
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar máquinas", details: err.message });
  }
}
