import Link from 'next/link';

export default function HomePage() {
  const features = [
    { icon: '💼', title: 'Real Job Listings', desc: 'Live scraped data from FreeJobAlert, IndGovtJobs, MySarkariNaukri', color: '#4f7df5', href: '/jobs' },
    { icon: '🏛️', title: 'Government Schemes', desc: 'Scholarships, grants, and welfare schemes from myScheme.gov.in', color: '#8b5cf6', href: '/schemes' },
    { icon: '🎓', title: 'Internships', desc: '8000+ live internships scraped from Internshala', color: '#10b981', href: '/internships' },
    { icon: '🏆', title: 'Hackathons', desc: 'Live hackathons from Devfolio with themes, dates & registration', color: '#f59e0b', href: '/hackathons' },
    { icon: '🌍', title: 'Open Source Programs', desc: 'GSoC, LFX Mentorship, Outreachy, MLH Fellowship & more', color: '#ec4899', href: '/opensource' },
    { icon: '🤖', title: 'Gemini AI Powered', desc: 'AI career roadmaps, eligibility analysis, and career advisor chatbot', color: '#6366f1', href: '/roadmap' },
  ];

  const stats = [
    { number: '7', label: 'Data Sources' },
    { number: '100+', label: 'Real Listings' },
    { number: 'AI', label: 'Powered' },
    { number: '24/7', label: 'Updated' },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,125,245,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', marginBottom: 16, padding: '6px 16px', borderRadius: 20, background: 'rgba(79,125,245,0.15)', color: '#6d9bff', fontSize: '0.8rem', fontWeight: 600 }}>
            🚀 Powered by Gemini 2.5 Flash AI
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
            Your <span className="gradient-text">AI Career Companion</span> for the Indian Market
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Real jobs, internships, hackathons & government schemes — scraped live from 7 trusted Indian portals. AI-powered personalized career roadmaps and eligibility analysis.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-gradient" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Get Started Free →
            </Link>
            <Link href="/jobs" className="btn-outline" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Browse Jobs
            </Link>
            <Link href="/gallery" className="btn-outline" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              🖼️ Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 24px 60px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: 20 }} className="glass-card">
              <div className="gradient-text stat-counter" style={{ fontSize: '2rem', fontWeight: 900 }}>{s.number}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features - Now clickable */}
      <section style={{ padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>Everything You Need</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 48, fontSize: '1.05rem' }}>Real data. Real opportunities. AI-powered insights.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <Link key={i} href={f.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="glass-card feature-card-hover" style={{ padding: 28, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: f.color, opacity: 0.6 }} />
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 12 }}>{f.desc}</p>
                  <span style={{ fontSize: '0.8rem', color: f.color, fontWeight: 600 }}>Explore →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section style={{ padding: '40px 24px 80px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Trusted Data Sources</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, maxWidth: 800, margin: '0 auto' }}>
          {['FreeJobAlert.com', 'IndGovtJobs.in', 'MySarkariNaukri.com', 'myScheme.gov.in', 'Internshala.com', 'Devfolio.co', 'Google Summer of Code'].map(src => (
            <span key={src} style={{ padding: '8px 20px', borderRadius: 10, background: 'rgba(79,125,245,0.08)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
              {src}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div className="glass-card" style={{ maxWidth: 700, margin: '0 auto', padding: '48px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>Ready to Find Your Path?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: '1rem' }}>
            Create your profile and get AI-personalized career recommendations in seconds.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-gradient" style={{ padding: '14px 36px', fontSize: '1.05rem' }}>
              Join GrowthGrid — It&apos;s Free →
            </Link>
            <Link href="/dashboard" className="btn-outline" style={{ padding: '14px 36px', fontSize: '1.05rem' }}>
              Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
