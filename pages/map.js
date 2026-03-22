import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Nav from "../components/Nav";

const TYPE_COLORS = {
  traffic_safety:   "#f59e0b",
  traffic:          "#f59e0b",
  street_lighting:  "#6366f1",
  road_maintenance: "#8b5cf6",
  parks_facilities: "#22c55e",
  noise_complaint:  "#f97316",
  housing:          "#ef4444",
  utilities:        "#06b6d4",
  other:            "#94a3b8",
};

const TYPE_LABELS = {
  traffic_safety:   "Traffic Safety",
  traffic:          "Traffic",
  street_lighting:  "Street Lighting",
  road_maintenance: "Roads",
  parks_facilities: "Parks",
  noise_complaint:  "Noise",
  housing:          "Housing",
  utilities:        "Utilities",
  other:            "Community",
};

const MAP_STYLES = [
  { id: "streets",   label: "Street",    style: "mapbox://styles/mapbox/streets-v12"           },
  { id: "satellite", label: "Satellite", style: "mapbox://styles/mapbox/satellite-streets-v12" },
  { id: "dark",      label: "Dark",      style: "mapbox://styles/mapbox/dark-v11"              },
];

const FILTERS = ["all","traffic_safety","road_maintenance","parks_facilities","street_lighting","noise_complaint","housing"];
const FILTER_LABELS = {
  all: "All", traffic_safety: "Traffic", road_maintenance: "Roads",
  parks_facilities: "Parks", street_lighting: "Lighting",
  noise_complaint: "Noise", housing: "Housing",
};

const coordsCache = {};

