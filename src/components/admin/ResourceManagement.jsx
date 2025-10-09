import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Plus, BookOpen, Video, FileText, BarChart2, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
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

const typeIcons = {
  'Artículo': <BookOpen className="h-5 w-5" />,
  'Video': <Video className="h-5 w-5" />,
  'Guía': <FileText className="h-5 w-5" />,
  'Benchmarking': <BarChart2 className="h-5 w-5" />,
  'Caso de Éxito': <Star className="h-5 w-5" />,
};

const resourceTypes = Object.keys(typeIcons);

const ResourceForm = ({ resource, onSave, onCancel }) => {
  const [title, setTitle] = useState(resource?.title || '');
  const [description, setDescription] = useState(resource?.description || '');
  const [category, setCategory] = useState(resource?.category || '');
  const [type, setType] = useState(resource?.type || resourceTypes[0]);
  const [fileUrl, setFileUrl] = useState(resource?.file_url || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: resource?.id, title, description, category, type, file_url: fileUrl });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
       <div>
        <Label htmlFor="type">Tipo</Label>
        <Select onValueChange={setType} value={type}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tipo" />
          </SelectTrigger>
          <SelectContent>
            {resourceTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="category">Categoría</Label>
        <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ej: Métricas, Estrategias"/>
      </div>
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="file_url">URL del Recurso (Opcional)</Label>
        <Input id="file_url" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://ejemplo.com/recurso.pdf"/>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        </DialogClose>
        <Button type="submit">Guardar Recurso</Button>
      </DialogFooter>
    </form>
  );
};


const ResourceManagement = ({ resources, onUpdate }) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  
  const handleSaveResource = async (resourceData) => {
    const { id, ...updateData } = resourceData;
    let error;

    if (id) {
      ({ error } = await supabase.from('resources').update(updateData).eq('id', id));
    } else {
      ({ error } = await supabase.from('resources').insert(updateData));
    }

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Éxito', description: `Recurso ${id ? 'actualizado' : 'creado'} correctamente.` });
      onUpdate();
      setIsFormOpen(false);
      setEditingResource(null);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    const { error } = await supabase.from('resources').delete().eq('id', resourceId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error al eliminar', description: error.message });
    } else {
      toast({ title: 'Éxito', description: 'Recurso eliminado.' });
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Recursos Educativos</h3>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingResource(null); setIsFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Añadir Recurso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingResource ? 'Editar Recurso' : 'Añadir Nuevo Recurso'}</DialogTitle>
            </DialogHeader>
            <ResourceForm resource={editingResource} onSave={handleSaveResource} onCancel={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {resources.map((resource) => (
              <tr key={resource.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{resource.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    {typeIcons[resource.type] || <FileText className="h-5 w-5" />}
                    <span className="capitalize">{resource.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {resource.category && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      {resource.category}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingResource(resource); setIsFormOpen(true); }}>
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
                            Esta acción eliminará permanentemente el recurso "{resource.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteResource(resource.id)} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
         {resources.length === 0 && <p className="text-center text-gray-500 py-4">No hay recursos disponibles.</p>}
      </div>
    </div>
  );
};

export default ResourceManagement;