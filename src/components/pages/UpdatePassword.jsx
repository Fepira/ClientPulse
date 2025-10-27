import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function UpdatePasswordPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Sesión requerida', description: 'Abre el enlace del correo de recuperación y vuelve a intentar.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Las contraseñas no coinciden.', variant: 'destructive' });
      return;
    }
    if (password.length < 8 || password.length > 72) {
      toast({ title: 'Requisitos', description: 'La contraseña debe tener entre 8 y 72 caracteres.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Listo', description: 'Tu contraseña fue actualizada correctamente.' });
      // Redirige al login
      window.location.hash = '/login';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md glass-effect p-8 rounded-2xl">
        <h1 className="text-3xl font-bold gradient-text mb-6">Actualizar Contraseña</h1>
        <p className="text-gray-600 mb-6">Ingresa una nueva contraseña para tu cuenta.</p>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pr-12"
              placeholder="Nueva contraseña"
              maxLength={72}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Confirmar nueva contraseña"
              maxLength={72}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Actualizar'}
          </button>
        </form>
      </div>
    </div>
  );
}