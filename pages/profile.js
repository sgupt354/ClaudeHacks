import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "../components/Nav";

const TABS = ["My Issues", "Echoed", "Resolved"];

const TYPE_COLORS = {
  traffic: "#f59e0b", street_lighting: "#818cf8", road_maintenance: "#a78bfa",
  parks_facilities: "#22c55e", noise_complaint: "#f97316", housing: "#ef4444",
  utilities: "#94a3b8", other: "#94a3b8",
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("My Issues");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("Anonymous Resident");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [echoedIds, setEchoedIds] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);

  useEffect(() => {
    const savedName = localStorage.getItem("profileName") || "Anonymous Resident";
    const savedEchoed = JSON.parse(localStorage.getItem("echoed_posts") || "[]");
    const savedGroups = JSON.parse(localStorage.getItem("joinedGroups") || "[]");
    setName(savedName);
    setEchoedIds(savedEchoed);
    setJoinedGroups(savedGroups);

    fetch("/api/posts")
      .then(r => r.json())
      .then(data => { setPosts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function saveName() {
    const trimmed = nameInput.trim() || "Anonymous Resident";
    setName(trimmed);
    localStorage.setItem("profileName", trimmed);
    setEditingName(false);
  }

  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const myIssues = posts;
  const echoedPosts = posts.filter(p => echoedIds.includes(String(p.id)));
  const resolvedPosts = posts.filter(p => p.status === "resolved");

  const tabPosts = activeTab === "My Issues" ? myIssues : activeTab === "Echoed" ? echoedPosts : resolvedPosts;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      {/* Cover */}
      <div style={{ height: 200, background: "linear-gradient(135deg, #2563eb, #7c3aed, #06b6d4)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)" }} />
      </div>

      {/* Profile header */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 32px 24px", position: "relative" }}>
          {/* Avatar overlapping cover */}
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "white", border: "4px solid var(--surface)", position: "absolute", top: -40, left: 32 }}>
            {initials}
          </div>

          <div style={{ paddingTop: 52, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              {editingName ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input value={nameInput} onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveName()}
                    autoFocus
                    style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", background: "var(--bg)", border: "1.5px solid var(--blue)", borderRadius: 8, padding: "4px 10px", fontFamily: "Inter, sans-serif", outline: "none" }} />
                  <button onClick={saveName} style={{ padding: "6px 14px", borderRadius: 8, background: "#2563eb", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Save</button>
                  <button onClick={() => setEditingName(false)} style={{ padding: "6px 14px", borderRadius: 8, background: "var(--bg)", color: "var(--muted)", border: "1px solid var(--border)", fontSize: 13, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", letterSpacing: -0.3 }}>{name}</h1>
                  <button onClick={() => { setNameInput(name); setEditingName(true); }} title="Edit name"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, display: "flex", alignItems: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              )}
              <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>Tempe, Arizona</p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 32, marginTop: 20 }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5 }}>{loading ? "-" : myIssues.length}</p>
              <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Issues Raised</p>
            </div>
            <div style={{ width: 1, background: "var(--border)" }} />
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5 }}>{echoedIds.length}</p>
              <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Voices Given</p>
            </div>
            <div style={{ width: 1, background: "var(--border)" }} />
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5 }}>{joinedGroups.length}</p>
              <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Groups Joined</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 32px", display: "flex" }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "14px 20px", border: "none", background: "transparent",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              color: activeTab === tab ? "var(--blue)" : "var(--muted)",
              borderBottom: activeTab === tab ? "2px solid var(--blue)" : "2px solid transparent",
              fontFamily: "Inter, sans-serif", transition: "all 0.15s",
            }}>{tab}</button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 32px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--blue)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading...</p>
          </div>
        ) : tabPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Nothing here yet</p>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>
              {activeTab === "Echoed" ? "Echo posts in the feed to see them here." : activeTab === "Resolved" ? "No resolved issues yet." : "Raise your first issue to get started."}
            </p>
            {activeTab === "My Issues" && (
              <Link href="/compose" style={{ padding: "10px 24px", borderRadius: 999, background: "#2563eb", color: "white", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Raise an Issue</Link>
            )}
          </div>
        ) : (
          tabPosts.map(post => (
            <Link key={post.id} href={`/post/${post.id}`} style={{ display: "block", textDecoration: "none", marginBottom: 10 }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", boxShadow: "var(--card-shadow)", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: TYPE_COLORS[post.issue_type] || "#94a3b8", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: TYPE_COLORS[post.issue_type] || "#94a3b8" }}>{(post.issue_type || "other").replace(/_/g, " ")}</span>
                  {post.status === "resolved" && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>Resolved</span>}
                </div>
                <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", lineHeight: 1.55, marginBottom: 10 }}>{post.complaint}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{post.location}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--blue)", background: "var(--blue-light)", padding: "4px 10px", borderRadius: 999 }}>{post.echo_count} voices</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
