import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const TYPE_COLORS = {
  traffic_safety: "#f59e0b",
  street_lighting: "#6366f1",
  road_maintenance: "#8b5cf6",
  parks_facilities: "#22c55e",
  noise_complaint: "#f97316",
  housing: "#ef4444",
  utilities: "#06b6d4",
  other: "#94a3b8",
};

const TYPE_LABELS = {
  traffic_safety: "Traffic Safety",
  street_lighting: "Street Lighting",
  road_maintenance: "Road Maintenance",
  parks_facilities: "Parks",
  noise_complaint: "Noise",
  housing: "Housing",
  utilities: "Utilities",
  other: "Community",
};

const MAP_STYLES = [
  { id: "light-v11", label: "🗺️ Map", style: "mapbox://styles/mapbox/light-v11", pitch: 0 },
  { id: "3d", label: "🏙️ 3D", style: "mapbox://styles/mapbox/light-v11", pitch: 50 },
  { id: "satellite-streets-v12", label: "🛰️ Satellite", style: "mapbox://styles/mapbox/satellite-streets-v12", pitch: 0 },
  { id: "dark-v11", label: "🌙 Dark", style: "mapbox://styles/mapbox/dark-v11", pitch: 0 },
];

// Cache geocoded coordinates so style switches don't re-geocode
const coordsCache = {};

