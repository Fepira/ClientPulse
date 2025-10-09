import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useTestMode } from '@/contexts/TestModeContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Store, PlusCircle, Trash2 } from 'lucide-react';
import { regionesData, comunasData } from '@/data/chile-locations.js';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const LocaleManagement = ({ company, onCompanyUpdate }) => {
  const { toast } = useToast();
  const { isTestMode } = useTestMode();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [localeToDelete, setLocaleToDelete] = useState(null);
  const [newLocale, setNewLocale] = useState({ address: '', region: '', comuna: '', rubro: '' });
  const [loading, setLoading] = useState(false);
  
  const physicalRubros = useMemo(() => 
    company?.rubros?.filter(r => !r.toLowerCase().includes('online')) || [],
    [company?.rubros]
  );
  
  const handleInputChange = (field, value) => {
    const updatedLocale = { ...newLocale, [field]: value };
    if (field === 'region') {
      updatedLocale.comuna = '';
    }
    setNewLocale(updatedLocale);
  };
  
  const handleAddLocale = async () => {
    if (isTestMode) {
      toast({ title: "Modo Demo", description: "Acción bloqueada: Estás en modo demo. Los cambios no se guardarán." });
      setAddDialogOpen(false);
      return;
    }
    if (!newLocale.address || !newLocale.region || !newLocale.comuna || !newLocale.rubro) {
      toast({ variant: 'destructive', title: 'Campos requeridos', description: 'Por favor, completa todos los campos.' });
      return;
    }

    setLoading(true);
    const currentLocations = company.locations || [];
    const updatedLocations = [...currentLocations, newLocale];
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .update({ locations: updatedLocations, locales: updatedLocations.length })
        .eq('id', company.id)
        .select()
        .single();
        
      if (error) throw error;
      
      onCompanyUpdate(data);
      toast({ title: 'Éxito', description: 'Nuevo local añadido correctamente.' });
      setAddDialogOpen(false);
      setNewLocale({ address: '', region: '', comuna: '', rubro: '' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: `No se pudo añadir el local: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocale = async () => {
    if (isTestMode) {
      toast({ title: "Modo Demo", description: "Acción bloqueada: Estás en modo demo. Los cambios no se guardarán." });
      setDeleteDialogOpen(false);
      setLocaleToDelete(null);
      return;
    }
    if (!localeToDelete) return;

    setLoading(true);
    const updatedLocations = company.locations.filter((_, index) => index !== localeToDelete.index);
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .update({ locations: updatedLocations, locales: updatedLocations.length })
        .eq('id', company.id)
        .select()
        .single();
      
      if (error) throw error;
      
      onCompanyUpdate(data);
      toast({ title: 'Éxito', description: 'Local eliminado correctamente.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: `No se pudo eliminar el local: ${error.message}` });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setLocaleToDelete(null);
    }
  };

  if (!company) {
    return (
      <div className="p-8 bg-white rounded-2xl shadow-lg flex justify-center items-center">
        <LoadingSpinner text="Cargando datos de la empresa..." />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-white rounded-2xl shadow-lg"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h3 className="text-2xl font-bold flex items-center space-x-3">
            <Store className="w-8 h-8 text-purple-500" />
            <span>Administración de Locales Físicos</span>
          </h3>
          <Button onClick={() => setAddDialogOpen(true)}>
            <PlusCircle className="w-5 h-5 mr-2" />
            Añadir Nuevo Local
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección del Local</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Región</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comuna</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rubro Asociado</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {company.locations && company.locations.length > 0 ? (
                  company.locations.map((loc, index) => (
                    <motion.tr key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loc.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.region}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.comuna}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.rubro}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setLocaleToDelete({ ...loc, index });
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">No tienes locales físicos registrados.</td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Locale Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Local</DialogTitle>
            <DialogDescription>Completa la información para registrar un nuevo local físico.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Dirección</Label>
              <Input id="address" value={newLocale.address} onChange={(e) => handleInputChange('address', e.target.value)} className="col-span-3" placeholder="Ej: Av. Principal 123" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rubro" className="text-right">Rubro</Label>
              <Select value={newLocale.rubro} onValueChange={(value) => handleInputChange('rubro', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona un rubro" />
                </SelectTrigger>
                <SelectContent>
                  {physicalRubros.filter(r => r).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">Región</Label>
              <Select value={newLocale.region} onValueChange={(value) => handleInputChange('region', value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona una región" />
                </SelectTrigger>
                <SelectContent>
                  {regionesData.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comuna" className="text-right">Comuna</Label>
              <Select value={newLocale.comuna} onValueChange={(value) => handleInputChange('comuna', value)} disabled={!newLocale.region}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona una comuna" />
                </SelectTrigger>
                <SelectContent>
                  {comunasData[newLocale.region]?.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" onClick={handleAddLocale} disabled={loading}>{loading ? 'Guardando...' : 'Guardar Local'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Locale Alert */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el local <span className="font-bold">{localeToDelete?.address}</span>. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLocaleToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLocale} className="bg-red-600 hover:bg-red-700">
              {loading ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LocaleManagement;