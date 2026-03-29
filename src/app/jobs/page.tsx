'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Job { _id: string; title: string; organization: string; location: string; salary: string; category: string; type: string; eligibility: string; source: string; applyLink: string; importantDates: { lastDate: string }; }

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type) params.set('type', type);
    params.set('page', String(page));
    fetch(`/api/jobs?${params}`).then(r => r.json()).then(d => { setJobs(d.jobs || []); setTotalPages(d.totalPages || 1); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, [type, page]);

  const sourceColors: Record<string, string> = { freejobalert: '#4f7df5', indgovtjobs: '#10b981', mysarkarinaukri: '#f59e0b' };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>💼 Job Listings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Real government & private job listings scraped from trusted Indian portals</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input className="input-field" style={{ flex: '1 1 250px' }} placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchJobs()} />
        <select className="input-field" style={{ width: 180 }} value={type} onChange={e => { setType(e.target.value); setPage(1); }}>
          <option value="">All Types</option><option value="government">Government</option><option value="private">Private</option>
        </select>
        <button className="btn-gradient" onClick={() => { setPage(1); fetchJobs(); }}>Search</button>
      </div>

      {/* Type tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['', 'government', 'private'].map(t => (
          <button key={t} onClick={() => { setType(t); setPage(1); }} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: type === t ? 'rgba(79,125,245,0.2)' : 'transparent', color: type === t ? '#6d9bff' : 'var(--text-secondary)' }}>
            {t === '' ? 'All' : t === 'government' ? '🏛️ Government' : '🏢 Private'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="shimmer" style={{ height: 180 }} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No jobs found. Try scraping data first.</p>
          <Link href="/api/scrape" style={{ color: 'var(--accent-blue)', fontSize: '0.9rem' }}>Trigger Scraping →</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {jobs.map(job => (
            <div key={job._id} className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                <span className="badge" style={{ background: `${job.type === 'government' ? 'rgba(79,125,245,0.2)' : 'rgba(139,92,246,0.2)'}`, color: job.type === 'government' ? '#6d9bff' : '#a78bfa' }}>
                  {job.type}
                </span>
                <span className="source-badge" style={{ background: `${sourceColors[job.source] || '#666'}20`, color: sourceColors[job.source] || '#999' }}>{job.source}</span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{job.title.substring(0, 100)}</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>🏢 {job.organization || 'N/A'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>📍 {job.location}</div>
              {job.eligibility && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>📋 {job.eligibility.substring(0, 100)}</div>}
              {job.importantDates?.lastDate && <div style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 600, marginBottom: 12 }}>⏰ Last Date: {job.importantDates.lastDate}</div>}
              <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="btn-gradient" style={{ padding: '8px 16px', fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}>
                View Details & Apply →
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-outline" style={{ padding: '8px 16px' }}>← Prev</button>
          <span style={{ padding: '8px 16px', color: 'var(--text-secondary)' }}>Page {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn-outline" style={{ padding: '8px 16px' }}>Next →</button>
        </div>
      )}
    </div>
  );
}
