import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Text, Label as RechartsLabel } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.jsx";
import { Button } from '@/components/ui/button';
import { regionesData, comunasData } from '@/data/chile-locations';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        <p className="text-sm">{`Empresas: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const CustomizedYAxisTick = (props) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <Text x={0} y={0} dy={5} textAnchor="end" fill="#666" style={{ fontWeight: 600 }}>
        {payload.value}
      </Text>
    </g>
  );
};

const formatValue = (value, unit = '') => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">S/I</span>;
  }
  return `${value.toFixed(1)}${unit}`;
};

const RankingTable = ({ title, data, valueKey, unit = '' }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {data && data.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rubro</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.rubro_name}>
                <TableCell className="font-medium">{item.rubro_name}</TableCell>
                <TableCell className="text-right font-semibold">{formatValue(item[valueKey], unit)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : <p className="text-center text-muted-foreground text-sm">No hay suficientes datos para el ranking.</p>}
    </CardContent>
  </Card>
);

function OverviewTab() {
  const [filters, setFilters] = useState({ region: 'all', comuna: 'all' });
  const [countsByRubro, setCountsByRubro] = useState([]);
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const handleFilterChange = (type, value) => {
    setFilters(prev => {
      if (type === 'region') {
        return { ...prev, region: value, comuna: 'all' };
      }
      return { ...prev, [type]: value };
    });
  };

  const comunasForSelectedRegion = useMemo(() => {
    return filters.region !== 'all' ? comunasData[filters.region] || [] : [];
  }, [filters.region]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const p_region = filters.region === 'all' ? null : filters.region;
      const p_comuna = filters.comuna === 'all' ? null : filters.comuna;

      const [countsRes, kpisRes] = await Promise.all([
        supabase.rpc('get_company_count_by_rubro', { p_region, p_comuna }),
        supabase.rpc('get_latest_benchmark_metrics')
      ]);

      if (countsRes.error) throw countsRes.error;
      if (kpisRes.error) throw kpisRes.error;

      setCountsByRubro(countsRes.data || []);
      setKpiData(kpisRes.data || []);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al cargar datos",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleManualRecalculation = async () => {
    setIsCalculating(true);
    toast({
      title: 'Iniciando recálculo manual',
      description: 'Este proceso puede tardar unos minutos. Los datos se actualizarán automáticamente al finalizar.',
    });
    try {
      const { error } = await supabase.rpc('calculate_and_store_benchmark_metrics');
      if (error) throw error;
      toast({
        title: '¡Recálculo completado!',
        description: 'Las métricas de benchmark han sido actualizadas.',
      });
      fetchData(); // Refresh data after calculation
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error en el recálculo",
        description: error.message,
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const sortedKpiData = useMemo(() => {
    const validData = kpiData.filter(item => item.csat_average !== null && item.nps_average !== null);
    const topCsat = [...validData].sort((a, b) => b.csat_average - a.csat_average).slice(0, 3);
    const bottomCsat = [...validData].sort((a, b) => a.csat_average - b.csat_average).slice(0, 3);
    const topNps = [...validData].sort((a, b) => b.nps_average - a.nps_average).slice(0, 3);
    const bottomNps = [...validData].sort((a, b) => a.nps_average - b.nps_average).slice(0, 3);
    return { topCsat, bottomCsat, topNps, bottomNps };
  }, [kpiData]);

  const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#f59e0b'];
  const yAxisWidth = 150; 

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Segmentación de Empresas</CardTitle>
          <CardDescription>Estos filtros afectan el gráfico de "Total de Empresas por Rubro". Los KPIs de benchmark son calculados sobre toda la plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Select onValueChange={(value) => handleFilterChange('region', value)} value={filters.region}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Seleccionar Región" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Regiones</SelectItem>
              {regionesData.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => handleFilterChange('comuna', value)} value={filters.comuna} disabled={filters.region === 'all'}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Seleccionar Comuna" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Comunas</SelectItem>
              {comunasForSelectedRegion.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {loading ? <LoadingSpinner text="Cargando analíticas..." /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Total de Empresas por Rubro</CardTitle>
            </CardHeader>
            <CardContent>
              {countsByRubro && countsByRubro.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(300, countsByRubro.length * 40)}>
                  <BarChart data={countsByRubro} layout="vertical" margin={{ top: 5, right: 30, left: yAxisWidth - 30, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                    <XAxis type="number" allowDecimals={false}>
                       <RechartsLabel value="Total de Empresas" offset={-15} position="insideBottom" />
                    </XAxis>
                    <YAxis dataKey="rubro" type="category" width={yAxisWidth} interval={0} tick={<CustomizedYAxisTick />} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(230, 230, 230, 0.4)' }} />
                    <Bar dataKey="total_empresas" name="Empresas" barSize={20}>
                      {countsByRubro.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-muted-foreground">No hay datos de empresas para los filtros seleccionados.</p>}
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>KPIs Promedio por Rubro</CardTitle>
                        <CardDescription>Datos de benchmark pre-calculados para un rendimiento óptimo.</CardDescription>
                    </div>
                    <Button onClick={handleManualRecalculation} disabled={isCalculating}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
                        {isCalculating ? 'Calculando...' : 'Recalcular Ahora'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
              {kpiData && kpiData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rubro</TableHead>
                    <TableHead className="text-right">CSAT Promedio</TableHead>
                    <TableHead className="text-right">NPS Promedio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kpiData.map((kpi) => (
                    <TableRow key={kpi.rubro_name}>
                      <TableCell className="font-medium">{kpi.rubro_name}</TableCell>
                      <TableCell className="text-right">{formatValue(kpi.csat_average, '%')}</TableCell>
                      <TableCell className="text-right">{formatValue(kpi.nps_average)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              ) : <p className="text-center text-muted-foreground">No hay datos de KPIs disponibles. Intenta un recálculo manual.</p>}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:col-span-2">
             <RankingTable title={<><ArrowUp className="inline-block h-5 w-5 mr-2 text-green-500" />Top 3 Rubros por CSAT</>} data={sortedKpiData.topCsat} valueKey="csat_average" unit="%" />
             <RankingTable title={<><ArrowDown className="inline-block h-5 w-5 mr-2 text-red-500" />Bottom 3 Rubros por CSAT</>} data={sortedKpiData.bottomCsat} valueKey="csat_average" unit="%" />
             <RankingTable title={<><ArrowUp className="inline-block h-5 w-5 mr-2 text-green-500" />Top 3 Rubros por NPS</>} data={sortedKpiData.topNps} valueKey="nps_average" />
             <RankingTable title={<><ArrowDown className="inline-block h-5 w-5 mr-2 text-red-500" />Bottom 3 Rubros por NPS</>} data={sortedKpiData.bottomNps} valueKey="nps_average" />
          </div>

        </div>
      )}
    </div>
  );
}

export default OverviewTab;