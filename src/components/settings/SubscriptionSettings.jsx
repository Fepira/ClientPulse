import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Info, Store, Globe, AlertCircle, TrendingUp, Package, DollarSign, RotateCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PlanCostDetails = ({ title, planName, pricingDetails, formatCLP }) => {
  if (!pricingDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
            <p className="ml-2 text-gray-500">Calculando costo...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-gray-600"><Package className="w-4 h-4" />Plan {planName}</span>
          <span className="font-medium">{formatCLP(pricingDetails.baseCost)}</span>
        </div>
        {pricingDetails.additionalLocalesCount > 0 && (
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-gray-600"><Store className="w-4 h-4" />{pricingDetails.additionalLocalesCount} locales físicos adicionales</span>
            <span className="font-medium">{formatCLP(pricingDetails.additionalLocalesCount * pricingDetails.costPerLocale)}</span>
          </div>
        )}
        {pricingDetails.additionalOnlineRubrosCount > 0 && (
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-gray-600"><Globe className="w-4 h-4" />{pricingDetails.additionalOnlineRubrosCount} rubros online adicionales</span>
            <span className="font-medium">{formatCLP(pricingDetails.additionalOnlineRubrosCount * pricingDetails.costPerOnlineRubro)}</span>
          </div>
        )}
        <div className="border-t border-dashed my-2"></div>
        <div className="flex justify-between items-center text-base font-bold">
          <span className="flex items-center gap-2"><DollarSign className="w-5 h-5" />Total Mensual</span>
          <span>{formatCLP(pricingDetails.totalCost)}</span>
        </div>
      </CardContent>
    </Card>
  );
};


