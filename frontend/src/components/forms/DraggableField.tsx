import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { DropTargetMonitor } from 'react-dnd';
import type { FormField } from '../../types/form';
import { FieldRenderer } from './FieldRenderer';

interface DragItem {
  id: string;
  index: number;
  type: string;
}

interface DraggableFieldProps {
  field: FormField;
  index: number;
  moveField: (dragIndex: number, hoverIndex: number) => void;
  onFieldSelect: (field: FormField) => void;
  onFieldDelete: (fieldId: string) => void;
  isSelected: boolean;
}

export function DraggableField({
  field,
  index,
  moveField,
  onFieldSelect,
  onFieldDelete,
  isSelected,
}: DraggableFieldProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: string | symbol | null }
  >({
    accept: 'canvas-field',
    collect(monitor: DropTargetMonitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset?.y ?? 0) - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
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

      // Time to actually perform the action
      moveField(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'canvas-field',
    item: () => {
      return { id: field.id, index, type: 'canvas-field' };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;
  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className={`cursor-move transition-all duration-200 ${
        isDragging ? 'scale-105 shadow-lg' : ''
      }`}
    >
      <FieldRenderer
        field={field}
        index={index}
        isSelected={isSelected}
        onSelect={() => onFieldSelect(field)}
        onDelete={() => onFieldDelete(field.id)}
        onMove={moveField}
      />
    </div>
  );
}
