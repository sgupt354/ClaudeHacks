import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "../pages/_app";

const LINKS = [
  { href: "/forum",   label: "Feed"    },
  { href: "/map",     label: "Map"     },
  { href: "/reels",   label: "Reels"   },
  { href: "/groups",  label: "Groups"  },
  { href: "/profile", label: "Profile" },
];

export default function Nav() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  return (
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
  );
}
