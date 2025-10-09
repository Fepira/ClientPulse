import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Smile, Meh, Frown, Angry, PauseCircle as SlashCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const RatingScale = ({ scale, value, onChange, na_option, labels: customLabels }) => {
  const defaultIcons = [<Angry />, <Frown />, <Meh />, <Smile />, <Star />];
  const defaultColors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-lime-500', 'text-green-500'];
  const defaultLabels = ['Muy insatisfecho', 'Insatisfecho', 'Neutro', 'Satisfecho', 'Muy satisfecho'];

  const useDefaultLabels = scale === 5 && !customLabels;
  const labels = customLabels || (useDefaultLabels ? defaultLabels : []);
  
  const icons = scale === 5 ? defaultIcons : [];
  const colors = scale === 5 ? defaultColors : [];

  if (scale === 10) {
    return (
      <div className="flex flex-wrap justify-center items-center gap-2">
        {[...Array(11)].map((_, i) => (
          <button
            type="button"
            key={i}
            onClick={() => onChange(String(i))}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110
              ${value === String(i) ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600 hover:bg-indigo-200'}
            `}
          >
            <span className="text-sm font-bold">{i}</span>
          </button>
        ))}
         {na_option && (
          <Button variant={value === 'NA' ? 'destructive' : 'outline'} size="sm" onClick={() => onChange('NA')} className="mt-2 sm:mt-0 sm:ml-4">
            <SlashCircle className="w-4 h-4 mr-2" />
            No Aplica
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-around items-end w-full">
        {[...Array(scale)].map((_, i) => (
          <div key={i} className="flex flex-col items-center text-center w-16">
            <button
              type="button"
              onClick={() => onChange(String(i + 1))}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 
                ${value === String(i + 1) ? `${colors[i]} bg-opacity-100 shadow-lg` : 'text-gray-400 hover:text-gray-600'}`
              }
              style={{
                color: value === String(i + 1) ? colors[i]?.replace('text-', '').replace('-500', '') : undefined,
              }}
            >
              {icons[i] ? React.cloneElement(icons[i], { className: `w-8 h-8 ${value === String(i + 1) ? colors[i] : 'text-gray-400'}` }) : <span className="text-xl font-bold">{i+1}</span>}
            </button>
            <span className={`text-xs mt-2 font-medium ${value === String(i + 1) ? colors[i] : 'text-gray-500'}`}>{labels[i]}</span>
          </div>
        ))}
      </div>
      {na_option && (
        <Button variant={value === 'NA' ? 'destructive' : 'outline'} size="sm" onClick={() => onChange('NA')} className="mt-4">
            <SlashCircle className="w-4 h-4 mr-2" />
            No Aplica
        </Button>
      )}
    </div>
  );
};


const ClassificationQuestion = ({ question, answer, onAnswerChange, styles, index }) => {
  const items = question.options?.items_to_evaluate || [];
  const scale = 5; // Classification is always 1-5
  const na_option = question.na_option;

  const handleItemChange = (itemId, value) => {
    onAnswerChange(question.id, {
      [itemId]: { value }
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-6 bg-white/50 rounded-lg shadow-md border border-gray-200/80"
    >
      <div className="space-y-4">
        <Label className={cn("text-xl font-semibold block mb-2", styles?.primaryText || 'text-gray-800')}>
          {question.options?.classification_title || question.question_text}
        </Label>
        {items.map((item, itemIndex) => (
          <div key={item.id || itemIndex} className="p-4 border rounded-lg bg-gray-50/50">
            <Label className="font-semibold text-base mb-3 block">{item.text}</Label>
            <div className="flex flex-wrap justify-center items-center gap-2">
              {[...Array(scale)].map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleItemChange(item.id, String(i + 1))}
                  className={`w-9 h-9 text-sm font-bold rounded-md flex items-center justify-center transition-all duration-200 transform hover:scale-110
                    ${answer && answer[item.id]?.value === String(i + 1) ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600 hover:bg-indigo-200'}
                  `}
                >
                  {i + 1}
                </button>
              ))}
               {na_option && (
                  <button
                  type="button"
                  onClick={() => handleItemChange(item.id, 'NA')}
                  className={`h-9 px-3 text-xs font-bold rounded-md flex items-center justify-center transition-all duration-200
                      ${answer && answer[item.id]?.value === 'NA' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-200 text-gray-600 hover:bg-red-200'}`}
                  >
                  NA
                  </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const SurveyQuestion = ({ question, index, currentAnswer, onAnswer, styles }) => {
  const questionId = question.id;
  const answerValue = currentAnswer?.answer_value;

  const handleChange = (value, optionId = null) => {
    onAnswer(questionId, value, optionId);
  };

  const renderQuestionType = () => {
    const commonRadioGroup = (options) => (
        <RadioGroup value={answerValue} onValueChange={(val) => handleChange(val, val)}>
          {(options || []).map((opt) => (
            <div key={opt.id} className="flex items-center space-x-2">
              <RadioGroupItem value={opt.id} id={`${questionId}-${opt.id}`} />
              <Label htmlFor={`${questionId}-${opt.id}`}>{opt.text}</Label>
            </div>
          ))}
        </RadioGroup>
      );

    switch (question.question_type) {
      case 'rating':
        const ratingLabels = question.is_custom 
            ? ['Muy insatisfecho', 'Insatisfecho', 'Neutro', 'Satisfecho', 'Muy satisfecho']
            : question.options?.labels;
        const ratingScale = question.is_custom ? 5 : question.scale;
        return <RatingScale scale={ratingScale} value={answerValue} onChange={handleChange} na_option={question.na_option} labels={ratingLabels} />;
      case 'text':
        return <Textarea placeholder="Escribe tu respuesta aquí..." value={answerValue || ''} onChange={(e) => handleChange(e.target.value)} />;
      case 'multiple-choice':
      case 'gender':
      case 'age_range':
        return commonRadioGroup(question.options?.options || []);
      case 'checkbox':
        return (
          <>
            {(question.options?.options || []).map((opt) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${questionId}-${opt.id}`}
                  checked={answerValue && answerValue[opt.id]}
                  onCheckedChange={(checked) => {
                    const newValue = { ...(answerValue || {}), [opt.id]: checked };
                    handleChange(newValue);
                  }}
                />
                <Label htmlFor={`${questionId}-${opt.id}`}>{opt.text}</Label>
              </div>
            ))}
          </>
        );
      case 'classification':
        return <ClassificationQuestion question={question} answer={currentAnswer} onAnswerChange={onAnswer} styles={styles} index={index} />;
      default:
        return <Input placeholder="Respuesta no configurada" disabled />;
    }
  };

  if (!question || !question.question_type) {
      return (
          <motion.div>
              <Label className={cn("text-xl font-semibold block mb-4", styles?.primaryText || 'text-gray-800')}>
                  Cargando pregunta...
              </Label>
          </motion.div>
      );
  }
  
  if (question.question_type === 'classification') {
      return renderQuestionType();
  }

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Label className={cn("text-xl font-semibold block mb-4", styles?.primaryText || 'text-gray-800')}>
        {question.question_text}
      </Label>
      <div className="mt-4">{renderQuestionType()}</div>
    </motion.div>
  );
};

export default SurveyQuestion;