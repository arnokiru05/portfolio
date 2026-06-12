import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  ZoomIn,
} from 'lucide-react';

interface Certification {
  title: string;
  issuer: string;
  date: string;
  description: string;
  skills: string[];
  image: string;
  imageAlt: string;
  verifyUrl?: string;
}

const certificationsData: Certification[] = [
  {
    title: 'Data Analytics, Data Science & AI Bootcamp',
    issuer: 'Lux Tech Academy',
    date: 'Oct 2025',
    description:
      'Completed a 16-week intensive bootcamp covering analytics, machine learning, AI deployment, and a real-world capstone project.',
    skills: [
      'Python',
      'SQL',
      'Power BI',
      'Scikit-learn',
      'TensorFlow',
      'NLP & LLMs',
      'FastAPI',
      'Docker',
      'AWS',
    ],
    image: '/lux_cert.png',
    imageAlt: 'Lux Tech Academy Data Analytics, Data Science & AI certificate for Arnold Kirui',
  },
  {
    title: 'Data Fundamentals',
    issuer: 'IBM SkillsBuild',
    date: 'Jun 2026',
    description:
      'Validated core data analytics concepts, data cleaning and visualization workflows using IBM Watson Studio.',
    skills: [
      'Data Analytics',
      'Watson Studio',
      'Data Cleaning',
      'Data Visualization',
      'Python',
      'SQL',
    ],
    image: '/IBM_cert.png',
    imageAlt: 'IBM SkillsBuild Data Fundamentals certificate for Arnold Kirui',
    verifyUrl: 'https://www.credly.com/badges/7ea77ff2-8cc8-4bd5-9086-19a35683f4e0',
  },
];

const CertCard = ({
  cert,
  onViewCertificate,
}: {
  cert: Certification;
  onViewCertificate: () => void;
}) => (
  <div className="cert-card-body cert-carousel-card-inner">
    <div style={styles.meta}>
      {cert.verifyUrl ? (
        <a
          href={cert.verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.titleLink}
        >
          {cert.title}
          <ExternalLink size={16} />
        </a>
      ) : (
        <h3 style={styles.title}>{cert.title}</h3>
      )}

      <p style={styles.issuer} className="mono">
        {cert.issuer}
        <span style={styles.dot}>|</span>
        <Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
        {' '}{cert.date}
      </p>

      <p style={styles.description}>{cert.description}</p>

      <div style={styles.skills}>
        <span style={styles.skillsLabel} className="mono">Skills earned</span>
        <div style={styles.skillTags}>
          {cert.skills.map((skill) => (
            <span key={skill} style={styles.tag}>{skill}</span>
          ))}
        </div>
      </div>
    </div>

    <button
      type="button"
      style={styles.thumbnailBtn}
      onClick={onViewCertificate}
      aria-label={`View ${cert.title} certificate`}
    >
      <img src={cert.image} alt={cert.imageAlt} style={styles.thumbnail} />
      <span className="cert-thumb-overlay" style={styles.thumbnailOverlay}>
        <ZoomIn size={22} />
        <span className="mono">View certificate</span>
      </span>
    </button>
  </div>
);

