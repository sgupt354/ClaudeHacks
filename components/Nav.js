import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "../pages/_app";

const LINKS = [
  { href: "/forum",   label: "Feed"    },
  { href: "/map",     label: "Map"     },
  { href: "/reels",   label: "Reels"   },
  { href: "/groups",  label: "Groups"  },
  { href: "/agent",   label: "Track"   },
];

function NotificationsDropdown({ onClose }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("civilian_notifications");
    if (stored) { setNotifications(JSON.parse(stored)); return; }
    const demo = [
      { id: 1,  text: "Someone echoed your issue about the broken streetlight on Rural Road", time: "2m ago",  read: false, href: "/post/fallback-1" },
      { id: 2,  text: "Your issue reached 25 voices — escalating to City Council",            time: "1h ago",  read: false, href: "/post/fallback-2" },
      { id: 3,  text: "Government responded to an issue you follow: Kiwanis Park shade",      time: "3h ago",  read: false, href: "/post/fallback-3" },
      { id: 4,  text: "New issue in your area: Pothole on Apache Blvd near 101",              time: "5h ago",  read: true,  href: "/post/fallback-4" },
      { id: 5,  text: "Follow-up letter sent automatically to Public Works Director",         time: "1d ago",  read: true,  href: "/post/fallback-5" },
      { id: 6,  text: "Someone echoed your issue about noise on Mill Ave",                    time: "1d ago",  read: true,  href: "/post/fallback-6" },
      { id: 7,  text: "Your issue reached 10 voices — department notified",                   time: "2d ago",  read: true,  href: "/post/fallback-7" },
      { id: 8,  text: "New issue in your area: Broken sidewalk near Tempe Town Lake",         time: "2d ago",  read: true,  href: "/post/fallback-8" },
      { id: 9,  text: "Community poll added to your group: Roads vs Parks priority",          time: "3d ago",  read: true,  href: "/groups" },
      { id: 10, text: "Issue resolved: Crosswalk lighting at University Dr",                  time: "4d ago",  read: true,  href: "/post/fallback-1" },
    ];
    localStorage.setItem("civilian_notifications", JSON.stringify(demo));
    setNotifications(demo);
  }, []);

  function markAllRead() {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("civilian_notifications", JSON.stringify(updated));
  }

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, zIndex: 9000, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, boxShadow: "0 16px 48px rgba(0,0,0,0.25)", width: 360, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
          Notifications {unread > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "#ef4444", color: "white", marginLeft: 6 }}>{unread}</span>}
        </p>
        {unread > 0 && <button onClick={markAllRead} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Mark all read</button>}
      </div>
      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        {notifications.map(n => (
          <Link key={n.id} href={n.href} onClick={onClose}
            style={{ display: "flex", gap: 10, padding: "12px 16px", textDecoration: "none", borderBottom: "1px solid var(--border)", background: n.read ? "transparent" : "rgba(37,99,235,0.05)", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
            onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : "rgba(37,99,235,0.05)"}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.read ? "transparent" : "#2563eb", flexShrink: 0, marginTop: 5 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, fontWeight: n.read ? 400 : 600 }}>{n.text}</p>
              <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{n.time}</p>
            </div>
          </Link>
        ))}
      </div>
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)" }}>
        <Link href="/notifications" onClick={onClose} style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>View all notifications</Link>
      </div>
    </div>
  );
}

function ProfileDropdown({ onClose }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, zIndex: 9000, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, boxShadow: "0 16px 48px rgba(0,0,0,0.25)", width: 200, overflow: "hidden" }}>
      {[
        { label: "Profile",     href: "/profile"  },
        { label: "Settings",    href: "/settings" },
        { label: "Help Center", href: "/help"     },
      ].map(item => (
        <Link key={item.href} href={item.href} onClick={onClose}
          style={{ display: "block", padding: "11px 16px", fontSize: 14, color: "var(--text)", textDecoration: "none", fontWeight: 500 }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          {item.label}
        </Link>
      ))}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        <button onClick={() => { toggleTheme(); onClose(); }}
          style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", fontSize: 14, color: "var(--muted)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 500 }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </div>
  );
}

export default function Nav() {
  const router = useRouter();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Each ref wraps its button + dropdown — outside click closes, inside doesn't
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("civilian_notifications");
    if (stored) {
      setUnreadCount(JSON.parse(stored).filter(n => !n.read).length);
    } else {
      setUnreadCount(3);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const iconBtnStyle = {
    background: "none", border: "1px solid var(--border)", cursor: "pointer",
    width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center",
    justifyContent: "center", color: "var(--muted)", transition: "all 0.15s", position: "relative",
  };

  return (
    <>
    <nav className="nav">
      {/* Left: logo + links */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Link href="/" className="nav-logo" style={{ marginRight: 8 }}>
          civil<span>ian</span>
        </Link>
        <div className="nav-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className={`nav-link${router.pathname.startsWith(l.href) ? " active" : ""}`}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right: raise issue, search, notifications, profile, hamburger */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

        {/* Raise Issue */}
        <button
          onClick={() => { window.location.href = "/compose"; }}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "8px 16px", borderRadius: 999,
            background: "linear-gradient(135deg,#2563eb,#7c3aed)",
            color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 2px 10px rgba(37,99,235,0.3)", transition: "opacity 0.15s", fontFamily: "inherit",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Raise Issue
        </button>

        {/* Search */}
        <Link href="/search" style={{ ...iconBtnStyle, textDecoration: "none" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </Link>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={() => { setShowNotifs(v => !v); setShowProfile(false); }}
            style={iconBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", color: "white", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg)" }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {showNotifs && <NotificationsDropdown onClose={() => setShowNotifs(false)} />}
        </div>

        {/* Profile */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <button
            onClick={() => { setShowProfile(v => !v); setShowNotifs(false); }}
            style={{ ...iconBtnStyle, background: "linear-gradient(135deg,#2563eb22,#7c3aed22)", borderColor: "rgba(37,99,235,0.3)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(37,99,235,0.3)"; }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
          {showProfile && <ProfileDropdown onClose={() => setShowProfile(false)} />}
        </div>

        {/* Mobile hamburger */}
        <button className="nav-mobile-btn" onClick={() => setMobileMenuOpen(v => !v)} aria-label="Toggle menu">
          {mobileMenuOpen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>

      </div>
    </nav>

    {/* Mobile drawer */}
    <div className={`mobile-drawer${mobileMenuOpen ? " open" : ""}`}>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)}
          className={`nav-link${router.pathname.startsWith(l.href) ? " active" : ""}`}>
          {l.label}
        </Link>
      ))}
    </div>
    </>
  );
}
