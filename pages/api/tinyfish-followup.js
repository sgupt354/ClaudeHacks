import { insforge } from "../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { post_id } = req.body;
  if (!post_id) return res.status(400).json({ error: "post_id required" });

  try {
    // Fetch the post
    const { data: post, error: fetchErr } = await insforge.database
      .from("posts")
      .select("*")
      .eq("id", post_id)
      .single();

    if (fetchErr || !post) return res.status(404).json({ error: "Post not found" });
    if (post.follow_up_sent) return res.status(200).json({ message: "Follow-up already sent" });

    // Call TinyFish agent if key is available
    const tinyfishKey = process.env.TINYFISH_API_KEY;
    let agentTaskId = null;

    if (tinyfishKey) {
      try {
        const tfRes = await fetch("https://agent.tinyfish.ai/api/v1/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tinyfishKey}` },
          body: JSON.stringify({
            name: `Follow-up: ${post.issue_type} at ${post.location}`,
            description: `Automated follow-up for civic issue post ${post_id}. Original letter sent to ${post.official_name} (${post.official_email}). No response after 7 days.`,
            metadata: { post_id, official_email: post.official_email, issue_type: post.issue_type },
          }),
        });
        if (tfRes.ok) {
          const tfData = await tfRes.json();
          agentTaskId = tfData.id || tfData.task_id;
        }
      } catch (e) {
        console.error("TinyFish API error:", e.message);
      }
    }

    // Generate follow-up letter via Claude
    let followUpLetter = null;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      try {
        const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 600,
            messages: [{
              role: "user",
              content: `Write a brief follow-up letter for this civic issue. The original letter was sent 7 days ago with no response.\n\nOriginal complaint: ${post.complaint}\nOfficial: ${post.official_name}, ${post.department}\nLocation: ${post.location}\n\nWrite a polite but firm follow-up in 3-4 sentences. Start with "Dear ${post.official_name}," and reference that this is a follow-up to a previous letter.`,
            }],
          }),
        });
        if (claudeRes.ok) {
          const claudeData = await claudeRes.json();
          followUpLetter = claudeData.content?.[0]?.text;
        }
      } catch (e) {
        console.error("Claude follow-up error:", e.message);
      }
    }

    // Send follow-up email via Resend
    if (followUpLetter && process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.RESEND_API_KEY}` },
          body: JSON.stringify({
            from: "Civilian <onboarding@resend.dev>",
            to: ["sgupt354@asu.edu"],
            subject: `[FOLLOW-UP] Civic Issue: ${post.issue_type} at ${post.location}`,
            text: `AUTOMATED FOLLOW-UP (sent by Civilian AI Agent)\n\nOriginal recipient: ${post.official_email}\n\n${followUpLetter}`,
          }),
        });
      } catch (e) {
        console.error("Resend follow-up error:", e.message);
      }
    }

    // Mark follow_up_sent
    await insforge.database
      .from("posts")
      .update({ follow_up_sent: true })
      .eq("id", post_id);

    return res.status(200).json({
      success: true,
      follow_up_sent: true,
      agent_task_id: agentTaskId,
      letter_preview: followUpLetter?.slice(0, 100),
    });
  } catch (err) {
    console.error("tinyfish-followup error:", err);
    return res.status(500).json({ error: err.message });
  }
}
