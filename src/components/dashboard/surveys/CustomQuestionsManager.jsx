import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

const CustomQuestionsManager = ({ companySurveyId, questions, onSave, onDelete }) => {
  const [newQuestionText, setNewQuestionText] = useState('');

  const handleAddClick = () => {
    if (newQuestionText.trim() === '') {
      return;
    }
    onSave(companySurveyId, { text: newQuestionText });
    setNewQuestionText('');
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="font-medium text-sm mb-2">Preguntas Adicionales (Plan Profesional)</h4>
      <div className="space-y-2">
        {questions.map(q => (
          <div key={q.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
            <p className="text-sm text-gray-800">{q.question_text}</p>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(q.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
      {questions.length < 3 && (
        <div className="mt-3 space-y-2">
          <Label htmlFor={`new-q-${companySurveyId}`}>Añadir nueva pregunta</Label>
          <Textarea id={`new-q-${companySurveyId}`} value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} placeholder="Escribe tu pregunta aquí..."/>
          <Button size="sm" onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-1"/> Añadir Pregunta
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomQuestionsManager;