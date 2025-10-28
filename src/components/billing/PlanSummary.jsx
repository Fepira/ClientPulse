import React from 'react';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PlanSummary({ plans, selectedPlanId, setSelectedPlanId, loading, pricingDetails, formatCLP, selectedPlanDetails }) {
  return (
    <div className="space-y-6 flex flex-col justify-between bg-purple-50/50 p-6 rounded-lg">
      <div>
        <h3 className="text-lg font-semibold border-b pb-2 text-gray-700">Resumen del Pedido</h3>
        <div className="mt-4">
          <Select onValueChange={setSelectedPlanId} value={selectedPlanId}>
            <SelectTrigger className="w-full text-base font-semibold">
              <SelectValue placeholder="Selecciona un plan" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
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
      </div>
    </div>
  );
}