'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface DashData {
  jobs: Array<Record<string, string>>;
  schemes: Array<Record<string, string>>;
  internships: Array<Record<string, string>>;
  hackathons: Array<Record<string, string>>;
  openSource: Array<Record<string, string>>;
  stats: Record<string, number>;
  lastUpdated?: string;
  needsScrape?: boolean;
}

function isNew(item: Record<string, string>) {
  const scraped = item.scrapedAt;
  if (!scraped) return false;
  return (Date.now() - new Date(scraped).getTime()) < 24 * 60 * 60 * 1000;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  const refreshData = () => {
    fetch(`/api/dashboard?_t=${Date.now()}`).then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
      // Auto-trigger scrape if data is stale
      if (d.needsScrape && !scraping) {
        triggerScrape();
      }
    }).catch(() => setLoading(false));
  };

  const triggerScrape = () => {
    setScraping(true);
    fetch('/api/scrape').then(r => r.json()).then(() => {
      // Re-fetch dashboard after scrape completes
      fetch(`/api/dashboard?_t=${Date.now()}`).then(r => r.json()).then(d => {
        setData(d);
        setScraping(false);
      });
    }).catch(() => setScraping(false));
  };

  useEffect(() => { refreshData(); }, []);

  const user = session?.user as Record<string, unknown> | undefined;


  const sections = [
    { key: 'jobs', label: 'Latest Jobs', icon: '💼', color: '#4f7df5', href: '/jobs', items: data?.jobs },
    { key: 'schemes', label: 'Government Schemes', icon: '🏛️', color: '#8b5cf6', href: '/schemes', items: data?.schemes },
    { key: 'internships', label: 'Internships', icon: '🎓', color: '#10b981', href: '/internships', items: data?.internships },
    { key: 'hackathons', label: 'Hackathons', icon: '🏆', color: '#f59e0b', href: '/hackathons', items: data?.hackathons },
    { key: 'openSource', label: 'Open Source', icon: '🌍', color: '#ec4899', href: '/opensource', items: data?.openSource },
  ];

  const statCards = [
    { label: 'Jobs', count: data?.stats.totalJobs, icon: '💼', color: '#4f7df5', href: '/jobs' },
    { label: 'Schemes', count: data?.stats.totalSchemes, icon: '🏛️', color: '#8b5cf6', href: '/schemes' },
    { label: 'Internships', count: data?.stats.totalInternships, icon: '🎓', color: '#10b981', href: '/internships' },
    { label: 'Hackathons', count: data?.stats.totalHackathons, icon: '🏆', color: '#f59e0b', href: '/hackathons' },
    { label: 'Open Source', count: data?.stats.totalOpenSource, icon: '🌍', color: '#ec4899', href: '/opensource' },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      {/* Welcome */}
      <div className="glass-card" style={{ padding: 32, marginBottom: 32, background: 'linear-gradient(135deg, rgba(79,125,245,0.15), rgba(139,92,246,0.1))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Welcome{user?.name ? `, ${(user.name as string).split(' ')[0]}` : ''} 👋</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              {user?.education && user?.stream ? `${user.education} · ${user.stream} student` : 'Your personalized career hub'}
              {' — '}Here are real opportunities curated for you.
            </p>
          </div>
          {data?.lastUpdated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse-glow 2s infinite' }} />
                <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>Updated {timeAgo(data.lastUpdated)}</span>
              </div>
              <button onClick={triggerScrape} disabled={scraping} style={{
                padding: '6px 14px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 600, cursor: scraping ? 'wait' : 'pointer',
                background: 'rgba(79,125,245,0.1)', border: '1px solid rgba(79,125,245,0.2)', color: '#6d9bff',
                opacity: scraping ? 0.6 : 1, transition: 'all 0.2s',
              }}>{scraping ? '⏳ Scraping...' : '🔄 Refresh Data'}</button>
            </div>
          )}
        </div>

        {/* Scraping banner */}
        {scraping && (
          <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="shimmer" style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600 }}>Fetching fresh data from 7 sources... This may take 30-60 seconds.</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          <Link href="/roadmap" className="btn-gradient" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>🗺️ AI Career Roadmap</Link>
          <Link href="/eligibility" className="btn-outline" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>🎯 Check Eligibility</Link>
          <Link href="/advisor" className="btn-outline" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>🤖 AI Advisor</Link>
          <Link href="/gallery" className="btn-outline" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>🖼️ Gallery</Link>
          <Link href="/archives" className="btn-outline" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>📦 Archives</Link>
        </div>
      </div>

      {/* Stats - Clickable */}
      {data?.stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 32 }}>
          {statCards.map(s => (
            <Link key={s.label} href={s.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card stat-card-clickable" style={{ padding: 20, textAlign: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: '16px 16px 0 0' }} />
                <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.count || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
                <div style={{ fontSize: '0.7rem', color: s.color, marginTop: 6, opacity: 0.7, fontWeight: 600 }}>View All →</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="shimmer" style={{ height: 120 }} />)}
        </div>
      )}

      {/* Sections */}
      {data && sections.map(sec => (
        <div key={sec.key} style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{sec.icon} {sec.label}</h2>
            <Link href={sec.href} style={{ color: sec.color, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>View All →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {(sec.items || []).slice(0, 3).map((item, i) => (
              <div key={i} className="glass-card" style={{ padding: 20, position: 'relative' }}>
                {isNew(item) && (
                  <span style={{
                    position: 'absolute', top: 10, right: 10,
                    padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700,
                    background: 'rgba(16,185,129,0.2)', color: '#34d399',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    animation: 'pulse-glow 2s infinite',
                  }}>New</span>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.4, flex: 1 }}>{(item.title || '').substring(0, 80)}</h3>
                  <span className="source-badge" style={{ background: `${sec.color}20`, color: sec.color, flexShrink: 0, marginLeft: 8 }}>{item.source || sec.key}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 12, lineHeight: 1.5 }}>{(item.description || item.eligibility || '').substring(0, 120)}</p>
                {item.applyLink && (
                  <a href={item.applyLink} target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    color: sec.color, textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600,
                    padding: '6px 14px', borderRadius: 8,
                    background: `${sec.color}15`, border: `1px solid ${sec.color}30`,
                    transition: 'all 0.2s',
                  }}>Apply / Details →</a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
