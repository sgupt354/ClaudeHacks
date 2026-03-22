import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "../components/Nav";

const GROUPS = [
  { slug: "traffic-safety", name: "Traffic Safety Watch", members: 234, posts: 47, issuesThisWeek: 12, description: "Reporting dangerous intersections, crosswalks, and traffic hazards across Tempe.", issueType: "traffic_safety", tags: ["Traffic", "Safety"], gradient: "linear-gradient(135deg, #f59e0b, #ef4444)", recentMembers: ["MS","JT","CW","AR"] },
  { slug: "parks-and-rec",  name: "Parks & Recreation",  members: 189, posts: 31, issuesThisWeek: 7,  description: "Advocating for better parks, shade structures, and recreational facilities.", issueType: "parks_facilities", tags: ["Parks", "Community"], gradient: "linear-gradient(135deg, #22c55e, #06b6d4)", recentMembers: ["LK","PM","SR","BN"] },
  { slug: "housing-rights", name: "Housing Rights",      members: 312, posts: 58, issuesThisWeek: 18, description: "Fighting for affordable housing, tenant rights, and fair zoning in Tempe.", issueType: "housing", tags: ["Housing", "Policy"], gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)", recentMembers: ["DG","FH","YC","OM"] },
  { slug: "noise-watch",    name: "Noise & Nuisance",    members: 97,  posts: 22, issuesThisWeek: 5,  description: "Addressing noise complaints, late-night disturbances, and quality of life issues.", issueType: "noise_complaint", tags: ["Noise", "Residential"], gradient: "linear-gradient(135deg, #ef4444, #ec4899)", recentMembers: ["TN","RV","KA","ZB"] },
  { slug: "road-warriors",  name: "Road Warriors",       members: 278, posts: 64, issuesThisWeek: 15, description: "Tracking potholes, road damage, and infrastructure issues across the city.", issueType: "road_maintenance", tags: ["Roads", "Infrastructure"], gradient: "linear-gradient(135deg, #8b5cf6, #2563eb)", recentMembers: ["WE","QR","IX","UY"] },
  { slug: "lights-out",     name: "Street Lighting",     members: 143, posts: 29, issuesThisWeek: 9,  description: "Reporting broken streetlights and advocating for safer, well-lit streets.", issueType: "street_lighting", tags: ["Lighting", "Safety"], gradient: "linear-gradient(135deg, #f97316, #f59e0b)", recentMembers: ["HJ","GL","NP","VD"] },
];

const FILTER_TABS = [
  { key: "All",         label: "All",          count: 6  },
  { key: "Traffic",     label: "Traffic",      count: 2  },
  { key: "Parks",       label: "Parks",        count: 1  },
  { key: "Housing",     label: "Housing",      count: 1  },
  { key: "Noise",       label: "Noise",        count: 1  },
  { key: "Roads",       label: "Roads",        count: 1  },
];

const LIVE_ACTIVITY = [
  { initials: "SR", color: "#2563eb", action: "joined Traffic Safety Watch",    time: "2m ago"  },
  { initials: "JT", color: "#22c55e", action: "raised an issue in Road Warriors", time: "5m ago"  },
  { initials: "CW", color: "#8b5cf6", action: "echoed a Housing Rights post",   time: "9m ago"  },
  { initials: "AR", color: "#f59e0b", action: "joined Parks & Recreation",      time: "14m ago" },
  { initials: "PM", color: "#ef4444", action: "sent a letter via Noise Watch",  time: "21m ago" },
  { initials: "LK", color: "#06b6d4", action: "3 new issues in Street Lighting","time": "28m ago" },
];

