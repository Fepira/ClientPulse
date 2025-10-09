export const mockComparativeData = {
  companyBenchmark: {
    company: {
      csat: { score: 85.2, monthly_variation: 2.1, semiannual_variation: 5.5, annual_variation: 10.3 },
      nps: { score: 55, monthly_variation: 5, semiannual_variation: 12, annual_variation: 20 },
    },
    industry: {
      csat: { score: 78.5, monthly_variation: 1.2, semiannual_variation: 3.1, annual_variation: 6.8 },
      nps: { score: 42, monthly_variation: 2, semiannual_variation: 6, annual_variation: 11 },
    },
    ranking: {
      csat_rank: 5,
      nps_rank: 3,
      csat_top_score: 94.1,
      nps_top_score: 75,
    },
  },
  locationsBenchmark: [
    {
      location_id: 'loc-demo-1',
      location_name: 'Tienda Principal',
      csat: { score: 88.0, monthly_variation: 3.0, semiannual_variation: 6.1, annual_variation: 12.0 },
      nps: { score: 60, monthly_variation: 7, semiannual_variation: 15, annual_variation: 25 },
      ranking: {
        csat_rank: 2,
        nps_rank: 1,
        csat_top_score: 91.5,
        nps_top_score: 60,
        csat_distance_to_top: 3.5,
        nps_distance_to_top: 0,
      },
    },
    {
      location_id: 'loc-demo-2',
      location_name: 'Sucursal Viña',
      csat: { score: 82.4, monthly_variation: 1.2, semiannual_variation: 4.9, annual_variation: 8.6 },
      nps: { score: 50, monthly_variation: 3, semiannual_variation: 9, annual_variation: 15 },
      ranking: {
        csat_rank: 8,
        nps_rank: 5,
        csat_top_score: 91.5,
        nps_top_score: 60,
        csat_distance_to_top: 9.1,
        nps_distance_to_top: 10,
      },
    },
  ],
  detailedAnalysis: {
    questions: [
      {
        question_id: 'q_staff',
        classification_title: 'Atención del Personal',
        options_results: [
          { option_id: 'amabilidad', label: 'Amabilidad', current_score: 4.8, current_count: 55, difference: 0.3, trend: [{ month: '2025-05', mean: 4.4, count: 40 }, { month: '2025-06', mean: 4.5, count: 50 }, { month: '2025-07', mean: 4.8, count: 55 }] },
          { option_id: 'conocimiento', label: 'Conocimiento del Producto', current_score: 4.5, current_count: 54, difference: 0.1, trend: [{ month: '2025-05', mean: 4.3, count: 38 }, { month: '2025-06', mean: 4.4, count: 48 }, { month: '2025-07', mean: 4.5, count: 54 }] },
          { option_id: 'rapidez', label: 'Rapidez en la Atención', current_score: 4.2, current_count: 56, difference: -0.2, trend: [{ month: '2025-05', mean: 4.5, count: 42 }, { month: '2025-06', mean: 4.4, count: 49 }, { month: '2025-07', mean: 4.2, count: 56 }] },
        ]
      },
      {
        question_id: 'q_store',
        classification_title: 'Instalaciones y Ambiente',
        options_results: [
          { option_id: 'limpieza', label: 'Limpieza y Orden', current_score: 4.9, current_count: 58, difference: 0.4, trend: [{ month: '2025-05', mean: 4.2, count: 41 }, { month: '2025-06', mean: 4.5, count: 52 }, { month: '2025-07', mean: 4.9, count: 58 }] },
          { option_id: 'ambiente', label: 'Música y Ambiente', current_score: 4.6, current_count: 57, difference: 0.2, trend: [{ month: '2025-05', mean: 4.3, count: 39 }, { month: '2025-06', mean: 4.4, count: 51 }, { month: '2025-07', mean: 4.6, count: 57 }] },
          { option_id: 'espacio', label: 'Espacio y Comodidad', current_score: 4.4, current_count: 55, difference: 0.1, trend: [{ month: '2025-05', mean: 4.1, count: 40 }, { month: '2025-06', mean: 4.3, count: 50 }, { month: '2025-07', mean: 4.4, count: 55 }] },
        ]
      }
    ]
  },
};