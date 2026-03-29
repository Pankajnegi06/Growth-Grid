'use client';
import { useEffect, useState } from 'react';

interface Internship { _id: string; title: string; company: string; location: string; stipend: string; duration: string; type: string; category: string; applyLink: string; source: string; }

export default function InternshipsPage() {
  const [items, setItems] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type) params.set('type', type);
    fetch(`/api/internships?${params}`).then(r => r.json()).then(d => { setItems(d.internships || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [type]);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>🎓 Internships</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Real internship listings from Internshala — updated daily</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input className="input-field" style={{ flex: '1 1 250px' }} placeholder="Search internships..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchData()} />
        <select className="input-field" style={{ width: 160 }} value={type} onChange={e => { setType(e.target.value); }}>
          <option value="">All Types</option><option value="in-office">In-Office</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option>
        </select>
        <button className="btn-gradient" onClick={fetchData}>Search</button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="shimmer" style={{ height: 160 }} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}><p style={{ color: 'var(--text-secondary)' }}>No internships found. Trigger scraping first.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {items.map(item => (
            <div key={item._id} className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span className="badge badge-green">{item.type || 'in-office'}</span>
                <span className="source-badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>internshala</span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>{item.title.substring(0, 80)}</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>🏢 {item.company}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>📍 {item.location}</div>
              {item.stipend && <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600, marginBottom: 4 }}>💰 {item.stipend}</div>}
              {item.duration && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>⏱️ {item.duration}</div>}
              <a href={item.applyLink} target="_blank" rel="noopener noreferrer" className="btn-gradient" style={{ padding: '8px 16px', fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}>Apply →</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
