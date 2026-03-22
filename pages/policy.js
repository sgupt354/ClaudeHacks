import Link from "next/link";
import Nav from "../components/Nav";

const RULES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Civic Issues Only",
    body: "Posts must relate to real, local civic problems — infrastructure, safety, public services, parks, utilities, or housing. Personal disputes, commercial complaints, or off-topic content will be removed.",
    color: "#2563eb",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
      </svg>
    ),
    title: "No Violence or Threats",
    body: "Any content that threatens, incites, or glorifies violence against any person, group, or institution is strictly prohibited and will result in an immediate ban.",
    color: "#ef4444",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "No Hate Speech or Discrimination",
    body: "Content targeting individuals or groups based on race, ethnicity, religion, gender, sexual orientation, disability, or national origin is not allowed. Civilian is a platform for everyone.",
    color: "#f97316",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "Respect Privacy",
    body: "Do not post personal information (addresses, phone numbers, photos) of private individuals without consent. Public officials' contact information shared for civic purposes is permitted.",
    color: "#8b5cf6",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: "Be Accurate",
    body: "Only report issues you have personally witnessed or have reliable knowledge of. Deliberately false reports waste city resources and undermine the community's credibility.",
    color: "#22c55e",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Constructive Tone",
    body: "Describe problems factually and constructively. Abusive, profane, or inflammatory language — even when directed at officials — reduces the effectiveness of your complaint and may be removed.",
    color: "#06b6d4",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    title: "No Spam or Duplicates",
    body: "Before posting, search for existing reports on the same issue. Duplicate posts dilute community voices. Use the Echo button to add your support to an existing issue instead.",
    color: "#f59e0b",
  },
];

const ENFORCEMENT = [
  { step: "1st violation", action: "Warning + content removed", color: "#f59e0b" },
  { step: "2nd violation", action: "7-day posting suspension", color: "#f97316" },
  { step: "3rd violation", action: "Permanent ban", color: "#ef4444" },
  { step: "Severe violation", action: "Immediate permanent ban", color: "#7c3aed" },
];

export default function PolicyPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px" }}>
        <Link href="/forum" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 32 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to feed
        </Link>

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)", marginBottom: 16 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", letterSpacing: 0.5 }}>COMMUNITY POLICY</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 800, letterSpacing: -2, color: "var(--text)", marginBottom: 16, lineHeight: 1.1 }}>
            Civilian Community<br />Guidelines
          </h1>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.7, maxWidth: 560 }}>
            Civilian exists to give residents a real voice in their city. These guidelines keep the platform focused, respectful, and effective. AI automatically checks all posts before they go live.
          </p>
        </div>

        {/* Rules */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 48 }}>
          {RULES.map((rule, i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px", display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${rule.color}18`, border: `1px solid ${rule.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: rule.color, flexShrink: 0 }}>
                {rule.icon}
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{rule.title}</p>
                <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65 }}>{rule.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* AI Moderation */}
        <div style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 16, padding: "24px 28px", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>AI-Powered Moderation</p>
          </div>
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7 }}>
            Every post is reviewed by Claude AI before publishing. The AI checks for policy violations by context — not just keywords — so nuanced violations are caught too. If your post is flagged, you&apos;ll see an inline message explaining why before you submit.
          </p>
        </div>

        {/* Enforcement */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 28px", marginBottom: 32 }}>
          <p style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--muted)", marginBottom: 16 }}>Enforcement</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ENFORCEMENT.map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: `${e.color}18`, color: e.color, border: `1px solid ${e.color}30`, minWidth: 120, textAlign: "center" }}>{e.step}</span>
                <span style={{ fontSize: 14, color: "var(--text)" }}>{e.action}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, textAlign: "center" }}>
          Questions about these guidelines? Raise a concern through the platform.
          <br />Last updated March 2026.
        </p>
      </div>
    </div>
  );
}
