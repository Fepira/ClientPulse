import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const SurveyImporter = ({ survey, rubrosList, onSave, onCancel }) => {
  const [selectedRubros, setSelectedRubros] = useState([]);

  useEffect(() => {
    if (survey) {
      setSelectedRubros(survey.associated_rubros || []);
    }
  }, [survey]);

  if (!survey) return null;

  const handleRubroToggle = (rubroName) => {
    setSelectedRubros(prev =>
      prev.includes(rubroName)
        ? prev.filter(r => r !== rubroName)
        : [...prev, rubroName]
    );
  };

  const handleSave = () => {
    onSave({ ...survey, associated_rubros: selectedRubros });
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Importar Plantilla de Encuesta</DialogTitle>
      </DialogHeader>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa de la Encuesta</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Título:</strong> {survey.title}</p>
            <p><strong>Descripción:</strong> {survey.description}</p>
            <p><strong>N° de Preguntas:</strong> {survey.questions.length}</p>
          </CardContent>
        </Card>
        
        <div>
          <Label className="font-semibold">Asociar a Rubros</Label>
          <p className="text-sm text-muted-foreground">Selecciona los rubros para esta plantilla.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {rubrosList.map(rubro => (
              <Button
                key={rubro.id}
                variant={selectedRubros.includes(rubro.name) ? 'default' : 'outline'}
                onClick={() => handleRubroToggle(rubro.name)}
              >
                {rubro.name}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>
      <DialogFooter>
        <DialogClose asChild><Button variant="ghost" onClick={onCancel}>Cancelar</Button></DialogClose>
        <Button onClick={handleSave}>Guardar Plantilla Importada</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default SurveyImporter;