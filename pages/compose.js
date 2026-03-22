import { useState, useEffect, useRef } from "react";
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

const ALL_LANGUAGES = [
  {code:'af',    flag:'🇿🇦', label:'Afrikaans'},
  {code:'sq',    flag:'🇦🇱', label:'Albanian'},
  {code:'am',    flag:'🇪🇹', label:'Amharic'},
  {code:'ar',    flag:'🇸🇦', label:'Arabic'},
  {code:'hy',    flag:'🇦🇲', label:'Armenian'},
  {code:'az',    flag:'🇦🇿', label:'Azerbaijani'},
  {code:'bn',    flag:'🇧🇩', label:'Bengali'},
  {code:'bs',    flag:'🇧🇦', label:'Bosnian'},
  {code:'bg',    flag:'🇧🇬', label:'Bulgarian'},
  {code:'ca',    flag:'🏴',   label:'Catalan'},
  {code:'zh',    flag:'🇨🇳', label:'Chinese (Simplified)'},
  {code:'zh-TW', flag:'🇹🇼', label:'Chinese (Traditional)'},
  {code:'hr',    flag:'🇭🇷', label:'Croatian'},
  {code:'cs',    flag:'🇨🇿', label:'Czech'},
  {code:'da',    flag:'🇩🇰', label:'Danish'},
  {code:'nl',    flag:'🇳🇱', label:'Dutch'},
  {code:'en',    flag:'🇺🇸', label:'English'},
  {code:'et',    flag:'🇪🇪', label:'Estonian'},
  {code:'fi',    flag:'🇫🇮', label:'Finnish'},
  {code:'fr',    flag:'🇫🇷', label:'French'},
  {code:'ka',    flag:'🇬🇪', label:'Georgian'},
  {code:'de',    flag:'🇩🇪', label:'German'},
  {code:'el',    flag:'🇬🇷', label:'Greek'},
  {code:'gu',    flag:'🇮🇳', label:'Gujarati'},
  {code:'ht',    flag:'🇭🇹', label:'Haitian Creole'},
  {code:'he',    flag:'🇮🇱', label:'Hebrew'},
  {code:'hi',    flag:'🇮🇳', label:'Hindi'},
  {code:'hu',    flag:'🇭🇺', label:'Hungarian'},
  {code:'id',    flag:'🇮🇩', label:'Indonesian'},
  {code:'ga',    flag:'🇮🇪', label:'Irish'},
  {code:'it',    flag:'🇮🇹', label:'Italian'},
  {code:'ja',    flag:'🇯🇵', label:'Japanese'},
  {code:'kn',    flag:'🇮🇳', label:'Kannada'},
  {code:'kk',    flag:'🇰🇿', label:'Kazakh'},
  {code:'km',    flag:'🇰🇭', label:'Khmer'},
  {code:'ko',    flag:'🇰🇷', label:'Korean'},
  {code:'lv',    flag:'🇱🇻', label:'Latvian'},
  {code:'lt',    flag:'🇱🇹', label:'Lithuanian'},
  {code:'mk',    flag:'🇲🇰', label:'Macedonian'},
  {code:'ms',    flag:'🇲🇾', label:'Malay'},
  {code:'ml',    flag:'🇮🇳', label:'Malayalam'},
  {code:'mt',    flag:'🇲🇹', label:'Maltese'},
  {code:'mr',    flag:'🇮🇳', label:'Marathi'},
  {code:'mn',    flag:'🇲🇳', label:'Mongolian'},
  {code:'ne',    flag:'🇳🇵', label:'Nepali'},
  {code:'no',    flag:'🇳🇴', label:'Norwegian'},
  {code:'fa',    flag:'🇮🇷', label:'Persian'},
  {code:'pl',    flag:'🇵🇱', label:'Polish'},
  {code:'pt',    flag:'🇧🇷', label:'Portuguese'},
  {code:'pa',    flag:'🇮🇳', label:'Punjabi'},
  {code:'ro',    flag:'🇷🇴', label:'Romanian'},
  {code:'ru',    flag:'🇷🇺', label:'Russian'},
  {code:'sr',    flag:'🇷🇸', label:'Serbian'},
  {code:'si',    flag:'🇱🇰', label:'Sinhala'},
  {code:'sk',    flag:'🇸🇰', label:'Slovak'},
  {code:'sl',    flag:'🇸🇮', label:'Slovenian'},
  {code:'so',    flag:'🇸🇴', label:'Somali'},
  {code:'es',    flag:'🇪🇸', label:'Spanish'},
  {code:'sw',    flag:'🇰🇪', label:'Swahili'},
  {code:'sv',    flag:'🇸🇪', label:'Swedish'},
  {code:'tl',    flag:'🇵🇭', label:'Tagalog'},
  {code:'ta',    flag:'🇮🇳', label:'Tamil'},
  {code:'te',    flag:'🇮🇳', label:'Telugu'},
  {code:'th',    flag:'🇹🇭', label:'Thai'},
  {code:'tr',    flag:'🇹🇷', label:'Turkish'},
  {code:'uk',    flag:'🇺🇦', label:'Ukrainian'},
  {code:'ur',    flag:'🇵🇰', label:'Urdu'},
  {code:'uz',    flag:'🇺🇿', label:'Uzbek'},
  {code:'vi',    flag:'🇻🇳', label:'Vietnamese'},
  {code:'cy',    flag:'🏴󠁧󠁢󠁷󠁬󠁳󠁿', label:'Welsh'},
  {code:'yo',    flag:'🇳🇬', label:'Yoruba'},
  {code:'zu',    flag:'🇿🇦', label:'Zulu'},
];

function LanguagePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const selected = ALL_LANGUAGES.find(l => l.code === value) || ALL_LANGUAGES.find(l => l.code === "en");
  const isDefault = value === "en";
  const filtered = ALL_LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button type="button" onClick={() => { setOpen(v => !v); setSearch(""); }}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
        <span>{isDefault ? "🌐" : selected?.flag}</span>
        <span>{isDefault ? "Language" : selected?.label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 2, opacity: 0.5 }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 500, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", width: 240 }}>
          <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)" }}>
            <input autoFocus type="text" placeholder="Search languages..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "6px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {filtered.map(l => (
              <button key={l.code} type="button" onClick={() => { onChange(l.code); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: l.code === value ? "rgba(37,99,235,0.1)" : "transparent", border: "none", cursor: "pointer", fontSize: 13, color: "var(--text)", textAlign: "left", fontFamily: "inherit" }}
                onMouseEnter={e => { if (l.code !== value) e.currentTarget.style.background = "var(--bg)"; }}
                onMouseLeave={e => { if (l.code !== value) e.currentTarget.style.background = "transparent"; }}>
                <span>{l.flag}</span>
                <span>{l.label}</span>
                {l.code === value && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" style={{ marginLeft: "auto" }}><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
            ))}
            {filtered.length === 0 && <p style={{ padding: "12px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>No languages found</p>}
          </div>
        </div>
      )}
    </div>
  );
}

const EXAMPLES = [
  { label: "Broken streetlight",  text: "There's a broken streetlight on Rural Road near the library. It's been out for 3 weeks and it's dangerous at night." },
  { label: "Unsafe crosswalk",    text: "The crosswalk markings at Mill Ave and University are completely faded. Kids nearly get hit every morning walking to school." },
  { label: "Park needs shade",    text: "McClintock Park has no shade structures. In summer it's over 140F and kids can't play there at all." },
  { label: "Pothole damage",      text: "There's a massive pothole on Apache Blvd that damaged my tire. It's been there for months and nobody has fixed it." },
];

const TYPE_COLORS = {
  traffic_safety:   "#f59e0b",
  street_lighting:  "#818cf8",
  road_maintenance: "#a78bfa",
  parks_facilities: "#22c55e",
  noise_complaint:  "#f97316",
  housing:          "#ef4444",
  utilities:        "#94a3b8",
  other:            "#94a3b8",
};

