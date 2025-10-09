import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUserRole } from '@/contexts/UserRoleContext';
import { supabase } from '@/lib/customSupabaseClient';
import AppRouter from '@/components/AppRouter';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const AppLoader = () => {
  const { user, loading: authLoading, session } = useAuth();
  const { role, setRole, setCompany, loading: roleContextLoading } = useUserRole();
  const [appIsReady, setAppIsReady] = useState(false);
  const [loadingText, setLoadingText] = useState('Inicializando...');

  const fetchUserSpecificData = useCallback(async () => {
    if (!user) {
      setAppIsReady(true);
      return;
    }

    setLoadingText('Cargando rol de usuario...');
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    const userRole = roleError ? 'user' : roleData.role;
    setRole(userRole);

    if (userRole === 'user') {
      setLoadingText('Cargando datos de la empresa...');
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (companyError) {
        console.error('Error fetching company:', companyError);
        setCompany(null);
      } else {
        setCompany(companyData);
      }
    }
    
    setAppIsReady(true);

  }, [user, setRole, setCompany]);

  useEffect(() => {
    if (!authLoading) {
      fetchUserSpecificData();
    }
  }, [authLoading, fetchUserSpecificData]);


  if (!appIsReady || authLoading) {
    return <LoadingSpinner text={loadingText} fullScreen />;
  }

  return <AppRouter />;
};

export default AppLoader;