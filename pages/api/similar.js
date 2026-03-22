import { insforge } from "../../lib/insforge";

function extractRegion(loc) {
  if (!loc) return null;
  const lower = loc.toLowerCase();
  const parts = lower.split(",").map(p => p.trim());
  return parts[parts.length - 2] || parts[0] || lower;
}

function regionsMatch(loc1, loc2) {
  if (!loc1 || !loc2) return false;
  const r1 = extractRegion(loc1);
  const r2 = extractRegion(loc2);
  if (!r1 || !r2) return false;
  return r1.includes(r2) || r2.includes(r1) ||
    r1.split(" ").some(word => word.length > 3 && r2.includes(word));
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const { text, location, issue_type } = req.query;
  if (!text && !location) return res.status(200).json([]);

  try {
    const { data: posts, error } = await insforge.database
      .from("posts")
      .select("id, complaint, location, issue_type, echo_count")
      .order("echo_count", { ascending: false });

    if (error || !posts) return res.status(200).json([]);

    const similar = posts.filter(post => {
      const locationMatch = regionsMatch(location || "", post.location);
      const issueMatch = issue_type ? post.issue_type === issue_type : true;
      return locationMatch && issueMatch;
    });

    return res.status(200).json(similar.slice(0, 3));
  } catch (err) {
    console.error("Similar API error:", err);
    return res.status(200).json([]);
  }
}
