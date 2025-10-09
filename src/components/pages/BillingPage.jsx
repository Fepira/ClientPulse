import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, User, Mail, MapPin, Phone, ArrowLeft, Lock } from 'lucide-react';
import { regionesData, comunasData } from '@/data/locations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BillingPage = ({ company, onPaymentSuccess, initialPlanId, onBackToLanding }) => {
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
    if (isNaN(numericValue)) return "CLP $0";
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
        console.error("Error fetching plans:", error);
        toast({
          title: "Error al cargar planes",
          description: "No se pudieron obtener los planes desde la base de datos.",
          variant: "destructive",
        });
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [toast, initialPlanId, company]);
  
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
      } catch(error) {
        console.error("Error fetching pricing details:", error);
        toast({ title: "Error", description: "No se pudo calcular el precio del plan.", variant: "destructive" });
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
      setBillingDetails(prev => ({ ...prev, email: company.email }));
    }
  }, [company]);

  const handleInputChange = (setter, field, value) => {
    setter(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!billingDetails.fullName || !billingDetails.address || !billingDetails.region || !billingDetails.comuna || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
      toast({ title: "Campos incompletos", description: "Por favor, completa todos los campos de facturación y tarjeta.", variant: "destructive" });
      setLoading(false);
      return;
    }

    try {
      // In a real scenario, you would use DLocalGo's JS library to tokenize the card details securely on the client-side.
      // For this simulation, we'll just create a mock token.
      const mockCardToken = `tok_card_${Math.random().toString(36).substring(2, 15)}`;

      const { data: rpcData, error: rpcError } = await supabase.rpc('process_dlocalgo_payment', {
        p_company_id: company.id,
        p_amount: pricingDetails.totalCost,
        p_currency: 'CLP',
        p_card_token: mockCardToken,
        p_payer_email: billingDetails.email,
        p_billing_details: billingDetails,
        p_new_plan_id: selectedPlanId
      });

      if (rpcError) throw rpcError;

      if (rpcData.success) {
        toast({
          title: "¡Pago Exitoso!",
          description: "Tu plan ha sido activado. Serás redirigido al dashboard.",
          duration: 5000,
        });
        onPaymentSuccess();
      } else {
        throw new Error(rpcData.message || "El pago fue rechazado.");
      }
    } catch (error) {
      console.error('Error en el pago:', error);
      toast({
        title: "Error en el Pago",
        description: error.message || "No se pudo procesar tu pago. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingPlans || !plans.length || !selectedPlanId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
        <p className="ml-4">Cargando información del plan...</p>
      </div>
    );
  }

  const selectedPlanDetails = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl w-full">
        <form onSubmit={handlePayment}>
          <Card className="glass-effect w-full shadow-2xl overflow-hidden">
            <CardHeader className="text-center p-8 bg-gray-50/50">
              <CreditCard className="mx-auto h-12 w-12 text-purple-600" />
              <CardTitle className="mt-4 text-3xl font-extrabold gradient-text">Datos de Facturación</CardTitle>
              <CardDescription className="mt-2 text-xl text-gray-600">Estás a un paso de activar tu plan.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2 text-gray-700">Detalles del Titular</h3>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input required placeholder="Nombre Completo" value={billingDetails.fullName} onChange={e => handleInputChange(setBillingDetails, 'fullName', e.target.value)} className="pl-10" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input required type="email" placeholder="Email de Contacto" value={billingDetails.email} onChange={e => handleInputChange(setBillingDetails, 'email', e.target.value)} className="pl-10" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input required placeholder="Teléfono" value={billingDetails.phone} onChange={e => handleInputChange(setBillingDetails, 'phone', e.target.value)} className="pl-10" />
                </div>
                <h3 className="text-lg font-semibold border-b pb-2 pt-4 text-gray-700">Dirección de Facturación</h3>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input required placeholder="Calle y Número" value={billingDetails.address} onChange={e => handleInputChange(setBillingDetails, 'address', e.target.value)} className="pl-10" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select required value={billingDetails.region} onValueChange={(value) => { handleInputChange(setBillingDetails, 'region', value); handleInputChange(setBillingDetails, 'comuna', ''); }}>
                      <SelectTrigger><SelectValue placeholder="Selecciona Región" /></SelectTrigger>
                      <SelectContent>
                          {regionesData.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                  </Select>
                  <Select required value={billingDetails.comuna} onValueChange={(value) => handleInputChange(setBillingDetails, 'comuna', value)} disabled={!billingDetails.region}>
                      <SelectTrigger><SelectValue placeholder="Selecciona Comuna" /></SelectTrigger>
                      <SelectContent>
                          {comunasData[billingDetails.region]?.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-6 flex flex-col justify-between bg-purple-50/50 p-6 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold border-b pb-2 text-gray-700">Resumen del Pedido</h3>
                  <div className="mt-4">
                      <Select onValueChange={setSelectedPlanId} value={selectedPlanId}>
                        <SelectTrigger className="w-full text-base font-semibold">
                          <SelectValue placeholder="Selecciona un plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map(plan => (
                            <SelectItem key={plan.id} value={plan.id}>
                              <div className="flex justify-between w-full">
                                <span>{plan.name}</span>
                                <span className="font-bold">{formatCLP(plan.price)} {plan.price_description || '/mes'}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  <div className="p-4 rounded-xl space-y-2 mt-4">
                    {loading && !pricingDetails ? (
                      <div className="flex justify-center items-center h-24"><Loader2 className="animate-spin h-6 w-6" /></div>
                    ) : pricingDetails && (
                      <>
                        <div className="flex justify-between text-gray-600">
                          <span>Plan Base ({selectedPlanDetails?.name})</span>
                          <span>{formatCLP(pricingDetails.baseCost)}</span>
                        </div>
                        {pricingDetails.additionalLocalesCount > 0 && (
                          <div className="flex justify-between text-gray-600">
                            <span>{pricingDetails.additionalLocalesCount} locales adicionales</span>
                            <span>{formatCLP(pricingDetails.additionalLocalesCount * pricingDetails.costPerLocale)}</span>
                          </div>
                        )}
                        {pricingDetails.additionalOnlineRubrosCount > 0 && (
                          <div className="flex justify-between text-gray-600">
                           <span>{pricingDetails.additionalOnlineRubrosCount} rubros online adicionales</span>
                           <span>{formatCLP(pricingDetails.additionalOnlineRubrosCount * pricingDetails.costPerOnlineRubro)}</span>
                          </div>
                        )}
                        <div className="border-t my-2 border-gray-200"></div>
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total a Pagar Mensual</span>
                          <span>{formatCLP(pricingDetails.totalCost)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold border-b pb-2 pt-4 text-gray-700">Detalles de Pago</h3>
                  <div className="space-y-4 mt-4">
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input required placeholder="Número de Tarjeta" value={cardDetails.number} onChange={e => handleInputChange(setCardDetails, 'number', e.target.value)} className="pl-10" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input required placeholder="MM/AA" value={cardDetails.expiry} onChange={e => handleInputChange(setCardDetails, 'expiry', e.target.value)} />
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input required placeholder="CVC" value={cardDetails.cvc} onChange={e => handleInputChange(setCardDetails, 'cvc', e.target.value)} className="pl-10" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Button type="submit" className="w-full text-lg" disabled={loading || !pricingDetails}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Pagar y Activar Plan
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 bg-gray-50/50 flex justify-start">
              <motion.button
                type="button"
                onClick={onBackToLanding}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al Inicio
              </motion.button>
            </CardFooter>
          </Card>
        </form>
      </motion.div>
    </div>
  );
};

export default BillingPage;