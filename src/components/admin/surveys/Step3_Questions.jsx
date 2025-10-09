import React from 'react';
    import { motion } from 'framer-motion';
    import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { GripVertical, X, Copy } from 'lucide-react';
    import { Label } from '@/components/ui/label';
    import { Checkbox } from '@/components/ui/checkbox';
    
    const Step3_Questions = ({ formData, onFormChange }) => {
      const setQuestions = (newQuestions) => {
        onFormChange('questions', newQuestions);
      };
    
      const addQuestion = (type) => {
        const newQuestion = {
          id: Date.now(),
          type,
          question: '',
          na_option: false,
          is_demographic: false,
        };
    
        if (type === 'multiple-choice') {
          newQuestion.options = [{ id: Date.now(), text: '' }];
        } else if (type === 'classification') {
          newQuestion.classification_options = [{ id: Date.now(), text: '' }];
          newQuestion.classification_title = '';
        } else if (type === 'rating') {
          newQuestion.scale = 5;
        } else if (type === 'gender') {
          newQuestion.question = '¿Cuál es tu género?';
          newQuestion.options = [
            { id: 'masculino', text: 'Masculino' },
            { id: 'femenino', text: 'Femenino' },
            { id: 'otro', text: 'Otro' },
          ];
          newQuestion.is_demographic = true;
        } else if (type === 'age_range') {
          newQuestion.question = '¿Cuál es tu rango de edad?';
          newQuestion.options = [
            { id: '18-24', text: '18-24 años' },
            { id: '25-34', text: '25-34 años' },
            { id: '35-44', text: '35-44 años' },
            { id: '45-54', text: '45-54 años' },
            { id: '55-mas', text: '55+ años' },
          ];
          newQuestion.is_demographic = true;
        }
        setQuestions([...formData.questions, newQuestion]);
      };

      const duplicateQuestion = (questionId, index) => {
        const questionToDuplicate = formData.questions.find(q => q.id === questionId);
        if (!questionToDuplicate) return;
    
        const duplicatedQuestion = JSON.parse(JSON.stringify(questionToDuplicate)); // Deep copy
        duplicatedQuestion.id = Date.now();
    
        if (duplicatedQuestion.options) {
          duplicatedQuestion.options = duplicatedQuestion.options.map(opt => ({ ...opt, id: Date.now() + Math.random() }));
        }
        if (duplicatedQuestion.classification_options) {
          duplicatedQuestion.classification_options = duplicatedQuestion.classification_options.map(opt => ({ ...opt, id: Date.now() + Math.random() }));
        }
    
        const newQuestions = [...formData.questions];
        newQuestions.splice(index + 1, 0, duplicatedQuestion);
        setQuestions(newQuestions);
      };
    
      const updateQuestion = (questionId, field, value) => {
        setQuestions(formData.questions.map(q => q.id === questionId ? { ...q, [field]: value } : q));
      };
    
      const updateOption = (questionId, optionId, value, optionType = 'options') => {
        setQuestions(formData.questions.map(q => {
          if (q.id === questionId) {
            const updatedOptions = q[optionType].map(opt => opt.id === optionId ? { ...opt, text: value } : opt);
            return { ...q, [optionType]: updatedOptions };
          }
          return q;
        }));
      };
    
      const addOption = (questionId, optionType = 'options') => {
        setQuestions(formData.questions.map(q => {
          if (q.id === questionId) {
            const newOption = { id: Date.now(), text: '' };
            const updatedOptions = q[optionType] ? [...q[optionType], newOption] : [newOption];
            return { ...q, [optionType]: updatedOptions };
          }
          return q;
        }));
      };
    
      const removeOption = (questionId, optionId, optionType = 'options') => {
        setQuestions(formData.questions.map(q => {
          if (q.id === questionId) {
            const updatedOptions = q[optionType].filter(opt => opt.id !== optionId);
            return { ...q, [optionType]: updatedOptions };
          }
          return q;
        }));
      };
    
      const removeQuestion = (questionId) => {
        setQuestions(formData.questions.filter(q => q.id !== questionId));
      };
    
      const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(formData.questions);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setQuestions(items);
      };
    
      return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h3 className="text-lg font-semibold">Paso 3: Diseño de Preguntas</h3>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                  {formData.questions.map((q, index) => (
                    <Draggable key={q.id} draggableId={String(q.id)} index={index}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <Card className="bg-gray-50">
                            <CardHeader className="flex flex-row items-center justify-between p-4">
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                                <CardTitle className="text-base">Pregunta {index + 1}</CardTitle>
                              </div>
                              <div className="flex items-center">
                                <Button variant="ghost" size="icon" onClick={() => duplicateQuestion(q.id, index)}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-2">
                              <Textarea
                                placeholder="Escribe tu pregunta aquí..."
                                value={q.question}
                                onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                              />
                              {q.type === 'rating' && (
                                <Select value={String(q.scale)} onValueChange={(val) => updateQuestion(q.id, 'scale', parseInt(val))}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="5">Escala 1-5</SelectItem>
                                    <SelectItem value="10">Escala 1-10</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                              {['multiple-choice', 'gender', 'age_range'].includes(q.type) && (
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Opciones de Respuesta</label>
                                  {q.options.map(opt => (
                                    <div key={opt.id} className="flex items-center gap-2">
                                      <Input
                                        placeholder="Opción de respuesta"
                                        value={opt.text}
                                        onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                                        disabled={q.is_demographic}
                                      />
                                      {!q.is_demographic && (
                                        <Button variant="ghost" size="icon" onClick={() => removeOption(q.id, opt.id)}>
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                  {!q.is_demographic && (
                                    <Button variant="outline" size="sm" onClick={() => addOption(q.id)}>Añadir Opción</Button>
                                  )}
                                </div>
                              )}
                              {q.type === 'classification' && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor={`classification_title_${q.id}`}>Título del Bloque de Clasificación</Label>
                                    <Input
                                      id={`classification_title_${q.id}`}
                                      placeholder="Ej: Valora los siguientes aspectos"
                                      value={q.classification_title || ''}
                                      onChange={(e) => updateQuestion(q.id, 'classification_title', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Elementos a Clasificar</label>
                                    {q.classification_options.map(opt => (
                                      <div key={opt.id} className="flex items-center gap-2 mt-2">
                                        <Input
                                          placeholder="Elemento a clasificar"
                                          value={opt.text}
                                          onChange={(e) => updateOption(q.id, opt.id, e.target.value, 'classification_options')}
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => removeOption(q.id, opt.id, 'classification_options')}>
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                    <Button variant="outline" size="sm" className="mt-2" onClick={() => addOption(q.id, 'classification_options')}>Añadir Elemento</Button>
                                  </div>
                                </div>
                              )}
                              {(q.type === 'rating' || q.type === 'classification') && (
                                <div className="flex items-center space-x-2 pt-2">
                                  <Checkbox
                                    id={`na_option_${q.id}`}
                                    checked={q.na_option}
                                    onCheckedChange={(checked) => updateQuestion(q.id, 'na_option', checked)}
                                  />
                                  <Label htmlFor={`na_option_${q.id}`}>Incluir opción "No aplica"</Label>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => addQuestion('rating')}>Calificación</Button>
            <Button variant="outline" onClick={() => addQuestion('multiple-choice')}>Opción Múltiple</Button>
            <Button variant="outline" onClick={() => addQuestion('classification')}>Clasificación</Button>
            <Button variant="outline" onClick={() => addQuestion('gender')}>Género</Button>
            <Button variant="outline" onClick={() => addQuestion('age_range')}>Rango de Edad</Button>
            <Button variant="outline" onClick={() => addQuestion('text')}>Texto Abierto</Button>
          </div>
        </motion.div>
      );
    };
    
    export default Step3_Questions;