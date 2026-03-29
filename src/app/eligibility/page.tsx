'use client';
import { useState } from 'react';

interface EligibilityResult {
  summary: string;
  eligibleJobs: { title: string; reason: string; matchScore: number }[];
  eligibleExams: { title: string; reason: string; matchScore: number }[];
  partialMatches: { title: string; reason: string; gap: string }[];
  skillGaps: string[];
  suggestions: string[];
}

export default function EligibilityPage() {
  const [form, setForm] = useState({ education: '12th', stream: 'Other', skills: '', ageGroup: '18-22' });
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/eligibility', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) }),
      });
      const data = await res.json();
      setResult(data);
    } catch { setResult(null); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>🎯 AI Eligibility Checker</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Gemini AI analyzes your profile against real job listings and exams to find what you&apos;re eligible for</p>

      <div className="glass-card" style={{ padding: 28, marginBottom: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Education</label>
            <select className="input-field" value={form.education} onChange={e => setForm({ ...form, education: e.target.value })}>
              <option value="10th">10th</option><option value="12th">12th</option><option value="Graduate">Graduate</option><option value="Post-Graduate">Post-Graduate</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Stream</label>
            <select className="input-field" value={form.stream} onChange={e => setForm({ ...form, stream: e.target.value })}>
              <option value="Science">Science</option><option value="Commerce">Commerce</option><option value="Arts">Arts</option><option value="Engineering">Engineering</option><option value="Medical">Medical</option><option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Age Group</label>
            <select className="input-field" value={form.ageGroup} onChange={e => setForm({ ...form, ageGroup: e.target.value })}>
              <option value="15-18">15-18</option><option value="18-22">18-22</option><option value="22-25">22-25</option><option value="25+">25+</option>
            </select>
          </div>
        </div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Skills</label>
        <input className="input-field" style={{ marginBottom: 20 }} value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="e.g. Python, Data Analysis, Communication" />
        <button className="btn-gradient" onClick={check} disabled={loading} style={{ padding: '12px 28px' }}>
          {loading ? '🔄 Analyzing with Gemini AI...' : '🎯 Check My Eligibility'}
        </button>
      </div>

      {result && (
        <div>
          <div className="glass-card" style={{ padding: 24, marginBottom: 24, background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(79,125,245,0.08))' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>📋 Analysis Summary</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.summary}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {result.eligibleJobs?.length > 0 && (
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: '#34d399' }}>✅ Eligible Jobs</h3>
                {result.eligibleJobs.map((j, i) => (
                  <div key={i} style={{ padding: 12, borderRadius: 10, background: 'rgba(16,185,129,0.05)', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{j.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{j.reason}</div>
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--border-color)' }}><div style={{ height: '100%', borderRadius: 2, background: '#34d399', width: `${j.matchScore}%` }} /></div>
                      <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>{j.matchScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {result.eligibleExams?.length > 0 && (
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: '#6d9bff' }}>📝 Eligible Exams</h3>
                {result.eligibleExams.map((e, i) => (
                  <div key={i} style={{ padding: 12, borderRadius: 10, background: 'rgba(79,125,245,0.05)', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{e.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{e.reason}</div>
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--border-color)' }}><div style={{ height: '100%', borderRadius: 2, background: '#6d9bff', width: `${e.matchScore}%` }} /></div>
                      <span style={{ fontSize: '0.75rem', color: '#6d9bff', fontWeight: 700 }}>{e.matchScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {result.skillGaps?.length > 0 && (
            <div className="glass-card" style={{ padding: 24, marginTop: 16 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: '#fbbf24' }}>⚡ Skill Gaps to Bridge</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {result.skillGaps.map(g => <span key={g} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.1)', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600 }}>{g}</span>)}
              </div>
            </div>
          )}

          {result.suggestions?.length > 0 && (
            <div className="glass-card" style={{ padding: 24, marginTop: 16 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: '#a78bfa' }}>💡 Suggestions</h3>
              <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 2 }}>
                {result.suggestions.map(s => <li key={s}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
