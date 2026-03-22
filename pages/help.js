import { useState } from "react";
import Nav from "../components/Nav";

const FAQS = [
  {
    section: "Getting Started",
    items: [
      { q: "How do I raise an issue?", a: "Click '+ Raise Issue' in the nav. Describe your problem in your own words — any language — add a location, and optionally attach a photo. AI will find the right official and write a formal letter." },
      { q: "Is my complaint anonymous?", a: "Yes. No name, email, or account is required. Your complaint text and location are stored, but nothing that identifies you personally." },
      { q: "How does the AI write the letter?", a: "Claude AI searches the web for the current government official responsible for your issue type, finds relevant city ordinances or state statutes, and writes a formal letter citing real law." },
    ],
  },
  {
    section: "Understanding Your Issue",
    items: [
      { q: "What are 'voices'?", a: "When someone clicks 'Add My Voice' on an issue, they echo it — adding their voice to the collective demand. More voices = more pressure on officials." },
      { q: "What happens at 10, 25, and 50 voices?", a: "10 voices: The relevant department is formally notified. 25 voices: The issue escalates to City Council. 50 voices: A public records request is filed automatically." },
      { q: "How does escalation work?", a: "Escalation is automatic. When an issue crosses a threshold, a follow-up letter is sent to a higher authority — from department head to council member to mayor." },
    ],
  },
  {
    section: "The AI Letter",
    items: [
      { q: "Can I edit the letter?", a: "Yes. After the AI generates the letter, it appears in an editable text area. You can change any part of it before sending." },
      { q: "What laws does the AI cite?", a: "The AI searches for real city ordinances, Arizona Revised Statutes, or relevant federal regulations depending on your issue type and location." },
      { q: "What if the official's email is wrong?", a: "AI-found contact details may occasionally be outdated. Always verify before sending. You can edit the letter and use the mailto link to send from your own email client." },
    ],
  },
  {
    section: "Follow-ups & Resolution",
    items: [
      { q: "What happens after 7 days with no response?", a: "If the community collectively echoed an issue and there is no government response within 7 days, a follow-up letter is automatically sent — this is powered by TinyFish AI agents." },
      { q: "How do I mark an issue as resolved?", a: "On the issue detail page, if you created the issue in this browser session, you will see an 'Update status' option below the lifecycle timeline. Select 'Resolved' and describe what happened." },
      { q: "Can I track government responses?", a: "Yes. Official responses appear on the issue detail page in a green card. You can also follow issues to get notified when they are updated." },
    ],
  },
  {
    section: "Languages",
    items: [
      { q: "Can I write in my language?", a: "Yes. Use the language picker above the complaint textarea to select from 80+ languages. Write your complaint in your preferred language." },
      { q: "Will the letter be translated automatically?", a: "If the official language of the region differs from your complaint language, a 'Translate' button appears after the letter is generated. One click translates the letter to the official language." },
    ],
  },
  {
    section: "Privacy & Safety",
    items: [
      { q: "What data do you collect?", a: "Only your complaint text and location are stored in the database. No personal identifiers. All preferences and echo history are stored locally in your browser." },
      { q: "Can I delete my posts?", a: "Go to Settings > Privacy > Clear all my data to remove all local data. For database records, use the Contact page to request removal." },
      { q: "How is content moderated?", a: "All complaints are checked against our community policy before being processed. Violent, hateful, or abusive content is rejected immediately. Read our Community Policy for details." },
    ],
  },
];

function Accordion({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.4 }}>{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, paddingBottom: 14 }}>{a}</p>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <>
      <Nav />
      <div className="container" style={{ maxWidth: 680 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5, marginBottom: 8 }}>Help Center</h1>
        <p style={{ fontSize: 15, color: "var(--muted)", marginBottom: 32 }}>Everything you need to know about using Civilian.</p>

        {FAQS.map(section => (
          <div key={section.section} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>{section.section}</p>
            {section.items.map(item => <Accordion key={item.q} q={item.q} a={item.a} />)}
          </div>
        ))}

        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 8 }}>Still have questions?</p>
          <a href="/contact" style={{ fontSize: 14, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>Contact us</a>
        </div>
      </div>
    </>
  );
}
