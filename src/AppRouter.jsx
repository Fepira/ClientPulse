import React from 'react';
    import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useUserRole } from '@/contexts/UserRoleContext';

    import LandingPage from '@/components/pages/LandingPage';
    import RegisterPage from '@/components/pages/RegisterPage';
    import AuthPage from '@/components/pages/AuthPage';
    import PlansPage from '@/components/pages/PlansPage';
    import BillingPage from '@/components/pages/BillingPage';
    import Dashboard from '@/components/pages/Dashboard';
    import AdminDashboard from '@/components/pages/AdminDashboard';
    import SettingsPage from '@/components/pages/SettingsPage';
    import SurveyPage from '@/components/pages/SurveyPage'; 
    import LoadingSpinner from '@/components/ui/LoadingSpinner';

    const AppRouter = () => {
      const { session, loading } = useAuth();
      const { role, isLoading: roleLoading } = useUserRole();

      if (loading || roleLoading) {
        return <LoadingSpinner text="Autenticando..." fullScreen/>;
      }

      const AdminRoute = ({ children }) => {
        if (!session) return <Navigate to="/login" />;
        if (role !== 'admin') return <Navigate to="/dashboard" />;
        return children;
      };

      const UserRoute = ({ children }) => {
        if (!session) return <Navigate to="/login" />;
        if (role === 'admin') return <Navigate to="/admin" />;
        return children;
      };
      
      const AuthRedirect = ({ children }) => {
        if (!session) return children;
        return role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />;
      };

      return (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<AuthRedirect><AuthPage /></AuthRedirect>} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/billing" element={<UserRoute><BillingPage /></UserRoute>} />
            
            <Route path="/survey/:locationId" element={<SurveyPage />} />

            <Route path="/dashboard/*" element={<UserRoute><Dashboard /></UserRoute>} />
            <Route path="/settings" element={<UserRoute><SettingsPage /></UserRoute>} />

            <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      );
    };

    export default AppRouter;