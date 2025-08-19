import { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { FormField } from '../../types/form';
import { FieldPalette } from './FieldPalette';
import { FormCanvas } from './FormCanvas';
import { FieldConfigurator } from './FieldConfigurator';
import { FormSettings } from './FormSettings';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface FormBuilderProps {
  initialFields?: FormField[];
  onFieldsChange: (fields: FormField[]) => void;
  formSettings?: any;
  onSettingsChange: (settings: any) => void;
}

export function FormBuilder({ 
  initialFields = [], 
  onFieldsChange, 
  formSettings,
  onSettingsChange 
}: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);

  const handleFieldsUpdate = useCallback((newFields: FormField[]) => {

    setFields(newFields);
    onFieldsChange(newFields);
  }, [fields.length, onFieldsChange]);

  const handleFieldSelect = (field: FormField) => {
    setSelectedField(field);
  };

  const handleFieldUpdate = (updatedField: FormField) => {
    const updatedFields = fields.map(field => 
      field.id === updatedField.id ? updatedField : field
    );
    handleFieldsUpdate(updatedFields);
    setSelectedField(updatedField);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col lg:flex-row h-full gap-4 lg:gap-6">
        {/* Left Panel - Field Palette & Configuration */}
        <div className="w-full lg:w-80 space-y-4 lg:space-y-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Field Types</h3>
            <FieldPalette />
          </Card>
          
          <Card className="p-4">
            <Tabs defaultValue="field" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="field">Field Settings</TabsTrigger>
                <TabsTrigger value="form">Form Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="field" className="space-y-4 mt-4">
                {selectedField ? (
                  <FieldConfigurator
                    field={selectedField}
                    onUpdate={handleFieldUpdate}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 mb-2">
                      Select a field to configure its properties
                    </p>
                    <p className="text-xs text-gray-400">
                      Click on any field in the form canvas
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="form" className="space-y-4 mt-4">
                <FormSettings
                  settings={formSettings}
                  onUpdate={onSettingsChange}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Panel - Form Canvas */}
        <div className="flex-1 min-h-[600px]">
          <FormCanvas
            fields={fields}
            onFieldsChange={handleFieldsUpdate}
            onFieldSelect={handleFieldSelect}
            selectedFieldId={selectedField?.id}
          />
        </div>
      </div>
    </DndProvider>
  );
}