const TRENDING_ISSUES = [
  { label: "Traffic",   count: 23, color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  { label: "Parks",     count: 18, color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
  { label: "Roads",     count: 15, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)"  },
  { label: "Lighting",  count: 9,  color: "#f97316", bg: "rgba(249,115,22,0.1)"  },
];

const SUGGESTED = [
  { slug: "road-warriors", name: "Road Warriors",  reason: "Based on Traffic Safety Watch", gradient: "linear-gradient(135deg, #8b5cf6, #2563eb)" },
  { slug: "lights-out",    name: "Street Lighting", reason: "Popular in your area",          gradient: "linear-gradient(135deg, #f97316, #f59e0b)" },
];

function getAvatarColor(initials) {
  const colors = ["#2563eb","#6366f1","#8b5cf6","#f59e0b","#22c55e","#ef4444","#f97316","#06b6d4"];
  let h = 0;
  for (let i = 0; i < initials.length; i++) h = initials.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function AvatarStack({ members }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {members.slice(0, 4).map((m, i) => (
        <div key={i} style={{
          width: 24, height: 24, borderRadius: "50%",
          background: getAvatarColor(m),
          border: "2px solid var(--surface)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 700, color: "white",
          marginLeft: i === 0 ? 0 : -6, zIndex: 4 - i,
          position: "relative",
        }}>{m}</div>
      ))}
    </div>
  );
}

export default function GroupsPage() {
  const [search, setSearch]               = useState("");
  const [activeTab, setActiveTab]         = useState("All");
  const [joined, setJoined]               = useState(new Set());
  const [allGroups, setAllGroups]         = useState(GROUPS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup]           = useState({ name: "", description: "", category: "All", gradient: "linear-gradient(135deg, #2563eb, #7c3aed)" });

  useEffect(() => {
    const saved  = JSON.parse(localStorage.getItem("joinedGroups")  || "[]");
    const custom = JSON.parse(localStorage.getItem("customGroups")  || "[]");
    setJoined(new Set(saved));
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
    const group = { slug, name: newGroup.name, description: newGroup.description || "A community group on Civilian.", members: 1, posts: 0, issuesThisWeek: 0, issueType: "other", tags: [newGroup.category], gradient: newGroup.gradient, recentMembers: ["ME"] };
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
    const matchTab    = activeTab === "All" || g.tags.some(t => t.toLowerCase().includes(activeTab.toLowerCase()));
    return matchSearch && matchTab;
  });

  const myGroups   = allGroups.filter(g => joined.has(g.slug));
  const totalMembers = allGroups.reduce((s, g) => s + g.members, 0);

  // ── styles ──────────────────────────────────────────────────────────────────
  const sidePanel = {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 14, padding: "16px 18px", marginBottom: 12,
  };
  const sectionLabel = {
    fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
    textTransform: "uppercase", color: "var(--muted)", marginBottom: 12,
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 20px", display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
        <aside style={{ width: 220, flexShrink: 0, position: "sticky", top: 76 }}>

          {/* Your Groups */}
          <div style={sidePanel}>
            <p style={sectionLabel}>Your Groups</p>
            {myGroups.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>Join a group to see it here.</p>
            ) : (
              myGroups.map(g => (
                <Link key={g.slug} href={`/groups/${g.slug}`}
                  style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 8px", borderRadius: 8, textDecoration: "none", marginBottom: 2, transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: g.gradient, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", lineHeight: 1.3 }}>{g.name}</span>
                </Link>
              ))
            )}
            <button onClick={() => setShowCreateModal(true)}
              style={{ width: "100%", marginTop: 10, padding: "7px 10px", borderRadius: 8, border: "1px dashed var(--border)", background: "transparent", color: "var(--muted)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
              + Create Group
            </button>
          </div>

          {/* Community Stats */}
          <div style={sidePanel}>
            <p style={sectionLabel}>Community Stats</p>
            {[
              { label: "Total voices",    value: "1,247", trend: "+34 this week", up: true  },
              { label: "Issues raised",   value: "89",    trend: "+12 this week", up: true  },
              { label: "Letters sent",    value: "34",    trend: "+5 this week",  up: true  },
              { label: "Total members",   value: totalMembers.toLocaleString(), trend: null },
            ].map(({ label, value, trend, up }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 1 }}>{label}</p>
                  {trend && <p style={{ fontSize: 10, color: up ? "#22c55e" : "#ef4444" }}>{up ? "↑" : "↓"} {trend}</p>}
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Suggested for you */}
          <div style={sidePanel}>
            <p style={sectionLabel}>Suggested for you</p>
            {SUGGESTED.filter(s => !joined.has(s.slug)).slice(0, 2).map(s => (
              <div key={s.slug} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: s.gradient, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>{s.name}</p>
                    <p style={{ fontSize: 11, color: "var(--muted)" }}>{s.reason}</p>
                  </div>
                </div>
                <button onClick={() => toggleJoin(s.slug)}
                  style={{ width: "100%", padding: "5px", borderRadius: 7, border: "1px solid #2563eb", background: "transparent", color: "#2563eb", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Join
                </button>
              </div>
            ))}
            {SUGGESTED.every(s => joined.has(s.slug)) && (
              <p style={{ fontSize: 12, color: "var(--muted)" }}>You&apos;ve joined all suggestions.</p>
            )}
          </div>

        </aside>

        {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5 }}>Discover Groups</h1>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{filtered.length} groups</span>
          </div>

          {/* Search */}
          <input type="text" placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 12, boxSizing: "border-box", transition: "border-color 0.15s" }}
            onFocus={e => e.target.style.borderColor = "#2563eb"}
            onBlur={e => e.target.style.borderColor = "var(--border)"} />

          {/* Filter pills with counts */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            {FILTER_TABS.map(tab => {
              const active = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.15s",
                  border: `1px solid ${active ? "#2563eb" : "var(--border)"}`,
                  background: active ? "#2563eb" : "var(--surface)",
                  color: active ? "white" : "var(--muted)",
                }}>
                  {tab.label} <span style={{ opacity: 0.7 }}>({tab.count})</span>
                </button>
              );
            })}
          </div>

          {/* Group cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            {filtered.map(g => (
              <GroupCard key={g.slug} g={g} joined={joined} onToggleJoin={toggleJoin} />
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "span 2", textAlign: "center", padding: "48px 0", color: "var(--muted)" }}>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No groups found</p>
                <p style={{ fontSize: 13 }}>Try a different search or filter</p>
              </div>
            )}
          </div>
        </main>

        {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
        <aside style={{ width: 240, flexShrink: 0, position: "sticky", top: 76 }}>

          {/* Live Activity */}
          <div style={sidePanel}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={sectionLabel}>Live Activity</p>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 0 2px rgba(34,197,94,0.25)", animation: "pulse 2s ease-in-out infinite" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {LIVE_ACTIVITY.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "white", flexShrink: 0 }}>
                    {item.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.4 }}>{item.action}</p>
                    <p style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending this week */}
          <div style={sidePanel}>
            <p style={sectionLabel}>Trending this week</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {TRENDING_ISSUES.map(t => (
                <div key={t.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderRadius: 8, background: t.bg }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.color }}>{t.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.color }}>{t.count} new</span>
                </div>
              ))}
            </div>
          </div>

          {/* Your Impact */}
          <div style={{ ...sidePanel, background: "#f0f7ff", borderColor: "rgba(37,99,235,0.15)" }}>
            <p style={{ ...sectionLabel, color: "#2563eb" }}>Your Impact</p>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { value: joined.size, label: "groups joined" },
                { value: 47,          label: "voices echoed" },
              ].map(({ value, label }) => (
                <div key={label} style={{ flex: 1, textAlign: "center", padding: "10px 6px", background: "white", borderRadius: 10, border: "1px solid rgba(37,99,235,0.12)" }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "#2563eb", letterSpacing: -1 }}>{value}</p>
                  <p style={{ fontSize: 10, color: "#2563eb", opacity: 0.7, lineHeight: 1.3 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

        </aside>
      </div>

      {/* ── CREATE GROUP MODAL ─────────────────────────────────────────── */}
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
                {FILTER_TABS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
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

function GroupCard({ g, joined, onToggleJoin }) {
  const [hovered, setHovered] = useState(false);
  const isJoined = joined.has(g.slug);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--surface)", border: `1px solid ${hovered ? "rgba(37,99,235,0.3)" : "var(--border)"}`,
        borderRadius: 16, overflow: "hidden",
        boxShadow: hovered ? "0 4px 20px rgba(37,99,235,0.1)" : "var(--card-shadow)",
        transition: "all 0.2s",
      }}>

      {/* Gradient header */}
      <div style={{ height: 110, background: g.gradient, position: "relative" }}>
        {/* Activity indicator */}
        {g.issuesThisWeek > 0 && (
          <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)", borderRadius: 999, padding: "3px 9px", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>{g.issuesThisWeek} this week</span>
          </div>
        )}
        <div style={{ position: "absolute", bottom: 12, left: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", textShadow: "0 1px 4px rgba(0,0,0,0.3)", marginBottom: 2 }}>{g.name}</h3>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{g.members.toLocaleString()} members</p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px" }}>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, marginBottom: 10, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {g.description}
        </p>

        {/* Tags */}
        <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
          {g.tags.map(tag => (
            <span key={tag} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>{tag}</span>
          ))}
        </div>

        {/* Avatar stack + posts count */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <AvatarStack members={g.recentMembers || []} />
          <span style={{ fontSize: 11, color: "var(--muted)" }}>{g.posts} posts</span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/groups/${g.slug}`}
            style={{ flex: 1, textAlign: "center", padding: "7px", borderRadius: 8, border: "1px solid var(--border)", color: "var(--text)", textDecoration: "none", fontSize: 13, fontWeight: 500, background: "transparent", transition: "border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#2563eb"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
            View
          </Link>
          <button onClick={() => onToggleJoin(g.slug)} style={{
            flex: 1, padding: "7px", borderRadius: 8, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, fontFamily: "inherit", transition: "all 0.15s",
            background: isJoined ? "#f0fdf4" : "#2563eb",
            color: isJoined ? "#22c55e" : "white",
          }}>
            {isJoined ? "✓ Joined" : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}
