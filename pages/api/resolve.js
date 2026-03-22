import { insforge } from "../../lib/insforge";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { id, status, resolution_note } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "id and status are required" });
    }

    const updateData = {
      status,
    };

    if (resolution_note !== undefined) {
      updateData.resolution_note = resolution_note;
    }

    if (status === "resolved") {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await insforge.database
      .from("posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).end();
}
