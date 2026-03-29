'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Job {
  _id: string; title: string; organization: string; location: string;
  salary: string; category: string; type: string; eligibility: string;
  source: string; applyLink: string; importantDates: { lastDate: string };
}

const sourceLabel: Record<string, { label: string; color: string }> = {
  freejobalert:   { label: 'FreeJobAlert',   color: '#4f7df5' },
  indgovtjobs:    { label: 'IndGovtJobs',    color: '#10b981' },
  mysarkarinaukri:{ label: 'MySarkariNaukri',color: '#f59e0b' },
  naukri:         { label: 'Naukri',          color: '#06b6d4' },
  linkedin:       { label: 'LinkedIn',        color: '#0077b5' },
  indeed:         { label: 'Indeed',          color: '#2d4a8a' },
  upwork:         { label: 'Upwork',          color: '#14a800' },
  shine:          { label: 'Shine',           color: '#e05c00' },
  monster:        { label: 'Monster',         color: '#6600ff' },
  glassdoor:      { label: 'Glassdoor',       color: '#0caa41' },
  freshersworld:  { label: 'Freshersworld',   color: '#e91e8c' },
  timesjobs:      { label: 'TimesJobs',       color: '#ff6600' },
  curated:        { label: 'Curated',         color: '#8b5cf6' },
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = (resetPage = false) => {
    const p = resetPage ? 1 : page;
    if (resetPage) setPage(1);
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type) params.set('type', type);
    params.set('page', String(p));
    fetch(`/api/jobs?${params}`)
      .then(r => r.json())
      .then(d => { setJobs(d.jobs || []); setTotalPages(d.totalPages || 1); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, [type, page]);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 6 }}>Job Listings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Government & private jobs from trusted Indian portals
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input-field" style={{ flex: '1 1 240px', height: 40 }}
          placeholder="Search jobs..." value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchJobs(true)}
        />
        <button className="btn-gradient" style={{ height: 40, padding: '0 20px', fontSize: '0.875rem' }}
          onClick={() => fetchJobs(true)}>Search</button>
      </div>

      {/* Type tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          { val: '', label: 'All Jobs' },
          { val: 'government', label: 'Government' },
          { val: 'private', label: 'Private' },
        ].map(t => (
          <button key={t.val} onClick={() => { setType(t.val); setPage(1); }} style={{
            padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
            background: type === t.val ? 'rgba(79,125,245,0.2)' : 'rgba(255,255,255,0.05)',
            color: type === t.val ? '#6d9bff' : 'rgba(255,255,255,0.5)',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="shimmer" style={{ height: 160, borderRadius: 14 }} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card" style={{ padding: 56, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>No jobs found. Trigger scraping first.</p>
          <Link href="/api/scrape" style={{ color: '#6d9bff', fontSize: '0.9rem' }}>Run Scraper →</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {jobs.map(job => {
            const src = sourceLabel[job.source] || { label: job.source, color: '#888' };
            const isGovt = job.type === 'government';
            return (
              <div key={job._id} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 0,
                transition: 'border-color 0.2s, transform 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(79,125,245,0.35)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                {/* Top row: type badge + source */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    background: isGovt ? 'rgba(79,125,245,0.15)' : 'rgba(139,92,246,0.15)',
                    color: isGovt ? '#6d9bff' : '#a78bfa',
                  }}>{job.type}</span>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                    background: `${src.color}18`, color: src.color,
                  }}>{src.label}</span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.35, marginBottom: 8, color: '#fff' }}>
                  {job.title.length > 55 ? job.title.substring(0, 55) + '…' : job.title}
                </h3>

                {/* Meta pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                  {job.organization && (
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 5 }}>
                      {job.organization.length > 22 ? job.organization.substring(0, 22) + '…' : job.organization}
                    </span>
                  )}
                  {job.location && (
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 5 }}>
                      📍 {job.location.length > 18 ? job.location.substring(0, 18) + '…' : job.location}
                    </span>
                  )}
                  {job.salary && (
                    <span style={{ fontSize: '0.75rem', color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '2px 8px', borderRadius: 5, fontWeight: 600 }}>
                      {job.salary.length > 20 ? job.salary.substring(0, 20) + '…' : job.salary}
                    </span>
                  )}
                  {job.importantDates?.lastDate && (
                    <span style={{ fontSize: '0.75rem', color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '2px 8px', borderRadius: 5, fontWeight: 600 }}>
                      Due: {job.importantDates.lastDate}
                    </span>
                  )}
                </div>

                {/* Apply btn */}
                <div style={{ marginTop: 'auto' }}>
                  <a href={job.applyLink} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px', borderRadius: 8, textDecoration: 'none', fontWeight: 700,
                    fontSize: '0.8rem', background: 'rgba(79,125,245,0.15)', color: '#6d9bff',
                    border: '1px solid rgba(79,125,245,0.25)', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(79,125,245,0.25)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(79,125,245,0.15)'; }}
                  >Apply Now →</a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 40 }}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{
            padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)', color: page <= 1 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)',
            cursor: page <= 1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.85rem',
          }}>← Prev</button>
          <span style={{ padding: '8px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            {page} / {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{
            padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)', color: page >= totalPages ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)',
            cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.85rem',
          }}>Next →</button>
        </div>
      )}
    </div>
  );
}
