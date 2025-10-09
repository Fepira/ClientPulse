import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { User, Mail, Phone, MapPin, Briefcase, Save, Edit3 } from 'lucide-react';

function UserProfile({ isOpen, onClose }) {
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
  }, [isOpen, user]);

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
        title: "Error al cargar perfil",
        description: "No se pudo cargar la información del perfil",
        variant: "destructive"
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
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido guardada correctamente",
      });

      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error al guardar",
        description: "No se pudo actualizar tu perfil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">Mi Perfil</h2>
            <div className="flex space-x-2">
              {!editing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditing(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={loading}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                </motion.button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {(profile.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="input-field bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="input-field"
                placeholder="Tu nombre completo"
                disabled={!editing}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Teléfono
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="input-field"
                placeholder="+56 9 1234 5678"
                disabled={!editing}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Cargo
              </label>
              <input
                type="text"
                value={profile.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="input-field"
                placeholder="Tu cargo en la empresa"
                disabled={!editing}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Departamento
              </label>
              <input
                type="text"
                value={profile.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="input-field"
                placeholder="Departamento o área"
                disabled={!editing}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Preferencias</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Notificaciones por email</span>
                  <input
                    type="checkbox"
                    checked={profile.preferences?.notifications || false}
                    onChange={(e) => handleInputChange('preferences', {
                      ...profile.preferences,
                      notifications: e.target.checked
                    })}
                    className="rounded"
                    disabled={!editing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Tema</span>
                  <select
                    value={profile.preferences?.theme || 'light'}
                    onChange={(e) => handleInputChange('preferences', {
                      ...profile.preferences,
                      theme: e.target.value
                    })}
                    className="text-sm border rounded px-2 py-1"
                    disabled={!editing}
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Oscuro</option>
                  </select>
                </div>
              </div>
            </div>

            {editing && (
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditing(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default UserProfile;