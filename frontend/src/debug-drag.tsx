import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { FormField } from './types/form';
import { FieldPalette } from './components/forms/FieldPalette';
import { FormCanvas } from './components/forms/FormCanvas';

export function DebugDrag() {
  const [fields, setFields] = useState<FormField[]>([]);

  console.log('DebugDrag render - current fields:', fields.length);

  const handleFieldsChange = (newFields: FormField[]) => {
    console.log('handleFieldsChange called with:', newFields.length, 'fields');
    setFields(newFields);
  };

  const handleFieldSelect = (field: FormField) => {
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ width: '300px', padding: '20px', borderRight: '1px solid #ccc' }}>
          <h3>Field Types</h3>
          <FieldPalette />
        </div>
        <div style={{ flex: 1, padding: '20px' }}>
          <h3>Form Canvas (Fields: {fields.length})</h3>
          <FormCanvas
            fields={fields}
            onFieldsChange={handleFieldsChange}
            onFieldSelect={handleFieldSelect}
          />
        </div>
      </div>
    </DndProvider>
  );
}
