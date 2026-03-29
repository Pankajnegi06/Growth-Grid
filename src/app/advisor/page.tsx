'use client';
import { useState, useRef, useEffect } from 'react';

interface Message { role: 'user' | 'assistant'; content: string; }

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    const newMsgs: Message[] = [...messages, { role: 'user', content: msg }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: messages.slice(-6) }),
      });
      const data = await res.json();
      setMessages([...newMsgs, { role: 'assistant', content: data.response || 'Sorry, I could not process that.' }]);
    } catch { setMessages([...newMsgs, { role: 'assistant', content: 'Network error. Please try again.' }]); }
    setLoading(false);
  };

  const suggestions = [
    'Which exams can I give after B.Com?',
    'Best career options after 12th Science?',
    'Is GATE worth it for CSE?',
    'How to prepare for SSC CGL?',
    'Top government jobs for graduates',
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>🤖 AI Career Advisor</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.9rem' }}>Ask anything about careers, exams, and opportunities in India — powered by Gemini AI</p>

      {/* Chat Area */}
      <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', paddingRight: 8, marginBottom: 16 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20 }}>How can I help you today?</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => { setInput(s); }} style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(79,125,245,0.1)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
            <div style={{
              maxWidth: '80%', padding: '14px 18px', borderRadius: 16,
              background: msg.role === 'user' ? 'linear-gradient(135deg, #4f7df5, #8b5cf6)' : 'var(--glass-bg)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)',
              fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
            <div style={{ padding: '14px 18px', borderRadius: 16, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
              <span style={{ animation: 'pulse-glow 1.5s infinite' }}>🤖 Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 12 }}>
        <input className="input-field" style={{ flex: 1 }} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask about careers, exams, jobs..." />
        <button className="btn-gradient" onClick={send} disabled={loading || !input.trim()} style={{ padding: '12px 24px', flexShrink: 0 }}>
          Send →
        </button>
      </div>
    </div>
  );
}
