import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Route guard
import ProtectedRoute from './ProtectedRoute';

// Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import Dashboard from '../pages/Dashboard';
import TradePage from '../pages/TradePage';
import Portfolio from '../pages/Portfolio';
import News from '../pages/News';
import LearningHub from '../pages/LearningHub';
import LessonPage from '../pages/LessonPage';
import Transactions from '../pages/Transactions';
import NotFound from '../pages/NotFound';

import { ROUTES } from '../utils/constants';


function AppRoutes() {

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path={ROUTES.HOME} element={<LandingPage />} />

        {/* Auth pages */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        </Route>

        {/* Protected app pages */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.TRADE} element={<TradePage />} />
          <Route path={ROUTES.PORTFOLIO} element={<Portfolio />} />
          <Route path={ROUTES.NEWS} element={<News />} />
          <Route path={ROUTES.LEARN} element={<LearningHub />} />
          <Route path="/learn/:slug" element={<LessonPage />} />
          <Route path={ROUTES.TRANSACTIONS} element={<Transactions />} />
        </Route>

        {/* 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


export default AppRoutes;
