import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Plus, ListTree } from 'lucide-react';

    const AvailableSurveyList = ({ availableSurveys, assignedSurveys, onAssignToAll, onAssignByLocation }) => {
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Plantillas Disponibles</h3>
          {availableSurveys.length > 0 ? availableSurveys.map(survey => {
            const isAssigned = assignedSurveys.some(as => as.surveys.id === survey.id);
            return (
            <Card key={survey.id} className={isAssigned ? 'bg-gray-50 border-dashed' : ''}>
              <CardHeader>
                <CardTitle className="text-base">{survey.title}</CardTitle>
                <CardDescription className="text-xs pt-1">{survey.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => onAssignByLocation(survey)} disabled={isAssigned}>
                  <ListTree className="w-4 h-4 mr-2" /> Asignar por Local
                </Button>
                <Button size="sm" onClick={() => onAssignToAll(survey)} disabled={isAssigned}>
                  <Plus className="w-4 h-4 mr-2" /> Asignar a Todos
                </Button>
              </CardContent>
            </Card>
          )}) : <p className="text-sm text-muted-foreground text-center py-8">No hay plantillas de encuestas para este rubro.</p>}
        </div>
      );
    };

    export default AvailableSurveyList;