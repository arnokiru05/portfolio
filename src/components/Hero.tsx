import React, { useEffect, useState } from 'react';
import { ArrowRight, Download, Terminal } from 'lucide-react';

export const Hero = () => {
  const [text, setText] = useState('');
  const fullText = "Turning raw data into clear decisions_";

  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(intervalId);
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <header id="about" style={styles.header}>
      <div className="container">
        <div style={styles.heroGrid} className="animate-fade-in">
          <div style={styles.content}>
            <h1 style={styles.title}>
              <span style={styles.iconWrapper}><Terminal size={32} color="var(--accent-primary)" /></span>
              <br />
              {text}
            </h1>
            
            <p style={styles.subtitle}>
              Data enthusiast specializing in Python, SQL & Power BI. 
              I transform complex datasets into actionable insights, helping organizations solve real-world problems and drive measurable impact.
            </p>
            
            <div style={styles.actions}>
              <a href="#projects" style={styles.primaryBtn}>
                View Projects
                <ArrowRight size={16} />
              </a>
              <a 
                href="https://docs.google.com/document/d/16qwndg_Y3NR85MIGogt-y2CpiDUjIE80BeK725acJSs/edit?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.secondaryBtn}
              >
                <Download size={16} />
                Export CV
              </a>
            </div>
          </div>
          
          <div style={styles.imageWrapper}>
            <div style={styles.imageGlow}></div>
            <img src="/arnold-profile.png" alt="Arnold Kirui" style={styles.heroImage} />
          </div>
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    padding: '5rem 0 8rem 0',
    minHeight: '85vh',
    display: 'flex',
    alignItems: 'center',
    background: 'radial-gradient(circle at 50% 0%, var(--bg-tertiary) 0%, var(--bg-primary) 70%)'
  },
  heroGrid: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '4rem',
    flexWrap: 'wrap-reverse' as const,
  },
  content: {
    flex: 1,
    minWidth: '300px',
    maxWidth: '650px',
  },
  imageWrapper: {
    position: 'relative' as const,
    flex: '0 1 400px',
    display: 'flex',
    justifyContent: 'center',
  },
  imageGlow: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'var(--accent-glow)',
    filter: 'blur(40px)',
    zIndex: 0,
  },
  heroImage: {
    position: 'relative' as const,
    zIndex: 1,
    width: '100%',
    maxWidth: '350px',
    aspectRatio: '1/1',
    objectFit: 'cover' as const,
    objectPosition: 'center 30%',
    borderRadius: '50%',
    border: '4px solid var(--border-color)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    transition: 'transform 0.3s ease',
  },
  badge: {
    marginBottom: '2rem',
    gap: '0.5rem',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--success)',
    boxShadow: '0 0 8px var(--success)'
  },
  title: {
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    letterSpacing: '-0.02em',
    marginBottom: '1.5rem',
    fontFamily: 'var(--font-mono)',
    minHeight: '120px' // Prevent layout shift during typing
  },
  iconWrapper: {
    display: 'inline-flex',
    padding: '1rem',
    borderRadius: '1rem',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    marginBottom: '1rem'
  },
  subtitle: {
    fontSize: '1.125rem',
    color: 'var(--text-secondary)',
    maxWidth: '600px',
    marginBottom: '3rem',
    lineHeight: 1.8
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--text-primary)',
    color: 'var(--bg-primary)',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: 600,
    fontSize: '0.875rem',
    transition: 'all 0.2s',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: 500,
    fontSize: '0.875rem',
    transition: 'all 0.2s',
  }
};
