import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, Settings, User, Bell, Crown, Target, BarChart3, ChevronsUpDown, Store, Globe, Building, Info } from 'lucide-react';
import UserProfile from '@/components/dashboard/UserProfile';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import Notifications from '@/components/dashboard/Notifications';

function DashboardHeader({ company, selectedPlanData, onSignOut, activeRubro, onRubroChange, activeLocale, onLocaleChange, isCurrentRubroPhysical, onNavigateToSettings }) {
  const [showProfile, setShowProfile] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [pricingDetails, setPricingDetails] = useState(null);

  const planIcons = {
    basico: <Target className="w-5 h-5" />,
    profesional: <BarChart3 className="w-5 h-5" />,
    empresarial: <Crown className="w-5 h-5" />
  };

  const planColors = {
    basico: 'from-blue-500 to-cyan-500',
    profesional: 'from-purple-500 to-pink-500',
    empresarial: 'from-orange-500 to-red-500'
  };
  
  const userInitial = user?.email?.[0]?.toUpperCase() ?? 'U';
  const planId = company.plan_id.replace('_pending', '');
  const planStatus = company.plan_status;

  const formatCLP = useCallback((value) => {
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) return "$0";
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(numericValue);
  }, []);

  const handleSignOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error && error.message && !error.message.includes('Session from session_id claim in JWT does not exist')) {
      toast({
        variant: "destructive",
        title: "Error al cerrar sesión",
        description: error.message,
      });
    } else {
      if (onSignOut) {
        onSignOut();
      }
    }
  }, [toast, onSignOut]);

  useEffect(() => {
    const fetchPricingDetails = async () => {
      if (!company) return;
      try {
        const { data, error } = await supabase.rpc('get_pricing_details', {
          p_plan_id: company.plan_id,
          p_locales_count: company.locales || 0,
          p_rubros_list: company.rubros || [],
        });
        if (error) throw error;
        setPricingDetails(data);
      } catch (error) {
        console.error("Error fetching pricing details for header:", error);
      }
    };
    fetchPricingDetails();
  }, [company]);

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.img 
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/1a278a57-ddc3-48d4-9216-30f7b1b4e998/216e817e9696a1575f704e812c10a089.png" 
                alt="Logo de Client Pulse: Medición de Satisfacción y Benchmarking" 
                className="h-20 w-auto object-contain transition-all duration-300 hover:scale-105" 
                style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))' }}
              />
              <div>
                <h1 className="text-2xl font-bold gradient-text">{company.company_name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  {company.rubros.length > 1 ? (
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm font-semibold"
                        >
                          {activeRubro.toLowerCase().includes('online') ? <Globe className="w-4 h-4 mr-2" /> : <Store className="w-4 h-4 mr-2" />}
                          {activeRubro}
                          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
                        </motion.button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Seleccionar Rubro</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={activeRubro} onValueChange={onRubroChange}>
                          {company.rubros.map(rubro => (
                            <DropdownMenuRadioItem key={rubro} value={rubro}>{rubro}</DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <p className="text-gray-600">{activeRubro}</p>
                  )}
                  {isCurrentRubroPhysical && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm font-semibold"
                        >
                          <Building className="w-4 h-4 mr-2" />
                          {activeLocale === 'all' ? 'Todos los locales' : activeLocale}
                          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
                        </motion.button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Seleccionar Local</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={activeLocale} onValueChange={onLocaleChange}>
                          <DropdownMenuRadioItem value="all">Todos los locales</DropdownMenuRadioItem>
                          {company.locations?.filter(l => l.rubro === activeRubro).map(loc => (
                            <DropdownMenuRadioItem key={loc.address} value={loc.address}>{loc.address}</DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${planColors[planId]} cursor-pointer`}>
                        {planIcons[planId]}
                        <span className="ml-2 capitalize whitespace-nowrap">Plan {selectedPlanData?.name}</span>
                        <Info className="w-3 h-3 ml-2 opacity-80" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4">
                      <div className="text-sm">
                        <p className="font-bold">Resumen de tu Plan</p>
                        {pricingDetails ? (
                          <p className="mt-2">Costo Mensual: <span className="font-semibold">{formatCLP(pricingDetails.totalCost)}</span></p>
                        ) : (
                          <p className="mt-2">Calculando costo...</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Ver detalles en Configuración &gt; Suscripción.</p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Notifications />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 p-1 pr-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Avatar>
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user?.email}</span>
                    <ChevronsUpDown className="w-4 h-4 text-gray-500" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toast({
                    title: "🚧 Esta función no está implementada aún",
                    description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀"
                  })}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onNavigateToSettings}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-600 focus:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {planStatus === 'pending_cancellation' && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cancelación de Plan Pendiente</AlertTitle>
              <AlertDescription>
                Tu plan será cancelado el {new Date(company.plan_change_effective_date).toLocaleDateString('es-CL')}. Mantendrás el acceso hasta esa fecha.
              </AlertDescription>
            </Alert>
          )}
           {company.new_plan_id && (
            <Alert variant="default" className="mt-4 bg-yellow-50 border-yellow-300 text-yellow-800">
              <Info className="h-4 w-4 !text-yellow-800" />
              <AlertTitle>Cambio de Plan Pendiente</AlertTitle>
              <AlertDescription>
                Tu plan cambiará el {new Date(company.plan_change_effective_date).toLocaleDateString('es-CL')}.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </header>

      <UserProfile 
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
}

export default DashboardHeader;