import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function AppSettings({ company, onCompanyUpdate }) {
  const { toast } = useToast();
  
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Configuración de la Aplicación</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="language">Idioma de la Interfaz</Label>
          <Select defaultValue="es" onValueChange={() => toast({
            title: "🚧 Esta función no está implementada aún",
            description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀"
          })}>
            <SelectTrigger id="language" className="w-[180px]">
              <SelectValue placeholder="Selecciona un idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Rubro management has been moved to BusinessInfo.jsx for a better user experience */}
      </div>
    </div>
  );
}

export default AppSettings;