import React from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { ArrowUp, ArrowDown, Minus, Target } from 'lucide-react';

    const formatDisplayScore = (score, title) => {
      if (score === null || score === undefined) return 'N/A';
      const suffix = title === 'CSAT' ? '%' : '';
      return `${score.toFixed(1)}${suffix}`;
    };

    const formatVariation = (value) => {
        if (value === null || value === undefined) return '0.0';
        return value.toFixed(1);
    };

    const ScoreDisplay = ({ label, score, title }) => (
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-4xl font-bold text-gray-800">{formatDisplayScore(score, title)}</p>
      </div>
    );

    const VariationDisplay = ({ label, value }) => {
      const isZero = value === 0 || value === null || value === undefined;
      const Icon = value > 0 ? ArrowUp : value < 0 ? ArrowDown : Minus;
      const color = value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-gray-500';
      const formattedValue = formatVariation(Math.abs(value));

      return (
        <div className="flex flex-col items-center text-xs">
          <span className="font-semibold text-gray-600">{label}</span>
          <div className={`flex items-center font-medium ${color}`}>
            <Icon className="w-3 h-3 mr-1" />
            <span>{formattedValue}</span>
          </div>
        </div>
      );
    };

    const AnalysisCard = ({ title, userScore, industryScore, userVariations, industryVariations, rank, distanceToTop }) => {
      const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
      };
      
      const safeDistance = distanceToTop !== null && distanceToTop !== undefined ? distanceToTop : 0;

      return (
        <Card className="w-full h-full shadow-xl hover:shadow-2xl transition-shadow duration-300 border-t-4 border-purple-500">
          <CardHeader>
            <CardTitle className="text-center text-2xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scores */}
            <motion.div variants={itemVariants} className="flex justify-around items-center bg-gray-50 p-4 rounded-lg">
              <ScoreDisplay label="Tu Empresa" score={userScore} title={title} />
              <div className="h-16 border-l border-gray-300"></div>
              <ScoreDisplay label="Industria" score={industryScore} title={title} />
            </motion.div>

            {/* Variations */}
            <motion.div variants={itemVariants}>
              <p className="text-center text-sm font-semibold text-gray-600 mb-2">Variaciones</p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-bold text-sm mb-2 text-blue-800">Tu Empresa</p>
                  <div className="flex justify-around">
                    <VariationDisplay label="Mensual" value={userVariations.monthly} />
                    <VariationDisplay label="Semestral" value={userVariations.semiannual} />
                    <VariationDisplay label="Anual" value={userVariations.annual} />
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-bold text-sm mb-2 text-green-800">Industria</p>
                  <div className="flex justify-around">
                    <VariationDisplay label="Mensual" value={industryVariations.monthly} />
                    <VariationDisplay label="Semestral" value={industryVariations.semiannual} />
                    <VariationDisplay label="Anual" value={industryVariations.annual} />
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Ranking */}
            <motion.div variants={itemVariants} className="flex justify-around items-center bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Tu Ranking</p>
                <p className="text-5xl font-extrabold text-purple-600">{rank || 'N/A'}</p>
              </div>
               <div className="h-16 border-l border-gray-300"></div>
              <div className="text-center">
                 <p className="text-sm text-muted-foreground">Distancia al #1</p>
                <div className="flex items-center justify-center mt-2">
                    <Target className="w-8 h-8 text-purple-500 mr-2"/>
                    <p className="text-3xl font-bold text-gray-800">{safeDistance > 0 ? safeDistance.toFixed(1) : '¡Eres el #1!'}</p>
                </div>
                 <p className="text-xs text-muted-foreground mt-1">{safeDistance > 0 ? 'puntos' : '¡Felicitaciones!'}</p>
              </div>
            </motion.div>

          </CardContent>
        </Card>
      );
    };

    export default AnalysisCard;