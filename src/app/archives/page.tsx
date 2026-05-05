'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ArchivedJob {
  _id: string; title: string; organization: string; location: string;
  salary: string; type: string; source: string; applyLink: string;
  description: string; eligibility: string; vacancies: string;
  importantDates: { notificationDate: string; lastDate: string; examDate: string };
  scrapedAt: string;
}

interface PastHackathon {
  _id: string; title: string; organizer: string; mode: string;
  startDate: string; endDate: string; applyLink: string; themes: string[];
  description: string;
}

const sourceLabel: Record<string, { label: string; color: string }> = {
  freejobalert:   { label: 'FreeJobAlert',   color: '#4f7df5' },
  indgovtjobs:    { label: 'IndGovtJobs',    color: '#10b981' },
  mysarkarinaukri:{ label: 'MySarkariNaukri',color: '#f59e0b' },
  freshersworld:  { label: 'Freshersworld',   color: '#e91e8c' },
  timesjobs:      { label: 'TimesJobs',       color: '#ff6600' },
  remoteok:       { label: 'RemoteOK',        color: '#00d4aa' },
  jobicy:         { label: 'Jobicy',          color: '#7c3aed' },
  naukri_india:   { label: 'Naukri.com',       color: '#4285f4' },
  shine_india:    { label: 'Shine.com',        color: '#1e88e5' },
};

