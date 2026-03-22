import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Content moderation — reject harmful content before hitting Claude
const POLICY_PATTERNS = [
  /\b(kill|murder|shoot|stab|bomb|attack|assault|rape|lynch|hang)\b/i,
  /\b(nigger|faggot|chink|spic|kike|wetback|tranny)\b/i,
  /\b(hate|destroy|eliminate|exterminate)\s+(all\s+)?(jews?|muslims?|blacks?|whites?|gays?|immigrants?)\b/i,
  /\b(go\s+die|kys|kill\s+yourself|end\s+your\s+life)\b/i,
  /\b(terrorist|jihad|isis|al.?qaeda)\b/i,
  /\b(child\s+porn|cp|csam|pedophil)\b/i,
];

function moderateContent(text) {
  for (const pattern of POLICY_PATTERNS) {
    if (pattern.test(text)) return false;
  }
  return true;
}

const SYSTEM_PROMPT = `You are a civic action assistant. A community member has described a problem in their neighborhood.
If an image is provided, describe what you see in detail and reference it in the formal letter with: The attached photograph shows...

IMPORTANT: If the complaint contains violent, hateful, abusive, or discriminatory language, respond with ONLY: {"error": "content_policy", "message": "Content violates community guidelines."}

You must do exactly 2 web searches maximum, then respond with ONLY a JSON object.

Step 1: Search for the current government official responsible for this issue type in the given city.
Step 2: Search for a relevant local law, ordinance, or statute number for this issue type.
Step 3: Respond with ONLY this JSON — no other text before or after:

{
  "issue_type": "one of: traffic_safety, street_lighting, road_maintenance, parks_facilities, noise_complaint, housing, utilities, other",
  "department": "exact real department name found via search",
  "official_name": "real current name and title found via search",
  "official_email": "real email address found via search",
  "location_extracted": "location mentioned in complaint",
  "urgency_score": "integer 1-10. Set 8-10 for safety issues (traffic, lighting, structural hazards). Set 6-7 for quality-of-life issues. Set 1-5 for minor inconveniences.",
  "formal_request": "the full formal letter text, 3-4 paragraphs, citing the real law or ordinance you found, written from the perspective of concerned residents. Sign as Concerned Residents."
}

CRITICAL: Your final response must be ONLY the JSON object. No markdown, no explanation, no text before or after the JSON.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { complaint, location, imageBase64, imageMediaType } = req.body;
  if (!complaint?.trim()) return res.status(400).json({ error: "No complaint" });

  // Content policy check
  if (!moderateContent(complaint)) {
    return res.status(400).json({
      error: "content_policy",
      message: "Your post contains content that violates our community guidelines. Civilian does not allow violent, hateful, or abusive language. Please describe your civic issue respectfully.",
    });
  }

  try {
    const userContent = [];
    if (imageBase64) {
      userContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type:  imageMediaType || "image/jpeg",
          data: imageBase64,
        },
      });
    }
    userContent.push({
      type: "text",
      text: `Community complaint: ${complaint}\n\nLocation: ${location || "Tempe, Arizona"}\n\nDo exactly 2 web searches, then respond with ONLY the JSON object described in your instructions.`,
    });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        }
      ],
      messages: [
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    // Get the last text block (after all tool use)
    const textBlock = message.content.findLast(block => block.type === "text");
    if (!textBlock) throw new Error("No text response from Claude");

    const raw = textBlock.text.trim();

    // Try direct parse first
    try {
      const data = JSON.parse(raw);
      return res.status(200).json(data);
    } catch {
      // Fall back to extracting JSON from text
      const jsonStart = raw.indexOf("{");
      const jsonEnd = raw.lastIndexOf("}");
      if (jsonStart === -1 || jsonEnd === -1) {
        console.error("Raw response:", raw);
        throw new Error("No JSON found in response");
      }
      const data = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
      return res.status(200).json(data);
    }
  } catch (err) {
    console.error("Claude API error:", err);
    return res.status(500).json({ error: err.message });
  }
}