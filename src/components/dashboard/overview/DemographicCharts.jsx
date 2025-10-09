import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatNumber = (value) => {
  if (value === null || value === undefined) return 0;
  return Math.round(value);
};

const DonutChart = ({ data, title, colors }) => {
  const total = data.reduce((acc, entry) => acc + entry.value, 0);
  if (!data || data.length === 0 || total === 0) {
    return (
      <Card className="w-full h-full shadow-lg flex items-center justify-center text-center p-4">
        <CardContent className="p-0">
          <p className="text-muted-foreground">No hay datos para {title.toLowerCase()}.</p>
        </CardContent>
      </Card>
    );
  }

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="w-full h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${formatNumber(value)} (${((value / total) * 100).toFixed(1)}%)`, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const DemographicCharts = ({ demographics }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  
  const DONUT_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

  return (
    <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <motion.div variants={itemVariants}>
        <DonutChart data={demographics.byGender} title="Distribución por Género" colors={DONUT_COLORS} />
      </motion.div>
      <motion.div variants={itemVariants}>
        <DonutChart data={demographics.byAge} title="Distribución por Edad" colors={DONUT_COLORS.slice(2)} />
      </motion.div>
    </motion.div>
  );
};

export default DemographicCharts;