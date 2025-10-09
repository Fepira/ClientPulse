import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const NpsGauge = ({ score, industryAverage }) => {
  const percentage = ((score + 100) / 200) * 100;
  const rotation = (percentage / 100) * 180 - 90;
  const difference = score - industryAverage;

  const getTrend = () => {
    if (difference > 0) {
      return {
        icon: <TrendingUp className="w-5 h-5 text-green-500" />,
        text: `+${difference.toFixed(1)} vs Industria`,
        color: 'text-green-600',
      };
    }
    if (difference < 0) {
      return {
        icon: <TrendingDown className="w-5 h-5 text-red-500" />,
        text: `${difference.toFixed(1)} vs Industria`,
        color: 'text-red-600',
      };
    }
    return {
      icon: <Minus className="w-5 h-5 text-gray-500" />,
      text: 'Igual a la Industria',
      color: 'text-gray-600',
    };
  };

  const trend = getTrend();

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Net Promoter Score (NPS)</h3>
      <div className="relative w-48 h-24 overflow-hidden mb-2">
        <div className="absolute top-0 left-0 w-full h-full border-[20px] border-gray-200 rounded-t-full border-b-0"></div>
        <motion.div
          className="absolute top-0 left-0 w-full h-full border-[20px] border-purple-500 rounded-t-full border-b-0"
          style={{ clipPath: `inset(0 ${100 - percentage}% 0 0)` }}
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: `inset(0 ${100 - percentage}% 0 0)` }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-10px] left-1/2 w-4 h-28 bg-gray-700 rounded-t-full origin-bottom"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
          initial={{ transform: 'translateX(-50%) rotate(-90deg)' }}
          animate={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          <div className="w-4 h-4 bg-white rounded-full absolute -top-2 left-0 border-2 border-gray-700"></div>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-5xl font-bold text-gray-800"
      >
        {score}
      </motion.div>
      <div className={`flex items-center mt-3 font-semibold ${trend.color}`}>
        {trend.icon}
        <span className="ml-2">{trend.text}</span>
      </div>
    </div>
  );
};

export default NpsGauge;