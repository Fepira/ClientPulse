import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const Step4_Review = ({ formData, onFormChange }) => {
  const rubros = formData.associated_rubros || [];

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h3 className="text-lg font-semibold">Paso 4: Revisión y Publicación</h3>
      <Card>
        <CardContent className="p-4 space-y-2">
          <p><strong>Título:</strong> {formData.title}</p>
          <p><strong>Descripción:</strong> {formData.description}</p>
          <p><strong>Rubros:</strong> {rubros.length > 0 ? rubros.join(', ') : 'Ninguno'}</p>
          <p><strong>N° de Preguntas:</strong> {formData.questions.length}</p>
        </CardContent>
      </Card>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => onFormChange('is_active', e.target.checked)}
        />
        <Label htmlFor="is_active">Marcar como activa al guardar</Label>
      </div>
    </motion.div>
  );
};

export default Step4_Review;