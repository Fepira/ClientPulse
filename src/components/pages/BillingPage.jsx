import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { useBillingLogic } from '@/hooks/useBillingLogic';
import BillingDetailsForm from '@/components/billing/BillingDetailsForm';
import PlanSummary from '@/components/billing/PlanSummary';
import PaymentDetails from '@/components/billing/PaymentDetails';
import BillingFooter from '@/components/billing/BillingFooter';

const BillingPage = ({ company, onPaymentSuccess, initialPlanId, onBackToLanding }) => {
  const {
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
  } = useBillingLogic({ company, initialPlanId, onPaymentSuccess });

  if (loadingPlans || !plans.length || !selectedPlanId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
        <p className="ml-4">Cargando información del plan...</p>
      </div>
    );
  }

  

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
              <BillingDetailsForm
                billingDetails={billingDetails}
                onChange={(field, value) => handleInputChange(setBillingDetails, field, value)}
              />
              <div className="flex flex-col justify-between">
                <PlanSummary
                  plans={plans}
                  selectedPlanId={selectedPlanId}
                  setSelectedPlanId={setSelectedPlanId}
                  loading={loading}
                  pricingDetails={pricingDetails}
                  formatCLP={formatCLP}
                  selectedPlanDetails={selectedPlanDetails}
                />
                <PaymentDetails
                  cardDetails={cardDetails}
                  onChange={(field, value) => handleInputChange(setCardDetails, field, value)}
                />
                <div className="mt-8">
                  <Button type="submit" className="w-full text-lg" disabled={loading || !pricingDetails}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Pagar y Activar Plan
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <BillingFooter onBackToLanding={onBackToLanding} />
            </CardFooter>
          </Card>
        </form>
      </motion.div>
    </div>
  );
};

export default BillingPage;