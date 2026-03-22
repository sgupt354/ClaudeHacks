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

export default function AccessibilityPage() {
  return (
    <div style={s.page}>
      <Nav />
      <div style={s.wrap}>
        <h1 style={s.h1}>Who we&apos;re designed for — and who we&apos;re not reaching yet</h1>
        <p style={s.sub}>Civic technology should serve everyone. Here&apos;s an honest look at who benefits from Civilian today, and who we&apos;re failing to reach.</p>

        <div style={s.section}>
          <h2 style={s.h2}>Who benefits most</h2>
          <List items={[
            "English-speaking residents with smartphones",
            "People comfortable with technology",
            "Those with reliable internet access",
            "Residents who feel safe engaging with government",
          ]} />
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>Who we&apos;re not yet reaching — and why that matters</h2>
          <List items={[
            "Non-English speakers (we only support English currently)",
            "Elderly residents without smartphones",
            "People without internet access",
            "Undocumented residents who fear government contact",
            "Renters who fear landlord retaliation for civic complaints",
          ]} />
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>What we&apos;re doing about it</h2>
          <List items={[
            "Planning: Spanish language support",
            "Planning: SMS-only interface for no-smartphone access",
            "Planning: Partner with community organizations as intermediaries",
            "Current: Anonymous by default protects vulnerable residents",
          ]} />
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>The bias we acknowledge</h2>
          <List items={[
            "Issues reported most = issues with most online-active residents",
            "Wealthier neighborhoods may dominate the feed",
            "Our AI was trained on English data — may perform differently for non-standard English descriptions",
          ]} />
        </div>

        <div style={{ fontSize: 13, color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: 24 }}>
          <Link href="/privacy" style={{ color: "#2563eb", textDecoration: "none", marginRight: 16 }}>Privacy Policy</Link>
          <Link href="/policy" style={{ color: "#2563eb", textDecoration: "none" }}>Community Policy</Link>
        </div>
      </div>
    </div>
  );
}
