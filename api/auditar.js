export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { prompt, maxTokens = 1500 } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt é obrigatório" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY não configurada" });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err?.error?.message || `Erro OpenAI ${response.status}`,
      });
    }

    const data = await response.json();
    const texto = data.choices?.[0]?.message?.content?.trim() || "";
    return res.status(200).json({ texto });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
