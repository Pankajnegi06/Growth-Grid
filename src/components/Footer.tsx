import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border-color)', padding: '48px 24px 24px', marginTop: 60 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4f7df5, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>G</div>
            <span style={{ fontSize: 20, fontWeight: 800 }}>GrowthGrid</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
            Your AI-powered career companion for jobs, internships, hackathons, and government schemes in India.
          </p>
        </div>
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: 'var(--accent-blue)' }}>Explore</h4>
          {[['Jobs', '/jobs'], ['Schemes', '/schemes'], ['Internships', '/internships'], ['Hackathons', '/hackathons'], ['Open Source', '/opensource']].map(([label, href]) => (
            <Link key={href} href={href} style={{ display: 'block', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', padding: '4px 0', transition: 'color 0.2s' }}>{label}</Link>
          ))}
        </div>
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: 'var(--accent-purple)' }}>AI Tools</h4>
          {[['Career Roadmap', '/roadmap'], ['Eligibility Checker', '/eligibility'], ['AI Advisor', '/advisor']].map(([label, href]) => (
            <Link key={href} href={href} style={{ display: 'block', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', padding: '4px 0' }}>{label}</Link>
          ))}
        </div>
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16, color: 'var(--accent-green)' }}>Data Sources</h4>
          {['FreeJobAlert', 'IndGovtJobs', 'MySarkariNaukri', 'myScheme.gov.in', 'Internshala', 'Devfolio'].map(s => (
            <span key={s} style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '4px 0' }}>{s}</span>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
        © 2026 GrowthGrid — Built with Next.js & Gemini AI
      </div>
    </footer>
  );
}
