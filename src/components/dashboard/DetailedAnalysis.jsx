import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const TrendArrow = ({ value }) => {
  if (value === null || value === undefined || isNaN(value) || Math.abs(value) < 0.01) {
    return <Minus className="w-4 h-4 text-gray-500" />;
  }
  if (value > 0) {
    return <ArrowUp className="w-4 h-4 text-green-500" />;
  }
  return <ArrowDown className="w-4 h-4 text-red-500" />;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded-lg shadow-lg border text-sm">
        <p className="font-bold text-gray-800">{label}</p>
        <p style={{ color: payload[0].fill }}>
          Puntaje: {data.score.toFixed(1)}
        </p>
        <p className="text-muted-foreground">
          Respuestas: {data.count}
        </p>
      </div>
    );
  }
  return null;
};

const DetailedAnalysis = ({ data }) => {
  if (!data || !data.questions || data.questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis Detallado por Categoría</CardTitle>
          <CardDescription>Compara el rendimiento de cada aspecto evaluado en tus encuestas.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">No hay datos de análisis detallado disponibles.</p>
        </CardContent>
      </Card>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const groupVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  
  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Análisis Detallado por Categoría</CardTitle>
          <CardDescription>Evolución de cada ítem evaluado comparado con los 3 meses anteriores.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {data.questions.map((question) => {
              if (!question.options_results || question.options_results.length === 0) return null;

              const groupTitle = question.classification_title || question.question_text;

              return (
                <motion.div key={question.question_id} variants={groupVariants} className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-800">{groupTitle}</h3>
                  <div className="space-y-6 rounded-lg bg-slate-50 p-4">
                  {question.options_results.map((item, index) => {
                     const trendChartData = (item.trend || []).map(t => ({
                        month: new Date(t.month + '-02').toLocaleString('es-CL', { month: 'short' }),
                        score: parseFloat(t.mean.toFixed(1)),
                        count: t.count
                      }));

                     return (
                        <motion.div 
                          key={item.option_id}
                          variants={itemVariants}
                          transition={{ delay: index * 0.1 }}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-b border-slate-200 pb-4 last:border-b-0"
                        >
                          <div className="md:col-span-1">
                            <p className="font-semibold">{item.label}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-base">{item.current_score.toFixed(1)}</Badge>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <TrendArrow value={item.difference} />
                                <span>{item.difference?.toFixed(1) || '0.0'} vs 3m</span>
                              </div>
                            </div>
                             <p className="text-xs text-muted-foreground mt-1">
                                (n={item.current_count})
                              </p>
                          </div>
                          <div className="md:col-span-2 h-24">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={trendChartData} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis domain={[0, 5]} hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="score" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                  <LabelList dataKey="score" position="top" style={{ fill: '#333', fontSize: '12px' }} />
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </motion.div>
                     )
                  })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DetailedAnalysis;