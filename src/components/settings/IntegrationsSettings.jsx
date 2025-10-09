import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

function IntegrationsSettings() {
  const { toast } = useToast();

  const handleConfigureClick = () => {
    toast({
      title: "🚧 Esta función no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀"
    });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Integraciones</h3>
      <p className="text-gray-600">
        Aquí podrás gestionar las integraciones con tus sistemas de e-commerce, CRM y POS.
      </p>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
          <span>Integración con E-commerce</span>
          <Button variant="outline" onClick={handleConfigureClick}>Configurar</Button>
        </div>
        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
          <span>Integración con CRM</span>
          <Button variant="outline" onClick={handleConfigureClick}>Configurar</Button>
        </div>
        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
          <span>Integración con POS</span>
          <Button variant="outline" onClick={handleConfigureClick}>Configurar</Button>
        </div>
      </div>
    </div>
  );
}

export default IntegrationsSettings;