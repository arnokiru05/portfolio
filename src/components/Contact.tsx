import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';

export const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('loading');

    // Using the same emailjs configuration from the old script
    emailjs.init('-zR8OlSuCoViqM0BB');

    emailjs.send(
      'portfolio_service',
      'portfolio_template',
      {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message
      }
    )
    .then(() => {
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    })
    .catch((err) => {
      console.error('EmailJS error:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="contact" className="section" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
      <div className="container">
        <div style={styles.wrapper}>
          <div style={styles.info}>
            <div style={styles.badge} className="badge">
              <span style={styles.statusDot}></span>
              Accepting new projects
            </div>
            
            <h2 style={styles.title}>Initialize Connection</h2>
            <p style={styles.description}>
              Currently open for full-time roles or freelance data analysis projects. 
              Drop a message to discuss how we can extract value from your data.
            </p>
            
            <div style={styles.contactMethods}>
              <a href="mailto:arnokiru19@gmail.com" style={styles.methodCard} className="card">
                <Mail size={24} color="var(--accent-primary)" />
                <div>
                  <div style={styles.methodLabel} className="mono">Email</div>
                  <div style={styles.methodValue}>arnokiru19@gmail.com</div>
                </div>
              </a>
            </div>
          </div>

          <div style={styles.formWrapper} className="card">
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.inputGroup}>
                  <label htmlFor="name" style={styles.label} className="mono">{'<Name />'}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    placeholder="Enter your name"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label htmlFor="email" style={styles.label} className="mono">{'<Email />'}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div style={styles.inputGroup}>
                <label htmlFor="message" style={styles.label} className="mono">{'<Message />'}</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  style={{ ...styles.input, resize: 'vertical' }}
                  placeholder="Describe your project or role..."
                />
              </div>

              <button 
                type="submit" 
                style={{
                  ...styles.submitBtn,
                  opacity: status === 'loading' ? 0.7 : 1,
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer'
                }}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <span style={styles.btnContent}><div className="animate-spin" style={styles.spinnerSmall}></div> Executing...</span>
                ) : (
                  <span style={styles.btnContent}>Transmit Message <Send size={16} /></span>
                )}
              </button>

              {status === 'success' && (
                <div style={{...styles.statusMsg, color: 'var(--success)', backgroundColor: 'rgba(16, 185, 129, 0.1)'}}>
                  <CheckCircle2 size={18} /> Message successfully transmitted.
                </div>
              )}
              
              {status === 'error' && (
                <div style={{...styles.statusMsg, color: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.1)'}}>
                  <AlertCircle size={18} /> Transmission failed. Please email directly.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const styles = {
  wrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '4rem',
    alignItems: 'start'
  },
  info: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  badge: {
    marginBottom: '1.5rem',
    gap: '0.5rem',
    alignSelf: 'flex-start'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--success)',
    boxShadow: '0 0 8px var(--success)'
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },
  description: {
    color: 'var(--text-secondary)',
    fontSize: '1.125rem',
    marginBottom: '2rem',
    lineHeight: 1.6
  },
  contactMethods: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  methodCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '1.25rem',
    textDecoration: 'none',
  },
  methodLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    marginBottom: '0.25rem'
  },
  methodValue: {
    fontSize: '1rem',
    fontWeight: 500,
    color: 'var(--text-primary)'
  },
  formWrapper: {
    padding: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  input: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    padding: '0.875rem 1rem',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.875rem',
    width: '100%',
    transition: 'border-color 0.2s',
    outline: 'none'
  },
  submitBtn: {
    backgroundColor: 'var(--accent-primary)',
    color: '#ffffff',
    border: 'none',
    padding: '1rem 1.5rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    marginTop: '0.5rem',
    transition: 'background-color 0.2s',
  },
  btnContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  spinnerSmall: {
    width: '1rem',
    height: '1rem',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
  },
  statusMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginTop: '0.5rem'
  }
};
