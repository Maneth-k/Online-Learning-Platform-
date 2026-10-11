import { Link } from 'react-router-dom';
import './Footer.css';

interface FooterProps {
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

const CURRENT_YEAR = new Date().getFullYear();

export function Footer({ onOpenAuth }: FooterProps) {

  return (
    <footer className="mentora-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <Link
              to="/"
              className="footer-brand-link"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <img src="/logo.png" alt="Mentora" className="footer-logo-img" />
              <span className="footer-brand-name">Mentora</span>
            </Link>
            <p className="footer-description">
              AI-augmented scholarly mentorship engineered for focused learners, university scholars, and modern lifelong practitioners.
            </p>
            <div className="footer-badge">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
              <span>Accredited Curriculum Engine</span>
            </div>
          </div>

          <div>
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item">
                <a href="/#hero-synthesis">AI Goal Synthesis</a>
              </li>
              <li className="footer-link-item">
                <a href="/#ai-pedagogy">Socratic Feedback Engine</a>
              </li>
              <li className="footer-link-item">
                <a href="/#how-it-works">The Mentora Cycle</a>
              </li>
              <li className="footer-link-item">
                <Link to="/courses">Curriculum Catalog</Link>
              </li>
              <li className="footer-link-item">
                <Link to="/instructors">Distinguished Instructors</Link>
              </li>
              <li className="footer-link-item">
                <a
                  href="#auth"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenAuth?.('register');
                  }}
                >
                  Scholar Membership
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Tracks</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item">
                <Link to="/courses">Full-Stack Systems</Link>
              </li>
              <li className="footer-link-item">
                <Link to="/courses">Applied Machine Learning</Link>
              </li>
              <li className="footer-link-item">
                <Link to="/courses">Product Strategy & AI</Link>
              </li>
              <li className="footer-link-item">
                <Link to="/courses">Cloud & DevOps Mastery</Link>
              </li>
              <li className="footer-link-item">
                <Link to="/courses">Executive Leadership</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Trust & Legal</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item">
                <a href="#">Academic Integrity</a>
              </li>
              <li className="footer-link-item">
                <a href="#">Data Privacy Charter</a>
              </li>
              <li className="footer-link-item">
                <a href="#">Terms of Service</a>
              </li>
              <li className="footer-link-item">
                <a href="#">AI Ethics Standards</a>
              </li>
              <li className="footer-link-item">
                <a href="#">Security & Compliance</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {CURRENT_YEAR} Mentora Academic Systems Inc. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <a href="#">Documentation</a>
            <a href="#">API & Integrations</a>
            <a href="#">Support Center</a>
            <a href="#">System Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
