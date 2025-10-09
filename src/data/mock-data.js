import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

const now = new Date();

export const mockMetrics = {
  csat: { current: 4.3, change: 5.2 },
  nps: { current: 55, change: 12.5, promotersPercent: 65, detractorsPercent: 10 },
  totalResponses: { current: 1253, change: 15.1 },
  trends: {
    csat: Array.from({ length: 6 }, (_, i) => ({
      month: format(subMonths(now, 5 - i), 'MMM'),
      score: 4.1 + Math.random() * 0.4,
    })),
    nps: Array.from({ length: 6 }, (_, i) => ({
      month: format(subMonths(now, 5 - i), 'MMM'),
      score: 45 + Math.random() * 15,
    })),
  },
  demographics: {
    byGender: [
      { gender: 'Femenino', count: 680 },
      { gender: 'Masculino', count: 520 },
      { gender: 'Otro', count: 53 },
    ],
    byAge: [
      { age_range: '18-24', count: 250 },
      { age_range: '25-34', count: 450 },
      { age_range: '35-44', count: 300 },
      { age_range: '45+', count: 253 },
    ],
    metricsByGender: [
      { gender: 'Femenino', csat: 4.4, nps: 60 },
      { gender: 'Masculino', csat: 4.2, nps: 50 },
      { gender: 'Otro', csat: 4.5, nps: 65 },
    ],
    metricsByAge: [
      { age_range: '18-24', csat: 4.1, nps: 45 },
      { age_range: '25-34', csat: 4.3, nps: 58 },
      { age_range: '35-44', csat: 4.4, nps: 62 },
      { age_range: '45+', csat: 4.5, nps: 60 },
    ],
  },
};

export const mockAvailableSurveys = [
  {
    id: 'template-survey-1',
    title: 'Plantilla de Satisfacción General (Retail)',
    description: 'Mide la experiencia completa de tus clientes en tiendas físicas.',
    is_template: true,
    associated_rubros: ['Retail'],
  },
  {
    id: 'template-survey-2',
    title: 'Plantilla de Experiencia Gastronómica',
    description: 'Evalúa la calidad de la comida, el servicio y el ambiente.',
    is_template: true,
    associated_rubros: ['Restaurante'],
  },
];

export const mockCompanySurveys = [
  {
    id: 'assigned-survey-1',
    company_id: 'test-company-id',
    rubro: 'Retail',
    surveys: {
      id: 'template-survey-1',
      title: 'Plantilla de Satisfacción General (Retail)',
      description: 'Mide la experiencia completa de tus clientes en tiendas físicas.',
      is_template: true,
    },
    custom_questions: [
      { id: 'custom-q-1', question_text: '¿Encontraste fácilmente lo que buscabas?' },
    ],
    company_survey_locations: [
      { id: 'loc-1', location_name: 'Av. Principal 123', is_active: true, collection_method: 'qr_code' },
      { id: 'loc-2', location_name: 'Calle Falsa 456', is_active: false, collection_method: 'link' },
    ],
  },
];

export const mockCompanySurveyLocations = [
  {
    id: 'csl-1',
    company_survey_id: 'cs-1',
    location_name: 'Av. Principal 123',
    is_active: true,
    company_surveys: {
      surveys: {
        title: 'Encuesta de Satisfacción Retail',
        description: 'Encuesta para locales de retail.',
        questions: [],
      },
      custom_questions: [],
    },
  },
  {
    id: 'csl-2',
    company_survey_id: 'cs-1',
    location_name: 'Calle Falsa 456',
    is_active: false,
    company_surveys: {
      surveys: {
        title: 'Encuesta de Satisfacción Retail',
        description: 'Encuesta para locales de retail.',
        questions: [],
      },
      custom_questions: [],
    },
  },
  {
    id: 'csl-3',
    company_survey_id: 'cs-2',
    location_name: 'Restaurante (Online)',
    is_active: true,
    company_surveys: {
      surveys: {
        title: 'Encuesta de Delivery Online',
        description: 'Encuesta para delivery.',
        questions: [],
      },
      custom_questions: [],
    },
  },
];