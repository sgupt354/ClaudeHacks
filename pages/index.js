import { useState, useEffect } from "react";
import Link from "next/link";

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

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalVoices = posts.reduce((sum, p) => sum + (p.echo_count || 0), 0);

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">
          civic<span>pulse</span>
        </Link>
        <Link href="/map" style={{ fontSize: 14, color: "#666", textDecoration: "none" }}>
          Map 
        </Link>
        <Link href="/compose" className="nav-btn">
          + Raise Issue
        </Link>
      </nav>

      <div className="container">
        <div className="feed-header">
          <h1 className="feed-title">Your Community's Voice</h1>
          <p className="feed-subtitle">
            {totalVoices} residents raising issues in Tempe · Powered by AI
          </p>
        </div>

        {loading && (
          <div className="loading-wrap">
            <div className="loading-spinner" />
            <p className="loading-text">Loading community issues...</p>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🏙️</div>
            <p className="empty-title">No issues reported yet</p>
            <p>Be the first to raise a community issue</p>
          </div>
        )}

        {posts.map((post) => {
          const typeInfo = TYPE_LABELS[post.issue_type] || TYPE_LABELS.other;
          return (
            <Link href={`/post/${post.id}`} key={post.id} className="post-card">
              <span className={`post-type ${typeInfo.cls}`}>
                {typeInfo.label}
              </span>
              <p className="post-complaint">{post.complaint}</p>
              <div className="post-meta">
                <span className="post-location">📍 {post.location || "Tempe, AZ"}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={`post-status status-${post.status}`}>
                    {post.status === "sent" ? "Letter Sent" : "Pending"}
                  </span>
                  <span className="post-echo">
                    👥 {post.echo_count} voices
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
