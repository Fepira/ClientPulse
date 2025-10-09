import React, { useState, useEffect, useCallback, useMemo } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Switch } from '@/components/ui/switch';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { useTestMode } from '@/contexts/TestModeContext';
    import { Button } from '@/components/ui/button';
    import { Trash2, Loader2 } from 'lucide-react';
    import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
      AlertDialogTrigger,
    } from '@/components/ui/alert-dialog';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

    const QuestionActivation = ({ question, locationId, onUpdate }) => {
      const { toast } = useToast();
      const [isActive, setIsActive] = useState(true);
      const [loading, setLoading] = useState(false);

      const isCritical = question.order_index === 0 || question.order_index === 1 || question.is_demographic;

      useEffect(() => {
        setIsActive(question.is_active_for_location);
      }, [question.is_active_for_location]);

      const handleToggle = async (checked) => {
        if (isCritical || !locationId) return;
        setLoading(true);
        setIsActive(checked);

        try {
          const { error } = await supabase.from('survey_location_question_settings').upsert(
            {
              company_survey_location_id: locationId,
              question_id: question.id,
              is_active: checked,
            },
            { onConflict: 'company_survey_location_id, question_id' }
          );

          if (error) throw error;
          toast({ title: 'Éxito', description: 'Configuración de pregunta guardada.' });
          if(onUpdate) onUpdate(locationId);
        } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la configuración.' });
          setIsActive(!checked);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="flex items-center justify-between p-3 border-t">
          <p className={`text-sm ${isCritical ? 'text-muted-foreground' : ''}`}>{question.question_text}</p>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> :
            <Switch
              checked={isActive}
              onCheckedChange={handleToggle}
              disabled={isCritical || loading || !locationId}
              aria-label={`Activar/desactivar pregunta: ${question.question_text}`}
            />
          }
        </div>
      );
    };

    const AssignedSurveyManager = ({ assignedSurveys, isProfessionalPlan, isCurrentRubroPhysical, onUpdate }) => {
      const { toast } = useToast();
      const { isTestMode } = useTestMode();
      const [questionsBySurvey, setQuestionsBySurvey] = useState({});
      const [selectedLocationId, setSelectedLocationId] = useState(null);

      const locations = useMemo(() => {
        const allLocations = assignedSurveys.flatMap(as => as.company_survey_locations);
        const uniqueLocations = Array.from(new Map(allLocations.map(item => [item.id, item])).values());
        return uniqueLocations.filter(loc => isCurrentRubroPhysical ? !loc.is_online_rubro : loc.is_online_rubro);
      }, [assignedSurveys, isCurrentRubroPhysical]);

      useEffect(() => {
        if (locations.length > 0 && !selectedLocationId) {
          setSelectedLocationId(locations[0].id);
        } else if (locations.length === 0) {
            setSelectedLocationId(null);
        }
      }, [locations, selectedLocationId]);
      
      const fetchQuestionsForSurvey = useCallback(async (locationId) => {
        if (assignedSurveys.length === 0) return;
        const surveyIds = assignedSurveys.map(as => as.surveys.id);
        
        let query = supabase
          .from('questions')
          .select(`*, survey_location_question_settings(is_active, company_survey_location_id)`)
          .in('survey_id', surveyIds)
          .order('order_index');

        const { data, error } = await query;
        
        if (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las preguntas.' });
          return;
        }
        
        const questionsMap = assignedSurveys.reduce((acc, as) => {
            const surveyQuestions = data
                .filter(q => q.survey_id === as.surveys.id)
                .map(q => {
                    const settings = q.survey_location_question_settings.find(s => s.company_survey_location_id === locationId);
                    return { ...q, is_active_for_location: settings ? settings.is_active : true };
                });
            acc[as.id] = surveyQuestions;
            return acc;
        }, {});
        
        setQuestionsBySurvey(questionsMap);

      }, [assignedSurveys, toast]);

      useEffect(() => {
        if (assignedSurveys.length > 0 && selectedLocationId) {
          fetchQuestionsForSurvey(selectedLocationId);
        }
      }, [assignedSurveys, selectedLocationId, fetchQuestionsForSurvey]);

      const handleUnassign = async (companySurveyId) => {
        if (isTestMode) {
          toast({ title: "Modo Demo", description: "Acción bloqueada." });
          return;
        }
        const { error } = await supabase.from('company_surveys').delete().eq('id', companySurveyId);
        if (error) {
          toast({ variant: 'destructive', title: 'Error al desasignar', description: error.message });
        } else {
          toast({ title: 'Éxito', description: 'Encuesta desasignada.' });
          onUpdate();
        }
      };

      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Encuestas Asignadas</h3>
            {isCurrentRubroPhysical && locations.length > 0 && (
              <Select value={selectedLocationId || ''} onValueChange={setSelectedLocationId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar Local" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.location_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {assignedSurveys.length > 0 ? assignedSurveys.map(as => {
            const surveyInfo = as.surveys || {};
            return (
              <Card key={as.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{surveyInfo.title}</CardTitle>
                    <CardDescription className="text-xs pt-1">{surveyInfo.description}</CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Desasignar encuesta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará la asociación de "{surveyInfo.title}" a este rubro y todas sus configuraciones. Las respuestas existentes no se borrarán.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleUnassign(as.id)} className="bg-destructive hover:bg-destructive/90">Desasignar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <div>
                    <h4 className="font-medium text-sm mb-2 px-6">Preguntas de la Encuesta</h4>
                    <div className="space-y-1">
                      {(questionsBySurvey[as.id] || []).map(q => (
                        <QuestionActivation key={q.id} question={q} locationId={selectedLocationId} onUpdate={fetchQuestionsForSurvey} />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }) : <p className="text-sm text-muted-foreground text-center py-8">No hay encuestas asignadas.</p>}
        </div>
      );
    };

    export default AssignedSurveyManager;