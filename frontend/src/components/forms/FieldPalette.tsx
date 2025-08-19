import React from 'react';
import { useDrag } from 'react-dnd';
import { 
  Type, 
  Mail, 
  ChevronDown, 
  CheckSquare, 
  Circle, 
  FileText, 
  Upload 
} from 'lucide-react';
import type { FormField } from '../../types/form';

const fieldTypes = [
  { type: 'text', label: 'Text Input', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'select', label: 'Select', icon: ChevronDown },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'radio', label: 'Radio', icon: Circle },
  { type: 'textarea', label: 'Text Area', icon: FileText },
  { type: 'file', label: 'File Upload', icon: Upload },
] as const;

interface DraggableFieldProps {
  type: FormField['type'];
  label: string;
  icon: React.ComponentType<any>;
}

function DraggableField({ type, label, icon: Icon }: DraggableFieldProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'field',
    item: { fieldType: type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (_item, monitor) => {
    },
  }));

  return (
    <div
      ref={drag as any}
      className={`
        flex items-center p-3 bg-white border border-gray-200 rounded-lg cursor-move
        hover:shadow-md transition-all duration-200
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <Icon className="w-5 h-5 text-gray-500 mr-3" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}

export function FieldPalette() {
  return (
    <div className="space-y-4">
      <div className="pb-2 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Form Fields</h3>
        <p className="text-sm text-gray-500">Drag fields to build your form</p>
      </div>
      
      <div className="grid gap-2">
        {fieldTypes.map(({ type, label, icon }) => (
          <DraggableField
            key={type}
            type={type}
            label={label}
            icon={icon}
          />
        ))}
      </div>
    </div>
  );
}