import React, { useState, useEffect } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Input } from '@/components/ui/input';
    import { Search } from 'lucide-react';
    import SurveyActions from '@/components/admin/surveys/SurveyActions';
    import SurveyTable from '@/components/admin/surveys/SurveyTable';
    import SurveyModals from '@/components/admin/surveys/SurveyModals';
    import * as XLSX from 'xlsx-js-style';
    
    const SurveyManagement = ({ surveys, rubros, onUpdate }) => {
      const { toast } = useToast();
      const [searchTerm, setSearchTerm] = useState('');
      const [isEditorOpen, setIsEditorOpen] = useState(false);
      const [editingSurvey, setEditingSurvey] = useState(null);
      const [isImporterOpen, setIsImporterOpen] = useState(false);
      const [importedSurvey, setImportedSurvey] = useState(null);
      const [isPreviewOpen, setIsPreviewOpen] = useState(false);
      const [previewingSurvey, setPreviewingSurvey] = useState(null);
      const [questionsCount, setQuestionsCount] = useState({});
      const [isUploading, setIsUploading] = useState(false);
    
      useEffect(() => {
        const fetchCounts = async () => {
          if (surveys.length > 0) {
            const surveyIds = surveys.map(s => s.id);
            const { data, error } = await supabase
              .from('questions')
              .select('survey_id, id')
              .in('survey_id', surveyIds);
    
            if (error) {
              console.error("Error fetching question counts:", error);
              return;
            }
    
            const counts = data.reduce((acc, q) => {
              acc[q.survey_id] = (acc[q.survey_id] || 0) + 1;
              return acc;
            }, {});
            setQuestionsCount(counts);
          }
        };
        fetchCounts();
      }, [surveys]);
    
      const filteredSurveys = surveys.filter(survey =>
        survey.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
      const getOptionsForQuestion = (q) => {
        let options = {};
        if (q.type === 'multiple-choice' || q.type === 'gender' || q.type === 'age_range') {
          options.options = q.options.map(opt => ({ id: opt.id, text: opt.text }));
        } else if (q.type === 'classification') {
          options.items_to_evaluate = q.classification_options.map(opt => ({ id: opt.id, text: opt.text }));
          options.classification_title = q.classification_title || q.question;
        }
        return options;
      };
      
      const handleSaveSurvey = async (formData) => {
        const rpcToCall = formData.id ? 'update_survey_template' : 'create_survey_template_from_import';
      
        const params = {
          p_title: formData.title,
          p_description: formData.description,
          p_thank_you_message: formData.thank_you_message,
          p_is_active: formData.is_active,
          p_associated_rubros: formData.associated_rubros,
          p_questions: formData.questions.map((q, index) => ({
            order_index: index,
            question_text: q.question,
            question_type: q.type,
            scale: q.scale || null,
            options: getOptionsForQuestion(q),
            na_option: q.na_option || false,
            is_demographic: q.is_demographic || false,
          })),
        };
      
        if (formData.id) {
          params.p_survey_id = formData.id;
        }
      
        const { error } = await supabase.rpc(rpcToCall, params);
    
        if (error) {
          toast({ variant: 'destructive', title: 'Error al guardar encuesta', description: error.message });
          return;
        }
    
        toast({ title: 'Éxito', description: 'Plantilla de encuesta guardada.' });
        onUpdate();
        setIsEditorOpen(false);
        setEditingSurvey(null);
        setIsImporterOpen(false);
        setImportedSurvey(null);
      };
    
      const handleDelete = async (surveyId) => {
        const { error } = await supabase.from('surveys').delete().eq('id', surveyId);
        if (error) {
          toast({ variant: 'destructive', title: 'Error al eliminar', description: error.message });
        } else {
          toast({ title: 'Éxito', description: 'Encuesta eliminada.' });
          onUpdate();
        }
      };
    
      const handleToggleStatus = async (survey) => {
        const newStatus = !survey.is_active;
        const { error } = await supabase.rpc('toggle_survey_and_locations_status', {
          p_survey_id: survey.id,
          p_is_active: newStatus
        });
    
        if (error) {
          toast({ variant: 'destructive', title: 'Error al actualizar', description: error.message });
        } else {
          toast({ title: 'Éxito', description: `Estado de la encuesta y sus locales asociados actualizado.` });
          onUpdate();
        }
      };

      const handleDuplicateSurvey = async (surveyId) => {
        const { error } = await supabase.rpc('duplicate_survey_template', { source_survey_id: surveyId });
        if (error) {
          toast({ variant: 'destructive', title: 'Error al duplicar', description: error.message });
        } else {
          toast({ title: 'Éxito', description: 'Plantilla duplicada correctamente.' });
          onUpdate();
        }
      };
    
      const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
    
        try {
          const { data, error } = await supabase.functions.invoke('import-survey-template', {
            body: formData,
          });
    
          if (error) throw error;
          
          toast({
            title: 'Éxito',
            description: `Plantilla "${data.survey.title}" importada correctamente.`,
          });
          onUpdate();
    
        } catch (e) {
          const errorData = e.data || {};
          toast({
            variant: 'destructive',
            title: 'Error al importar',
            description: errorData.error || e.message || 'No se pudo procesar el archivo en el servidor.',
          });
        } finally {
          setIsUploading(false);
          event.target.value = '';
        }
      };
    
      const handleDownloadTemplate = () => {
        const header = [
          'question_text', 'question_type', 'scale', 'options', 'classification_items', 'na_option', 'is_demographic',
          'title', 'description', 'associated_rubros'
        ];
        const data = [
          ['¿Cómo calificarías nuestro servicio?', 'rating', 5, '', '', 'TRUE', 'FALSE', 'Encuesta General de Restaurante', 'Mide la satisfacción del cliente con nuestros servicios.', 'Restaurante;Cafetería'],
          ['En una escala de 0 a 10, ¿qué tan probable es que recomiendes nuestra empresa?', 'rating', 10, '', '', 'TRUE', 'FALSE', '', '', ''],
          ['', 'classification', '', '', 'Atención del Personal:Amabilidad del personal;Rapidez en la atención', 'TRUE', 'FALSE', '', '', ''],
          ['', 'classification', '', '', 'Calidad de los Productos:Sabor de la comida;Presentación de los platos', 'TRUE', 'FALSE', '', '', ''],
          ['¿Cuál es tu género?', 'gender', '', 'masculino:Masculino;femenino:Femenino;otro:Otro', '', 'FALSE', 'TRUE', '', '', ''],
          ['¿Cuál es tu rango de edad?', 'age_range', '', '18-24:18-24 años;25-34:25-34 años;35-44:35-44 años;45-54:45-54 años;55-mas:55+ años', '', 'FALSE', 'TRUE', '', '', ''],
          ['¿Qué producto te gustó más?', 'multiple-choice', '', 'cafe_americano:Café Americano;torta_chocolate:Torta de Chocolate;jugo_natural:Jugo Natural', '', 'FALSE', 'FALSE', '', '', ''],
        ];
        
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
        
        // Crear y guardar el libro
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'PlantillaEncuesta');
        
        // Ajustar el ancho de las columnas automáticamente
        const maxWidth = 50;
        const wscols = header.map(() => ({ wch: maxWidth }));
        worksheet['!cols'] = wscols;
        
        XLSX.writeFile(workbook, 'Plantilla_Encuesta_Avanzada.xlsx');
        toast({
          title: 'Plantilla descargada',
          description: 'El archivo .xlsx con el nuevo formato ha sido generado.',
        });
      };
    
      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar plantillas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <SurveyActions 
              onDownloadTemplate={handleDownloadTemplate}
              onFileUpload={handleFileUpload}
              onNewSurvey={() => { setEditingSurvey(null); setIsEditorOpen(true); }}
              isUploading={isUploading}
            />
          </div>
    
          <SurveyTable 
            surveys={filteredSurveys}
            questionsCount={questionsCount}
            onPreview={(survey) => { setPreviewingSurvey(survey); setIsPreviewOpen(true); }}
            onEdit={(survey) => { setEditingSurvey(survey); setIsEditorOpen(true); }}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onDuplicate={handleDuplicateSurvey}
          />
          
          {filteredSurveys.length === 0 && <p className="text-center text-gray-500 py-4">No se encontraron plantillas de encuestas.</p>}
    
          <SurveyModals 
            isEditorOpen={isEditorOpen}
            setIsEditorOpen={setIsEditorOpen}
            editingSurvey={editingSurvey}
            setEditingSurvey={setEditingSurvey}
            rubros={rubros}
            handleSaveSurvey={handleSaveSurvey}
            isImporterOpen={isImporterOpen}
            setIsImporterOpen={setIsImporterOpen}
            importedSurvey={importedSurvey}
            setImportedSurvey={setImportedSurvey}
            isPreviewOpen={isPreviewOpen}
            setIsPreviewOpen={setIsPreviewOpen}
            previewingSurvey={previewingSurvey}
          />
        </div>
      );
    };
    
    export default SurveyManagement;