import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AnalysisHighlightCard = ({ icon, bgColor, title, question, category, mean }) => {
  return (
    <Card className={`text-white overflow-hidden shadow-xl h-full ${bgColor}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <div className="p-3 bg-white/20 rounded-full">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold mb-1">
          {mean ? mean.toFixed(1) : 'N/A'}
          <span className="text-xl font-medium">/ 5</span>
        </div>
        <p className="text-sm font-semibold opacity-90">{category}</p>
        <p className="text-xs opacity-80">{question}</p>
      </CardContent>
    </Card>
  );
};

export default AnalysisHighlightCard;