import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle, Trash2, Save, AlertTriangle } from 'lucide-react';
import { regionesData, comunasData } from '@/data/chile-locations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const LocationManager = ({ company, onCompanyUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState(company?.locations || []);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    setLocations(JSON.parse(JSON.stringify(company.locations || [])));
  }, [company]);
  
  const physicalRubros = useMemo(() =>
    company.rubros.filter(r => !r.toLowerCase().includes('online')),
  [company.rubros]);

  const handleLocationChange = (index, field, value) => {
    const newLocations = [...locations];
    newLocations[index][field] = value;
    if (field === 'region') {
      newLocations[index].comuna = '';
    }
    setLocations(newLocations);
  };

  const addLocation = () => {
    setLocations(prev => [...prev, { name: '', region: '', comuna: '', address: '', rubro: '' }]);
  };

  const removeLocation = (index) => {
    setLocations(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleFormSubmit = (e) => {
    e.preventDefault();

    const originalLocationsCount = company.locations?.length || 0;
    const newLocationsCount = locations.length;

    if (newLocationsCount < originalLocationsCount) {
      const removedLocales = company.locations.filter(origLoc => 
        !locations.some(newLoc => newLoc.name === origLoc.name && newLoc.address === origLoc.address && newLoc.rubro === origLoc.rubro)
      );
      setConfirmation({ type: 'delete', removedLocales });
    } else {
      proceedWithUpdate();
    }
  };

  const proceedWithUpdate = async () => {
    setConfirmation(null);
    setLoading(true);
    try {
      const { error } = await supabase.from('companies')
        .update({
          locations: locations,
          locales: locations.length
        })
        .eq('id', company.id);

      if (error) throw error;

      toast({ title: "Éxito", description: "Locales actualizados correctamente." });
      onCompanyUpdate();
    } catch (error) {
      console.error("Error updating locations:", error);
      toast({ title: "Error", description: `Error al actualizar locales: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  const cancelUpdate = () => {
    setConfirmation(null);
    setLocations(JSON.parse(JSON.stringify(company.locations || [])));
    toast({ title: "Cambios Descartados", description: "La actualización ha sido cancelada." });
  };

  return (
    <div>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <h4 className="text-xl font-semibold mt-6 mb-3">Gestión de Locales Físicos</h4>
        {locations.length === 0 && (
          <p className="text-gray-500">No hay locales registrados. Añade uno para empezar.</p>
        )}
        {locations.map((loc, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3 bg-white/50 relative">
            <h5 className="font-semibold text-gray-700">Local {index + 1}</h5>
            <Button type="button" variant="destructive" size="sm" onClick={() => removeLocation(index)} className="absolute top-3 right-3">
              <Trash2 className="h-4 w-4" />
            </Button>
            <div>
              <Label htmlFor={`locale-name-${index}`}>Nombre del Local</Label>
              <Input id={`locale-name-${index}`} value={loc.name} onChange={e => handleLocationChange(index, 'name', e.target.value)} placeholder="Ej: Sucursal Centro" />
            </div>
            <div>
              <Label htmlFor={`locale-rubro-${index}`}>Asignar Rubro al Local</Label>
              <Select onValueChange={(value) => handleLocationChange(index, 'rubro', value)} value={loc.rubro}>
                <SelectTrigger id={`locale-rubro-${index}`}>
                  <SelectValue placeholder="Asignar Rubro al Local" />
                </SelectTrigger>
                <SelectContent>
                  {physicalRubros.filter(r => r).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`locale-region-${index}`}>Región</Label>
                <Select onValueChange={(value) => handleLocationChange(index, 'region', value)} value={loc.region}>
                  <SelectTrigger id={`locale-region-${index}`}><SelectValue placeholder="Selecciona Región" /></SelectTrigger>
                  <SelectContent>
                    {regionesData.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor={`locale-comuna-${index}`}>Comuna</Label>
                <Select onValueChange={(value) => handleLocationChange(index, 'comuna', value)} value={loc.comuna} disabled={!loc.region}>
                  <SelectTrigger id={`locale-comuna-${index}`}><SelectValue placeholder="Selecciona Comuna" /></SelectTrigger>
                  <SelectContent>
                    {(comunasData[loc.region] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor={`locale-address-${index}`}>Dirección</Label>
              <Input id={`locale-address-${index}`} value={loc.address} onChange={e => handleLocationChange(index, 'address', e.target.value)} placeholder="Ej: Av. Siempre Viva 742" />
            </div>
          </div>
        ))}
        <Button type="button" onClick={addLocation} variant="outline" className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Local
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar Cambios en Locales
        </Button>
      </form>
      {confirmation && (
        <AlertDialog open={!!confirmation} onOpenChange={() => setConfirmation(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-red-500" />Confirmar Eliminación</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-4">
                  <p className="text-red-600 font-semibold">¡Atención! Estás a punto de eliminar locales.</p>
                  {confirmation.removedLocales.length > 0 && (
                    <div className="p-3 bg-gray-100 rounded-md text-left">
                      <p className="font-medium text-gray-800">Locales a eliminar:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {confirmation.removedLocales.map(l => <li key={l.name}>{l.name}</li>)}
                      </ul>
                    </div>
                  )}
                  <p className="font-bold">Al confirmar, todos los datos asociados (encuestas, respuestas, métricas) a estos locales se perderán de forma permanente. Esta acción no se puede deshacer.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelUpdate}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={proceedWithUpdate} className={'bg-red-600 hover:bg-red-700'}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirmar y Guardar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default LocationManager;