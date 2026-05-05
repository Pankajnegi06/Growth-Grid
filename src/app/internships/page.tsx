'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Internship {
  _id: string; title: string; company: string; location: string;
  stipend: string; duration: string; type: string; category: string;
  applyLink: string; source: string;
}

function formatTimeAgo(d: string | null): string {
  if (!d) return '';
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}

export default function InternshipsPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkingId, setBookmarkingId] = useState<string | null>(null);

  // Load bookmarks
  useEffect(() => {
    if (session) {
      fetch('/api/bookmarks').then(r => r.json()).then(d => {
        const ids = new Set<string>((d.bookmarks || [])
          .filter((b: { type: string }) => b.type === 'internship')
          .map((b: { refId: string }) => b.refId));
        setBookmarkedIds(ids);
      }).catch(() => {});
    }
  }, [session]);

  const fetchData = (resetPage = false) => {
    const p = resetPage ? 1 : page;
    if (resetPage) setPage(1);
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type) params.set('type', type);
    params.set('page', String(p));
    fetch(`/api/internships?${params}&_t=${Date.now()}`)
      .then(r => r.json())
      .then(d => { setItems(d.internships || []); setTotalCount(d.total || 0); setTotalPages(d.totalPages || 1); setLastUpdated(d.lastUpdated || null); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [type, page]);

  const toggleBookmark = async (id: string) => {
    if (!session) return;
    setBookmarkingId(id);
    const isBookmarked = bookmarkedIds.has(id);
    try {
      await fetch('/api/bookmarks', {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'internship', refId: id }),
      });
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        isBookmarked ? next.delete(id) : next.add(id);
        return next;
      });
    } catch { /* silent */ }
    setBookmarkingId(null);
  };

  const typeColor: Record<string, { bg: string; text: string }> = {
    'remote':    { bg: 'rgba(52,211,153,0.15)', text: '#34d399' },
    'in-office': { bg: 'rgba(79,125,245,0.15)', text: '#6d9bff' },
    'hybrid':    { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24' },
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 6 }}>
          Internships
          {totalCount > 0 && <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#34d399', marginLeft: 10, padding: '4px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.15)' }}>{totalCount} available</span>}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>Real listings from Internshala — auto-refreshed</p>
          {lastUpdated && <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>🔄 Updated {formatTimeAgo(lastUpdated)}</span>}
          {loading && <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>⏳ Refreshing...</span>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="input-field" style={{ flex: '1 1 240px', height: 40 }} placeholder="Search internships..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchData(true)} />
        <button className="btn-gradient" style={{ height: 40, padding: '0 20px', fontSize: '0.875rem', opacity: loading ? 0.7 : 1 }} onClick={() => fetchData(true)} disabled={loading}>{loading ? '⏳' : 'Search'}</button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
        {[{ val: '', label: 'All' }, { val: 'in-office', label: 'In-Office' }, { val: 'remote', label: 'Remote' }, { val: 'hybrid', label: 'Hybrid' }].map(t => (
          <button key={t.val} onClick={() => { setType(t.val); setPage(1); }} style={{ padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s', background: type === t.val ? 'rgba(79,125,245,0.2)' : 'rgba(255,255,255,0.05)', color: type === t.val ? '#6d9bff' : 'rgba(255,255,255,0.5)' }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="shimmer" style={{ height: 120, borderRadius: 12 }} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card" style={{ padding: 56, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
          <p style={{ color: 'var(--text-secondary)' }}>No internships found. Data will refresh automatically.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {items.map(item => {
            const tc = typeColor[item.type?.toLowerCase()] || { bg: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.5)' };
            const isBookmarked = bookmarkedIds.has(item._id);
            return (
              <div key={item._id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s, transform 0.2s', position: 'relative' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(52,211,153,0.3)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                {/* Bookmark button */}
                {session && (
                  <button
                    onClick={() => toggleBookmark(item._id)}
                    disabled={bookmarkingId === item._id}
                    style={{
                      position: 'absolute', top: 10, right: 10, background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: '1.1rem', opacity: bookmarkingId === item._id ? 0.4 : 1,
                      transition: 'transform 0.2s', padding: 4,
                    }}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark this'}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.2)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                  >{isBookmarked ? '🔖' : '🏷️'}</button>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingRight: session ? 30 : 0 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.05em', background: tc.bg, color: tc.text }}>{item.type || 'In-Office'}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>Internshala</span>
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.35, marginBottom: 8, color: '#fff' }}>{item.title.length > 55 ? item.title.substring(0, 55) + '…' : item.title}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                  {item.company && <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 5 }}>{item.company.length > 22 ? item.company.substring(0, 22) + '…' : item.company}</span>}
                  {item.location && <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 5 }}>📍 {item.location.length > 16 ? item.location.substring(0, 16) + '…' : item.location}</span>}
                  {item.stipend && item.stipend !== 'Unpaid' && <span style={{ fontSize: '0.75rem', color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '2px 8px', borderRadius: 5, fontWeight: 600 }}>{item.stipend.length > 20 ? item.stipend.substring(0, 20) + '…' : item.stipend}</span>}
                  {item.stipend === 'Unpaid' && <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 5 }}>Unpaid</span>}
                </div>
                <div style={{ marginTop: 'auto' }}>
                  <a href={item.applyLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.8rem', background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)', transition: 'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(52,211,153,0.22)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(52,211,153,0.12)'; }}
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
