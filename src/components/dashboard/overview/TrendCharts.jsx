import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatNumber = (value) => {
  if (value === null || value === undefined) return 0;
  return Math.round(value);
};

const TrendTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
        <p className="font-bold text-gray-800 mb-1">{label}</p>
        <p className="text-purple-600">Puntaje: {payload[0].value.toFixed(1)}{unit}</p>
        <p className="text-gray-600">Respuestas: {formatNumber(data.n)}</p>
      </div>
    );
  }
  return null;
};

const TrendCharts = ({ trends }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <motion.div variants={itemVariants}>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader><CardTitle className="text-lg text-center">Tendencia CSAT</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends.csat} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                <Tooltip content={<TrendTooltip unit="%" />} />
                <Bar dataKey="score" name="CSAT" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader><CardTitle className="text-lg text-center">Tendencia NPS</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends.nps} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[-100, 100]} />
                <Tooltip content={<TrendTooltip unit="" />} />
                <Bar dataKey="score" name="NPS" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default TrendCharts;