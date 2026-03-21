import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const LOADING_STEPS = [
  {
    text: "Reading your complaint...",
    icon: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f4dd/512.gif",
    lottie: "https://lottie.host/embed/8a2d3e4f-1234-5678-abcd-ef0123456789/animation.json",
    color: "#6366f1",
  },
  {
    text: "Searching city website...",
    color: "#f59e0b",
  },
  {
    text: "Finding the right official...",
    color: "#2563eb",
  },
  {
    text: "Checking city ordinances...",
    color: "#8b5cf6",
  },
  {
    text: "Writing your formal letter...",
    color: "#22c55e",
  },
  {
    text: "Almost done...",
    color: "#06b6d4",
  },
];

// SVG icons for each step — no emojis, clean animated SVGs
const STEP_ICONS = [
  // Reading — animated pencil
  () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="38" stroke="#6366f1" strokeWidth="3" strokeDasharray="8 4" style={{ animation: "spin 3s linear infinite" }} />
      <rect x="24" y="28" width="32" height="4" rx="2" fill="#6366f1" opacity="0.3" />
      <rect x="24" y="36" width="28" height="4" rx="2" fill="#6366f1" opacity="0.5" />
      <rect x="24" y="44" width="20" height="4" rx="2" fill="#6366f1" opacity="0.7" />
      <rect x="24" y="52" width="14" height="4" rx="2" fill="#6366f1" style={{ animation: "blink 1s ease-in-out infinite" }} />
    </svg>
  ),
  // Searching — animated magnifier
  () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="34" cy="34" r="16" stroke="#f59e0b" strokeWidth="3" fill="none" style={{ animation: "pulse 1.2s ease-in-out infinite" }} />
      <line x1="46" y1="46" x2="58" y2="58" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <circle cx="34" cy="34" r="8" fill="#fef3c7" style={{ animation: "pulse 1.2s ease-in-out infinite" }} />
    </svg>
  ),
  // Official — animated building
  () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="20" y="40" width="40" height="20" fill="#bfdbfe" />
      <rect x="26" y="32" width="28" height="10" fill="#93c5fd" />
      <rect x="34" y="20" width="12" height="14" fill="#60a5fa" />
      <rect x="26" y="44" width="6" height="16" fill="#2563eb" style={{ animation: "blink 0.8s ease-in-out infinite" }} />
      <rect x="36" y="44" width="8" height="16" fill="#3b82f6" />
      <rect x="48" y="44" width="6" height="16" fill="#2563eb" style={{ animation: "blink 0.8s ease-in-out 0.4s infinite" }} />
    </svg>
  ),
  // Ordinance — animated scales
  () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <line x1="40" y1="20" x2="40" y2="60" stroke="#8b5cf6" strokeWidth="2" />
      <line x1="20" y1="28" x2="60" y2="28" stroke="#8b5cf6" strokeWidth="2" />
      <circle cx="20" cy="40" r="8" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2" style={{ animation: "sway 2s ease-in-out infinite" }} />
      <circle cx="60" cy="36" r="8" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2" style={{ animation: "sway 2s ease-in-out infinite reverse" }} />
    </svg>
  ),
  // Writing — animated pen
  () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="18" y="30" width="44" height="32" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="2" />
      <rect x="24" y="38" width="20" height="3" rx="1.5" fill="#22c55e" opacity="0.4" style={{ animation: "grow 2s ease-in-out infinite" }} />
      <rect x="24" y="44" width="30" height="3" rx="1.5" fill="#22c55e" opacity="0.6" style={{ animation: "grow 2s ease-in-out 0.3s infinite" }} />
      <rect x="24" y="50" width="16" height="3" rx="1.5" fill="#22c55e" style={{ animation: "grow 2s ease-in-out 0.6s infinite" }} />
      <path d="M52 18 L60 26 L44 42 L36 42 L36 34 Z" fill="#16a34a" style={{ animation: "write 1.5s ease-in-out infinite" }} />
    </svg>
  ),
  // Done — animated checkmark
  () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="30" fill="#dcfce7" stroke="#22c55e" strokeWidth="3" style={{ animation: "pulse 1s ease-in-out infinite" }} />
      <polyline points="26,40 36,50 54,30" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ animation: "draw 0.5s ease-in-out forwards" }} />
    </svg>
  ),
];

