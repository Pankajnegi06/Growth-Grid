'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [opportunitiesOpen, setOpportunitiesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  const mainLinks = [
    { href: '/jobs', label: 'Jobs' },
    { href: '/schemes', label: 'Schemes' },
    { href: '/eligibility', label: 'Eligibility' },
  ];

  const aiLinks = [
    { href: '/roadmap', label: 'AI Roadmap' },
    { href: '/advisor', label: 'AI Advisor' },
  ];

  const opportunities = [
    { href: '/internships', label: 'Internships' },
    { href: '/hackathons', label: 'Hackathons' },
    { href: '/opensource', label: 'Open Source' },
  ];

  return (
    <>
      <style>{`
        .nav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 8px; text-decoration: none;
          font-size: 0.875rem; font-weight: 500; transition: all 0.2s;
          color: rgba(255,255,255,0.6); white-space: nowrap;
        }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.07); }
        .nav-link.active { color: #fff; background: rgba(79,125,245,0.2); }

        .nav-pill {
          display: flex; align-items: center; gap: 2px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 5px;
        }

        .ai-badge {
          font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;
          background: linear-gradient(135deg, #4f7df5, #8b5cf6);
          color: #fff; letter-spacing: 0.05em; text-transform: uppercase;
        }

        .opp-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 8px;
          font-size: 0.875rem; font-weight: 500; transition: all 0.2s;
          color: rgba(255,255,255,0.6); background: none; border: none; cursor: pointer;
        }
        .opp-btn:hover { color: #fff; background: rgba(255,255,255,0.07); }

        .dropdown {
          position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
          min-width: 180px; padding-top: 8px;
        }
        .dropdown-inner {
          background: rgba(15,15,35,0.95); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 6px; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          backdrop-filter: blur(20px);
        }

        .dropdown-link {
          display: block; padding: 9px 14px; border-radius: 8px;
          text-decoration: none; font-size: 0.875rem; font-weight: 500;
          color: rgba(255,255,255,0.65); transition: all 0.15s;
        }
        .dropdown-link:hover { color: #fff; background: rgba(79,125,245,0.15); }

        .divider { width: 1px; height: 20px; background: rgba(255,255,255,0.1); margin: 0 4px; }

        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
        @media (min-width: 901px) {
          .mobile-toggle { display: none !important; }
        }
      `}</style>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(8,8,22,0.92)' : 'rgba(8,8,22,0.75)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        transition: 'background 0.3s',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
        }}>

          {/* ── Logo ── */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #4f7df5 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 17, color: '#fff',
              boxShadow: '0 4px 16px rgba(79,125,245,0.4)',
            }}>G</div>
            <span style={{
              fontSize: 20, fontWeight: 800,
              background: 'linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.6))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>GrowthGrid</span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* Main links pill */}
            <div className="nav-pill">
              {mainLinks.map(l => (
                <Link key={l.href} href={l.href} className={`nav-link${isActive(l.href) ? ' active' : ''}`}>
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="divider" />

            {/* AI links pill */}
            <div className="nav-pill">
              <span className="ai-badge">AI</span>
              {aiLinks.map(l => (
                <Link key={l.href} href={l.href} className={`nav-link${isActive(l.href) ? ' active' : ''}`}>
                  {l.label.replace('AI ', '')}
                </Link>
              ))}
            </div>

            <div className="divider" />

            {/* Opportunities dropdown */}
            <div style={{ position: 'relative' }}
              onMouseEnter={() => setOpportunitiesOpen(true)}
              onMouseLeave={() => setOpportunitiesOpen(false)}>
              <button className="opp-btn">
                Opportunities
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.5, transition: 'transform 0.2s', transform: opportunitiesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {opportunitiesOpen && (
                <div className="dropdown">
                  <div className="dropdown-inner">
                    {opportunities.map(o => (
                      <Link key={o.href} href={o.href} className="dropdown-link"
                        style={{ color: isActive(o.href) ? '#6d9bff' : undefined }}>
                        {o.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {session && (
              <>
                <div className="divider" />
                <Link href="/dashboard" className={`nav-link${isActive('/dashboard') ? ' active' : ''}`}>
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* ── Auth ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {session ? (
              <>
                <Link href="/bookmarks" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 34, height: 34, borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 14, transition: 'all 0.2s',
                }}>🔖</Link>

                <Link href="/profile" style={{
                  display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                  padding: '6px 14px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4f7df5, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: '#fff',
                  }}>{session.user?.name?.[0]?.toUpperCase()}</div>
                  {session.user?.name?.split(' ')[0]}
                </Link>

                <button onClick={() => signOut()} style={{
                  padding: '7px 14px', borderRadius: 8,
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
                }}>Sign out</button>
              </>
            ) : (
              <>
                <Link href="/login" style={{
                  padding: '7px 18px', borderRadius: 8, textDecoration: 'none',
                  fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s',
                  color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>Log in</Link>
                <Link href="/register" style={{
                  padding: '7px 18px', borderRadius: 8, textDecoration: 'none',
                  fontSize: '0.875rem', fontWeight: 700, transition: 'all 0.2s',
                  background: 'linear-gradient(135deg, #4f7df5, #8b5cf6)',
                  color: '#fff', boxShadow: '0 4px 14px rgba(79,125,245,0.35)',
                }}>Sign up free</Link>
              </>
            )}

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-toggle"
              style={{
                alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 16,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div style={{
            padding: '12px 16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(8,8,22,0.98)', display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {[...mainLinks, ...aiLinks, ...opportunities, { href: '/dashboard', label: 'Dashboard' }].map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{
                display: 'block', padding: '11px 14px', borderRadius: 8,
                color: isActive(l.href) ? '#6d9bff' : 'rgba(255,255,255,0.65)',
                textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500,
                background: isActive(l.href) ? 'rgba(79,125,245,0.12)' : 'transparent',
              }}>{l.label}</Link>
            ))}
            {!session && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Link href="/login" onClick={() => setMobileOpen(false)} style={{
                  flex: 1, textAlign: 'center', padding: '11px', borderRadius: 8,
                  color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                }}>Log in</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} style={{
                  flex: 1, textAlign: 'center', padding: '11px', borderRadius: 8,
                  color: '#fff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700,
                  background: 'linear-gradient(135deg, #4f7df5, #8b5cf6)',
                }}>Sign up</Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
