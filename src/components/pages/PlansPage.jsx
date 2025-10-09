import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Briefcase, BarChart, Loader2, Target, BarChart3, Crown } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const iconComponents = {
  Zap: <Zap className="w-8 h-8" />,
  Briefcase: <Briefcase className="w-8 h-8" />,
  BarChart: <BarChart className="w-8 h-8" />,
  Target: <Target className="w-8 h-8" />,
  BarChart3: <BarChart3 className="w-8 h-8" />,
  Crown: <Crown className="w-8 h-8" />,
};

const getPlanIcon = (iconName) => {
  return iconComponents[iconName] || <Briefcase className="w-8 h-8" />;
};

function PlansPage({ onPlanSelect, onBack }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .order('price', { ascending: true });

        if (error) {
          throw error;
        }

        const formattedPlans = data.map(plan => ({
          ...plan,
          priceFormatted: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(plan.price),
          period: plan.price_description || '/mes',
          color: plan.id === 'basico' ? 'from-blue-500 to-cyan-500' :
                 plan.id === 'profesional' ? 'from-purple-500 to-pink-500' :
                 'from-orange-500 to-red-500',
          popular: plan.id === 'profesional',
        }));
        
        setPlans(formattedPlans);
      } catch (error) {
        toast({
          title: "Error al cargar los planes",
          description: "No se pudieron obtener los planes. Por favor, intenta de nuevo más tarde.",
          variant: "destructive",
        });
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold gradient-text mb-6">
            Elige tu Plan Perfecto
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Planes diseñados para empresas de todos los tamaños. 
            Comienza con lo básico y escala según tus necesidades.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ y: -5 }}
              className={`relative glass-effect p-8 rounded-2xl card-hover flex flex-col ${
                plan.popular ? 'ring-2 ring-purple-500' : 'ring-1 ring-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    Más Popular
                  </span>
                </div>
              )}

              <div className="flex-grow">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center text-white mb-6`}>
                  {getPlanIcon(plan.icon)}
                </div>

                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.priceFormatted}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <motion.button
                type="button"
                onClick={() => onPlanSelect(plan)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full mt-auto py-3 px-6 rounded-xl font-semibold transition-all duration-300 text-center ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/50'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Seleccionar Plan
              </motion.button>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="btn-secondary"
          >
            Volver al Inicio
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default PlansPage;