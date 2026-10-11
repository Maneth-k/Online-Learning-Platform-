import './MetricsStrip.css';

export function MetricsStrip() {
  const metrics = [
    { value: '98.4%', label: 'Curriculum Completion' },
    { value: '2.4×', label: 'Faster Concept Mastery' },
    { value: '45,000+', label: 'Active Scholars' },
    { value: '24 / 7', label: 'Tutor Availability' },
  ];

  return (
    <section className="metrics-strip" aria-label="Platform Highlights">
      <div className="metrics-container">
        {metrics.map((item, index) => (
          <div key={index} className="metric-item">
            <span className="metric-value">{item.value}</span>
            <span className="metric-label">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
