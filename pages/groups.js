import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "../components/Nav";

const GROUPS = [
  { slug: "traffic-safety", name: "Traffic Safety Watch", members: 234, posts: 47, description: "Reporting dangerous intersections, crosswalks, and traffic hazards across Tempe.", issueType: "traffic_safety", tags: ["Traffic", "Safety"], gradient: "linear-gradient(135deg, #f59e0b, #ef4444)" },
  { slug: "parks-and-rec",  name: "Parks & Recreation",  members: 189, posts: 31, description: "Advocating for better parks, shade structures, and recreational facilities.", issueType: "parks_facilities", tags: ["Parks", "Community"], gradient: "linear-gradient(135deg, #22c55e, #06b6d4)" },
  { slug: "housing-rights", name: "Housing Rights",      members: 312, posts: 58, description: "Fighting for affordable housing, tenant rights, and fair zoning in Tempe.", issueType: "housing", tags: ["Housing", "Policy"], gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
  { slug: "noise-watch",    name: "Noise & Nuisance",    members: 97,  posts: 22, description: "Addressing noise complaints, late-night disturbances, and quality of life issues.", issueType: "noise_complaint", tags: ["Noise", "Residential"], gradient: "linear-gradient(135deg, #ef4444, #ec4899)" },
  { slug: "road-warriors",  name: "Road Warriors",       members: 278, posts: 64, description: "Tracking potholes, road damage, and infrastructure issues across the city.", issueType: "road_maintenance", tags: ["Roads", "Infrastructure"], gradient: "linear-gradient(135deg, #8b5cf6, #2563eb)" },
  { slug: "lights-out",     name: "Street Lighting",     members: 143, posts: 29, description: "Reporting broken streetlights and advocating for safer, well-lit streets.", issueType: "street_lighting", tags: ["Lighting", "Safety"], gradient: "linear-gradient(135deg, #f97316, #f59e0b)" },
];

const FILTER_TABS = ["All", "Traffic", "Parks", "Housing", "Noise", "Roads"];

export default function GroupsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [joined, setJoined] = useState(new Set());
  const [allGroups, setAllGroups] = useState(GROUPS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "", category: "All", gradient: "linear-gradient(135deg, #2563eb, #7c3aed)" });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("joinedGroups") || "[]");
    setJoined(new Set(saved));
    const custom = JSON.parse(localStorage.getItem("customGroups") || "[]");
    if (custom.length > 0) setAllGroups([...GROUPS, ...custom]);
  }, []);

  function toggleJoin(slug) {
    setJoined(prev => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      localStorage.setItem("joinedGroups", JSON.stringify([...next]));
      return next;
    });
  }

  function handleCreateGroup() {
    if (!newGroup.name.trim()) return;
    const slug = newGroup.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
    const group = {
      slug,
      name: newGroup.name,
      description: newGroup.description || "A community group on Civilian.",
      members: 1,
      posts: 0,
      issueType: "other",
      tags: [newGroup.category],
      gradient: newGroup.gradient,
    };
    const updated = [...allGroups, group];
    setAllGroups(updated);
    const custom = JSON.parse(localStorage.getItem("customGroups") || "[]");
    localStorage.setItem("customGroups", JSON.stringify([...custom, group]));
    setJoined(prev => { const next = new Set(prev); next.add(slug); localStorage.setItem("joinedGroups", JSON.stringify([...next])); return next; });
    setShowCreateModal(false);
    setNewGroup({ name: "", description: "", category: "All", gradient: "linear-gradient(135deg, #2563eb, #7c3aed)" });
  }

  const filtered = allGroups.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === "All" || g.tags.some(t => t.toLowerCase().includes(activeTab.toLowerCase()));
    return matchSearch && matchTab;
  });

  const myGroups = allGroups.filter(g => joined.has(g.slug));

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px", display: "flex", gap: 32 }}>

        {/* Left sidebar */}
        <aside style={{ width: 260, flexShrink: 0 }}>
          <div style={{ position: "sticky", top: 80 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 20 }}>Groups</h2>

            {myGroups.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>Your Groups</p>
                {myGroups.map(g => (
                  <Link key={g.slug} href={`/groups/${g.slug}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, textDecoration: "none", marginBottom: 4, transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--border)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: g.gradient, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{g.name}</span>
                  </Link>
                ))}
              </div>
            )}

            <Link href="/groups" style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--muted)", textDecoration: "none", padding: "8px 10px", borderRadius: 8, marginBottom: 4 }}>
              Discover Groups
            </Link>
            <button onClick={() => setShowCreateModal(true)} style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              + Create Group
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", marginBottom: 16, letterSpacing: -0.5 }}>Discover Groups</h1>

          <input type="text" placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 15, fontFamily: "Inter, sans-serif", outline: "none", marginBottom: 16, boxSizing: "border-box" }} />

          <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto" }}>
            {FILTER_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                border: `1px solid ${activeTab === tab ? "#2563eb" : "var(--border)"}`,
                background: activeTab === tab ? "#2563eb" : "var(--surface)",
                color: activeTab === tab ? "white" : "var(--muted)",
                fontFamily: "Inter, sans-serif", transition: "all 0.15s",
              }}>{tab}</button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {filtered.map(g => (
              <div key={g.slug} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--card-shadow)" }}>
                <div style={{ height: 160, background: g.gradient, position: "relative" }}>
                  <div style={{ position: "absolute", bottom: 16, left: 16 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: "white", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>{g.name}</h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>{g.members} members</p>
                  </div>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5, marginBottom: 12, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {g.description}
                  </p>
                  <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                    {g.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)" }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href={`/groups/${g.slug}`} style={{ flex: 1, textAlign: "center", padding: "8px", borderRadius: 8, border: "1px solid var(--border)", color: "var(--text)", textDecoration: "none", fontSize: 13, fontWeight: 500, background: "transparent" }}>
                      View
                    </Link>
                    <button onClick={() => toggleJoin(g.slug)} style={{
                      flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer",
                      fontSize: 13, fontWeight: 600, fontFamily: "Inter, sans-serif", transition: "all 0.15s",
                      background: joined.has(g.slug) ? "rgba(34,197,94,0.15)" : "#2563eb",
                      color: joined.has(g.slug) ? "#22c55e" : "white",
                    }}>
                      {joined.has(g.slug) ? "Joined" : "Join Group"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div onClick={() => setShowCreateModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>Create a Group</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 24, lineHeight: 1 }}>&times;</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Group Name *</label>
              <input type="text" placeholder="e.g. Eastside Neighborhood Watch" value={newGroup.name} onChange={e => setNewGroup(g => ({ ...g, name: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Description</label>
              <textarea rows={3} placeholder="What does this group focus on?" value={newGroup.description} onChange={e => setNewGroup(g => ({ ...g, description: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Category</label>
              <select value={newGroup.category} onChange={e => setNewGroup(g => ({ ...g, category: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit" }}>
                {FILTER_TABS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 10 }}>Color</label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  "linear-gradient(135deg, #2563eb, #7c3aed)",
                  "linear-gradient(135deg, #22c55e, #06b6d4)",
                  "linear-gradient(135deg, #f59e0b, #ef4444)",
                  "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  "linear-gradient(135deg, #ef4444, #ec4899)",
                  "linear-gradient(135deg, #f97316, #f59e0b)",
                ].map(grad => (
                  <button key={grad} onClick={() => setNewGroup(g => ({ ...g, gradient: grad }))}
                    style={{ width: 36, height: 36, borderRadius: 10, background: grad, border: newGroup.gradient === grad ? "3px solid var(--text)" : "2px solid transparent", cursor: "pointer", flexShrink: 0 }} />
                ))}
              </div>
            </div>

            <button onClick={handleCreateGroup} disabled={!newGroup.name.trim()}
              style={{ width: "100%", padding: "12px", borderRadius: 12, background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "white", border: "none", fontSize: 15, fontWeight: 700, cursor: newGroup.name.trim() ? "pointer" : "not-allowed", opacity: newGroup.name.trim() ? 1 : 0.5, fontFamily: "inherit" }}>
              Create Group
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
