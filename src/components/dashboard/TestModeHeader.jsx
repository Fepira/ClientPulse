import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TestModeHeader = () => {
  const { signOut } = useAuth();

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      exit={{ y: -100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-yellow-400 text-yellow-900 py-2 px-6 flex items-center justify-center text-sm font-semibold fixed top-0 w-full z-50 shadow-lg"
    >
      <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
      <p className="flex-grow text-center">
        Estás en <span className="font-bold">MODO DEMO</span>. Los datos son de prueba y los cambios no se guardarán.
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={signOut}
        className="ml-4 hover:bg-yellow-500/50"
      >
        Salir del Modo Demo
        <X className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
};

export default TestModeHeader;