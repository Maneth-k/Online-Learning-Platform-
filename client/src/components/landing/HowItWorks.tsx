import './HowItWorks.css';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: 'person_add',
      title: 'Sign up',
      description:
        'Create your scholarly profile and share your background, target roles, current skill levels, and available weekly time commitment.',
      badgeIcon: 'schedule',
      badgeText: 'Takes under 90 seconds',
    },
    {
      number: '02',
      icon: 'tune',
      title: 'Find courses',
      description:
        "Let Mentora's AI match your aspirations to bespoke learning paths, dynamically restructuring syllabus weight where your knowledge gaps exist.",
      badgeIcon: 'hub',
      badgeText: 'Dynamic knowledge graph',
    },
    {
      number: '03',
      icon: 'school',
      title: 'Learn',
      description:
        'Master real-world skills through interactive socratic dialogues, project evaluations, and 24/7 autonomous mentorship whenever you get stuck.',
      badgeIcon: 'forum',
      badgeText: 'Real-time mentor debugging',
    },
  ];

  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="how-it-works-container">
        <div className="how-it-works-header">
          <div className="how-it-works-pill">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              route
            </span>
            <span>The Mentora Cycle</span>
          </div>
          <h2 className="how-it-works-title">How It Works</h2>
          <p className="how-it-works-subtitle">
            A seamless 3-stage progression from aspirational intent to demonstrable mastery,
            calibrated continuously by neural tutors.
          </p>
        </div>

        <div className="how-it-works-grid">
          {steps.map((step) => (
            <div key={step.number} className="step-card">
              <div className="step-top-row">
                <div className="step-icon-box">
                  <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
                    {step.icon}
                  </span>
                </div>
                <span className="step-number">{step.number}</span>
              </div>

              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>

              <div className="step-footer-badge">
                <span className="material-symbols-outlined badge-icon">
                  {step.badgeIcon}
                </span>
                <span>{step.badgeText}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
