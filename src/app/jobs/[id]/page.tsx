'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { use } from 'react';

interface JobDetail {
  _id: string;
  title: string;
  organization: string;
  location: string;
  salary: string;
  category: string;
  type: string;
  vacancies: string;
  description: string;
  eligibility: string;
  applicationProcess: string;
  importantDates: { notificationDate: string; lastDate: string; examDate: string };
  qualificationRequired: string;
  ageLimit: string;
  applyLink: string;
  sourceUrl: string;
  source: string;
  scrapedAt: string;
}

const sourceLabel: Record<string, { label: string; color: string }> = {
  freejobalert:   { label: 'FreeJobAlert',   color: '#4f7df5' },
  indgovtjobs:    { label: 'IndGovtJobs',    color: '#10b981' },
  mysarkarinaukri:{ label: 'MySarkariNaukri',color: '#f59e0b' },
  freshersworld:  { label: 'Freshersworld',   color: '#e91e8c' },
  timesjobs:      { label: 'TimesJobs',       color: '#ff6600' },
  remoteok:       { label: 'RemoteOK',        color: '#00d4aa' },
  jobicy:         { label: 'Jobicy',          color: '#7c3aed' },
  'jsearch-linkedin':  { label: 'LinkedIn',   color: '#0077b5' },
  'jsearch-indeed':    { label: 'Indeed',      color: '#2d4a8a' },
  'jsearch-glassdoor': { label: 'Glassdoor',   color: '#0caa41' },
  'jsearch-ziprecruiter': { label: 'ZipRecruiter', color: '#25a55f' },
  naukri_india:   { label: 'Naukri.com',       color: '#4285f4' },
  shine_india:    { label: 'Shine.com',        color: '#1e88e5' },
};

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then(r => r.json())
      .then(d => { setJob(d.job || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  // Check if already applied
  useEffect(() => {
    if (!session || !job) return;
    fetch('/api/applications')
      .then(r => r.json())
      .then(d => {
        const apps = d.applications || [];
        const found = apps.some((a: { opportunityId: string }) => a.opportunityId === job._id);
        setApplied(found);
      })
      .catch(() => {});
  }, [session, job]);

  const trackApplication = async () => {
    if (!job || !session) return;
    setTracking(true);
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
      if (res.ok) setApplied(true);
    } catch { /* silent */ }
    setTracking(false);
  };

  const handleApplyAndTrack = () => {
    if (job?.applyLink) {
      window.open(job.applyLink, '_blank');
    }
    if (session && !applied) {
      trackApplication();
    }
  };

  if (loading) return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <div className="shimmer" style={{ height: 200, borderRadius: 16, marginBottom: 20 }} />
      <div className="shimmer" style={{ height: 400, borderRadius: 16 }} />
    </div>
  );

  if (!job) return (
    <div style={{ maxWidth: 600, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <div className="glass-card" style={{ padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>Job Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>This listing may have been removed or expired.</p>
        <Link href="/jobs" className="btn-gradient">← Back to Jobs</Link>
      </div>
    </div>
  );

  const src = sourceLabel[job.source] || { label: job.source, color: '#888' };
  const isGovt = job.type === 'government';
  const scrapedDate = job.scrapedAt ? new Date(job.scrapedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      {/* Back nav */}
      <Link href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: 24 }}>
        ← Back to Jobs
      </Link>

      {/* Header card */}
      <div className="glass-card" style={{ padding: 32, marginBottom: 20 }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 8,
            textTransform: 'uppercase', letterSpacing: '0.05em',
            background: isGovt ? 'rgba(79,125,245,0.15)' : 'rgba(139,92,246,0.15)',
            color: isGovt ? '#6d9bff' : '#a78bfa',
          }}>{job.type}</span>
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 8,
            background: `${src.color}18`, color: src.color,
          }}>{src.label}</span>
          {job.category && (
            <span style={{
              fontSize: '0.72rem', fontWeight: 600, padding: '4px 12px', borderRadius: 8,
              background: 'rgba(99,102,241,0.1)', color: '#818cf8',
            }}>{job.category}</span>
          )}
          {applied && (
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 8,
              background: 'rgba(16,185,129,0.15)', color: '#34d399', textTransform: 'uppercase',
            }}>✅ Applied</span>
          )}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, marginBottom: 12, lineHeight: 1.3 }}>
          {job.title}
        </h1>

        {/* Organization */}
        {job.organization && (
          <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 16, fontWeight: 600 }}>
            🏢 {job.organization}
          </div>
        )}

        {/* Quick info pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {job.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '0.85rem' }}>📍</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{job.location}</span>
            </div>
          )}
          {job.salary && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <span style={{ fontSize: '0.85rem' }}>💰</span>
              <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>{job.salary}</span>
            </div>
          )}
          {job.vacancies && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '0.85rem' }}>👥</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{job.vacancies}</span>
            </div>
          )}
        </div>

        {/* Apply Button */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={handleApplyAndTrack} className="btn-gradient" style={{ padding: '14px 32px', fontSize: '0.95rem' }}>
            {applied ? '✅ Applied — View Again' : '🚀 Apply Now & Track'}
          </button>
          {job.sourceUrl && (
            <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ padding: '14px 24px', fontSize: '0.95rem' }}>
              View Source →
            </a>
          )}
        </div>
      </div>

      {/* Details sections */}
      <div style={{ display: 'grid', gap: 16 }}>
        {/* Important Dates */}
        {(job.importantDates?.notificationDate || job.importantDates?.lastDate || job.importantDates?.examDate) && (
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              📅 Important Dates
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {job.importantDates.notificationDate && (
                <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>Posted</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{job.importantDates.notificationDate}</div>
                </div>
              )}
              {job.importantDates.lastDate && (
                <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.12)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>Last Date</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f87171' }}>{job.importantDates.lastDate}</div>
                </div>
              )}
              {job.importantDates.examDate && (
                <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>Exam Date</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{job.importantDates.examDate}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {job.description && (
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>📝 Description</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.92rem', whiteSpace: 'pre-line' }}>{job.description}</p>
          </div>
        )}

        {/* Eligibility & Qualification */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {job.eligibility && (
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>🎯 Eligibility</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem' }}>{job.eligibility}</p>
            </div>
          )}
          {job.qualificationRequired && (
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>🎓 Qualification</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem' }}>{job.qualificationRequired}</p>
            </div>
          )}
        </div>

        {/* Age Limit */}
        {job.ageLimit && (
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>📋 Age Limit</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{job.ageLimit}</p>
          </div>
        )}

        {/* Application Process */}
        {job.applicationProcess && (
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>📬 How to Apply</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem' }}>{job.applicationProcess}</p>
          </div>
        )}

        {/* Footer meta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Source: </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: `${src.color}18`, color: src.color }}>{src.label}</span>
          </div>
          {scrapedDate && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Scraped: {scrapedDate}</span>
          )}
        </div>
      </div>
    </div>
  );
}
