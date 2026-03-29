'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Read from DOM directly to capture browser-autofilled values
    const email = (document.getElementById('login-email') as HTMLInputElement)?.value || form.email;
    const password = (document.getElementById('login-password') as HTMLInputElement)?.value || form.password;

    console.log('Login attempt — email:', email, '| password length:', password.length);

    const res = await signIn('credentials', { redirect: false, email, password });
    setLoading(false);
    console.log('SignIn result:', res);
    if (res?.error) setError('Invalid email or password');
    else router.push('/dashboard');
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 440, padding: 40 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>Welcome Back</h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 32, fontSize: '0.95rem' }}>Sign in to your GrowthGrid account</p>
        {error && <div style={{ padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: '0.85rem', marginBottom: 20, textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
          <input
            id="login-email" type="email" required className="input-field" style={{ marginBottom: 16 }}
            value={form.email}
            onChange={e => { setError(''); setForm({ ...form, email: e.target.value }); }}
            onBlur={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com"
          />
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
          <input
            id="login-password" type="password" required className="input-field" style={{ marginBottom: 24 }}
            value={form.password}
            onChange={e => { setError(''); setForm({ ...form, password: e.target.value }); }}
            onBlur={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="••••••••"
          />
          <button type="submit" className="btn-gradient" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Don&apos;t have an account? <Link href="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
