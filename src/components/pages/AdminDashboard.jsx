import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTabs from '@/components/admin/AdminTabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import AdminStatsCards from '@/components/admin/AdminStatsCards';
import OverviewTab from '@/components/admin/OverviewTab';
import SurveyManagement from '@/components/admin/SurveyManagement';
import RubroManagement from '@/components/admin/RubroManagement';
import MetricManagement from '@/components/admin/MetricManagement';
import PlanManagement from '@/components/admin/PlanManagement';
import ResourceManagement from '@/components/admin/ResourceManagement';
import NotificationManagement from '@/components/admin/NotificationManagement';
import SettingsManagement from '@/components/admin/SettingsManagement';
import CompaniesTab from '@/components/admin/CompaniesTab';
import MessagesTab from '@/components/admin/MessagesTab';

function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { role: userRole, loadingRole } = useUserRole();
  const [activeTab, setActiveTab] = useState('overview');
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [data, setData] = useState({
    companies: [],
    companiesCount: 0,
    users: [],
    surveys: [],
    surveysCount: 0,
    responses: [],
    responsesCount: 0,
    rubros: [],
    plans: [],
    resources: [],
    app_settings: [],
  });
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();

  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      const [
        companiesRes,
        usersRes,
        surveysRes,
        responsesRes,
        rubrosRes,
        plansRes,
        resourcesRes,
        settingsRes,
      ] = await Promise.all([
        supabase.from('companies').select('*', { count: 'exact' }).order('created_at', { ascending: false }),
        supabase.rpc('get_all_users_with_details'),
        supabase.from('surveys').select('*, companies(company_name, rubros)', { count: 'exact' }).order('created_at', { ascending: false }),
        supabase.from('responses').select('*, companies(company_name, rubros), survey_id', { count: 'exact' }).order('created_at', { ascending: false }),
        supabase.from('rubros').select('*').order('name', { ascending: true }),
        supabase.from('plans').select('*').order('name', { ascending: true }),
        supabase.from('resources').select('*').order('title', { ascending: true }),
        supabase.from('app_settings').select('*').order('key', { ascending: true }),
      ]);

      const errors = [companiesRes.error, usersRes.error, surveysRes.error, responsesRes.error, rubrosRes.error, plansRes.error, resourcesRes.error, settingsRes.error];
      const firstError = errors.find(e => e);
      if (firstError) throw firstError;
      
      setData({
        companies: companiesRes.data || [],
        companiesCount: companiesRes.count || 0,
        users: usersRes.data || [],
        surveys: surveysRes.data || [],
        surveysCount: surveysRes.count || 0,
        responses: responsesRes.data || [],
        responsesCount: responsesRes.count || 0,
        rubros: rubrosRes.data || [],
        plans: plansRes.data || [], 
        resources: resourcesRes.data || [],
        app_settings: settingsRes.data || [],
        notifications: []
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error al cargar datos",
        description: `Hubo un problema: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (userRole === 'admin') {
      loadAdminData();
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole !== 'admin' || !user) return;

    const fetchUnreadCount = async () => {
      const { data: adminUser, error: adminError } = await supabase.from('user_roles').select('user_id').eq('role', 'admin').limit(1).single();
      if (adminError || !adminUser) return;

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', adminUser.user_id)
        .is('read_at', null);
      
      if (!error) {
        setUnreadMessagesCount(count);
      }
    };

    fetchUnreadCount();

    const channel = supabase.channel('admin-messages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userRole]);

  const stats = useMemo(() => {
    const totalCompanies = data.companiesCount;
    const totalSurveys = data.surveysCount;
    const totalResponses = data.responsesCount;

    return {
      totalCompanies,
      totalSurveys,
      totalResponses,
    };
  }, [data.companiesCount, data.surveysCount, data.responsesCount]);


  const handleSignOut = async () => {
    await signOut();
  };

  const tabComponents = {
    overview: <OverviewTab />,
    surveys: <SurveyManagement surveys={data.surveys} rubros={data.rubros} onUpdate={loadAdminData} />,
    companies: <CompaniesTab users={data.users} companies={data.companies} onUpdate={loadAdminData} />,
    messages: <MessagesTab />,
    rubros: <RubroManagement rubros={data.rubros} onUpdate={loadAdminData} />,
    metrics: <MetricManagement onUpdate={loadAdminData} />,
    plans: <PlanManagement plans={data.plans} onUpdate={loadAdminData} />,
    resources: <ResourceManagement resources={data.resources} onUpdate={loadAdminData} />,
    notifications: <NotificationManagement users={data.users} onUpdate={loadAdminData} />,
    settings: <SettingsManagement settings={data.app_settings} onUpdate={loadAdminData} />,
  };
  
  if (loadingRole) return <LoadingSpinner text="Verificando rol..." fullScreen={true} />;
  
  if (userRole !== 'admin') {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <h1 className="text-3xl font-bold text-red-600">Acceso Denegado</h1>
            <p className="mt-2 text-lg">No tienes permisos para ver esta página.</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onSignOut={handleSignOut} />

      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {loadingData ? (
             <LoadingSpinner text="Cargando estadísticas..." fullScreen={false} />
          ) : (
            <AdminStatsCards stats={stats} />
          )}

          <div className="bg-white rounded-2xl shadow-lg mt-6">
            <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} unreadMessagesCount={unreadMessagesCount} />
            <div className="p-6">
              <Suspense fallback={<LoadingSpinner text={`Cargando ${activeTab}...`} fullScreen={false} />}>
                {loadingData ? <LoadingSpinner text="Cargando datos..." fullScreen={false} /> : (tabComponents[activeTab] || <div>Pestaña no encontrada</div>)}
              </Suspense>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default AdminDashboard;