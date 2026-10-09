import { useCurrentUser, useLogout } from './hooks/useAuth.js';
import { LoginForm } from './components/LoginForm.js';

function App() {
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();

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
      <button
        type="button"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
        style={{ padding: '6px 12px', cursor: 'pointer' }}
      >
        {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
      </button>
    </div>
  );
}

export default App;
