import Link from "next/link";
import { useRouter } from "next/router";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/forum", label: "Forum" },
  { href: "/reels", label: "Reels" },
  { href: "/map", label: "Map" },
];

export default function Navbar({ showComposeLink = true }) {
  const router = useRouter();

  return (
    <nav className="civic-nav">
      <Link href="/" className="civic-nav-logo">
        civic<span>pulse</span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: 8,
              transition: "all 150ms ease",
              color: router.pathname === link.href
                ? "hsl(var(--primary))"
                : "hsl(var(--muted-foreground))",
              background: router.pathname === link.href
                ? "rgba(37,99,235,0.12)"
                : "transparent",
            }}
          >
            {link.label}
          </Link>
        ))}
        {showComposeLink && (
          <Link href="/compose" className="civic-btn-primary" style={{ fontSize: 14, marginLeft: 8, padding: "8px 16px" }}>
            + Raise Issue
          </Link>
        )}
      </div>
    </nav>
  );
}