export const Certifications = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lightbox, setLightbox] = useState<Certification | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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

  useEffect(() => {
    if (!lightbox) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightbox]);

  const nextSlide = () => {
    setActiveIndex((prev) =>
      prev === certificationsData.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setActiveIndex((prev) =>
      prev === 0 ? certificationsData.length - 1 : prev - 1
    );
  };

  return (
    <>
      <section
        id="certifications"
        className="section certifications-section"
        ref={sectionRef}
        style={{ backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden' }}
      >
        <div className="container">
          <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <div style={{ ...styles.sectionBadge, alignSelf: 'center' }} className="badge">
              <Award size={14} />
              Verified credentials
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Certifications</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Formal training that backs the skills and projects on this portfolio.
            </p>
          </div>

          <div
            className="cert-carousel-wrap"
            style={{
              ...styles.carouselContainer,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
          >
            <button
              type="button"
              onClick={prevSlide}
              style={styles.navButton}
              className="cert-nav-btn left"
              aria-label="Previous certification"
            >
              <ChevronLeft size={24} />
            </button>

            <div style={styles.slider}>
              {certificationsData.map((cert, idx) => {
                let offset = idx - activeIndex;
                const len = certificationsData.length;

                if (offset < -Math.floor(len / 2)) offset += len;
                if (offset > Math.floor(len / 2)) offset -= len;

                const isActive = offset === 0;
                const translateX = offset * 108;
                const scale = isActive ? 1 : 0.88;
                const opacity = isActive ? 1 : Math.abs(offset) === 1 ? 0.55 : 0;
                const zIndex = isActive ? 10 : 5 - Math.abs(offset);

                return (
                  <article
                    key={cert.title}
                    className="card cert-card cert-carousel-card"
                    onClick={() => !isActive && setActiveIndex(idx)}
                    style={{
                      ...styles.carouselCard,
                      transform: `translateX(calc(${translateX}% - 50%)) scale(${scale})`,
                      opacity,
                      zIndex,
                      pointerEvents: opacity === 0 ? 'none' : 'auto',
                      cursor: isActive ? 'default' : 'pointer',
                      left: '50%',
                    }}
                  >
                    <CertCard cert={cert} onViewCertificate={() => setLightbox(cert)} />
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              onClick={nextSlide}
              style={styles.navButton}
              className="cert-nav-btn right"
              aria-label="Next certification"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div style={styles.indicators}>
            {certificationsData.map((cert, idx) => (
              <button
                key={cert.title}
                type="button"
                onClick={() => setActiveIndex(idx)}
                style={{
                  ...styles.indicator,
                  backgroundColor:
                    activeIndex === idx ? 'var(--accent-primary)' : 'var(--border-color)',
                  transform: activeIndex === idx ? 'scale(1.2)' : 'scale(1)',
                }}
                aria-label={`Show ${cert.title} certification`}
              />
            ))}
          </div>
        </div>
      </section>

      {lightbox && (
        <div
          style={styles.lightboxBackdrop}
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${lightbox.title} certificate preview`}
        >
          <div style={styles.lightboxPanel} onClick={(e) => e.stopPropagation()}>
            <div style={styles.lightboxHeader}>
              <div>
                <p style={styles.lightboxTitle}>{lightbox.title}</p>
                <p style={styles.lightboxMeta} className="mono">
                  {lightbox.issuer} · {lightbox.date}
                </p>
              </div>
              <button
                type="button"
                style={styles.closeBtn}
                onClick={() => setLightbox(null)}
                aria-label="Close certificate preview"
              >
                <X size={22} />
              </button>
            </div>
            <img
              src={lightbox.image}
              alt={lightbox.imageAlt}
              style={styles.lightboxImage}
            />
            {lightbox.verifyUrl && (
              <a
                href={lightbox.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.verifyLink}
              >
                Verify on Credly <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const styles: Record<string, CSSProperties> = {
  sectionBadge: {
    display: 'inline-flex',
    marginBottom: '1rem',
    gap: '0.5rem',
  },
  carouselContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '420px',
    maxWidth: '920px',
    margin: '0 auto',
    perspective: '1000px',
  },
  slider: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselCard: {
    position: 'absolute',
    padding: '1.25rem',
    width: '100%',
    maxWidth: '640px',
    transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.22)',
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    minWidth: 0,
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: 600,
    lineHeight: 1.3,
    margin: 0,
  },
  titleLink: {
    display: 'inline-flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    fontSize: '1.15rem',
    fontWeight: 600,
    lineHeight: 1.3,
    color: 'var(--text-primary)',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  issuer: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  dot: {
    color: 'var(--border-highlight)',
  },
  description: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  skills: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  skillsLabel: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--accent-primary)',
  },
  skillTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
  },
  tag: {
    fontSize: '0.65rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    padding: '0.2rem 0.5rem',
    borderRadius: '0.25rem',
  },
  thumbnailBtn: {
    position: 'relative',
    padding: 0,
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    background: 'var(--bg-primary)',
    cursor: 'pointer',
    width: '100%',
    aspectRatio: '4/3',
    transition: 'border-color 0.2s, transform 0.2s',
    flexShrink: 0,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
  },
  thumbnailOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    color: '#fff',
    fontSize: '0.75rem',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  navButton: {
    position: 'absolute',
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
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  indicators: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
    marginTop: '2rem',
  },
  indicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
    padding: 0,
  },
  lightboxBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    backdropFilter: 'blur(4px)',
  },
  lightboxPanel: {
    width: 'min(920px, 100%)',
    maxHeight: '92vh',
    overflow: 'auto',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.75rem',
    padding: '1.25rem',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
  },
  lightboxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1rem',
  },
  lightboxTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
  },
  lightboxMeta: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  closeBtn: {
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '0.375rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '0.35rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  lightboxImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
    display: 'block',
  },
  verifyLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginTop: '1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
};
