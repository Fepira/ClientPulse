import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useTestMode } from '@/contexts/TestModeContext';
import { mockComparativeData } from '@/data/demo-data';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AnalysisCard from '@/components/dashboard/AnalysisCard';
import LocationAnalysisCard from '@/components/dashboard/LocationAnalysisCard';
import DetailedAnalysis from '@/components/dashboard/DetailedAnalysis';
import PerformanceHighlightCard from '@/components/dashboard/PerformanceHighlightCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { regionesData, comunasData } from '@/data/chile-locations';
import { Separator } from '@/components/ui/separator';

const formatScore = (score) => {
    if (score === null || score === undefined) return 0;
    return score;
};

const ComparativeAnalysis = ({ company, activeRubro }) => {
  const { isTestMode } = useTestMode();
  const [companyData, setCompanyData] = useState(null);
  const [locationsData, setLocationsData] = useState([]);
  const [detailedAnalysisData, setDetailedAnalysisData] = useState(null);
  const [performanceSummary, setPerformanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geoFilter, setGeoFilter] = useState({ level: 'nacional', region: null, comuna: null });
  const [surveyIdForActiveRubro, setSurveyIdForActiveRubro] = useState(null);
  const { toast } = useToast();

  const comunasForSelectedRegion = useMemo(() => {
    return geoFilter.region ? comunasData[geoFilter.region] || [] : [];
  }, [geoFilter.region]);

  const fetchSurveyForRubro = useCallback(async () => {
    if (!activeRubro || !company?.id || isTestMode) {
      setSurveyIdForActiveRubro(null);
      return;
    }
    
    const { data, error } = await supabase
      .from('company_surveys')
      .select('survey_id')
      .eq('company_id', company.id)
      .eq('rubro', activeRubro)
      .limit(1)
      .maybeSingle();

    if (error) {
      
      setSurveyIdForActiveRubro(null);
    } else if (data) {
      setSurveyIdForActiveRubro(data.survey_id);
    } else {
      setSurveyIdForActiveRubro(null);
    }
  }, [activeRubro, company?.id, isTestMode]);

  useEffect(() => {
    fetchSurveyForRubro();
  }, [fetchSurveyForRubro]);

  const fetchData = useCallback(async () => {
    if (!activeRubro || !company?.id) return;
    setLoading(true);

    if (isTestMode) {
      setCompanyData(mockComparativeData.companyBenchmark);
      setLocationsData(mockComparativeData.locationsBenchmark);
      setDetailedAnalysisData(mockComparativeData.detailedAnalysis);
      setPerformanceSummary({ best_performer: { name: 'Amabilidad', score: 4.9 }, worst_performer: { name: 'Tiempos de Espera', score: 3.2 } });
      setLoading(false);
      return;
    }
    
    setDetailedAnalysisData(null);
    try {
      const p_region = geoFilter.level === 'regional' || geoFilter.level === 'comunal' ? geoFilter.region : null;
      const p_comuna = geoFilter.level === 'comunal' ? geoFilter.comuna : null;
      
      const promises = [
        supabase.rpc('get_benchmark_data', { p_rubro: activeRubro, p_company_id: company.id, p_region, p_comuna }),
        supabase.rpc('get_location_benchmark_data', { p_company_id: company.id, p_rubro: activeRubro, p_region, p_comuna }),
        supabase.rpc('get_performance_summary', { p_company_id: company.id, p_rubro: activeRubro, p_locale_name: geoFilter.level === 'nacional' ? null : (geoFilter.comuna || geoFilter.region) })
      ];

      if (surveyIdForActiveRubro) {
        promises.push(supabase.rpc('get_detailed_benchmark_analytics', {
          p_company_id: company.id,
          p_rubro: activeRubro,
          p_survey_id: surveyIdForActiveRubro,
          p_region,
          p_comuna
        }));
      }

      const results = await Promise.all(promises);
      const [companyBenchmarkRes, locationsBenchmarkRes, summaryRes, detailedAnalysisRes] = results;

      if (companyBenchmarkRes.error) throw companyBenchmarkRes.error;
      if (locationsBenchmarkRes.error) throw locationsBenchmarkRes.error;
      if (summaryRes.error) throw summaryRes.error;
      if (detailedAnalysisRes && detailedAnalysisRes.error) throw detailedAnalysisRes.error;
      
      const safeCompanyData = {
        ...companyBenchmarkRes.data,
        company: {
          csat: { ...companyBenchmarkRes.data.company.csat, score: formatScore(companyBenchmarkRes.data.company.csat.score) },
          nps: { ...companyBenchmarkRes.data.company.nps, score: formatScore(companyBenchmarkRes.data.company.nps.score) },
        },
        industry: {
          csat: { ...companyBenchmarkRes.data.industry.csat, score: formatScore(companyBenchmarkRes.data.industry.csat.score) },
          nps: { ...companyBenchmarkRes.data.industry.nps, score: formatScore(companyBenchmarkRes.data.industry.nps.score) },
        },
        ranking: {
            ...companyBenchmarkRes.data.ranking,
            csat_top_score: formatScore(companyBenchmarkRes.data.ranking.csat_top_score),
            nps_top_score: formatScore(companyBenchmarkRes.data.ranking.nps_top_score),
        }
      };

      setCompanyData(safeCompanyData);
      setLocationsData(locationsBenchmarkRes.data || []);
      setPerformanceSummary(summaryRes.data);
      if (detailedAnalysisRes) {
        setDetailedAnalysisData(detailedAnalysisRes.data);
      }

    } catch (error) {
      console.error("Error fetching benchmark data:", error);
      toast({
        variant: "destructive",
        title: "Error al cargar datos comparativos",
        description: "No se pudieron obtener los datos para la comparativa.",
      });
    } finally {
      setLoading(false);
    }
  }, [activeRubro, company?.id, geoFilter, toast, surveyIdForActiveRubro, isTestMode]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleRegionChange = (region) => {
    setGeoFilter({ level: 'regional', region, comuna: null });
  };

  const handleComunaChange = (comuna) => {
    setGeoFilter(prev => ({ ...prev, level: 'comunal', comuna }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4 mb-8 bg-gray-100 p-4 rounded-lg">
        <Button 
          onClick={() => setGeoFilter({ level: 'nacional', region: null, comuna: null })}
          variant={geoFilter.level === 'nacional' ? 'default' : 'outline'}
        >
          Total Nacional
        </Button>
        <Select onValueChange={handleRegionChange} value={geoFilter.region || ""}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Seleccionar Región" />
          </SelectTrigger>
          <SelectContent>
            {regionesData.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select onValueChange={handleComunaChange} value={geoFilter.comuna || ""} disabled={!geoFilter.region}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Seleccionar Comuna" />
          </SelectTrigger>
          <SelectContent>
            {comunasForSelectedRegion.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </motion.div>
      
      {loading ? (
        <LoadingSpinner text="Calculando análisis comparativo..." fullScreen={false} />
      ) : !companyData || !companyData.company ? (
         <motion.div variants={itemVariants} className="text-center p-8 bg-white rounded-lg shadow">No hay datos disponibles para esta comparativa.</motion.div>
      ) : (
        <>
          <motion.div 
            className="grid md:grid-cols-1 lg:grid-cols-2 gap-8"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <AnalysisCard
                title="CSAT"
                userScore={companyData.company.csat.score}
                industryScore={companyData.industry.csat.score}
                userVariations={{
                  monthly: companyData.company.csat.monthly_variation,
                  semiannual: companyData.company.csat.semiannual_variation,
                  annual: companyData.company.csat.annual_variation,
                }}
                industryVariations={{
                  monthly: companyData.industry.csat.monthly_variation,
                  semiannual: companyData.industry.csat.semiannual_variation,
                  annual: companyData.industry.csat.annual_variation,
                }}
                rank={companyData.ranking.csat_rank}
                distanceToTop={companyData.ranking.csat_top_score - companyData.company.csat.score}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <AnalysisCard
                title="NPS"
                userScore={companyData.company.nps.score}
                industryScore={companyData.industry.nps.score}
                userVariations={{
                  monthly: companyData.industry.nps.monthly_variation,
                  semiannual: companyData.industry.nps.semiannual_variation,
                  annual: companyData.industry.nps.annual_variation,
                }}
                industryVariations={{
                  monthly: companyData.industry.nps.monthly_variation,
                  semiannual: companyData.industry.nps.semiannual_variation,
                  annual: companyData.industry.nps.annual_variation,
                }}
                rank={companyData.ranking.nps_rank}
                distanceToTop={companyData.ranking.nps_top_score - companyData.company.nps.score}
              />
            </motion.div>
          </motion.div>

          {locationsData && locationsData.length > 0 && (
            <motion.div variants={itemVariants} className="mt-12">
              <h2 className="text-2xl font-bold text-center mb-2">Análisis por Local</h2>
              <p className="text-center text-muted-foreground mb-6">Compara el rendimiento individual de tus locales físicos.</p>
              <Separator className="mb-8" />
              <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
                {locationsData.map((locData) => (
                  <motion.div key={locData.location_id} variants={itemVariants}>
                    <LocationAnalysisCard locationData={locData} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {performanceSummary && (
            <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8 mt-8">
              <PerformanceHighlightCard title="Mejor Evaluado" item={performanceSummary.best_performer} type="best" />
              <PerformanceHighlightCard title="Peor Evaluado" item={performanceSummary.worst_performer} type="worst" />
            </motion.div>
          )}

          {!isTestMode && activeRubro && surveyIdForActiveRubro === null && (
            <motion.div variants={itemVariants} className="mt-12">
              <div className="p-6 rounded-lg border bg-muted/50 text-center">
                <h3 className="text-lg font-semibold">Sin análisis detallado</h3>
                <p className="text-muted-foreground mt-2">
                  No hay encuesta específica para el rubro seleccionado. Agrega una encuesta para ver el análisis detallado.
                </p>
              </div>
            </motion.div>
          )}

          {(surveyIdForActiveRubro || isTestMode) && detailedAnalysisData && (
             <motion.div variants={itemVariants} className="mt-12">
                <DetailedAnalysis data={detailedAnalysisData} company={company} />
             </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default ComparativeAnalysis;