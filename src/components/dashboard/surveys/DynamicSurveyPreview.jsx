import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const DynamicSurveyPreview = ({ logoUrl, styles }) => {
  const defaultStyles = {
    bg: 'bg-gray-100',
    cardBg: 'bg-white',
    primaryText: 'text-gray-900',
    secondaryText: 'text-gray-600',
    buttonBg: 'bg-gray-800',
    buttonText: 'text-white',
    radioRing: 'ring-offset-white',
    radioIndicator: 'bg-gray-900',
  };

  const currentStyles = styles || defaultStyles;

  return (
    <div className={cn('p-4 rounded-lg w-full h-full flex items-center justify-center', currentStyles.bg)}>
      <div className={cn('w-full max-w-md mx-auto rounded-lg shadow-lg p-6 space-y-6', currentStyles.cardBg)}>
        <div className="flex justify-center min-h-[64px] items-center">
          {logoUrl && <img-replace src={logoUrl} alt="Logo de la empresa" className="h-16 w-auto object-contain" />}
        </div>
        
        <div>
          <h2 className={cn('text-lg font-semibold text-center', currentStyles.primaryText)}>
            ¿Cómo calificarías tu experiencia?
          </h2>
          <p className={cn('text-sm text-center mt-1', currentStyles.secondaryText)}>
            Tu opinión es muy importante para nosotros.
          </p>
        </div>

        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className={cn('w-8 h-8', star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')} />
          ))}
        </div>

        <div className="space-y-4">
            <h3 className={cn('font-medium', currentStyles.primaryText)}>¿Qué edad tienes?</h3>
            <RadioGroup defaultValue="25-34" className="space-y-2">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="18-24" id="r1-demo" className={cn(currentStyles.radioRing)} />
                    <Label htmlFor="r1-demo" className={cn(currentStyles.secondaryText)}>18-24</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="25-34" id="r2-demo" className={cn(currentStyles.radioRing)} />
                     <Label htmlFor="r2-demo" className={cn(currentStyles.secondaryText)}>25-34</Label>
                </div>
            </RadioGroup>
        </div>


        <Button className={cn('w-full font-semibold', currentStyles.buttonBg, currentStyles.buttonText)}>
          Enviar respuesta
        </Button>
      </div>
    </div>
  );
};

export default DynamicSurveyPreview;