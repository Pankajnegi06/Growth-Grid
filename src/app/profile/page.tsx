'use client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;

  if (!session) return (
    <div style={{ maxWidth: 500, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <div className="glass-card" style={{ padding: 48 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>Please Login</h1>
        <Link href="/login" className="btn-gradient">Go to Login</Link>
      </div>
    </div>
  );

  const fields = [
    { label: 'Name', value: user?.name as string },
    { label: 'Email', value: user?.email as string },
    { label: 'Age Group', value: user?.ageGroup as string },
    { label: 'Education', value: user?.education as string },
    { label: 'Stream', value: user?.stream as string },
    { label: 'Skills', value: ((user?.skills as string[]) || []).join(', ') || 'Not set' },
    { label: 'Interests', value: ((user?.interests as string[]) || []).join(', ') || 'Not set' },
  ];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 32 }}>👤 Profile</h1>
      <div className="glass-card" style={{ padding: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #4f7df5, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, margin: '0 auto 20px' }}>
          {(user?.name as string)?.charAt(0) || '?'}
        </div>
        {fields.map(f => (
          <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>{f.label}</span>
            <span style={{ fontSize: '0.9rem' }}>{f.value || 'N/A'}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'center' }}>
          <Link href="/roadmap" className="btn-gradient" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>🗺️ Get AI Roadmap</Link>
          <Link href="/eligibility" className="btn-outline" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>🎯 Check Eligibility</Link>
        </div>
      </div>
    </div>
  );
}
