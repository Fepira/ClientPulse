import React, { useState, useEffect, useMemo, useCallback } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useTestMode } from '@/contexts/TestModeContext';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { plansData } from '@/data/plans';
    import { mockMetrics } from '@/data/mock-data';
    import DashboardHeader from '@/components/dashboard/DashboardHeader';
    import TestModeHeader from '@/components/dashboard/TestModeHeader';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';
    import Overview from '@/components/dashboard/Overview';
    import Benchmarking from '@/components/dashboard/Benchmarking';
    import MySurveys from '@/components/dashboard/MySurveys';
    import EducationalResources from '@/components/dashboard/EducationalResources';
    import SettingsPage from '@/components/pages/SettingsPage';
    import CompanySettings from '@/components/settings/CompanySettings';
    import UserMessages from '@/components/dashboard/UserMessages';
    import { LayoutDashboard, BarChart3, FileText, BookOpen, Lock, Building, Settings, Mail, AlertCircle } from 'lucide-react';
    import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

    function Dashboard({ company, onCompanyUpdate }) {
      const [metrics, setMetrics] = useState(null);
      const [loading, setLoading] = useState(true);
      const { user, signOut } = useAuth();
      const { isTestMode, exitTestMode } = useTestMode();
      const { toast } = useToast();
      const [activeTab, setActiveTab] = useState('overview');
      const [activeRubro, setActiveRubro] = useState(company?.rubros?.[0] || null);
      const [activeLocale, setActiveLocale] = useState('all');
      const [timePeriod, setTimePeriod] = useState('current_month');
      const [stickyNotifications, setStickyNotifications] = useState([]);

      const selectedPlanData = useMemo(() => company ? plansData.find(p => p.id === company.plan_id.replace('_pending', '')) : null, [company]);
      const hasBenchmarkAccess = useMemo(() => selectedPlanData?.id === 'profesional' || selectedPlanData?.id === 'empresarial', [selectedPlanData]);
      
      const isCurrentRubroPhysical = useMemo(() => {
        if (!activeRubro || !company?.locations) return false;
        return company.locations.some(loc => loc.rubro === activeRubro);
      }, [activeRubro, company?.locations]);

      const fetchStickyNotifications = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_sticky', true)
            .eq('is_read', false);

        if (error) {
            console.error("Error fetching sticky notifications", error);
        } else {
            setStickyNotifications(data);
        }
      }, [user]);

      useEffect(() => {
        fetchStickyNotifications();
      }, [fetchStickyNotifications]);

      const handleDismissStickyNotification = async (id) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        setStickyNotifications(prev => prev.filter(n => n.id !== id));
      };

      const loadDashboardData = useCallback(async (currentRubro, currentLocale, currentPeriod) => {
        if (isTestMode) {
          setMetrics(mockMetrics);
          setLoading(false);
          return;
        }

        if (!company || !currentRubro) {
            setLoading(false);
            return;
        }
        setLoading(true);

        try {
            const { data, error } = await supabase.rpc('get_dashboard_overview', { 
                p_company_id: company.id,
                p_rubro: currentRubro,
                p_locale_name: currentLocale === 'all' ? null : currentLocale,
                p_time_period: currentPeriod
            });

            if (error) throw error;

            const safeMetrics = {
                csat: data.csat || { current: 0, change: 0 },
                nps: data.nps || { current: 0, change: 0, promotersPercent: 0, detractorsPercent: 0 },
                totalResponses: data.totalResponses || { current: 0, change: 0 },
                trends: data.trends || { csat: [], nps: [] },
                demographics: data.demographics || { byGender: [], byAge: [], metricsByGender: [], metricsByAge: [] },
                periodName: data.periodName || 'Mes Actual'
            };
            
            setMetrics(safeMetrics);

        } catch (error) {
          console.error('Error loading dashboard data:', error);
          toast({
            title: "Error al cargar datos",
            description: `Hubo un problema al cargar los datos del dashboard: ${error.message}`,
            variant: "destructive"
          });
          setMetrics({
            csat: { current: 0, change: 0 },
            nps: { current: 0, change: 0, promotersPercent: 0, detractorsPercent: 0 },
            totalResponses: { current: 0, change: 0 },
            trends: { csat: [], nps: [] },
            demographics: { byGender: [], byAge: [], metricsByGender: [], metricsByAge: [] },
            periodName: 'Error'
          });
        } finally {
          setLoading(false);
        }
      }, [company, toast, isTestMode]);

      useEffect(() => {
        if (company && !activeRubro) {
            setActiveRubro(company.rubros[0]);
        }
      }, [company, activeRubro]);

      useEffect(() => {
        if (activeRubro) {
          loadDashboardData(activeRubro, activeLocale, timePeriod);
        }
      }, [activeRubro, activeLocale, timePeriod, loadDashboardData]);
      
      useEffect(() => {
        if (isTestMode || !company?.id) return;

        const channel = supabase.channel(`dashboard-updates:${company.id}`);
        
        const subscription = channel
          .on(
            'postgres_changes',
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'responses',
              filter: `company_id=eq.${company.id}`
            },
            (payload) => {
              toast({
                title: "📊 ¡Nuevos datos disponibles!",
                description: "Tus métricas se han actualizado en tiempo real.",
              });
              loadDashboardData(activeRubro, activeLocale, timePeriod);
            }
          ).on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            },
            () => fetchStickyNotifications()
          )
          .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
              
            }
            if (status === 'CHANNEL_ERROR') {
              console.error(`Realtime subscription error:`, err);
            }
          });

        return () => {
          supabase.removeChannel(channel);
        };
      }, [company?.id, user?.id, isTestMode, activeRubro, activeLocale, timePeriod, loadDashboardData, toast, fetchStickyNotifications]);


      const handleRubroChange = (newRubro) => {
        setActiveRubro(newRubro);
        setActiveLocale('all');
      };
      
      const handleSignOut = useCallback(async () => {
        if (isTestMode) {
          exitTestMode();
        }
        await signOut();
      }, [isTestMode, exitTestMode, signOut]);

      const handleTabClick = (tabId) => {
        if (tabId === 'benchmarking' && !hasBenchmarkAccess) {
          toast({
            title: 'Función Premium',
            description: 'Actualiza tu plan a Profesional o Empresarial para acceder a las comparativas.',
          });
        } else {
          setActiveTab(tabId);
        }
      };

      const tabs = useMemo(() => {
        const baseTabs = [
          { id: 'overview', label: 'Visión General', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'benchmarking', label: 'Comparativas', icon: hasBenchmarkAccess ? <BarChart3 className="w-4 h-4" /> : <Lock className="w-4 h-4" />, disabled: !hasBenchmarkAccess },
          { id: 'surveys', label: 'Mis Encuestas', icon: <FileText className="w-4 h-4" /> },
          { id: 'messages', label: 'Buzón de Mensajes', icon: <Mail className="w-4 h-4" /> },
          { id: 'company-settings', label: 'Mi Empresa', icon: <Building className="w-4 h-4" /> },
        ];
        baseTabs.push(
          { id: 'resources', label: 'Recursos', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'settings', label: 'Configuración', icon: <Settings className="w-4 h-4" /> }
        );
        return baseTabs;
      }, [hasBenchmarkAccess]);

      if (!company) {
        return <LoadingSpinner text="Cargando información de la empresa..." />;
      }
      
      const renderContent = () => {
        switch (activeTab) {
          case 'overview':
            return loading || !metrics ? <LoadingSpinner text={`Cargando datos para ${activeRubro}...`} /> : <Overview metrics={metrics} timePeriod={timePeriod} onTimePeriodChange={setTimePeriod} company={company} activeLocale={activeLocale} onLocaleChange={setActiveLocale} activeRubro={activeRubro} />;
          case 'benchmarking':
            return <Benchmarking company={company} activeRubro={activeRubro} />;
          case 'surveys':
            return <MySurveys key={`${company.id}-${activeRubro}-${activeLocale}`} planId={company.plan_id} company={company} user={user} activeRubro={activeRubro} activeLocale={activeLocale} isCurrentRubroPhysical={isCurrentRubroPhysical} onCompanyUpdate={onCompanyUpdate} />;
          case 'messages':
            return <UserMessages />;
          case 'company-settings':
            return <CompanySettings company={company} onCompanyUpdate={onCompanyUpdate} />;
          case 'resources':
            return <EducationalResources />;
          case 'settings':
            return <SettingsPage company={company} onCompanyUpdate={onCompanyUpdate} />;
          default:
            return null;
        }
      };

      return (
        <div className={`min-h-screen bg-gray-50 ${isTestMode ? 'pt-10' : ''}`}>
          {isTestMode && <TestModeHeader />}
          <DashboardHeader
            company={company}
            selectedPlanData={selectedPlanData}
            onSignOut={handleSignOut}
            activeRubro={activeRubro}
            onRubroChange={handleRubroChange}
            activeLocale={activeLocale}
            onLocaleChange={setActiveLocale}
            isCurrentRubroPhysical={isCurrentRubroPhysical}
            onNavigateToSettings={() => handleTabClick('settings')}
          />

          <main className="container mx-auto px-6 py-8">
            {stickyNotifications.map(notif => (
              <Alert key={notif.id} variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{notif.title}</AlertTitle>
                  <AlertDescription>
                    {notif.description}
                    <button onClick={() => handleDismissStickyNotification(notif.id)} className="ml-4 underline text-xs">Marcar como leído</button>
                  </AlertDescription>
              </Alert>
            ))}

            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    disabled={tab.disabled}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : `border-transparent ${
                            tab.disabled
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${activeRubro}-${activeLocale}-${timePeriod}`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      );
    }

    export default Dashboard;