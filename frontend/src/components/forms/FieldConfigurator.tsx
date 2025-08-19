import React from 'react';
import type { FormField } from '../../types/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface FieldConfiguratorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
}

export function FieldConfigurator({ field, onUpdate }: FieldConfiguratorProps) {
  const handleChange = (updates: Partial<FormField>) => {
    onUpdate({ ...field, ...updates });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    handleChange({ options: newOptions });
  };

  const handleAddOption = () => {
    const newOptions = [...(field.options || []), 'New Option'];
    handleChange({ options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = field.options?.filter((_, i) => i !== index) || [];
    handleChange({ options: newOptions });
  };

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Field Settings</h3>
        <p className="text-sm text-gray-500">Configure the selected field</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="field-label">Label</Label>
          <Input
            id="field-label"
            value={field.label}
            onChange={(e) => handleChange({ label: e.target.value })}
            placeholder="Enter field label"
          />
        </div>

        <div>
          <Label htmlFor="field-placeholder">Placeholder</Label>
          <Input
            id="field-placeholder"
            value={field.placeholder || ''}
            onChange={(e) => handleChange({ placeholder: e.target.value })}
            placeholder="Enter placeholder text"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="field-required">Required</Label>
          <Switch
            id="field-required"
            checked={field.required}
            onCheckedChange={(required) => handleChange({ required })}
          />
        </div>

        {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                    className="h-9 w-9 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {(field.type === 'text' || field.type === 'email' || field.type === 'textarea') && (
          <div>
            <Label>Validation</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label htmlFor="min-length" className="text-xs">Min Length</Label>
                <Input
                  id="min-length"
                  type="number"
                  value={field.validation?.minLength || ''}
                  onChange={(e) => handleChange({
                    validation: {
                      ...field.validation,
                      minLength: parseInt(e.target.value) || undefined
                    }
                  })}
                  placeholder="Min"
                />
              </div>
              <div>
                <Label htmlFor="max-length" className="text-xs">Max Length</Label>
                <Input
                  id="max-length"
                  type="number"
                  value={field.validation?.maxLength || ''}
                  onChange={(e) => handleChange({
                    validation: {
                      ...field.validation,
                      maxLength: parseInt(e.target.value) || undefined
                    }
                  })}
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}