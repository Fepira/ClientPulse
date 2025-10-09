import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MultiSelectCombobox } from '@/components/ui/combobox';
import { motion } from 'framer-motion';

const BusinessInfo = ({ company, onCompanyUpdate }) => {
  const { toast } = useToast();
  const [allRubros, setAllRubros] = useState([]);
  const [rubrosLoading, setRubrosLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    company_name: '',
    rubros: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        company_name: company.company_name || '',
        rubros: company.rubros || [],
      });
    }
  }, [company]);

  useEffect(() => {
    const fetchRubros = async () => {
      setRubrosLoading(true);
      const { data, error } = await supabase.from('rubros').select('name').order('name');
      if (error) {
        console.error('Error fetching rubros:', error);
        toast({ title: "Error", description: "No se pudo cargar la lista de rubros.", variant: "destructive" });
      } else {
        setAllRubros(data.map(r => ({ value: r.name, label: r.name })));
      }
      setRubrosLoading(false);
    };
    fetchRubros();
  }, [toast]);

  const handleRubrosChange = (selectedRubros) => {
    setFormData(prev => ({ ...prev, rubros: selectedRubros }));
  };
  
  const handleNameChange = (e) => {
    setFormData(prev => ({ ...prev, company_name: e.target.value }));
  };

  const hasChanges = useMemo(() => {
    if (!company) return false;
    const originalRubros = new Set(company.rubros || []);
    const currentRubros = new Set(formData.rubros || []);
    if (originalRubros.size !== currentRubros.size) return true;
    for (const rubro of originalRubros) {
        if (!currentRubros.has(rubro)) return true;
    }
    return company.company_name !== formData.company_name;
  }, [company, formData]);

  const handleSaveChanges = useCallback(async () => {
    if (!hasChanges || !company) return;

    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .update({ rubros: formData.rubros })
        .eq('id', company.id)
        .select()
        .single();
      
      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "La información de tu empresa ha sido actualizada.",
      });
      onCompanyUpdate(data);
    } catch (error) {
      console.error("Error updating company info:", error);
      toast({ title: "Error", description: `Error al actualizar la información: ${error.message}`, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [company, formData, hasChanges, onCompanyUpdate, toast]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Información de la Empresa</h3>
      <div className="space-y-6">
        <div>
          <Label htmlFor="companyName">Nombre de la Empresa</Label>
          <Input id="companyName" name="companyName" value={formData.company_name} onChange={handleNameChange} disabled />
          <p className="text-xs text-muted-foreground mt-1">El nombre de la empresa no se puede modificar.</p>
        </div>
        <div>
          <Label htmlFor="rubros">Rubros/Industrias</Label>
          <MultiSelectCombobox
            options={allRubros}
            selected={formData.rubros}
            onChange={handleRubrosChange}
            placeholder="Selecciona o añade tus rubros"
            searchPlaceholder="Buscar o añadir rubro..."
            emptyPlaceholder="No se encontró el rubro."
            isLoading={rubrosLoading}
            disabled={isSaving}
          />
           <p className="text-xs text-muted-foreground mt-2">Añade o elimina los rubros que representan tu negocio.</p>
        </div>

        <motion.div
          animate={hasChanges ? { opacity: 1, y: 0, height: 'auto' } : { opacity: 0, y: -10, height: 0 }}
          initial={false}
          className="flex justify-end overflow-hidden"
        >
          <Button onClick={handleSaveChanges} disabled={!hasChanges || isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessInfo;