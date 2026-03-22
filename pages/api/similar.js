import { insforge } from "../../lib/supabase";
import { FORUM_THREADS } from "../../lib/civicData";

// Extract location keywords for fuzzy matching
function locationKeywords(loc = "") {
  return loc.toLowerCase().replace(/[,\.]/g, " ").split(/\s+/).filter(w => w.length > 3);
}

function locationsOverlap(a, b) {
  const ka = locationKeywords(a);
  const kb = locationKeywords(b);
  return ka.some(w => kb.includes(w));
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const { text = "", location = "" } = req.query;

  try {
    const { data: dbPosts } = await insforge.database.from("posts").select("id,complaint,location,issue_type,echo_count").order("echo_count", { ascending: false }).limit(100);
    const allPosts = [
      ...FORUM_THREADS.map(t => ({ id: t.id, complaint: t.text, location: t.location, issue_type: t.issueType, echo_count: t.support })),
      ...(Array.isArray(dbPosts) ? dbPosts : []),
    ];

    const textLower = text.toLowerCase();
    const scored = allPosts
      .map(p => {
        let score = 0;
        const pText = (p.complaint || "").toLowerCase();
        // Location overlap
        if (location && p.location && locationsOverlap(location, p.location)) score += 3;
        // Shared keywords (4+ chars)
        const words = textLower.split(/\s+/).filter(w => w.length > 4);
        words.forEach(w => { if (pText.includes(w)) score += 1; });
        return { ...p, score };
      })
      .filter(p => p.score >= 2)
      .sort((a, b) => b.score - a.score || b.echo_count - a.echo_count)
      .slice(0, 3);

    return res.status(200).json(scored);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
