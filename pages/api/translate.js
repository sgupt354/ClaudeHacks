import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const LANGUAGE_NAMES = {
  es: "Spanish", fr: "French", de: "German", pt: "Portuguese",
  zh: "Chinese (Simplified)", ar: "Arabic", hi: "Hindi", vi: "Vietnamese",
  tl: "Filipino (Tagalog)", ko: "Korean", ht: "Haitian Creole", so: "Somali",
  am: "Amharic", ru: "Russian", ja: "Japanese", ta: "Tamil", mr: "Marathi",
  te: "Telugu", ca: "Catalan", eu: "Basque", gl: "Galician", hu: "Hungarian",
  it: "Italian", nl: "Dutch", pl: "Polish", uk: "Ukrainian",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage) return res.status(400).json({ error: "Missing fields" });

  const langName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: `Translate this formal government letter to ${langName}. Keep it formal and professional. Return ONLY the translated text, nothing else:\n\n${text}`,
      }],
    });
    return res.status(200).json({ translation: message.content[0].text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
