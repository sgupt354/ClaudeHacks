import { useState, useEffect, useRef, useCallback } from "react";
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

const ISSUE_IMAGES = {
  traffic_safety:   "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400",
  traffic:          "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400",
  parks_facilities: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400",
  road_maintenance: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400",
  street_lighting:  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400",
  noise_complaint:  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
  housing:          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400",
  other:            "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400",
};

const MAP_STYLES = [
  { id: "streets",   label: "Street",    style: "mapbox://styles/mapbox/streets-v12"           },
  { id: "satellite", label: "Satellite", style: "mapbox://styles/mapbox/satellite-streets-v12" },
  { id: "dark",      label: "Dark",      style: "mapbox://styles/mapbox/dark-v11"              },
  { id: "3d",        label: "3D",        style: "mapbox://styles/mapbox/streets-v12"           },
];

const FILTERS = ["all","traffic_safety","road_maintenance","parks_facilities","street_lighting","noise_complaint","housing"];
const FILTER_LABELS = {
  all: "All", traffic_safety: "Traffic", road_maintenance: "Roads",
  parks_facilities: "Parks", street_lighting: "Lighting",
  noise_complaint: "Noise", housing: "Housing",
};

async function geocodeLocation(locationText) {
  if (!locationText) return null;
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const query = encodeURIComponent(locationText + ', Tempe, Arizona');
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1&country=US&proximity=-111.9400,33.4255`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.features?.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
  } catch (e) {
    console.error('Geocode failed:', e);
  }
  return null;
}

// Hover popup — stays visible when cursor moves from pin onto popup
function HoverPopup({ post, rect, onMouseEnter, onMouseLeave }) {
  if (!post || !rect) return null;
  const color = TYPE_COLORS[post.issue_type] || TYPE_COLORS.other;
  const img = post.image_url || ISSUE_IMAGES[post.issue_type] || ISSUE_IMAGES.other;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "fixed",
        left: rect.left + rect.width / 2,
        top: rect.top - 8,
        transform: "translate(-50%, -100%)",
        zIndex: 9999,
        background: "var(--surface)",
        border: `1px solid ${color}66`,
        borderRadius: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        width: 260,
        overflow: "hidden",
        pointerEvents: "auto",
        cursor: "pointer",
      }}
    >
      <img src={img} alt="" style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />
      <div style={{ padding: "12px 14px" }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color }}>
          {TYPE_LABELS[post.issue_type] || "Community"}
        </span>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", lineHeight: 1.45, margin: "6px 0 8px" }}>
          {(post.complaint || post.text || "").slice(0, 90)}{(post.complaint || post.text || "").length > 90 ? "..." : ""}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>{post.echo_count || 0} voices</span>
          <Link href={`/post/${post.id}`} style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textDecoration: "none", padding: "4px 10px", borderRadius: 999, background: "rgba(37,99,235,0.1)" }}>
            View Issue →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const hoverTimerRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [enrichedPosts, setEnrichedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [activeStyle, setActiveStyle] = useState("streets");
  const [activeFilter, setActiveFilter] = useState("all");
  const [mapboxLoaded, setMapboxLoaded] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [hoverPost, setHoverPost] = useState(null);
  const [hoverRect, setHoverRect] = useState(null);
  const [is3D, setIs3D] = useState(false);

  useEffect(() => {
    fetch("/api/posts")
      .then(r => r.json())
      .then(async (d) => {
        const raw = Array.isArray(d) ? d : [];
        setPosts(raw);
        setLoading(false);
        setGeocoding(true);
        const enriched = await Promise.all(
          raw.map(async (post) => {
            if (post.lat && post.lng) return post;
            if (post.location) {
              const coords = await geocodeLocation(post.location);
              if (coords) return { ...post, lat: coords.lat, lng: coords.lng };
            }
            return post;
          })
        );
        setEnrichedPosts(enriched);
        setGeocoding(false);
      })
      .catch(() => { setLoading(false); setGeocoding(false); });
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
    map.on("load", () => {
      addMarkers(map, mapboxgl, enrichedPosts.length ? enrichedPosts : posts, "all");
      addHeatmap(map, enrichedPosts.length ? enrichedPosts : posts);
    });
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, [loading, mapboxLoaded]);

  // Re-render markers once geocoding completes
  useEffect(() => {
    if (geocoding || !mapInstanceRef.current || !window.mapboxgl) return;
    const map = mapInstanceRef.current;
    if (map.loaded()) {
      addMarkers(map, window.mapboxgl, enrichedPosts, activeFilter);
      addHeatmap(map, enrichedPosts);
    } else {
      map.once("load", () => {
        addMarkers(map, window.mapboxgl, enrichedPosts, activeFilter);
        addHeatmap(map, enrichedPosts);
      });
    }
  }, [geocoding, enrichedPosts]);

  const showHover = useCallback((post, rect) => {
    clearTimeout(hoverTimerRef.current);
    setHoverPost(post);
    setHoverRect(rect);
  }, []);

  const hideHover = useCallback(() => {
    hoverTimerRef.current = setTimeout(() => {
      setHoverPost(null);
      setHoverRect(null);
    }, 120); // small delay so cursor can move from pin to popup
  }, []);

  const keepHover = useCallback(() => {
    clearTimeout(hoverTimerRef.current);
  }, []);

  function addHeatmap(map, postsData) {
    const features = postsData
      .filter(p => p.lat && p.lng)
      .map(p => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [p.lng, p.lat] },
        properties: { weight: Math.min((p.echo_count || 1) / 10, 1) },
      }));
    if (!features.length) return;
    if (map.getSource("heatmap-source")) {
      map.getSource("heatmap-source").setData({ type: "FeatureCollection", features });
      return;
    }
    map.addSource("heatmap-source", { type: "geojson", data: { type: "FeatureCollection", features } });
    map.addLayer({
      id: "heatmap-layer",
      type: "heatmap",
      source: "heatmap-source",
      maxzoom: 15,
      paint: {
        "heatmap-weight": ["interpolate", ["linear"], ["get", "weight"], 0, 0, 1, 1],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 15, 3],
        "heatmap-color": [
          "interpolate", ["linear"], ["heatmap-density"],
          0, "rgba(0,0,0,0)",
          0.2, "rgba(37,99,235,0.4)",
          0.5, "rgba(245,158,11,0.6)",
          0.8, "rgba(239,68,68,0.75)",
          1, "rgba(239,68,68,0.9)",
        ],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 20, 15, 40],
        "heatmap-opacity": 0.55,
      },
    }, "waterway-label");
  }

  async function addMarkers(map, mapboxgl, postsToShow, filter) {
    markersRef.current.forEach(m => { try { m.remove(); } catch {} });
    markersRef.current = [];
    const filtered = filter === "all" ? postsToShow : postsToShow.filter(p => p.issue_type === filter);

    for (const post of filtered) {
      let coords = null;
      if (post.lat && post.lng) coords = [post.lng, post.lat];
      if (!coords) continue;

      const color = TYPE_COLORS[post.issue_type] || TYPE_COLORS.other;
      const container = document.createElement("div");
      container.style.cssText = "width:36px;height:36px;position:relative;cursor:pointer;";

      const inner = document.createElement("div");
      inner.style.cssText = `
        width:32px;height:32px;border-radius:50%;
        background:${color};border:2.5px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        display:flex;align-items:center;justify-content:center;
        font-size:10px;font-weight:700;color:white;
        transition:transform 0.15s,box-shadow 0.15s;
        font-family:Inter,sans-serif;
        position:absolute;top:2px;left:2px;
      `;
      inner.textContent = post.echo_count || 0;
      container.appendChild(inner);

      container.addEventListener("mouseenter", () => {
        inner.style.transform = "scale(1.3)";
        inner.style.boxShadow = `0 4px 16px ${color}88`;
        const rect = container.getBoundingClientRect();
        showHover(post, rect);
      });
      container.addEventListener("mouseleave", () => {
        inner.style.transform = "scale(1)";
        inner.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)";
        hideHover();
      });
      container.addEventListener("click", () => {
        setSelectedPost(post);
        map.flyTo({ center: coords, zoom: 15, duration: 800 });
      });

      const marker = new mapboxgl.Marker({ element: container }).setLngLat(coords).addTo(map);
      markersRef.current.push(marker);
    }
  }

  function enable3D(map) {
    if (!map.getLayer("3d-buildings")) {
      if (!map.getSource("composite")) return;
      map.addLayer({
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 13,
        paint: {
          "fill-extrusion-color": "#aaa",
          "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 13, 0, 13.5, ["get", "height"]],
          "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 13, 0, 13.5, ["get", "min_height"]],
          "fill-extrusion-opacity": 0.6,
        },
      });
    }
    map.easeTo({ pitch: 60, bearing: -20, duration: 800 });
  }

  function disable3D(map) {
    if (map.getLayer("3d-buildings")) map.removeLayer("3d-buildings");
    map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
  }

  function switchStyle(s) {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (s.id === "3d") {
      // Toggle 3D on current style
      const next = !is3D;
      setIs3D(next);
      if (next) enable3D(map);
      else disable3D(map);
      return;
    }

    setActiveStyle(s.id);
    setIs3D(false);
    map.setStyle(s.style);
    map.once("style.load", () => {
      addMarkers(map, window.mapboxgl, posts, activeFilter);
    });
  }

  function applyFilter(f) {
    setActiveFilter(f);
    const map = mapInstanceRef.current;
    if (map) addMarkers(map, window.mapboxgl, enrichedPosts, f);
  }

  function flyTo(post) {
    setSelectedPost(post);
    const map = mapInstanceRef.current;
    if (!map) return;
    const coords = post.lat && post.lng ? [post.lng, post.lat] : null;
    if (coords) map.flyTo({ center: coords, zoom: 15, duration: 800 });
  }

  const filteredList = activeFilter === "all" ? posts : posts.filter(p => p.issue_type === activeFilter);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav />

      {/* Hover popup — rendered at root to avoid clipping, stays alive on popup hover */}
      <HoverPopup
        post={hoverPost}
        rect={hoverRect}
        onMouseEnter={keepHover}
        onMouseLeave={hideHover}
      />

      {/* Filter bar */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "10px 24px", display: "flex", alignItems: "center", gap: 8, overflowX: "auto" }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => applyFilter(f)} style={{
            padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
            border: `1px solid ${activeFilter === f ? "#2563eb" : "var(--border)"}`,
            background: activeFilter === f ? "#2563eb" : "var(--surface)",
            color: activeFilter === f ? "white" : "var(--muted)",
            fontFamily: "inherit", transition: "all 0.15s",
          }}>{FILTER_LABELS[f]}</button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--muted)", whiteSpace: "nowrap" }}>
          {filteredList.length} issues
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", height: "calc(100vh - 112px)" }}>
        {/* Sidebar */}
        <aside style={{ width: 300, flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--border)", overflowY: "auto" }}>
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
          {/* Style + 3D switcher */}
          <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10, display: "flex", gap: 4, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 4, boxShadow: "var(--card-shadow)" }}>
            {MAP_STYLES.map(s => {
              const active = s.id === "3d" ? is3D : (activeStyle === s.id && !is3D);
              return (
                <button key={s.id} onClick={() => switchStyle(s)} style={{
                  padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: "none", fontFamily: "inherit", transition: "all 0.15s",
                  background: active ? "#2563eb" : "transparent",
                  color: active ? "white" : "var(--muted)",
                }}>{s.label}</button>
              );
            })}
          </div>

          {/* Selected post panel */}
          {selectedPost && (
            <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 20px", width: 320, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: TYPE_COLORS[selectedPost.issue_type] || "#94a3b8" }}>
                  {TYPE_LABELS[selectedPost.issue_type] || "Community"}
                </span>
                <button onClick={() => setSelectedPost(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 20, lineHeight: 1, padding: 0 }}>&times;</button>
              </div>
              {(selectedPost.image_url || ISSUE_IMAGES[selectedPost.issue_type]) && (
                <img src={selectedPost.image_url || ISSUE_IMAGES[selectedPost.issue_type]} alt="" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 10, display: "block" }} />
              )}
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", lineHeight: 1.5, marginBottom: 10 }}>
                {(selectedPost.complaint || "").slice(0, 100)}{(selectedPost.complaint || "").length > 100 ? "..." : ""}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{selectedPost.echo_count} voices</span>
                <Link href={`/post/${selectedPost.id}`} style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>View Issue →</Link>
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
