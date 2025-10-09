import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Save } from 'lucide-react';
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
import LoadingSpinner from '../ui/LoadingSpinner';
import BenchmarkThresholds from './BenchmarkThresholds';
import { Separator } from '@/components/ui/separator';

const KpiCriteriaCard = ({ title, description, criteria, onSave }) => {
  const [localCriteria, setLocalCriteria] = useState(criteria);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLocalCriteria(criteria);
  }, [criteria]);

  const handleInputChange = (key, value) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setLocalCriteria(prev => ({ ...prev, [key]: numValue }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(localCriteria);
      toast({ title: 'Éxito', description: `Criterios para ${title} actualizados.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(localCriteria).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <Label htmlFor={`${title}-${key}`} className="capitalize">
              {key.replace('_', ' ')}
            </Label>
            <Input
              id={`${title}-${key}`}
              type="number"
              value={value}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="w-24"
            />
          </div>
        ))}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full mt-4" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmación de Cambio Global</AlertDialogTitle>
              <AlertDialogDescription>
                Atención: Está a punto de cambiar la fórmula de cálculo para {title} para TODOS los usuarios y empresas de la plataforma. Esto recalculará todos los datos históricos y los gráficos cambiarán. ¿Está seguro de que desea continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleSave}>Confirmar y Guardar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

const MetricManagement = ({ onUpdate }) => {
  const [kpiCriteria, setKpiCriteria] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchKpiCriteria = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('kpi_criteria').select('*');
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los criterios de KPI.' });
      setKpiCriteria({});
    } else {
      const criteriaMap = data.reduce((acc, item) => {
        acc[item.kpi_name] = item.criteria;
        return acc;
      }, {});
      setKpiCriteria(criteriaMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchKpiCriteria();
  }, []);

  const handleSaveCriteria = async (kpiName, newCriteria) => {
    const { error } = await supabase.rpc('update_kpi_criteria_and_notify', {
      p_kpi_name: kpiName,
      p_criteria: newCriteria,
    });

    if (error) {
      throw new Error(error.message);
    }
    await fetchKpiCriteria();
  };

  if (loading) {
    return <LoadingSpinner text="Cargando configuración de métricas..." />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold">Criterios Globales de KPI</h3>
        <p className="text-gray-500 mb-4">Define cómo se calculan los KPIs en toda la plataforma.</p>
        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 mb-6">
          <div className="flex">
            <div className="py-1"><AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" /></div>
            <div>
              <p className="font-bold">Impacto Global</p>
              <p className="text-sm">Cualquier cambio realizado aquí afectará los cálculos de CSAT y NPS para todas las empresas y recalculará todos los datos históricos.</p>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {kpiCriteria?.csat && (
            <KpiCriteriaCard
              title="CSAT"
              description="Define el umbral para considerar una respuesta como 'satisfecha'."
              criteria={kpiCriteria.csat}
              onSave={(newCriteria) => handleSaveCriteria('csat', newCriteria)}
            />
          )}
          {kpiCriteria?.nps && (
            <KpiCriteriaCard
              title="NPS"
              description="Define los umbrales para 'promotores' y 'detractores'."
              criteria={kpiCriteria.nps}
              onSave={(newCriteria) => handleSaveCriteria('nps', newCriteria)}
            />
          )}
        </div>
      </div>
      
      <Separator />

      <BenchmarkThresholds onUpdate={onUpdate} />

    </div>
  );
};

export default MetricManagement;