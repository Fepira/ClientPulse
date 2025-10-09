import React from 'react';
import { motion } from 'framer-motion';

function LoadingSpinner({ text = "Cargando...", fullScreen = true }) {
  const containerClasses = fullScreen 
    ? "min-h-screen bg-gray-50 flex items-center justify-center"
    : "flex flex-col items-center justify-center p-10";

  return (
    <div className={containerClasses}>
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-semibold gradient-text">{text}</p>
      </motion.div>
    </div>
  );
}

export default LoadingSpinner;