function SubscriptionSettings({ company, onCompanyUpdate }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(company?.plan_id || '');
  
  const [currentPricingDetails, setCurrentPricingDetails] = useState(null);
  const [newPricingDetails, setNewPricingDetails] = useState(null);
  
  const hasPendingChange = useMemo(() => !!company?.new_plan_id, [company]);
  const isCancellationPending = useMemo(() => company?.plan_status === 'pending_cancellation', [company]);
  const newPlanInfo = useMemo(() => plans.find(p => p.id === company?.new_plan_id), [plans, company]);
  
  const formatCLP = useCallback((value) => {
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) return "$0";
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(numericValue);
  }, []);

  const fetchPricingDetails = useCallback(async (planId, setter) => {
    if (!planId || !company) return;
    setter(null);
    try {
      const { data, error } = await supabase.rpc('get_pricing_details', {
        p_plan_id: planId,
        p_locales_count: company.locales || 0,
        p_rubros_list: company.rubros || [],
      });
      if (error) throw error;
      setter(data);
    } catch (error) {
      console.error(`Error fetching pricing for plan ${planId}:`, error);
      toast({ title: "Error", description: "No se pudo calcular el precio del plan.", variant: "destructive" });
    }
  }, [company, toast]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase.from('plans').select('*');
        if (error) throw error;
        setPlans(data || []);
      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar los planes.", variant: "destructive" });
      }
    };
    fetchPlans();
  }, [toast]);

  useEffect(() => {
    if (company && plans.length > 0) {
      const currentPlanId = company.plan_id;
      setSelectedPlanId(currentPlanId);
      fetchPricingDetails(currentPlanId, setCurrentPricingDetails);
      if (company.new_plan_id) {
        fetchPricingDetails(company.new_plan_id, setNewPricingDetails);
      }
    }
  }, [company, plans, fetchPricingDetails]);

  useEffect(() => {
    if (selectedPlanId && selectedPlanId !== company?.plan_id && selectedPlanId !== company?.new_plan_id) {
      fetchPricingDetails(selectedPlanId, setNewPricingDetails);
    } else if (selectedPlanId === company?.plan_id) {
      setNewPricingDetails(null);
    }
  }, [selectedPlanId, company, fetchPricingDetails]);

  const handleUpdatePlan = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('schedule_plan_change', {
        p_company_id: company.id,
        p_new_plan_id: selectedPlanId,
      });

      if (error) throw error;

      toast({
        title: "Cambio de Plan Programado",
        description: `Tu plan cambiará al inicio de tu próximo ciclo de facturación.`,
      });
      onCompanyUpdate();
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({ title: "Error", description: `Error al programar el cambio de plan: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelPendingChange = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('cancel_pending_plan_change', {
        p_company_id: company.id
      });

      if (error) throw error;
      
      toast({
        title: "¡Éxito!",
        description: "El cambio de plan pendiente ha sido cancelado.",
      });
      onCompanyUpdate();
    } catch (error) {
       console.error("Error cancelling plan change:", error);
       toast({ title: "Error", description: `No se pudo cancelar el cambio de plan: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('request_plan_cancellation', {
        p_company_id: company.id,
      });

      if (error) throw error;

      toast({
        title: "Cancelación Programada",
        description: "Tu suscripción se cancelará al final del ciclo de facturación actual.",
      });
      onCompanyUpdate();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({ title: "Error", description: `Error al cancelar la suscripción: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  const currentPlanDetails = plans.find(p => p.id === company?.plan_id);
  const selectedPlanDetails = plans.find(p => p.id === selectedPlanId);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Gestión de Suscripción y Plan</h3>
      
      {currentPlanDetails && (
        <div className="mb-6">
          <PlanCostDetails 
            title="Tu Plan Actual"
            planName={currentPlanDetails.name}
            pricingDetails={currentPricingDetails}
            formatCLP={formatCLP}
          />
        </div>
      )}

      {hasPendingChange && newPlanInfo && (
        <Alert variant="default" className="mb-6 bg-yellow-50 border-yellow-300 text-yellow-800">
          <Info className="h-4 w-4 !text-yellow-800" />
          <AlertTitle>Cambio de Plan Pendiente</AlertTitle>
          <AlertDescription>
            Tu plan cambiará a <span className="font-bold">{newPlanInfo.name}</span> el día {new Date(company.plan_change_effective_date).toLocaleDateString('es-CL')}.
          </AlertDescription>
          <div className="mt-4">
            <PlanCostDetails 
              title="Costo Estimado del Nuevo Plan"
              planName={newPlanInfo.name}
              pricingDetails={newPricingDetails}
              formatCLP={formatCLP}
            />
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-4" disabled={loading}>
                <RotateCcw className="w-4 h-4 mr-2"/>
                Cancelar Cambio de Plan
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción cancelará tu cambio de plan programado. Continuarás con tu plan actual.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, mantener cambio</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelPendingChange}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Sí, cancelar cambio
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Alert>
      )}

      {isCancellationPending && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cancelación de Plan Programada</AlertTitle>
          <AlertDescription>
            Tu suscripción será cancelada el {new Date(company.plan_change_effective_date).toLocaleDateString('es-CL')}. Mantendrás acceso completo hasta esa fecha.
          </AlertDescription>
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-4 border-destructive text-destructive hover:bg-destructive/10" disabled={loading}>
                <RotateCcw className="w-4 h-4 mr-2"/>
                Reactivar Suscripción
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Reactivar suscripción?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esto cancelará la baja programada y tu plan continuará activo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, mantener cancelación</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelPendingChange}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Sí, reactivar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Alert>
      )}

      {!hasPendingChange && !isCancellationPending && (
        <>
          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg">Cambiar Plan</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <Select onValueChange={setSelectedPlanId} value={selectedPlanId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un nuevo plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {formatCLP(plan.price)} (base)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newPricingDetails && selectedPlanId !== company?.plan_id && (
                <div className="mt-4">
                  <PlanCostDetails 
                    title="Costo Mensual Estimado del Nuevo Plan"
                    planName={selectedPlanDetails?.name}
                    pricingDetails={newPricingDetails}
                    formatCLP={formatCLP}
                  />
                   <p className="text-xs text-gray-500 pt-2 text-center">Este cambio se aplicará al inicio de tu próximo ciclo de facturación.</p>
                </div>
              )}
              <Button onClick={handleUpdatePlan} disabled={loading || selectedPlanId === company?.plan_id}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Programar Cambio de Plan
              </Button>
            </CardContent>
          </Card>

          <div className="mt-8 p-6 border border-red-300 rounded-lg bg-red-50">
            <h4 className="text-lg font-semibold text-red-800 mb-3">Dar de Baja Suscripción</h4>
            <p className="text-red-700 mb-4 text-sm">
              Si das de baja tu plan, perderás el acceso a las funciones premium al final de tu ciclo de facturación actual. Esta acción no se puede deshacer.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={loading}>
                  Solicitar Baja del Plan
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro de que quieres dar de baja tu plan?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción es irreversible. Tu plan permanecerá activo hasta el final del ciclo de facturación actual,
                    el {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CL')}. Después de esa fecha, perderás el acceso.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelSubscription} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sí, dar de baja
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  );
}

export default SubscriptionSettings;