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
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const user = session?.user as Record<string, unknown> | undefined;

  const sections = [
    { key: 'jobs', label: 'Latest Jobs', icon: '💼', color: '#4f7df5', href: '/jobs', items: data?.jobs },
    { key: 'schemes', label: 'Government Schemes', icon: '🏛️', color: '#8b5cf6', href: '/schemes', items: data?.schemes },
    { key: 'internships', label: 'Internships', icon: '🎓', color: '#10b981', href: '/internships', items: data?.internships },
    { key: 'hackathons', label: 'Hackathons', icon: '🏆', color: '#f59e0b', href: '/hackathons', items: data?.hackathons },
    { key: 'openSource', label: 'Open Source', icon: '🌍', color: '#ec4899', href: '/opensource', items: data?.openSource },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      {/* Welcome */}
      <div className="glass-card" style={{ padding: 32, marginBottom: 32, background: 'linear-gradient(135deg, rgba(79,125,245,0.15), rgba(139,92,246,0.1))' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Welcome{user?.name ? `, ${(user.name as string).split(' ')[0]}` : ''} 👋</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          {user?.education && user?.stream ? `${user.education} · ${user.stream} student` : 'Your personalized career hub'}
          {' — '}Here are real opportunities curated for you.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          <Link href="/roadmap" className="btn-gradient" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>🗺️ AI Career Roadmap</Link>
          <Link href="/eligibility" className="btn-outline" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>🎯 Check Eligibility</Link>
          <Link href="/advisor" className="btn-outline" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>🤖 AI Advisor</Link>
        </div>
      </div>

      {/* Stats */}
      {data?.stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Jobs', count: data.stats.totalJobs, icon: '💼', color: '#4f7df5' },
            { label: 'Schemes', count: data.stats.totalSchemes, icon: '🏛️', color: '#8b5cf6' },
            { label: 'Internships', count: data.stats.totalInternships, icon: '🎓', color: '#10b981' },
            { label: 'Hackathons', count: data.stats.totalHackathons, icon: '🏆', color: '#f59e0b' },
            { label: 'Open Source', count: data.stats.totalOpenSource, icon: '🌍', color: '#ec4899' },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.count || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
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
              <div key={i} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.4, flex: 1 }}>{(item.title || '').substring(0, 80)}</h3>
                  <span className="source-badge" style={{ background: `${sec.color}20`, color: sec.color, flexShrink: 0, marginLeft: 8 }}>{item.source || sec.key}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 12, lineHeight: 1.5 }}>{(item.description || item.eligibility || '').substring(0, 120)}</p>
                {item.applyLink && (
                  <a href={item.applyLink} target="_blank" rel="noopener noreferrer" style={{ color: sec.color, textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>Apply / Details →</a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
