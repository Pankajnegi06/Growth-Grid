'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Scheme { _id: string; title: string; ministry: string; description: string; eligibility: string; benefits: string; category: string; targetGroup: string; source: string; applicationProcess: string; sourceUrl: string; }

function formatTimeAgo(d: string | null): string {
  if (!d) return '';
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchSchemes = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    fetch(`/api/schemes?${params}&_t=${Date.now()}`).then(r => r.json()).then(d => { setSchemes(d.schemes || []); setLastUpdated(d.lastUpdated || null); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchSchemes(); }, [category]);

  const categories = ['', 'Education', 'Employment', 'Skills', 'Entrepreneurship'];
  const catColors: Record<string, string> = { Education: '#4f7df5', Employment: '#10b981', Skills: '#f59e0b', Entrepreneurship: '#ec4899' };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>🏛️ Government Schemes</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Real government schemes, scholarships, and welfare programs</p>
        {lastUpdated && <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>🔄 Updated {formatTimeAgo(lastUpdated)}</span>}
        {loading && <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>⏳ Refreshing...</span>}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input className="input-field" style={{ flex: '1 1 250px' }} placeholder="Search schemes..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchSchemes()} />
        <button className="btn-gradient" onClick={fetchSchemes} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>{loading ? '⏳' : 'Search'}</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: category === c ? 'rgba(139,92,246,0.2)' : 'transparent', color: category === c ? '#a78bfa' : 'var(--text-secondary)' }}>
            {c || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="shimmer" style={{ height: 200 }} />)}
        </div>
      ) : schemes.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}><p style={{ color: 'var(--text-secondary)' }}>No schemes found. <Link href="/api/scrape" style={{ color: 'var(--accent-blue)' }}>Trigger scraping</Link></p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
          {schemes.map(s => (
            <div key={s._id} className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span className="badge" style={{ background: `${catColors[s.category] || '#6366f1'}20`, color: catColors[s.category] || '#818cf8' }}>{s.category}</span>
                <span className="source-badge" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>{s.source}</span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
              {s.ministry && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>🏛️ {s.ministry}</div>}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{s.description.substring(0, 150)}</p>
              {s.benefits && <div style={{ fontSize: '0.8rem', color: '#34d399', marginBottom: 6 }}>💰 {s.benefits.substring(0, 100)}</div>}
              {s.eligibility && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>📋 {s.eligibility.substring(0, 100)}</div>}
              <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn-gradient" style={{ padding: '8px 16px', fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}>Learn More →</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
