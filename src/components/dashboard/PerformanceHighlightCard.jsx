import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const PerformanceHighlightCard = ({ title, item, type }) => {
  if (!item) {
    return null;
  }

  const isBest = type === 'best';
  const scoreColorClass = isBest ? 'text-green-600' : 'text-red-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center justify-center p-4">
          <p className="text-center text-xl font-medium mb-2">{item.name}</p>
          <p className={cn("text-5xl font-bold", scoreColorClass)}>
            {item.score !== null ? item.score.toFixed(1) : 'N/A'}
          </p>
          {item.count !== null && item.count !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              (n={item.count})
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PerformanceHighlightCard;