import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Clock, Lock } from 'lucide-react';
import { FaGithub, FaLock } from 'react-icons/fa';

type ProjectStatus = 'live' | 'in-progress' | 'github-only';

interface Project {
  title: string;
  description: string;
  image: string;
  tags: string[];
  status: ProjectStatus;
  liveUrl?: string;
  githubUrl?: string;
  privateRepo?: boolean;
}

const projectsData: Project[] = [
  {
    title: 'Weather App',
    description: 'Live weather · 5-day forecast · city search',
    image: 'weather.png',
    tags: ['JavaScript', 'Fetch API', 'DOM'],
    status: 'live',
    liveUrl: 'https://arnokiru05.github.io/weather-app',
  },
  {
    title: 'Aesthetic Engine',
    description: 'Aesthetic scoring · saliency heatmaps · CLIP tags · neural audit',
    image: 'aesthetic-engine.png',
    tags: ['Python', 'PyTorch', 'CLIP', 'FastAPI', 'Next.js'],
    status: 'in-progress',
    liveUrl: 'https://hybrid-aesthetic-engine.vercel.app/',
    privateRepo: true,
  },
  {
    title: 'Hotel Security Analysis',
    description: 'Power BI · incident KPIs · department trends',
    image: 'hotel-security.png',
    tags: ['Power BI', 'DAX', 'Excel', 'Data Modeling'],
    status: 'github-only',
    githubUrl: 'https://github.com/arnokiru05/Hotel_incidents_analysis',
  },
  {
    title: 'RAG Chatbot',
    description: 'Local RAG · ChromaDB · LangChain · Mistral',
    image: 'rag-chatbot.png',
    tags: ['Python', 'ChromaDB', 'LangChain', 'Gradio'],
    status: 'github-only',
    githubUrl: 'https://github.com/arnokiru05/RAG_CHATBOT',
  },
  {
    title: 'Default Risk ML Model',
    description: 'Loan default prediction · EDA · linear regression · AUC',
    image: 'default-risk.png',
    tags: ['Python', 'SciKit-Learn', 'Statistics', 'EDA'],
    status: 'github-only',
    githubUrl: 'https://github.com/arnokiru05/LINEAR_REG',
  },
];

const StatusBadge = ({ status }: { status: ProjectStatus }) => {
  if (status === 'live') {
    return (
      <span style={statusStyles.live}>
        <span style={statusStyles.liveDot} />
        Live
      </span>
    );
  }
  if (status === 'in-progress') {
    return (
      <span style={statusStyles.inProgress}>
        <Clock size={11} /> In Progress
      </span>
    );
  }
  return (
    <span style={statusStyles.githubOnly}>
      <Lock size={11} /> No Web App
    </span>
  );
};

export const Projects = () => {
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
      { threshold: 0.05 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="projects"
      className="section projects-section"
      ref={sectionRef}
      style={{ backgroundColor: 'var(--bg-tertiary)' }}
    >
      <div className="container">
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Featured Projects</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Selected builds — scroll to explore the stack.
          </p>
        </div>

        <div className="projects-stack">
          {projectsData.map((project, idx) => (
            <article
              key={project.title}
              className={`projects-stack-card card ${isVisible ? 'projects-stack-card--visible' : ''}`}
              style={{ '--stack-index': idx } as React.CSSProperties}
            >
              <div className="projects-stack-inner">
                <div style={styles.imageContainer}>
                  <img
                    src={`/${project.image}`}
                    alt={project.title}
                    style={styles.image}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/600x400/3d2b1f/d97736?text=Project+Preview';
                    }}
                  />
                  <div style={styles.badgeOverlay}>
                    <StatusBadge status={project.status} />
                  </div>
                </div>

                <div style={styles.content}>
                  <h3 style={styles.title}>{project.title}</h3>
                  <p style={styles.description}>{project.description}</p>

                  <div style={styles.tags}>
                    {project.tags.map((tag) => (
                      <span key={tag} style={styles.tag}>{tag}</span>
                    ))}
                  </div>

                  <div style={styles.links}>
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.primaryLink}
                      >
                        <ExternalLink size={15} /> Live Demo
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.secondaryLink}
                      >
                        <FaGithub size={15} /> Source Code
                      </a>
                    )}
                    {project.privateRepo && !project.githubUrl && (
                      <span style={styles.privateTag}>
                        <FaLock size={12} /> Private Repo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const styles: Record<string, React.CSSProperties> = {
  imageContainer: {
    flex: '0 0 220px',
    height: '160px',
    overflow: 'hidden',
    borderRadius: '0.5rem',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'top',
  },
  badgeOverlay: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  description: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.02em',
    marginBottom: '1rem',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    marginBottom: '1rem',
  },
  tag: {
    fontSize: '0.65rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent-primary)',
    backgroundColor: 'var(--accent-glow)',
    padding: '0.2rem 0.5rem',
    borderRadius: '0.25rem',
  },
  links: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginTop: 'auto',
  },
  primaryLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#ffffff',
    backgroundColor: 'var(--accent-primary)',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
  },
  secondaryLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    textDecoration: 'none',
    transition: 'border-color 0.2s, color 0.2s',
  },
  privateTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    border: '1px dashed var(--border-color)',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
  },
};

const statusStyles: Record<string, React.CSSProperties> = {
  live: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.7rem',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    color: '#fff',
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    padding: '0.25rem 0.6rem',
    borderRadius: '9999px',
    backdropFilter: 'blur(4px)',
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    boxShadow: '0 0 6px #fff',
  },
  inProgress: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.7rem',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    color: '#1c1a00',
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    padding: '0.25rem 0.6rem',
    borderRadius: '9999px',
    backdropFilter: 'blur(4px)',
  },
  githubOnly: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.7rem',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: '0.25rem 0.6rem',
    borderRadius: '9999px',
    backdropFilter: 'blur(4px)',
  },
};
