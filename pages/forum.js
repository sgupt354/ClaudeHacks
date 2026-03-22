import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Nav from "../components/Nav";
import Toast from "../components/Toast";
import { ISSUE_COLORS, FORUM_THREADS } from "../lib/civicData";

const FILTERS = [
  { key: "all",              label: "All Issues"    },
  { key: "traffic_safety",   label: "Traffic"       },
  { key: "road_maintenance", label: "Roads"         },
  { key: "parks_facilities", label: "Parks"         },
  { key: "street_lighting",  label: "Lighting"      },
  { key: "noise_complaint",  label: "Noise"         },
  { key: "housing",          label: "Housing"       },
];

const DUMMY_COMMENTS = [
  { id: "d1", author_name: "Maria S.", text: "This has been an issue for months! My kids almost got hit last week.", created_at: "2h ago" },
  { id: "d2", author_name: "James T.", text: "I reported this to 311 twice. Nothing happened. This platform is our last hope.", created_at: "5h ago" },
  { id: "d3", author_name: "Chen W.", text: "47 of us signed the letter. Sending it tomorrow morning.", created_at: "1d ago" },
];

const TIER_MILESTONES = [
  { threshold: 10, label: "10 voices = Dept Notified",    color: "#f59e0b" },
  { threshold: 25, label: "25 voices = Council Escalation", color: "#f97316" },
  { threshold: 50, label: "50 voices = Public Records",   color: "#ef4444" },
];

function timeAgo(idx) {
  return ["2h ago","5h ago","1d ago","3d ago","6h ago","12h ago","4h ago","8h ago"][idx % 8];
}
function getInitials(name) {
  return (name || "A").split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();
}
function getAvatarColor(name) {
  const colors = ["#2563eb","#6366f1","#8b5cf6","#f59e0b","#22c55e","#ef4444","#f97316"];
  let h = 0;
  for (let i = 0; i < (name||"").length; i++) h = (name||"").charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

// ── Share Menu ──────────────────────────────────────────────────────────────
function ShareMenu({ postId, onClose, onCopied }) {
  const ref = useRef(null);
  const postUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${postId}` : "";
  const enc = encodeURIComponent(postUrl);
  const msg = encodeURIComponent("Check this community issue: " + postUrl);

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const options = [
    { label: "Copy Link",         action: () => { navigator.clipboard.writeText(postUrl); onCopied(); onClose(); }, color: "#2563eb" },
    { label: "Share on X",        href: `https://twitter.com/intent/tweet?text=I%20raised%20a%20civic%20issue%20on%20Civilian.%20Join%20me!&url=${enc}`, color: "#000" },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc}`, color: "#1877f2" },
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${msg}`, color: "#25d366" },
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`, color: "#0a66c2" },
  ];

  return (
    <div ref={ref} style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, zIndex: 200, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", minWidth: 200, overflow: "hidden" }}>
      {options.map(opt => (
        opt.href ? (
          <a key={opt.label} href={opt.href} target="_blank" rel="noopener noreferrer" onClick={onClose}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "var(--text)", textDecoration: "none", transition: "background 0.1s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.color, flexShrink: 0 }} />
            {opt.label}
          </a>
        ) : (
          <button key={opt.label} onClick={opt.action}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "var(--text)", background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left", transition: "background 0.1s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.color, flexShrink: 0 }} />
            {opt.label}
          </button>
        )
      ))}
    </div>
  );
}

