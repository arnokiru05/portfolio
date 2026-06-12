import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { Skills } from './components/Skills';
import { Certifications } from './components/Certifications';
import { Projects } from './components/Projects';
import { GithubRepos } from './components/GithubRepos';
import { Contact } from './components/Contact';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <img src="/logo.png" alt="Logo" style={styles.loadingLogo} />
          <p style={styles.loadingSubtitle}>PORTFOLIO</p>
          <h1 style={styles.loadingTitle}>Arnold Kirui</h1>
          <p style={styles.loadingEdition}>LOADING EDITION...</p>
          <div style={styles.loadingBar}>
            <div style={styles.loadingProgress}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Hero />
      <Stats />
      <div style={{ padding: '2rem 0' }}></div>
      <Skills />
      <Projects />
      <GithubRepos />
      <Certifications />
      <Contact />
    </Layout>
  );
}

const styles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
  },
  loadingContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    animation: 'fadeIn 1s ease-in-out',
  },
  loadingLogo: {
    width: '80px',
    height: '80px',
    marginBottom: '2rem',
    objectFit: 'contain' as const,
  },
  loadingSubtitle: {
    fontSize: '0.875rem',
    letterSpacing: '0.2em',
    color: 'var(--text-muted)',
    marginBottom: '1rem',
    textTransform: 'uppercase' as const,
  },
  loadingTitle: {
    fontSize: '3rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: 'var(--text-primary)',
  },
  loadingEdition: {
    fontSize: '0.875rem',
    letterSpacing: '0.15em',
    color: 'var(--text-secondary)',
    marginBottom: '2rem',
  },
  loadingBar: {
    width: '200px',
    height: '2px',
    backgroundColor: 'var(--border-color)',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  loadingProgress: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    height: '100%',
    width: '50%',
    backgroundColor: 'var(--accent-primary)',
    animation: 'loadProgress 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  }
};

const styleEl = document.createElement('style');
styleEl.innerHTML = `
  @keyframes loadProgress {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
if (typeof document !== 'undefined') document.head.appendChild(styleEl);

export default App;