async function geocode(postId, location, token) {
  if (coordsCache[postId]) return coordsCache[postId];
  try {
    const query = encodeURIComponent(`${location}, Tempe, Arizona, USA`);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1&country=US&proximity=-111.9400,33.4152`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.features?.length > 0) {
      const coords = data.features[0].center;
      coordsCache[postId] = coords;
      return coords;
    }
  } catch (e) {
    console.error("Geocoding failed:", e);
  }
  return null;
}

export default function MapPage() {
  const router = useRouter();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStyle, setActiveStyle] = useState("light-v11");
  const [mapboxLoaded, setMapboxLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.mapboxgl) { setMapboxLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js";
    script.onload = () => setMapboxLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (loading || !mapboxLoaded || !mapRef.current || mapInstanceRef.current) return;

    const mapboxgl = window.mapboxgl;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-111.9400, 33.4152],
      zoom: 12,
      pitch: 0,
    });

    mapInstanceRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    map.on("load", async () => {
      add3DBuildings(map);
      await addMarkers(map, mapboxgl, posts, token, router);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, mapboxLoaded]);

  function add3DBuildings(map) {
    if (map.getLayer("3d-buildings")) return;
    map.addLayer({
      id: "3d-buildings",
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: "fill-extrusion",
      minzoom: 14,
      paint: {
        "fill-extrusion-color": "#e8e6e0",
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": ["get", "min_height"],
        "fill-extrusion-opacity": 0.6,
      },
    });
  }

  async function addMarkers(map, mapboxgl, posts, token, router) {
    // Safely remove all existing markers
    markersRef.current.forEach((m) => { try { m.remove(); } catch (e) {} });
    markersRef.current = [];

    for (const post of posts) {
      // Use stored coords → cache → live geocode
      let coords = null;
      if (post.lat && post.lng) {
        coords = [post.lng, post.lat];
      } else if (post.location) {
        coords = await geocode(post.id, post.location, token);
      }
      if (!coords) continue;

      const color = TYPE_COLORS[post.issue_type] || TYPE_COLORS.other;
      const label = TYPE_LABELS[post.issue_type] || "Community";

      const tooltip = document.createElement("div");
      tooltip.style.cssText = `
        position: absolute;
        bottom: 48px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        padding: 12px 14px;
        width: 220px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s;
        z-index: 10;
        font-family: Inter, sans-serif;
      `;
      tooltip.innerHTML = `
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:${color};letter-spacing:0.5px;margin-bottom:5px">${label}</div>
        <p style="font-size:12px;font-weight:500;margin:0 0 5px;line-height:1.4;color:#1a1a1a">
          ${post.complaint.length > 80 ? post.complaint.slice(0, 80) + "..." : post.complaint}
        </p>
        <p style="font-size:11px;color:#888;margin:0 0 8px">📍 ${post.location || "Tempe, AZ"}</p>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:12px;color:#2563eb;font-weight:600">👥 ${post.echo_count} voices</span>
          <span style="font-size:11px;color:#888">Click to view →</span>
        </div>
        <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:12px;height:12px;background:white;rotate:45deg;box-shadow:2px 2px 4px rgba(0,0,0,0.08)"></div>
      `;

      const wrapper = document.createElement("div");
      wrapper.style.cssText = `position:relative;width:36px;height:36px;cursor:pointer;`;

      const pin = document.createElement("div");
      pin.style.cssText = `
        width:36px;height:36px;
        border-radius:50% 50% 50% 0;
        background:${color};
        border:2.5px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
        transition:transform 0.15s,box-shadow 0.15s;
      `;
      pin.innerHTML = `<span style="transform:rotate(45deg);font-size:11px;font-weight:700;color:white;display:block">${post.echo_count}</span>`;

      wrapper.appendChild(tooltip);
      wrapper.appendChild(pin);

      wrapper.addEventListener("mouseenter", () => {
        tooltip.style.opacity = "1";
        pin.style.transform = "rotate(-45deg) scale(1.2)";
        pin.style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)";
      });
      wrapper.addEventListener("mouseleave", () => {
        tooltip.style.opacity = "0";
        pin.style.transform = "rotate(-45deg) scale(1)";
        pin.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)";
      });
      wrapper.addEventListener("click", () => router.push(`/post/${post.id}`));

      const marker = new mapboxgl.Marker({ element: wrapper, anchor: "bottom" })
        .setLngLat(coords)
        .addTo(map);

      markersRef.current.push(marker);
    }
  }

  function switchStyle(styleObj) {
    setActiveStyle(styleObj.id);
    const map = mapInstanceRef.current;
    if (!map) return;
    map.easeTo({ pitch: styleObj.pitch, duration: 600 });
    if (styleObj.id !== "3d") {
      map.setStyle(styleObj.style);
      map.once("style.load", async () => {
        add3DBuildings(map);
        await addMarkers(map, window.mapboxgl, posts, process.env.NEXT_PUBLIC_MAPBOX_TOKEN, router);
      });
    }
  }

  const totalVoices = posts.reduce((sum, p) => sum + (p.echo_count || 0), 0);

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">civic<span>pulse</span></Link>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/forum" className="landing-link">Forum</Link>
          <Link href="/compose" className="nav-btn">+ Raise Issue</Link>
        </div>
      </nav>

      <div style={{
        background: "white", borderBottom: "1px solid #e8e6e0",
        padding: "8px 24px", display: "flex", alignItems: "center",
        gap: 20, fontSize: 13, color: "#444",
      }}>
        <span>🗺️ <strong>{posts.length}</strong> issues</span>
        <span>👥 <strong>{totalVoices}</strong> voices</span>
        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          {MAP_STYLES.map((s) => (
            <button key={s.id} onClick={() => switchStyle(s)} style={{
              padding: "5px 12px", borderRadius: 20, border: "1.5px solid",
              borderColor: activeStyle === s.id ? "#2563eb" : "#e8e6e0",
              background: activeStyle === s.id ? "#eff6ff" : "white",
              color: activeStyle === s.id ? "#2563eb" : "#444",
              fontSize: 12, fontWeight: activeStyle === s.id ? 600 : 400,
              cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "all 0.15s",
            }}>{s.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.entries(TYPE_COLORS).slice(0, 5).map(([type, color]) => (
            <span key={type} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
              {TYPE_LABELS[type]}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap">
          <div className="loading-spinner" />
          <p className="loading-text">Loading map...</p>
        </div>
      ) : (
        <div ref={mapRef} style={{ height: "calc(100vh - 112px)", width: "100%" }} />
      )}
    </>
  );
}