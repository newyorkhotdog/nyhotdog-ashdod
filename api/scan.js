module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  try {
    // Parse body manually if needed
    let body = req.body;
    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "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",
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
