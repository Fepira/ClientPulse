import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const Variation = ({ label, value }) => {
  const Icon = value > 0 ? ArrowUp : value < 0 ? ArrowDown : Minus;
  const color = value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-gray-500';
  const formattedValue = value ? value.toFixed(1) : '0.0';

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-500">{label}</span>
      <div className={`flex items-center font-semibold ${color}`}>
        <Icon className="w-4 h-4" />
        <span>{formattedValue}</span>
      </div>
    </div>
  );
};

const RadialProgress = ({ title, percentage, variations }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const validPercentage = percentage && !isNaN(percentage) ? percentage : 0;
  const offset = circumference - (validPercentage / 100) * circumference;
  const color = validPercentage >= 75 ? 'stroke-green-500' : 'stroke-orange-500';
  const textColor = validPercentage >= 75 ? 'text-green-600' : 'text-orange-600';

  return (
    <motion.div 
      className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-between h-full"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 140 140">
          <circle
            className="stroke-gray-200"
            strokeWidth="12"
            fill="transparent"
            r={radius}
            cx="70"
            cy="70"
          />
          <motion.circle
            className={color}
            strokeWidth="12"
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="70"
            cy="70"
            style={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            className={`text-4xl font-bold ${textColor}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {validPercentage.toFixed(0)}%
          </motion.span>
        </div>
      </div>
      <div className="w-full mt-6 pt-4 border-t border-gray-200">
        <p className="text-center text-sm font-semibold text-gray-600 mb-3">Variación (vs. período anterior)</p>
        <div className="flex justify-around">
          <Variation label="Mensual" value={variations.monthly} />
          <Variation label="Semestral" value={variations.semiannual} />
          <Variation label="Anual" value={variations.annual} />
        </div>
      </div>
    </motion.div>
  );
};

export default RadialProgress;