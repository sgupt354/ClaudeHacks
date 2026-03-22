import { useState, useEffect } from "react";
import Link from "next/link";

const STEPS = [
  {
    title: "Welcome to Civilian",
    subtitle: "Your neighborhood's voice, officially heard",
    body: "Civilian turns your complaint into a formal government letter — backed by real law, routed to the right official, and amplified by your community.",
    cta: "How it works",
  },
  {
    title: "How it works",
    subtitle: "Three steps to civic action",
    steps: [
      { icon: 1, label: "Describe the problem", desc: "Write in any language, as casually as you want. Attach a photo." },
      { icon: 2, label: "AI finds the official", desc: "Claude searches city records, finds the right person, writes a formal letter citing real law." },
      { icon: 3, label: "Community amplifies", desc: "Neighbors echo your issue. At 50 voices it escalates to City Council automatically." },
    ],
    cta: "Set your location",
  },
  {
    title: "Where are you?",
    subtitle: "Personalize your feed",
    body: "Tell us your city or neighborhood so we can show you relevant issues and connect you with your community.",
    cta: "Get started",
    hasLocation: true,
  },
];

export default function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [city, setCity] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("civilian_onboarded")) {
      setVisible(true);
    }
  }, []);

  function next() {
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    finish();
  }

  function finish() {
    if (city.trim()) {
      const settings = JSON.parse(localStorage.getItem("civilian_settings") || "{}");
      localStorage.setItem("civilian_settings", JSON.stringify({ ...settings, city }));
    }
    localStorage.setItem("civilian_onboarded", "true");
    setVisible(false);
  }

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "36px 32px", maxWidth: 460, width: "100%", boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}>
        {/* Step dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28, justifyContent: "center" }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 20 : 8, height: 8, borderRadius: 999, background: i === step ? "#2563eb" : "var(--border)", transition: "all 0.3s" }} />
          ))}
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 6, letterSpacing: -0.5 }}>{current.title}</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24, lineHeight: 1.6 }}>{current.subtitle}</p>

        {current.body && (
          <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7, marginBottom: 24 }}>{current.body}</p>
        )}

        {current.steps && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            {current.steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#2563eb", flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{s.label}</p>
                  <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {current.hasLocation && (
          <input type="text" placeholder="e.g. Tempe, AZ" value={city} onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === "Enter" && finish()}
            style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 16 }} />
        )}

        <button onClick={next}
          style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
          {current.cta}
        </button>

        <button onClick={finish}
          style={{ width: "100%", padding: "10px", borderRadius: 12, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          Skip
        </button>
      </div>
    </div>
  );
}
