import { useState } from 'react';
import { useCurrentUser, useLogout } from './hooks/useAuth.js';
import { LandingPage } from './components/landing/LandingPage.js';
import { AddCourseForm } from './components/AddCourseForm.js';

function App() {
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [showAddCourse, setShowAddCourse] = useState(false);

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
              onClick={() => setCurrentView('landing')}
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
      onOpenDashboard={() => setCurrentView('dashboard')}
    />
  );
}

export default App;
