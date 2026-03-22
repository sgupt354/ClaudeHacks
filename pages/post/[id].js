import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { insforge } from "../../lib/supabase";
import Nav from "../../components/Nav";
import Toast from "../../components/Toast";

const TYPE_LABELS = {
  traffic_safety:   { label: "Traffic Safety",   cls: "type-traffic"  },
  traffic:          { label: "Traffic",           cls: "type-traffic"  },
  street_lighting:  { label: "Street Lighting",   cls: "type-lighting" },
  road_maintenance: { label: "Road Maintenance",  cls: "type-roads"    },
  parks_facilities: { label: "Parks",             cls: "type-parks"    },
  noise_complaint:  { label: "Noise",             cls: "type-noise"    },
  housing:          { label: "Housing",           cls: "type-safety"   },
  utilities:        { label: "Utilities",         cls: "type-other"    },
  other:            { label: "Community",         cls: "type-other"    },
};

const DUMMY_COMMENTS = [
  { id: "d1", author_name: "Maria S.", text: "This has been an issue for months! My kids almost got hit last week.", created_at: "2h ago" },
  { id: "d2", author_name: "James T.", text: "I reported this to 311 twice. Nothing happened. This platform is our last hope.", created_at: "5h ago" },
  { id: "d3", author_name: "Chen W.", text: "47 of us signed the letter. Sending it tomorrow morning.", created_at: "1d ago" },
];

function getInitials(name) {
  return (name || "A").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}
