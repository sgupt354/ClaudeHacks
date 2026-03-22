export default function CommunityStats({ posts = [] }) {
  const resolved = posts.filter(p => p.status === "resolved").length;
  const totalVoices = posts.reduce((s, p) => s + (p.echo_count || 0), 0);
  const urgent = posts.filter(p => (p.urgency_score || 0) >= 8).length;

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Community Stats</p>
      {[
        { label: "Total voices",  value: totalVoices.toLocaleString() },
        { label: "Issues raised", value: posts.length },
        { label: "Resolved",      value: resolved, color: "#22c55e" },
        { label: "Urgent issues", value: urgent,   color: "#ef4444" },
      ].map(({ label, value, color }) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{label}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: color || "var(--text)" }}>{value}</span>
        </div>
      ))}
    </div>
  );
}
