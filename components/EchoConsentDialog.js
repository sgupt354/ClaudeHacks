export default function EchoConsentDialog({ post, onConfirm, onCancel }) {
  const echoCount = post.echo_count ?? post.support ?? 0;
  const official = post.official_name || "the relevant official";
  const dept = post.department || "the relevant department";

  return (
    <div
      onClick={onCancel}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, padding: "28px 28px 24px", maxWidth: 420, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}
      >
        {/* Icon */}
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
          </svg>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 12, letterSpacing: -0.3 }}>
          Add your voice to this issue
        </h2>

        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, marginBottom: 16 }}>
          By adding your voice, you join <strong style={{ color: "var(--text)" }}>{echoCount} neighbor{echoCount !== 1 ? "s" : ""}</strong> demanding action on this issue. A formal letter will be sent to <strong style={{ color: "var(--text)" }}>{official}</strong> at <strong style={{ color: "var(--text)" }}>{dept}</strong> on your behalf.
          <br /><br />
          If there is no government response within 7 days, a follow-up letter will automatically be sent — approved collectively by everyone who echoed this issue.
        </p>

        {/* Across differences tag */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", marginBottom: 20 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
          <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, flex: 1 }}>
            <strong style={{ color: "#8b5cf6" }}>Across differences</strong> — this issue has support from residents across political backgrounds. Your voice is anonymous and counted alongside everyone.
          </p>
        </div>

        <button
          onClick={onConfirm}
          style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 8, transition: "opacity 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          Yes, Add My Voice
        </button>

        <button
          onClick={onCancel}
          style={{ width: "100%", padding: "10px", borderRadius: 12, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          Cancel
        </button>

        <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
          You remain anonymous. No personal data is collected. You can request removal anytime.
        </p>
      </div>
    </div>
  );
}
