import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function BillingFooter({ onBackToLanding }) {
  return (
    <div className="p-6 bg-gray-50/50 flex justify-start">
      <motion.button
        type="button"
        onClick={() => onBackToLanding && onBackToLanding()}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="btn-secondary flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al Inicio
      </motion.button>
    </div>
  );
}