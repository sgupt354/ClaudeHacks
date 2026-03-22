import { insforge } from "../../lib/insforge";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { id, alreadyEchoed } = req.body;

  // Server-side duplicate check via client-sent flag
  // (localStorage check is enforced client-side; this is a secondary guard)
  if (alreadyEchoed) {
    return res.status(400).json({ error: "You've already added your voice" });
  }

  // Skip DB update for fallback posts
  if (String(id).startsWith("fallback-")) {
    return res.status(200).json({ echo_count: null });
  }

  const { data: post, error: fetchError } = await insforge.database
    .from("posts")
    .select("echo_count")
    .eq("id", id)
    .single();

  if (fetchError) return res.status(200).json({ echo_count: null }); // graceful fallback

  const { data, error } = await insforge.database
    .from("posts")
    .update({ echo_count: post.echo_count + 1 })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(200).json({ echo_count: null }); // graceful fallback
  return res.status(200).json(data);
}
