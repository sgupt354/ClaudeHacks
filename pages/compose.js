import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Nav from "../components/Nav";

const LOADING_STEPS = [
  { text: "Reading your complaint...",      color: "#6366f1" },
  { text: "Analyzing your photo...",        color: "#0ea5e9" },
  { text: "Searching city website...",      color: "#f59e0b" },
  { text: "Finding the right official...",  color: "#2563eb" },
  { text: "Checking city ordinances...",    color: "#8b5cf6" },
  { text: "Writing your formal letter...",  color: "#22c55e" },
  { text: "Almost done...",                 color: "#06b6d4" },
];

const STEP_ICONS = [
  () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="38" stroke="#6366f1" strokeWidth="3" strokeDasharray="8 4" style={{ animation: "spin 3s linear infinite" }} />
      <rect x="24" y="28" width="32" height="4" rx="2" fill="#6366f1" opacity="0.3" />
      <rect x="24" y="36" width="28" height="4" rx="2" fill="#6366f1" opacity="0.5" />
      <rect x="24" y="44" width="20" height="4" rx="2" fill="#6366f1" opacity="0.7" />
      <rect x="24" y="52" width="14" height="4" rx="2" fill="#6366f1" style={{ animation: "blink 1s ease-in-out infinite" }} />
    </svg>
  ),
  () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="16" y="24" width="48" height="34" rx="8" fill="rgba(14,165,233,0.15)" stroke="#0ea5e9" strokeWidth="3" />
      <circle cx="40" cy="41" r="10" fill="rgba(14,165,233,0.2)" stroke="#0284c7" strokeWidth="3" />
      <circle cx="53" cy="32" r="3" fill="#0284c7" style={{ animation: "blink 1s ease-in-out infinite" }} />
    </svg>
  ),
  () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="34" cy="34" r="16" stroke="#f59e0b" strokeWidth="3" fill="none" style={{ animation: "pulse 1.2s ease-in-out infinite" }} />
      <line x1="46" y1="46" x2="58" y2="58" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <circle cx="34" cy="34" r="8" fill="rgba(245,158,11,0.2)" style={{ animation: "pulse 1.2s ease-in-out infinite" }} />
    </svg>
  ),
  () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="20" y="40" width="40" height="20" fill="rgba(37,99,235,0.15)" />
      <rect x="26" y="32" width="28" height="10" fill="rgba(37,99,235,0.2)" />
      <rect x="34" y="20" width="12" height="14" fill="rgba(37,99,235,0.3)" />
      <rect x="26" y="44" width="6" height="16" fill="#2563eb" style={{ animation: "blink 0.8s ease-in-out infinite" }} />
      <rect x="36" y="44" width="8" height="16" fill="#3b82f6" />
      <rect x="48" y="44" width="6" height="16" fill="#2563eb" style={{ animation: "blink 0.8s ease-in-out 0.4s infinite" }} />
    </svg>
  ),
  () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <line x1="40" y1="20" x2="40" y2="60" stroke="#8b5cf6" strokeWidth="2" />
      <line x1="20" y1="28" x2="60" y2="28" stroke="#8b5cf6" strokeWidth="2" />
      <circle cx="20" cy="40" r="8" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6" strokeWidth="2" style={{ animation: "sway 2s ease-in-out infinite" }} />
      <circle cx="60" cy="36" r="8" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6" strokeWidth="2" style={{ animation: "sway 2s ease-in-out infinite reverse" }} />
    </svg>
  ),
  () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="18" y="30" width="44" height="32" rx="4" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="2" />
      <rect x="24" y="38" width="20" height="3" rx="1.5" fill="#22c55e" opacity="0.4" style={{ animation: "grow 2s ease-in-out infinite" }} />
      <rect x="24" y="44" width="30" height="3" rx="1.5" fill="#22c55e" opacity="0.6" style={{ animation: "grow 2s ease-in-out 0.3s infinite" }} />
      <rect x="24" y="50" width="16" height="3" rx="1.5" fill="#22c55e" style={{ animation: "grow 2s ease-in-out 0.6s infinite" }} />
      <path d="M52 18 L60 26 L44 42 L36 42 L36 34 Z" fill="#16a34a" style={{ animation: "write 1.5s ease-in-out infinite" }} />
    </svg>
  ),
  () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="30" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="3" style={{ animation: "pulse 1s ease-in-out infinite" }} />
      <polyline points="26,40 36,50 54,30" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
];

