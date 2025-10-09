import React, { useState, useEffect, useCallback, useMemo } from 'react';
    import { useToast } from '@/components/ui/use-toast';
    import { useTestMode } from '@/contexts/TestModeContext';
    import { supabase } from '@/lib/customSupabaseClient';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import AssignedSurveyManager from '@/components/dashboard/surveys/AssignedSurveyManager';
    import AvailableSurveyList from '@/components/dashboard/surveys/AvailableSurveyList';
    import AssignSurveyByLocationModal from '@/components/dashboard/surveys/AssignSurveyByLocationModal';
    import { mockAvailableSurveys, mockCompanySurveys } from '@/data/mock-data';

    const ManageSurveysModal = ({ isOpen, setIsOpen, company, activeRubro, isProfessionalPlan, isCurrentRubroPhysical, onUpdate }) => {
      const { toast } = useToast();
      const { isTestMode } = useTestMode();
      const [availableSurveys, setAvailableSurveys] = useState([]);
      const [assignedSurveys, setAssignedSurveys] = useState([]);
      const [loading, setLoading] = useState(true);
      const [isAssignByLocationOpen, setIsAssignByLocationOpen] = useState(false);
      const [selectedSurveyForAssignment, setSelectedSurveyForAssignment] = useState(null);

      const fetchData = useCallback(async () => {
        if (!company?.id || !activeRubro) {
          setLoading(false);
          setAvailableSurveys([]);
          setAssignedSurveys([]);
          return;
        }
        
        setLoading(true);
        if (isTestMode) {
          setAvailableSurveys(mockAvailableSurveys);
          setAssignedSurveys(mockCompanySurveys);
          setLoading(false);
          return;
        }

        try {
          const [templateRes, assignedRes] = await Promise.all([
            supabase
              .from('surveys')
              .select('*')
              .eq('is_template', true)
              .overlaps('associated_rubros', [activeRubro]),
            supabase
              .from('company_surveys')
              .select('*, surveys(*), custom_questions(*), company_survey_locations(*)')
              .eq('company_id', company.id)
              .eq('rubro', activeRubro)
          ]);

          if (templateRes.error) throw templateRes.error;
          if (assignedRes.error) throw assignedRes.error;
          
          setAvailableSurveys(templateRes.data || []);
          setAssignedSurveys(assignedRes.data || []);

        } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: `No se pudieron cargar los datos de encuestas: ${error.message}` });
        } finally {
          setLoading(false);
        }
      }, [company?.id, activeRubro, toast, isTestMode]);

      useEffect(() => {
        if (isOpen) {
          fetchData();
        }
      }, [isOpen, fetchData]);

      const handleAssignToAll = async (survey) => {
        if (isTestMode) {
          toast({ title: "Modo Demo", description: "Acción bloqueada." });
          return;
        }
        setLoading(true);
        const baseUrl = window.location.origin;
        const { error } = await supabase.rpc('assign_survey_to_all_locations', {
          p_company_id: company.id,
          p_survey_id: survey.id,
          p_rubro: activeRubro,
          p_base_url: baseUrl
        });
        setLoading(false);

        if (error) {
          toast({ variant: 'destructive', title: 'Error al asignar', description: error.message });
        } else {
          toast({ title: 'Éxito', description: `"${survey.title}" asignada a todos los locales.` });
          fetchData();
        }
      };

      const handleOpenAssignByLocation = (survey) => {
        setSelectedSurveyForAssignment(survey);
        setIsAssignByLocationOpen(true);
      };

      return (
        <>
          <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setIsOpen(false); onUpdate(); } else { setIsOpen(true); } }}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Configurar Encuestas para <span className="text-purple-600">{activeRubro}</span></DialogTitle>
                <DialogDescription>Asigna plantillas de encuestas a este rubro y gestiona su activación para cada local o canal.</DialogDescription>
              </DialogHeader>
              {loading ? <LoadingSpinner text="Cargando..." fullScreen={false} /> :
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-grow p-1">
                <AssignedSurveyManager
                  assignedSurveys={assignedSurveys}
                  isProfessionalPlan={isProfessionalPlan}
                  isCurrentRubroPhysical={isCurrentRubroPhysical}
                  onUpdate={fetchData}
                />
                <AvailableSurveyList
                  availableSurveys={availableSurveys}
                  assignedSurveys={assignedSurveys}
                  onAssignToAll={handleAssignToAll}
                  onAssignByLocation={handleOpenAssignByLocation}
                />
              </div>
              }
              <DialogFooter>
                  <DialogClose asChild>
                      <Button variant="outline">Cerrar</Button>
                  </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {selectedSurveyForAssignment && (
            <AssignSurveyByLocationModal
              isOpen={isAssignByLocationOpen}
              setIsOpen={setIsAssignByLocationOpen}
              company={company}
              activeRubro={activeRubro}
              surveyToAssign={selectedSurveyForAssignment}
              onAssigned={() => {
                fetchData();
                setSelectedSurveyForAssignment(null);
              }}
            />
          )}
        </>
      )
    }

    export default ManageSurveysModal;