import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface FormSettingsProps {
  settings: any;
  onUpdate: (settings: any) => void;
}

export function FormSettings({ settings, onUpdate }: FormSettingsProps) {
  const handleChange = (updates: any) => {
    onUpdate({ ...settings, ...updates });
  };

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Form Settings</h3>
        <p className="text-sm text-gray-500">Configure form behavior</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="thank-you-message">Thank You Message</Label>
          <Textarea
            id="thank-you-message"
            value={settings?.thankYouMessage || ''}
            onChange={(e) => handleChange({ thankYouMessage: e.target.value })}
            placeholder="Thank you for your submission!"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="submission-limit">Submission Limit</Label>
          <Input
            id="submission-limit"
            type="number"
            value={settings?.submissionLimit || ''}
            onChange={(e) => handleChange({ 
              submissionLimit: parseInt(e.target.value) || undefined 
            })}
            placeholder="Leave empty for unlimited"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Allow File Uploads</Label>
            <p className="text-sm text-gray-500">Enable file upload fields</p>
          </div>
          <Switch
            checked={settings?.allowFileUploads || false}
            onCheckedChange={(allowFileUploads) => handleChange({ allowFileUploads })}
          />
        </div>
      </div>
    </div>
  );
}