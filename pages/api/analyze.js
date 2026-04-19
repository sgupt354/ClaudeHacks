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

const SYSTEM_PROMPT = `You are a civic complaint classifier and letter writer for Civilian, a local government engagement platform.

STEP 1 — VALIDATE THE COMPLAINT
REJECT (rejected: true) if the complaint:
- Does not describe a specific, observable, physical local issue
- Does not include or imply a specific location
- Targets a named individual by name as the subject
- Expresses a political opinion rather than describing a problem
- Is a policy suggestion not a specific reportable issue
- Contains abusive, threatening, or discriminatory language
- Is outside local government jurisdiction
- The issue is on private property not maintained by the city (landlord disputes, HOA issues, interior building problems)
- The responsible authority is federal or state, not local government (post office, highways, federal buildings)
- The complaint is too vague to route to a specific department (no observable specific condition described)

ACCEPT (rejected: false) if the complaint describes a specific physical problem with a location that is within local government jurisdiction.

IF REJECTED return ONLY this JSON:
{"rejected": true, "reason": "<exactly one of: no_location | targets_individual | political_opinion | policy_suggestion | abusive_content | outside_jurisdiction | not_specific_enough | private_property_or_hoa | non_local_government | too_vague_to_route>", "reframe_suggestion": "<one specific sentence telling the user how to rewrite their complaint>"}

IF ACCEPTED do up to 3 web searches if needed to find a verified email:
"[location] [issue type] official report email"
Examples:
- "Tempe Arizona crosswalk report official email"
- "Phoenix Arizona pothole report official email"
- "London UK broken streetlight report official email"
- "Mumbai India road damage report official email"

Return the first real official government email address found.
Do not guess. Do not construct emails.
Only return an email you actually found in search results.
If nothing found, return empty string.

Also find the relevant local ordinance or statute number for this issue type.

Then return ONLY this JSON:
{"rejected": false, "issue_type": "<traffic_safety|street_lighting|road_maintenance|parks_facilities|noise_complaint|housing|utilities|sanitation|other>", "severity": "<critical|urgent|standard|suggestion>", "department": "<real department name from search>", "official_name": "<real name and title from search>", "official_email": "<verified .gov email from web search, or empty string if none verified>", "official_email_fallback": "<second verified .gov email from search, or empty string>", "email_source": "<search — URL where email was found, or empty string>", "location_extracted": "<location from complaint>", "urgency_score": <1-10>, "language": "<ISO 639-1 code of language user wrote in>", "formal_request": "<complete formal letter in same language user wrote in, 3-4 paragraphs, citing real ordinance found, signed as Concerned Residents>"}

LETTER WRITING RULES:
- Only describe what the resident explicitly reported. Do not fabricate or assume specific incidents, injuries, near-misses, or consequences that were not mentioned in the original complaint.
- Do not add dramatic language about foreseeable fatalities, injuries, or emergencies unless the resident specifically described them.
- Write factually based only on what was submitted.

CRITICAL: Response must be ONLY valid JSON. No markdown, no backticks, no text before or after. If any email not found, use empty string.`;

const KNOWN_DEPARTMENT_EMAILS = {
  street_lighting:  "StreetLightRequest@tempe.gov",
  road_maintenance: "streets@tempe.gov",
  traffic_safety:   "transportation@tempe.gov",
  parks_facilities: "parks@tempe.gov",
  utilities:        "utilities@tempe.gov",
  sanitation:       "sanitationservices@tempe.gov",
  noise_complaint:  "neighborhoods@tempe.gov",
  other:            "tempe311@tempe.gov",
};

const PHOENIX_EMAILS = {
  street_lighting:  "streetlights@phoenix.gov",
  road_maintenance: "streets@phoenix.gov",
  traffic_safety:   "traffic@phoenix.gov",
  parks_facilities: "parks@phoenix.gov",
  other:            "phxhelps@phoenix.gov",
};

function getCityFallback(issueType, location) {
  const loc = (location || "").toLowerCase();
  if (loc.includes("phoenix")) {
    return PHOENIX_EMAILS[issueType] || PHOENIX_EMAILS.other;
  }
  if (loc.includes("tempe") || !loc) {
    return KNOWN_DEPARTMENT_EMAILS[issueType] || KNOWN_DEPARTMENT_EMAILS.other;
  }
  return null;
}

function isGovEmail(email) {
  return typeof email === "string" && /\.(gov)(\/|$|:)|\.gov$/.test(email);
}

function applyEmailFallback(data, location) {
  if (data.rejected) return data;
  let officialEmail = typeof data.official_email === "string" && data.official_email.trim() ? data.official_email.trim() : "";
  if (!isGovEmail(officialEmail)) officialEmail = "";
  let officialFallback = typeof data.official_email_fallback === "string" && data.official_email_fallback.trim() ? data.official_email_fallback.trim() : "";
  if (!isGovEmail(officialFallback)) officialFallback = "";

  const next = { ...data, official_email: officialEmail, official_email_fallback: officialFallback };

  // If Claude found a verified email, keep it as-is
  if (officialEmail) {
    return { ...next, email_source: next.email_source || "search" };
  }
  // No email found — apply city fallback database
  const fallback = getCityFallback(data.issue_type, location);
  if (fallback) {
    return {
      ...next,
      official_email: fallback,
      official_email_fallback: officialFallback || "",
      email_source: "fallback_database",
    };
  }
  return { ...next, email_source: "not_found", email_not_found: true };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { complaint, location, imageBase64, imageMediaType, language, highSensitivity } = req.body;

  const sanitizedComplaint = String(complaint || "").slice(0, 2000).trim();
  const sanitizedLocation = String(location || "").slice(0, 200).trim();
  if (!sanitizedComplaint) return res.status(400).json({ error: "Complaint text is required" });

  // Content policy check
  if (!moderateContent(sanitizedComplaint)) {
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
      text: `Community complaint: ${sanitizedComplaint}\n\nLocation: ${sanitizedLocation || "Tempe, Arizona"}\n\nDo up to 3 web searches if needed as instructed, then respond with ONLY the JSON object described in your instructions.`,
    });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: highSensitivity
        ? `PRIVACY MODE: Before processing, strip any personally identifying details (names, phone numbers, addresses, emails, ID numbers) from the complaint. Do not include them in any output field.\n\n${SYSTEM_PROMPT}`
        : SYSTEM_PROMPT,
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

    console.log("Claude response blocks:", JSON.stringify(message.content.map(b => b.type)));

    // Get the last text block (after all tool use)
    const textBlock = message.content.findLast(block => block.type === "text");
    if (!textBlock) throw new Error("No text response from Claude");

    const raw = textBlock.text.trim();

    // Try direct parse first
    try {
      const data = JSON.parse(raw);
      return res.status(200).json(applyEmailFallback(data, sanitizedLocation));
    } catch {
      // Fall back to extracting JSON from text
      const jsonStart = raw.indexOf("{");
      const jsonEnd = raw.lastIndexOf("}");
      if (jsonStart === -1 || jsonEnd === -1) {
        console.error("Raw response:", raw);
        throw new Error("No JSON found in response");
      }
      const data = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
      return res.status(200).json(applyEmailFallback(data, sanitizedLocation));
    }
  } catch (err) {
    console.error("Claude API error:", JSON.stringify({
      message: err.message,
      status: err.status,
      raw: err?.error,
    }));
    return res.status(500).json({ 
      error: err.message,
      detail: err?.error || null 
    });
  }
}
