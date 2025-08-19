import { useCallback } from 'react';
import { useDrop } from 'react-dnd';
import type { FormField } from '../../types/form';
import { FieldRenderer } from './FieldRenderer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FormCanvasProps {
  fields: FormField[];
  onFieldsChange: (fields: FormField[]) => void;
  onFieldSelect: (field: FormField) => void;
  selectedFieldId?: string;
}

export function FormCanvas({ 
  fields, 
  onFieldsChange, 
  onFieldSelect, 
  selectedFieldId 
}: FormCanvasProps) {

  const handleDrop = useCallback((item: { fieldType: FormField['type'] }) => {
    console.log('Drop event fired for field type:', item.fieldType);
    console.log('Current fields count:', fields.length);
    
    const newField: FormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: item.fieldType,
      label: `${item.fieldType} Field`,
      placeholder: '',
      required: false,
      options: item.fieldType === 'select' || item.fieldType === 'radio' ? ['Option 1', 'Option 2'] : undefined,
    };
    
    const updatedFields = [...fields, newField];
    
    onFieldsChange(updatedFields);
  }, [fields, onFieldsChange]);

  const moveField = useCallback((dragIndex: number, hoverIndex: number) => {
    const draggedField = fields[dragIndex];
    const newFields = [...fields];
    newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, draggedField);
    onFieldsChange(newFields);
  }, [fields, onFieldsChange]);

  const handleFieldDelete = useCallback((fieldId: string) => {
    const updatedFields = fields.filter(field => field.id !== fieldId);
    onFieldsChange(updatedFields);
  }, [fields, onFieldsChange]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'field',
    drop: handleDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [handleDrop]);

  return (
    <Card className="min-h-[600px] p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Form Field Sequence</h3>
        <p className="text-sm text-gray-500">This is how your form field sequence will look to users. Drag fields to reorder them.</p>
      </div>

      <div
        ref={drop as any}
        className={`
          space-y-4 min-h-96 p-4 border-2 border-dashed rounded-lg transition-colors
          ${isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${fields.length === 0 ? 'flex items-center justify-center' : ''}
        `}
      >
        {fields.length === 0 ? (
          <div className="text-center">
            <Plus className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No fields yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Drag fields from the left panel to start building your form
            </p>
          </div>
        ) : (
          fields.map((field, index) => (
            <FieldRenderer
              key={field.id}
              field={field}
              index={index}
              isSelected={selectedFieldId === field.id}
              onSelect={() => onFieldSelect(field)}
              onDelete={() => handleFieldDelete(field.id)}
              onMove={moveField}
            />
          ))
        )}
      </div>

      {fields.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <Button className="w-full" size="lg">
            Submit Form
          </Button>
        </div>
      )}
    </Card>
  );
}