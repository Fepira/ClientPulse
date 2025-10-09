import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, Palette, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import DynamicSurveyPreview from './DynamicSurveyPreview';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const SurveyCustomizationModal = ({ isOpen, setIsOpen, company, onUpdate }) => {
  const { toast } = useToast();
  const [showLogo, setShowLogo] = useState(false);
  const [designTemplates, setDesignTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [thankYouMessage, setThankYouMessage] = useState({ title: '', body: '' });
  const [thankYouImageUrl, setThankYouImageUrl] = useState(null);
  const [thankYouImageFile, setThankYouImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchAndSetData = async () => {
      if (isOpen && company) {
        setIsLoading(true);
        try {
          const { data: companySurveys, error: surveysError } = await supabase
            .from('surveys')
            .select('show_company_logo, thank_you_message, thank_you_image_url')
            .eq('company_id', company.id);

          if (surveysError) throw surveysError;

          const { data, error } = await supabase.from('design_templates').select('*');
          if (error) throw error;
          setDesignTemplates(data);
          
          const currentTemplateId = company.survey_template_style || 'claro';
          const currentTemplate = data.find(t => t.id === currentTemplateId) || data[0];
          setSelectedTemplate(currentTemplate);
          
          if (companySurveys.length > 0) {
            const surveySettings = companySurveys[0];
            setShowLogo(surveySettings.show_company_logo);
            setThankYouMessage(surveySettings.thank_you_message || { title: '¡Encuesta Enviada!', body: '¡Muchas gracias por tu tiempo!' });
            setThankYouImageUrl(surveySettings.thank_you_image_url);
          }

        } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los datos de diseño.' });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAndSetData();
  }, [isOpen, company, toast]);
  
  const handleThankYouImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ variant: 'destructive', title: 'Archivo demasiado grande', description: 'La imagen no debe superar los 2MB.'});
        return;
    }

    setIsUploading(true);
    try {
        const filePath = `thank_you_images/${company.id}/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('company_logos') // Reusing bucket
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('company_logos').getPublicUrl(uploadData.path);
        setThankYouImageUrl(publicUrl);
        toast({ title: 'Imagen subida', description: 'La imagen de agradecimiento se ha actualizado.'});

    } catch (error) {
        toast({ variant: 'destructive', title: 'Error al subir', description: error.message });
    } finally {
        setIsUploading(false);
    }
  };


  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error: surveysError } = await supabase
        .from('surveys')
        .update({ 
            show_company_logo: showLogo,
            thank_you_message: thankYouMessage,
            thank_you_image_url: thankYouImageUrl
        })
        .eq('company_id', company.id);
        
      if(surveysError) throw surveysError;

      const { error: companyError } = await supabase
        .from('companies')
        .update({ survey_template_style: selectedTemplate?.id })
        .eq('id', company.id);
        
      if(companyError) throw companyError;
  
      toast({ title: '¡Éxito!', description: 'La personalización de la encuesta ha sido guardada.' });
      if(onUpdate) await onUpdate();
      setIsOpen(false);

    } catch (error) {
      console.error("Save Error:", error);
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Personalizar Diseño de Encuestas</DialogTitle>
          <DialogDescription>
            Ajusta el estilo, el logo y el mensaje de agradecimiento de tus encuestas.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-6">
                <div>
                    <Label className="font-semibold text-base flex items-center gap-2 mb-2">Personalización General</Label>
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="show-logo-switch">Mostrar logo de la empresa</Label>
                                <Switch
                                    id="show-logo-switch"
                                    checked={showLogo}
                                    onCheckedChange={setShowLogo}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Label className="font-semibold text-base flex items-center gap-2 mb-2">Pantalla de Agradecimiento</Label>
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <Label htmlFor="thank-you-title">Título</Label>
                                <Input id="thank-you-title" value={thankYouMessage.title} onChange={(e) => setThankYouMessage(prev => ({...prev, title: e.target.value}))} />
                            </div>
                            <div>
                                <Label htmlFor="thank-you-body">Mensaje</Label>
                                <Textarea id="thank-you-body" value={thankYouMessage.body} onChange={(e) => setThankYouMessage(prev => ({...prev, body: e.target.value}))} />
                            </div>
                             <div>
                                <Label htmlFor="thank-you-image">Imagen de Agradecimiento</Label>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border">
                                        {thankYouImageUrl ? <img src={thankYouImageUrl} alt="Agradecimiento" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-gray-400" />}
                                    </div>
                                    <Input id="thank-you-image-upload" type="file" className="hidden" onChange={handleThankYouImageUpload} accept="image/png, image/jpeg, image/gif" disabled={isUploading} />
                                    <Button asChild variant="outline">
                                        <Label htmlFor="thank-you-image-upload" className="cursor-pointer">
                                            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                            Subir
                                        </Label>
                                    </Button>
                                    {thankYouImageUrl && <Button variant="destructive" size="sm" onClick={() => setThankYouImageUrl(null)}>Quitar</Button>}
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                </div>

              <div>
                <Label className="font-semibold text-base flex items-center gap-2 mb-2"><Palette className="w-5 h-5" /> Galería de Plantillas</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {designTemplates.map((template) => (
                    <Card
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={cn('cursor-pointer transition-all duration-200 relative overflow-hidden', selectedTemplate?.id === template.id ? 'ring-2 ring-primary ring-offset-2' : 'hover:shadow-md')}>
                        <CardContent className="p-0">
                            <img src={template.thumbnail_url} alt={template.name} className="w-full h-24 object-cover" />
                            <div className="p-3 flex items-center">
                              <span className="font-medium">{template.name}</span>
                              {selectedTemplate?.id === template.id && <CheckCircle className="w-5 h-5 text-primary ml-auto" />}
                            </div>
                        </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-base">Previsualización en Vivo</Label>
              <div className="h-[500px] bg-gray-100 rounded-lg border">
                <DynamicSurveyPreview 
                    logoUrl={showLogo ? company.logo_url : null} 
                    styles={selectedTemplate?.styles_object}
                    thankYouMessage={thankYouMessage}
                    thankYouImageUrl={thankYouImageUrl}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving || isLoading || !selectedTemplate}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SurveyCustomizationModal;