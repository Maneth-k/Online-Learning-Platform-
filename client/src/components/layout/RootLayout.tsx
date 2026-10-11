import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../landing/Navbar.js';
import './RootLayout.css';

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Canonical redirect for legacy hash routes (e.g. #instructors, /courses#instructors -> /instructors)
  useEffect(() => {
    const hash = window.location.hash.toLowerCase().split('?')[0];
    if (hash === '#instructors' || hash === '#faculty' || hash === '#teachers' || hash === '#mentors') {
      window.history.replaceState(null, '', '/instructors');
      navigate('/instructors', { replace: true });
    } else if (hash === '#courses' || hash === '#course') {
      window.history.replaceState(null, '', '/courses');
      navigate('/courses', { replace: true });
    } else if (hash === '#login') {
      window.history.replaceState(null, '', '/login');
      navigate('/login', { replace: true });
    } else if (hash === '#register' || hash === '#signup' || hash === '#teach') {
      window.history.replaceState(null, '', '/register');
      navigate('/register', { replace: true });
    } else if (hash === '#dashboard') {
      window.history.replaceState(null, '', '/dashboard');
      navigate('/dashboard', { replace: true });
    } else if (hash === '#create-course' || hash === '#new-course' || hash === '#create') {
      window.history.replaceState(null, '', '/create-course');
      navigate('/create-course', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="mentora-app-layout">
      <Navbar />
      <div className="mentora-app-content">
        <Outlet />
      </div>
    </div>
  );
}

export default RootLayout;
