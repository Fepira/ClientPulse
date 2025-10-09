import React from 'react';
import { motion } from 'framer-motion';
import { Building2, FileText, BarChart3 } from 'lucide-react';

function AdminStatsCards({ stats }) {
  const statsData = [
    {
      title: 'Total Empresas',
      value: stats.totalCompanies,
      icon: <Building2 className="w-8 h-8 text-white" />,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      title: 'Total Plantillas Encuestas',
      value: stats.totalSurveys,
      icon: <FileText className="w-8 h-8 text-white" />,
      color: 'from-green-400 to-emerald-500'
    },
    {
      title: 'Total Respuestas',
      value: stats.totalResponses,
      icon: <BarChart3 className="w-8 h-8 text-white" />,
      color: 'from-purple-400 to-pink-500'
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-lg card-hover"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
          <p className="text-gray-600 text-sm">{stat.title}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default AdminStatsCards;