export default function ArchivesPage() {
  const [expiredJobs, setExpiredJobs] = useState<ArchivedJob[]>([]);
  const [pastHackathons, setPastHackathons] = useState<PastHackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'jobs' | 'hackathons'>('jobs');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`/api/archives?_t=${Date.now()}`)
      .then(r => r.json())
      .then(d => {
        setExpiredJobs(d.expiredJobs || []);
        setPastHackathons(d.pastHackathons || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredJobs = search
    ? expiredJobs.filter(j =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.organization?.toLowerCase().includes(search.toLowerCase()) ||
        j.location?.toLowerCase().includes(search.toLowerCase())
      )
    : expiredJobs;

  const filteredHackathons = search
    ? pastHackathons.filter(h =>
        h.title.toLowerCase().includes(search.toLowerCase()) ||
        h.organizer?.toLowerCase().includes(search.toLowerCase())
      )
    : pastHackathons;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>📦 Archives</h1>
          <span style={{
            padding: '4px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
            background: 'rgba(120,113,108,0.2)', color: '#a8a29e', textTransform: 'uppercase',
          }}>Past Listings</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Browse expired job listings and past hackathons. Click on any card to view full details.
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          className="input-field"
          placeholder="Search archives..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 400, height: 40 }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[
          { key: 'jobs' as const, label: `Expired Jobs (${filteredJobs.length})`, icon: '💼' },
          { key: 'hackathons' as const, label: `Past Hackathons (${filteredHackathons.length})`, icon: '🏆' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
            background: tab === t.key ? 'rgba(120,113,108,0.2)' : 'rgba(255,255,255,0.05)',
            color: tab === t.key ? '#d6d3d1' : 'rgba(255,255,255,0.4)',
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="shimmer" style={{ height: 140 }} />)}
        </div>
      ) : (
        <>
          {/* Expired Jobs */}
          {tab === 'jobs' && (
            filteredJobs.length === 0 ? (
              <div className="glass-card" style={{ padding: 56, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {search ? 'No expired jobs match your search.' : 'No expired jobs found. All listings are current!'}
                </p>
                <Link href="/jobs" style={{ color: '#6d9bff', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 600 }}>Browse Active Jobs →</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                {filteredJobs.map(job => {
                  const isExpanded = expandedId === job._id;
                  const src = sourceLabel[job.source] || { label: job.source, color: '#888' };
                  return (
                    <div key={job._id} style={{
                      background: 'rgba(255,255,255,0.03)', border: `1px solid ${isExpanded ? 'rgba(79,125,245,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: 14, padding: 18, position: 'relative',
                      cursor: 'pointer', transition: 'all 0.25s',
                      transform: isExpanded ? 'scale(1.01)' : 'scale(1)',
                      boxShadow: isExpanded ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
                    }}
                      onClick={() => setExpandedId(isExpanded ? null : job._id)}
                      onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.15)'; }}
                      onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
                    >
                      {/* Expired badge */}
                      <span style={{
                        position: 'absolute', top: 10, right: 10,
                        padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700,
                        background: 'rgba(239,68,68,0.15)', color: '#f87171', textTransform: 'uppercase',
                      }}>Expired</span>

                      {/* Type + Source */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                          textTransform: 'uppercase',
                          background: job.type === 'government' ? 'rgba(79,125,245,0.15)' : 'rgba(139,92,246,0.15)',
                          color: job.type === 'government' ? '#6d9bff' : '#a78bfa',
                        }}>{job.type}</span>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 600, padding: '3px 8px', borderRadius: 5,
                          background: `${src.color}15`, color: src.color,
                        }}>{src.label}</span>
                      </div>

                      {/* Title */}
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 8, color: 'rgba(255,255,255,0.8)', lineHeight: 1.35 }}>
                        {isExpanded ? job.title : (job.title.length > 55 ? job.title.substring(0, 55) + '…' : job.title)}
                      </h3>

                      {/* Meta pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                        {job.organization && (
                          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 5 }}>
                            🏢 {job.organization.substring(0, 30)}
                          </span>
                        )}
                        {job.location && (
                          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 5 }}>
                            📍 {job.location}
                          </span>
                        )}
                        {job.importantDates?.lastDate && (
                          <span style={{ fontSize: '0.72rem', color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '2px 8px', borderRadius: 5, fontWeight: 600 }}>
                            Closed: {job.importantDates.lastDate}
                          </span>
                        )}
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', animation: 'fadeInUp 0.3s ease' }}>
                          {job.salary && (
                            <div style={{ marginBottom: 8 }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Salary: </span>
                              <span style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 600 }}>{job.salary}</span>
                            </div>
                          )}
                          {job.vacancies && (
                            <div style={{ marginBottom: 8 }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Vacancies: </span>
                              <span style={{ fontSize: '0.82rem' }}>{job.vacancies}</span>
                            </div>
                          )}
                          {job.eligibility && (
                            <div style={{ marginBottom: 8 }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Eligibility: </span>
                              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>{job.eligibility}</span>
                            </div>
                          )}
                          {job.description && (
                            <div style={{ marginBottom: 12 }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Description: </span>
                              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginTop: 4 }}>
                                {job.description.substring(0, 250)}{job.description.length > 250 ? '…' : ''}
                              </p>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <Link href={`/jobs/${job._id}`} onClick={(e) => e.stopPropagation()} style={{
                              padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontWeight: 700,
                              fontSize: '0.78rem', background: 'rgba(79,125,245,0.15)', color: '#6d9bff',
                              border: '1px solid rgba(79,125,245,0.25)', transition: 'all 0.2s',
                            }}>View Full Details →</Link>
                            {job.applyLink && (
                              <a href={job.applyLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{
                                padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontWeight: 700,
                                fontSize: '0.78rem', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
                                border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s',
                              }}>Source Link ↗</a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Expand indicator */}
                      <div style={{ textAlign: 'center', marginTop: 8 }}>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                          {isExpanded ? '▲ Click to collapse' : '▼ Click for details'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Past Hackathons */}
          {tab === 'hackathons' && (
            filteredHackathons.length === 0 ? (
              <div className="glass-card" style={{ padding: 56, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {search ? 'No past hackathons match your search.' : 'No past hackathons found.'}
                </p>
                <Link href="/hackathons" style={{ color: '#fbbf24', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 600 }}>Browse Active Hackathons →</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {filteredHackathons.map(h => {
                  const isExpanded = expandedId === h._id;
                  return (
                    <div key={h._id} style={{
                      background: 'rgba(255,255,255,0.03)', border: `1px solid ${isExpanded ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: 14, padding: 20, position: 'relative',
                      cursor: 'pointer', transition: 'all 0.25s',
                      transform: isExpanded ? 'scale(1.01)' : 'scale(1)',
                      boxShadow: isExpanded ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
                    }}
                      onClick={() => setExpandedId(isExpanded ? null : h._id)}
                    >
                      <span style={{
                        position: 'absolute', top: 10, right: 10,
                        padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700,
                        background: 'rgba(245,158,11,0.15)', color: '#fbbf24', textTransform: 'uppercase',
                      }}>Past</span>

                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: 'rgba(255,255,255,0.8)', lineHeight: 1.35 }}>{h.title}</h3>

                      {h.themes && h.themes.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                          {h.themes.slice(0, 4).map(t => (
                            <span key={t} style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(99,102,241,0.1)', color: 'rgba(129,140,248,0.7)', fontSize: '0.68rem', fontWeight: 600 }}>{t}</span>
                          ))}
                        </div>
                      )}

                      {h.startDate && <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>📅 {h.startDate}{h.endDate ? ` — ${h.endDate}` : ''}</div>}
                      {h.organizer && <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>👤 {h.organizer}</div>}
                      {h.mode && <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>📍 {h.mode}</div>}

                      {/* Expanded details */}
                      {isExpanded && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', animation: 'fadeInUp 0.3s ease' }}>
                          {h.description && (
                            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 12 }}>
                              {h.description.substring(0, 300)}{h.description.length > 300 ? '…' : ''}
                            </p>
                          )}
                          {h.applyLink && (
                            <a href={h.applyLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{
                              display: 'inline-block', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontWeight: 700,
                              fontSize: '0.78rem', background: 'rgba(245,158,11,0.12)', color: '#fbbf24',
                              border: '1px solid rgba(245,158,11,0.25)', transition: 'all 0.2s',
                            }}>View on Devfolio ↗</a>
                          )}
                        </div>
                      )}

                      <div style={{ textAlign: 'center', marginTop: 8 }}>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                          {isExpanded ? '▲ Click to collapse' : '▼ Click for details'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