function getAvatarColor(name) {
  const colors = ["#2563eb","#6366f1","#8b5cf6","#f59e0b","#22c55e","#ef4444","#f97316"];
  let h = 0;
  for (let i = 0; i < (name||"").length; i++) h = (name||"").charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function ShareMenu({ postId, onClose, onCopied }) {
  const ref = useRef(null);
  const postUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${postId}` : "";
  const enc = encodeURIComponent(postUrl);
  const msg = encodeURIComponent("Check this community issue: " + postUrl);

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const options = [
    { label: "Copy Link",         action: () => { navigator.clipboard.writeText(postUrl); onCopied(); onClose(); } },
    { label: "Share on X",        href: `https://twitter.com/intent/tweet?text=I%20raised%20a%20civic%20issue%20on%20Civilian!&url=${enc}` },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc}` },
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${msg}` },
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}` },
  ];

  return (
    <div ref={ref} style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 200, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", minWidth: 200, overflow: "hidden" }}>
      {options.map(opt => (
        opt.href ? (
          <a key={opt.label} href={opt.href} target="_blank" rel="noopener noreferrer" onClick={onClose}
            style={{ display: "block", padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "var(--text)", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            {opt.label}
          </a>
        ) : (
          <button key={opt.label} onClick={opt.action}
            style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "var(--text)", background: "transparent", border: "none", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            {opt.label}
          </button>
        )
      ))}
    </div>
  );
}

function CommentsSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [likedIds, setLikedIds] = useState(new Set());

  useEffect(() => {
    fetch(`/api/comments?postId=${postId}`)
      .then(r => r.json())
      .then(d => {
        const real = Array.isArray(d) ? d : [];
        setComments(real.length > 0 ? real : DUMMY_COMMENTS);
        setLoading(false);
      })
      .catch(() => { setComments(DUMMY_COMMENTS); setLoading(false); });
    const saved = JSON.parse(localStorage.getItem("likedComments") || "[]");
    setLikedIds(new Set(saved));
  }, [postId]);

  async function postComment() {
    if (!text.trim()) return;
    const opt = { id: Date.now(), text, author_name: "Anonymous", created_at: "just now" };
    setComments(prev => [...prev, opt]);
    setText("");
    try {
      await fetch("/api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ post_id: postId, text: opt.text, author_name: "Anonymous" }) });
    } catch {}
  }

  function toggleLike(id) {
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("likedComments", JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <div className="result-section">
      <p className="result-label">Comments</p>
      {loading ? <p style={{ fontSize: 13, color: "var(--muted)" }}>Loading...</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
          {comments.map(c => (
            <div key={c.id} style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: getAvatarColor(c.author_name || "A"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>
                {getInitials(c.author_name || "Anonymous")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{c.author_name || "Anonymous"}</span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{typeof c.created_at === "string" && c.created_at.includes("ago") ? c.created_at : c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.55 }}>{c.text}</p>
              </div>
              <button onClick={() => toggleLike(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: likedIds.has(c.id) ? "#ef4444" : "var(--muted)", alignSelf: "flex-start", marginTop: 4, padding: 2 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={likedIds.has(c.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input type="text" placeholder="Add your voice..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && postComment()}
          style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, outline: "none" }} />
        <button onClick={postComment} disabled={!text.trim()} style={{ padding: "10px 20px", borderRadius: 10, background: "#2563eb", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: !text.trim() ? 0.5 : 1 }}>Post</button>
      </div>
    </div>
  );
}

export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [echoed, setEchoed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!id) return;
    insforge.database.from("posts").select("*").eq("id", id).single()
      .then(({ data }) => { setPost(data); setLoading(false); });
  }, [id]);

  async function handleEcho() {
    if (echoed) return;
    await fetch("/api/echo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setPost(p => ({ ...p, echo_count: p.echo_count + 1 }));
    setEchoed(true);
  }

  async function handleSendEmail() {
    if (sent) return;
    setSending(true); setSendError("");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ official_email: post.official_email, official_name: post.official_name, department: post.department, issue_type: post.issue_type, formal_request: post.formal_request, location: post.location, post_id: post.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");
      setSent(true);
      // Trigger TinyFish follow-up scheduling
      fetch("/api/tinyfish-followup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ post_id: post.id }) }).catch(() => {});
    } catch (err) { setSendError(err.message); }
    finally { setSending(false); }
  }

  if (loading) return <><Nav /><div className="container"><div className="loading-wrap"><div className="loading-spinner" /></div></div></>;
  if (!post) return <><Nav /><div className="container"><p style={{ color: "var(--muted)" }}>Post not found.</p><Link href="/forum" className="back-link">Back to feed</Link></div></>;

  const typeInfo = TYPE_LABELS[post.issue_type] || TYPE_LABELS.other;
  const progress = Math.min((post.echo_count / 50) * 100, 100);
  const echoes = Number(post.echo_count) || 0;

  const tierMilestones = [
    { threshold: 10, label: "10 voices = Department Notified", reached: echoes >= 10, border: "rgba(245,158,11,0.35)", bg: "rgba(254,243,199,0.5)" },
    { threshold: 25, label: "25 voices = Council Escalation",  reached: echoes >= 25, border: "rgba(249,115,22,0.35)",  bg: "rgba(255,237,213,0.55)" },
    { threshold: 50, label: "50 voices = Public Records Filed", reached: echoes >= 50, border: "rgba(239,68,68,0.35)",   bg: "rgba(254,226,226,0.45)" },
  ];

  const lifecycleSteps = [
    { key: "reported", label: "Reported",             done: true },
    { key: "letter",   label: "Letter Sent",          done: sent },
    { key: "gov",      label: "Government Responded", done: post.status === "responded" || post.status === "resolved" },
    { key: "done",     label: "Resolved",             done: post.status === "resolved" },
  ];
  let currentIdx = lifecycleSteps.findIndex(s => !s.done);
  if (currentIdx === -1) currentIdx = lifecycleSteps.length - 1;

  return (
    <>
      <Nav />
      <div className="container">
        <Link href="/forum" className="back-link">← Back to feed</Link>

        {/* TinyFish follow-up banner */}
        {post.follow_up_sent && (
          <div style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.4)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#92400e", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            AI automatically sent a follow-up letter to {post.official_name} after no response.
            <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, opacity: 0.7 }}>Powered by TinyFish</span>
          </div>
        )}

        <div className="result-section">
          <span className={`post-type ${typeInfo.cls}`}>{typeInfo.label}</span>
          <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.5, margin: "12px 0 8px", color: "var(--text)" }}>{post.complaint}</p>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>{post.location}</p>
        </div>

        {/* Collective Power */}
        <div className="collective-bar">
          <p className="collective-count">{post.echo_count} residents</p>
          <p className="collective-label">have raised this same issue</p>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <div className="detail-tier-row">
            {tierMilestones.map(tier => (
              <div key={tier.threshold} className={`detail-tier-badge ${tier.reached ? "detail-tier-badge--active" : "detail-tier-badge--muted"}`}
                style={{ borderColor: tier.reached ? tier.border : undefined, background: tier.reached ? tier.bg : undefined }}>
                <span className="detail-tier-icon">{tier.reached ? "✓" : "○"}</span>
                <span>{tier.label}</span>
              </div>
            ))}
          </div>
          <div className="detail-timeline">
            <p className="detail-timeline-label">Issue lifecycle</p>
            <div className="detail-timeline-track">
              {lifecycleSteps.map((step, i) => {
                const isDone = step.done;
                const isCurrent = i === currentIdx && !isDone;
                return (
                  <div key={step.key} className={`detail-timeline-step ${!isDone && !isCurrent ? "detail-timeline-step--future" : ""}`}>
                    <div className={`detail-timeline-dot ${isDone ? "detail-timeline-dot--done" : ""} ${isCurrent ? "detail-timeline-dot--current" : ""}`} />
                    <span className="detail-timeline-step-title">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button className={`echo-btn ${echoed ? "echoed" : ""}`} onClick={handleEcho}>
          {echoed ? "✓ Your voice has been added" : "Add My Voice to This Issue"}
        </button>

        <div className="result-section">
          <p className="result-label">This letter goes to</p>
          <div className="official-card">
            <span className="official-icon">🏛</span>
            <div>
              <p className="official-name">{post.official_name}</p>
              <p className="official-dept">{post.department}</p>
              <p className="official-email">{post.official_email}</p>
            </div>
          </div>
        </div>

        <div className="result-section">
          <p className="result-label">Formal letter (AI-generated)</p>
          <p className="result-text">{post.formal_request}</p>
        </div>

        {/* Share button with menu */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <button className="share-btn" onClick={() => setShowShare(v => !v)}>
            Share this issue
          </button>
          {showShare && <ShareMenu postId={post.id} onClose={() => setShowShare(false)} onCopied={() => { setToast({ message: "Link copied!", type: "success" }); }} />}
        </div>

        {sendError && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 10, fontSize: 13, color: "#991b1b" }}>
            {sendError}
          </div>
        )}

        <button className="share-btn" onClick={handleSendEmail} disabled={sending || sent}
          style={{ marginBottom: 10, background: sent ? "#dcfce7" : "var(--surface)", borderColor: sent ? "#86efac" : "var(--border)", color: sent ? "#166534" : sending ? "var(--muted)" : "var(--text)" }}>
          {sent ? "✓ Letter sent to official!" : sending ? "Sending..." : "Send Letter to Official"}
        </button>

        <CommentsSection postId={post.id} />

        <div className="notice" style={{ marginTop: 16 }}>
          This letter is AI-generated based on your description. Review before sending. This is not legal advice.
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}
