import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FORUM_THREADS } from "../../lib/forumThreads";

const TYPE_LABELS = {
  traffic_safety: { label: "Traffic Safety", cls: "type-traffic" },
  street_lighting: { label: "Street Lighting", cls: "type-lighting" },
  road_maintenance: { label: "Road Maintenance", cls: "type-roads" },
  parks_facilities: { label: "Parks", cls: "type-parks" },
  noise_complaint: { label: "Noise", cls: "type-other" },
  housing: { label: "Housing", cls: "type-safety" },
  utilities: { label: "Utilities", cls: "type-other" },
  other: { label: "Community", cls: "type-other" },
};

export default function ThreadDetailPage() {
  const router = useRouter();
  const { threadId } = router.query;
  const [supported, setSupported] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinedChat, setJoinedChat] = useState(false);
  const [likedMessages, setLikedMessages] = useState({});
  const [openComments, setOpenComments] = useState({});

  const thread = useMemo(
    () => FORUM_THREADS.find((t) => t.id === threadId),
    [threadId]
  );

  if (!thread) {
    return (
      <>
        <nav className="nav">
          <Link href="/" className="nav-logo">civic<span>pulse</span></Link>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Link href="/forum" className="landing-link">Forum</Link>
            <Link href="/map" className="landing-link">Map</Link>
          </div>
        </nav>
        <div className="container">
          <p className="empty-title">Thread not found</p>
          <Link href="/forum" className="back-link">← Back to forum</Link>
        </div>
      </>
    );
  }

  const typeInfo = TYPE_LABELS[thread.issueType] || TYPE_LABELS.other;
  const supportCount = supported ? thread.support + 1 : thread.support;
  const threadDiscussions = {
    "maple-stop-sign": [
      {
        id: "m1",
        name: "Priya K",
        role: "Parent volunteer",
        time: "2h ago",
        message:
          "I counted 11 cars running through during 8:05-8:20 AM. I can upload a short log if it helps the petition packet.",
        likes: 18,
        comments: [
          "Please add timestamps too, the mobility office asked for exact windows.",
          "I can co-sign your observation log for Tuesday drop-off.",
        ],
      },
      {
        id: "m2",
        name: "Sam Ortiz",
        role: "Resident",
        time: "1h ago",
        message:
          "Can we organize 6-8 neighbors to attend the Thursday hearing together? A bigger turnout may push this up the agenda.",
        likes: 23,
        comments: [
          "I can attend and bring printed signatures.",
          "Count me in, I can speak during public comment.",
        ],
      },
    ],
    "greenbelt-lighting": [
      {
        id: "g1",
        name: "Nina Shah",
        role: "Runner",
        time: "3h ago",
        message:
          "Lamp near the north entrance is fully out. I posted a photo in the 311 report and linked this thread number.",
        likes: 11,
        comments: [
          "Thanks, this helps Public Works route the ticket faster.",
          "Could you also mark the pole number if visible?",
        ],
      },
      {
        id: "g2",
        name: "Leo Martinez",
        role: "Neighborhood watch",
        time: "58m ago",
        message:
          "Let us do a quick evening walk audit Sunday 7 PM and submit one shared map of all dark spots.",
        likes: 16,
        comments: [
          "Great idea, we can pin each location in one doc.",
          "I will bring reflective vests for volunteers.",
        ],
      },
    ],
    "mobility-office-update": [
      {
        id: "o1",
        name: "Ari Bennett",
        role: "Community organizer",
        time: "1h ago",
        message:
          "Since the study is open, we should gather peak-hour evidence this week and post it as one community brief.",
        likes: 29,
        comments: [
          "I can format a shared spreadsheet for observations.",
          "Please include school release time, that is when speeding spikes.",
        ],
      },
      {
        id: "o2",
        name: "Dana Lewis",
        role: "Resident",
        time: "36m ago",
        message:
          "Would anyone like to coordinate a short explainer for neighbors so more people understand the council timeline?",
        likes: 14,
        comments: [
          "Yes, a simple one-pager in plain language would help.",
          "I can draft and post for feedback by tonight.",
        ],
      },
    ],
  }[thread.id] || [];

  function toggleMessageLike(messageId) {
    setLikedMessages((prev) => ({ ...prev, [messageId]: !prev[messageId] }));
  }

  function toggleComments(messageId) {
    setOpenComments((prev) => ({ ...prev, [messageId]: !prev[messageId] }));
  }

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">civic<span>pulse</span></Link>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Link href="/forum" className="landing-link">Forum</Link>
          <Link href="/map" className="landing-link">Map</Link>
          <Link href="/compose" className="nav-btn">+ Raise Issue</Link>
        </div>
      </nav>

      <div className="container">
        <Link href="/forum" className="back-link">← Back to forum</Link>

        <section className="thread-detail-card">
          <div className="forum-thread-top">
            <div>
              <p className="forum-thread-author">{thread.name}</p>
              <p className="forum-thread-role">{thread.role}</p>
            </div>
            <span className="forum-thread-badge">{thread.badge}</span>
          </div>

          <span className={`post-type ${typeInfo.cls}`}>{typeInfo.label}</span>
          <h1 className="thread-detail-title">{thread.issueTitle}</h1>
          <p className="thread-detail-body">{thread.text}</p>

          <div className="thread-detail-meta">
            <span className="post-location">📍 {thread.location}</span>
            <span className="post-echo">👥 {supportCount} supporters</span>
          </div>
          <p className="forum-thread-status">{thread.status}</p>
        </section>

        <section className="thread-detail-card">
          <p className="result-label">Why this matters</p>
          <p className="thread-detail-body">{thread.whyItMatters}</p>

          <p className="result-label" style={{ marginTop: 18 }}>How to participate</p>
          <div className="thread-step-list">
            {thread.howToParticipate.map((step) => (
              <div key={step} className="thread-step">
                <span>•</span>
                <p>{step}</p>
              </div>
            ))}
          </div>

          <p className="result-label" style={{ marginTop: 18 }}>Government pathway</p>
          <p className="thread-detail-body">{thread.governmentPath}</p>

          <div className="thread-action-row">
            <button className="echo-btn" onClick={() => setSupported((s) => !s)}>
              {supported ? "✓ You support this issue" : "👥 Support this issue"}
            </button>
            <button className="share-btn" onClick={() => setJoined((j) => !j)}>
              {joined ? "✓ Joined volunteer updates" : "📬 Join volunteer updates"}
            </button>
            <button className="share-btn" onClick={() => setJoinedChat((c) => !c)}>
              {joinedChat ? "✓ Joined community chat" : "💬 Join community chat group"}
            </button>
          </div>
        </section>

        <section className="thread-detail-card">
          <div className="discussion-header">
            <div>
              <p className="result-label">Community discussion</p>
              <p className="thread-detail-body">
                Residents are coordinating evidence, planning attendance, and discussing petition progress.
              </p>
            </div>
            <span className="forum-thread-badge">{joinedChat ? "Joined chat" : "Public group"}</span>
          </div>

          {threadDiscussions.map((message) => {
            const isLiked = Boolean(likedMessages[message.id]);
            const showComments = Boolean(openComments[message.id]);
            return (
              <article key={message.id} className="discussion-card">
                <div className="discussion-top">
                  <div>
                    <p className="forum-thread-author">{message.name}</p>
                    <p className="forum-thread-role">{message.role}</p>
                  </div>
                  <span className="post-location">{message.time}</span>
                </div>
                <p className="discussion-message">{message.message}</p>
                <div className="discussion-actions">
                  <button
                    className={`discussion-action ${isLiked ? "active" : ""}`}
                    onClick={() => toggleMessageLike(message.id)}
                  >
                    👍 {isLiked ? message.likes + 1 : message.likes}
                  </button>
                  <button
                    className={`discussion-action ${showComments ? "active" : ""}`}
                    onClick={() => toggleComments(message.id)}
                  >
                    💬 {message.comments.length} comments
                  </button>
                </div>

                {showComments && (
                  <div className="discussion-comments">
                    {message.comments.map((comment) => (
                      <p key={comment}>• {comment}</p>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </>
  );
}
