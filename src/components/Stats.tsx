import React, { useEffect, useState, useRef } from 'react';
import { Database, Clock, TerminalSquare, Award } from 'lucide-react';

const AnimatedCounter = ({ target, duration = 2000, suffix = '' }: { target: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function (easeOutExpo)
      const easePercentage = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCount(Math.floor(target * easePercentage));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(updateCount);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, isVisible]);

  return <span ref={countRef}>{count}{suffix}</span>;
};

export const Stats = () => {
  const stats = [
    { label: 'Projects Deployed', value: 10, suffix: '+', icon: <Database size={20} /> },
    { label: 'Years Experience', value: 1, suffix: '+', icon: <Clock size={20} /> },
    { label: 'Core Tools', value: 7, icon: <TerminalSquare size={20} /> },
    { label: 'Certifications', value: 2, icon: <Award size={20} /> },
  ];

  return (
    <section style={styles.section}>
      <div className="container">
        <div style={styles.grid}>
          {stats.map((stat, idx) => (
            <div key={idx} style={styles.statCard} className="card">
              <div style={styles.iconWrapper}>
                {stat.icon}
              </div>
              <div style={styles.content}>
                <div style={styles.value} className="mono text-accent">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div style={styles.label}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '2rem 0',
    marginTop: '-4rem',
    position: 'relative' as const,
    zIndex: 10
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '3rem',
    height: '3rem',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)'
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  value: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'var(--accent-primary)',
    lineHeight: 1
  },
  label: {
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    marginTop: '0.25rem'
  }
};
