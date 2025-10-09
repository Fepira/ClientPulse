import React from 'react';
import { Target, BarChart3, Crown } from 'lucide-react';

export const plansData = [
  {
    id: 'basico',
    name: 'Plan Básico',
    price: 25000,
    priceString: '25.000',
    localePrice: 30000,
    period: '/mes (base)',
    icon: <Target className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Medición de satisfacción de clientes',
      'Dashboard básico con métricas clave',
      'Reportes mensuales',
      'Soporte por email',
      'Hasta 500 encuestas/mes',
      'Costo por local: $30.000/mes'
    ],
    description: 'Perfecto para empresas que inician su medición de satisfacción'
  },
  {
    id: 'profesional',
    name: 'Plan Profesional',
    price: 75000,
    priceString: '75.000',
    localePrice: 20000,
    period: '/mes (base)',
    icon: <BarChart3 className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-500',
    popular: true,
    features: [
      'Todo lo del Plan Básico',
      'Benchmarking con empresas del mismo rubro',
      'Análisis comparativo detallado',
      'Reportes semanales',
      'Dashboard avanzado con insights',
      'Hasta 2,000 encuestas/mes',
      'Soporte prioritario',
      'Costo por local: $20.000/mes'
    ],
    description: 'Ideal para empresas que buscan compararse con la competencia'
  },
  {
    id: 'empresarial',
    name: 'Plan Empresarial',
    price: 60000,
    priceString: '60.000',
    localePrice: 25000,
    period: '/mes (base)',
    icon: <Crown className="w-8 h-8" />,
    color: 'from-orange-500 to-red-500',
    features: [
      'Todo lo del Plan Profesional',
      'Encuestas personalizadas (máx. 5 preguntas)',
      'Sondeos de productos y servicios',
      'API para integraciones',
      'Reportes en tiempo real',
      'Encuestas ilimitadas',
      'Soporte 24/7',
      'Consultoría especializada',
      'Costo por local: $25.000/mes'
    ],
    description: 'La solución completa para empresas que necesitan máxima flexibilidad'
  }
];