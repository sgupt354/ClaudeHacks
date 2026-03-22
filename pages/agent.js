import { useState } from "react";
import Link from "next/link";
import Nav from "../components/Nav";

const AGENT_LOG = [
  {
    id: "log-1",
    post_id: "demo-4",
    post_text: "Pothole on Apache Blvd near the 101 overpass",
    action: "Letter sent to Transportation Services",
    detail: "Formal letter citing ARS § 28-672 sent to publicworks@tempe.gov",
    timestamp: "2h ago",
    status: "done",
  },
  {
    id: "log-2",
    post_id: "demo-1",
    post_text: "Crosswalk lighting at Mill Ave & University Dr",
    action: "No response detected after 7 days",
    detail: "Monitoring official inbox — no reply from Kevin Mattingly",
    timestamp: "1d ago",
    status: "warning",
  },
  {
    id: "log-3",
    post_id: "demo-1",
    post_text: "Crosswalk lighting at Mill Ave & University Dr",
    action: "Follow-up letter auto-sent to official",
    detail: "Second letter sent to publicworks@tempe.gov with escalation notice",
    timestamp: "1d ago",
    status: "done",
  },
  {
    id: "log-4",
    post_id: "demo-3",
    post_text: "Kiwanis Park shade structures — 160°F slide",
    action: "Official responded — agent task complete",
    detail: "Sarah Chen, Parks & Recreation Director replied within 4 days",
    timestamp: "3d ago",
    status: "resolved",
  },
  {
    id: "log-5",
    post_id: "demo-2",
    post_text: "Three streetlights out on Rural Road",
    action: "Letter sent to Public Works",
    detail: "Formal letter citing Tempe City Code § 16-42 sent to streetlighting@tempe.gov",
    timestamp: "4d ago",
    status: "done",
  },
  {
    id: "log-6",
    post_id: "demo-4",
    post_text: "Pothole on Apache Blvd near the 101 overpass",
    action: "Official responded — agent task complete",
    detail: "Transportation Services confirmed Priority 1 repair dispatched",
    timestamp: "5d ago",
    status: "resolved",
  },
  {
    id: "log-7",
    post_id: "demo-3",
    post_text: "Kiwanis Park shade structures — 160°F slide",
    action: "No response detected after 7 days",
    detail: "Monitoring official inbox — no reply from Parks & Recreation",
    timestamp: "6d ago",
    status: "warning",
  },
  {
    id: "log-8",
    post_id: "demo-3",
    post_text: "Kiwanis Park shade structures — 160°F slide",
    action: "Follow-up letter auto-sent to official",
    detail: "Escalation letter sent citing community health risk and 48 resident signatures",
    timestamp: "6d ago",
    status: "done",
  },
];

const STATUS_CONFIG = {
  done:     { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)",   label: "Sent",      icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  )},
  warning:  { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)",  label: "Watching",  icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  )},
  resolved: { color: "#2563eb", bg: "rgba(37,99,235,0.1)",   border: "rgba(37,99,235,0.3)",   label: "Resolved",  icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  )},
};

const STATS = [
  { value: "8", label: "Letters sent", color: "#2563eb" },
  { value: "3", label: "Follow-ups triggered", color: "#f59e0b" },
  { value: "2", label: "Issues resolved", color: "#22c55e" },
  { value: "4.2d", label: "Avg response time", color: "#8b5cf6" },
];

export default function AgentPage() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? AGENT_LOG : AGENT_LOG.filter(l => l.status === filter);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5 }}>Issue Tracker</h1>
              <p style={{ fontSize: 13, color: "var(--muted)" }}>Track your issues. See when government responds.</p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "pulse-dot 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e" }}>Tracking Active</span>
            </div>
          </div>

          {/* TinyFish badge */}
          <a href="https://agent.tinyfish.ai" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: "linear-gradient(135deg,rgba(37,99,235,0.12),rgba(124,58,237,0.12))", border: "1px solid rgba(37,99,235,0.25)", textDecoration: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>Powered by TinyFish AI Agents</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 32 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px", boxShadow: "var(--card-shadow)" }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: -1, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 14, padding: "16px 20px", marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#2563eb", marginBottom: 10 }}>How the agent works</p>
          <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
            {[
              "Letter sent to official",
              "Community consented",
              "Agent monitors 7 days",
              "No reply?",
              "Follow-up auto-sent",
              "Issue resolved",
            ].map((step, i, arr) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{step}</span>
                {i < arr.length - 1 && <span style={{ color: "var(--muted)", fontSize: 14, margin: "0 4px" }}>→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[["all","All Activity"],["done","Sent"],["warning","Watching"],["resolved","Resolved"]].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${filter === key ? "#2563eb" : "var(--border)"}`,
              background: filter === key ? "#2563eb" : "var(--surface)",
              color: filter === key ? "white" : "var(--muted)",
              transition: "all 0.15s",
            }}>{label}</button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div style={{ position: "absolute", left: 19, top: 0, bottom: 0, width: 2, background: "var(--border)", zIndex: 0 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {filtered.map((log, i) => {
              const cfg = STATUS_CONFIG[log.status];
              return (
                <div key={log.id} style={{ display: "flex", gap: 16, paddingBottom: 24, position: "relative", zIndex: 1 }}>
                  {/* Dot */}
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--surface)", border: `2px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color, flexShrink: 0 }}>
                    <div style={{ color: cfg.color }}>{cfg.icon}</div>
                  </div>

                  {/* Card */}
                  <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", boxShadow: "var(--card-shadow)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", lineHeight: 1.4 }}>{log.action}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{cfg.label}</span>
                        <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>{log.timestamp}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, lineHeight: 1.5 }}>{log.detail}</p>
                    <Link href={`/post/${log.post_id}`} style={{ fontSize: 12, color: "#2563eb", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      {log.post_text}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "24px 0 0", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: 12, color: "var(--muted)" }}>
            Agent runs every 24h · Powered by{" "}
            <a href="https://agent.tinyfish.ai" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>TinyFish</a>
          </p>
        </div>
      </div>
    </div>
  );
}
