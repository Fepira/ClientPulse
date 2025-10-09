import React from 'react';
import { motion } from 'framer-motion';
import LogoSettings from '@/components/settings/company/LogoSettings';
import BusinessInfo from '@/components/settings/company/BusinessInfo';
import LocationManager from '@/components/settings/company/LocationManager';

const CompanySettings = ({ company, onCompanyUpdate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <LogoSettings company={company} onCompanyUpdate={onCompanyUpdate} />
      <BusinessInfo company={company} onCompanyUpdate={onCompanyUpdate} />
      <LocationManager company={company} onCompanyUpdate={onCompanyUpdate} />
    </motion.div>
  );
};

export default CompanySettings;