import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { insforge } from "../../lib/supabase";

const TYPE_LABELS = {
  traffic_safety: { label: "Traffic Safety", cls: "type-traffic" },
  street_lighting: { label: "Street Lighting", cls: "type-lighting" },
  road_maintenance: { label: "Road Maintenance", cls: "type-roads" },
  parks_facilities: { label: "Parks", cls: "type-parks" },
  noise_complaint: { label: "Noise", cls: "type-other" },
  housing: { label: "Housing", cls: "type-safety" },
  utilities: { label: "Utilities", cls: "type-other" },
  other: { label: "Community", cls: "type-other" },
};

export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [echoed, setEchoed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");
  const [animatedProgress, setAnimatedProgress] = useState(0); // ← NEW

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);
<<<<<<< Updated upstream

  // ← NEW: animate progress bar after post loads
  useEffect(() => {
    if (!post) return;
    const target = Math.min((post.echo_count / 50) * 100, 100);
    const timer = setTimeout(() => setAnimatedProgress(target), 300);
    return () => clearTimeout(timer);
  }, [post]);

=======
>>>>>>> Stashed changes
  async function handleEcho() {
    if (echoed) return;
    await fetch("/api/echo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setPost((p) => ({ ...p, echo_count: p.echo_count + 1 }));
    setEchoed(true);
  }

  function copyLetter() {
    navigator.clipboard.writeText(post.formal_request);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSendEmail() {
    if (sent) return;
    setSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          official_email: post.official_email,
          official_name: post.official_name,
          department: post.department,
          issue_type: post.issue_type,
          formal_request: post.formal_request,
          location: post.location,
          post_id: post.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");
      setSent(true);
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <>
        <nav className="nav">
          <Link href="/" className="nav-logo">civic<span>pulse</span></Link>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Link href="/forum" className="landing-link">Forum</Link>
            <Link href="/map" className="landing-link">Map</Link>
          </div>
        </nav>
        <div className="container">
          <div className="loading-wrap">
            <div className="loading-spinner" />
          </div>
        </div>
      </>
    );
  }

  if (!post) return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">civic<span>pulse</span></Link>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Link href="/forum" className="landing-link">Forum</Link>
          <Link href="/map" className="landing-link">Map</Link>
        </div>
      </nav>
      <div className="container">
        <p>Post not found.</p>
        <Link href="/forum">← Back to forum</Link>
      </div>
    </>
  );

  const typeInfo = TYPE_LABELS[post.issue_type] || TYPE_LABELS.other;

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">civic<span>pulse</span></Link>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Link href="/forum" className="landing-link">Forum</Link>
          <Link href="/map" className="landing-link">Map</Link>
        </div>
      </nav>
      <div className="container">
        <Link href="/forum" className="back-link">← Back to forum</Link>

        <div className="result-section">
          <span className={`post-type ${typeInfo.cls}`}>{typeInfo.label}</span>
          <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.5, margin: "12px 0 8px" }}>
            {post.complaint}
          </p>
          <p style={{ fontSize: 13, color: "#888" }}>📍 {post.location}</p>
        </div>

        {/* Collective Power */}
        <div className="collective-bar">
          <p className="collective-count">👥 {post.echo_count} residents</p>
          <p className="collective-label">have raised this same issue</p>

          {/* ← NEW: animated bar with milestone ticks */}
          <div style={{ position: "relative", marginTop: 10 }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${animatedProgress}%`, transition: "width 1s ease" }} />
            </div>
            {/* Milestone tick marks */}
            <div style={{ position: "relative", height: 16, marginTop: 4 }}>
              <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
                <div style={{ width: 1, height: 6, background: post.echo_count >= 25 ? "#22c55e" : "#d1d5db", margin: "0 auto" }} />
                <span style={{ fontSize: 10, color: post.echo_count >= 25 ? "#166534" : "#aaa" }}>25</span>
              </div>
              <div style={{ position: "absolute", right: 0, textAlign: "center" }}>
                <div style={{ width: 1, height: 6, background: post.echo_count >= 50 ? "#22c55e" : "#d1d5db", margin: "0 auto" }} />
                <span style={{ fontSize: 10, color: post.echo_count >= 50 ? "#166534" : "#aaa" }}>50</span>
              </div>
            </div>
          </div>

          <p style={{ fontSize: 11, color: "#166534", marginTop: 4 }}>
            {post.echo_count >= 50
              ? "🔥 High priority — escalating to City Council"
              : post.echo_count >= 25
              ? `${50 - post.echo_count} more voices needed for City Council escalation`
              : `${25 - post.echo_count} more voices needed for department escalation`}
          </p>
        </div>

        {/* Echo button */}
        <button className={`echo-btn ${echoed ? "echoed" : ""}`} onClick={handleEcho}>
          {echoed ? "✓ Your voice has been added" : "👥 Add My Voice to This Issue"}
        </button>

        {/* Official */}
        <div className="result-section">
          <p className="result-label">📬 This letter goes to</p>
          <div className="official-card">
            <span className="official-icon">🏛️</span>
            <div>
              <p className="official-name">{post.official_name}</p>
              <p className="official-dept">{post.department}</p>
              <p className="official-email">{post.official_email}</p>
            </div>
          </div>
        </div>

        {/* Letter */}
        <div className="result-section">
          <p className="result-label">📄 Formal letter (AI-generated)</p>
          <p className="result-text">{post.formal_request}</p>
        </div>

        {/* Actions */}
        <button className="share-btn" onClick={copyLetter} style={{ marginBottom: 10 }}>
          {copied ? "✓ Copied!" : "📋 Copy Letter to Send"}
        </button>

        {sendError && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 10, fontSize: 13, color: "#991b1b" }}>
            {sendError}
          </div>
        )}

        <button
          className="share-btn"
          onClick={handleSendEmail}
          disabled={sending || sent}
          style={{
            marginBottom: 10,
            background: sent ? "#dcfce7" : sending ? "#f8f7f4" : "white",
            borderColor: sent ? "#86efac" : "#e8e6e0",
            color: sent ? "#166534" : sending ? "#aaa" : "#444",
          }}
        >
          {sent ? "✓ Letter sent to official!" : sending ? "📤 Sending..." : "📧 Send Letter to Official"}
        </button>

        <div className="notice" style={{ marginTop: 16 }}>
          ⚖️ This letter is AI-generated based on your description. Review before sending. This is not legal advice.
        </div>
      </div>
    </>
  );
}