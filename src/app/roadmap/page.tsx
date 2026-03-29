'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface RoadmapPhase { title: string; duration: string; description: string; skills: string[]; resources: string[]; milestones: string[]; }
interface Roadmap { summary: string; phases: RoadmapPhase[]; careerGoals: string[]; alternativePaths: string[]; examsSuggested: string[]; estimatedTimeline: string; }

export default function RoadmapPage() {
  const { data: session } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    education: (user?.education as string) || '12th',
    stream: (user?.stream as string) || 'Other',
    skills: ((user?.skills as string[]) || []).join(', '),
    interests: ((user?.interests as string[]) || []).join(', '),
    ageGroup: (user?.ageGroup as string) || '18-22',
  });

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/roadmap', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean), interests: form.interests.split(',').map(s => s.trim()).filter(Boolean) }),
      });
      const data = await res.json();
      if (data.phases) setRoadmap(data);
      else setRoadmap(null);
    } catch { setRoadmap(null); }
    setLoading(false);
  };

  const phaseColors = ['#4f7df5', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>🗺️ AI Career Roadmap</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Your personalized career roadmap powered by Gemini 2.5 Flash AI</p>

      {/* Input Form */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Tell us about yourself</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
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
        <input className="input-field" style={{ marginBottom: 12 }} value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="e.g. Python, Data Analysis, Communication" />
        <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Interests</label>
        <input className="input-field" style={{ marginBottom: 20 }} value={form.interests} onChange={e => setForm({ ...form, interests: e.target.value })} placeholder="e.g. AI/ML, Government Jobs, Startups" />
        <button className="btn-gradient" onClick={generate} disabled={loading} style={{ padding: '12px 28px', fontSize: '1rem' }}>
          {loading ? '🔄 Generating with Gemini AI...' : '✨ Generate My Roadmap'}
        </button>
      </div>

      {/* Roadmap Visualization */}
      {roadmap && (
        <div>
          {/* Summary */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 24, background: 'linear-gradient(135deg, rgba(79,125,245,0.1), rgba(139,92,246,0.08))' }}>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>{roadmap.summary}</p>
            {roadmap.estimatedTimeline && <div style={{ marginTop: 12, color: '#6d9bff', fontWeight: 600 }}>⏱️ Estimated Timeline: {roadmap.estimatedTimeline}</div>}
          </div>

          {/* Phases */}
          <div style={{ position: 'relative', paddingLeft: 32 }}>
            {/* Timeline line */}
            <div style={{ position: 'absolute', left: 14, top: 0, bottom: 0, width: 3, background: 'linear-gradient(180deg, #4f7df5, #ec4899)', borderRadius: 2 }} />

            {roadmap.phases.map((phase, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: 24 }}>
                {/* Dot */}
                <div style={{ position: 'absolute', left: -24, top: 20, width: 20, height: 20, borderRadius: '50%', background: phaseColors[i % phaseColors.length], border: '3px solid var(--bg-primary)', zIndex: 2 }} />
                <div className="glass-card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: phaseColors[i % phaseColors.length] }}>Phase {i + 1}: {phase.title}</h3>
                    <span className="badge" style={{ background: `${phaseColors[i % phaseColors.length]}20`, color: phaseColors[i % phaseColors.length] }}>{phase.duration}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16, lineHeight: 1.6 }}>{phase.description}</p>
                  {phase.skills.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 6, color: '#6d9bff' }}>🛠️ Skills to Acquire:</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {phase.skills.map(s => <span key={s} style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(79,125,245,0.1)', color: '#6d9bff', fontSize: '0.75rem', fontWeight: 600 }}>{s}</span>)}
                      </div>
                    </div>
                  )}
                  {phase.resources.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 6, color: '#34d399' }}>📚 Resources:</div>
                      <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.8 }}>
                        {phase.resources.map(r => <li key={r}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                  {phase.milestones.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 6, color: '#fbbf24' }}>🎯 Milestones:</div>
                      <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.8 }}>
                        {phase.milestones.map(m => <li key={m}>{m}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Goals & Alternatives */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 24 }}>
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: '#4f7df5' }}>🎯 Career Goals</h3>
              <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 2 }}>
                {roadmap.careerGoals.map(g => <li key={g}>{g}</li>)}
              </ul>
            </div>
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: '#8b5cf6' }}>🔄 Alternative Paths</h3>
              <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 2 }}>
                {roadmap.alternativePaths.map(p => <li key={p}>{p}</li>)}
              </ul>
            </div>
            {roadmap.examsSuggested.length > 0 && (
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: '#f59e0b' }}>📝 Suggested Exams</h3>
                <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 2 }}>
                  {roadmap.examsSuggested.map(e => <li key={e}>{e}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
