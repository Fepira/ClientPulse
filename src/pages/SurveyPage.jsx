import React, { useState, useEffect, useCallback, useMemo } from 'react';
    import { useParams } from 'react-router-dom';
    import { Helmet } from 'react-helmet';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';
    import { Button } from '@/components/ui/button';
    import { motion, AnimatePresence } from 'framer-motion';
    import SurveyQuestion from '@/components/survey/SurveyQuestion';
    import { cn } from '@/lib/utils';
    import { Loader2 } from 'lucide-react';
    import { Progress } from '@/components/ui/progress';

    const SurveyPage = () => {
      const { locationId } = useParams();
      const { toast } = useToast();
      const [surveyData, setSurveyData] = useState(null);
      const [questions, setQuestions] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [currentStep, setCurrentStep] = useState(0);
      const [answers, setAnswers] = useState({});
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [submitted, setSubmitted] = useState(false);
      const [styles, setStyles] = useState({});

      const fetchSurveyData = useCallback(async () => {
        if (!locationId) {
          setLoading(false);
          setError("No se ha especificado un ID de ubicación de encuesta.");
          return;
        }

        setLoading(true);
        try {
          const { data, error: rpcError } = await supabase
            .rpc('get_survey_for_location', {
              p_company_survey_location_id: locationId
            });
          
          if (rpcError) throw rpcError;
          if (!data) throw new Error("Encuesta no encontrada o inactiva.");

          const fetchedSurveyData = data.survey;
          
          setSurveyData(fetchedSurveyData);
          setQuestions(data.questions || []);

          if (fetchedSurveyData.survey_template_style) {
            const { data: templateData, error: templateError } = await supabase
              .from('design_templates')
              .select('styles_object')
              .eq('id', fetchedSurveyData.survey_template_style)
              .single();

            if (templateError) console.error("Error fetching template styles:", templateError);
            else setStyles(templateData.styles_object || {});
          }
        } catch (e) {
          console.error(e);
          setError(e.message);
          toast({ variant: 'destructive', title: 'Error', description: e.message });
        } finally {
          setLoading(false);
        }
      }, [locationId, toast]);

      useEffect(() => {
        if (locationId) {
          fetchSurveyData();
        }
      }, [locationId, fetchSurveyData]);

      const handleAnswerChange = useCallback((questionId, value, optionId = null) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) return;

        if (question.question_type === 'classification') {
            const currentItem = Object.keys(value)[0];
            const itemValue = value[currentItem];
            setAnswers(prev => ({
                ...prev,
                [questionId]: {
                    ...(prev[questionId] || {}),
                    [currentItem]: { value: itemValue }
                }
            }));
        } else {
             setAnswers(prev => ({
                ...prev,
                [questionId]: { value, optionId }
            }));
        }
      }, [questions]);

      const isCurrentQuestionAnswered = useMemo(() => {
        if (questions.length === 0) return false;
        const currentQuestion = questions[currentStep];
        if (!currentQuestion) return false;
        
        const answer = answers[currentQuestion.id];

        if (currentQuestion.question_type === 'classification') {
          const items = currentQuestion.options?.items_to_evaluate || [];
          return items.every(item => answer?.[item.id]?.value !== undefined && answer?.[item.id]?.value !== null);
        }
        
        const answerValue = answer?.value;
        if (answerValue === 'NA') return true;

        return answerValue !== '' && answerValue !== null && answerValue !== undefined;
      }, [currentStep, answers, questions]);

      const handleNext = () => {
        if (currentStep < questions.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          handleSubmit();
        }
      };

      const handleSubmit = async () => {
        setIsSubmitting(true);
        const standardAnswers = [];
        const customAnswers = [];
        
        Object.entries(answers).forEach(([questionId, answerData]) => {
          const question = questions.find(q => q.id.toString() === questionId.toString());
          if (!question) return;

          if (question.question_type === 'classification') {
            const items = question.options?.items_to_evaluate || [];
            items.forEach(item => {
              if (answerData[item.id]) {
                 standardAnswers.push({
                  question_id: question.id,
                  answer_value: answerData[item.id].value,
                  option_id: item.id
                });
              }
            });
          } else {
            const targetArray = question.is_custom ? customAnswers : standardAnswers;
            targetArray.push({
              question_id: questionId,
              answer_value: answerData.value,
              option_id: answerData.optionId
            });
          }
        });
        
        const demographicAnswers = {
            gender: standardAnswers.find(a => {
                const q = questions.find(q => q.id === a.question_id);
                return q?.is_demographic && q?.question_type === 'gender';
            })?.answer_value || null,
            age_range: standardAnswers.find(a => {
                const q = questions.find(q => q.id === a.question_id);
                return q?.is_demographic && q?.question_type === 'age_range';
            })?.answer_value || null,
        };
        
        try {
          const { error } = await supabase.rpc('submit_survey_response', {
            p_company_survey_location_id: locationId,
            p_answers: standardAnswers.filter(a => {
                const q = questions.find(q => q.id === a.question_id);
                return !q?.is_demographic;
            }),
            p_custom_answers: customAnswers,
            p_gender: demographicAnswers.gender,
            p_age_range: demographicAnswers.age_range
          });

          if (error) throw error;
          setSubmitted(true);
        } catch (e) {
          console.error(e);
          toast({ variant: 'destructive', title: 'Error al enviar', description: e.message });
        } finally {
          setIsSubmitting(false);
        }
      };

      const progress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;
      
      if (loading) return <LoadingSpinner text="Cargando encuesta..." fullScreen />;
      if (error) return <div className="min-h-screen flex items-center justify-center text-center p-4">Error: {error}</div>;
      if (!surveyData) return <div className="min-h-screen flex items-center justify-center text-center p-4">No se pudo cargar la encuesta.</div>;

      const thankYouMessage = (surveyData.thank_you_message && typeof surveyData.thank_you_message === 'object' && surveyData.thank_you_message.title)
        ? surveyData.thank_you_message
        : { title: '¡Gracias!', body: 'Tus respuestas han sido enviadas con éxito.' };
      
      return (
        <div style={{
            '--background-color': styles.backgroundColor || '#f9fafb',
            '--text-color': styles.textColor || '#111827',
            '--primary-color': styles.primaryColor || '#6d28d9',
            '--primary-text-color': styles.primaryTextColor || '#ffffff'
        }} className="min-h-screen bg-[--background-color] text-[--text-color] transition-colors duration-300">
          <Helmet>
            <title>{surveyData.title} - Client Pulse</title>
            <meta name="description" content={surveyData.description} />
          </Helmet>
          
          <main className="container mx-auto max-w-2xl px-4 py-8">
            <div className="text-center mb-8">
                {surveyData.show_company_logo && surveyData.logo_url && (
                    <img src={surveyData.logo_url} alt={`${surveyData.company_name} Logo`} className="mx-auto h-16 w-auto mb-4 object-contain" />
                )}
              <h1 className="text-3xl font-bold">{surveyData.title}</h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300" style={{ color: styles.textColor }}>{surveyData.description}</p>
            </div>

            <AnimatePresence mode="wait">
            {!submitted ? (
                <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                >
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
                        <Progress value={progress} className="mb-6 h-2 [&>*]:bg-[--primary-color]"/>
                        
                        {questions[currentStep] && (
                            <SurveyQuestion
                                question={questions[currentStep]}
                                onAnswer={handleAnswerChange}
                                currentAnswer={answers[questions[currentStep].id]}
                                styles={styles}
                                index={currentStep}
                            />
                        )}
                        
                        <div className="mt-8 flex justify-end">
                        <Button 
                            onClick={handleNext} 
                            disabled={!isCurrentQuestionAnswered || isSubmitting}
                            style={{ backgroundColor: 'var(--primary-color)', color: 'var(--primary-text-color)' }}
                            className="min-w-[120px] transition-opacity"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                currentStep < questions.length - 1 ? 'Siguiente' : 'Finalizar'
                            )}
                        </Button>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                key="thank-you"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-lg flex flex-col items-center"
                >
                    {surveyData.thank_you_image_url && (
                        <img src={surveyData.thank_you_image_url} alt="Gracias" className="w-48 h-48 object-cover rounded-full mb-6"/>
                    )}
                    <h2 className="text-4xl font-bold text-[--primary-color] mb-4">{thankYouMessage.title}</h2>
                    <p className="text-xl">{thankYouMessage.body}</p>
                </motion.div>
            )}
            </AnimatePresence>
          </main>
        </div>
      );
    };

    export default SurveyPage;