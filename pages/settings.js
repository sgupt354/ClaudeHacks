import { useState, useEffect } from "react";
import Nav from "../components/Nav";
import { useTheme } from "./_app";

function Toggle({ value, onChange, label, desc }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{label}</p>
        {desc && <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)} style={{
        width: 44, height: 24, borderRadius: 999, border: "none", cursor: "pointer",
        background: value ? "#2563eb" : "var(--border)", transition: "background 0.2s", position: "relative", flexShrink: 0,
      }}>
        <div style={{ position: "absolute", top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px", marginBottom: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>{title}</p>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [prefs, setPrefs] = useState({
    emailEchoResponse: true,
    emailNewArea: false,
    weeklyDigest: true,
    echoesPublic: true,
    fontSize: "normal",
    city: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("civilian_settings");
    if (saved) setPrefs(p => ({ ...p, ...JSON.parse(saved) }));
  }, []);

  function update(key, val) {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    localStorage.setItem("civilian_settings", JSON.stringify(next));
  }

  function exportData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      try { data[k] = JSON.parse(localStorage.getItem(k)); } catch { data[k] = localStorage.getItem(k); }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "civilian-data.json"; a.click();
    URL.revokeObjectURL(url);
  }

  function clearData() {
    if (!confirm("This will clear all your local data including echoes, settings, and notifications. Continue?")) return;
    localStorage.clear();
    window.location.reload();
  }

  return (
    <>
      <Nav />
      <div className="container" style={{ maxWidth: 640 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5, marginBottom: 24 }}>Settings</h1>

        <Section title="Notifications">
          <Toggle value={prefs.emailEchoResponse} onChange={v => update("emailEchoResponse", v)}
            label="Issue responses" desc="Notify me when issues I echoed get government responses" />
          <Toggle value={prefs.emailNewArea} onChange={v => update("emailNewArea", v)}
            label="New issues nearby" desc="Notify me about new issues in my area" />
          <Toggle value={prefs.weeklyDigest} onChange={v => update("weeklyDigest", v)}
            label="Weekly digest" desc="Weekly summary of resolved issues in your neighborhood" />
        </Section>

        <Section title="Language & Region">
          <div style={{ paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 8 }}>My city / neighborhood</p>
            <input type="text" placeholder="e.g. Tempe, AZ" value={prefs.city} onChange={e => update("city", e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>Used to personalize your feed and find relevant issues.</p>
          </div>
        </Section>

        <Section title="Display">
          <div style={{ paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 10 }}>Theme</p>
            <div style={{ display: "flex", gap: 8 }}>
              {["light", "dark"].map(t => (
                <button key={t} onClick={() => { if (theme !== t) toggleTheme(); }}
                  style={{ padding: "8px 20px", borderRadius: 8, border: `1.5px solid ${theme === t ? "#2563eb" : "var(--border)"}`, background: theme === t ? "rgba(37,99,235,0.1)" : "transparent", color: theme === t ? "#2563eb" : "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ paddingTop: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 10 }}>Font size</p>
            <div style={{ display: "flex", gap: 8 }}>
              {["normal", "large"].map(s => (
                <button key={s} onClick={() => update("fontSize", s)}
                  style={{ padding: "8px 20px", borderRadius: 8, border: `1.5px solid ${prefs.fontSize === s ? "#2563eb" : "var(--border)"}`, background: prefs.fontSize === s ? "rgba(37,99,235,0.1)" : "transparent", color: prefs.fontSize === s ? "#2563eb" : "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Privacy">
          <Toggle value={prefs.echoesPublic} onChange={v => update("echoesPublic", v)}
            label="Public echoes" desc="Let others see which issues you have echoed" />
          <div style={{ paddingTop: 14, display: "flex", gap: 10 }}>
            <button onClick={exportData} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Download my data
            </button>
            <button onClick={clearData} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.06)", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Clear all my data
            </button>
          </div>
        </Section>

        <Section title="About">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Built at</span>
              <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>HackASU 2026 — Track 4</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Team</span>
              <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
                <a href="https://github.com/sumedha" target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--text)", textDecoration: "none", fontWeight: 600 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#2563eb"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text)"}>Sumedha</a>
                {" + "}
                <a href="https://github.com/ARasugit20" target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--text)", textDecoration: "none", fontWeight: 600 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#2563eb"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text)"}>Aditya</a>
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Stack</span>
              <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>Next.js · Claude AI · Supabase · Mapbox</span>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <a href="https://github.com/ARasugit20/ClaudeHacks" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>GitHub</a>
              <a href="https://devpost.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>Devpost</a>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
