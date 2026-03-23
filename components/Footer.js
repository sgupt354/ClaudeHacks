import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      background: "var(--surface)",
      borderTop: "1px solid var(--border)",
    }}>
      <div style={{
        maxWidth: 1152,
        width: "100%",
        margin: "0 auto",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 13,
        color: "var(--muted)",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <span style={{ fontWeight: 700, letterSpacing: -0.3 }}>
          civil<span style={{ color: "#2563eb" }}>ian</span>
        </span>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { href: "/privacy",       label: "Privacy"          },
            { href: "/accessibility", label: "Accessibility"    },
            { href: "/policy",        label: "Community Policy" },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              style={{ color: "var(--muted)", textDecoration: "none", transition: "color 0.15s", whiteSpace: "nowrap" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}>
              {label}
            </Link>
          ))}
        </div>

        <span style={{ whiteSpace: "nowrap" }}>© 2026 Civilian · Tempe, AZ</span>
      </div>
    </footer>
  );
}
