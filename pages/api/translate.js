export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text, targetLanguage, targetLanguageName } = req.body;
  if (!text) return res.status(400).json({ error: "No text" });

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: `Translate the following formal civic complaint letter to ${targetLanguageName || targetLanguage}. Keep the same formal tone and structure. Preserve all proper nouns (names, addresses, law citations). Return ONLY the translated text, nothing else.\n\nText to translate:\n${text}`,
      }],
    });

    const translated = message.content[0].text.trim();
    return res.status(200).json({ translated });
  } catch (err) {
    console.error("Translation error:", err);
    return res.status(500).json({ error: err.message });
  }
}
