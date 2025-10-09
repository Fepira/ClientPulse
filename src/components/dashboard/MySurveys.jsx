import React, { useState, useEffect, useCallback, useMemo } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { useTestMode } from '@/contexts/TestModeContext';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
    import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
    import { motion, AnimatePresence } from 'framer-motion';
    import { ChevronDown, ChevronUp, QrCode, Link as LinkIcon, Eye, BarChart2, Settings, AlertCircle, Brush, Edit, PlusCircle } from 'lucide-react';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';
    import ManageSurveysModal from '@/components/dashboard/surveys/ManageSurveysModal';
    import QRCode from 'react-qr-code';
    import SurveyPreview from '@/components/admin/surveys/SurveyPreview';
    import { mockCompanySurveyLocations } from '@/data/mock-data';
    import SurveyCustomizationModal from '@/components/dashboard/surveys/SurveyCustomizationModal';
    import CustomQuestionsEditor from '@/components/dashboard/surveys/CustomQuestionsEditor';
    
    const MySurveys = ({ planId, company, user, activeRubro, activeLocale, isCurrentRubroPhysical, onCompanyUpdate }) => {
      const { toast } = useToast();
      const { isTestMode } = useTestMode();
      const [locations, setLocations] = useState([]);
      const [assignedSurveys, setAssignedSurveys] = useState([]);
      const [loading, setLoading] = useState(true);
      const [selectedLocation, setSelectedLocation] = useState('all');
      const [isManageModalOpen, setIsManageModalOpen] = useState(false);
      const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
      const [isCustomQuestionsEditorOpen, setIsCustomQuestionsEditorOpen] = useState(false);
      const [editingSurvey, setEditingSurvey] = useState(null);
      const [expandedLocation, setExpandedLocation] = useState(null);
      const [isCollectionPanelOpen, setIsCollectionPanelOpen] = useState(false);
      const [collectionData, setCollectionData] = useState(null);
      const [isPreviewOpen, setIsPreviewOpen] = useState(false);
      const [previewingSurvey, setPreviewingSurvey] = useState(null);
    
      const isProfessionalPlan = useMemo(() => planId === 'profesional' || planId === 'empresarial', [planId]);
    
      const fetchSurveyData = useCallback(async () => {
        setLoading(true);
        if (isTestMode) {
          const physicalLocations = company.locations?.filter(l => l.rubro === activeRubro).map(l => ({ ...l, isOnline: false })) || [];
          const onlineRubros = company.rubros
            .filter(r => r.toLowerCase().includes('online') && r === activeRubro)
            .map(r => ({ address: r, isOnline: true }));
          
          const allLocations = [...physicalLocations, ...onlineRubros];
          setLocations(allLocations);
          setAssignedSurveys(mockCompanySurveyLocations);
          setLoading(false);
          return;
        }
    
        try {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('locations, rubros')
            .eq('id', company.id)
            .single();
    
          if (companyError) throw companyError;
    
          const physicalLocations = companyData.locations?.filter(l => l.rubro === activeRubro).map(l => ({ ...l, isOnline: false })) || [];
          const onlineRubros = companyData.rubros
            .filter(r => r.toLowerCase().includes('online') && r === activeRubro)
            .map(r => ({ address: r, isOnline: true }));
          
          const allLocations = [...physicalLocations, ...onlineRubros];
          setLocations(allLocations);
    
          const { data: companySurveysResult, error: companySurveysError } = await supabase
            .from('company_surveys')
            .select('id, custom_questions(*)')
            .eq('company_id', company.id)
            .eq('rubro', activeRubro);
    
          if (companySurveysError) throw companySurveysError;
    
          if (companySurveysResult.length === 0) {
            setAssignedSurveys([]);
            setLoading(false);
            return;
          }
          
          const surveyIds = companySurveysResult.map(cs => cs.id);
          
          const { data: locationsData, error: locationsError } = await supabase
            .from('company_survey_locations')
            .select(`
              *,
              company_surveys:company_survey_id (
                id,
                rubro,
                custom_questions(*),
                surveys:survey_id (
                  id,
                  title,
                  description
                )
              )
            `)
            .in('company_survey_id', surveyIds);
    
          if (locationsError) throw locationsError;
          
          setAssignedSurveys(locationsData);
    
        } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los datos de las encuestas.' });
          console.error(error);
        } finally {
          setLoading(false);
        }
      }, [company.id, activeRubro, toast, isTestMode]);
    
      useEffect(() => {
        fetchSurveyData();
      }, [fetchSurveyData]);
      
      const handleOpenCustomQuestionsEditor = (survey) => {
        setEditingSurvey(survey);
        setIsCustomQuestionsEditorOpen(true);
      };
    
      const handleLocationSelect = (value) => {
        setSelectedLocation(value);
        setExpandedLocation(null);
      };
    
      const toggleLocation = (locationName) => {
        setExpandedLocation(prev => (prev === locationName ? null : locationName));
      };
    
      const openCollectionPanel = (locationName) => {
        const surveysForLocation = assignedSurveys.filter(s => s.location_name === locationName && s.is_active);
        setCollectionData({ locationName, surveys: surveysForLocation });
        setIsCollectionPanelOpen(true);
      };
    
      const handlePreview = (assignedSurvey) => {
        const surveyInfo = {
          id: assignedSurvey.id, // This is now company_survey_locations.id for the RPC
          title: assignedSurvey.company_surveys.surveys.title,
          description: assignedSurvey.company_surveys.surveys.description,
          is_template: false,
        };
        setPreviewingSurvey(surveyInfo);
        setIsPreviewOpen(true);
      };
    
      const filteredLocations = selectedLocation === 'all'
        ? locations.map(l => l.address)
        : [selectedLocation];
    
      if (loading) {
        return <LoadingSpinner text="Cargando tus encuestas..." />;
      }
      
      const uniqueSurveysByLocation = (locationName) => {
        const surveys = assignedSurveys.filter(s => s.location_name === locationName);
        const unique = new Map();
        surveys.forEach(s => {
          if (!unique.has(s.company_surveys.surveys.id)) {
            unique.set(s.company_surveys.surveys.id, s);
          }
        });
        return Array.from(unique.values());
      }
    
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Mis Encuestas</CardTitle>
                <CardDescription>Gestiona y distribuye las encuestas para cada uno de tus locales.</CardDescription>
              </div>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <Select onValueChange={handleLocationSelect} value={selectedLocation}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filtrar por local" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los locales</SelectItem>
                    {locations.filter(loc => loc.address).map((loc, index) => (
                      <SelectItem key={index} value={loc.address}>{loc.address}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setIsCustomizationModalOpen(true)}>
                  <Brush className="w-4 h-4 mr-2" />
                  Personalizar Diseño
                </Button>
                <Button onClick={() => setIsManageModalOpen(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Asignar Encuestas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredLocations.length > 0 ? (
                <div className="space-y-4">
                  {filteredLocations.map((locationName, index) => {
                    const surveysForLocation = uniqueSurveysByLocation(locationName);
                    const hasActiveSurveys = assignedSurveys.some(s => s.location_name === locationName && s.is_active);
    
                    return (
                      <Card key={index} className="overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center cursor-pointer" onClick={() => toggleLocation(locationName)}>
                          <h3 className="font-semibold text-lg">{locationName}</h3>
                          <div className="flex items-center gap-4">
                            {hasActiveSurveys ? (
                              <Button size="sm" onClick={(e) => { e.stopPropagation(); openCollectionPanel(locationName); }}>Recopilar Respuestas</Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">No hay encuestas activas</span>
                            )}
                            <Button variant="ghost" size="icon">
                              {expandedLocation === locationName ? <ChevronUp /> : <ChevronDown />}
                            </Button>
                          </div>
                        </div>
                        <AnimatePresence>
                          {expandedLocation === locationName && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 space-y-3">
                                {surveysForLocation.length > 0 ? surveysForLocation.map(assigned => (
                                  <div key={assigned.id} className="flex justify-between items-center p-3 border rounded-lg">
                                    <div>
                                      <p className="font-medium">{assigned.company_surveys.surveys.title}</p>
                                      <span className={`text-sm ${assigned.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                                        {assigned.is_active ? 'Activa' : 'Inactiva'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       {isProfessionalPlan && (
                                        <Button variant="outline" size="sm" onClick={() => handleOpenCustomQuestionsEditor(assigned.company_surveys)}>
                                          <PlusCircle className="w-4 h-4 mr-2" />
                                          Preguntas Adicionales
                                        </Button>
                                      )}
                                      <Button variant="outline" size="sm" onClick={() => handlePreview(assigned)}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        Previsualizar
                                      </Button>
                                    </div>
                                  </div>
                                )) : (
                                  <p className="text-center text-muted-foreground py-4">No hay encuestas asignadas a este local.</p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No hay locales configurados para este rubro</AlertTitle>
                  <AlertDescription>
                    Parece que no tienes locales físicos o canales online configurados para "{activeRubro}". Ve a la sección de configuración para añadirlos.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
    
          {isManageModalOpen && (
            <ManageSurveysModal
              isOpen={isManageModalOpen}
              setIsOpen={setIsManageModalOpen}
              company={company}
              activeRubro={activeRubro}
              isProfessionalPlan={isProfessionalPlan}
              isCurrentRubroPhysical={isCurrentRubroPhysical}
              onUpdate={fetchSurveyData}
            />
          )}
          
          {isCustomizationModalOpen && (
            <SurveyCustomizationModal
              isOpen={isCustomizationModalOpen}
              setIsOpen={setIsCustomizationModalOpen}
              company={company}
              onUpdate={onCompanyUpdate}
            />
          )}
    
          {isCustomQuestionsEditorOpen && editingSurvey && (
            <CustomQuestionsEditor
              isOpen={isCustomQuestionsEditorOpen}
              setIsOpen={setIsCustomQuestionsEditorOpen}
              survey={editingSurvey}
              user={user}
              onUpdate={fetchSurveyData}
            />
          )}
    
          <Dialog open={isCollectionPanelOpen} onOpenChange={setIsCollectionPanelOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Recopilar Respuestas para: {collectionData?.locationName}</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {collectionData?.surveys.map(survey => (
                  <Card key={survey.id}>
                    <CardHeader><CardTitle>{survey.company_surveys.surveys.title}</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                        <QrCode className="w-5 h-5 mb-2" />
                        <h4 className="font-semibold">Código QR</h4>
                        <div className="p-2 bg-white mt-2">
                          <QRCode value={survey.collection_qr_code || ''} size={128} />
                        </div>
                        <Button size="sm" variant="link" className="mt-2" onClick={() => {
                          const canvas = document.querySelector('canvas');
                          if (canvas) {
                            const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                            let downloadLink = document.createElement("a");
                            downloadLink.href = pngUrl;
                            downloadLink.download = `qr-code-${survey.location_name}.png`;
                            document.body.appendChild(downloadLink);
                            downloadLink.click();
                            document.body.removeChild(downloadLink);
                          }
                        }}>Descargar</Button>
                      </div>
                      <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                        <LinkIcon className="w-5 h-5 mb-2" />
                        <h4 className="font-semibold">Enlace Directo</h4>
                        <input
                          readOnly
                          value={survey.collection_link || ''}
                          className="w-full text-center text-sm bg-gray-100 p-2 rounded mt-2"
                        />
                        <Button size="sm" variant="link" className="mt-2" onClick={() => {
                          navigator.clipboard.writeText(survey.collection_link || '');
                          toast({ title: 'Copiado', description: 'Enlace copiado al portapapeles.' });
                        }}>Copiar Enlace</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            {isPreviewOpen && (
              <SurveyPreview
                survey={previewingSurvey}
                onClose={() => setIsPreviewOpen(false)}
              />
            )}
          </Dialog>
        </motion.div>
      );
    };
    
    export default MySurveys;