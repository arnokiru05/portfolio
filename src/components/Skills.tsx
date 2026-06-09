import React, { useEffect, useRef, useState } from 'react';

const skillsData = [
  { category: 'Core Languages', items: ['Python', 'SQL', 'JavaScript', 'TypeScript'] },
  { category: 'Data Analysis & BI', items: ['Power BI', 'Excel', 'Pandas', 'NumPy'] },
  { category: 'Data Engineering', items: ['Data Cleaning', 'ETL Pipelines', 'Data Validation', 'Web Scraping'] },
  { category: 'Machine Learning', items: ['SciKit-Learn', 'Linear Regression', 'LLMs (RAG)', 'Langchain'] },
  { category: 'Visualization & Design', items: ['Dashboard Design', 'Data Storytelling', 'Matplotlib', 'Seaborn'] },
];

export const Skills = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="skills" className="section" ref={sectionRef}>
      <div className="container">
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Technical Arsenal</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Tools and technologies I use to turn data into insights.</p>
        </div>

        <div style={styles.grid}>
          {skillsData.map((group, idx) => (
            <div 
              key={idx} 
              className={`card ${isVisible ? 'animate-fade-in' : ''}`}
              style={{ ...styles.categoryCard, animationDelay: `${idx * 0.1}s`, opacity: isVisible ? 1 : 0 }}
            >
              <h3 style={styles.categoryTitle} className="mono text-accent">{group.category}</h3>
              <div style={styles.skillTags}>
                {group.items.map((skill, sIdx) => (
                  <span key={sIdx} style={styles.tag}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  categoryCard: {
    padding: '1.5rem',
  },
  categoryTitle: {
    fontSize: '0.875rem',
    color: 'var(--accent-primary)',
    marginBottom: '1rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  skillTags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  tag: {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.2s',
    cursor: 'default',
  }
};

// Add hover effect for tags via global style since inline hover is tricky without Radium/styled-components
const styleEl = document.createElement('style');
styleEl.innerHTML = `
  .card span[style*="border-radius: 0.375rem"]:hover {
    border-color: var(--accent-primary) !important;
    color: var(--accent-primary) !important;
  }
`;
if (typeof document !== 'undefined') document.head.appendChild(styleEl);
