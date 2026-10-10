import { useState, type FormEvent } from 'react';
import './HeroSection.css';

interface HeroSectionProps {
  onBrowseCourses?: () => void;
  onGetRecommendations?: () => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

interface RoadmapStep {
  title: string;
  duration: string;
  focus: string;
}

export function HeroSection({
  onBrowseCourses,
  onGetRecommendations,
  onOpenAuth,
}: HeroSectionProps) {
  const [goalInput, setGoalInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState<{
    query: string;
    steps: RoadmapStep[];
  } | null>(null);

  const sampleChips = [
    'Full-stack Web Dev',
    'Machine Learning Fundamentals',
    'Senior Product Leadership',
    'Cloud DevOps & Kubernetes',
  ];

  const handleChipClick = (chip: string) => {
    setGoalInput(chip);
    synthesizeGoal(chip);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim()) return;
    synthesizeGoal(goalInput.trim());
  };

  const synthesizeGoal = (query: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      let steps: RoadmapStep[] = [];
      const lower = query.toLowerCase();

      if (lower.includes('machine learning') || lower.includes('ml') || lower.includes('ai')) {
        steps = [
          { title: 'Foundations & Mathematical Intuition', duration: 'Weeks 1-4', focus: 'Linear algebra, probabilistic modeling, and NumPy' },
          { title: 'Supervised Learning & Deep Architectures', duration: 'Weeks 5-10', focus: 'PyTorch, transformers, and neural network tuning' },
          { title: 'Production ML & LLM Deployment', duration: 'Weeks 11-16', focus: 'Vector DBs, RAG pipelines, and edge inference' },
        ];
      } else if (lower.includes('product') || lower.includes('ux') || lower.includes('leadership')) {
        steps = [
          { title: 'Strategic Discovery & User Mechanics', duration: 'Weeks 1-3', focus: 'User interview synthesis, opportunity trees' },
          { title: 'AI-First Product Definition', duration: 'Weeks 4-8', focus: 'PRD synthesis, metric architecture, and prompt engineering' },
          { title: 'Executive Go-To-Market Alignment', duration: 'Weeks 9-12', focus: 'Product economics, cross-functional orchestration' },
        ];
      } else {
        steps = [
          { title: 'Core Architectural Fundamentals', duration: 'Weeks 1-4', focus: 'Type safety, state structures, and API contract design' },
          { title: 'Scalable Microservices & Data Flow', duration: 'Weeks 5-8', focus: 'Distributed caches, message queues, and async workers' },
          { title: 'Production Hardening & CI/CD Pipelines', duration: 'Weeks 9-12', focus: 'Telemetry, automated load testing, and containerization' },
        ];
      }

      setGeneratedRoadmap({ query, steps });
      setIsGenerating(false);
    }, 450);
  };

  return (
    <div className="hero-section-wrapper" id="hero-synthesis">
      <div className="hero-ambient-glow" />

      <div className="hero-container">
        {/* Readiness Pill */}
        <div className="hero-pill-badge">
          <span className="material-symbols-outlined spark-icon">auto_awesome</span>
          <span className="hero-pill-text">Mentora Neural Tutor 3.2 Live</span>
          <span className="hero-pill-pulse" />
        </div>

        {/* Title */}
        <h1 className="hero-title">
          Learn the skills you need,{' '}
          <span className="hero-title-highlight">
            guided by AI
            <svg
              className="hero-curve-svg"
              preserveAspectRatio="none"
              viewBox="0 0 240 10"
              aria-hidden="true"
            >
              <path
                d="M0,5 Q60,1 120,5 T240,5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="4"
              />
            </svg>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Adaptive curricula synchronized to your career objectives. Experience intelligent,
          real-time mentorship that recalibrates syllabus pacing to your exact cognitive speed.
        </p>

        {/* Action Buttons */}
        <div className="hero-cta-group">
          <button
            type="button"
            className="btn-hero-primary"
            onClick={onBrowseCourses}
          >
            <span>Browse Courses</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              arrow_forward
            </span>
          </button>
          <button
            type="button"
            className="btn-hero-secondary"
            onClick={onGetRecommendations}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--secondary)' }}>
              psychology
            </span>
            <span>Get AI Recommendations</span>
          </button>
        </div>

        {/* AI Synthesis Box */}
        <div className="ai-synthesis-card">
          <div className="ai-synthesis-header">
            <div className="ai-synthesis-tag">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                auto_awesome
              </span>
              <span>Intelligent Goal Synthesis</span>
            </div>
            <span className="ai-synthesis-badge">Instant Roadmap</span>
          </div>

          <form className="ai-prompt-form" onSubmit={handleSubmit}>
            <div className="ai-terminal-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                terminal
              </span>
            </div>
            <input
              type="text"
              className="ai-prompt-input"
              placeholder="e.g. Guide me from UX designer to Product Manager in 6 months..."
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              aria-label="Describe your learning goal"
            />
            <button
              type="submit"
              className="ai-prompt-submit-btn"
              disabled={isGenerating}
              aria-label="Generate syllabus"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {isGenerating ? 'sync' : 'send'}
              </span>
            </button>
          </form>

          {/* Quick Chips */}
          <div className="prompt-chips-container">
            <span className="prompt-chips-label">Try:</span>
            {sampleChips.map((chip) => (
              <button
                key={chip}
                type="button"
                className="prompt-chip-btn"
                onClick={() => handleChipClick(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Dynamic Synthesis Output */}
          {generatedRoadmap ? (
            <div className="ai-result-callout active">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '20px', color: 'var(--tertiary-accent)', marginTop: '2px' }}
              >
                check_circle
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: 'var(--primary)' }}>
                  Synthesized Path for: &quot;{generatedRoadmap.query}&quot;
                </p>
                <div className="roadmap-preview-box">
                  <div className="roadmap-steps-list">
                    {generatedRoadmap.steps.map((st, idx) => (
                      <div key={idx} className="roadmap-step-item">
                        <span className="roadmap-step-num">{idx + 1}</span>
                        <div>
                          <strong>{st.title}</strong>{' '}
                          <span style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>({st.duration})</span>
                          <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                            {st.focus}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => onOpenAuth?.('register')}
                    className="btn-hero-primary"
                    style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                  >
                    Start This Track
                  </button>
                  <button
                    type="button"
                    onClick={() => setGeneratedRoadmap(null)}
                    className="btn-hero-secondary"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="ai-result-callout">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '18px', color: 'var(--secondary)' }}
              >
                lock_open
              </span>
              <span>
                Authenticated session: AI personalized synthesis active. Type any goal or select a chip to generate your custom path.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
