module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Debug endpoint - GET request shows us what the server sees
  if (req.method === "GET") {
    const key = process.env.ANTHROPIC_API_KEY || "NOT SET";
    return res.status(200).json({ 
      keySet: !!process.env.ANTHROPIC_API_KEY,
      keyStart: key.substring(0, 20),
      keyEnd: key.substring(key.length - 6)
    });
  }

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    res.status(200).send(text);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
