import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const companyPayload = payload.find(p => p.dataKey === 'company_mean');
    const industryPayload = payload.find(p => p.dataKey === 'industry_mean');

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
        <p className="font-bold text-gray-800 mb-2">{label}</p>
        {companyPayload && companyPayload.value > 0 && (
          <p style={{ color: companyPayload.fill }}>
            Tu Empresa: {companyPayload.value.toFixed(1)} ({companyPayload.payload.company_count || 0} resp.)
          </p>
        )}
        {industryPayload && industryPayload.value > 0 && (
          <p style={{ color: industryPayload.fill }}>
            Industria: {industryPayload.value.toFixed(1)} ({industryPayload.payload.industry_count || 0} resp.)
          </p>
        )}
      </div>
    );
  }
  return null;
};

const CustomizedLabel = (props) => {
  const { x, y, width, height, value } = props;
  if (!value || value === 0) return null;
  return (
    <text x={x + width / 2} y={y + height / 2} fill="#fff" textAnchor="middle" dy=".3em" fontSize={12} fontWeight="bold">
      {value.toFixed(1)}
    </text>
  );
};

const CustomXAxisTick = ({ x, y, payload }) => {
  const words = payload.value.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > 20) { // Max length per line
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine += ` ${word}`;
    }
  });
  lines.push(currentLine.trim());

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, index) => (
        <text key={index} x={0} y={0} dy={16 + index * 12} textAnchor="middle" fill="#666" fontSize={11}>
          {line.trim()}
        </text>
      ))}
    </g>
  );
};

const CategoryChart = ({ questionData }) => {
  const { question_text, results, items_to_evaluate } = questionData;
  const [selectedItem, setSelectedItem] = useState('all');

  const chartData = useMemo(() => {
    if (!results || !items_to_evaluate) return [];

    const companyResults = results.company || {};
    const industryResults = results.industry || {};

    const itemsToDisplay = selectedItem === 'all' 
      ? items_to_evaluate 
      : items_to_evaluate.filter(item => item.id === selectedItem);

    return itemsToDisplay.map(item => {
      const companyResult = companyResults[item.id] || { mean: 0, count: 0 };
      const industryResult = industryResults[item.id] || { mean: 0, count: 0 };
      return {
        name: item.text,
        company_mean: companyResult.mean,
        company_count: companyResult.count,
        industry_mean: industryResult.mean,
        industry_count: industryResult.count,
      };
    });
  }, [results, items_to_evaluate, selectedItem]);

  const companyMeans = chartData.map(d => d.company_mean).filter(m => m > 0);
  const highestCompanyMean = companyMeans.length > 0 ? Math.max(...companyMeans) : -1;
  const lowestCompanyMean = companyMeans.length > 0 ? Math.min(...companyMeans) : -1;

  const isSingleItemView = selectedItem !== 'all';
  const chartHeight = 300;
  const xAxisHeight = isSingleItemView ? 40 : 80;

  const colors = {
    company: {
      default: 'rgba(136, 132, 216, 0.8)', // purple
      highlight: 'rgba(167, 139, 250, 1)', // lighter purple
      lowlight: 'rgba(109, 40, 217, 1)', // darker purple
    },
    industry: {
      default: 'rgba(130, 202, 157, 0.8)', // green
    }
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <CardTitle className="text-lg text-center sm:text-left flex-1">{question_text}</CardTitle>
          {items_to_evaluate && items_to_evaluate.length > 1 && (
            <Select onValueChange={setSelectedItem} value={selectedItem}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Filtrar por categoría..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {items_to_evaluate.map(item => (
                  <SelectItem key={item.id} value={item.id}>{item.text}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              height={xAxisHeight}
              interval={0} 
              tick={isSingleItemView ? { fontSize: 11, dy: 5 } : <CustomXAxisTick />}
            />
            <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(238, 242, 255, 0.6)' }} />
            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
            <Bar dataKey="industry_mean" name="Promedio Industria" fill={colors.industry.default} radius={[4, 4, 0, 0]} barSize={40}>
               <LabelList dataKey="industry_mean" content={<CustomizedLabel />} />
            </Bar>
            <Bar dataKey="company_mean" name="Tu Empresa" barSize={40} radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => {
                  let color = colors.company.default;
                  if(entry.company_mean > 0) {
                      if (entry.company_mean === highestCompanyMean) color = colors.company.highlight;
                      if (entry.company_mean === lowestCompanyMean) color = colors.company.lowlight;
                  }
                  return <Cell key={`cell-${index}`} fill={color} />;
              })}
              <LabelList dataKey="company_mean" content={<CustomizedLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryChart;