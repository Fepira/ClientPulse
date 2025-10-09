import React from 'react';
    import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
    import { Smile, Frown, Meh } from 'lucide-react';
    
    const COLORS = {
        positivos: '#10b981', // Emerald-500
        negativos: '#ef4444', // Red-500
        neutros: '#6b7280',  // Gray-500
    };
    
    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white/80 backdrop-blur-sm p-2 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-bold">{`${payload[0].name}: ${payload[0].value} (${(payload[0].payload.percent * 100).toFixed(1)}%)`}</p>
          </div>
        );
      }
      return null;
    };
    
    const SentimentAnalysisChart = ({ sentimentData }) => {
      const { positive_count, negative_count, neutral_count } = sentimentData;
      const total = positive_count + negative_count + neutral_count;
    
      if (total === 0) {
        return <div className="text-center text-muted-foreground p-4">No hay datos de sentimiento para mostrar.</div>;
      }
    
      const chartData = [
        { name: 'Positivos', value: positive_count, percent: total > 0 ? positive_count / total : 0 },
        { name: 'Negativos', value: negative_count, percent: total > 0 ? negative_count / total : 0 },
        { name: 'Neutros', value: neutral_count, percent: total > 0 ? neutral_count / total : 0 },
      ].filter(d => d.value > 0);
    
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-1 flex flex-col gap-4">
                <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <Smile className="h-6 w-6 text-green-500 mr-3" />
                    <div>
                        <p className="font-bold text-lg">{positive_count}</p>
                        <p className="text-sm text-muted-foreground">Comentarios Positivos</p>
                    </div>
                </div>
                <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <Frown className="h-6 w-6 text-red-500 mr-3" />
                    <div>
                        <p className="font-bold text-lg">{negative_count}</p>
                        <p className="text-sm text-muted-foreground">Comentarios Negativos</p>
                    </div>
                </div>
                 <div className="flex items-center p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <Meh className="h-6 w-6 text-gray-500 mr-3" />
                    <div>
                        <p className="font-bold text-lg">{neutral_count}</p>
                        <p className="text-sm text-muted-foreground">Comentarios Neutros</p>
                    </div>
                </div>
            </div>
            <div className="md:col-span-2 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={110}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                if (percent < 0.05) return null;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                return (
                                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-sm drop-shadow-sm">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                                );
                            }}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()]} stroke={COLORS[entry.name.toLowerCase()]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      );
    };
    
    export default SentimentAnalysisChart;