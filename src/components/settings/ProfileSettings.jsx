import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (profileData.password || profileData.confirmPassword) {
        if (profileData.password !== profileData.confirmPassword) {
          toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
          setLoading(false);
          return;
        }
        if (profileData.password.length < 6) {
          toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres.", variant: "destructive" });
          setLoading(false);
          return;
        }
        const { error: passwordError } = await supabase.auth.updateUser({ password: profileData.password });
        if (passwordError) throw passwordError;
        toast({ title: "Éxito", description: "Contraseña actualizada correctamente." });
        setProfileData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        toast({ title: "Información", description: "No se realizaron cambios en el perfil." });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Error", description: `Error al actualizar perfil: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Perfil de Usuario</h3>
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={profileData.email} disabled className="bg-gray-100" />
        </div>
        <div>
          <Label htmlFor="password">Nueva Contraseña</Label>
          <Input id="password" name="password" type="password" value={profileData.password} onChange={handleProfileChange} placeholder="Deja vacío para no cambiar" />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" value={profileData.confirmPassword} onChange={handleProfileChange} />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar Cambios
        </Button>
      </form>
    </div>
  );
}

export default ProfileSettings;