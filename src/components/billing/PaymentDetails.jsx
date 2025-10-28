import React from 'react';
import { Input } from '@/components/ui/input';
import { CreditCard, Lock } from 'lucide-react';

export default function PaymentDetails({ cardDetails, onChange }) {
  const handle = (field) => (e) => onChange(field, e.target.value);

  return (
    <div>
      <h3 className="text-lg font-semibold border-b pb-2 pt-4 text-gray-700">Detalles de Pago</h3>
      <div className="space-y-4 mt-4">
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input required placeholder="Número de Tarjeta" value={cardDetails.number} onChange={handle('number')} className="pl-10" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input required placeholder="MM/AA" value={cardDetails.expiry} onChange={handle('expiry')} />
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input required placeholder="CVC" value={cardDetails.cvc} onChange={handle('cvc')} className="pl-10" />
          </div>
        </div>
      </div>
    </div>
  );
}