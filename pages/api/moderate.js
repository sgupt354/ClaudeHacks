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
        content: `You are reviewing a message that a citizen wants to submit to their local government on a civic complaints platform.

Read the message and decide: is this appropriate to send to a government official?

Respond with ONLY: {"allowed": true/false, "reason": "one sentence"}

Use your judgment. A good civic complaint is respectful and describes a real problem. Messages that are disrespectful, insulting, abusive, threatening, or have no legitimate civic purpose should not be sent to officials.

Message: "${complaint.slice(0, 500)}"`,
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
