import Link from "next/link";

export default function Home() {
  return (
    <div className="landing-shell">
      <div className="landing-bg-orb landing-bg-orb-1" />
      <div className="landing-bg-orb landing-bg-orb-2" />
      <div className="landing-bg-grid" />

      <nav className="nav landing-nav">
        <Link href="/" className="nav-logo">
          civic<span>pulse</span>
        </Link>
        <div className="landing-nav-links">
          <Link href="/forum" className="landing-link">Forum</Link>
          <Link href="/map" className="landing-link">Map</Link>
          <Link href="/compose" className="nav-btn">
            Raise Issue
          </Link>
        </div>
      </nav>

      <main className="landing-main container">
        <section className="landing-hero">
          <p className="landing-kicker">Neighborhood intelligence for real civic action</p>
          <h1 className="landing-title">
            Turn local problems into
            <span> collective momentum</span>
          </h1>
          <p className="landing-subtitle">
            Report issues, rally community support, and send data-backed letters to real officials.
          </p>
          <div className="landing-cta-row">
            <Link href="/compose" className="landing-primary-btn">Start a Report</Link>
            <Link href="/forum" className="landing-secondary-btn">Explore Forum</Link>
          </div>
        </section>

        <section className="landing-feature-grid">
          <article className="landing-feature-card">
            <p className="landing-feature-title">Community Forum</p>
            <p className="landing-feature-text">See what neighbors are reporting and add your voice to shared concerns.</p>
          </article>
          <article className="landing-feature-card">
            <p className="landing-feature-title">Official Routing</p>
            <p className="landing-feature-text">AI drafts formal requests and routes them to relevant departments.</p>
          </article>
          <article className="landing-feature-card">
            <p className="landing-feature-title">Live Civic Map</p>
            <p className="landing-feature-text">Visualize issue clusters across the city with category-aware map pins.</p>
          </article>
        </section>
      </main>
    </div>
  );
}