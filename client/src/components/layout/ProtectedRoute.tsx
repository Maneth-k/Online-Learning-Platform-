import { Navigate, useLocation, Link } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useAuth.js';
import type { UserRole } from '../../types/auth.js';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { data: user, isLoading } = useCurrentUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="protected-route-loading">
        <span className="material-symbols-outlined route-spinner">progress_activity</span>
        <p>Checking authentication session...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login preserving typed return URL
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="protected-role-denied-wrapper">
        <div className="protected-role-denied-card">
          <span className="material-symbols-outlined denied-icon">school</span>
          <h2>AI advisor is for students</h2>
          <p>
            As an {user.role}, you have access to instructor curriculum tools and your dashboard.
          </p>
          <div className="denied-actions">
            <Link to="/dashboard" className="btn-denied-primary">
              Go to Dashboard
            </Link>
            <Link to="/courses" className="btn-denied-secondary">
              Browse Course Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : null;
}

export default ProtectedRoute;
