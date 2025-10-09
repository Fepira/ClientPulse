import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Step2_Rubros = ({ formData, onFormChange, rubrosList }) => {
  const handleRubroToggle = (rubroName) => {
    const currentRubros = formData.associated_rubros || [];
    const newRubros = currentRubros.includes(rubroName)
      ? currentRubros.filter(r => r !== rubroName)
      : [...currentRubros, rubroName];
    onFormChange('associated_rubros', newRubros);
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h3 className="text-lg font-semibold">Paso 2: Asociación a Rubros</h3>
      <p className="text-sm text-muted-foreground">Selecciona los rubros donde esta plantilla estará disponible.</p>
      <div className="flex flex-wrap gap-2">
        {rubrosList.map(rubro => (
          <Button
            key={rubro.id}
            variant={(formData.associated_rubros || []).includes(rubro.name) ? 'default' : 'outline'}
            onClick={() => handleRubroToggle(rubro.name)}
          >
            {rubro.name}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

export default Step2_Rubros;