import { insforge } from "../../lib/insforge";

export default async function handler(req, res) {
  const { q } = req.query;
  if (!q || q.length < 2) return res.status(200).json([]);

  try {
    const { data, error } = await insforge.database
      .from("posts")
      .select("*")
      .or(
        `complaint.ilike.%${q}%,location.ilike.%${q}%,issue_type.ilike.%${q}%,department.ilike.%${q}%`
      )
      .order("echo_count", { ascending: false })
      .limit(20);

    if (error) return res.status(200).json([]);
    return res.status(200).json(data || []);
  } catch {
    // Tunnel down — return empty array so client falls back to static data
    return res.status(200).json([]);
  }
}
