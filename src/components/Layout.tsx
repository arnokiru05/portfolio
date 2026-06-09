import React from 'react';
import { Navbar } from './Navbar';
import { Mail } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={styles.wrapper}>
      <Navbar />
      <main style={styles.main} className="sb-offset">
        {children}
      </main>
      <footer style={styles.footer} className="sb-offset">
        <div className="container" style={styles.footerContent}>
          <div style={styles.brand}>
            <span className="mono" style={styles.logoText}>ArnoKirui.dev</span>
            <p style={styles.copyright}>© {new Date().getFullYear()} Arnold Kiptoo Kirui. All rights reserved.</p>
          </div>
          
          <div style={styles.social}>
            <a href="https://github.com/arnokiru05" target="_blank" rel="noopener noreferrer" style={styles.iconLink} aria-label="GitHub">
              <FaGithub size={20} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" style={styles.iconLink} aria-label="LinkedIn">
              <FaLinkedin size={20} />
            </a>
            <a href="mailto:arnokiru19@gmail.com" style={styles.iconLink} aria-label="Email">
              <Mail size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
  },
  main: {
    flex: 1,
  },
  footer: {
    backgroundColor: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-color)',
    padding: '3rem 0',
    marginTop: '4rem',
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '2rem',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  logoText: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)'
  },
  copyright: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)'
  },
  social: {
    display: 'flex',
    gap: '1rem',
  },
  iconLink: {
    color: 'var(--text-secondary)',
    transition: 'color 0.2s',
  }
};
