import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';

const CustomQuestionsEditor = ({ isOpen, setIsOpen, survey, user, onUpdate }) => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (survey?.custom_questions) {
      setQuestions(survey.custom_questions);
    }
  }, [survey]);

  const handleAddQuestion = async () => {
    if (newQuestionText.trim() === '') {
      toast({ variant: 'destructive', title: 'Error', description: 'El texto de la pregunta no puede estar vacío.' });
      return;
    }
    if (questions.length >= 3) {
      toast({ variant: 'destructive', title: 'Límite alcanzado', description: 'No puedes añadir más de 3 preguntas personalizadas.' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_questions')
        .insert({
          company_survey_id: survey.id,
          question_text: newQuestionText,
          question_type: 'rating',
          scale: 5,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      setQuestions([...questions, data]);
      setNewQuestionText('');
      toast({ title: 'Éxito', description: 'Pregunta añadida.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: `No se pudo añadir la pregunta: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteQuestion = async (questionId) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('custom_questions').delete().eq('id', questionId);
      if (error) throw error;
      setQuestions(questions.filter(q => q.id !== questionId));
      toast({ title: 'Éxito', description: 'Pregunta eliminada.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: `No se pudo eliminar la pregunta: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    onUpdate();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Preguntas Adicionales</DialogTitle>
          <DialogDescription>
            Añade hasta 3 preguntas personalizadas. Se usarán en una escala de 1 a 5.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            {questions.map((q) => (
              <div key={q.id} className="flex items-center gap-2">
                <Input value={q.question_text} readOnly className="flex-grow" />
                <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q.id)} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-red-500" />}
                </Button>
              </div>
            ))}
          </div>

          {questions.length < 3 && (
            <div className="pt-4 border-t space-y-2">
              <Label htmlFor="new-question">Nueva Pregunta</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="new-question"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Ej: ¿Qué tal la música ambiente?"
                  disabled={loading}
                />
                <Button onClick={handleAddQuestion} disabled={loading || !newQuestionText.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleClose}>Hecho</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomQuestionsEditor;