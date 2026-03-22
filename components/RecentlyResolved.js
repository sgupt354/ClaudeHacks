export default function RecentlyResolved({ posts = [] }) {
  const resolved = posts.filter(p => p.status === "resolved").slice(0, 4);

  if (resolved.length === 0) return null;

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Recently Resolved</p>
      {resolved.map((post, i) => (
        <a key={post.id} href={`/post/${post.id}`} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < resolved.length - 1 ? "1px solid var(--border)" : "none", textDecoration: "none", alignItems: "flex-start" }}>
          <span style={{ fontSize: 14, color: "#22c55e", flexShrink: 0, marginTop: 1 }}>✓</span>
          <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {post.complaint || post.text}
          </p>
        </a>
      ))}
    </div>
  );
}
