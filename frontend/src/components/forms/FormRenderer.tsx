import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Form } from '../../types/form';
import type { FormField as FormFieldType } from '../../types/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface FormRendererProps {
  form: Form;
  onSubmit?: (data: any) => void;
  standalone?: boolean; // New prop to indicate standalone form view
}

export function FormRenderer({ form, onSubmit, standalone = false }: FormRendererProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  // Check if submission limit is reached
  const isSubmissionLimitReached = !!(form.settings.submissionLimit && 
    form.submissionCount >= form.settings.submissionLimit);
  
  // Check if approaching submission limit (90% or higher)
  const isApproachingLimit = !!(form.settings.submissionLimit && 
    form.submissionCount >= (form.settings.submissionLimit * 0.9) &&
    !isSubmissionLimitReached);

  // Create dynamic schema based on form fields
  const createSchema = (fields: FormFieldType[]) => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    fields.forEach(field => {
      let fieldSchema: z.ZodTypeAny = z.string();

      if (field.type === 'email') {
        fieldSchema = z.string().email('Invalid email address');
      } else if (field.type === 'file') {
        fieldSchema = z.any();
      }

      if (field.validation?.minLength) {
        fieldSchema = (fieldSchema as z.ZodString).min(field.validation.minLength);
      }

      if (field.validation?.maxLength) {
        fieldSchema = (fieldSchema as z.ZodString).max(field.validation.maxLength);
      }

      if (field.required) {
        schemaFields[field.id] = fieldSchema;
      } else {
        schemaFields[field.id] = fieldSchema.optional();
      }
    });

    return z.object(schemaFields);
  };

  const schema = createSchema(form.fields);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      // Check submission limit before submitting
      if (form.settings.submissionLimit && form.submissionCount >= form.settings.submissionLimit) {
        toast({
          title: "Submission Limit Reached",
          description: `This form has reached its submission limit of ${form.settings.submissionLimit}.`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      
      // Handle regular fields
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof FileList) {
          for (let i = 0; i < value.length; i++) {
            formData.append(key, value[i]);
          }
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value || ''));
        }
      });

      await formApi.submitForm(form.id, formData);
      
      setSubmitted(true);
      onSubmit?.(data);
      toast({
        title: "Success",
        description: "Form submitted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormFieldType) => {
    const error = errors[field.id];

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-gray-700 font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              {...register(field.id)}
              className={`transition-all duration-200 ${
                error 
                  ? 'border-red-500 focus:border-red-600 focus:ring-red-200' 
                  : 'border-purple-200 focus:border-purple-500 focus:ring-purple-200 hover:border-purple-300'
              }`}
            />
            {error && (
              <p className="text-sm text-red-500 flex items-center">
                <span className="mr-1">⚠️</span>
                {error.message as string}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-gray-700 font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              {...register(field.id)}
              className={`transition-all duration-200 ${
                error 
                  ? 'border-red-500 focus:border-red-600 focus:ring-red-200' 
                  : 'border-purple-200 focus:border-purple-500 focus:ring-purple-200 hover:border-purple-300'
              }`}
            />
            {error && (
              <p className="text-sm text-red-500 flex items-center">
                <span className="mr-1">⚠️</span>
                {error.message as string}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-gray-700 font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select onValueChange={(value) => setValue(field.id, value)}>
              <SelectTrigger className={`transition-all duration-200 ${
                error 
                  ? 'border-red-500 focus:border-red-600 focus:ring-red-200' 
                  : 'border-purple-200 focus:border-purple-500 focus:ring-purple-200 hover:border-purple-300'
              }`}>
                <SelectValue placeholder={field.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent className="border-purple-200 shadow-xl">
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option} className="hover:bg-purple-50">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <p className="text-sm text-red-500 flex items-center">
                <span className="mr-1">⚠️</span>
                {error.message as string}
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-3">
            <Label className="text-gray-700 font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-3">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 transition-colors">
                  <Checkbox
                    id={`${field.id}-${option}`}
                    className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    onCheckedChange={(checked) => {
                      const currentValues: string[] = (watch(field.id) as string[]) || [];
                      if (checked) {
                        setValue(field.id, [...currentValues, option]);
                      } else {
                        setValue(field.id, currentValues.filter((v: string) => v !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${field.id}-${option}`} className="text-gray-700 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {error && (
              <p className="text-sm text-red-500 flex items-center">
                <span className="mr-1">⚠️</span>
                {error.message as string}
              </p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-3">
            <Label className="text-gray-700 font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-3">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                  <input
                    type="radio"
                    id={`${field.id}-${option}`}
                    value={option}
                    {...register(field.id)}
                    className="w-4 h-4 text-blue-600 border-blue-300 focus:ring-blue-200"
                  />
                  <Label htmlFor={`${field.id}-${option}`} className="text-gray-700 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {error && (
              <p className="text-sm text-red-500 flex items-center">
                <span className="mr-1">⚠️</span>
                {error.message as string}
              </p>
            )}
          </div>
        );

      case 'file':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="file"
              {...register(field.id)}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-500">{error.message as string}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <div className={standalone ? "text-center py-12" : ""}>
        <div className={`${standalone ? "" : "max-w-2xl mx-auto"}`}>
          {!standalone && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Thank You!</h2>
                <p className="text-gray-600">
                  {form.settings?.thankYouMessage || "Your form has been submitted successfully."}
                </p>
              </CardContent>
            </Card>
          )}
          {standalone && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce-in">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">Thank You!</h2>
              <p className="text-gray-700 text-lg">
                {form.settings?.thankYouMessage || "Your form has been submitted successfully."}
              </p>
              <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                <p className="text-sm text-green-700">✨ Your response has been recorded</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={standalone ? "" : "max-w-2xl mx-auto"}>
      {/* Submission Limit Warning */}
      {form.settings.submissionLimit && (
        <div className={`mb-6 ${standalone ? "" : "mx-auto max-w-2xl"}`}>
          {isSubmissionLimitReached ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-800 font-medium">
                  This form has reached its submission limit ({form.settings.submissionLimit} submissions)
                </p>
              </div>
            </div>
          ) : isApproachingLimit ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="flex-1">
                  <p className="text-yellow-800 font-medium mb-2">
                    This form is approaching its submission limit. {form.settings.submissionLimit - form.submissionCount} submissions remaining.
                  </p>
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(form.submissionCount / form.settings.submissionLimit) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-blue-800 font-medium mb-2">
                    Submissions: {form.submissionCount} / {form.settings.submissionLimit}
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(form.submissionCount / form.settings.submissionLimit) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!standalone && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">{form.title}</CardTitle>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {form.fields.map(renderField)}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || isSubmissionLimitReached}
                size="lg"
              >
                {isSubmissionLimitReached 
                  ? 'Submission Limit Reached' 
                  : isSubmitting 
                    ? 'Submitting...' 
                    : 'Submit Form'
                }
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      
      {standalone && (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {form.fields.map(renderField)}
          
          <Button 
            type="submit" 
            className={`w-full text-white shadow-lg hover:shadow-xl transition-all duration-200 ${
              isSubmissionLimitReached 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105'
            }`}
            disabled={isSubmitting || isSubmissionLimitReached}
            size="lg"
          >
            {isSubmissionLimitReached ? (
              'Submission Limit Reached'
            ) : isSubmitting ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </div>
            ) : (
              'Submit'
            )}
          </Button>
        </form>
      )}
    </div>
  );
}