export default function Compose() {
  const router = useRouter();
  const [complaint, setComplaint] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (step !== "analyzing") return;
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [step]);

  async function handleSubmit() {
    if (!complaint.trim()) return;
    setLoading(true);
    setStep("analyzing");
    setError("");

    try {
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint, location: location || "Tempe, Arizona" }),
      });

      if (!analyzeRes.ok) throw new Error("Analysis failed");
      const analyzed = await analyzeRes.json();

      const saveRes = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaint,
          formal_request: analyzed.formal_request,
          department: analyzed.department,
          official_name: analyzed.official_name,
          official_email: analyzed.official_email,
          issue_type: analyzed.issue_type,
          location: analyzed.location_extracted || location || "Tempe, AZ",
        }),
      });

      if (!saveRes.ok) throw new Error("Save failed");
      const saved = await saveRes.json();
      setResult({ ...analyzed, id: saved.id });
      setStep("done");
    } catch (err) {
      setError("Something went wrong. Check your API key and try again.");
      setStep("form");
    } finally {
      setLoading(false);
    }
  }

  if (step === "analyzing") {
    const current = LOADING_STEPS[loadingStep];
    const Icon = STEP_ICONS[loadingStep];
    return (
      <>
        <nav className="nav">
          <Link href="/" className="nav-logo">civic<span>pulse</span></Link>
        </nav>
        <div className="container">
          <div style={{ textAlign: "center", padding: "48px 24px" }}>

            {/* Animated SVG icon */}
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
              <Icon />
            </div>

            {/* Status text */}
            <p style={{ fontSize: 20, fontWeight: 600, color: current.color, marginBottom: 6, transition: "color 0.3s" }}>
              {current.text}
            </p>
            <p style={{ fontSize: 13, color: "#999", marginBottom: 32 }}>
              AI is searching the web for real officials and city ordinances
            </p>

            {/* Step progress bar */}
            <div style={{ maxWidth: 400, margin: "0 auto 32px" }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {LOADING_STEPS.map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: 4, borderRadius: 2,
                    background: i <= loadingStep ? current.color : "#e8e6e0",
                    transition: "background 0.4s",
                  }} />
                ))}
              </div>
              <p style={{ fontSize: 11, color: "#bbb" }}>
                Step {loadingStep + 1} of {LOADING_STEPS.length}
              </p>
            </div>

            {/* Completed steps */}
            <div style={{ maxWidth: 320, margin: "0 auto", textAlign: "left" }}>
              {LOADING_STEPS.slice(0, loadingStep + 1).map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: 13, marginBottom: 6,
                  color: i < loadingStep ? "#22c55e" : current.color,
                  fontWeight: i === loadingStep ? 600 : 400,
                }}>
                  <span style={{ fontSize: 16 }}>{i < loadingStep ? "✓" : "→"}</span>
                  {s.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.7; transform:scale(1.08); } }
          @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.2; } }
          @keyframes sway { 0%,100% { transform:translateY(0); } 50% { transform:translateY(6px); } }
          @keyframes grow { 0% { clip-path:inset(0 100% 0 0); } 100% { clip-path:inset(0 0% 0 0); } }
          @keyframes write { 0%,100% { transform:translate(0,0); } 50% { transform:translate(-4px,4px); } }
          @keyframes draw { from { stroke-dashoffset:100; } to { stroke-dashoffset:0; } }
        `}</style>
      </>
    );
  }

  if (step === "done" && result) {
    return (
      <>
        <nav className="nav">
          <Link href="/" className="nav-logo">civic<span>pulse</span></Link>
        </nav>
        <div className="container">
          <div className="success-banner">✓ Your issue has been posted and your letter is ready to send</div>
          <div className="result-section">
            <p className="result-label">📬 Send this letter to</p>
            <div className="official-card">
              <span className="official-icon">🏛️</span>
              <div>
                <p className="official-name">{result.official_name}</p>
                <p className="official-dept">{result.department}</p>
                <p className="official-email">{result.official_email}</p>
              </div>
            </div>
          </div>
          <div className="result-section">
            <p className="result-label">📄 Your formal letter</p>
            <p className="result-text">{result.formal_request}</p>
          </div>
          <button className="echo-btn" onClick={() => router.push(`/post/${result.id}`)}>
            👥 See who else is raising this issue
          </button>
          <Link href="/" style={{ display: "block", textAlign: "center", fontSize: 14, color: "#666", textDecoration: "none", marginTop: 12 }}>
            ← Back to feed
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">civic<span>pulse</span></Link>
      </nav>
      <div className="container">
        <Link href="/" className="back-link">← Back to feed</Link>
        <div className="compose-card">
          <h1 className="compose-title">Raise a community issue</h1>
          <p className="compose-subtitle">
            Describe the problem in plain English. Our AI will search for the real official,
            write a formal letter citing real city ordinances, and connect you with others raising the same issue.
          </p>
          {error && (
            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 14, color: "#991b1b" }}>
              {error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">What's the problem?</label>
            <textarea
              rows={4}
              placeholder="e.g. There's a broken streetlight on Rural Road near the library and it's been out for 3 weeks. It's dangerous at night..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Location (optional)</label>
            <input
              type="text"
              placeholder="e.g. Rural Road & Southern Ave, Tempe"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button className="submit-btn" onClick={handleSubmit} disabled={loading || !complaint.trim()}>
            {loading ? "Analyzing..." : "Find My Voice →"}
          </button>
        </div>
        <div className="notice">
          🔒 Your complaint is anonymous by default. AI writes the letter — you decide whether to send it.
        </div>
      </div>
    </>
  );
}