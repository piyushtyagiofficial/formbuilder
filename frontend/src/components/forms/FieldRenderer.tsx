import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { DropTargetMonitor } from 'react-dnd';
import type { FormField } from '../../types/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldRendererProps {
  field: FormField;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMove: (dragIndex: number, dropIndex: number) => void;
}

export function FieldRenderer({ 
  field, 
  index, 
  isSelected, 
  onSelect, 
  onDelete, 
  onMove 
}: FieldRendererProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'field-reorder',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'field-reorder',
    hover: (item: { index: number }, monitor: DropTargetMonitor) => {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      // Get the bounding rectangle of the hovered item
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Get the client offset
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) return;
      
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the item's height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  preview(drop(ref));

  // Connect drag to the entire container, not just the grip handle
  drag(ref);

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            disabled
          />
        );
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            disabled
          />
        );
      case 'select':
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, idx) => (
                <SelectItem key={idx} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Checkbox id={`${field.id}-${idx}`} disabled />
                <Label htmlFor={`${field.id}-${idx}`}>{option}</Label>
              </div>
            ))}
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.id}-${idx}`}
                  name={field.id}
                  disabled
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor={`${field.id}-${idx}`}>{option}</Label>
              </div>
            ))}
          </div>
        );
      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        'group relative p-4 border rounded-lg cursor-pointer transition-all hover:cursor-move hover:border-blue-400',
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200',
        isDragging ? 'opacity-50 scale-105 shadow-lg' : 'opacity-100'
      )}
      onClick={onSelect}
      title="Click to select, drag to reorder"
    >
      <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-1 hover:bg-gray-100 rounded cursor-move" title="Drag to reorder">
          <GripVertical className="w-4 h-4 text-gray-600" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-red-100 hover:text-red-600"
        >
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {renderField()}
      </div>

      <div className="group absolute inset-0" />
    </div>
  );
}