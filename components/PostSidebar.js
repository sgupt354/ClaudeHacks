import Link from "next/link";

export default function PostSidebar({ post }) {
  if (!post) return null;

  const TIER_MILESTONES = [
    { threshold: 10, label: "Dept Notified",      color: "#f59e0b" },
    { threshold: 25, label: "Council Escalation", color: "#f97316" },
    { threshold: 50, label: "Public Records",     color: "#ef4444" },
  ];
  const echoes = Number(post.echo_count) || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Echo milestones */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Voice Milestones</p>
        {TIER_MILESTONES.map(t => (
          <div key={t.threshold} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: echoes >= t.threshold ? t.color : "var(--border)", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: echoes >= t.threshold ? "var(--text)" : "var(--muted)", flex: 1 }}>{t.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.threshold}</span>
          </div>
        ))}
      </div>

      {/* Raise your own */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Have a similar issue?</p>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14, lineHeight: 1.5 }}>Raise your own issue and get an AI-written letter to the right official.</p>
        <Link href="/compose" style={{ display: "block", textAlign: "center", padding: "10px", borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
          Raise Issue
        </Link>
      </div>
    </div>
  );
}
