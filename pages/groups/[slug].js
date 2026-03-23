import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Nav from "../../components/Nav";

const GROUPS = [
  { slug: "traffic-safety", name: "Traffic Safety Watch", members: 234, posts: 47, description: "Reporting dangerous intersections, crosswalks, and traffic hazards across Tempe.", issueType: "traffic_safety", tags: ["Traffic", "Safety"], gradient: "linear-gradient(135deg, #f59e0b, #ef4444)", rules: ["Be respectful", "Post only traffic-related issues", "Include location details"] },
  { slug: "parks-and-rec",  name: "Parks & Recreation",  members: 189, posts: 31, description: "Advocating for better parks, shade structures, and recreational facilities.", issueType: "parks_facilities", tags: ["Parks", "Community"], gradient: "linear-gradient(135deg, #22c55e, #06b6d4)", rules: ["Keep it constructive", "Share photos when possible", "Tag your neighborhood"] },
  { slug: "housing-rights", name: "Housing Rights",      members: 312, posts: 58, description: "Fighting for affordable housing, tenant rights, and fair zoning in Tempe.", issueType: "housing", tags: ["Housing", "Policy"], gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)", rules: ["No personal attacks", "Cite sources for policy claims", "Respect privacy"] },
  { slug: "noise-watch",    name: "Noise & Nuisance",    members: 97,  posts: 22, description: "Addressing noise complaints, late-night disturbances, and quality of life issues.", issueType: "noise_complaint", tags: ["Noise", "Residential"], gradient: "linear-gradient(135deg, #ef4444, #ec4899)", rules: ["Include time and date of incident", "Be specific about location", "No naming individuals"] },
  { slug: "road-warriors",  name: "Road Warriors",       members: 278, posts: 64, description: "Tracking potholes, road damage, and infrastructure issues across the city.", issueType: "road_maintenance", tags: ["Roads", "Infrastructure"], gradient: "linear-gradient(135deg, #8b5cf6, #2563eb)", rules: ["Include street address or cross streets", "Rate severity 1-5", "Follow up when fixed"] },
  { slug: "lights-out",     name: "Street Lighting",     members: 143, posts: 29, description: "Reporting broken streetlights and advocating for safer, well-lit streets.", issueType: "street_lighting", tags: ["Lighting", "Safety"], gradient: "linear-gradient(135deg, #f97316, #f59e0b)", rules: ["Include pole number if visible", "Note how long it has been out", "Check APS outage map first"] },
];

const FAKE_MEMBERS = [
  { name: "Maria Santos",    role: "Group Admin",  avatar: "https://i.pravatar.cc/150?img=1"  },
  { name: "James Thompson",  role: "Member",       avatar: "https://i.pravatar.cc/150?img=3"  },
  { name: "Chen Wei",        role: "Member",       avatar: "https://i.pravatar.cc/150?img=5"  },
  { name: "Aisha Johnson",   role: "Moderator",    avatar: "https://i.pravatar.cc/150?img=10" },
  { name: "Roberto Garcia",  role: "Member",       avatar: "https://i.pravatar.cc/150?img=12" },
  { name: "Sarah Mitchell",  role: "Member",       avatar: "https://i.pravatar.cc/150?img=20" },
  { name: "David Park",      role: "Member",       avatar: "https://i.pravatar.cc/150?img=25" },
  { name: "Fatima Al-Hassan","role": "Member",     avatar: "https://i.pravatar.cc/150?img=32" },
  { name: "Tyler Brooks",    role: "Member",       avatar: "https://i.pravatar.cc/150?img=33" },
  { name: "Linda Nguyen",    role: "Member",       avatar: "https://i.pravatar.cc/150?img=44" },
  { name: "Kevin Okafor",    role: "Member",       avatar: "https://i.pravatar.cc/150?img=52" },
  { name: "Priya Sharma",    role: "Member",       avatar: "https://i.pravatar.cc/150?img=60" },
];

