import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { CheckCircle, Edit, Plus, Trash2, Target, BarChart3, Crown } from 'lucide-react';
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


const PlanIcon = ({ name }) => {
  if (name.toLowerCase().includes('profesional')) return <BarChart3 className="w-8 h-8 text-purple-500" />;
  if (name.toLowerCase().includes('empresarial')) return <Crown className="w-8 h-8 text-orange-500" />;
  return <Target className="w-8 h-8 text-blue-500" />;
};

const PlanForm = ({ plan, onSave, onCancel }) => {
  const [name, setName] = useState(plan?.name || '');
  const [price, setPrice] = useState(plan?.price || '');
  const [features, setFeatures] = useState(plan?.features?.join('\n') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const featuresArray = features.split('\n').filter(f => f.trim() !== '');
    onSave({ id: plan?.id, name, price, features: featuresArray });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="plan-name" className="block text-sm font-medium text-gray-700">Nombre del Plan</label>
        <Input id="plan-name" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="plan-price" className="block text-sm font-medium text-gray-700">Precio</label>
        <Input id="plan-price" value={price} onChange={e => setPrice(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="plan-features" className="block text-sm font-medium text-gray-700">Características (una por línea)</label>
        <Textarea id="plan-features" value={features} onChange={e => setFeatures(e.target.value)} rows={5} />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        </DialogClose>
        <Button type="submit">Guardar Plan</Button>
      </DialogFooter>
    </form>
  );
};


const PlanManagement = ({ plans, onUpdate }) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const handleSavePlan = async (planData) => {
    const { id, ...updateData } = planData;
    let error;

    if (id) {
      // Update
      ({ error } = await supabase.from('plans').update(updateData).eq('id', id));
    } else {
      // Insert
      ({ error } = await supabase.from('plans').insert(updateData));
    }

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Éxito', description: `Plan ${id ? 'actualizado' : 'creado'} correctamente.` });
      onUpdate();
      setIsFormOpen(false);
      setEditingPlan(null);
    }
  };
  
  const handleDeletePlan = async (planId) => {
    const { error } = await supabase.from('plans').delete().eq('id', planId);
    if (error) {
        toast({ variant: 'destructive', title: 'Error al eliminar plan', description: error.message });
    } else {
        toast({ title: 'Éxito', description: 'Plan eliminado correctamente.' });
        onUpdate();
    }
  };


  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Gestión de Planes y Precios</h3>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                    <Button onClick={() => setEditingPlan(null)}>
                        <Plus className="w-4 h-4 mr-2" /> Añadir Plan
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? 'Editar Plan' : 'Añadir Nuevo Plan'}</DialogTitle>
                    </DialogHeader>
                    <PlanForm plan={editingPlan} onSave={handleSavePlan} onCancel={() => setIsFormOpen(false)} />
                </DialogContent>
            </Dialog>
       </div>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <PlanIcon name={plan.name} />
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingPlan(plan); setIsFormOpen(true); }}>
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
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el plan "{plan.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeletePlan(plan.id)} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-3xl font-bold mb-4">{plan.price}</p>
              <ul className="space-y-2">
                {plan.features?.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlanManagement;