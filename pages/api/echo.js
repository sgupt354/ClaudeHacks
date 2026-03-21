import { insforge } from "../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { id } = req.body;

  // Get current count
  const { data: post, error: fetchError } = await insforge.database
    .from("posts")
    .select("echo_count")
    .eq("id", id)
    .single();

  if (fetchError) return res.status(500).json({ error: fetchError.message });

  // Increment
  const { data, error } = await insforge.database
    .from("posts")
    .update({ echo_count: post.echo_count + 1 })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
}
