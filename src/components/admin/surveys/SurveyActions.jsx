import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, Plus, Loader2 } from 'lucide-react';

const SurveyActions = ({ onDownloadTemplate, onFileUpload, onNewSurvey, isUploading }) => {
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      <Button variant="outline" onClick={onDownloadTemplate}>
        <Download className="w-4 h-4 mr-2" />
        Plantilla
      </Button>
      <Input id="file-upload" type="file" className="hidden" onChange={onFileUpload} accept=".xlsx, .xls" disabled={isUploading} />
      <Button asChild variant="outline" disabled={isUploading}>
        <Label htmlFor="file-upload" className="cursor-pointer">
          {isUploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          Importar
        </Label>
      </Button>
      <Button onClick={onNewSurvey} disabled={isUploading}>
        <Plus className="w-4 h-4 mr-2" />
        Crear Plantilla
      </Button>
    </div>
  );
};

export default SurveyActions;