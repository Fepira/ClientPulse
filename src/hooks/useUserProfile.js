import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

// Hook que encapsula la lógica de estado y llamadas a API para el perfil de usuario
export function useUserProfile({ isOpen }) {
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    position: '',
    department: '',
    preferences: {}
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user) {
      loadUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?.id]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        const newProfile = {
          user_id: user.id,
          full_name: user.raw_user_meta_data?.name || '',
          phone: '',
          position: '',
          department: '',
          preferences: { theme: 'light', notifications: true, language: 'es' }
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(createdProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast({
        title: 'Error al cargar perfil',
        description: 'No se pudo cargar la información del perfil',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          ...profile,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Perfil actualizado',
        description: 'Tu información ha sido guardada correctamente',
      });

      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error al guardar',
        description: 'No se pudo actualizar tu perfil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return {
    profile,
    setProfile,
    loading,
    editing,
    setEditing,
    loadUserProfile,
    handleSave,
    handleInputChange,
    user,
  };
}