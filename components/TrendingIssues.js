export default function TrendingIssues({ posts = [] }) {
  const sorted = [...posts]
    .sort((a, b) => (b.echo_count || 0) - (a.echo_count || 0))
    .slice(0, 5);

  if (sorted.length === 0) return null;

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Trending Issues</p>
      {sorted.map((post, i) => (
        <a key={post.id} href={`/post/${post.id}`} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < sorted.length - 1 ? "1px solid var(--border)" : "none", textDecoration: "none" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", minWidth: 16 }}>{i + 1}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {post.complaint || post.text}
            </p>
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{post.echo_count || 0} voices</p>
          </div>
        </a>
      ))}
    </div>
  );
}
