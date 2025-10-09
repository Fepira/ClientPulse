import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatNumber = (value) => {
  if (value === null || value === undefined) return 0;
  return Math.round(value);
};

const SegmentTooltip = ({ active, payload, label, unit = "" }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const dataKey = payload[0].dataKey;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
        <p className="font-bold text-gray-800 mb-1">{label}</p>
        <p style={{ color: payload[0].color }}>{dataKey.toUpperCase()}: {payload[0].value.toFixed(1)}{unit}</p>
        <p className="text-gray-600">Respuestas: {formatNumber(data.n)}</p>
      </div>
    );
  }
  return null;
};

const SegmentChart = ({ data, title, dataKey, barColor, axisDomain = [0, 100], yAxisKey, unit = "" }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="w-full h-full shadow-lg flex items-center justify-center text-center p-4">
        <CardContent className="p-0">
          <p className="text-muted-foreground">No hay datos para {title.toLowerCase()}.</p>
        </CardContent>
      </Card>
    );
  }

  const filteredData = data.filter(d => d[dataKey] !== null && d[yAxisKey]);

  if (filteredData.length === 0) {
    return (
      <Card className="w-full h-full shadow-lg flex items-center justify-center text-center p-4">
        <CardContent className="p-0">
          <p className="text-muted-foreground">No hay datos válidos para {title.toLowerCase()}.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart layout="vertical" data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={axisDomain} tickFormatter={(tick) => `${tick}${unit}`} />
            <YAxis type="category" dataKey={yAxisKey} width={80} tick={{ fontSize: 12 }} />
            <Tooltip content={<SegmentTooltip unit={unit} />} cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }} />
            <Bar dataKey={dataKey} fill={barColor} name={dataKey.toUpperCase()} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};


const SegmentCharts = ({ demographics }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <motion.div variants={itemVariants}>
        <SegmentChart data={demographics.metricsByGender} title="CSAT por Género" dataKey="csat" barColor="#f97316" yAxisKey="gender" unit="%" />
      </motion.div>
      <motion.div variants={itemVariants}>
        <SegmentChart data={demographics.metricsByGender} title="NPS por Género" dataKey="nps" barColor="#a855f7" axisDomain={[-100, 100]} yAxisKey="gender" />
      </motion.div>
      <motion.div variants={itemVariants}>
        <SegmentChart data={demographics.metricsByAge} title="CSAT por Rango de Edad" dataKey="csat" barColor="#f97316" yAxisKey="age_range" unit="%" />
      </motion.div>
      <motion.div variants={itemVariants}>
        <SegmentChart data={demographics.metricsByAge} title="NPS por Rango de Edad" dataKey="nps" barColor="#a855f7" axisDomain={[-100, 100]} yAxisKey="age_range" />
      </motion.div>
    </motion.div>
  );
};

export default SegmentCharts;