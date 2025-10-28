import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export function useBillingLogic({ company, initialPlanId, onPaymentSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [pricingDetails, setPricingDetails] = useState(null);

  const [billingDetails, setBillingDetails] = useState({
    fullName: '',
    address: '',
    city: '',
    region: '',
    comuna: '',
    phone: '',
    email: company?.email || '',
  });

  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
  });

  const formatCLP = useCallback((value) => {
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) return 'CLP $0';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(numericValue);
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .order('price', { ascending: true });

        if (error) throw error;
        setPlans(data);
        const currentPlanId = initialPlanId || company?.plan_id?.replace('_pending', '');
        setSelectedPlanId(currentPlanId);
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: 'Error al cargar planes',
          description: 'No se pudieron obtener los planes desde la base de datos.',
          variant: 'destructive',
        });
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [toast, initialPlanId, company?.plan_id]);

  const fetchPricingDetails = useCallback(async (planId) => {
    if (!planId || !company) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_pricing_details', {
        p_plan_id: planId,
        p_locales_count: company.locales || 0,
        p_rubros_list: company.rubros || [],
      });
      if (error) throw error;
      setPricingDetails(data);
    } catch (error) {
      console.error('Error fetching pricing details:', error);
      toast({ title: 'Error', description: 'No se pudo calcular el precio del plan.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [company, toast]);

  useEffect(() => {
    if (selectedPlanId) {
      fetchPricingDetails(selectedPlanId);
    }
  }, [selectedPlanId, fetchPricingDetails]);

  useEffect(() => {
    if (company) {
      setBillingDetails((prev) => ({ ...prev, email: company.email }));
    }
  }, [company?.email]);

  const handleInputChange = (setter, field, value) => {
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !billingDetails.fullName ||
      !billingDetails.address ||
      !billingDetails.region ||
      !billingDetails.comuna ||
      !cardDetails.number ||
      !cardDetails.expiry ||
      !cardDetails.cvc
    ) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor, completa todos los campos de facturación y tarjeta.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const mockCardToken = `tok_card_${Math.random().toString(36).substring(2, 15)}`;

      const { data: rpcData, error: rpcError } = await supabase.rpc('process_dlocalgo_payment', {
        p_company_id: company.id,
        p_amount: pricingDetails.totalCost,
        p_currency: 'CLP',
        p_card_token: mockCardToken,
        p_payer_email: billingDetails.email,
        p_billing_details: billingDetails,
        p_new_plan_id: selectedPlanId,
      });

      if (rpcError) throw rpcError;

      if (rpcData.success) {
        toast({
          title: '¡Pago Exitoso!',
          description: 'Tu plan ha sido activado. Serás redirigido al dashboard.',
          duration: 5000,
        });
        onPaymentSuccess && onPaymentSuccess();
      } else {
        throw new Error(rpcData.message || 'El pago fue rechazado.');
      }
    } catch (error) {
      console.error('Error en el pago:', error);
      toast({
        title: 'Error en el Pago',
        description: error.message || 'No se pudo procesar tu pago. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanDetails = plans.find((p) => p.id === selectedPlanId);

  return {
    loading,
    plans,
    loadingPlans,
    selectedPlanId,
    setSelectedPlanId,
    pricingDetails,
    billingDetails,
    setBillingDetails,
    cardDetails,
    setCardDetails,
    formatCLP,
    handlePayment,
    handleInputChange,
    selectedPlanDetails,
  };
}