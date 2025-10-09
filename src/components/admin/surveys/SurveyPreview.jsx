import React, { useState, useEffect } from 'react';
    import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import SurveyQuestion from '@/components/survey/SurveyQuestion';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    
    const SurveyPreview = ({ survey, onClose }) => {
      const [questions, setQuestions] = useState([]);
      const [companyData, setCompanyData] = useState(null);
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();
    
      useEffect(() => {
        const fetchSurveyDetails = async () => {
          if (!survey) {
            setLoading(false);
            return;
          }
          setLoading(true);
          try {
            // If it's a template preview from admin
            if (survey.is_template) {
                const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('survey_id', survey.id)
                .eq('is_active', true)
                .order('order_index');
                
                if (error) throw new Error('No se pudieron cargar las preguntas de la plantilla.');
                setQuestions(data || []);
            } else { // If it's a live survey preview from user dashboard
                const { data, error } = await supabase.rpc('get_survey_for_location', {
                    p_company_survey_location_id: survey.id // In this context, survey.id is company_survey_locations.id
                });
                if(error) throw error;
                if(!data) throw new Error("No se pudo cargar la vista previa de la encuesta.");
                setQuestions(data.questions || []);
                setCompanyData(data.survey || null);
            }
          } catch (err) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: err.message,
            });
            setQuestions([]);
          } finally {
            setLoading(false);
          }
        };
    
        fetchSurveyDetails();
      }, [survey, toast]);
    
      if (!survey) return null;
    
      const finalQuestions = questions.sort((a, b) => {
        const orderA = a.sort_order || a.order_index || 0;
        const orderB = b.sort_order || b.order_index || 0;
        return orderA - orderB;
      });

      return (
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vista Previa: {survey.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto px-6">
            {survey.show_company_logo && companyData?.logo_url && (
                <div className="flex justify-center mb-6">
                    <img src={companyData.logo_url} alt="Logo de la empresa" className="h-16 max-w-xs object-contain" />
                </div>
            )}
            <p className="text-center text-muted-foreground">{survey.description}</p>
            
            {loading ? (
              <LoadingSpinner text="Cargando preguntas..." />
            ) : (
              <div className="space-y-8">
                {finalQuestions.length > 0 ? (
                  finalQuestions.map((q, index) => (
                    <div key={q.id} className="p-4 border rounded-lg shadow-sm bg-gray-50/50">
                        <SurveyQuestion
                          question={q}
                          index={index}
                          onAnswer={() => {}}
                          currentAnswer={null}
                          styles={{
                            primaryText: 'text-gray-800',
                          }}
                        />
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">Esta encuesta aún no tiene preguntas activas.</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={onClose}>Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      );
    };
    
    export default SurveyPreview;