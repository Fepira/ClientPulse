import React, { lazy, Suspense, useEffect, useCallback, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUserRole } from '@/contexts/UserRoleContext';
import { supabase } from '@/lib/customSupabaseClient';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const AuthPage = lazy(() => import('@/components/pages/AuthPage'));
const RegisterPage = lazy(() => import('@/components/pages/RegisterPage'));
const Dashboard = lazy(() => import('@/components/pages/Dashboard'));
const AdminDashboard = lazy(() => import('@/components/pages/AdminDashboard'));
const LandingPage = lazy(() => import('@/components/pages/LandingPage'));
const PlansPage = lazy(() => import('@/components/pages/PlansPage'));
const BillingPage = lazy(() => import('@/components/pages/BillingPage'));
const SettingsPage = lazy(() => import('@/components/pages/SettingsPage'));
const SurveyPage = lazy(() => import('@/components/pages/SurveyPage'));

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return <LoadingSpinner text="Verificando acceso..." fullScreen />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (role === 'admin' && !requiredRole) {
    return <Navigate to="/admin" replace />;
  }
  
  if (requiredRole && role !== requiredRole) {
     return <Navigate to="/dashboard" replace />;
  }

  return children;
};


const AppRouter = () => {
  const { user, loading: authLoading } = useAuth();
  const { company, setCompany, setRole, loading: roleLoading, setLoading: setRoleLoading } = useUserRole();
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchUserSpecificData = useCallback(async () => {
    if (!user) {
      setRole(null);
      setCompany(null);
      setRoleLoading(false);
      return;
    }

    setRoleLoading(true);
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const userRole = roleError ? 'user' : roleData.role;
    setRole(userRole);

    if (userRole === 'user') {
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setCompany(companyError ? null : companyData);
    } else {
      setCompany(null);
    }
    
    setRoleLoading(false);
  }, [user, setRole, setCompany, setRoleLoading]);

  useEffect(() => {
    if (!authLoading) {
        fetchUserSpecificData().finally(() => setInitialLoading(false));
    }
  }, [authLoading, fetchUserSpecificData]);

  if (authLoading || initialLoading) {
    return <LoadingSpinner text="Iniciando..." fullScreen />;
  }

  return (
    <Router>
      <Suspense fallback={<LoadingSpinner text="Cargando página..." fullScreen />}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/billing" element={<BillingPage company={company} />} />
          <Route path="/survey/:locationId" element={<SurveyPage />} />
          
          <Route path="/dashboard/*" element={<PrivateRoute><Dashboard company={company} onCompanyUpdate={setCompany} /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage company={company} onCompanyUpdate={setCompany} /></PrivateRoute>} />
          
          <Route path="/admin/*" element={<PrivateRoute requiredRole="admin"><AdminDashboard /></PrivateRoute>} />

          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter;