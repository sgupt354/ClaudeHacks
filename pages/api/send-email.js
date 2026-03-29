import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { official_email, official_name, department, issue_type, formal_request, location, post_id } = req.body;

  if (!official_email || !formal_request) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const subject = `Community Concern: ${issue_type?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())} — ${location || "Tempe, AZ"}`;

  const toAddress = process.env.OVERRIDE_EMAIL_TO || official_email;
  const fromAddress = (process.env.CIVILIAN_FROM_EMAIL || "letters@civilian.app").trim();
  const bccAddress = (process.env.CIVILIAN_BCC_EMAIL || "log@civilian.app").trim();
  const replyTo = (process.env.CIVILIAN_REPLY_TO || official_email || "").trim();

  try {
    const { data, error } = await resend.emails.send({
      from: `Civilian <${fromAddress}>`,
      to: [toAddress],
      bcc: [bccAddress],
      reply_to: replyTo,
      subject,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="font-family:Arial,sans-serif;font-size:14px;color:#000000;max-width:600px;line-height:1.6;padding:32px;">
<p style="margin:0 0 16px 0;">From: Civilian Community Platform</p>
<p style="margin:0 0 16px 0;">The following formal complaint was submitted by community members via Civilian, a civic engagement platform.</p>
<p style="margin:0 0 4px 0;">Location: ${location || "Tempe, AZ"}</p>
<p style="margin:0 0 4px 0;">Department: ${department || "City Services"}</p>
<p style="margin:0 0 16px 0;">Issue: ${issue_type?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Community Issue"}</p>
<hr>
<p style="margin:16px 0;white-space:pre-wrap;">${formal_request}</p>
<hr>
<p style="margin:16px 0 0 0;">This letter was drafted with AI assistance based on information provided by residents. Civilian is a civic engagement platform that helps communities formally report local issues.</p>
</div>
</body>
</html>`,
      text: formal_request, // plain text fallback
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Email send error:", err);
    return res.status(500).json({ error: err.message });
  }
}
