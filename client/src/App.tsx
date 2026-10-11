import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout.js';
import { LandingPage } from './components/landing/LandingPage.js';
import { CoursesPage } from './components/course/CoursesPage.js';
import { CourseDetailPage } from './components/course/CourseDetailPage.js';
import { InstructorsPage } from './components/instructors/InstructorsPage.js';
import { LoginScreen } from './components/auth/LoginScreen.js';
import { RegisterScreen } from './components/auth/RegisterScreen.js';
import { DashboardPage } from './components/dashboard/DashboardPage.js';
import { CreateCourseScreen } from './components/course/CreateCourseScreen.js';
import { RecommendationsPage } from './components/recommendations/RecommendationsPage.js';
import { ProtectedRoute } from './components/layout/ProtectedRoute.js';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/course/:id" element={<CourseDetailPage />} />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <RecommendationsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/ai-advisor" element={<Navigate to="/recommendations" replace />} />
          <Route path="/instructors" element={<InstructorsPage />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/create-course" element={<CreateCourseScreen />} />
          {/* Aliases & Fallbacks */}
          <Route path="/course" element={<Navigate to="/courses" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
