import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { complaint } = req.body;
  if (!complaint?.trim() || complaint.trim().length < 3) {
    return res.status(200).json({ allowed: true, reason: "Too short to evaluate" });
  }

  try {
    const result = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      messages: [{
        role: "user",
        content: `You are a content moderator for a civic complaints platform.

Respond with ONLY: {"allowed": true/false, "reason": "one sentence"}

BLOCK (allowed: false) if the message contains ANY of the following, regardless of context:
- Insults or name-calling directed at any person or group (e.g. idiot, moron, stupid, dumb, fool, incompetent, useless, corrupt, clown, loser, trash, garbage when used about people)
- Hate speech, slurs, or discrimination based on race, religion, gender, ethnicity
- Threats of violence
- Sexual content
- Spam or gibberish

ALLOW (allowed: true) if the message:
- Describes a civic problem (road, light, park, noise, water, housing, safety, permits, trash, etc.) using respectful or neutral language
- Expresses frustration about a situation without insulting anyone ("this road is terrible", "the pothole has been there for months")

The standard: would this message be appropriate to send to a city official? If it contains any insult toward a person or group, block it.

Text: "${complaint.slice(0, 500)}"`,
      }],
    });

    const text = result.content[0].text.replace(/```json|```/g, "").trim();
    try {
      const data = JSON.parse(text);
      return res.status(200).json({ allowed: !!data.allowed, reason: data.reason || "" });
    } catch {
      return res.status(200).json({ allowed: true, reason: "Parse error — defaulting to allowed" });
    }
  } catch {
    return res.status(200).json({ allowed: true, reason: "API error — defaulting to allowed" });
  }
}
