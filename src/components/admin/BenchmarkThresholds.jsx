import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

const BenchmarkThresholds = ({ onUpdate }) => {
  const [rubros, setRubros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchRubros = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rubros')
      .select('id, name, first_month_minimum, regular_minimum_responses')
      .order('name');
    
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los rubros.' });
    } else {
      setRubros(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRubros();
  }, []);

  const handleInputChange = (id, field, value) => {
    const updatedRubros = rubros.map(rubro => {
      if (rubro.id === id) {
        return { ...rubro, [field]: value };
      }
      return rubro;
    });
    setRubros(updatedRubros);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    const updates = rubros.map(rubro => {
      const first_month_minimum = parseInt(rubro.first_month_minimum, 10);
      const regular_minimum_responses = parseInt(rubro.regular_minimum_responses, 10);

      return supabase
        .from('rubros')
        .update({ 
          first_month_minimum: isNaN(first_month_minimum) ? 5 : first_month_minimum,
          regular_minimum_responses: isNaN(regular_minimum_responses) ? 20 : regular_minimum_responses,
        })
        .eq('id', rubro.id);
    });

    const results = await Promise.allSettled(updates);
    
    const hasErrors = results.some(res => res.status === 'rejected' && res.reason);

    if (hasErrors) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Algunos umbrales no se pudieron guardar. Inténtelo de nuevo.',
      });
    } else {
      toast({
        title: 'Éxito',
        description: 'Umbrales de benchmark actualizados correctamente.',
      });
      fetchRubros(); // Re-fetch to confirm changes
      if(onUpdate) onUpdate();
    }
    setIsSaving(false);
  };

  if (loading) {
    return <LoadingSpinner text="Cargando umbrales de benchmark..." />;
  }

  return (
    <div>
      <h3 className="text-xl font-bold">Umbrales de Benchmark por Rubro</h3>
      <p className="text-gray-500 mb-4">Define el número mínimo de respuestas que debe tener un local para ser incluido en los cálculos del benchmark.</p>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rubro</TableHead>
                <TableHead className="w-[180px] text-center">Mínimo Primer Mes</TableHead>
                <TableHead className="w-[180px] text-center">Mínimo Regular</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rubros.map(rubro => (
                <TableRow key={rubro.id}>
                  <TableCell className="font-medium">{rubro.name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={rubro.first_month_minimum}
                      onChange={(e) => handleInputChange(rubro.id, 'first_month_minimum', e.target.value)}
                      className="w-full text-center"
                      min="1"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={rubro.regular_minimum_responses}
                      onChange={(e) => handleInputChange(rubro.id, 'regular_minimum_responses', e.target.value)}
                      className="w-full text-center"
                       min="1"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="flex justify-end mt-6">
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
};

export default BenchmarkThresholds;