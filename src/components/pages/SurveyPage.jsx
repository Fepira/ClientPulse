import React, { useState, useEffect, useCallback } from 'react';
    import { useParams } from 'react-router-dom';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Progress } from '@/components/ui/progress';
    import { AlertCircle, Send } from 'lucide-react';
    import SurveyQuestion from '@/components/survey/SurveyQuestion';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';
    import { cn } from '@/lib/utils';
    import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
    
    const SurveyPage = () => {
      const { locationId } = useParams();
      const { toast } = useToast();
      const [surveyData, setSurveyData] = useState(null);
      const [questions, setQuestions] = useState([]);
      const [answers, setAnswers] = useState({});
      const [customAnswers, setCustomAnswers] = useState({});
      const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [demographics, setDemographics] = useState({ gender: '', age_range: '' });
    
      const fetchSurvey = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
          const { data, error: rpcError } = await supabase.rpc('get_survey_for_location', {
            p_company_survey_location_id: locationId,
          });
    
          if (rpcError) throw rpcError;
          if (!data || !data.survey) {
            throw new Error('La encuesta no está disponible o ha sido desactivada.');
          }
          
          const sortedQuestions = data.questions.sort((a,b) => (a.sort_order || a.order_index) - (b.sort_order || b.order_index));
    
          setSurveyData(data.survey);
          setQuestions(sortedQuestions);
        } catch (err) {
          setError(err.message || 'Ocurrió un error al cargar la encuesta.');
          toast({
            variant: 'destructive',
            title: 'Error de Carga',
            description: err.message || 'No se pudo cargar la encuesta. Por favor, verifica el enlace.',
          });
        } finally {
          setLoading(false);
        }
      }, [locationId, toast]);
    
      useEffect(() => {
        if (locationId) {
          fetchSurvey();
        }
      }, [fetchSurvey, locationId]);
    
      const handleAnswer = (questionId, answerValue, isCustom, optionId = null) => {
          const question = questions.find(q => q.id === questionId);
          if (!question) return;
    
          if (isCustom) {
              setCustomAnswers(prev => ({ ...prev, [questionId]: { question_id: questionId, answer_value: answerValue } }));
          } else if (question.question_type === 'classification') {
              const currentItem = Object.keys(answerValue)[0];
              const itemValue = answerValue[currentItem].value;
              setAnswers(prev => ({
                  ...prev,
                  [questionId]: {
                      ...prev[questionId],
                      [currentItem]: { value: itemValue }
                  }
              }));
          }
          else {
              setAnswers(prev => ({ ...prev, [questionId]: { question_id: questionId, answer_value: answerValue, option_id: optionId } }));
          }
    
          if (questions[currentQuestionIndex]?.is_demographic) {
              const questionType = questions[currentQuestionIndex].question_type;
              if (questionType === 'gender') setDemographics(prev => ({ ...prev, gender: answerValue }));
              if (questionType === 'age_range') setDemographics(prev => ({ ...prev, age_range: answerValue }));
          }
      };
      
      const isCurrentQuestionAnswered = () => {
          const question = questions[currentQuestionIndex];
          if (!question) return false;
    
          if (question.question_type === 'text') {
              return true; 
          }
          
          if (question.question_type === 'classification') {
              const itemsToEvaluate = question.options?.items_to_evaluate || [];
              const currentAnswersForQuestion = answers[question.id] || {};
              return itemsToEvaluate.length > 0 && itemsToEvaluate.every(item => currentAnswersForQuestion[item.id]?.value);
          }
    
          const isAnswered = question.is_custom 
              ? customAnswers[question.id]?.answer_value
              : answers[question.id]?.answer_value;
          
          return !!isAnswered;
      };
    
      const handleNext = () => {
        const question = questions[currentQuestionIndex];
        if (question.question_type !== 'text' && !isCurrentQuestionAnswered() && !question.na_option) {
            toast({
                variant: "destructive",
                title: "Pregunta sin responder",
                description: "Por favor, selecciona una respuesta para continuar.",
            });
            return;
        }
        
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          handleSubmit();
        }
      };
    
      const handleSubmit = async () => {
        setIsSubmitting(true);
        
        const finalAnswers = [];
        Object.values(answers).forEach((answerData) => {
            if (!answerData) return;
            const question = questions.find(q => q.id === answerData.question_id);
            if (question && question.question_type === 'classification') {
                const items = question.options?.items_to_evaluate || [];
                items.forEach(item => {
                    const itemAnswer = answerData[item.id];
                    if (itemAnswer && itemAnswer.value) {
                        finalAnswers.push({
                            question_id: question.id,
                            answer_value: itemAnswer.value,
                            option_id: item.id,
                        });
                    }
                });
            } else if (question) {
                finalAnswers.push({
                    question_id: answerData.question_id,
                    answer_value: answerData.answer_value,
                    option_id: answerData.option_id,
                });
            }
        });
    
        const finalCustomAnswers = Object.values(customAnswers);
    
        try {
          const { error } = await supabase.rpc('submit_survey_response', {
            p_company_survey_location_id: locationId,
            p_answers: finalAnswers,
            p_custom_answers: finalCustomAnswers,
            p_gender: demographics.gender,
            p_age_range: demographics.age_range
          });
    
          if (error) throw error;
          
          setCurrentQuestionIndex(questions.length);
    
        } catch (err) {
          toast({
            variant: "destructive",
            title: "Error al enviar",
            description: "No se pudo guardar tu respuesta. Por favor, intenta de nuevo.",
          });
        } finally {
          setIsSubmitting(false);
        }
      };
      
      const progress = (currentQuestionIndex / questions.length) * 100;
      const currentQuestion = questions[currentQuestionIndex];
    
      const defaultStyles = {
        bg: 'bg-gray-100',
        cardBg: 'bg-white',
        primaryText: 'text-gray-900',
        secondaryText: 'text-gray-600',
        buttonBg: 'bg-gray-800',
        buttonText: 'text-white',
      };
    
      const styles = surveyData?.survey_template_style ? surveyData.survey_template_style : defaultStyles;
    
      if (loading) return <LoadingSpinner text="Cargando encuesta..." fullScreen />;
      
      if (error) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Alert variant="destructive" className="max-w-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        );
      }
    
      const isThankYouScreen = currentQuestionIndex >= questions.length;
    
      return (
        <div className={cn("min-h-screen transition-colors duration-500 flex flex-col items-center justify-center p-4", styles.bg)}>
          <motion.div
            key="survey-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn("w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transition-colors duration-500", styles.cardBg)}
          >
            <div className="p-8">
                {surveyData?.show_company_logo && surveyData?.logo_url && (
                    <div className="flex justify-center mb-6">
                        <img-replace src={surveyData.logo_url} alt={`Logo de ${surveyData.company_name}`} className="h-16 max-w-xs object-contain" />
                    </div>
                )}
                
                <AnimatePresence mode="wait">
                    {!isThankYouScreen ? (
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="text-center mb-4">
                                <p className={cn("text-sm font-semibold text-purple-600", styles.secondaryText)}>Pregunta {currentQuestionIndex + 1} de {questions.length}</p>
                            </div>
                            <SurveyQuestion
                                question={currentQuestion}
                                index={currentQuestionIndex}
                                onAnswer={(questionId, value, optionId) => handleAnswer(questionId, value, currentQuestion?.is_custom, optionId)}
                                currentAnswer={currentQuestion?.question_type === 'classification' ? answers[currentQuestion.id] : (currentQuestion?.is_custom ? customAnswers[currentQuestion.id] : answers[currentQuestion.id])}
                                styles={styles}
                            />
                        </motion.div>
                    ) : (
                       <motion.div
                            key="thank-you"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-center py-12"
                        >
                            {surveyData.thank_you_image_url && (
                              <div className="flex justify-center mb-6">
                                <img-replace src={surveyData.thank_you_image_url} alt="Gracias por tu tiempo" className="max-h-48 rounded-lg object-cover"/>
                              </div>
                            )}
                            <h2 className={cn("text-3xl font-bold mb-4", styles.primaryText)}>{surveyData.thank_you_message?.title || "¡Encuesta Enviada!"}</h2>
                            <p className={cn("text-lg", styles.secondaryText)}>{surveyData.thank_you_message?.body || "¡Muchas gracias por tu tiempo!"}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
    
            {!isThankYouScreen && (
                <div className="bg-gray-50/50 p-6 border-t">
                    <Progress value={progress} className="mb-4" />
                    <div className="flex justify-end">
                        <Button 
                            onClick={handleNext} 
                            disabled={isSubmitting}
                            className={cn("font-bold", styles.buttonBg, styles.buttonText)}
                        >
                            {isSubmitting ? <Send className="w-4 h-4 mr-2 animate-pulse"/> : null}
                            {currentQuestionIndex === questions.length - 1 ? 'Finalizar Encuesta' : 'Siguiente'}
                        </Button>
                    </div>
                </div>
            )}
          </motion.div>
          <p className="text-center text-xs text-gray-500 mt-6">
            Potenciado por Client Pulse
          </p>
        </div>
      );
    };
    
    export default SurveyPage;