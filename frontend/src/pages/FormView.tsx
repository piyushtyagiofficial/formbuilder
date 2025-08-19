import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FormRenderer } from '@/components/forms/FormRenderer';
import type { Form } from '../types/form';
import { formApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function FormView() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadForm(id);
    }
  }, [id]);

  const loadForm = async (formId: string) => {
    try {
      const data = await formApi.getForm(formId);
      if (data.status !== 'published') {
        setError('This form is not published yet.');
        return;
      }
      setForm(data);
    } catch (error) {
      setError('Form not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-purple-700 font-medium">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 via-pink-100 to-orange-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Form Not Available</h2>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      {/* Clean header with form title - Enhanced Google Forms style */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-purple-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="border-l-4 border-gradient-to-b from-purple-500 to-blue-500 pl-6">
            <h1 className="text-4xl font-light bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{form.title}</h1>
            {form.description && (
              <p className="text-gray-700 mt-3 text-lg font-light">{form.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main form content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-purple-200 hover:shadow-2xl transition-all duration-300">
          <div className="p-8">
            <FormRenderer form={form} standalone={true} />
          </div>
        </div>
        
        {/* Enhanced footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-purple-500 font-medium">This form is created with FormBuilder</p>
        </div>
      </div>
    </div>
  );
}