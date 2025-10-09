import React from 'react';
import { motion } from 'framer-motion';
import ComparativeAnalysis from '@/components/dashboard/ComparativeAnalysis';

const Benchmarking = ({ company, activeRubro }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <ComparativeAnalysis company={company} activeRubro={activeRubro} />
    </motion.div>
  );
};

export default Benchmarking;