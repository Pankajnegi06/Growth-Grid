'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Bookmark {
  type: string;
  refId: string;
  _id: string;
  title: string;
  organization?: string;
  location?: string;
  salary?: string;
  applyLink?: string;
  source?: string;
  jobType?: string;
}

const typeConfig: Record<string, { icon: string; color: string; label: string }> = {
  job: { icon: '💼', color: '#4f7df5', label: 'Job' },
  internship: { icon: '🎓', color: '#10b981', label: 'Internship' },
  hackathon: { icon: '🏆', color: '#f59e0b', label: 'Hackathon' },
  scheme: { icon: '🏛️', color: '#8b5cf6', label: 'Scheme' },
  opensource: { icon: '🌍', color: '#ec4899', label: 'Open Source' },
};

export default function BookmarksPage() {
  const { data: session } = useSession();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetch('/api/bookmarks')
        .then(r => r.json())
        .then(d => { setBookmarks(d.bookmarks || []); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  const removeBookmark = async (type: string, refId: string) => {
    setRemoving(refId);
    try {
      await fetch('/api/bookmarks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, refId }),
      });
      setBookmarks(prev => prev.filter(b => !(b.type === type && b.refId === refId)));
    } catch { /* silent */ }
    setRemoving(null);
  };

  const filtered = filter ? bookmarks.filter(b => b.type === filter) : bookmarks;

  const getDetailLink = (bm: Bookmark) => {
    if (bm.type === 'job') return `/jobs/${bm.refId}`;
    return bm.applyLink || '#';
  };

  if (!session) return (
    <div style={{ maxWidth: 600, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <div className="glass-card" style={{ padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔖</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>Login Required</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Please login to view your bookmarks.</p>
        <Link href="/login" className="btn-gradient">Log In →</Link>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 6 }}>
          🔖 Bookmarks
          {bookmarks.length > 0 && (
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#818cf8', marginLeft: 10, padding: '4px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.15)' }}>
              {bookmarks.length} saved
            </span>
          )}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Your saved jobs, internships, hackathons, and schemes — all in one place.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { val: '', label: 'All', icon: '📋' },
          { val: 'job', label: 'Jobs', icon: '💼' },
          { val: 'internship', label: 'Internships', icon: '🎓' },
          { val: 'hackathon', label: 'Hackathons', icon: '🏆' },
          { val: 'scheme', label: 'Schemes', icon: '🏛️' },
        ].map(t => (
          <button key={t.val} onClick={() => setFilter(t.val)} style={{
            padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.2s',
            background: filter === t.val ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
            color: filter === t.val ? '#818cf8' : 'rgba(255,255,255,0.5)',
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="shimmer" style={{ height: 90, borderRadius: 14 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: 56, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔖</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 10 }}>
            {bookmarks.length === 0 ? 'No Bookmarks Yet' : 'No matching bookmarks'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
            {bookmarks.length === 0
              ? 'Browse jobs, internships, and more — click the bookmark icon to save them here!'
              : 'Try selecting a different filter.'}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/jobs" className="btn-gradient" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>Browse Jobs →</Link>
            <Link href="/internships" className="btn-outline" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>Browse Internships →</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map((bm) => {
            const cfg = typeConfig[bm.type] || { icon: '📄', color: '#888', label: bm.type };
            const detailLink = getDetailLink(bm);
            const isExternal = detailLink.startsWith('http');
            return (
              <div key={`${bm.type}-${bm.refId}`} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${cfg.color}40`; (e.currentTarget as HTMLDivElement).style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)'; }}
              >
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: `${cfg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>{cfg.icon}</div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 5,
                      background: `${cfg.color}18`, color: cfg.color, textTransform: 'uppercase',
                    }}>{cfg.label}</span>
                    {bm.jobType && (
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: 5,
                        background: bm.jobType === 'government' ? 'rgba(79,125,245,0.12)' : 'rgba(139,92,246,0.12)',
                        color: bm.jobType === 'government' ? '#6d9bff' : '#a78bfa',
                        textTransform: 'uppercase',
                      }}>{bm.jobType}</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {bm.title || 'Untitled'}
                  </h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {bm.organization && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>🏢 {bm.organization}</span>
                    )}
                    {bm.location && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📍 {bm.location}</span>
                    )}
                    {bm.salary && (
                      <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>💰 {bm.salary}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {isExternal ? (
                    <a href={detailLink} target="_blank" rel="noopener noreferrer" style={{
                      padding: '8px 14px', borderRadius: 8, textDecoration: 'none', fontWeight: 700,
                      fontSize: '0.78rem', background: `${cfg.color}15`, color: cfg.color,
                      border: `1px solid ${cfg.color}25`, transition: 'all 0.2s',
                    }}>View →</a>
                  ) : (
                    <Link href={detailLink} style={{
                      padding: '8px 14px', borderRadius: 8, textDecoration: 'none', fontWeight: 700,
                      fontSize: '0.78rem', background: `${cfg.color}15`, color: cfg.color,
                      border: `1px solid ${cfg.color}25`, transition: 'all 0.2s',
                    }}>View →</Link>
                  )}
                  <button
                    onClick={() => removeBookmark(bm.type, bm.refId)}
                    disabled={removing === bm.refId}
                    style={{
                      padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)',
                      background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer',
                      fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.2s',
                      opacity: removing === bm.refId ? 0.5 : 1,
                    }}
                  >✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
