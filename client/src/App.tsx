import { useState, useEffect } from 'react';
import { useCurrentUser, useLogout } from './hooks/useAuth.js';
import { LandingPage } from './components/landing/LandingPage.js';
import { LoginScreen } from './components/auth/LoginScreen.js';
import { RegisterScreen } from './components/auth/RegisterScreen.js';
import { AddCourseForm } from './components/AddCourseForm.js';

type ViewMode = 'landing' | 'login' | 'register' | 'dashboard';

function App() {
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [showAddCourse, setShowAddCourse] = useState(false);

  // Sync hash routing so users can directly load #login or #register
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#login') {
        setCurrentView('login');
      } else if (hash === '#register' || hash === '#signup') {
        setCurrentView('register');
      } else if (hash === '#dashboard') {
        setCurrentView('dashboard');
      } else if (!hash || hash === '#' || hash === '#home') {
        setCurrentView('landing');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToView = (view: ViewMode) => {
    setCurrentView(view);
    if (view === 'login') {
      window.location.hash = 'login';
    } else if (view === 'register') {
      window.location.hash = 'register';
    } else if (view === 'dashboard') {
      window.location.hash = 'dashboard';
    } else {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f9ff',
          color: '#00236f',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <p>Loading Mentora session...</p>
      </div>
    );
  }

  // Login View
  if (currentView === 'login') {
    return (
      <LoginScreen
        onSwitchToRegister={() => navigateToView('register')}
        onBackToHome={() => navigateToView('landing')}
      />
    );
  }

  // Register View
  if (currentView === 'register') {
    return (
      <RegisterScreen
        onSwitchToLogin={() => navigateToView('login')}
        onBackToHome={() => navigateToView('landing')}
      />
    );
  }

  // Dashboard View (when user is authenticated and enters dashboard)
  if (currentView === 'dashboard' && user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f8f9ff',
          color: '#0b1c30',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <header
          style={{
            padding: '1rem 2rem',
            background: '#ffffff',
            borderBottom: '1px solid #e5eeff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="/logo.png"
              alt="Mentora"
              style={{ width: '32px', height: '32px', borderRadius: '8px' }}
            />
            <h2 style={{ fontSize: '1.25rem', color: '#00236f', margin: 0 }}>
              Mentora Dashboard
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => navigateToView('landing')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #c5c5d3',
                background: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#00236f',
              }}
            >
              ← Back to Landing Page
            </button>
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#00236f',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
            </button>
          </div>
        </header>

        <main style={{ maxWidth: '960px', margin: '2rem auto', padding: '0 1.5rem' }}>
          <h1 style={{ fontSize: '2rem', color: '#00236f' }}>
            Welcome, {user.username}!
          </h1>
          <p style={{ color: '#444651', marginTop: '0.25rem' }}>
            Role:{' '}
            <strong style={{ textTransform: 'capitalize', color: '#006398' }}>
              {user.role}
            </strong>
          </p>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            {user.role === 'instructor' && (
              <button
                type="button"
                onClick={() => setShowAddCourse((prev) => !prev)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#1e3a8a',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {showAddCourse ? 'Close Form' : 'Add New Course'}
              </button>
            )}
          </div>

          {user.role === 'instructor' && showAddCourse && (
            <div
              style={{
                marginTop: '1.5rem',
                background: '#ffffff',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e5eeff',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
              }}
            >
              <AddCourseForm onSuccess={() => setShowAddCourse(false)} />
            </div>
          )}

          {user.role === 'student' && (
            <div
              style={{
                marginTop: '1.5rem',
                background: '#ffffff',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e5eeff',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
              }}
            >
              <h3 style={{ color: '#00236f', marginBottom: '0.5rem' }}>
                Student Learning Track
              </h3>
              <p style={{ color: '#444651', lineHeight: '1.6' }}>
                You are currently enrolled as an active scholar. Explore recommended
                courses on the landing page or request tailored AI synthesis.
              </p>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <LandingPage
      currentUser={user}
      onLogout={() => logoutMutation.mutate()}
      onOpenDashboard={() => navigateToView('dashboard')}
      onNavigateToAuth={(mode) => navigateToView(mode === 'register' ? 'register' : 'login')}
    />
  );
}

export default App;
