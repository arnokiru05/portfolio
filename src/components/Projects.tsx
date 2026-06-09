import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Clock, Lock } from 'lucide-react';
import { FaGithub, FaLock } from 'react-icons/fa';

// ─── Project type definition ─────────────────────────────────────────────────
type ProjectStatus = 'live' | 'in-progress' | 'github-only';

interface Project {
  title: string;
  description: string;
  image: string;
  tags: string[];
  status: ProjectStatus;
  liveUrl?: string;       // Fill in when status === 'live'
  githubUrl?: string;     // Fill in when source is public
  privateRepo?: boolean;  // Set true when live but source is private
}

// ─── Projects data ────────────────────────────────────────────────────────────
// status guide:
//   'live'        → project has a deployed URL you can visit  → shows "Live Demo" button
//   'in-progress' → currently being built / not deployed yet  → shows "In Progress" badge
//   'github-only' → finished but no web front-end (ML, BI)   → shows only "Source Code"
const projectsData: Project[] = [
  {
    title: 'Weather App',
    description:
      'A live weather application that fetches real-time data from OpenWeatherMap API and displays current conditions by city, featuring a 5-day forecast, dynamic backgrounds and live local time.',
    image: 'weather.png',
    tags: ['JavaScript', 'Fetch API', 'DOM Manipulation'],
    status: 'live',
    liveUrl: 'https://arnokiru05.github.io/weather-app',
  },
  {
    title: 'Aesthetic Engine',
    description:
      '[🚧 WORK IN PROGRESS] An intelligence platform that makes visual quality measurable. Upload a photo to get a neural aesthetic quality score (0–10), an eye-tracking saliency heatmap, strategic CLIP-powered SEO tags, and an artistic style identity profiled across your entire body of work — giving creators and marketers the data before they spend the budget.',
    image: 'aesthetic-engine.png',
    tags: ['Python', 'PyTorch', 'CLIP', 'FastAPI', 'Next.js'],
    status: 'in-progress',
    liveUrl: 'https://hybrid-aesthetic-engine.vercel.app/',
    privateRepo: true,
  },
  {
    title: 'Hotel Security Analysis',
    description:
      'Interactive Power BI dashboard analysing security incident KPIs across departments in a hotel group for 2024-2025. Enabled management to identify patterns and allocate resources effectively.',
    image: 'hotel-security.png',
    tags: ['Power BI', 'DAX', 'Excel', 'Data Modeling'],
    status: 'github-only',
    githubUrl: 'https://github.com/arnokiru05/Hotel_incidents_analysis',
  },
  {
    title: 'RAG Chatbot',
    description:
      'Local retrieval-augmented generation chatbot using Mistral\'s API and ChromaDB for vector storage. Uses transformer-based embeddings and LangChain to return contextually accurate answers.',
    image: 'rag-chatbot.png',
    tags: ['Python', 'ChromaDB', 'LangChain', 'Gradio'],
    status: 'github-only',
    githubUrl: 'https://github.com/arnokiru05/RAG_CHATBOT',
  },
  {
    title: 'Default Risk ML Model',
    description:
      'Linear Regression model to predict loan default risk. Pipeline covers EDA, outlier detection, feature standardisation and model evaluation using AUC with hyperparameter tuning via grid search.',
    image: 'default-risk.png',
    tags: ['Python', 'SciKit-Learn', 'Statistics', 'EDA'],
    status: 'github-only',
    githubUrl: 'https://github.com/arnokiru05/LINEAR_REG',
  },
];

// ─── Status badge helper ───────────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
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
      className="section"
      ref={sectionRef}
      style={{ backgroundColor: 'var(--bg-tertiary)' }}
    >
      <div className="container">
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Featured Analysis</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Showcasing data-driven solutions and applications.
          </p>
        </div>

        <div style={styles.grid}>
          {projectsData.map((project, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                ...styles.card,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.5s ease ${idx * 0.1}s, transform 0.5s ease ${idx * 0.1}s`,
              }}
            >
              {/* Project Image */}
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
                {/* Status badge overlaid on image */}
                <div style={styles.badgeOverlay}>
                  <StatusBadge status={project.status} />
                </div>
              </div>

              {/* Card Body */}
              <div style={styles.content}>
                <h3 style={styles.title}>{project.title}</h3>
                <p style={styles.description}>{project.description}</p>

                <div style={styles.tags}>
                  {project.tags.map((tag, tIdx) => (
                    <span key={tIdx} style={styles.tag}>{tag}</span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={styles.links}>
                  {project.status === 'live' && project.liveUrl && (
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
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  card: {
    padding: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  imageContainer: {
    height: '200px',
    overflow: 'hidden',
    borderBottom: '1px solid var(--border-color)',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'top',
    transition: 'transform 0.5s ease',
  },
  badgeOverlay: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
  },
  content: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
  },
  description: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    lineHeight: 1.7,
    marginBottom: '1.5rem',
    flex: 1,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1.75rem',
  },
  tag: {
    fontSize: '0.7rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent-primary)',
    backgroundColor: 'var(--accent-glow)',
    padding: '0.25rem 0.6rem',
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
