'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
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
  freshersworld:  { label: 'Freshersworld',   color: '#e91e8c' },
  timesjobs:      { label: 'TimesJobs',       color: '#ff6600' },
  remoteok:       { label: 'RemoteOK',        color: '#00d4aa' },
  jobicy:         { label: 'Jobicy',          color: '#7c3aed' },
  // JSearch (RapidAPI) — shows actual source portal
  'jsearch-linkedin':  { label: 'LinkedIn',   color: '#0077b5' },
  'jsearch-indeed':    { label: 'Indeed',      color: '#2d4a8a' },
  'jsearch-glassdoor': { label: 'Glassdoor',   color: '#0caa41' },
  'jsearch-ziprecruiter': { label: 'ZipRecruiter', color: '#25a55f' },
  'jsearch-dice':      { label: 'Dice',        color: '#eb1c26' },
  'jsearch-builtin':   { label: 'BuiltIn',     color: '#f97316' },
  'jsearch-breezy':    { label: 'Breezy',      color: '#3b82f6' },
  'jsearch-lever':     { label: 'Lever',       color: '#059669' },
  'jsearch-talent.com': { label: 'Talent',     color: '#8b5cf6' },
  // Indian portals
  naukri_india:   { label: 'Naukri.com',       color: '#4285f4' },
  shine_india:    { label: 'Shine.com',        color: '#1e88e5' },
};

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function JobsPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [trackingId, setTrackingId] = useState<string | null>(null);

  // Fetch user's applied jobs
  useEffect(() => {
    if (session) {
      fetch('/api/applications')
        .then(r => r.json())
        .then(d => {
          const ids = new Set<string>((d.applications || [])
            .filter((a: { opportunityType: string }) => a.opportunityType === 'job')
            .map((a: { opportunityId: string }) => a.opportunityId));
          setAppliedIds(ids);
        })
        .catch(() => {});
    }
  }, [session]);

  const fetchJobs = (resetPage = false) => {
    const p = resetPage ? 1 : page;
    if (resetPage) setPage(1);
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type) params.set('type', type);
    params.set('page', String(p));
    fetch(`/api/jobs?${params}&_t=${Date.now()}`)
      .then(r => r.json())
      .then(d => { setJobs(d.jobs || []); setTotalCount(d.total || 0); setTotalPages(d.totalPages || 1); setLastUpdated(d.lastUpdated || null); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, [type, page]);

  const trackApplication = async (job: Job, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      // Open apply link directly for non-logged-in users
      window.open(job.applyLink, '_blank');
      return;
    }
    setTrackingId(job._id);
    // Open apply link
    window.open(job.applyLink, '_blank');
    // Track application
    if (!appliedIds.has(job._id)) {
      try {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            opportunityId: job._id,
            opportunityType: 'job',
            title: job.title,
            organization: job.organization,
            applyLink: job.applyLink,
          }),
        });
        if (res.ok) {
          setAppliedIds(prev => new Set(prev).add(job._id));
        }
      } catch { /* silent */ }
    }
    setTrackingId(null);
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 6 }}>
          Job Listings
          {totalCount > 0 && <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6d9bff', marginLeft: 10, padding: '4px 12px', borderRadius: 8, background: 'rgba(79,125,245,0.15)' }}>{totalCount} active</span>}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Government & private jobs from trusted Indian portals + live remote listings
          </p>
          {lastUpdated && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,0.12)', color: '#34d399', whiteSpace: 'nowrap' }}>
              🔄 Updated {formatTimeAgo(lastUpdated)}
            </span>
          )}
          {loading && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: 'rgba(251,191,36,0.12)', color: '#fbbf24', whiteSpace: 'nowrap', animation: 'pulse 1.5s infinite' }}>
              ⏳ Refreshing...
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input-field" style={{ flex: '1 1 240px', height: 40 }}
          placeholder="Search jobs..." value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchJobs(true)}
        />
        <button className="btn-gradient" style={{ height: 40, padding: '0 20px', fontSize: '0.875rem', opacity: loading ? 0.7 : 1 }}
          onClick={() => fetchJobs(true)} disabled={loading}>{loading ? '⏳' : 'Search'}</button>
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
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>No jobs found. Data will refresh automatically.</p>
          <Link href="/api/scrape" style={{ color: '#6d9bff', fontSize: '0.9rem' }}>Force Refresh →</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {jobs.map(job => {
            const src = sourceLabel[job.source] || { label: job.source, color: '#888' };
            const isGovt = job.type === 'government';
            const isApplied = appliedIds.has(job._id);
            return (
              <div key={job._id} style={{
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${isApplied ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 0,
                transition: 'border-color 0.2s, transform 0.2s', position: 'relative',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(79,125,245,0.35)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = isApplied ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                {/* Applied badge */}
                {isApplied && (
                  <span style={{
                    position: 'absolute', top: 8, right: 8, fontSize: '0.62rem', fontWeight: 700,
                    padding: '2px 8px', borderRadius: 5,
                    background: 'rgba(16,185,129,0.15)', color: '#34d399', textTransform: 'uppercase',
                  }}>✅ Applied</span>
                )}

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

                {/* Title — clickable to detail page */}
                <Link href={`/jobs/${job._id}`} style={{ textDecoration: 'none', color: '#fff' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.35, marginBottom: 8, transition: 'color 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLHeadingElement).style.color = '#6d9bff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLHeadingElement).style.color = '#fff'; }}
                  >
                    {job.title.length > 55 ? job.title.substring(0, 55) + '…' : job.title}
                  </h3>
                </Link>

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

                {/* Action buttons */}
                <div style={{ marginTop: 'auto', display: 'flex', gap: 6 }}>
                  <button onClick={(e) => trackApplication(job, e)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px', borderRadius: 8, fontWeight: 700,
                    fontSize: '0.8rem', background: isApplied ? 'rgba(16,185,129,0.12)' : 'rgba(79,125,245,0.15)',
                    color: isApplied ? '#34d399' : '#6d9bff',
                    border: `1px solid ${isApplied ? 'rgba(16,185,129,0.2)' : 'rgba(79,125,245,0.25)'}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                    opacity: trackingId === job._id ? 0.6 : 1,
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isApplied ? 'rgba(16,185,129,0.2)' : 'rgba(79,125,245,0.25)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isApplied ? 'rgba(16,185,129,0.12)' : 'rgba(79,125,245,0.15)'; }}
                  >
                    {isApplied ? '✅ Applied' : 'Apply Now →'}
                  </button>
                  <Link href={`/jobs/${job._id}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '8px 12px', borderRadius: 8, textDecoration: 'none', fontWeight: 700,
                    fontSize: '0.8rem', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s',
                  }}>Details</Link>
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
