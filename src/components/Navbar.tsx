import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [isDark, setIsDark] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Initial theme check
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

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'GitHub', href: '#github' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.container}>
        <div style={styles.logo}>
          <img src="/me.png" alt="Profile" style={styles.navProfilePic} onError={(e) => { (e.target as HTMLImageElement).src = '/personal-photo.png'; }} />
          <span className="mono" style={styles.logoText}>ArnoKirui.dev</span>
        </div>
        
        {/* Desktop Menu */}
        <div style={styles.desktopMenu}>
          <ul style={styles.navItems}>
            {navLinks.map((link) => (
              <li key={link.name}>
                <a href={link.href} style={styles.link}>{link.name}</a>
              </li>
            ))}
          </ul>
          
          <button onClick={toggleTheme} style={styles.themeToggle} aria-label="Toggle dark/light mode">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div style={styles.mobileMenuBtn}>
          <button onClick={toggleTheme} style={{...styles.themeToggle, marginRight: '1rem'}} aria-label="Toggle dark/light mode">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={styles.iconBtn}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div style={styles.mobileMenu}>
          <ul style={styles.mobileNavItems}>
            {navLinks.map((link) => (
              <li key={link.name} style={styles.mobileNavItem}>
                <a href={link.href} style={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>{link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    backgroundColor: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color 0.3s ease'
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  logoText: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)'
  },
  navProfilePic: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    objectPosition: 'center 20%', // Adjust to focus on face, cutting off the top
    border: '2px solid var(--border-color)',
  },
  desktopMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  navItems: {
    display: 'flex',
    listStyle: 'none',
    gap: '2rem',
  },
  link: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  themeToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    padding: '0.5rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mobileMenuBtn: {
    display: 'none',
    alignItems: 'center'
  },
  mobileMenu: {
    position: 'absolute' as const,
    top: '64px',
    left: 0,
    right: 0,
    backgroundColor: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-color)',
    padding: '1rem 0'
  },
  mobileNavItems: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column' as const
  },
  mobileNavItem: {
    borderBottom: '1px solid var(--border-color)',
  },
  mobileLink: {
    display: 'block',
    padding: '1rem 1.5rem',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    fontSize: '0.875rem'
  }
};

// Add responsive styles via a simple trick since we're using inline styles mostly, 
// but it's better to use CSS classes for media queries.
// I'll add a quick global style block to handle the media query for the nav.
const styleEl = document.createElement('style');
styleEl.innerHTML = `
  @media (max-width: 768px) {
    div[style*="gap: 2rem"] { display: none !important; }
    div[style*="display: none"] { display: flex !important; }
  }
`;
if (typeof document !== 'undefined') document.head.appendChild(styleEl);