async function geocode(postId, location, token) {
  if (coordsCache[postId]) return coordsCache[postId];
  try {
    const q = encodeURIComponent(`${location}, Tempe, Arizona, USA`);
    const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${token}&limit=1&country=US&proximity=-111.9400,33.4152`);
    const data = await res.json();
    if (data.features?.length > 0) {
      coordsCache[postId] = data.features[0].center;
      return coordsCache[postId];
    }
  } catch {}
  return null;
}

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStyle, setActiveStyle] = useState("streets");
  const [activeFilter, setActiveFilter] = useState("all");
  const [mapboxLoaded, setMapboxLoaded] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetch("/api/posts")
      .then(r => r.json())
      .then(d => { setPosts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.mapboxgl) { setMapboxLoaded(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js";
    script.onload = () => setMapboxLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (loading || !mapboxLoaded || !mapRef.current || mapInstanceRef.current) return;
    const mapboxgl = window.mapboxgl;
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-111.9400, 33.4152],
      zoom: 12,
    });
    mapInstanceRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.on("load", () => addMarkers(map, mapboxgl, posts, "all"));
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, [loading, mapboxLoaded]);

  async function addMarkers(map, mapboxgl, postsToShow, filter) {
    markersRef.current.forEach(m => { try { m.remove(); } catch {} });
    markersRef.current = [];
    const filtered = filter === "all" ? postsToShow : postsToShow.filter(p => p.issue_type === filter);
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    for (const post of filtered) {
      let coords = null;
      if (post.lat && post.lng) coords = [post.lng, post.lat];
      else if (post.location) coords = await geocode(post.id, post.location, token);
      if (!coords) continue;
      const color = TYPE_COLORS[post.issue_type] || TYPE_COLORS.other;
      const el = document.createElement("div");
      el.style.cssText = `width:32px;height:32px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:white;transition:transform 0.15s;font-family:Inter,sans-serif;`;
      el.textContent = post.echo_count || 0;
      el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.25)"; });
      el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; });
      el.addEventListener("click", () => {
        setSelectedPost(post);
        map.flyTo({ center: coords, zoom: 15, duration: 800 });
      });
      const marker = new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(map);
      markersRef.current.push(marker);
    }
  }

  function switchStyle(s) {
    setActiveStyle(s.id);
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setStyle(s.style);
    map.once("style.load", () => addMarkers(map, window.mapboxgl, posts, activeFilter));
  }

  function applyFilter(f) {
    setActiveFilter(f);
    const map = mapInstanceRef.current;
    if (map) addMarkers(map, window.mapboxgl, posts, f);
  }

  function flyTo(post) {
    setSelectedPost(post);
    const map = mapInstanceRef.current;
    if (!map) return;
    const coords = post.lat && post.lng ? [post.lng, post.lat] : coordsCache[post.id];
    if (coords) map.flyTo({ center: coords, zoom: 15, duration: 800 });
  }

  const filteredList = activeFilter === "all" ? posts : posts.filter(p => p.issue_type === activeFilter);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav />

      {/* Filter bar */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "10px 24px", display: "flex", alignItems: "center", gap: 8, overflowX: "auto" }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => applyFilter(f)} style={{
            padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
            border: `1px solid ${activeFilter === f ? "#2563eb" : "var(--border)"}`,
            background: activeFilter === f ? "#2563eb" : "var(--surface)",
            color: activeFilter === f ? "white" : "var(--muted)",
            fontFamily: "Inter, sans-serif", transition: "all 0.15s",
          }}>{FILTER_LABELS[f]}</button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--muted)", whiteSpace: "nowrap" }}>
          {filteredList.length} issues
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", height: "calc(100vh - 112px)" }}>
        {/* Sidebar */}
        <aside style={{ width: 320, flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--border)", overflowY: "auto" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>
              {filteredList.length} Issues
            </p>
          </div>
          {loading ? (
            <div style={{ padding: 32, textAlign: "center" }}><div className="loading-spinner" /></div>
          ) : filteredList.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>No issues found</div>
          ) : filteredList.map(post => {
            const color = TYPE_COLORS[post.issue_type] || TYPE_COLORS.other;
            const isSelected = selectedPost?.id === post.id;
            return (
              <div key={post.id} onClick={() => flyTo(post)} style={{
                padding: "14px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                background: isSelected ? "rgba(37,99,235,0.08)" : "transparent",
                borderLeft: `3px solid ${isSelected ? "#2563eb" : "transparent"}`,
                transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 4 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: 4 }}>
                      {post.complaint}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{post.location || "Tempe, AZ"}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#2563eb" }}>{post.echo_count} voices</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </aside>

        {/* Map */}
        <div style={{ flex: 1, position: "relative" }}>
          {/* Style switcher */}
          <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10, display: "flex", gap: 4, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 4, boxShadow: "var(--card-shadow)" }}>
            {MAP_STYLES.map(s => (
              <button key={s.id} onClick={() => switchStyle(s)} style={{
                padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: "none", fontFamily: "Inter, sans-serif", transition: "all 0.15s",
                background: activeStyle === s.id ? "#2563eb" : "transparent",
                color: activeStyle === s.id ? "white" : "var(--muted)",
              }}>{s.label}</button>
            ))}
          </div>

          {/* Selected popup */}
          {selectedPost && (
            <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 20px", width: 320, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: TYPE_COLORS[selectedPost.issue_type] || "#94a3b8" }}>
                  {TYPE_LABELS[selectedPost.issue_type] || "Community"}
                </span>
                <button onClick={() => setSelectedPost(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 20, lineHeight: 1, padding: 0 }}>&times;</button>
              </div>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", lineHeight: 1.5, marginBottom: 10 }}>
                {selectedPost.complaint?.slice(0, 100)}{selectedPost.complaint?.length > 100 ? "..." : ""}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{selectedPost.echo_count} voices</span>
                <Link href={`/post/${selectedPost.id}`} style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>View Issue &rarr;</Link>
              </div>
            </div>
          )}

          {loading ? (
            <div className="loading-wrap"><div className="loading-spinner" /><p className="loading-text">Loading map...</p></div>
          ) : (
            <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
          )}
        </div>
      </div>
    </div>
  );
}