// ── Comments Panel ───────────────────────────────────────────────────────────
function CommentsPanel({ postId, compact }) {
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
    const optimistic = { id: Date.now(), text, author_name: "Anonymous", created_at: "just now" };
    setComments(prev => [...prev, optimistic]);
    setText("");
    try {
      await fetch("/api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ post_id: postId, text: optimistic.text, author_name: "Anonymous" }) });
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
    <div>
      {loading ? <p style={{ fontSize: 13, color: "var(--muted)", padding: "8px 0" }}>Loading...</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {comments.map(c => (
            <div key={c.id} style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: getAvatarColor(c.author_name || "A"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white", flexShrink: 0 }}>
                {getInitials(c.author_name || "Anonymous")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{c.author_name || "Anonymous"}</span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{typeof c.created_at === "string" && c.created_at.includes("ago") ? c.created_at : c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{c.text}</p>
              </div>
              <button onClick={() => toggleLike(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: likedIds.has(c.id) ? "#ef4444" : "var(--muted)", padding: "2px 4px", alignSelf: "flex-start", marginTop: 2 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill={likedIds.has(c.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input type="text" placeholder="Add your voice..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && postComment()}
          style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 13, outline: "none" }} />
        <button onClick={postComment} disabled={!text.trim()} style={{ padding: "8px 16px", borderRadius: 8, background: "#2563eb", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: !text.trim() ? 0.5 : 1 }}>Post</button>
      </div>
    </div>
  );
}

// ── Post Modal (Instagram style) ─────────────────────────────────────────────
function PostModal({ post, echoedIds, onEcho, onClose, onToast }) {
  const c = ISSUE_COLORS[post.issue_type || post.issueType] || ISSUE_COLORS.other;
  const [echoed, setEchoed] = useState(echoedIds.has(String(post.id)));
  const [echoCount, setEchoCount] = useState(post.echo_count ?? post.support ?? 0);
  const [letterExpanded, setLetterExpanded] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const isDemo = String(post.id).startsWith("demo");
  const echoes = Number(echoCount) || 0;

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  async function handleEcho() {
    if (echoed || isDemo) return;
    setEchoed(true);
    setEchoCount(n => n + 1);
    onEcho(String(post.id));
    try { await fetch("/api/echo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: post.id }) }); } catch {}
  }

  const letter = post.formal_request || "";
  const letterLines = letter.split("\n");
  const letterPreview = letterLines.slice(0, 3).join("\n");

  const lifecycleSteps = [
    { label: "Reported", done: true },
    { label: "Letter Sent", done: false },
    { label: "Responded", done: post.status === "responded" || post.status === "resolved" },
    { label: "Resolved", done: post.status === "resolved" },
  ];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ display: "flex", maxWidth: 900, width: "100%", maxHeight: "90vh", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>

        {/* Left image panel */}
        {post.image_url && (
          <div style={{ width: "55%", flexShrink: 0, position: "relative" }}>
            <img src={post.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        {/* Right panel */}
        <div style={{ flex: 1, background: "var(--surface)", display: "flex", flexDirection: "column", overflowY: "auto", minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: getAvatarColor(post.author_name || "A"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white" }}>
              {getInitials(post.author_name || "Anonymous")}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{post.author_name || "Anonymous Resident"}</p>
              <span className="post-type" style={{ background: `${c.border}22`, color: c.border, margin: 0, fontSize: 10 }}>{c.label}</span>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 22, lineHeight: 1, padding: 4 }}>&times;</button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", lineHeight: 1.5, marginBottom: 8 }}>{post.complaint || post.text}</p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>{post.location || "Tempe, AZ"}</p>

            {/* Official card */}
            {post.official_name && (
              <div style={{ background: "var(--blue-light)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--blue)", marginBottom: 8 }}>Letter goes to</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{post.official_name}</p>
                <p style={{ fontSize: 12, color: "var(--blue)" }}>{post.department}</p>
                <p style={{ fontSize: 12, color: "var(--muted)" }}>{post.official_email}</p>
              </div>
            )}

            {/* Formal letter */}
            {letter && (
              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--muted)", marginBottom: 8 }}>Formal Letter</p>
                <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.65, whiteSpace: "pre-line" }}>
                  {letterExpanded ? letter : letterPreview + (letterLines.length > 3 ? "..." : "")}
                </p>
                {letterLines.length > 3 && (
                  <button onClick={() => setLetterExpanded(v => !v)} style={{ fontSize: 12, color: "var(--blue)", background: "none", border: "none", cursor: "pointer", marginTop: 6, padding: 0, fontWeight: 600 }}>
                    {letterExpanded ? "Show less" : "Read full letter"}
                  </button>
                )}
              </div>
            )}

            {/* Escalation tiers */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {TIER_MILESTONES.map(t => (
                <div key={t.threshold} style={{ flex: 1, padding: "8px 10px", borderRadius: 10, border: `1px solid ${echoes >= t.threshold ? t.color + "66" : "var(--border)"}`, background: echoes >= t.threshold ? t.color + "15" : "var(--bg)", opacity: echoes >= t.threshold ? 1 : 0.5 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: echoes >= t.threshold ? t.color : "var(--muted)", lineHeight: 1.4 }}>{t.label}</p>
                </div>
              ))}
            </div>

            {/* Lifecycle */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--muted)", marginBottom: 12 }}>Issue Lifecycle</p>
              <div style={{ display: "flex", gap: 0, position: "relative" }}>
                <div style={{ position: "absolute", top: 9, left: 10, right: 10, height: 2, background: "var(--border)", zIndex: 0 }} />
                {lifecycleSteps.map((s, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: s.done ? "#22c55e" : "var(--surface)", border: `2px solid ${s.done ? "#22c55e" : "var(--border)"}`, marginBottom: 6 }} />
                    <p style={{ fontSize: 10, fontWeight: 600, color: s.done ? "var(--text)" : "var(--muted)", textAlign: "center" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Comments</p>
              {!isDemo && <CommentsPanel postId={post.id} />}
            </div>
          </div>

          {/* Action bar */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexShrink: 0, position: "relative" }}>
            <button onClick={handleEcho} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "10px", borderRadius: 10, border: "none", cursor: echoed ? "default" : "pointer",
              background: echoed ? "rgba(37,99,235,0.12)" : "linear-gradient(135deg,#2563eb,#7c3aed)",
              color: echoed ? "#2563eb" : "white", fontSize: 13, fontWeight: 600, transition: "all 0.15s",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={echoed ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
              </svg>
              {echoed ? "Echoed" : "Echo"} · {echoCount}
            </button>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowShare(v => !v)} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Share
              </button>
              {showShare && !isDemo && <ShareMenu postId={post.id} onClose={() => setShowShare(false)} onCopied={() => onToast({ message: "Link copied!", type: "success" })} />}
            </div>
            <Link href={isDemo ? "#" : `/post/${post.id}`} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--muted)", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center" }}>
              Full view
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, index, echoedIds, onEcho, onShare, onOpenModal }) {
  const c = ISSUE_COLORS[post.issue_type || post.issueType] || ISSUE_COLORS.other;
  const name = post.author_name || post.name || "Anonymous Resident";
  const isEchoed = echoedIds.has(String(post.id));
  const isDemo = String(post.id).startsWith("demo");
  const [echoCount, setEchoCount] = useState(post.echo_count ?? post.support ?? 0);
  const [echoScale, setEchoScale] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [showShare, setShowShare] = useState(false);

  async function handleEcho(e) {
    e.stopPropagation();
    if (isEchoed || isDemo) return;
    setEchoScale(1.2);
    setTimeout(() => setEchoScale(1), 200);
    setEchoCount(n => n + 1);
    onEcho(String(post.id));
    try { await fetch("/api/echo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: post.id }) }); } catch {}
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpenModal(post)}
      style={{
        background: "var(--surface)",
        border: `1px solid ${hovered ? c.border : "var(--border)"}`,
        borderRadius: 14, marginBottom: 10, overflow: "hidden",
        boxShadow: hovered ? `0 4px 20px ${c.border}33` : "var(--card-shadow)",
        transition: "all 0.2s", cursor: "pointer",
      }}
    >
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: getAvatarColor(name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>
            {getInitials(name)}
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{name}</span>
            {(post.author_role || post.role) && <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>{post.author_role || post.role}</span>}
          </div>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{timeAgo(index)}</span>
        </div>

        <span className="post-type" style={{ background: `${c.border}22`, color: c.border }}>{c.label}</span>

        <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.6, color: "var(--text)", margin: "10px 0 14px" }}>
          {post.complaint || post.text}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={handleEcho} style={{
              display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8,
              border: "none", cursor: isEchoed ? "default" : "pointer",
              fontSize: 12, fontWeight: 600, transition: "all 0.15s",
              background: isEchoed ? "rgba(37,99,235,0.12)" : "transparent",
              color: isEchoed ? "#2563eb" : "var(--muted)",
              transform: `scale(${echoScale})`,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={isEchoed ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
              </svg>
              {echoCount}
            </button>

            <button onClick={e => { e.stopPropagation(); onOpenModal(post); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, color: "var(--muted)", background: "transparent" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Comments
            </button>

            <div style={{ position: "relative" }}>
              <button onClick={e => { e.stopPropagation(); setShowShare(v => !v); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, color: "var(--muted)", background: "transparent" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                Share
              </button>
              {showShare && !isDemo && <ShareMenu postId={post.id} onClose={() => setShowShare(false)} onCopied={() => onShare()} />}
            </div>
          </div>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{post.location || "Tempe, AZ"}</span>
        </div>
      </div>
    </div>
  );
}

// ── Forum Page ───────────────────────────────────────────────────────────────
export default function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [echoedIds, setEchoedIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [modalPost, setModalPost] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("echoedPosts") || "[]");
    setEchoedIds(new Set(saved));
    fetch("/api/posts")
      .then(r => r.json())
      .then(d => { setPosts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function handleEcho(id) {
    setEchoedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("echoedPosts", JSON.stringify([...next]));
      return next;
    });
    setToast({ message: "Voice added!", type: "success" });
  }

  const allPosts = [
    ...FORUM_THREADS.map(t => ({ ...t, issue_type: t.issueType, complaint: t.text, echo_count: t.support })),
    ...posts,
  ];
  const filtered = filter === "all" ? allPosts : allPosts.filter(p => (p.issue_type || p.issueType) === filter);
  const trending = [...allPosts].sort((a, b) => (b.echo_count || 0) - (a.echo_count || 0)).slice(0, 5);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px", display: "flex", gap: 32 }}>
        <aside style={{ width: 200, flexShrink: 0 }}>
          <div style={{ position: "sticky", top: 80 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>Filter</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{
                  width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: 8,
                  fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", transition: "all 0.15s",
                  background: filter === f.key ? "#2563eb" : "transparent",
                  color: filter === f.key ? "white" : "var(--muted)",
                }}>{f.label}</button>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <Link href="/compose" className="nav-btn" style={{ width: "100%", justifyContent: "center", fontSize: 13 }}>+ Raise Issue</Link>
            </div>
          </div>
        </aside>

        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: "var(--text)", marginBottom: 4 }}>Community Feed</h1>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>{filtered.length} issues</p>
          </div>

          {loading && <div className="loading-wrap"><div className="loading-spinner" /><p className="loading-text">Loading...</p></div>}
          {!loading && filtered.length === 0 && <div className="empty-state"><p className="empty-title">No issues found</p></div>}
          {!loading && filtered.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} echoedIds={echoedIds} onEcho={handleEcho}
              onShare={() => setToast({ message: "Link copied!", type: "success" })}
              onOpenModal={setModalPost} />
          ))}
        </main>

        <aside style={{ width: 256, flexShrink: 0 }}>
          <div style={{ position: "sticky", top: 80 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 16, boxShadow: "var(--card-shadow)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Trending Issues</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {trending.map((t, i) => {
                  const c = ISSUE_COLORS[t.issue_type || t.issueType] || ISSUE_COLORS.other;
                  return (
                    <div key={t.id || i} style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginTop: 2, minWidth: 14 }}>{i + 1}</span>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{t.complaint || t.text}</p>
                        <span style={{ fontSize: 10, fontWeight: 600, color: c.border }}>{t.echo_count || t.support} voices</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, boxShadow: "var(--card-shadow)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Recently Resolved</p>
              {[["Shade structures at Kiwanis Park","3 days ago",48],["Pothole on Apache Blvd","1 week ago",56],["Crosswalk lighting on Mill Ave","2 weeks ago",34]].map(([title,time,voices],i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>{title}</p>
                  <p style={{ fontSize: 10, color: "var(--muted)" }}>Resolved {time} · {voices} voices</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {modalPost && (
        <PostModal post={modalPost} echoedIds={echoedIds} onEcho={handleEcho}
          onClose={() => setModalPost(null)} onToast={setToast} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