function RightPanel() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetch("/api/posts")
      .then(r => r.json())
      .then(posts => {
        if (!Array.isArray(posts)) return;
        setStats({
          total: posts.length,
          contacted: posts.filter(p => p.official_email).length,
          voices: posts.reduce((s, p) => s + (Number(p.echo_count) || 0), 0),
        });
        setRecent([...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3));
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stats card */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--muted)", marginBottom: 16 }}>This week in Tempe</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
          { label: "Issues raised",       value: stats?.total     ?? "—" },
            { label: "Officials contacted", value: stats?.contacted ?? "—" },
            { label: "Total voices",        value: stats?.voices    ?? "—" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#22c55e", letterSpacing: -1, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, lineHeight: 1.3 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent issues card */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--muted)", marginBottom: 14 }}>Recent issues</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {recent.length === 0 && <p style={{ fontSize: 12, color: "var(--muted)" }}>Loading...</p>}
          {recent.map(p => (
            <Link key={p.id} href={`/post/${p.id}`} style={{ display: "flex", alignItems: "flex-start", gap: 10, textDecoration: "none" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: TYPE_COLORS[p.issue_type] || "#94a3b8", flexShrink: 0, marginTop: 5 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.45, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.complaint}</p>
                <p style={{ fontSize: 11, color: "#2563eb", fontWeight: 600, marginTop: 3 }}>{p.echo_count} {p.echo_count === 1 ? "voice" : "voices"}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Compose() {
  const router = useRouter();
  const [complaint, setComplaint] = useState("");
  const [location, setLocation] = useState("");
  const [locationTouched, setLocationTouched] = useState(false);
  const [complaintTouched, setComplaintTouched] = useState(false);
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
  const [detectedLang, setDetectedLang] = useState(null);
  const [showLangBanner, setShowLangBanner] = useState(false);

  // Detect browser language and pre-select it
  useEffect(() => {
    const browserLang = (navigator.language || "en").split("-")[0];
    const match = ALL_LANGUAGES.find(l => l.code === browserLang);
    if (match && match.code !== "en") {
      setLanguage(match.code);
      setDetectedLang(match);
      setShowLangBanner(true);
    }
  }, []);

  useEffect(() => {
    if (step !== "analyzing") return;
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [step]);

  async function checkSimilar(text, loc) {
    if (!text.trim() || text.trim().length < 30 || !loc.trim()) { setSimilarPosts([]); setShowSimilar(false); return; }
    try {
      const params = new URLSearchParams({ text: text.slice(0, 200), location: loc });
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
    if (!complaint.trim()) { setComplaintTouched(true); return; }
    if (!location.trim()) { setLocationTouched(true); return; }
    setLoading(true);
    setStep("analyzing");
    setError("");
    try {
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint, location, imageBase64: imageBase64 || undefined, imageMediaType: imageMediaType || undefined, language }),
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
          location: analyzed.location_extracted || location,
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

  const cardStyle = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "40px", boxShadow: "var(--card-shadow)" };

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
    return <ResultPage result={result} router={router} />;
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <main role="main" style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px", display: "grid", gridTemplateColumns: "280px 1fr 260px", gap: 32, alignItems: "start" }} className="compose-grid">
        {/* LEFT PANEL */}
        <aside className="compose-side-panel" style={{ position: "sticky", top: 76 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 20px", borderLeft: "3px solid #2563eb" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#2563eb", marginBottom: 20 }}>How it works</p>
            {[
              { n: 1, title: "Describe the problem", desc: "Write in any language, as casually as you want" },
              { n: 2, title: "AI finds the right official", desc: "We search real government contacts and cite actual city ordinances" },
              { n: 3, title: "Rally your community", desc: "See how many neighbors share your issue and build collective power" },
            ].map((step, i) => (
              <div key={step.n} style={{ display: "flex", gap: 14, marginBottom: i < 2 ? 20 : 0, animation: "fadeInUp 0.4s ease both", animationDelay: `${(i + 1) * 0.1}s` }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2563eb", color: "white", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{step.n}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{step.title}</p>
                  <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* FORM COLUMN */}
        <div>
        <div style={cardStyle}>
          <Link href="/forum" className="back-link" style={{ display: "inline-flex", marginBottom: 20 }}>← Back to forum</Link>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text)", marginBottom: 8, letterSpacing: -1 }}>Raise an issue</h1>
          <p style={{ fontSize: 15, color: "var(--muted)", marginBottom: 28, lineHeight: 1.6 }}>
            Describe the problem in your own words. AI will find the real official, write a formal letter citing real city ordinances, and connect you with others.
          </p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 14, color: "#ef4444" }}>
              {error}
            </div>
          )}

          {/* Browser language detection banner */}
          {showLangBanner && detectedLang && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.2)", marginBottom: 16, fontSize: 13 }}>
              <span>{detectedLang.flag}</span>
              <span style={{ color: "var(--text)", flex: 1 }}>We detected your browser language as <strong>{detectedLang.label}</strong>. You can change this below.</span>
              <button onClick={() => setShowLangBanner(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 16, lineHeight: 1, padding: 0 }}>&times;</button>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">What&apos;s the problem?</label>
            <div style={{ marginBottom: 10 }}>
              <LanguagePicker value={language} onChange={setLanguage} />
            </div>
            <textarea
              rows={4}
              placeholder="e.g. There's a broken streetlight on Rural Road near the library and it's been out for 3 weeks. It's dangerous at night..."
              value={complaint}
              onChange={(e) => { setComplaint(e.target.value); if (moderationMsg) setModerationMsg(""); if (showSimilar) setShowSimilar(false); if (complaintTouched) setComplaintTouched(false); }}
              onBlur={(e) => { checkModeration(e.target.value); checkSimilar(e.target.value, location); }}
              style={moderationMsg || (complaintTouched && !complaint.trim()) ? { borderColor: "#ef4444" } : {}}
            />
            {complaintTouched && !complaint.trim() && (
              <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>Please describe the problem.</p>
            )}

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
            <label htmlFor="photo-upload" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10, padding: "12px", borderRadius: 12, cursor: "pointer", border: "2px dashed var(--border)", color: "var(--muted)", fontSize: 14, fontWeight: 500, transition: "all 0.15s", background: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              Upload Photo (optional)
            </label>
            <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />

            {imagePreview && (
              <div style={{ marginTop: 10, border: "1px solid var(--border)", borderRadius: 12, padding: 10, background: "var(--bg)" }}>
                <img src={imagePreview} alt="Selected" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 8 }} />
                <button type="button" className="share-btn" onClick={() => { setImagePreview(""); setImageBase64(""); setImageMediaType(""); }} style={{ marginTop: 8 }}>Remove Photo</button>
              </div>
            )}

            {/* Similarity banner */}
            {showSimilar && !moderationMsg && similarPosts.length > 0 && (
              <div style={{ marginTop: 10, padding: "14px 16px", borderRadius: 12, background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.25)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                    {similarPosts.reduce((s, p) => s + (p.echo_count || 0), 0)} neighbors in {location} already reported a {similarPosts[0]?.issue_type?.replace(/_/g, " ")} issue.
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
            <label className="form-label">Location</label>
            <input
              type="text"
              placeholder="e.g. Rural Road & Southern Ave, Tempe"
              value={location}
              onChange={(e) => { setLocation(e.target.value); if (error) setError(""); if (locationTouched) setLocationTouched(false); }}
              onBlur={() => { setLocationTouched(true); checkSimilar(complaint, location); }}
              style={locationTouched && !location.trim() ? { borderColor: "#ef4444" } : {}}
            />
            {locationTouched && !location.trim() && (
              <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>Location is required to find the right official.</p>
            )}
          </div>

          <button className="submit-btn" onClick={handleSubmit} disabled={loading || !!moderationMsg || moderating}>
            {loading ? "Analyzing..." : "Find My Voice →"}
          </button>

          {/* Privacy shield card — SVG icons */}
          <div style={{ marginTop: 16, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
            {[
              [<svg key="lock" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, "Anonymous by default — no name, email, or account required"],
              [<svg key="shield" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, "No personal data stored — only your complaint text and location"],
              [<svg key="eye" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>, "AI drafts the letter — you review before anything is sent"],
              [<svg key="check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>, "You decide if and when to send — we never auto-send"],
            ].map(([icon, text], i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 3 ? 8 : 0 }}>
                <span style={{ color: "var(--muted)", flexShrink: 0, marginTop: 1 }}>{icon}</span>
                <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="notice" style={{ marginTop: 12 }}>
          Your complaint is anonymous by default. AI writes the letter — you decide whether to send it.
        </div>
        </div>{/* end form column */}

        {/* Right Panel */}
        <aside className="compose-side-panel" style={{ position: "sticky", top: 76 }}>
          <RightPanel />
        </aside>

      </main>
    </div>
  );
}

function ResultPage({ result, router }) {
  const originalLetter = result.formal_request || "";
  const [editedLetter, setEditedLetter] = useState(originalLetter);
  const [translatedLetter, setTranslatedLetter] = useState(null);
  const [letterVersion, setLetterVersion] = useState("original");
  const [translating, setTranslating] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [copied, setCopied] = useState(false);
  const [showSendConsent, setShowSendConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");

  const userLang = ALL_LANGUAGES.find(l => l.code === result.language);
  const officialLang = ALL_LANGUAGES.find(l => l.code === result.official_language);

  // Only show translate when languages genuinely differ
  const needsTranslation = !!(
    result.language &&
    result.official_language &&
    result.language !== result.official_language
  );

  const activeLetter = letterVersion === "translated" && translatedLetter ? translatedLetter : editedLetter;

  async function doSendEmail() {
    setSending(true);
    setSendError("");
    try {
      const letterToSend = activeLetter + "\n\nSigned,\n" + (signerName.trim() || "Anonymous Resident");
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          official_email: result.official_email,
          official_name: result.official_name,
          department: result.department,
          issue_type: result.issue_type,
          formal_request: letterToSend,
          location: result.location_extracted || "",
          post_id: result.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");
      setSent(true);
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
      setShowSendConsent(false);
    }
  }

  function renderLangBadge() {
    if (!result.language) return null;
    if (!needsTranslation) {
      // Same language (or no official_language returned) — no badge needed unless non-English
      if (result.language === "en") return null;
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.2)", marginBottom: 16, fontSize: 13 }}>
          <span>{userLang?.flag}</span>
          <span style={{ color: "var(--text)", fontWeight: 600 }}>Letter written in {userLang?.label} — matches official language</span>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.2)", marginBottom: 16, fontSize: 13, flexWrap: "wrap" }}>
        <span>{userLang?.flag}</span>
        <span style={{ color: "var(--text)", fontWeight: 600 }}>Your complaint ({userLang?.label})</span>
        <span style={{ color: "var(--muted)" }}>→</span>
        <span style={{ color: "var(--text)", fontWeight: 600 }}>{userLang?.label} letter</span>
        <span style={{ color: "var(--muted)" }}>→</span>
        <span style={{ color: "var(--text)", fontWeight: 600 }}>sent to {officialLang?.flag} {officialLang?.label}-speaking official</span>
        <span style={{ marginLeft: "auto", fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(37,99,235,0.15)", color: "#2563eb", fontWeight: 700 }}>Translation: {userLang?.label} → {officialLang?.label}</span>
      </div>
    );
  }

  async function handleTranslate() {
    setTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editedLetter, targetLanguage: result.official_language, targetLanguageName: officialLang?.label }),
      });
      const data = await res.json();
      if (data.translated) {
        setTranslatedLetter(data.translated);
        setLetterVersion("translated");
      }
    } catch {}
    finally { setTranslating(false); }
  }

  const cardStyle = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "40px", maxWidth: 640, margin: "0 auto", boxShadow: "var(--card-shadow)" };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px" }}>
        <div className="success-banner">Your issue has been posted and your letter is ready to send</div>
        <div style={cardStyle}>
          {renderLangBadge()}

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

            {/* AI disclaimer — SVG warning icon, no emoji */}
            <div style={{ display: "flex", gap: 8, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: 10, padding: "10px 14px", marginBottom: 10, fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>AI-Generated Letter — Please review before sending. This was written by Claude AI and may contain inaccuracies about specific laws, officials, or procedures.</span>
            </div>

            {/* Version tabs — only shown after translation */}
            {translatedLetter && (
              <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                {[
                  { key: "original", label: `${userLang?.flag || ""} Original (${userLang?.label || "your language"})` },
                  { key: "translated", label: `${officialLang?.flag || ""} For Official (${officialLang?.label || "official language"})` },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setLetterVersion(tab.key)}
                    style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${letterVersion === tab.key ? "#2563eb" : "var(--border)"}`, background: letterVersion === tab.key ? "rgba(37,99,235,0.1)" : "transparent", color: letterVersion === tab.key ? "#2563eb" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Editable letter — only editable in original version */}
            {letterVersion === "original" ? (
              <textarea
                value={editedLetter}
                onChange={e => setEditedLetter(e.target.value)}
                rows={12}
                style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, color: "var(--text)", fontSize: 14, lineHeight: 1.7, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              />
            ) : (
              <div style={{ width: "100%", background: "var(--bg)", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 8, padding: 14, color: "var(--text)", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", minHeight: 200 }}>
                {translatedLetter}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>
                {letterVersion === "original" ? "Edit this letter before sending" : "This is the version that will be sent to the official"}
              </p>
            </div>

            {/* Translate banner — only when languages differ */}
            {needsTranslation && !translatedLetter && (
              <div style={{ marginTop: 12, padding: "14px 16px", borderRadius: 12, background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.25)" }}>
                <p style={{ fontSize: 13, color: "var(--text)", marginBottom: 10 }}>
                  Your letter is in <strong>{userLang?.flag} {userLang?.label}</strong>. Officials in {result.location_extracted || "this area"} use <strong>{officialLang?.flag} {officialLang?.label}</strong>. Translate before sending?
                </p>
                <button onClick={handleTranslate} disabled={translating}
                  style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: "#2563eb", color: "white", fontSize: 13, fontWeight: 600, cursor: translating ? "default" : "pointer", opacity: translating ? 0.7 : 1 }}>
                  {translating ? "Translating..." : `Translate to ${officialLang?.flag} ${officialLang?.label}`}
                </button>
              </div>
            )}
          </div>

          {/* Signer name + action buttons */}
          <div style={{ marginTop: 8 }}>
            {/* Optional name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}>
                Sign this letter (optional)
              </label>
              <input
                type="text"
                placeholder="Your first name and last initial, e.g. Maria G."
                value={signerName}
                onChange={e => setSignerName(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              />
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 5 }}>
                Adds your name to the collective signature. Leave blank to stay anonymous.
              </p>
            </div>

            {/* Button 1 — primary: Send via Resend */}
            {sent ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "14px", borderRadius: 12, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.35)", color: "#16a34a", fontSize: 15, fontWeight: 700, marginBottom: 10, boxSizing: "border-box" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Letter sent to {result.official_name}
              </div>
            ) : result.official_email ? (
              <button
                onClick={() => setShowSendConsent(true)}
                disabled={sending}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "14px", borderRadius: 12, background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", border: "none", fontSize: 15, fontWeight: 700, cursor: sending ? "default" : "pointer", marginBottom: 10, boxSizing: "border-box", boxShadow: "0 4px 20px rgba(37,99,235,0.3)", fontFamily: "inherit", opacity: sending ? 0.7 : 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Send Letter to Official
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 14, marginBottom: 10, boxSizing: "border-box" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                No official email found — use the copy option below
              </div>
            )}

            {sendError && (
              <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 10, textAlign: "center" }}>{sendError}</p>
            )}

            {/* Button 2 — secondary: Copy letter */}
            <button
              onClick={() => {
                const text = activeLetter + "\n\nSigned,\n" + (signerName.trim() || "Anonymous Resident");
                navigator.clipboard.writeText(text).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "13px", borderRadius: 12, border: "1.5px solid var(--border)", background: "transparent", color: "var(--text)", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 10, fontFamily: "inherit", transition: "all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#2563eb"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{ color: "#22c55e" }}>Copied!</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Copy Letter to Clipboard
                </>
              )}
            </button>

            {/* Privacy notice */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", marginBottom: 20 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
                Your letter is sent directly to the official via our secure mail service. We never store your personal information.
              </p>
            </div>

            {/* Button 3 — tertiary: See who else */}
            <button
              onClick={() => router.push(`/post/${result.id}`)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "11px", borderRadius: 12, border: "none", background: "transparent", color: "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              See who else is raising this issue
            </button>
          </div>

          <Link href="/forum" style={{ display: "block", textAlign: "center", fontSize: 13, color: "var(--muted)", textDecoration: "none", marginTop: 8 }}>
            Back to forum
          </Link>
        </div>
      </div>

      {/* Send consent dialog */}
      {showSendConsent && (
        <div onClick={() => setShowSendConsent(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, padding: "28px", maxWidth: 420, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
            {/* Icon */}
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 10, letterSpacing: -0.3 }}>Send this letter?</h2>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, marginBottom: 8 }}>
              This will send your formal letter directly to:
            </p>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{result.official_name}</p>
              <p style={{ fontSize: 13, color: "var(--muted)" }}>{result.department}</p>
              <p style={{ fontSize: 12, color: "#2563eb", marginTop: 4 }}>{result.official_email}</p>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 20 }}>
              Signed as: <strong style={{ color: "var(--text)" }}>{signerName.trim() || "Anonymous Resident"}</strong>
              <br />Your letter is sent via our secure mail service. No personal data is stored.
            </p>
            <button
              onClick={doSendEmail}
              disabled={sending}
              style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", fontSize: 15, fontWeight: 700, cursor: sending ? "default" : "pointer", marginBottom: 8, opacity: sending ? 0.7 : 1, fontFamily: "inherit" }}>
              {sending ? "Sending..." : "Yes, Send Letter"}
            </button>
            <button
              onClick={() => setShowSendConsent(false)}
              style={{ width: "100%", padding: "10px", borderRadius: 12, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
