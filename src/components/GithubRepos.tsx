import React, { useEffect, useState } from 'react';
import { BookOpen, Star, GitFork, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

interface Repo {
  id: number;
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
}

export const GithubRepos = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const GITHUB_USERNAME = 'arnokiru05';

  useEffect(() => {
    const fetchRepos = async () => {
      const cached = localStorage.getItem('githubRepos');
      const cacheTime = localStorage.getItem('githubReposTime');
      const oneHour = 60 * 60 * 1000;

      if (cached && cacheTime && Date.now() - Number(cacheTime) < oneHour) {
        setRepos(JSON.parse(cached));
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch from GitHub');

        const data = await response.json();
        setRepos(data);
        localStorage.setItem('githubRepos', JSON.stringify(data));
        localStorage.setItem('githubReposTime', Date.now().toString());
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Could not load repositories — please check back later.');
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === repos.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? repos.length - 1 : prev - 1));
  };

  return (
    <section id="opensource" className="section" style={{ overflow: 'hidden' }}>
      <div className="container">
        <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Open Source</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Recent activity and contributions on GitHub.</p>
        </div>

        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner} className="animate-spin"></div>
            <span>Fetching repository data...</span>
          </div>
        ) : error ? (
          <div style={styles.error}>{error}</div>
        ) : (
          <div style={styles.carouselContainer}>
            <button onClick={prevSlide} style={styles.navButton} className="nav-btn left">
              <ChevronLeft size={24} />
            </button>
            
            <div style={styles.slider}>
              {repos.map((repo, idx) => {
                // Calculate position relative to active index
                let offset = idx - activeIndex;
                
                // Handle wrapping for infinite carousel feel
                if (offset < -Math.floor(repos.length / 2)) offset += repos.length;
                if (offset > Math.floor(repos.length / 2)) offset -= repos.length;

                const isActive = offset === 0;
                
                // Calculate styles based on offset
                const translateX = offset * 110; // percentage
                const scale = isActive ? 1 : 0.8;
                const opacity = isActive ? 1 : Math.abs(offset) === 1 ? 0.6 : 0;
                const zIndex = isActive ? 10 : 5 - Math.abs(offset);
                
                return (
                  <div 
                    key={repo.id} 
                    className="card"
                    onClick={() => !isActive && setActiveIndex(idx)}
                    style={{
                      ...styles.card,
                      transform: `translateX(calc(${translateX}% - 50%)) scale(${scale})`,
                      opacity: opacity,
                      zIndex: zIndex,
                      pointerEvents: opacity === 0 ? 'none' : 'auto',
                      cursor: isActive ? 'default' : 'pointer',
                      left: '50%',
                    }}
                  >
                    <div style={styles.cardHeader}>
                      <BookOpen size={20} color="var(--accent-primary)" />
                      <h3 style={styles.repoName}>
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" style={styles.repoLink}>
                          {repo.name.replace(/-/g, ' ')}
                        </a>
                      </h3>
                      {isActive && (
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" style={styles.externalIcon}>
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                    
                    <p style={styles.description}>
                      {repo.description || 'No description provided.'}
                    </p>
                    
                    <div style={styles.meta}>
                      {repo.language && (
                        <span style={styles.language}>
                          <span style={{ ...styles.langDot, backgroundColor: getLangColor(repo.language) }}></span>
                          {repo.language}
                        </span>
                      )}
                      <span style={styles.stat}>
                        <Star size={14} /> {repo.stargazers_count}
                      </span>
                      <span style={styles.stat}>
                        <GitFork size={14} /> {repo.forks_count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={nextSlide} style={styles.navButton} className="nav-btn right">
              <ChevronRight size={24} />
            </button>
          </div>
        )}
        
        {!loading && !error && (
          <div style={styles.indicators}>
            {repos.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveIndex(idx)}
                style={{
                  ...styles.indicator,
                  backgroundColor: activeIndex === idx ? 'var(--accent-primary)' : 'var(--border-color)',
                  transform: activeIndex === idx ? 'scale(1.2)' : 'scale(1)'
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const getLangColor = (lang: string) => {
  const colors: Record<string, string> = {
    Python: '#3572A5',
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Jupyter: '#DA5B0B'
  };
  return colors[lang] || '#8b949e';
};

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    minHeight: '300px'
  },
  spinner: {
    width: '1.5rem',
    height: '1.5rem',
    border: '2px solid var(--border-color)',
    borderTopColor: 'var(--accent-primary)',
    borderRadius: '50%',
  },
  error: {
    color: 'var(--error)',
    padding: '1rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    textAlign: 'center' as const
  },
  carouselContainer: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '350px',
    maxWidth: '900px',
    margin: '0 auto',
    perspective: '1000px',
  },
  slider: {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '2rem',
    width: '100%',
    maxWidth: '450px',
    height: '280px',
    transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem'
  },
  repoName: {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: 0,
    flex: 1,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  repoLink: {
    color: 'var(--text-primary)',
    textDecoration: 'none'
  },
  externalIcon: {
    color: 'var(--text-muted)',
    transition: 'color 0.2s'
  },
  description: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
    flex: 1,
    lineHeight: 1.6
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)'
  },
  language: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  langDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem'
  },
  navButton: {
    position: 'absolute' as const,
    zIndex: 20,
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  indicators: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
    marginTop: '2rem'
  },
  indicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
    padding: 0
  }
};

// Add responsive styles for buttons
const styleEl = document.createElement('style');
styleEl.innerHTML += `
  .nav-btn:hover {
    background: var(--accent-primary) !important;
    color: white !important;
    border-color: var(--accent-primary) !important;
  }
  .nav-btn.left { left: 0; }
  .nav-btn.right { right: 0; }
  @media (max-width: 768px) {
    .nav-btn { display: none !important; }
  }
`;
if (typeof document !== 'undefined') document.head.appendChild(styleEl);
