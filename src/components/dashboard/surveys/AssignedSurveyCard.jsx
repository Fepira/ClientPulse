import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { BarChart2, ChevronDown, ChevronUp, Link, Mail, QrCode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import QRCode from 'react-qr-code';

const CollectionOptionsDialog = ({ surveyTitle, locations }) => {
  const { toast } = useToast();

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast({ title: 'Enlace copiado', description: 'El enlace de la encuesta se ha copiado a tu portapapeles.' });
  };
  
  const handleEmailTemplate = (link, locationName) => {
    const subject = `Tu opinión es importante para nosotros - ${locationName}`;
    const body = `Hola,\n\n¡Gracias por visitarnos en ${locationName}!\n\nNos encantaría conocer tu opinión sobre tu experiencia. Por favor, tómate un momento para completar nuestra breve encuesta de satisfacción haciendo clic en el siguiente enlace:\n\n${link}\n\n¡Agradecemos tu tiempo y tus comentarios!\n\nSaludos cordiales,\nEl equipo de ${locationName}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  return (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>Opciones de Recopilación para "{surveyTitle}"</DialogTitle>
        <DialogDescription>
          Usa estos recursos para distribuir tu encuesta y recopilar respuestas de tus clientes.
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-[60vh] overflow-y-auto p-1 space-y-4">
        {locations.map(loc => (
          <div key={loc.id} className="p-4 border rounded-lg">
             <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-800">{loc.location_name}</h4>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${loc.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {loc.is_active ? 'Activa' : 'Inactiva'}
                </span>
             </div>
             {loc.is_active && (
                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <p className="font-medium text-sm">Enlace Directo</p>
                    <div className="flex gap-2">
                       <input type="text" readOnly value={loc.collection_link} className="input-field-sm flex-grow"/>
                       <Button size="sm" onClick={() => handleCopyLink(loc.collection_link)}><Link className="w-4 h-4"/></Button>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleEmailTemplate(loc.collection_link, loc.location_name)} className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        Usar Plantilla de Correo
                    </Button>
                  </div>
                  <div className="flex-shrink-0 text-center">
                     <p className="font-medium text-sm mb-2">Código QR</p>
                     <div className="bg-white p-2 border rounded-md inline-block">
                        <QRCode value={loc.collection_link || 'https://clientpulse.tech'} size={100} />
                     </div>
                  </div>
                </div>
             )}
          </div>
        ))}
      </div>
    </DialogContent>
  );
};


const AssignedSurveyCard = ({ assignedSurvey, isCurrentRubroPhysical, activeLocale, isProfessionalPlan, onUpdate }) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const as = assignedSurvey;

  const relevantLocations = as.company_survey_locations.filter(loc => 
    !isCurrentRubroPhysical ? loc.is_online_rubro : (activeLocale === 'all' || loc.location_name === activeLocale)
  );
  
  const activeLocationsCount = relevantLocations.filter(loc => loc.is_active).length;
  
  const isActiveForCurrentView = activeLocationsCount > 0;

  const surveyTitle = as.surveys?.title || 'Encuesta';

  return (
    <motion.div
      layout
      key={as.id}
      whileHover={{ borderColor: '#a855f7' }}
      className="p-4 border rounded-xl"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isActiveForCurrentView ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{isActiveForCurrentView ? 'Activa' : 'Inactiva'}</span>
          <p className="font-semibold text-gray-800 mt-2">{surveyTitle}</p>
          <p className="text-sm text-gray-500">{as.surveys?.description}</p>
          {isProfessionalPlan && as.surveys?.is_template && (
            <p className="text-sm text-purple-600 mt-1">
              Preguntas personalizadas: {as.custom_questions.length} / 3
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="h-8 w-8">
              {isExpanded ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
          </Button>
        </div>
      </div>
      
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="pt-4 mt-4 border-t">
          <p className="text-sm font-medium mb-2">Acciones Rápidas</p>
          <div className="flex flex-wrap gap-2">
             <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Link className="w-4 h-4 mr-2" />
                    Recopilar Respuestas
                  </Button>
                </DialogTrigger>
                <CollectionOptionsDialog surveyTitle={surveyTitle} locations={relevantLocations}/>
            </Dialog>
            <Button variant="outline" size="sm" onClick={() => toast({ title: 'Próximamente', description: 'La visualización de respuestas estará disponible pronto.' })}>
              <BarChart2 className="w-4 h-4 mr-2" />
              Ver Resultados
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AssignedSurveyCard;