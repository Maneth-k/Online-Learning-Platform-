import { useState } from 'react';
import './AiDemoSection.css';

interface AiDemoSectionProps {
  onStartFree?: () => void;
  onExplorePedagogy?: () => void;
}

interface Scenario {
  id: string;
  tabLabel: string;
  problem: string;
  studentSolution: string;
  aiInsight: string;
}

export function AiDemoSection({ onStartFree, onExplorePedagogy }: AiDemoSectionProps) {
  const scenarios: Scenario[] = [
    {
      id: 'algorithms',
      tabLabel: 'Algorithms',
      problem: 'High-throughput in-memory caching',
      studentSolution: 'const cache = new Map(); // O(1) reads',
      aiInsight:
        'Excellent space complexity! To prevent memory bloat during massive burst queries, consider wrapping this with an LRU eviction strategy. Would you like to inspect module 4\'s implementation?',
    },
    {
      id: 'systems',
      tabLabel: 'System Design',
      problem: 'Event-driven payment reconciliation',
      studentSolution: 'await publishEvent("payment.processed", payload);',
      aiInsight:
        'Good decoupling! However, if the database transaction aborts after publishing, you risk inconsistent state. Implement the Transactional Outbox pattern to guarantee idempotency.',
    },
    {
      id: 'product',
      tabLabel: 'AI Strategy',
      problem: 'Enterprise churn mitigation metric',
      studentSolution: 'Track daily active users (DAU / MAU ratio)',
      aiInsight:
        'DAU/MAU can disguise enterprise seat stagnation. Better leading indicator: Measure "Time-to-First-AI-Synthesis-Success" within the initial 48 hours of onboarding.',
    },
  ];

  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0].id);

  const activeScenario =
    scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  return (
    <section className="ai-demo-wrapper" id="ai-pedagogy">
      <div className="ai-demo-banner">
        <div className="ai-demo-glow" />

        <div className="ai-demo-grid">
          <div className="ai-demo-left">
            <span className="ai-demo-badge">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                bolt
              </span>
              <span>Personalized Acceleration</span>
            </span>

            <h2 className="ai-demo-heading">
              Ready to upgrade your intellect with continuous AI feedback?
            </h2>

            <p className="ai-demo-text">
              Join over 45,000 students and professionals mastering cutting-edge software architecture,
              artificial intelligence, and leadership without obsolete rigid lectures.
            </p>

            <div className="ai-demo-actions">
              <button
                type="button"
                className="btn-demo-primary"
                onClick={onStartFree}
              >
                Start Learning for Free
              </button>
              <button
                type="button"
                className="btn-demo-secondary"
                onClick={onExplorePedagogy}
              >
                Explore Our Pedagogy
              </button>
            </div>
          </div>

          <div className="ai-sim-card">
            <div className="ai-sim-header">
              <div className="ai-sim-title-group">
                <div className="ai-sim-avatar">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    psychology
                  </span>
                </div>
                <div>
                  <div className="ai-sim-name">Mentora Socratic AI</div>
                  <div className="ai-sim-subtitle">Active Code Critique</div>
                </div>
              </div>
              <div className="online-indicator">
                <span className="online-dot" />
                <span>Online</span>
              </div>
            </div>

            <div className="ai-sim-tabs">
              {scenarios.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  className={`ai-sim-tab-btn ${activeScenarioId === sc.id ? 'active' : ''}`}
                  onClick={() => setActiveScenarioId(sc.id)}
                >
                  {sc.tabLabel}
                </button>
              ))}
            </div>

            <div className="student-prompt-box">
              <div className="student-label">
                Challenge: {activeScenario.problem}
              </div>
              <code className="student-code">{activeScenario.studentSolution}</code>
            </div>

            <div className="mentor-response-box">
              <div className="mentor-label">AI Mentor Insight:</div>
              <p className="mentor-text">&quot;{activeScenario.aiInsight}&quot;</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
