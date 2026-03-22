import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { official_email, official_name, department, issue_type, formal_request, location, post_id } = req.body;

  if (!official_email || !formal_request) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const subject = `Community Concern: ${issue_type?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())} — ${location || "Tempe, AZ"}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "Civilian <onboarding@resend.dev>",
      to: ["sgupt354@asu.edu"],
      reply_to: "noreply@civilian.app",
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#f8f7f4;font-family:Inter,Arial,sans-serif;">
          <div style="max-width:600px;margin:32px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background:#2563eb;padding:24px 32px;">
              <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:0.5px;text-transform:uppercase;">Civilian Community Platform</p>
              <h1 style="margin:6px 0 0;color:white;font-size:22px;font-weight:600;">Formal Community Request</h1>
            </div>

            <!-- Notice bar -->
            <div style="background:#eff6ff;border-bottom:1px solid #bfdbfe;padding:12px 32px;">
              <p style="margin:0;font-size:13px;color:#1e40af;">
                📍 <strong>${location || "Tempe, AZ"}</strong> &nbsp;·&nbsp; 
                🏛️ <strong>${department}</strong> &nbsp;·&nbsp;
                📋 <strong>${issue_type?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</strong>
              </p>
            </div>

            <!-- Letter body -->
            <div style="padding:32px;">
              <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">
                The following formal request was submitted by community members via Civilian, 
                a civic engagement platform. This letter was drafted with AI assistance based on 
                resident concerns and relevant city codes.
              </p>
              
              <div style="background:#f8f7f4;border-left:4px solid #2563eb;border-radius:0 8px 8px 0;padding:24px;margin-bottom:24px;">
                <p style="margin:0;font-size:15px;line-height:1.8;color:#1a1a1a;white-space:pre-wrap;">${formal_request}</p>
              </div>

              <div style="border-top:1px solid #e8e6e0;padding-top:20px;margin-top:8px;">
                <p style="margin:0 0 4px;font-size:12px;color:#888;">This letter was sent via Civilian</p>
                <p style="margin:0;font-size:12px;color:#888;">
                  View community support for this issue: 
                  <a href="https://civic-app-nine.vercel.app/post/${post_id}" style="color:#2563eb;">civic-app-nine.vercel.app/post/${post_id}</a>
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background:#f8f7f4;padding:16px 32px;border-top:1px solid #e8e6e0;">
              <p style="margin:0;font-size:11px;color:#aaa;text-align:center;">
                Civilian · AI-powered civic engagement · This is an automated community request
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
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