const LANGUAGES = [
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "zh", flag: "🇨🇳", label: "中文" },
  { code: "hi", flag: "🇮🇳", label: "हिन्दी" },
  { code: "ar", flag: "🇸🇦", label: "العربية" },
  { code: "vi", flag: "🇻🇳", label: "Tiếng Việt" },
  { code: "tl", flag: "🇵🇭", label: "Filipino" },
  { code: "ko", flag: "🇰🇷", label: "한국어" },
  { code: "pt", flag: "🇧🇷", label: "Português" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "ja", flag: "🇯🇵", label: "日本語" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
  { code: "so", flag: "🇸🇴", label: "Somali" },
  { code: "am", flag: "🇪🇹", label: "Amharic" },
];

const EXAMPLES = [
  { label: "Broken streetlight",  text: "There's a broken streetlight on Rural Road near the library. It's been out for 3 weeks and it's dangerous at night." },
  { label: "Unsafe crosswalk",    text: "The crosswalk markings at Mill Ave and University are completely faded. Kids nearly get hit every morning walking to school." },
  { label: "Park needs shade",    text: "McClintock Park has no shade structures. In summer it's over 140F and kids can't play there at all." },
  { label: "Pothole damage",      text: "There's a massive pothole on Apache Blvd that damaged my tire. It's been there for months and nobody has fixed it." },
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
  const [imagePreview, setImagePreview] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [imageMediaType, setImageMediaType] = useState("");
  const [moderationMsg, setModerationMsg] = useState("");
  const [moderating, setModerating] = useState(false);
  const [similarPosts, setSimilarPosts] = useState([]);
  const [showSimilar, setShowSimilar] = useState(false);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    if (step !== "analyzing") return;
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [step]);

  async function checkSimilar(text, loc) {
    if (!text.trim() || text.trim().length < 30) { setSimilarPosts([]); setShowSimilar(false); return; }
    try {
      const params = new URLSearchParams({ text: text.slice(0, 200), location: loc || "Tempe" });
      const res = await fetch(`/api/similar?${params}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) { setSimilarPosts(data); setShowSimilar(true); }
      else { setSimilarPosts([]); setShowSimilar(false); }
    } catch { setSimilarPosts([]); setShowSimilar(false); }
  }

  async function checkModeration(text) {
    if (!text.trim() || text.trim().length < 20) { setModerationMsg(""); return; }
    setModerating(true);
    try {
      const res = await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setModerationMsg(data.ok ? "" : (data.message || "This content may violate our community guidelines."));
    } catch {
      setModerationMsg("");
    } finally {
      setModerating(false);
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const idx = dataUrl.indexOf(",");
      if (idx === -1) return;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.slice(idx + 1));
      setImageMediaType(file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!complaint.trim()) return;
    setLoading(true);
    setStep("analyzing");
    setError("");
    try {
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint, location: location || "Tempe, Arizona", imageBase64: imageBase64 || undefined, imageMediaType: imageMediaType || undefined, language }),
      });
      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json().catch(() => ({}));
        throw new Error(errData.message || "Analysis failed");
      }
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
          urgency_score: analyzed.urgency_score || null,
        }),
      });
      if (!saveRes.ok) throw new Error("Save failed");
      const saved = await saveRes.json();
      setResult({ ...analyzed, id: saved.id });
      setStep("done");
    } catch (err) {
      setError(err.message || "Something went wrong. Check your API key and try again.");
      setStep("form");
    } finally {
      setLoading(false);
    }
  }

  const cardStyle = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "40px", maxWidth: 640, margin: "0 auto", boxShadow: "var(--card-shadow)" };

  if (step === "analyzing") {
    const current = LOADING_STEPS[loadingStep];
    const Icon = STEP_ICONS[loadingStep];
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <Nav />
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px" }}>
          <div style={{ ...cardStyle, textAlign: "center" }}>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}><Icon /></div>
            <p style={{ fontSize: 20, fontWeight: 600, color: current.color, marginBottom: 6, transition: "color 0.3s" }}>{current.text}</p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 32 }}>AI is searching the web for real officials and city ordinances</p>
            <div style={{ maxWidth: 400, margin: "0 auto 32px" }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {LOADING_STEPS.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= loadingStep ? current.color : "var(--border)", transition: "background 0.4s" }} />
                ))}
              </div>
              <p style={{ fontSize: 11, color: "var(--muted)" }}>Step {loadingStep + 1} of {LOADING_STEPS.length}</p>
            </div>
            <div style={{ maxWidth: 320, margin: "0 auto", textAlign: "left" }}>
              {LOADING_STEPS.slice(0, loadingStep + 1).map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 6, color: i < loadingStep ? "#22c55e" : current.color, fontWeight: i === loadingStep ? 600 : 400 }}>
                  <span>{i < loadingStep ? "✓" : "→"}</span>
                  {s.text}
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(1.08)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}@keyframes sway{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}@keyframes grow{0%{clip-path:inset(0 100% 0 0)}100%{clip-path:inset(0 0% 0 0)}}@keyframes write{0%,100%{transform:translate(0,0)}50%{transform:translate(-4px,4px)}}`}</style>
      </div>
    );
  }

  if (step === "done" && result) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <Nav />
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px" }}>
          <div className="success-banner">Your issue has been posted and your letter is ready to send</div>
          <div style={cardStyle}>
            {result.language && result.language !== "en" && (() => {
              const lang = LANGUAGES.find(l => l.code === result.language);
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.2)", marginBottom: 16, fontSize: 13 }}>
                  <span>{lang?.flag}</span>
                  <span style={{ color: "var(--text)", fontWeight: 600 }}>Complaint received in {lang?.label}</span>
                  <span style={{ color: "var(--muted)", marginLeft: "auto" }}>Letter written in English for the official</span>
                </div>
              );
            })()}
            <div className="result-section" style={{ marginBottom: 16 }}>
              <p className="result-label">Send this letter to</p>
              <div className="official-card">
                <div>
                  <p className="official-name">{result.official_name}</p>
                  <p className="official-dept">{result.department}</p>
                  <p className="official-email">{result.official_email}</p>
                </div>
              </div>
            </div>
            <div className="result-section" style={{ marginBottom: 16 }}>
              <p className="result-label">Your formal letter</p>
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: 10, padding: "10px 14px", marginBottom: 10, fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
                ⚠️ AI-Generated Letter — Please review before sending. This was written by Claude AI and may contain inaccuracies about specific laws, officials, or procedures. Official contact details were found via web search and may have changed.
              </div>
              <p className="result-text">{result.formal_request}</p>
            </div>
            <button className="echo-btn" onClick={() => router.push(`/post/${result.id}`)}>
              See who else is raising this issue
            </button>
            <Link href="/" style={{ display: "block", textAlign: "center", fontSize: 14, color: "var(--muted)", textDecoration: "none", marginTop: 12 }}>
              Back to forum
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px" }}>
        <Link href="/forum" className="back-link">Back to forum</Link>
        <div style={cardStyle}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text)", marginBottom: 8, letterSpacing: -1 }}>Raise an issue</h1>
          <p style={{ fontSize: 15, color: "var(--muted)", marginBottom: 28, lineHeight: 1.6 }}>
            Describe the problem in plain English. AI will find the real official, write a formal letter citing real city ordinances, and connect you with others.
          </p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 14, color: "#ef4444" }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">What&apos;s the problem?</label>
            {/* Language selector */}
            <div style={{ marginBottom: 10 }}>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 13, fontFamily: "inherit", cursor: "pointer", outline: "none" }}
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                ))}
              </select>
            </div>
            <textarea
              rows={4}
              placeholder="e.g. There's a broken streetlight on Rural Road near the library and it's been out for 3 weeks. It's dangerous at night..."
              value={complaint}
              onChange={(e) => { setComplaint(e.target.value); if (moderationMsg) setModerationMsg(""); if (showSimilar) setShowSimilar(false); }}
              onBlur={(e) => { checkModeration(e.target.value); checkSimilar(e.target.value, location); }}
              style={moderationMsg ? { borderColor: "#ef4444" } : {}}
            />

            {/* Inline moderation feedback */}
            {moderating && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
                <div style={{ width: 10, height: 10, border: "2px solid var(--muted)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Checking content policy...
              </div>
            )}
            {moderationMsg && !moderating && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 8, padding: "10px 12px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div>
                  <p style={{ fontSize: 13, color: "#ef4444", fontWeight: 600, marginBottom: 2 }}>Policy violation</p>
                  <p style={{ fontSize: 12, color: "#ef4444", opacity: 0.85 }}>{moderationMsg} <a href="/policy" style={{ color: "#ef4444", fontWeight: 700 }}>Read our policy</a></p>
                </div>
              </div>
            )}

            {/* Photo upload */}
            <label htmlFor="photo-upload" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginTop: 10, padding: "12px", borderRadius: 12, cursor: "pointer",
              border: `2px dashed var(--border)`, color: "var(--muted)", fontSize: 14, fontWeight: 500,
              transition: "all 0.15s", background: "transparent",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              Upload Photo (optional)
            </label>
            <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />

            {imagePreview && (
              <div style={{ marginTop: 10, border: "1px solid var(--border)", borderRadius: 12, padding: 10, background: "var(--bg)" }}>
                <img src={imagePreview} alt="Selected" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 8 }} />
                <button type="button" className="share-btn" onClick={() => { setImagePreview(""); setImageBase64(""); setImageMediaType(""); }} style={{ marginTop: 8 }}>
                  Remove Photo
                </button>
              </div>
            )}

            {/* Similarity banner */}
            {showSimilar && !moderationMsg && (
              <div style={{ marginTop: 10, padding: "14px 16px", borderRadius: 12, background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.25)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                    {similarPosts.reduce((s, p) => s + (p.echo_count || 0), 0)} people already reported this
                  </p>
                  <button onClick={() => setShowSimilar(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 18, lineHeight: 1, padding: 0 }}>&times;</button>
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>Join their fight instead of starting a new thread?</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {similarPosts.map(p => (
                    <a key={p.id} href={`/post/${p.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", textDecoration: "none" }}>
                      <span style={{ fontSize: 12, color: "var(--text)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>{(p.complaint || "").slice(0, 60)}...</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginLeft: 8, whiteSpace: "nowrap" }}>{p.echo_count} voices →</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Example chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {EXAMPLES.map((ex) => (
                <button key={ex.label} onClick={() => setComplaint(ex.text)} className="chip-btn">{ex.label}</button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location (optional)</label>
            <input type="text" placeholder="e.g. Rural Road & Southern Ave, Tempe" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <button className="submit-btn" onClick={handleSubmit} disabled={loading || !complaint.trim() || !!moderationMsg || moderating}>
            {loading ? "Analyzing..." : "Find My Voice →"}
          </button>

          {/* Privacy shield card */}
          <div style={{ marginTop: 16, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
            {[
              ["🔒", "Anonymous by default — no name, email, or account required"],
              ["🗑️", "No personal data stored — only your complaint text and location"],
              ["👁️", "AI drafts the letter — you review before anything is sent"],
              ["⚖️", "You decide if and when to send — we never auto-send without consent"],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 13, flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="notice" style={{ marginTop: 12 }}>
          Your complaint is anonymous by default. AI writes the letter — you decide whether to send it.
        </div>
      </div>
    </div>
  );
}
