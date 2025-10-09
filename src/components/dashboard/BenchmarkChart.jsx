import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border">
        <p className="font-bold text-gray-800">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {`${p.name}: ${p.value.toFixed(1)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BenchmarkChart = ({ data, title }) => {
  const colors = {
    'Tu Negocio': '#8884d8',
    'Promedio Industria': '#82ca9d',
    'Top Performers': '#ffc658',
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(238, 242, 255, 0.6)' }} />
          <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
          {Object.keys(data[0] || {})
            .filter(key => key !== 'name')
            .map(key => (
              <Bar key={key} dataKey={key} name={key} fill={colors[key] || '#cccccc'} radius={[4, 4, 0, 0]} />
            ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BenchmarkChart;