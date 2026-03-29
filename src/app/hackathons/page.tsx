'use client';
import { useEffect, useState } from 'react';

interface Hackathon { _id: string; title: string; organizer: string; themes: string[]; mode: string; startDate: string; participants: string; applyLink: string; description: string; source: string; }

export default function HackathonsPage() {
  const [items, setItems] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (mode) params.set('mode', mode);
    fetch(`/api/hackathons?${params}`).then(r => r.json()).then(d => { setItems(d.hackathons || []); setLoading(false); }).catch(() => setLoading(false));
  }, [mode]);

  const modeColors: Record<string, string> = { online: '#10b981', offline: '#f59e0b', hybrid: '#8b5cf6' };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>🏆 Hackathons</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Live & upcoming hackathons from Devfolio — register and build!</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['', 'online', 'offline', 'hybrid'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: mode === m ? 'rgba(245,158,11,0.2)' : 'transparent', color: mode === m ? '#fbbf24' : 'var(--text-secondary)' }}>
            {m || 'All'} {m && (m === 'online' ? '🌐' : m === 'offline' ? '🏢' : '🔄')}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="shimmer" style={{ height: 180 }} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}><p style={{ color: 'var(--text-secondary)' }}>No hackathons found.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {items.map(h => (
            <div key={h._id} className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                <span className="badge" style={{ background: `${modeColors[h.mode] || '#666'}20`, color: modeColors[h.mode] || '#999' }}>{h.mode}</span>
                <span className="source-badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>devfolio</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 10 }}>{h.title}</h3>
              {h.themes.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {h.themes.slice(0, 3).map(t => <span key={t} style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: '0.7rem', fontWeight: 600 }}>{t}</span>)}
                </div>
              )}
              {h.startDate && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>📅 Starts: {h.startDate}</div>}
              {h.participants && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>👥 {h.participants} participating</div>}
              <a href={h.applyLink} target="_blank" rel="noopener noreferrer" className="btn-gradient" style={{ padding: '8px 16px', fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}>Register →</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
