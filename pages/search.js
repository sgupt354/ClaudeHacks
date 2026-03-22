import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Nav from "../components/Nav";
import { FORUM_THREADS } from "../lib/civicData";

const TYPE_LABELS = {
  traffic_safety: "Traffic Safety", street_lighting: "Street Lighting",
  road_maintenance: "Road Maintenance", parks_facilities: "Parks",
  noise_complaint: "Noise", housing: "Housing", utilities: "Utilities", other: "Community",
};

// Normalize FORUM_THREADS to match post shape
const STATIC_POSTS = FORUM_THREADS.map(t => ({
  ...t,
  issue_type: t.issue_type || t.issueType,
  complaint: t.complaint || t.text,
  echo_count: t.echo_count ?? t.support ?? 0,
}));

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("issues");
  const [dbPosts, setDbPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Sync query with URL param on load
  useEffect(() => {
    if (router.query.q) setQuery(String(router.query.q));
  }, [router.query.q]);

  // Debounced search against /api/search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setDbPosts([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setDbPosts(Array.isArray(data) ? data : []);
      } catch {
        setDbPosts([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Update URL as user types
  useEffect(() => {
    if (query.trim()) {
      router.replace(`/search?q=${encodeURIComponent(query)}`, undefined, { shallow: true });
    }
  }, [query]);

  const q = query.toLowerCase().trim();

  // Merge DB results with static threads, deduplicate by id
  const staticMatches = q.length < 2 ? [] : STATIC_POSTS.filter(p =>
    (p.complaint || "").toLowerCase().includes(q) ||
    (p.location || "").toLowerCase().includes(q) ||
    (TYPE_LABELS[p.issue_type] || "").toLowerCase().includes(q)
  );

  const dbIds = new Set(dbPosts.map(p => String(p.id)));
  const merged = [
    ...dbPosts,
    ...staticMatches.filter(p => !dbIds.has(String(p.id))),
  ];

  return (
    <>
      <Nav />
      <div className="container" style={{ maxWidth: 720 }}>
        {/* Search input */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input ref={inputRef} type="text" placeholder="Search issues, locations, issue types..." value={query} onChange={e => setQuery(e.target.value)}
            style={{ width: "100%", padding: "13px 14px 13px 42px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          {query && (
            <button onClick={() => { setQuery(""); setDbPosts([]); }} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 18, lineHeight: 1 }}>&times;</button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
          <button onClick={() => setTab("issues")}
            style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "transparent", color: tab === "issues" ? "#2563eb" : "var(--muted)", borderBottom: `2px solid ${tab === "issues" ? "#2563eb" : "transparent"}`, marginBottom: -1, transition: "all 0.15s" }}>
            Issues ({merged.length})
          </button>
        </div>

        {/* Results */}
        {q.length < 2 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" style={{ marginBottom: 12 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p style={{ fontSize: 15, color: "var(--muted)" }}>Type at least 2 characters to search</p>
          </div>
        ) : loading ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div className="loading-spinner" style={{ margin: "0 auto" }} />
          </div>
        ) : merged.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>No results for &ldquo;{query}&rdquo;</p>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Try a different term or <Link href="/compose" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>raise this issue</Link>.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {merged.map(post => (
              <Link key={post.id} href={`/post/${post.id}`}
                style={{ display: "block", padding: "16px 18px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", textDecoration: "none", transition: "border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#2563eb"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(37,99,235,0.1)", color: "#2563eb" }}>
                    {TYPE_LABELS[post.issue_type] || "Community"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{post.location}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5, marginBottom: 6 }}>{post.complaint}</p>
                <p style={{ fontSize: 12, color: "var(--muted)" }}>{post.echo_count || 0} voices</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
