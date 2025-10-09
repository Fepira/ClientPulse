import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Loader2, Building, Mail, MapPin, Users, Globe, CheckCircle, XCircle } from 'lucide-react';
import { regionesData, comunasData } from '@/data/chile-locations.js';
import { supabase } from '@/lib/customSupabaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MultiSelectCombobox } from '@/components/ui/combobox';

const PasswordRequirement = ({ met, text }) => (
  <div className={`flex items-center text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
    {met ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
    {text}
  </div>
);

export default function RegisterPage({ selectedPlan, onCompanyCreated, onBack }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    rubros: [],
    localesCount: 1,
    locations: [{ region: '', comuna: '', address: '', rubro: '' }],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allRubros, setAllRubros] = useState([]);
  const [rubrosLoading, setRubrosLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const hasPhysicalRubros = useMemo(() => 
    formData.rubros.some(r => !r.toLowerCase().includes('online')), 
  [formData.rubros]);
  
  const physicalRubros = useMemo(() =>
    formData.rubros.filter(r => !r.toLowerCase().includes('online')),
  [formData.rubros]);

  const handleSuccessfulSignUp = useCallback((newUser, plan) => {
    if (onCompanyCreated) {
      onCompanyCreated(newUser, plan);
    }
  }, [onCompanyCreated]);

  useEffect(() => {
    if (!hasPhysicalRubros && formData.rubros.length > 0) {
      setFormData(prev => ({ ...prev, localesCount: 0, locations: [] }));
    } else if (hasPhysicalRubros && formData.localesCount === 0) {
      setFormData(prev => ({ ...prev, localesCount: 1, locations: [{ region: '', comuna: '', address: '', rubro: '' }] }));
    }
    
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.map(loc => ({
        ...loc,
        rubro: physicalRubros.includes(loc.rubro) ? loc.rubro : ''
      }))
    }))

  }, [hasPhysicalRubros, formData.rubros, physicalRubros]);

  const passwordRequirements = useMemo(() => {
    const pass = formData.password;
    return {
      hasLower: /[a-z]/.test(pass),
      hasUpper: /[A-Z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(pass),
      isLongEnough: pass.length >= 8,
      isNotTooLong: pass.length <= 72,
    };
  }, [formData.password]);

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  useEffect(() => {
    const fetchRubros = async () => {
      setRubrosLoading(true);
      const { data, error } = await supabase.from('rubros').select('name').order('name');
      if (error) {
        console.error('Error fetching rubros:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la lista de rubros. Inténtalo de nuevo.",
          variant: "destructive",
        });
      } else {
        setAllRubros(data.map(r => ({ value: r.name, label: r.name })));
      }
      setRubrosLoading(false);
    };
    fetchRubros();
  }, [toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRubrosChange = (selectedRubros) => {
    setFormData(prev => ({ ...prev, rubros: selectedRubros }));
  };

  const handleLocationChange = (index, field, value) => {
    const newLocations = [...formData.locations];
    newLocations[index][field] = value;
    if (field === 'region') {
      newLocations[index].comuna = '';
    }
    setFormData(prev => ({ ...prev, locations: newLocations }));
  };

  const handleLocalesCountChange = (e) => {
    let count = parseInt(e.target.value, 10);
    if (isNaN(count) || count < 1) {
        count = 1;
    }
    
    const newLocations = [...formData.locations];
    while (newLocations.length < count) {
      newLocations.push({ region: '', comuna: '', address: '', rubro: '' });
    }
    while (newLocations.length > count) {
      newLocations.pop();
    }
    setFormData(prev => ({ ...prev, localesCount: count, locations: newLocations }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast({ title: "Términos y Condiciones", description: "Debes aceptar los términos y condiciones para continuar.", variant: "destructive" });
      return;
    }
    if (formData.password.length > 72) {
      toast({ title: "Contraseña Larga", description: "La contraseña no puede exceder los 72 caracteres.", variant: "destructive" });
      return;
    }
    if (!isPasswordValid) {
      toast({ title: "Contraseña Débil", description: "Por favor, cumple con todos los requisitos de la contraseña.", variant: "destructive" });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }
    if (!selectedPlan) {
      toast({ title: "Error", description: "No se ha seleccionado un plan.", variant: "destructive" });
      return;
    }
    if (formData.rubros.length === 0) {
      toast({ title: "Error", description: "Debes seleccionar al menos un rubro.", variant: "destructive" });
      return;
    }
    if (hasPhysicalRubros && formData.locations.some(loc => !loc.rubro)) {
      toast({ title: "Error", description: "Debes asignar un rubro a cada local físico.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { data, error } = await signUp(formData.email, formData.password, {
      company_name: formData.companyName,
      rubros: formData.rubros,
      locales_count: hasPhysicalRubros ? formData.localesCount : 0,
      locations: hasPhysicalRubros ? formData.locations : [],
      plan_id: selectedPlan.id,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error en el registro",
        description: error.message.includes('weak_password') 
          ? 'La contraseña no cumple los requisitos de seguridad.' 
          : error.message,
        variant: "destructive",
      });
    } else if (data.user) {
      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada. Ahora serás redirigido para completar el pago.",
      });
      handleSuccessfulSignUp(data.user, selectedPlan);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <img 
              src="https://storage.googleapis.com/hostinger-horizons-assets-prod/1a278a57-ddc3-48d4-9216-30f7b1b4e998/216e817e9696a1575f704e812c10a089.png" 
              alt="Logo de Client Pulse: Medición de Satisfacción y Benchmarking" 
              className="mx-auto h-48 w-auto mb-6 object-contain"
              style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))' }}
            />
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Crea tu Cuenta
            </h1>
            <p className="text-gray-600">Comienza a medir la satisfacción de tus clientes. Plan seleccionado: <span className="font-bold text-purple-600">{selectedPlan?.name || 'Ninguno'}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="glass-effect p-8 rounded-2xl space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 text-gray-700">Información de la Cuenta</h3>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="input-field pl-10" placeholder="Email de administrador" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange} className="input-field pr-10" placeholder="Contraseña" maxLength="72" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="relative">
                  <input name="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleInputChange} className="input-field pr-10" placeholder="Confirmar contraseña" maxLength="72" required />
                </div>
              </div>
               {formData.password && (
                <div className="p-3 bg-gray-50 rounded-lg grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                  <PasswordRequirement met={passwordRequirements.isLongEnough} text="Mínimo 8 caracteres" />
                  <PasswordRequirement met={passwordRequirements.hasUpper} text="Una mayúscula" />
                  <PasswordRequirement met={passwordRequirements.hasLower} text="Una minúscula" />
                  <PasswordRequirement met={passwordRequirements.hasNumber} text="Un número" />
                  <PasswordRequirement met={passwordRequirements.hasSpecial} text="Un símbolo especial" />
                  <PasswordRequirement met={passwordRequirements.isNotTooLong} text="Máximo 72 caracteres" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 pt-4 text-gray-700">Información de la Empresa</h3>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input name="companyName" value={formData.companyName} onChange={handleInputChange} className="input-field pl-10" placeholder="Nombre de la Empresa" required />
              </div>
              <div className="relative">
                 <MultiSelectCombobox
                    options={allRubros}
                    selected={formData.rubros}
                    onChange={handleRubrosChange}
                    placeholder="Selecciona tus rubros/industrias"
                    searchPlaceholder="Buscar rubro..."
                    emptyPlaceholder="No se encontró el rubro."
                    isLoading={rubrosLoading}
                  />
              </div>
              
              {hasPhysicalRubros && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                  <div className="relative pt-4">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input name="localesCount" type="number" min="1" value={formData.localesCount} onChange={handleLocalesCountChange} className="input-field pl-10" placeholder="Número de locales físicos" required />
                  </div>
                </motion.div>
              )}
            </div>

            {hasPhysicalRubros && formData.localesCount > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 pt-4 text-gray-700">Ubicación de Locales Físicos</h3>
                {formData.locations.map((loc, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3 bg-white/50">
                    <h4 className="font-semibold text-gray-600">Local {index + 1}</h4>
                     <Select onValueChange={(value) => handleLocationChange(index, 'rubro', value)} value={loc.rubro}>
                        <SelectTrigger className="input-field">
                          <SelectValue placeholder="Asignar Rubro al Local" />
                        </SelectTrigger>
                        <SelectContent>
                          {physicalRubros.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select onValueChange={(value) => handleLocationChange(index, 'region', value)} value={loc.region}>
                        <SelectTrigger className="input-field">
                          <SelectValue placeholder="Selecciona Región" />
                        </SelectTrigger>
                        <SelectContent>
                          {regionesData.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select onValueChange={(value) => handleLocationChange(index, 'comuna', value)} value={loc.comuna} disabled={!loc.region}>
                        <SelectTrigger className="input-field">
                          <SelectValue placeholder="Selecciona Comuna" />
                        </SelectTrigger>
                        <SelectContent>
                          {(comunasData[loc.region] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input value={loc.address} onChange={e => handleLocationChange(index, 'address', e.target.value)} className="input-field pl-10" placeholder="Dirección del local (calle y número)" required />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-2 pt-4">
              <Checkbox id="terms" checked={termsAccepted} onCheckedChange={setTermsAccepted} />
              <Label htmlFor="terms" className="text-sm text-gray-600">
                Acepto los <a href="#" className="text-purple-600 hover:underline">Términos y Condiciones</a>
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onBack} disabled={loading} className="btn-secondary flex-1 disabled:opacity-50">
                Volver
              </motion.button>
              <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading || formData.rubros.length === 0 || !isPasswordValid || !termsAccepted} className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Crear Cuenta y Pagar'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}