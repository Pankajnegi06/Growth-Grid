'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function BookmarksPage() {
  const { data: session } = useSession();
  const [bookmarks, setBookmarks] = useState<{ type: string; refId: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) fetch('/api/bookmarks').then(r => r.json()).then(d => { setBookmarks(d.bookmarks || []); setLoading(false); }).catch(() => setLoading(false));
    else setLoading(false);
  }, [session]);

  const removeBookmark = async (type: string, refId: string) => {
    await fetch('/api/bookmarks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, refId }) });
    setBookmarks(bookmarks.filter(b => !(b.type === type && b.refId === refId)));
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>🔖 Bookmarks</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Your saved jobs, schemes, and opportunities</p>
      {!session ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}><p style={{ color: 'var(--text-secondary)' }}>Please login to view bookmarks</p></div>
      ) : loading ? (
        <div>{[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 60, marginBottom: 12 }} />)}</div>
      ) : bookmarks.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}><p style={{ color: 'var(--text-secondary)' }}>No bookmarks yet. Browse jobs, schemes, or internships and save them!</p></div>
      ) : (
        <div>{bookmarks.map((b, i) => (
          <div key={i} className="glass-card" style={{ padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="badge badge-blue" style={{ marginRight: 8 }}>{b.type}</span>
              <span style={{ fontSize: '0.9rem' }}>{b.refId}</span>
            </div>
            <button onClick={() => removeBookmark(b.type, b.refId)} style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Remove</button>
          </div>
        ))}</div>
      )}
    </div>
  );
}
