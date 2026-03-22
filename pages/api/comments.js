import { insforge } from "../../lib/supabase";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({ error: "postId is required" });
    }

    const { data, error } = await insforge.database
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { post_id, text, author_name } = req.body;

    if (!post_id || !text) {
      return res.status(400).json({ error: "post_id and text are required" });
    }

    const { data, error } = await insforge.database
      .from("comments")
      .insert([
        {
          post_id,
          text,
          author_name: author_name || "Anonymous",
        },
      ])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).end();
}
