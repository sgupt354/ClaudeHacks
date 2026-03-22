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

// Static posts always available — no network needed
const BASE_POSTS = [
  { id: "fallback-1", complaint: "The crosswalk at Mill Ave and University Dr has no lighting. Kids nearly get hit every morning walking to school.", issue_type: "traffic_safety", location: "Mill Ave & University Dr, Tempe", echo_count: 34 },
  { id: "fallback-2", complaint: "Three streetlights on Rural Road near the library have been out for 6 weeks. Seniors avoid walking at night.", issue_type: "street_lighting", location: "Rural Road near Library, Tempe", echo_count: 22 },
  { id: "fallback-3", complaint: "Kiwanis Park has no shade. Playground equipment reaches 160F in summer. Kids cannot play there at all.", issue_type: "parks_facilities", location: "Kiwanis Park, Tempe", echo_count: 48 },
  { id: "fallback-4", complaint: "Massive pothole on Apache Blvd near Price Rd has been there 3 months. Already damaged 5 tires this week.", issue_type: "road_maintenance", location: "Apache Blvd & Price Rd, Tempe", echo_count: 31 },
  { id: "fallback-5", complaint: "Late night drag racing on McClintock Dr wakes up the whole neighborhood every weekend after midnight.", issue_type: "noise_complaint", location: "McClintock Dr, Tempe", echo_count: 19 },
  { id: "fallback-6", complaint: "No crosswalk on Southern Ave near the elementary school. Children are crossing a 4-lane road unsafely daily.", issue_type: "traffic_safety", location: "Southern Ave & Rural Rd, Tempe", echo_count: 47 },
  { id: "fallback-7", complaint: "Broken water main on Priest Dr has left a sinkhole growing for 2 weeks. Road is partially collapsed.", issue_type: "utilities", location: "Priest Dr, Tempe", echo_count: 23 },
  { id: "fallback-8", complaint: "Graffiti has covered the entire underpass on Broadway Rd. It has been there for months with no cleanup.", issue_type: "other", location: "Broadway Rd Underpass, Tempe", echo_count: 12 },
  { id: "fallback-9", complaint: "Tempe Town Lake path lighting is completely out for 400 meters. Joggers and cyclists at serious risk at night.", issue_type: "street_lighting", location: "Tempe Town Lake Path, Tempe", echo_count: 38 },
  { id: "fallback-10", complaint: "Construction noise from the ASU project on University Dr starts at 5am daily violating city noise ordinances.", issue_type: "noise_complaint", location: "University Dr & Rural Rd, Tempe", echo_count: 29 },
  ...FORUM_THREADS.map(t => ({
    id: t.id,
    complaint: t.text || t.complaint || "",
    issue_type: t.issueType || t.issue_type || "other",
    location: t.location || "",
    echo_count: t.support ?? t.echo_count ?? 0,
  })),
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [dbPosts, setDbPosts] = useState([]);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (router.query.q) setQuery(String(router.query.q));
  }, [router.query.q]);

  // Debounced DB search — augments base results, non-blocking
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setDbPosts([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        clearTimeout(timeout);
        const data = await res.json();
        setDbPosts(Array.isArray(data) ? data : []);
      } catch {
        setDbPosts([]);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const q = query.toLowerCase().trim();

  const matchesQuery = (p) =>
    (p.complaint || "").toLowerCase().includes(q) ||
    (p.location || "").toLowerCase().includes(q) ||
    (TYPE_LABELS[p.issue_type] || "").toLowerCase().includes(q) ||
    (p.issue_type || "").toLowerCase().includes(q);

  const dbIds = new Set(dbPosts.map(p => String(p.id)));
  const baseMatches = q.length >= 2 ? BASE_POSTS.filter(p => !dbIds.has(String(p.id)) && matchesQuery(p)) : [];
  const merged = q.length < 2 ? [] : [...dbPosts, ...baseMatches];

  return (
    <>
      <Nav />
      <div className="container" style={{ maxWidth: 720 }}>
        {/* Search input */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search issues, locations, issue types..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ width: "100%", padding: "13px 14px 13px 42px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          />
          {query && (
            <button onClick={() => { setQuery(""); setDbPosts([]); }} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 18, lineHeight: 1 }}>&times;</button>
          )}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--border)" }}>
          <div style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#2563eb", borderBottom: "2px solid #2563eb", marginBottom: -1 }}>
            Issues {q.length >= 2 ? `(${merged.length})` : ""}
          </div>
        </div>

        {/* Results */}
        {q.length < 2 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" style={{ marginBottom: 12 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p style={{ fontSize: 15, color: "var(--muted)" }}>Type at least 2 characters to search</p>
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
