import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [isDark, setIsDark] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
      setIsDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  useEffect(() => {
    const sectionIds = [
      'about',
      'skills',
      'projects',
      'opensource',
      'certifications',
      'contact',
    ];

    const updateActiveSection = () => {
      // Activation line: ~35% from top of viewport (works well with fixed sidebar)
      const marker = window.scrollY + window.innerHeight * 0.35;

      let current = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= marker) current = id;
      }

      setActiveSection(current);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const navLinks = [
    { name: 'About',            href: '#about',           id: 'about' },
    { name: 'Skills',           href: '#skills',          id: 'skills' },
    { name: 'Featured Projects', href: '#projects',       id: 'projects' },
    { name: 'Open Source',      href: '#opensource',      id: 'opensource' },
    { name: 'Certifications',   href: '#certifications',  id: 'certifications' },
    { name: 'Contact',          href: '#contact',         id: 'contact' },
  ];

  return (
    <>
      {/* ─── Desktop Sidebar ─────────────────────────── */}
      <aside className="sb">
        <div className="sb-top">
          <div className="sb-logo-wrap">
            <img
              src="/logo.png"
              alt="Logo"
              className="sb-logo"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          <span className="sb-label">PORTFOLIO</span>

          <div className="sb-name">
            <span className="sb-firstname">Arnold</span>
            <span className="sb-lastname">Kirui</span>
          </div>

          <nav className="sb-nav">
            {navLinks.map(link => (
              <a
                key={link.id}
                href={link.href}
                className={`sb-link ${activeSection === link.id ? 'sb-link--active' : ''}`}
              >
                {activeSection === link.id && <span className="sb-arrow">→</span>}
                <span className="sb-link-text">{link.name}</span>
              </a>
            ))}
          </nav>
        </div>

        <div className="sb-bottom">
          <div className="sb-divider" />
          <p className="sb-location">Nairobi, Kenya</p>
          <a href="mailto:arnokiru19@gmail.com" className="sb-email">arnokiru19@gmail.com</a>
          <div className="sb-footer-row">
            <span className="sb-copy">© {new Date().getFullYear()} Arnold Kirui</span>
            <button onClick={toggleTheme} className="sb-theme-btn" aria-label="Toggle theme">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Top Bar ───────────────────────────── */}
      <nav className="mb-nav">
        <div className="container mb-nav-inner">
          <div className="mb-logo-row">
            <img
              src="/arnold-profile.png"
              alt="Profile"
              className="mb-pic"
            />
            <span className="mono mb-name">ArnoKirui.dev</span>
          </div>
          <div className="mb-controls">
            <button onClick={toggleTheme} className="sb-theme-btn" aria-label="Toggle theme">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="mb-burger">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="mb-dropdown">
            {navLinks.map(link => (
              <a
                key={link.id}
                href={link.href}
                className={`mb-link ${activeSection === link.id ? 'mb-link--active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </div>
        )}
      </nav>
    </>
  );
};

/* ─── Sidebar CSS ────────────────────────────────────────── */
const sidebarCSS = `
  /* Sidebar: hidden on mobile */
  .sb {
    display: none;
  }

  /* Mobile top bar */
  .mb-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
  }

  .mb-nav-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
  }

  .mb-logo-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .mb-pic {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    object-position: center 20%;
    border: 2px solid var(--border-color);
  }

  .mb-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .mb-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .mb-burger {
    background: transparent;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .mb-dropdown {
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
  }

  .mb-link {
    display: block;
    padding: 0.875rem 1.5rem;
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    border-left: 3px solid transparent;
    transition: all 0.2s;
  }

  .mb-link--active {
    color: var(--accent-primary);
    border-left-color: var(--accent-primary);
    background: var(--accent-glow);
  }

  .sb-theme-btn {
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 0.375rem;
    padding: 0.4rem;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .sb-theme-btn:hover {
    border-color: var(--border-highlight);
    color: var(--text-primary);
  }

  /* ── DESKTOP: show sidebar, push content right ── */
  @media (min-width: 1024px) {
    /* Hide mobile bar */
    .mb-nav { display: none; }

    /* Show sidebar */
    .sb {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: fixed;
      top: 0;
      left: 0;
      width: 260px;
      height: 100vh;
      background-color: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      padding: 2.5rem 0 2rem 0;
      z-index: 100;
      overflow-y: auto;
    }

    .sb-top {
      display: flex;
      flex-direction: column;
      padding: 0 2rem;
      gap: 0;
    }

    .sb-logo-wrap {
      margin-bottom: 1.25rem;
    }

    .sb-logo {
      width: 48px;
      height: 48px;
      object-fit: contain;
      opacity: 0.9;
    }

    .sb-label {
      font-size: 0.65rem;
      letter-spacing: 0.2em;
      color: var(--text-muted);
      font-family: var(--font-mono);
      margin-bottom: 0.5rem;
      display: block;
    }

    .sb-name {
      display: flex;
      flex-direction: column;
      margin-bottom: 2.5rem;
    }

    .sb-firstname {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1.1;
      color: var(--text-primary);
    }

    .sb-lastname {
      font-size: 1.5rem;
      font-weight: 400;
      color: var(--text-secondary);
      line-height: 1.2;
    }

    .sb-nav {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .sb-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.875rem;
      font-family: var(--font-mono);
      letter-spacing: 0.05em;
      transition: color 0.2s;
      position: relative;
    }

    .sb-link:hover {
      color: var(--text-primary);
    }

    .sb-link--active {
      color: var(--text-primary) !important;
    }

    .sb-link--active .sb-link-text {
      text-decoration: underline;
      text-decoration-color: var(--accent-primary);
      text-underline-offset: 4px;
      text-decoration-thickness: 2px;
    }

    .sb-arrow {
      color: var(--accent-primary);
      font-size: 1rem;
      flex-shrink: 0;
    }

    .sb-bottom {
      padding: 0 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .sb-divider {
      height: 1px;
      background: var(--border-color);
      margin-bottom: 1rem;
    }

    .sb-location {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }

    .sb-email {
      font-size: 0.75rem;
      color: var(--accent-primary);
      text-decoration: none;
      word-break: break-all;
    }

    .sb-email:hover {
      text-decoration: underline;
    }

    .sb-footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.5rem;
    }

    .sb-copy {
      font-size: 0.7rem;
      color: var(--text-muted);
    }
  }
`;

const styleEl = document.createElement('style');
styleEl.innerHTML = sidebarCSS;
if (typeof document !== 'undefined') document.head.appendChild(styleEl);
