import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Plus, Save } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

const SettingForm = ({ setting, onSave, onCancel }) => {
  const [key, setKey] = useState(setting?.key || '');
  const [value, setValue] = useState(setting?.value ? JSON.stringify(setting.value, null, 2) : '');
  const [description, setDescription] = useState(setting?.description || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const parsedValue = value ? JSON.parse(value) : null;
      onSave({ key, value: parsedValue, description });
    } catch (error) {
      alert('El valor JSON no es válido.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="key">Clave</Label>
        <Input id="key" value={key} onChange={(e) => setKey(e.target.value)} required disabled={!!setting} />
        {!!setting && <p className="text-xs text-gray-500 mt-1">La clave no se puede cambiar.</p>}
      </div>
      <div>
        <Label htmlFor="value">Valor (JSON)</Label>
        <Textarea id="value" value={value} onChange={(e) => setValue(e.target.value)} rows={5} placeholder='{ "key": "value" } o "string"' />
      </div>
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        </DialogClose>
        <Button type="submit">Guardar Configuración</Button>
      </DialogFooter>
    </form>
  );
};

const SettingsManagement = ({ settings, onUpdate }) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);

  const handleSaveSetting = async (settingData) => {
    const { key, ...updateData } = settingData;
    let error;

    // Upsert logic: update if exists, insert if not.
    ({ error } = await supabase.from('app_settings').upsert({ key, ...updateData }));

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Éxito', description: `Configuración guardada correctamente.` });
      onUpdate();
      setIsFormOpen(false);
      setEditingSetting(null);
    }
  };

  const handleDeleteSetting = async (key) => {
    const { error } = await supabase.from('app_settings').delete().eq('key', key);
    if (error) {
      toast({ variant: 'destructive', title: 'Error al eliminar', description: error.message });
    } else {
      toast({ title: 'Éxito', description: 'Configuración eliminada.' });
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Configuración General de la Aplicación</h3>
          <p className="text-gray-500">Gestiona los parámetros globales del sistema.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingSetting(null); setIsFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Añadir Configuración
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSetting ? 'Editar Configuración' : 'Añadir Nueva Configuración'}</DialogTitle>
            </DialogHeader>
            <SettingForm setting={editingSetting} onSave={handleSaveSetting} onCancel={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clave</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {settings.map((setting) => (
              <tr key={setting.key}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-purple-700">{setting.key}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  <pre className="text-xs bg-gray-100 p-2 rounded-md overflow-x-auto max-w-md">{JSON.stringify(setting.value, null, 2)}</pre>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-sm">{setting.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingSetting(setting); setIsFormOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará permanentemente la configuración "{setting.key}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteSetting(setting.key)} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {settings.length === 0 && <p className="text-center text-gray-500 py-4">No hay configuraciones definidas.</p>}
      </div>
    </div>
  );
};

export default SettingsManagement;