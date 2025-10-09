import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowUp, ArrowDown, Minus, Info } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/customSupabaseClient';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const formatNumber = (value) => {
  if (value === null || value === undefined) return 0;
  return Math.round(value);
};

const capitalize = (s) => {
  if (typeof s !== 'string' || s.length === 0) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const MetricInfo = ({ type, criteria }) => {
  if (!criteria) {
    return <LoadingSpinner text="Cargando..." />;
  }

  const npsInfo = {
    definition: `Mide la lealtad y la probabilidad de que sus clientes recomienden su empresa. Se basa en una única pregunta: \"¿Qué tan probable es que recomiende nuestra empresa/producto/servicio a un amigo o colega?\" en una escala de 0 a 10.`,
    calculation: `Se consideran Promotores las notas de ${criteria.promoter_threshold} o más, y Detractores hasta la nota ${criteria.detractor_threshold}.`,
    formula: "NPS = (% Promotores − % Detractores)"
  };

  const csatInfo = {
    definition: `Mide el nivel de satisfacción del cliente con un producto, servicio o interacción específica. Generalmente se pregunta: \"¿Qué tan satisfecho quedó con [aspecto a medir]?\" en una escala de 1 a 10.`,
    calculation: `Se calcula dividiendo el número de clientes satisfechos (puntuaciones de ${criteria.satisfied_threshold} y ${criteria.scale_max}) entre el número total de respuestas a esa pregunta.`,
    formula: `CSAT = (Nº Respuestas (${criteria.satisfied_threshold} y ${criteria.scale_max}) / Nº Total Respuestas) × 100`
  };

  const info = type === 'NPS' ? npsInfo : csatInfo;

  return (
    <div className="space-y-3 p-1">
      <div>
        <p className="font-bold text-sm">Definición:</p>
        <p className="text-xs text-muted-foreground">{info.definition}</p>
      </div>
      <div>
        <p className="font-bold text-sm">Cálculo:</p>
        <p className="text-xs text-muted-foreground">{info.calculation}</p>
      </div>
      <div>
        <p className="font-bold text-sm">Fórmula:</p>
        <p className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded-md mt-1">{info.formula}</p>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, unit = '', change, description, children, kpiCriteria }) => {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0 || change === null || change === undefined;

  const changeColor = isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-500';
  const ChangeIcon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus;
  
  const displayValue = title.includes("Encuestas") ? formatNumber(value) : (value || 0).toFixed(1);
  const displayChange = title.includes("Encuestas") ? formatNumber(Math.abs(change || 0)) : Math.abs(change || 0).toFixed(1);

  const metricType = title.includes('NPS') ? 'NPS' : title.includes('CSAT') ? 'CSAT' : null;

  return (
    <Card className="glass-effect p-6 flex flex-col justify-between text-center shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="p-2 flex-row justify-center items-center">
        <CardTitle className="text-xl font-bold text-gray-800">{title}</CardTitle>
        {metricType && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="w-6 h-6 ml-2">
                <Info className="w-4 h-4 text-gray-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <MetricInfo type={metricType} criteria={metricType === 'NPS' ? kpiCriteria?.nps : kpiCriteria?.csat} />
            </PopoverContent>
          </Popover>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center p-2">
        <p className="text-5xl font-extrabold gradient-text leading-tight mb-2">
          {displayValue}{unit}
        </p>
        <div className="flex items-center text-sm font-semibold">
          {!isNeutral && <ChangeIcon className={`w-4 h-4 mr-1 ${changeColor}`} />}
          <span className={changeColor}>{!isNeutral ? displayChange : '0.0'}{unit}</span>
          <span className="text-gray-500 ml-1">{description}</span>
        </div>
        {children && <div className="mt-4 w-full">{children}</div>}
      </CardContent>
    </Card>
  );
};

const KpiCards = ({ metrics, timePeriod }) => {
  const [kpiCriteria, setKpiCriteria] = useState(null);

  useEffect(() => {
    const fetchKpiCriteria = async () => {
      const { data, error } = await supabase.from('kpi_criteria').select('*');
      if (!error && data) {
        const criteriaMap = data.reduce((acc, item) => {
          acc[item.kpi_name] = item.criteria;
          return acc;
        }, {});
        setKpiCriteria(criteriaMap);
      }
    };
    
    fetchKpiCriteria();

    const channel = supabase
      .channel('kpi-criteria-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kpi_criteria' }, fetchKpiCriteria)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const periodDescription = timePeriod === 'current_month' ? 'vs mes anterior' : 'vs período anterior';

  const getPeriodTitle = () => {
    if (timePeriod === 'current_month') {
        const monthName = format(new Date(), 'LLLL', { locale: es });
        return capitalize(monthName);
    }
    return metrics.periodName || 'Período Actual';
  };
  const periodTitle = getPeriodTitle();

  return (
    <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <motion.div variants={itemVariants}>
        <KpiCard title={`Encuestas de ${periodTitle}`} value={metrics.totalResponses.current} change={metrics.totalResponses.change} description={periodDescription} kpiCriteria={kpiCriteria} />
      </motion.div>
      <motion.div variants={itemVariants}>
        <KpiCard title={`CSAT de ${periodTitle}`} value={metrics.csat.current} unit="%" change={metrics.csat.change} description={periodDescription} kpiCriteria={kpiCriteria} />
      </motion.div>
      <motion.div variants={itemVariants}>
        <KpiCard title={`NPS de ${periodTitle}`} value={metrics.nps.current} unit="" change={metrics.nps.change} description={periodDescription} kpiCriteria={kpiCriteria}>
            <div className="flex justify-around w-full text-xs mt-2 pt-2 border-t">
                <div className="text-green-600 font-semibold">Promotores: {(metrics.nps.promotersPercent || 0).toFixed(1)}%</div>
                <div className="text-red-600 font-semibold">Detractores: {(metrics.nps.detractorsPercent || 0).toFixed(1)}%</div>
            </div>
        </KpiCard>
      </motion.div>
    </motion.div>
  );
};

export default KpiCards;