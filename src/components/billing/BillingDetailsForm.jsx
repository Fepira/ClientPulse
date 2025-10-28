import React from 'react';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { regionesData, comunasData } from '@/data/locations';

export default function BillingDetailsForm({ billingDetails, onChange }) {
  const handle = (field) => (eOrVal) => {
    const value = eOrVal?.target ? eOrVal.target.value : eOrVal;
    onChange(field, value);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2 text-gray-700">Detalles del Titular</h3>
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input required placeholder="Nombre Completo" value={billingDetails.fullName} onChange={handle('fullName')} className="pl-10" />
      </div>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input required type="email" placeholder="Email de Contacto" value={billingDetails.email} onChange={handle('email')} className="pl-10" />
      </div>
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input required placeholder="Teléfono" value={billingDetails.phone} onChange={handle('phone')} className="pl-10" />
      </div>
      <h3 className="text-lg font-semibold border-b pb-2 pt-4 text-gray-700">Dirección de Facturación</h3>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input required placeholder="Calle y Número" value={billingDetails.address} onChange={handle('address')} className="pl-10" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select required value={billingDetails.region} onValueChange={(value) => { onChange('region', value); onChange('comuna', ''); }}>
          <SelectTrigger><SelectValue placeholder="Selecciona Región" /></SelectTrigger>
          <SelectContent>
            {regionesData.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select required value={billingDetails.comuna} onValueChange={(value) => onChange('comuna', value)} disabled={!billingDetails.region}>
          <SelectTrigger><SelectValue placeholder="Selecciona Comuna" /></SelectTrigger>
          <SelectContent>
            {comunasData[billingDetails.region]?.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}