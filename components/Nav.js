import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "../pages/_app";

const LINKS = [
  { href: "/forum",   label: "Feed"    },
  { href: "/map",     label: "Map"     },
  { href: "/reels",   label: "Reels"   },
  { href: "/groups",  label: "Groups"  },
  { href: "/agent",   label: "Agent"   },
  { href: "/policy",  label: "Policy"  },
  { href: "/profile", label: "Profile" },
];

const SHORTCUTS = [
  { key: "N", desc: "New issue (compose)" },
  { key: "M", desc: "Open map" },
  { key: "F", desc: "Go to feed" },
  { key: "/", desc: "Focus search (on feed)" },
  { key: "Esc", desc: "Close modal" },
  { key: "?", desc: "Show this panel" },
];

export default function Nav() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">
          civil<span>ian</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link${router.pathname.startsWith(l.href) ? " active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Shortcuts button */}
          <button
            onClick={() => setShowShortcuts(v => !v)}
            title="Keyboard shortcuts (?)"
            style={{ background: "none", border: "1px solid var(--border)", cursor: "pointer", width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 13, fontWeight: 700, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
          >?</button>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          <Link href="/compose" className="nav-btn">+ Raise Issue</Link>
        </div>
      </nav>

      {/* Shortcuts modal */}
      {showShortcuts && (
        <div onClick={() => setShowShortcuts(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", width: 340, boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Keyboard Shortcuts</p>
              <button onClick={() => setShowShortcuts(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 20, lineHeight: 1, padding: 0 }}>&times;</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SHORTCUTS.map(s => (
                <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{s.desc}</span>
                  <kbd style={{ fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "monospace" }}>{s.key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 20, fontSize: 12, color: "var(--muted)" }}>
        <Link href="/privacy" style={{ color: "var(--muted)", textDecoration: "none" }} onMouseEnter={e => e.currentTarget.style.color = "#2563eb"} onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}>Privacy</Link>
        <Link href="/accessibility" style={{ color: "var(--muted)", textDecoration: "none" }} onMouseEnter={e => e.currentTarget.style.color = "#2563eb"} onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}>Accessibility</Link>
        <Link href="/policy" style={{ color: "var(--muted)", textDecoration: "none" }} onMouseEnter={e => e.currentTarget.style.color = "#2563eb"} onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}>Community Policy</Link>
        <span>· Civilian · Tempe, AZ</span>
      </footer>
    </>
  );
}
