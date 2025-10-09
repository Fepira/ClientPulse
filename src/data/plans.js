import { CheckCircle2 } from 'lucide-react';
    import React from 'react';

    export const plansData = [
      {
        id: 'basico',
        name: 'Básico',
        price: 25000,
        priceDescription: 'CLP por mes',
        features: [
          'Hasta 3 locales o puntos de venta',
          'Encuestas ilimitadas',
          'Dashboard de resultados en tiempo real',
          'Análisis de sentimiento básico',
          'Soporte por email',
        ],
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      },
      {
        id: 'profesional',
        name: 'Profesional',
        price: 75000,
        priceDescription: 'CLP por mes',
        features: [
          'Todo lo del plan Básico',
          'Benchmarking con la industria',
          'Análisis de temas y tendencias',
          'Alertas y notificaciones personalizadas',
          'Soporte prioritario por chat',
        ],
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      },
      {
        id: 'empresarial',
        name: 'Empresarial',
        price: 60000,
        priceDescription: 'CLP por mes',
        features: [
          'Todo lo del plan Profesional',
          'Integración con CRM/ERP',
          'Analista de datos dedicado',
          'Reportes avanzados y personalizados',
          'Soporte 24/7',
        ],
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      },
    ];