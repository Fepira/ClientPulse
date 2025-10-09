import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const Step1_BasicInfo = ({ formData, onFormChange }) => {
  const handleThankYouChange = (field, value) => {
    onFormChange('thank_you_message', { ...formData.thank_you_message, [field]: value });
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h3 className="text-lg font-semibold">Paso 1: Información Básica</h3>
      <div className="space-y-2">
        <Label htmlFor="title">Título de la Plantilla</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onFormChange('title', e.target.value)}
          placeholder="Ej: Encuesta de Satisfacción General"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormChange('description', e.target.value)}
          placeholder="Describe brevemente el propósito de esta plantilla de encuesta."
        />
      </div>
      <div className="space-y-2 pt-4 border-t">
        <Label>Mensaje de Agradecimiento</Label>
        <Input
          id="thank_you_title"
          value={formData.thank_you_message.title}
          onChange={(e) => handleThankYouChange('title', e.target.value)}
          placeholder="Título del mensaje de agradecimiento"
          className="mb-2"
        />
        <Textarea
          id="thank_you_body"
          value={formData.thank_you_message.body}
          onChange={(e) => handleThankYouChange('body', e.target.value)}
          placeholder="Cuerpo del mensaje de agradecimiento"
        />
      </div>
    </motion.div>
  );
};

export default Step1_BasicInfo;