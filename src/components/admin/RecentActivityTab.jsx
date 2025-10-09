import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.jsx";
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';

const RecentActivityTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_recent_activity_stats');
        if (error) throw error;
        setStats(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error al cargar estadísticas",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

  if (loading) {
    return <LoadingSpinner text="Cargando actividades recientes..." />;
  }

  if (!stats) {
    return <p>No se pudieron cargar las estadísticas.</p>;
  }

  const { altas_bajas, upgrades } = stats;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUp className="text-green-500" />
            <ArrowDown className="text-red-500" />
            Altas y Bajas (Mes Actual)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-around mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{altas_bajas?.total_altas || 0}</p>
              <p className="text-sm text-muted-foreground">Altas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{altas_bajas?.total_bajas || 0}</p>
              <p className="text-sm text-muted-foreground">Bajas</p>
            </div>
          </div>
          <h4 className="font-semibold mb-2">Desglose por Plan</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Altas</TableHead>
                <TableHead className="text-right">Bajas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {altas_bajas?.by_plan && Object.entries(altas_bajas.by_plan).map(([plan, data]) => (
                <TableRow key={plan}>
                  <TableCell className="font-medium capitalize">{plan}</TableCell>
                  <TableCell className="text-right text-green-600 font-semibold">{data.altas}</TableCell>
                  <TableCell className="text-right text-red-600 font-semibold">{data.bajas}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-blue-500" />
            Upgrades de Planes (Mes Actual)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-blue-500">{upgrades?.total_upgrades || 0}</p>
            <p className="text-sm text-muted-foreground">Upgrades Totales</p>
          </div>
          <h4 className="font-semibold mb-2">Desglose por Nuevo Plan</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upgrades?.by_new_plan && Object.entries(upgrades.by_new_plan).map(([plan, count]) => (
                <TableRow key={plan}>
                  <TableCell className="font-medium capitalize">{plan}</TableCell>
                  <TableCell className="text-right font-semibold">{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentActivityTab;