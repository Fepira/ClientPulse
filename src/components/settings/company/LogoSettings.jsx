import React, { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/customSupabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Cropper from 'react-easy-crop';
import { Slider } from '@/components/ui/slider';
import { getCroppedImg } from '@/lib/cropImage';
import { Loader2 } from 'lucide-react';

const LogoSettings = ({ company, onCompanyUpdate }) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = React.useRef(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
  
  const resetState = () => {
    setSelectedFile(null);
    setImageSrc(null);
    setIsCropperOpen(false);
    setIsUploading(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "Archivo demasiado grande",
          description: "Por favor, selecciona una imagen de menos de 5MB.",
        });
        resetState();
        return;
    }

    if (file.type === 'image/png' || file.type === 'image/jpeg') {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
        setIsCropperOpen(true);
      });
      reader.readAsDataURL(file);
    } else {
        toast({
          variant: "destructive",
          title: "Formato de archivo inválido",
          description: "Por favor, selecciona una imagen en formato PNG o JPG.",
        });
      resetState();
    }
  };
  
  const uploadCroppedImage = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels || !selectedFile) {
        toast({ variant: "destructive", title: "Error", description: "No hay imagen para procesar."});
        return;
    }
    try {
      setIsUploading(true);
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedImageBlob], selectedFile.name, {
        type: selectedFile.type,
        lastModified: Date.now(),
      });

      const formData = new FormData();
      formData.append('companyName', company.company_name);
      formData.append('file', croppedFile);

      const { data: functionData, error: functionError } = await supabase.functions.invoke('upload-company-logo', {
        body: formData,
      });

      if (functionError) {
        const errorBody = await functionError.context.json();
        throw new Error(errorBody.error || functionError.message);
      }

      const { publicUrl } = functionData;

      const { error: dbError } = await supabase
        .from('companies')
        .update({ logo_url: publicUrl })
        .eq('id', company.id);

      if (dbError) throw dbError;

      toast({
        title: "¡Logo actualizado!",
        description: "Tu nuevo logo ha sido guardado y se mostrará en tus encuestas.",
      });
      onCompanyUpdate();
      resetState();
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error al subir", description: `No se pudo guardar el logo: ${e.message}` });
    } finally {
      setIsUploading(false);
      setIsCropperOpen(false);
    }
  }, [imageSrc, croppedAreaPixels, selectedFile, company, onCompanyUpdate, toast]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Logo de la Empresa</CardTitle>
          <CardDescription>Sube y gestiona el logo que aparecerá en tus encuestas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1 flex justify-center">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed">
                {company?.logo_url ? (
                  <img src={company.logo_url} alt="Logo de la empresa" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-muted-foreground">Sin logo</span>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="logo-upload">Sube un nuevo logo (PNG o JPG, max 5MB)</Label>
              <Input ref={inputRef} id="logo-upload" type="file" accept="image/png, image/jpeg" onChange={handleFileChange} className="mt-2" disabled={isUploading} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCropperOpen} onOpenChange={(open) => {
          if (!open) {
              resetState();
          }
          setIsCropperOpen(open);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Recortar Logo</DialogTitle>
          </DialogHeader>
          <div className="relative h-80 w-full bg-gray-200">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="space-y-4 py-4">
            <Label>Zoom</Label>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(val) => setZoom(val[0])}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetState} disabled={isUploading}>Cancelar</Button>
            <Button onClick={uploadCroppedImage} disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? "Subiendo..." : "Guardar Logo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LogoSettings;