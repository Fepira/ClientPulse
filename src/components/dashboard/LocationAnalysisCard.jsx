import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { ArrowUp, ArrowDown, Minus, Building } from 'lucide-react';

    const formatDisplayScore = (score, metric) => {
      if (score === null || score === undefined) return 'N/A';
      const suffix = metric === 'CSAT' ? '%' : '';
      return `${score.toFixed(1)}${suffix}`;
    };

    const formatVariation = (value) => {
        if (value === null || value === undefined) return '0.0';
        return value.toFixed(1);
    };


    const ScoreDisplay = ({ label, score, metric }) => (
      <div className="text-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{formatDisplayScore(score, metric)}</p>
      </div>
    );

    const VariationDisplay = ({ label, value }) => {
      const isZero = value === 0 || value === null || value === undefined;
      const Icon = value > 0 ? ArrowUp : value < 0 ? ArrowDown : Minus;
      const color = value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-gray-500';
      const formattedValue = formatVariation(Math.abs(value));

      return (
        <div className="flex flex-col items-center text-xs">
          <span className="font-semibold text-gray-500">{label}</span>
          <div className={`flex items-center font-medium ${color}`}>
            <Icon className="w-3 h-3 mr-1" />
            <span>{formattedValue}</span>
          </div>
        </div>
      );
    };

    const LocationAnalysisCard = ({ locationData }) => {
      const csatDistance = locationData.ranking.csat_distance_to_top;
      const npsDistance = locationData.ranking.nps_distance_to_top;

      return (
        <Card className="w-full h-full shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-blue-500">
          <CardHeader>
            <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                {locationData.location_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Scores & Ranking */}
            <div className="grid grid-cols-2 gap-4">
                {/* CSAT Column */}
                <div className="bg-gray-50 p-3 rounded-lg flex flex-col items-center space-y-2">
                    <p className="font-bold text-sm text-gray-700">CSAT</p>
                    <ScoreDisplay label="Puntaje" score={locationData.csat.score} metric="CSAT" />
                    <div className="flex justify-around w-full pt-2 border-t mt-2">
                        <VariationDisplay label="Mes" value={locationData.csat.monthly_variation} />
                    </div>
                </div>
                {/* NPS Column */}
                <div className="bg-gray-50 p-3 rounded-lg flex flex-col items-center space-y-2">
                    <p className="font-bold text-sm text-gray-700">NPS</p>
                    <ScoreDisplay label="Puntaje" score={locationData.nps.score} metric="NPS" />
                    <div className="flex justify-around w-full pt-2 border-t mt-2">
                        <VariationDisplay label="Mes" value={locationData.nps.monthly_variation} />
                    </div>
                </div>
            </div>
            
            {/* Ranking */}
             <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Ranking CSAT</p>
                    <p className="text-2xl font-bold text-purple-600">{locationData.ranking.csat_rank || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">
                        {csatDistance > 0 ? `${csatDistance.toFixed(1)} pts del #1` : '¡Eres el #1!'}
                    </p>
                </div>
                 <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Ranking NPS</p>
                    <p className="text-2xl font-bold text-purple-600">{locationData.ranking.nps_rank || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">
                        {npsDistance > 0 ? `${npsDistance.toFixed(1)} pts del #1` : '¡Eres el #1!'}
                    </p>
                </div>
            </div>

          </CardContent>
        </Card>
      );
    };

    export default LocationAnalysisCard;