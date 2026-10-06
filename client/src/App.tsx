import { useState, useEffect } from 'react';
import './App.css';

interface ServerHealth {
  status: string;
  message: string;
  timestamp: string;
  env: string;
}

function App() {
  const [serverHealth, setServerHealth] = useState<ServerHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health');
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        const data = await response.json();
        setServerHealth(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to backend');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Learning Management System (LMS)</h1>
        <p className="subtitle">Enterprise Full-Stack Architecture (React + Express + TypeScript)</p>
      </header>

      <main className="dashboard-preview">
        <section className="status-card">
          <h2>System Initialization Status</h2>
          <div className="status-grid">
            <div className="status-item ready">
              <span className="badge">Active</span>
              <h3>Frontend Client</h3>
              <p>React 19 + TypeScript + Vite</p>
            </div>

            <div className={`status-item ${serverHealth ? 'ready' : loading ? 'pending' : 'error'}`}>
              <span className="badge">{serverHealth ? 'Connected' : loading ? 'Connecting...' : 'Disconnected'}</span>
              <h3>Backend API</h3>
              <p>Express 5 + TypeScript + TSX</p>
              {serverHealth && (
                <div className="health-details">
                  <small>Status: {serverHealth.status}</small>
                  <br />
                  <small>Env: {serverHealth.env}</small>
                </div>
              )}
              {error && <small className="error-text">Ensure server is running on port 5000: {error}</small>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
