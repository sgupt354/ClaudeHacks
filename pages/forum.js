import { useState, useEffect } from "react";
import Link from "next/link";
import { FORUM_THREADS } from "../lib/forumThreads";

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

const BORDER_COLORS = {
  traffic_safety: "#f59e0b",
  street_lighting: "#6366f1",
  road_maintenance: "#8b5cf6",
  parks_facilities: "#22c55e",
  noise_complaint: "#f97316",
  housing: "#ef4444",
  utilities: "#06b6d4",
  other: "#94a3b8",
};

export default function ForumPage() {
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

  const featuredVoices = FORUM_THREADS.reduce((sum, thread) => sum + (thread.support || 0), 0);
  const liveVoices = posts.reduce((sum, p) => sum + (p.echo_count || 0), 0);
  const totalVoices = featuredVoices + liveVoices;
  const totalIssueThreads = FORUM_THREADS.length + posts.length;

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">
          civic<span>pulse</span>
        </Link>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Link href="/map" className="landing-link">Map</Link>
          <Link href="/compose" className="nav-btn">
            + Raise Issue
          </Link>
        </div>
      </nav>

      <div className="container">
        <div className="hero">
          <p className="hero-count">{totalVoices}</p>
          <p className="hero-label">resident voices raised</p>
          <p className="hero-tagline">Public forum for neighborhood action.</p>
          <Link href="/compose" className="hero-btn">
            Raise an Issue
          </Link>
        </div>

        <div className="feed-header">
          <h1 className="feed-title">Community Forum</h1>
          <p className="feed-subtitle">
            {totalVoices} resident voices across {totalIssueThreads} active issue threads
          </p>
        </div>

        <div className="forum-section-header">
          <p className="forum-section-title">Featured Community Threads</p>
          <p className="forum-section-subtitle">AI-generated demo personas for a richer community feed</p>
        </div>

        <div className="forum-thread-grid">
          {FORUM_THREADS.map((thread) => {
            const typeInfo = TYPE_LABELS[thread.issueType] || TYPE_LABELS.other;
            const borderColor = BORDER_COLORS[thread.issueType] || BORDER_COLORS.other;
            return (
              <Link
                key={thread.id}
                className="forum-thread-card"
                href={`/forum/${thread.id}`}
                style={{ borderLeft: `4px solid ${borderColor}` }}
              >
                <div className="forum-thread-top">
                  <div>
                    <p className="forum-thread-author">{thread.name}</p>
                    <p className="forum-thread-role">{thread.role}</p>
                  </div>
                  <span className="forum-thread-badge">{thread.badge}</span>
                </div>
                <span className={`post-type ${typeInfo.cls}`}>{typeInfo.label}</span>
                <p className="forum-thread-text">{thread.text}</p>
                <div className="forum-thread-meta">
                  <span className="post-location">📍 {thread.location}</span>
                  <span className="post-echo">👥 {thread.support} supporters</span>
                </div>
                <div className="forum-thread-status">{thread.status}</div>
              </Link>
            );
          })}
        </div>

        <div className="forum-section-header" style={{ marginTop: 28 }}>
          <p className="forum-section-title">Live Issue Posts</p>
          <p className="forum-section-subtitle">Posts created in your app appear here</p>
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
          const borderColor = BORDER_COLORS[post.issue_type] || BORDER_COLORS.other;
          return (
            <Link
              href={`/post/${post.id}`}
              key={post.id}
              className="post-card"
              style={{ borderLeft: `4px solid ${borderColor}` }}
            >
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
                  <span className="post-echo" style={{ fontSize: 15 }}>
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
