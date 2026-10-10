import { useState } from 'react';
import { useCurrentUser, useLogout } from './hooks/useAuth.js';
import { LoginForm } from './components/LoginForm.js';
import { AddCourseForm } from './components/AddCourseForm.js';

function App() {
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const [showAddCourse, setShowAddCourse] = useState(false);

  if (isLoading) {
    return <p style={{ margin: '20px' }}>Loading session...</p>;
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div style={{ margin: '20px' }}>
      <h1>Welcome, {user.username}!</h1>
      <p>Role: {user.role}</p>

      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          style={{ padding: '6px 12px', cursor: 'pointer' }}
        >
          {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
        </button>

        {user.role === 'instructor' && (
          <button
            type="button"
            onClick={() => setShowAddCourse((prev) => !prev)}
            style={{ padding: '6px 12px', cursor: 'pointer' }}
          >
            {showAddCourse ? 'Close Form' : 'Add New Course'}
          </button>
        )}
      </div>

      {user.role === 'instructor' && showAddCourse && (
        <div style={{ marginTop: '20px' }}>
          <AddCourseForm onSuccess={() => setShowAddCourse(false)} />
        </div>
      )}

      {user.role === 'student' && (
        <p style={{ marginTop: '16px', color: '#666' }}>
          Student account active. Course creation is available for instructors.
        </p>
      )}
    </div>
  );
}

export default App;
