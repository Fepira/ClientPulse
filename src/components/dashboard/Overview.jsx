import React, { useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { Separator } from '@/components/ui/separator';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Label } from "@/components/ui/label";
    import { format } from 'date-fns';
    import { es } from 'date-fns/locale';
    
    import KpiCards from './overview/KpiCards';
    import TrendCharts from './overview/TrendCharts';
    import DemographicCharts from './overview/DemographicCharts';
    import SegmentCharts from './overview/SegmentCharts';
    import TextAnalysis from './overview/TextAnalysis';
    
    const capitalize = (s) => {
      if (typeof s !== 'string' || s.length === 0) return '';
      return s.charAt(0).toUpperCase() + s.slice(1);
    };
    
    const Overview = ({ metrics, timePeriod, onTimePeriodChange, company, onLocaleChange, activeLocale, activeRubro }) => {
      const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
      };
    
      const localesForRubro = useMemo(() => {
        return company?.locations?.filter(l => l.rubro === activeRubro).map(l => l.address).filter(Boolean) || [];
      }, [company, activeRubro]);
      
      const showLocaleFilter = localesForRubro.length > 0;
      
      if (!metrics) {
        return <p className="text-center text-gray-500">Cargando métricas...</p>;
      }
    
      const getPeriodTitle = () => {
        if (timePeriod === 'current_month') {
            const monthName = format(new Date(), 'LLLL', { locale: es });
            return capitalize(monthName);
        }
        return metrics.periodName || 'Período Actual';
      };
    
      const periodTitle = getPeriodTitle();
    
      return (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-12"
        >
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <div className="text-center sm:text-left mb-4 sm:mb-0">
                    <h2 className="text-3xl font-bold gradient-text">Visión General</h2>
                    <p className="text-muted-foreground">Un vistazo rápido al rendimiento de tu empresa.</p>
                </div>
                <div className="flex items-center gap-4">
                    {showLocaleFilter && (
                      <div className="flex items-center gap-2">
                        <Label htmlFor="locale-select" className="text-sm font-medium">Local:</Label>
                        <Select value={activeLocale} onValueChange={onLocaleChange}>
                            <SelectTrigger id="locale-select" className="w-[180px] bg-white">
                                <SelectValue placeholder="Seleccionar local" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los locales</SelectItem>
                                {localesForRubro.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                            </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Label htmlFor="time-period-select" className="text-sm font-medium">Período:</Label>
                      <Select value={timePeriod} onValueChange={onTimePeriodChange}>
                          <SelectTrigger id="time-period-select" className="w-[180px] bg-white">
                              <SelectValue placeholder="Seleccionar período" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="current_month">Mes Actual</SelectItem>
                              <SelectItem value="last_3_months">Últimos 3 Meses</SelectItem>
                              <SelectItem value="last_6_months">Último Semestre</SelectItem>
                              <SelectItem value="last_12_months">Último Año</SelectItem>
                          </SelectContent>
                      </Select>
                    </div>
                </div>
            </div>
            <Separator className="mb-8 bg-gray-200" />
            <KpiCards metrics={metrics} timePeriod={timePeriod} />
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-center mb-2">Tendencias (Últimos 12 Meses)</h2>
            <p className="text-center text-muted-foreground mb-6">Evolución de tus métricas clave.</p>
            <Separator className="mb-8 bg-gray-200" />
            <TrendCharts trends={metrics.trends} />
          </section>

          <section>
            <h2 className="text-2xl font-bold text-center mb-2">Análisis de Comentarios ({periodTitle})</h2>
            <p className="text-center text-muted-foreground mb-6">La voz de tus clientes en sus propias palabras.</p>
            <Separator className="mb-8 bg-gray-200" />
            <TextAnalysis companyId={company.id} activeRubro={activeRubro} activeLocale={activeLocale} timePeriod={timePeriod} />
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-center mb-2">Análisis Demográfico ({periodTitle})</h2>
            <p className="text-center text-muted-foreground mb-6">Conoce quiénes son tus clientes.</p>
            <Separator className="mb-8 bg-gray-200" />
            <DemographicCharts demographics={metrics.demographics} />
          </section>
    
          <section>
            <h2 className="text-2xl font-bold text-center mb-2">Métricas por Segmento ({periodTitle})</h2>
            <p className="text-center text-muted-foreground mb-6">Desglose de métricas por características demográficas.</p>
            <Separator className="mb-8 bg-gray-200" />
            <SegmentCharts demographics={metrics.demographics} />
          </section>
        </motion.div>
      );
    };
    
    export default Overview;