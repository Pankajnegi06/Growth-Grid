'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', ageGroup: '18-24', education: '12th', stream: 'Other', skills: '', interests: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean), interests: form.interests.split(',').map(s => s.trim()).filter(Boolean), age: parseInt(form.age) || undefined }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error || 'Registration failed');
    else router.push('/login');
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 500, padding: 40 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>Create Account</h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 24, fontSize: '0.9rem' }}>Step {step} of 2 — {step === 1 ? 'Basic Info' : 'Your Profile'}</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--accent-blue)' }} />
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: step >= 2 ? 'var(--accent-blue)' : 'var(--border-color)' }} />
        </div>
        {error && <div style={{ padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: '0.85rem', marginBottom: 20, textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
              <input
                id="reg-name" required className="input-field" style={{ marginBottom: 16 }}
                value={form.name}
                onChange={e => { setError(''); setForm({ ...form, name: e.target.value }); }}
                onBlur={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your full name"
              />
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
              <input
                id="reg-email" type="email" required className="input-field" style={{ marginBottom: 16 }}
                value={form.email}
                onChange={e => { setError(''); setForm({ ...form, email: e.target.value }); }}
                onBlur={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
              />
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
              <input
                id="reg-password" type="password" required minLength={6} className="input-field" style={{ marginBottom: 24 }}
                value={form.password}
                onChange={e => { setError(''); setForm({ ...form, password: e.target.value }); }}
                onBlur={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min 6 characters"
              />
              <button
                type="button" className="btn-gradient"
                style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: '1rem' }}
                onClick={() => {
                  // Read from DOM directly to handle browser autofill
                  const name = (document.getElementById('reg-name') as HTMLInputElement)?.value || form.name;
                  const email = (document.getElementById('reg-email') as HTMLInputElement)?.value || form.email;
                  const password = (document.getElementById('reg-password') as HTMLInputElement)?.value || form.password;
                  setForm(f => ({ ...f, name, email, password }));
                  if (name && email && password.length >= 6) {
                    setError('');
                    setStep(2);
                  } else {
                    setError(!name ? 'Please enter your full name' : !email ? 'Please enter your email' : 'Password must be at least 6 characters');
                  }
                }}
              >
                Continue →
              </button>
            </>

          )}
          {step === 2 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Age Group</label>
                  <select className="input-field" value={form.ageGroup} onChange={e => setForm({ ...form, ageGroup: e.target.value })}>
                    <option value="1-18">1-18</option><option value="18-24">18-24</option><option value="25-40">25-40</option><option value="40+">40+</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Education</label>
                  <select className="input-field" value={form.education} onChange={e => setForm({ ...form, education: e.target.value })}>
                    <option value="10th">10th</option><option value="12th">12th</option><option value="Graduate">Graduate</option><option value="Post-Graduate">Post-Graduate</option>
                  </select>
                </div>
              </div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Stream</label>
              <select className="input-field" style={{ marginBottom: 16 }} value={form.stream} onChange={e => setForm({ ...form, stream: e.target.value })}>
                <option value="Science">Science</option><option value="Commerce">Commerce</option><option value="Arts">Arts</option><option value="Engineering">Engineering</option><option value="Medical">Medical</option><option value="Other">Other</option>
              </select>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Skills (comma separated)</label>
              <input className="input-field" style={{ marginBottom: 16 }} value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="e.g. Python, Data Analysis, Web Dev" />
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Interests (comma separated)</label>
              <input className="input-field" style={{ marginBottom: 24 }} value={form.interests} onChange={e => setForm({ ...form, interests: e.target.value })} placeholder="e.g. AI/ML, Government Jobs, Startups" />
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: 14 }} onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn-gradient" style={{ flex: 2, justifyContent: 'center', padding: 14, fontSize: '1rem' }} disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
              </div>
            </>
          )}
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
