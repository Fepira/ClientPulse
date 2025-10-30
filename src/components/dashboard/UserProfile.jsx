import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Briefcase, Save, Edit3 } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import ProfileAvatar from '@/components/user-profile/ProfileAvatar';
import ProfileField from '@/components/user-profile/ProfileField';
import PreferencesSection from '@/components/user-profile/PreferencesSection';

function UserProfile({ isOpen, onClose }) {
  const { profile, loading, editing, setEditing, handleSave, handleInputChange, user } = useUserProfile({ isOpen });

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
              <ProfileAvatar initial={(profile.full_name?.[0] || user?.email?.[0] || 'U')} />
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

            <ProfileField
              label="Nombre Completo"
              value={profile.full_name}
              onChange={(val) => handleInputChange('full_name', val)}
              placeholder="Tu nombre completo"
              disabled={!editing}
            />

            <ProfileField
              label="Teléfono"
              icon={Phone}
              type="tel"
              value={profile.phone}
              onChange={(val) => handleInputChange('phone', val)}
              placeholder="+56 9 1234 5678"
              disabled={!editing}
            />

            <ProfileField
              label="Cargo"
              icon={Briefcase}
              value={profile.position}
              onChange={(val) => handleInputChange('position', val)}
              placeholder="Tu cargo en la empresa"
              disabled={!editing}
            />

            <ProfileField
              label="Departamento"
              icon={MapPin}
              value={profile.department}
              onChange={(val) => handleInputChange('department', val)}
              placeholder="Departamento o área"
              disabled={!editing}
            />

            <PreferencesSection
              preferences={profile.preferences}
              disabled={!editing}
              onChange={(prefs) => handleInputChange('preferences', prefs)}
            />

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