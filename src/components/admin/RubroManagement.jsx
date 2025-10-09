import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';

const RubroForm = ({ rubro, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: rubro?.name || '',
    description: rubro?.description || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre del Rubro</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Ej: Retail"
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe brevemente el rubro"
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit">Guardar Cambios</Button>
      </DialogFooter>
    </form>
  );
};

const RubroManagement = ({ rubros, onUpdate }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRubro, setEditingRubro] = useState(null);

  const handleOpenDialog = (rubro = null) => {
    setEditingRubro(rubro);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingRubro(null);
    setIsDialogOpen(false);
  };

  const handleSave = async (formData) => {
    if (!formData.name.trim()) {
      toast({ variant: 'destructive', description: 'El nombre del rubro no puede estar vacío.' });
      return;
    }

    const { error } = editingRubro
      ? await supabase.from('rubros').update(formData).eq('id', editingRubro.id)
      : await supabase.from('rubros').insert([formData]);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al guardar rubro',
        description: error.message,
      });
    } else {
      toast({
        title: 'Éxito',
        description: `Rubro ${editingRubro ? 'actualizado' : 'añadido'} correctamente.`,
      });
      onUpdate();
      handleCloseDialog();
    }
  };

  const handleDeleteRubro = async (rubroId) => {
    const { error } = await supabase.from('rubros').delete().eq('id', rubroId);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al eliminar rubro',
        description: 'No se pudo eliminar el rubro. Es posible que esté asociado a encuestas existentes.',
      });
    } else {
      toast({ title: 'Éxito', description: 'Rubro eliminado correctamente.' });
      onUpdate();
    }
  };

  const filteredRubros = rubros.filter(
    (rubro) =>
      rubro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rubro.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Añadir Rubro
        </Button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Rubro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRubros.map((rubro) => (
                <tr key={rubro.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rubro.name}</td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-md truncate">{rubro.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(rubro)}>
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
                            <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente el rubro "{rubro.name}". Si hay encuestas asociadas a este rubro, podrían verse afectadas.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteRubro(rubro.id)} className="bg-red-600 hover:bg-red-700">
                              Sí, eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {filteredRubros.length === 0 && <p className="text-center text-gray-500 py-4">No se encontraron rubros.</p>}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRubro ? 'Editar Rubro' : 'Añadir Nuevo Rubro'}</DialogTitle>
          </DialogHeader>
          <RubroForm
            rubro={editingRubro}
            onSave={handleSave}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RubroManagement;