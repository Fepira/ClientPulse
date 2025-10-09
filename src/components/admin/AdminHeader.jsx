import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Shield } from 'lucide-react';

function AdminHeader({ onSignOut }) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text flex items-center">
              <Shield className="w-8 h-8 mr-3 text-blue-600" />
              Panel de Administración
            </h1>
            <p className="text-gray-600">ClientPulse- Gestión del Sistema</p>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;