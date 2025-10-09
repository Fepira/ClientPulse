import React, { useState, useEffect, useCallback } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Label } from '@/components/ui/label';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';
    import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
    import { AlertCircle, Loader2 } from 'lucide-react';

    const AssignSurveyByLocationModal = ({ isOpen, setIsOpen, company, activeRubro, surveyToAssign, onAssigned }) => {
      const { toast } = useToast();
      const [locations, setLocations] = useState([]);
      const [selectedLocations, setSelectedLocations] = useState({});
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        if (isOpen && company) {
          const physicalLocations = company.locations?.filter(l => l.rubro === activeRubro).map(l => l.address) || [];
          const onlineRubros = company.rubros?.filter(r => r.toLowerCase().includes('online') && r === activeRubro) || [];
          const allPossibleLocations = [...physicalLocations, ...onlineRubros];
          setLocations(allPossibleLocations);
          setLoading(false);
        }
      }, [isOpen, company, activeRubro]);

      const handleSelectionChange = (locationName) => {
        setSelectedLocations(prev => ({
          ...prev,
          [locationName]: !prev[locationName]
        }));
      };

      const handleAssign = async () => {
        setLoading(true);
        const locationsToAssign = Object.keys(selectedLocations).filter(key => selectedLocations[key]);

        if (locationsToAssign.length === 0) {
          toast({ variant: 'destructive', title: 'Error', description: 'Debes seleccionar al menos un local.' });
          setLoading(false);
          return;
        }

        try {
          const { data: companySurvey, error: csError } = await supabase
            .from('company_surveys')
            .insert({ company_id: company.id, survey_id: surveyToAssign.id, rubro: activeRubro })
            .select()
            .single();

          if (csError && csError.code !== '23505') throw csError;
          
          let companySurveyId = companySurvey?.id;
          if(csError?.code === '23505') {
            const {data: existingCs} = await supabase.from('company_surveys').select('id').eq('company_id', company.id).eq('survey_id', surveyToAssign.id).eq('rubro', activeRubro).single();
            companySurveyId = existingCs.id;
          }

          if (!companySurveyId) throw new Error("No se pudo crear o encontrar la asociación de encuesta.");

          const locationEntries = locationsToAssign.map(loc => ({
            company_survey_id: companySurveyId,
            location_name: loc,
            is_online_rubro: loc.toLowerCase().includes('online'),
            is_active: true,
            collection_method: loc.toLowerCase().includes('online') ? 'link' : 'qr_code',
          }));

          const { data: newLocations, error: locError } = await supabase
            .from('company_survey_locations')
            .insert(locationEntries)
            .select();

          if (locError) throw locError;

          const getBaseUrl = () => `${window.location.protocol}//${window.location.host}`;
          const baseUrl = getBaseUrl();

          const updatePromises = newLocations.map(loc => {
            const surveyUrl = `${baseUrl}/#/survey/${loc.id}`;
            return supabase
              .from('company_survey_locations')
              .update({ collection_link: surveyUrl, collection_qr_code: surveyUrl })
              .eq('id', loc.id);
          });

          await Promise.all(updatePromises);

          toast({ title: 'Éxito', description: 'Encuesta asignada a los locales seleccionados.' });
          onAssigned();
          setIsOpen(false);

        } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: `No se pudo asignar la encuesta: ${error.message}` });
        } finally {
          setLoading(false);
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Asignar "{surveyToAssign?.title}"</DialogTitle>
              <DialogDescription>Selecciona los locales o canales a los que quieres asignar esta encuesta.</DialogDescription>
            </DialogHeader>
            {loading ? <LoadingSpinner /> : (
              <div className="py-4 space-y-4 max-h-[50vh] overflow-y-auto">
                {locations.length > 0 ? locations.map(loc => (
                  <div key={loc} className="flex items-center space-x-2">
                    <Checkbox
                      id={loc}
                      checked={!!selectedLocations[loc]}
                      onCheckedChange={() => handleSelectionChange(loc)}
                    />
                    <Label htmlFor={loc}>{loc}</Label>
                  </div>
                )) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No hay locales</AlertTitle>
                    <AlertDescription>
                      No se encontraron locales para el rubro "{activeRubro}". Añádelos en la configuración.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <Button onClick={handleAssign} disabled={loading || locations.length === 0}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                Asignar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default AssignSurveyByLocationModal;