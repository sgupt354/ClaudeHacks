import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Fast regex pre-check for obvious violations
const HARD_BLOCK = [
  /\b(kill|murder|shoot|stab|bomb|attack|assault|rape|lynch)\b/i,
  /\b(nigger|faggot|chink|spic|kike|wetback)\b/i,
  /\b(go\s+die|kys|kill\s+yourself)\b/i,
  /\b(child\s+porn|csam|pedophil)\b/i,
];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { text } = req.body;
  if (!text?.trim() || text.trim().length < 10) return res.status(200).json({ ok: true });

  // Hard block first (fast, no API call)
  for (const p of HARD_BLOCK) {
    if (p.test(text)) {
      return res.status(200).json({
        ok: false,
        message: "This content violates our community guidelines. Civilian does not allow violent, hateful, or abusive language.",
      });
    }
  }

  // Claude context-aware check for borderline content
  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      messages: [{
        role: "user",
        content: `You are a content moderator for a civic platform where residents report local government issues (potholes, broken lights, parks, etc.).

Review this text and respond with ONLY a JSON object:
{"ok": true} if the content is a legitimate civic complaint (even if frustrated or strongly worded)
{"ok": false, "message": "brief reason"} if it contains: hate speech, threats, personal attacks on private individuals, sexual content, spam, or is completely unrelated to civic issues.

Be lenient — frustrated residents venting about city problems is fine. Only flag genuinely harmful or irrelevant content.

Text to review: "${text.slice(0, 500)}"`,
      }],
    });

    const raw = msg.content[0]?.text?.trim() || '{"ok":true}';
    try {
      const result = JSON.parse(raw);
      return res.status(200).json(result);
    } catch {
      return res.status(200).json({ ok: true });
    }
  } catch {
    // On API error, allow through (fail open)
    return res.status(200).json({ ok: true });
  }
}
