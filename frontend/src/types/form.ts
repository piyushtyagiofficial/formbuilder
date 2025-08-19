export interface FormField {
  id: string;
  type: 'text' | 'email' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  submissionCount: number;
  settings: {
    thankYouMessage: string;
    submissionLimit?: number;
    allowFileUploads: boolean;
  };
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
  ipAddress?: string;
}

export interface DragItem {
  type: string;
  fieldType: FormField['type'];
  id?: string;
}
