import axios from 'axios';
import type { Form, FormSubmission } from '../types/form';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data for development
const mockForms: Form[] = [
  {
    id: '1',
    title: 'Contact Form',
    description: 'A simple contact form for customer inquiries',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true,
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        required: true,
      },
      {
        id: 'message',
        type: 'textarea',
        label: 'Message',
        placeholder: 'Enter your message',
        required: true,
      },
    ],
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submissionCount: 42,
    settings: {
      thankYouMessage: 'Thank you for contacting us!',
      allowFileUploads: false,
    },
  },
  {
    id: '2',
    title: 'Survey Form',
    description: 'Customer satisfaction survey',
    fields: [
      {
        id: 'rating',
        type: 'select',
        label: 'How would you rate our service?',
        required: true,
        options: ['Excellent', 'Good', 'Average', 'Poor'],
      },
    ],
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submissionCount: 15,
    settings: {
      thankYouMessage: 'Thank you for your feedback!',
      allowFileUploads: false,
    },
  },
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const formApi = {
  // Forms CRUD with fallback to mock data
  getForms: async (): Promise<Form[]> => {
    try {
      const response = await api.get('/forms');
      // Backend returns {forms: Form[], pagination: {...}}
      return response.data.forms || response.data;
    } catch (error) {
      console.warn('Backend not available, using mock data');
      await delay(500); // Simulate network delay
      return mockForms;
    }
  },
  getForm: async (id: string): Promise<Form> => {
    try {
      const response = await api.get(`/forms/${id}`);

      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock data');
      await delay(300);
      const form = mockForms.find(f => f.id === id);
      if (!form) throw new Error('Form not found');
      return form;
    }
  },
  
  createForm: async (form: Omit<Form, 'id' | 'createdAt' | 'updatedAt' | 'submissionCount'>): Promise<Form> => {
    try {
      const response = await api.post('/forms', form);
      return response.data;
    } catch (error) {
      console.error('API: Error creating form:', error);
      console.warn('Backend not available, using mock data');
      await delay(500);
      const newForm: Form = {
        ...form,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submissionCount: 0,
      };
      mockForms.unshift(newForm);
      return newForm;
    }
  },
  
  updateForm: async (id: string, form: Partial<Form>): Promise<Form> => {
    try {
      const response = await api.put(`/forms/${id}`, form);
      return response.data;
    } catch (error) {
      console.error('API: Error updating form:', error);
      console.warn('Backend not available, using mock data');
      await delay(300);
      const existingForm = mockForms.find(f => f.id === id);
      if (!existingForm) throw new Error('Form not found');
      const updatedForm = { ...existingForm, ...form, updatedAt: new Date().toISOString() };
      const index = mockForms.findIndex(f => f.id === id);
      mockForms[index] = updatedForm;
      return updatedForm;
    }
  },
  
  deleteForm: async (id: string): Promise<void> => {
    try {
      await api.delete(`/forms/${id}`);
    } catch (error) {
      console.warn('Backend not available, using mock data');
      await delay(300);
      const index = mockForms.findIndex(f => f.id === id);
      if (index > -1) mockForms.splice(index, 1);
    }
  },
  
  duplicateForm: async (id: string): Promise<Form> => {
    try {
      const response = await api.post(`/forms/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock data');
      await delay(500);
      const originalForm = mockForms.find(f => f.id === id);
      if (!originalForm) throw new Error('Form not found');
      const duplicatedForm: Form = {
        ...originalForm,
        id: Math.random().toString(36).substr(2, 9),
        title: `${originalForm.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submissionCount: 0,
        status: 'draft',
      };
      mockForms.unshift(duplicatedForm);
      return duplicatedForm;
    }
  },

  // Submissions
  getSubmissions: async (formId: string): Promise<FormSubmission[]> => {
    try {
      const response = await api.get(`/forms/${formId}/submissions`);
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock data');
      await delay(300);
      return []; // Return empty submissions for mock
    }
  },
  
  submitForm: async (formId: string, data: FormData): Promise<FormSubmission> => {
    try {
      const response = await api.post(`/forms/${formId}/submissions`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock data');
      await delay(500);
      return {
        id: Math.random().toString(36).substr(2, 9),
        formId,
        data: {},
        submittedAt: new Date().toISOString(),
      };
    }
  },

  // Analytics
  getAnalytics: async (formId: string): Promise<any> => {
    try {
      const response = await api.get(`/forms/${formId}/analytics`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Analytics API error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      // Don't fall back to mock data - let the error bubble up
      throw new Error(`Failed to load analytics: ${error.response?.data?.error || error.message}`);
    }
  },
  
  exportCSV: async (formId: string): Promise<Blob> => {
    try {
      const response = await api.get(`/forms/${formId}/export`, { responseType: 'blob' });
      return response.data;
    } catch (error: any) {
      console.error('❌ CSV export failed:', error);
      throw new Error(`Failed to export CSV: ${error.response?.data?.error || error.message}`);
    }
  },

  // Dashboard analytics
  getDashboardAnalytics: async (): Promise<{
    chartData: { name: string; submissions: number; date: string }[];
    totalThisWeek: number;
    previousWeek: number;
    growthPercentage: string;
  }> => {
    try {
      const response = await api.get('/forms/dashboard/analytics');
      return response.data;
    } catch (error) {
      console.warn('Backend not available for dashboard analytics, using mock data');
      await delay(300);
      
      // Generate mock data for fallback
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const chartData = days.map((name, index) => ({
        name,
        submissions: Math.floor(Math.random() * 20) + 5,
        date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
      
      const totalThisWeek = chartData.reduce((sum, day) => sum + day.submissions, 0);
      const previousWeek = Math.floor(totalThisWeek * 0.8); // Mock previous week as 80% of current
      const growthPercentage = '+25%';
      
      return {
        chartData,
        totalThisWeek,
        previousWeek,
        growthPercentage
      };
    }
  },

  // File upload
  uploadFile: async (file: File): Promise<{url: string}> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock data');
      await delay(800);
      return { url: URL.createObjectURL(file) }; // Create a local URL for mock
    }
  }
};