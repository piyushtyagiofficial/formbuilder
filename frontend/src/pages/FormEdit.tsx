import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Form } from '../types/form';
import { formApi } from '../lib/api';
import { FormBuilder } from '../components/forms/FormBuilder';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { FormRenderer } from '../components/forms/FormRenderer';
import { Save, Eye, Loader2, ArrowLeft, Settings, ExternalLink } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export function FormEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fallback: extract ID from pathname if useParams fails
  const pathname = window.location.pathname;
  const pathId = pathname.match(/\/forms\/([^\/]+)\/edit/)?.[1];
  const actualId = id || pathId;
  const isNewForm = actualId === 'new';

  const [form, setForm] = useState<Form>({
    id: '',
    title: 'Untitled Form',
    description: '',
    fields: [],
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submissionCount: 0,
    settings: {
      thankYouMessage: 'Thank you for your submission!',
      allowFileUploads: false,
    },
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    
    if (!isNewForm && actualId) {
      loadForm(actualId);
    } else {
    }
  }, [id, actualId, isNewForm]);

  const loadForm = async (formId: string) => {
    setLoading(true);
    try {
      const data = await formApi.getForm(formId);
      setForm(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load form",
        variant: "destructive",
      });
      navigate('/forms');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    
    if (!form.title.trim()) {
      toast({
        title: "Error",
        description: "Form title is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      let savedForm;
      
      // Determine if this is truly a new form - either URL says 'new' or form has no ID
      const isTrulyNewForm = actualId === 'new' || !form.id;
      
      if (isTrulyNewForm) {
        savedForm = await formApi.createForm({
          title: form.title,
          description: form.description,
          fields: form.fields,
          status: form.status,
          settings: form.settings,
        });

        // Update form state with the created form data including ID
        setForm(savedForm);
        // Navigate to edit page
        navigate(`/forms/${savedForm.id}/edit`);
      } else {
        // Use form.id first, then actualId as fallback
        const formId = form.id || actualId;

        
        if (!formId || formId === 'new' || formId === '') {
          console.error('Invalid form ID detected. form.id:', form.id, 'actualId:', actualId, 'resolved:', formId);
          // Instead of throwing error, treat as new form
          savedForm = await formApi.createForm({
            title: form.title,
            description: form.description,
            fields: form.fields,
            status: form.status,
            settings: form.settings,
          });
          setForm(savedForm);
          navigate(`/forms/${savedForm.id}/edit`);
        } else {
          // Only send the fields that can be updated, not system fields like id, createdAt, etc.
          const updateData = {
            title: form.title,
            description: form.description,
            fields: form.fields,
            status: form.status,
            settings: form.settings,
          };
          savedForm = await formApi.updateForm(formId, updateData);
          setForm(savedForm);
        }
      }

      toast({
        title: "Success",
        description: "Form saved successfully",
      });
    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: "Error",
        description: "Failed to save form",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    
    if (form.fields.length === 0) {
      toast({
        title: "Error",
        description: "Add at least one field before publishing",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use form.id first, then actualId as fallback
      const formId = form.id || actualId;
      
      if (!formId || formId === 'new') {
        toast({
          title: "Error",
          description: "Please save the form before publishing",
          variant: "destructive",
        });
        return;
      }
      
      // Only send the fields that can be updated
      const updateData = {
        title: form.title,
        description: form.description,
        fields: form.fields,
        status: 'published' as const,
        settings: form.settings,
      };
      const updatedForm = await formApi.updateForm(formId, updateData);
      setForm(updatedForm);
      toast({
        title: "Success",
        description: "Form published successfully",
      });
    } catch (error) {
      console.error('Error publishing form:', error);
      toast({
        title: "Error",
        description: "Failed to publish form",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isNewForm ? 'Create New Form' : 'Edit Form'}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant={form.status === 'published' ? 'default' : 'secondary'}
                className={
                  form.status === 'published' 
                    ? 'bg-green-500 hover:bg-green-600 text-white rounded-full' 
                    : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-full'
                }
              >
                {form.status}
              </Badge>
              {!isNewForm && (
                <span className="text-sm text-gray-500">
                  {form.submissionCount} submissions
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={form.fields.length === 0}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Form Preview</DialogTitle>
              </DialogHeader>
              <FormRenderer 
                form={form} 
              />
            </DialogContent>
          </Dialog>

          {!isNewForm && form.status === 'published' && (
            <Button 
              variant="outline" 
              onClick={() => window.open(`/f/${actualId}`, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Live Form
            </Button>
          )}
          
          <Button 
            onClick={handleSave} 
            disabled={saving}
            variant="outline"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>

          {form.status === 'draft' && !isNewForm && (
            <Button onClick={handlePublish}>
              Publish Form
            </Button>
          )}
        </div>
      </div>

      {/* Form Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Form Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="form-title">Form Title</Label>
              <Input
                id="form-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter form title"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="form-description">Description</Label>
            <Textarea
              id="form-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what this form is for"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Builder */}
      <FormBuilder
        initialFields={form.fields}
        onFieldsChange={(fields) => setForm({ ...form, fields })}
        formSettings={form.settings}
        onSettingsChange={(settings) => setForm({ ...form, settings })}
      />
    </div>
  );
}