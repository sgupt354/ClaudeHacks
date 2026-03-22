import Nav from "../components/Nav";
import Link from "next/link";

const s = {
  page: { background: "var(--bg)", minHeight: "100vh" },
  wrap: { maxWidth: 720, margin: "0 auto", padding: "40px 24px" },
  h1: { fontSize: 28, fontWeight: 800, color: "var(--text)", marginBottom: 8, letterSpacing: -0.5 },
  sub: { fontSize: 15, color: "var(--muted)", marginBottom: 40, lineHeight: 1.6 },
  section: { marginBottom: 36 },
  h2: { fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--border)" },
  li: { fontSize: 14, color: "var(--muted)", lineHeight: 1.7, marginBottom: 4, paddingLeft: 16, position: "relative" },
  dot: { position: "absolute", left: 0, color: "var(--text)" },
};

function List({ items }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {items.map(item => (
        <li key={item} style={s.li}><span style={s.dot}>·</span>{item}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <div style={s.page}>
      <Nav />
      <div style={s.wrap}>
        <h1 style={s.h1}>What we collect and what we don&apos;t</h1>
        <p style={s.sub}>No accounts. No tracking. No personal data. Here&apos;s exactly what happens when you use Civilian.</p>

        <div style={s.section}>
          <h2 style={s.h2}>What we collect</h2>
          <List items={[
            "Your complaint text (public — visible to anyone on the feed)",
            "Location you provide (public)",
            "Photo if you upload one (public)",
            "Which posts you echoed (stored in YOUR browser only, never our server)",
            "Anonymous voice count (a number, not tied to you)",
          ]} />
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>What we never collect</h2>
          <List items={[
            "Your name",
            "Your email address",
            "Your IP address",
            "Your device information",
            "Your account (there is no account)",
          ]} />
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>Who sees your complaint</h2>
          <List items={[
            "Anyone who visits Civilian — it's a public forum",
            "The government official it's routed to — only if YOU choose to send the email",
          ]} />
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>How to remove your post</h2>
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7 }}>
            Email <a href="mailto:remove@civilian.app" style={{ color: "#2563eb" }}>remove@civilian.app</a> with your post ID. We&apos;ll remove it within 24 hours. No questions asked.
          </p>
        </div>

        <div style={{ fontSize: 13, color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: 24 }}>
          <Link href="/accessibility" style={{ color: "#2563eb", textDecoration: "none", marginRight: 16 }}>Accessibility Statement</Link>
          <Link href="/policy" style={{ color: "#2563eb", textDecoration: "none" }}>Community Policy</Link>
        </div>
      </div>
    </div>
  );
}
