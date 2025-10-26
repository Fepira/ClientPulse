import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import Step1_BasicInfo from '@/components/admin/surveys/Step1_BasicInfo';
import Step2_Rubros from '@/components/admin/surveys/Step2_Rubros';
import Step3_Questions from '@/components/admin/surveys/Step3_Questions';
import Step4_Review from '@/components/admin/surveys/Step4_Review';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const SurveyEditor = ({ survey, rubrosList, onSave, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    associated_rubros: [],
    questions: [],
    is_active: false,
    thank_you_message: { title: '¡Encuesta Enviada!', body: '¡Muchas gracias por tu tiempo y tus valiosos comentarios!' },
  });

  useEffect(() => {
    const fetchQuestions = async (surveyId) => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('survey_id', surveyId)
        .order('order_index');
      
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las preguntas.' });
        return [];
      }
      
      return data.map(q => ({
        id: q.id,
        question: q.question_text,
        type: q.question_type,
        scale: q.scale,
        options: q.options?.options || [],
        classification_options: q.options?.items_to_evaluate || [],
        classification_title: q.options?.classification_title || q.question_text,
        na_option: q.na_option,
        is_demographic: q.is_demographic,
      }));
    };

    if (survey) {
      fetchQuestions(survey.id).then(questions => {
        setFormData({
          id: survey.id,
          title: survey.title || '',
          description: survey.description || '',
          associated_rubros: survey.associated_rubros || [],
          questions: questions,
          is_active: survey.is_active || false,
          thank_you_message: survey.thank_you_message || { title: '¡Encuesta Enviada!', body: '¡Muchas gracias por tu tiempo y tus valiosos comentarios!' },
        });
      });
    } else {
      setFormData({
        id: null,
        title: '',
        description: '',
        associated_rubros: [],
        questions: [],
        is_active: false,
        thank_you_message: { title: '¡Encuesta Enviada!', body: '¡Muchas gracias por tu tiempo y tus valiosos comentarios!' },
      });
    }
  }, [survey, toast]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setCurrentStep(s => Math.min(s + 1, 4));
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

  const handleDownloadExistingTemplate = () => {
    if (!survey) return;

    const header = ['title', 'description', 'question', 'type', 'scale', 'options', 'classification_title', 'classification_options', 'na_option', 'is_demographic'];
    
    const data = formData.questions.map((q, index) => {
      const row = {
        title: index === 0 ? formData.title : '',
        description: index === 0 ? formData.description : '',
        question: q.question,
        type: q.type,
        scale: q.type === 'rating' ? q.scale : '',
        options: (q.type === 'multiple-choice' || q.type === 'gender' || q.type === 'age_range') && q.options ? q.options.map(opt => `${opt.id}:${opt.text}`).join(';') : '',
        classification_title: q.type === 'classification' ? q.classification_title : '',
        classification_options: q.type === 'classification' && q.classification_options ? q.classification_options.map(opt => opt.text).join(';') : '',
        na_option: q.na_option ? 'TRUE' : 'FALSE',
        is_demographic: q.is_demographic ? 'TRUE' : 'FALSE',
      };
      return Object.values(row);
    });

    // Crear la hoja de cálculo con estilos
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    
    // Aplicar estilos al encabezado
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } },
      alignment: { horizontal: "center", vertical: "center" }
    };
    
    // Aplicar estilos a las celdas del encabezado
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      worksheet[address].s = headerStyle;
    }

    // Aplicar estilos a las celdas de datos
    for (let R = 1; R <= range.e.r; ++R) {
      for (let C = 0; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: R, c: C });
        if (worksheet[address]) {
          worksheet[address].s = {
            alignment: { horizontal: "left", vertical: "center", wrapText: true }
          };
        }
      }
    }
    
    // Crear y guardar el libro
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PlantillaEncuesta');
    
    // Ajustar el ancho de las columnas automáticamente
    const maxWidth = 50;
    const wscols = header.map(() => ({ wch: maxWidth }));
    worksheet['!cols'] = wscols;
    
    XLSX.writeFile(workbook, `${formData.title.replace(/ /g, '_')}_plantilla.xlsx`);
    toast({
      title: 'Plantilla descargada',
      description: 'La plantilla de la encuesta existente ha sido generada.',
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1_BasicInfo formData={formData} onFormChange={handleFormChange} />;
      case 2:
        return <Step2_Rubros formData={formData} onFormChange={handleFormChange} rubrosList={rubrosList} />;
      case 3:
        return <Step3_Questions formData={formData} onFormChange={handleFormChange} />;
      case 4:
        return <Step4_Review formData={formData} onFormChange={handleFormChange} />;
      default:
        return null;
    }
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{survey ? 'Editar Plantilla de Encuesta' : 'Crear Nueva Plantilla de Encuesta'}</DialogTitle>
      </DialogHeader>
      <div className="py-4">{renderStep()}</div>
      <DialogFooter className="justify-between">
        <div className="flex gap-2">
           {currentStep > 1 && <Button variant="outline" onClick={prevStep}>Anterior</Button>}
           {survey && (
            <Button variant="outline" onClick={handleDownloadExistingTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Descargar Plantilla
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <DialogClose asChild><Button variant="ghost" onClick={onCancel}>Cancelar</Button></DialogClose>
          {currentStep < 4 && <Button onClick={nextStep}>Siguiente</Button>}
          {currentStep === 4 && <Button onClick={() => onSave(formData)}>Guardar Plantilla</Button>}
        </div>
      </DialogFooter>
    </DialogContent>
  );
};

export default SurveyEditor;