export default function GroupDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [activeTab, setActiveTab] = useState("Posts");
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [joined, setJoined] = useState(false);

  const group = GROUPS.find(g => g.slug === slug);

  useEffect(() => {
    if (!slug) return;
    const saved = JSON.parse(localStorage.getItem("joinedGroups") || "[]");
    setJoined(saved.includes(slug));
  }, [slug]);

  useEffect(() => {
    if (!group || activeTab !== "Posts") return;
    setLoadingPosts(true);
    fetch(`/api/posts?issue_type=${group.issueType}`)
      .then(r => r.json())
      .then(data => { setPosts(Array.isArray(data) ? data : []); setLoadingPosts(false); })
      .catch(() => setLoadingPosts(false));
  }, [group, activeTab]);

  function toggleJoin() {
    const saved = JSON.parse(localStorage.getItem("joinedGroups") || "[]");
    let next;
    if (joined) {
      next = saved.filter(s => s !== slug);
    } else {
      next = [...saved, slug];
    }
    localStorage.setItem("joinedGroups", JSON.stringify(next));
    setJoined(!joined);
  }

  if (!group && slug) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <Nav />
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
          <p style={{ color: "var(--muted)", fontSize: 16 }}>Group not found.</p>
          <Link href="/groups" style={{ color: "var(--blue)", textDecoration: "none", fontSize: 14, marginTop: 12, display: "inline-block" }}>Back to Groups</Link>
        </div>
      </div>
    );
  }

  if (!group) return null;

  const TABS = ["Posts", "Members", "About"];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      {/* Cover banner */}
      <div style={{ height: 240, background: group.gradient, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
        <div style={{ position: "absolute", bottom: 28, left: 32, right: 32 }}>
          <div className="group-cover-actions">
            <div>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                {group.tags.map(t => (
                  <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "rgba(255,255,255,0.2)", color: "white", backdropFilter: "blur(4px)" }}>{t}</span>
                ))}
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "white", letterSpacing: -0.5, textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>{group.name}</h1>
            </div>
            <button onClick={toggleJoin} style={{
              padding: "10px 24px", borderRadius: 999, border: "2px solid white",
              background: joined ? "white" : "transparent",
              color: joined ? "#0f172a" : "white",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: "Inter, sans-serif", transition: "all 0.15s",
            }}>
              {joined ? "Joined" : "Join Group"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="group-stats-row">
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5 }}>{group.members}</p>
            <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Members</p>
          </div>
          <div style={{ width: 1, height: 32, background: "var(--border)" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5 }}>{group.posts}</p>
            <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Posts</p>
          </div>
          <div style={{ width: 1, height: 32, background: "var(--border)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#22c55e" }}>Active</span>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Link href="/compose" style={{
              padding: "9px 20px", borderRadius: 999,
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              color: "white", textDecoration: "none", fontSize: 13, fontWeight: 600,
              boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
            }}>
              + Post to Group
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="group-tabs-row">
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

      {/* Tab content */}
      <div className="group-content">

        {/* Posts tab */}
        {activeTab === "Posts" && (
          <div>
            {loadingPosts ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--blue)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
                <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 24px" }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>-</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>No posts yet</p>
                <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>Be the first to raise an issue in this group.</p>
                <Link href="/compose" style={{ padding: "10px 24px", borderRadius: 999, background: "#2563eb", color: "white", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Raise an Issue</Link>
              </div>
            ) : (
              posts.map(post => (
                <Link key={post.id} href={`/post/${post.id}`} style={{ display: "block", textDecoration: "none", marginBottom: 10 }}>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", boxShadow: "var(--card-shadow)", transition: "all 0.15s", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", lineHeight: 1.55, marginBottom: 12 }}>{post.complaint}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>{post.location}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--blue)", background: "var(--blue-light)", padding: "4px 10px", borderRadius: 999 }}>
                        {post.echo_count} voices
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Members tab */}
        {activeTab === "Members" && (
          <div>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>Showing {FAKE_MEMBERS.length} of {group.members} members</p>
            <div className="group-members-grid">
              {FAKE_MEMBERS.map((member, i) => (
                <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--card-shadow)" }}>
                  <img src={member.avatar} alt={member.name} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{member.name}</p>
                    <p style={{ fontSize: 11, color: "var(--muted)" }}>{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About tab */}
        {activeTab === "About" && (
          <div className="group-about-grid">
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px", boxShadow: "var(--card-shadow)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--muted)", marginBottom: 12 }}>About</p>
              <p style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.65, marginBottom: 20 }}>{group.description}</p>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>Created January 2025</p>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px", boxShadow: "var(--card-shadow)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--muted)", marginBottom: 12 }}>Community Rules</p>
              <ol style={{ paddingLeft: 18, margin: 0 }}>
                {group.rules.map((rule, i) => (
                  <li key={i} style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6, marginBottom: 8 }}>{rule}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
