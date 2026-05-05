'use client';
import { useState, useEffect } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', toggle);
    return () => window.removeEventListener('scroll', toggle);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 90,
        width: 44, height: 44, borderRadius: 12,
        background: 'linear-gradient(135deg, #4f7df5, #8b5cf6)',
        color: '#fff', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 700,
        boxShadow: '0 8px 24px rgba(79,125,245,0.35)',
        transition: 'all 0.3s ease',
        animation: 'fadeInUp 0.3s ease',
      }}
    >
      ↑
    </button>
  );
}
