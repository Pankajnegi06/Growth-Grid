'use client';
import { useEffect, useState } from 'react';

interface OSProgram { _id: string; title: string; organization: string; program: string; techStack: string[]; description: string; stipend: string; timeline: string; applyLink: string; }

function formatTimeAgo(d: string | null): string {
  if (!d) return '';
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}

export default function OpenSourcePage() {
  const [items, setItems] = useState<OSProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (program) params.set('program', program);
    fetch(`/api/opensource?${params}&_t=${Date.now()}`).then(r => r.json()).then(d => { setItems(d.programs || []); setLastUpdated(d.lastUpdated || null); setLoading(false); }).catch(() => setLoading(false));
  }, [program]);

  const progColors: Record<string, string> = { GSoC: '#4f7df5', LFX: '#10b981', Outreachy: '#ec4899', Other: '#f59e0b' };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>🌍 Open Source Programs</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>GSoC, LFX, Outreachy, MLH + live GitHub repos with good-first-issues</p>
        {lastUpdated && <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>🔄 Updated {formatTimeAgo(lastUpdated)}</span>}
        {loading && <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>⏳ Refreshing...</span>}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['', 'GSoC', 'LFX', 'Outreachy', 'Other'].map(p => (
          <button key={p} onClick={() => setProgram(p)} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: program === p ? 'rgba(236,72,153,0.2)' : 'transparent', color: program === p ? '#f472b6' : 'var(--text-secondary)' }}>
            {p || 'All Programs'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 200 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {items.map(p => (
            <div key={p._id} className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span className="badge" style={{ background: `${progColors[p.program] || '#666'}20`, color: progColors[p.program] || '#999' }}>{p.program}</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>{p.title}</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>🏢 {p.organization}</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>{p.description.substring(0, 150)}</p>
              {p.techStack.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {p.techStack.slice(0, 5).map(t => <span key={t} style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(79,125,245,0.1)', color: '#6d9bff', fontSize: '0.7rem', fontWeight: 600 }}>{t}</span>)}
                </div>
              )}
              {p.stipend && <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600, marginBottom: 4 }}>💰 {p.stipend}</div>}
              {p.timeline && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>📅 {p.timeline}</div>}
              <a href={p.applyLink} target="_blank" rel="noopener noreferrer" className="btn-gradient" style={{ padding: '8px 16px', fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}>Learn More & Apply →</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
