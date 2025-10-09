import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import SurveyEditor from '@/components/admin/surveys/SurveyEditor';
import SurveyImporter from '@/components/admin/surveys/SurveyImporter';
import SurveyPreview from '@/components/admin/surveys/SurveyPreview';

const SurveyModals = ({
  isEditorOpen,
  setIsEditorOpen,
  editingSurvey,
  setEditingSurvey,
  rubros,
  handleSaveSurvey,
  isImporterOpen,
  setIsImporterOpen,
  importedSurvey,
  setImportedSurvey,
  isPreviewOpen,
  setIsPreviewOpen,
  previewingSurvey
}) => {
  return (
    <>
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        {isEditorOpen && (
          <SurveyEditor
            key={editingSurvey?.id || 'new'}
            survey={editingSurvey}
            rubrosList={rubros}
            onSave={handleSaveSurvey}
            onCancel={() => {
              setIsEditorOpen(false);
              setEditingSurvey(null);
            }}
          />
        )}
      </Dialog>
      <Dialog open={isImporterOpen} onOpenChange={setIsImporterOpen}>
        {isImporterOpen && (
          <SurveyImporter
            survey={importedSurvey}
            rubrosList={rubros}
            onSave={handleSaveSurvey}
            onCancel={() => {
              setIsImporterOpen(false);
              setImportedSurvey(null);
            }}
          />
        )}
      </Dialog>
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        {isPreviewOpen && (
          <SurveyPreview
            survey={previewingSurvey}
            onClose={() => setIsPreviewOpen(false)}
          />
        )}
      </Dialog>
    </>
  );
};

export default SurveyModals;