import React, { useState, useEffect, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Smile, Frown, ThumbsUp, ThumbsDown } from 'lucide-react';
    import SentimentAnalysisChart from '@/components/dashboard/overview/SentimentAnalysisChart';
    
    const EmptyState = ({ message, imageUrl }) => (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
            <img  src={imageUrl} alt="No data illustration" className="w-24 h-24 mb-4 opacity-50" src="https://images.unsplash.com/photo-1643917853949-74f4eba1c89b" />
            <p className="text-center">{message}</p>
        </div>
    );
    
    const WordCloud = ({ words, color, sentimentType }) => {
        if (!words || words.length === 0) {
            const message = sentimentType === 'positive'
                ? "Aún no hay suficientes comentarios positivos para analizar."
                : "Aún no hay suficientes comentarios negativos para analizar.";
            return <EmptyState message={message} imageUrl="https://horizons-cdn.hostinger.com/1a278a57-ddc3-48d4-9216-30f7b1b4e998/39fb845003c9e79f06e3732653192ecb.png" />;
        }
    
        const maxFontSize = 40;
        const minFontSize = 12;
        const maxCount = Math.max(...words.map(w => w.value), 0);
        const minCount = Math.min(...words.map(w => w.value), Infinity);
    
        const calculateSize = (count) => {
            if (maxCount === minCount) return minFontSize;
            const size = ((count - minCount) / (maxCount - minCount)) * (maxFontSize - minFontSize) + minFontSize;
            return Math.round(size);
        };
    
        return (
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 p-4">
                {words.map((word, index) => (
                    <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="font-bold cursor-pointer transition-colors"
                        style={{ fontSize: `${calculateSize(word.value)}px`, color }}
                    >
                        {word.text}
                    </motion.span>
                ))}
            </div>
        );
    };
    
    const TextAnalysis = ({ companyId, activeRubro, activeLocale, timePeriod }) => {
        const [data, setData] = useState(null);
        const [sentimentData, setSentimentData] = useState(null);
        const [loading, setLoading] = useState(true);
        const { toast } = useToast();
    
        const fetchData = useCallback(async () => {
            setLoading(true);
            setData(null);
            setSentimentData(null);
            try {
                let startDate, endDate = new Date();
                switch (timePeriod) {
                    case 'current_month':
                        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
                        break;
                    case 'last_3_months':
                        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 2, 1);
                        break;
                    case 'last_6_months':
                        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 5, 1);
                        break;
                    case 'last_12_months':
                        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 11, 1);
                        break;
                    default:
                        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
                }
    
                const { data: analyticsData, error: analyticsError } = await supabase.rpc('get_text_answer_analytics', {
                    p_company_id: companyId,
                    p_rubro: activeRubro,
                    p_locale_name: activeLocale === 'all' ? null : activeLocale,
                    p_start_date: startDate.toISOString(),
                    p_end_date: endDate.toISOString()
                });
    
                if (analyticsError) throw analyticsError;
                
                setData(analyticsData);

                if (analyticsData && analyticsData.totalComments > 0) {
                    const { data: rawComments, error: commentsError } = await supabase.rpc('get_raw_text_answers', {
                        p_company_id: companyId, p_rubro: activeRubro, p_locale_name: activeLocale === 'all' ? null : activeLocale, p_start_date: startDate.toISOString(), p_end_date: endDate.toISOString()
                    });
                    
                    if (commentsError) throw commentsError;
                    
                    if (rawComments && rawComments.length > 0) {
                       const { data: sentimentResult, error: sentimentError } = await supabase.functions.invoke('sentiment-analysis', {
                           body: { comments: rawComments.map(c => c.answer_value) }
                       });
                       if (sentimentError) throw sentimentError;
                       setSentimentData(sentimentResult);
                    } else {
                       setSentimentData({ positive_count: 0, negative_count: 0, neutral_count: 0 });
                    }
                } else {
                    setSentimentData({ positive_count: 0, negative_count: 0, neutral_count: 0 });
                }

            } catch (error) {
                console.error("Error fetching text analysis:", error);
                toast({ variant: 'destructive', title: 'Error', description: `No se pudo cargar el análisis de texto: ${error.message}` });
                setData({ totalComments: 0, positiveWords: [], negativeWords: [] });
                setSentimentData({ positive_count: 0, negative_count: 0, neutral_count: 0 });
            } finally {
                setLoading(false);
            }
        }, [companyId, activeRubro, activeLocale, timePeriod, toast]);
    
        useEffect(() => {
            fetchData();
        }, [fetchData]);
    
        if (loading) {
            return <LoadingSpinner text="Analizando comentarios..." />;
        }
    
        if (!data || data.totalComments === 0) {
            return (
                <Card className="text-center p-8">
                    <CardHeader>
                        <CardTitle>Sin Comentarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <EmptyState message="No se encontraron comentarios para analizar en este período." imageUrl="https://horizons-cdn.hostinger.com/1a278a57-ddc3-48d4-9216-30f7b1b4e998/39fb845003c9e79f06e3732653192ecb.png" />
                    </CardContent>
                </Card>
            );
        }
    
        return (
            <div className="space-y-8">
                {sentimentData && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Sentimiento de los Comentarios</CardTitle>
                            <CardDescription>Clasificación de los comentarios como positivos, negativos o neutros.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SentimentAnalysisChart sentimentData={sentimentData} />
                        </CardContent>
                    </Card>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                             <ThumbsUp className="w-6 h-6 text-green-500" />
                            <CardTitle>Temas Positivos</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <WordCloud words={data.positiveWords} color="#10b981" sentimentType="positive" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                           <ThumbsDown className="w-6 h-6 text-red-500" />
                            <CardTitle>Temas a Mejorar</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                           <WordCloud words={data.negativeWords} color="#ef4444" sentimentType="negative" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };
    
    export default TextAnalysis;