'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Application {
  opportunityId: string;
  opportunityType: string;
  title: string;
  organization: string;
  appliedAt: string;
  status: string;
  applyLink: string;
}

const features = [
  {
    icon: '💼', title: 'Job Listings', desc: 'Government & private jobs scraped live from FreeJobAlert, IndGovtJobs & MySarkariNaukri',
    color: '#4f7df5', href: '/jobs',
    highlights: ['Real-time scraping', 'Expired auto-filtered', 'Search & filter'],
  },
  {
    icon: '🏛️', title: 'Government Schemes', desc: 'Scholarships, grants & welfare programs from myScheme.gov.in',
    color: '#8b5cf6', href: '/schemes',
    highlights: ['Category filtering', 'Eligibility info', 'Direct apply links'],
  },
  {
    icon: '🎓', title: 'Internships', desc: '8000+ live internships from Internshala with stipend & location details',
    color: '#10b981', href: '/internships',
    highlights: ['Remote/In-office/Hybrid', 'Stipend details', 'Company info'],
  },
  {
    icon: '🏆', title: 'Hackathons', desc: 'Live hackathons from Devfolio with themes, modes & registration',
    color: '#f59e0b', href: '/hackathons',
    highlights: ['Online/Offline/Hybrid', 'Prize details', 'Theme tags'],
  },
  {
    icon: '🌍', title: 'Open Source Programs', desc: 'GSoC, LFX Mentorship, Outreachy, MLH Fellowship & more',
    color: '#ec4899', href: '/opensource',
    highlights: ['Stipend info', 'Tech stack tags', 'Timeline details'],
  },
  {
    icon: '🤖', title: 'AI Career Tools', desc: 'Gemini-powered career roadmaps, eligibility analysis & advisor chatbot',
    color: '#6366f1', href: '/roadmap',
    highlights: ['Personalized roadmaps', 'Eligibility checker', 'AI chat advisor'],
  },
  {
    icon: '📊', title: 'Dashboard', desc: 'Personalized hub with clickable stats, latest opportunities & quick actions',
    color: '#06b6d4', href: '/dashboard',
    highlights: ['Clickable stat cards', 'Latest from all sources', '"New" badges'],
  },
  {
    icon: '📦', title: 'Archives', desc: 'Browse past & expired listings to track historical opportunities',
    color: '#78716c', href: '/archives',
    highlights: ['Expired jobs', 'Past hackathons', 'Historical data'],
  },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  applied: { bg: 'rgba(79,125,245,0.15)', text: '#6d9bff' },
  'in-review': { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  accepted: { bg: 'rgba(16,185,129,0.15)', text: '#34d399' },
  rejected: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
  expired: { bg: 'rgba(120,113,108,0.15)', text: '#a8a29e' },
};

const typeIcons: Record<string, string> = {
  job: '💼',
  internship: '🎓',
  hackathon: '🏆',
  opensource: '🌍',
  scheme: '🏛️',
};

export default function GalleryPage() {
  const { data: session } = useSession();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tab, setTab] = useState<'features' | 'applied'>('features');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    if (session && tab === 'applied') {
      setLoadingApps(true);
      fetch('/api/applications')
        .then(r => r.json())
        .then(d => { setApplications(d.applications || []); setLoadingApps(false); })
        .catch(() => setLoadingApps(false));
    }
  }, [session, tab]);

  const filteredApps = filterType
    ? applications.filter(a => a.opportunityType === filterType)
    : applications;

  const appStats = {
    total: applications.length,
    jobs: applications.filter(a => a.opportunityType === 'job').length,
    internships: applications.filter(a => a.opportunityType === 'internship').length,
    hackathons: applications.filter(a => a.opportunityType === 'hackathon').length,
    opensource: applications.filter(a => a.opportunityType === 'opensource').length,
    schemes: applications.filter(a => a.opportunityType === 'scheme').length,
  };

  const getDetailLink = (app: Application) => {
    switch (app.opportunityType) {
      case 'job': return `/jobs/${app.opportunityId}`;
      default: return app.applyLink || '#';
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ display: 'inline-block', marginBottom: 12, padding: '6px 16px', borderRadius: 20, background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600 }}>
          🖼️ Platform Gallery
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, marginBottom: 12 }}>
          Explore <span className="gradient-text">Everything</span> GrowthGrid Offers
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
          A visual tour of every feature and data source powering your career journey.
        </p>
      </div>

      {/* Tabs — show "My Applications" only when logged in */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setTab('features')} style={{
          padding: '9px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
          fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
          background: tab === 'features' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
          color: tab === 'features' ? '#818cf8' : 'rgba(255,255,255,0.5)',
        }}>🖼️ All Features</button>

        {session && (
          <button onClick={() => setTab('applied')} style={{
            padding: '9px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
            background: tab === 'applied' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
            color: tab === 'applied' ? '#34d399' : 'rgba(255,255,255,0.5)',
          }}>
            📋 My Applications
            {applications.length > 0 && (
              <span style={{
                marginLeft: 8, padding: '2px 8px', borderRadius: 8, fontSize: '0.72rem',
                background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 700,
              }}>{applications.length}</span>
            )}
          </button>
        )}
      </div>

      {/* ────────────── TAB: Features ────────────── */}
      {tab === 'features' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <Link key={i} href={f.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div
                  style={{
                    background: hoveredIdx === i ? `linear-gradient(135deg, ${f.color}12, ${f.color}08)` : 'var(--glass-bg)',
                    border: `1px solid ${hoveredIdx === i ? `${f.color}40` : 'var(--glass-border)'}`,
                    borderRadius: 16, padding: 28,
                    transition: 'all 0.35s ease',
                    transform: hoveredIdx === i ? 'translateY(-6px)' : 'translateY(0)',
                    boxShadow: hoveredIdx === i ? `0 16px 48px ${f.color}20` : 'none',
                    cursor: 'pointer', position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Accent top bar */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: f.color }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26, transition: 'transform 0.3s',
                      transform: hoveredIdx === i ? 'scale(1.1)' : 'scale(1)',
                    }}>{f.icon}</div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 2 }}>{f.title}</h3>
                      <span style={{ fontSize: '0.7rem', color: f.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Explore →</span>
                    </div>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 16 }}>{f.desc}</p>

                  {/* Highlight pills */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {f.highlights.map(h => (
                      <span key={h} style={{
                        padding: '4px 10px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600,
                        background: `${f.color}12`, color: f.color, border: `1px solid ${f.color}20`,
                      }}>{h}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ────────────── TAB: My Applications ────────────── */}
      {tab === 'applied' && session && (
        <>
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total', count: appStats.total, color: '#818cf8', icon: '📊' },
              { label: 'Jobs', count: appStats.jobs, color: '#4f7df5', icon: '💼' },
              { label: 'Internships', count: appStats.internships, color: '#10b981', icon: '🎓' },
              { label: 'Hackathons', count: appStats.hackathons, color: '#f59e0b', icon: '🏆' },
              { label: 'Open Source', count: appStats.opensource, color: '#ec4899', icon: '🌍' },
              { label: 'Schemes', count: appStats.schemes, color: '#8b5cf6', icon: '🏛️' },
            ].map(s => (
              <div key={s.label} style={{
                background: `${s.color}08`, border: `1px solid ${s.color}20`,
                borderRadius: 12, padding: '16px 14px', textAlign: 'center',
                transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }} className="stat-counter">{s.count}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter by type */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { val: '', label: 'All' },
              { val: 'job', label: '💼 Jobs' },
              { val: 'internship', label: '🎓 Internships' },
              { val: 'hackathon', label: '🏆 Hackathons' },
              { val: 'opensource', label: '🌍 Open Source' },
              { val: 'scheme', label: '🏛️ Schemes' },
            ].map(f => (
              <button key={f.val} onClick={() => setFilterType(f.val)} style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
                background: filterType === f.val ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                color: filterType === f.val ? '#34d399' : 'rgba(255,255,255,0.5)',
              }}>{f.label}</button>
            ))}
          </div>

          {/* Applications list */}
          {loadingApps ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {[1,2,3,4].map(i => <div key={i} className="shimmer" style={{ height: 140 }} />)}
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="glass-card" style={{ padding: 56, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 10 }}>
                {applications.length === 0 ? 'No Applications Yet' : 'No matching applications'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
                {applications.length === 0
                  ? 'Start applying to jobs, internships, and more — your applications will be tracked here automatically!'
                  : 'Try a different filter to see your applications.'}
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/jobs" className="btn-gradient" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>Browse Jobs →</Link>
                <Link href="/internships" className="btn-outline" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>Browse Internships →</Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {filteredApps.map((app, i) => {
                const sc = statusColors[app.status] || statusColors.applied;
                const detailLink = getDetailLink(app);
                const isExternalLink = detailLink.startsWith('http');
                return (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 10,
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(16,185,129,0.3)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                  >
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                        background: 'rgba(99,102,241,0.12)', color: '#818cf8', textTransform: 'uppercase',
                      }}>{typeIcons[app.opportunityType] || '📄'} {app.opportunityType}</span>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                        background: sc.bg, color: sc.text, textTransform: 'uppercase',
                      }}>{app.status}</span>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.35 }}>
                      {app.title.length > 60 ? app.title.substring(0, 60) + '…' : app.title}
                    </h3>

                    {/* Organization */}
                    {app.organization && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        🏢 {app.organization}
                      </span>
                    )}

                    {/* Applied date */}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      📅 Applied: {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                      {isExternalLink ? (
                        <a href={detailLink} target="_blank" rel="noopener noreferrer" style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '8px', borderRadius: 8, textDecoration: 'none', fontWeight: 700,
                          fontSize: '0.78rem', background: 'rgba(16,185,129,0.12)', color: '#34d399',
                          border: '1px solid rgba(16,185,129,0.2)', transition: 'all 0.2s',
                        }}>View Details →</a>
                      ) : (
                        <Link href={detailLink} style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '8px', borderRadius: 8, textDecoration: 'none', fontWeight: 700,
                          fontSize: '0.78rem', background: 'rgba(16,185,129,0.12)', color: '#34d399',
                          border: '1px solid rgba(16,185,129,0.2)', transition: 'all 0.2s',
                        }}>View Details →</Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Not logged in message for applied tab */}
      {tab === 'applied' && !session && (
        <div className="glass-card" style={{ padding: 56, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 10 }}>Login Required</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
            Please log in to view your application history.
          </p>
          <Link href="/login" className="btn-gradient">Log In →</Link>
        </div>
      )}

      {/* Bottom CTA */}
      <div style={{ textAlign: 'center', marginTop: 56 }}>
        <div className="glass-card" style={{ display: 'inline-block', padding: '32px 48px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 10 }}>Ready to explore?</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>Create your free account and get AI-personalized recommendations.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-gradient" style={{ padding: '12px 28px' }}>Get Started Free →</Link>
            <Link href="/dashboard" className="btn-outline" style={{ padding: '12px 28px' }}>Go to Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
