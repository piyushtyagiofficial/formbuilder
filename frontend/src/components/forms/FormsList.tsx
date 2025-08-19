import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Form } from '../../types/form';
import { formApi } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Copy, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

export function FormsList() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const data = await formApi.getForms();
      // Handle different API response formats
      if (Array.isArray(data)) {
        setForms(data);
      } else if (data && typeof data === 'object' && 'forms' in data && Array.isArray((data as any).forms)) {
        setForms((data as any).forms);
      } else {
        setForms([]);
      }
    } catch (error) {
      console.error('Failed to load forms:', error);
      setForms([]); // Set empty array on error
      toast({
        title: "Error",
        description: "Failed to load forms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      await formApi.deleteForm(id);
      if (Array.isArray(forms)) {
        setForms(forms.filter(form => form.id !== id));
      }
      toast({
        title: "Success",
        description: "Form deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete form",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicatedForm = await formApi.duplicateForm(id);
      if (Array.isArray(forms)) {
        setForms([duplicatedForm, ...forms]);
      } else {
        setForms([duplicatedForm]);
      }
      toast({
        title: "Success",
        description: "Form duplicated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate form",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Forms</h1>
              <p className="text-purple-100 mt-2 text-lg">Manage your forms and view submissions</p>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="h-4 w-24 bg-white/30 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className={`animate-pulse border-0 shadow-lg ${
              i % 4 === 0 ? 'bg-gradient-to-br from-purple-50 to-purple-100' :
              i % 4 === 1 ? 'bg-gradient-to-br from-blue-50 to-blue-100' :
              i % 4 === 2 ? 'bg-gradient-to-br from-green-50 to-green-100' :
              'bg-gradient-to-br from-orange-50 to-orange-100'
            }`}>
              <CardHeader>
                <div className={`h-4 rounded w-3/4 ${
                  i % 4 === 0 ? 'bg-purple-200' :
                  i % 4 === 1 ? 'bg-blue-200' :
                  i % 4 === 2 ? 'bg-green-200' :
                  'bg-orange-200'
                }`}></div>
                <div className={`h-3 rounded w-1/2 ${
                  i % 4 === 0 ? 'bg-purple-100' :
                  i % 4 === 1 ? 'bg-blue-100' :
                  i % 4 === 2 ? 'bg-green-100' :
                  'bg-orange-100'
                }`}></div>
              </CardHeader>
              <CardContent>
                <div className={`h-3 rounded w-full mb-2 ${
                  i % 4 === 0 ? 'bg-purple-100' :
                  i % 4 === 1 ? 'bg-blue-100' :
                  i % 4 === 2 ? 'bg-green-100' :
                  'bg-orange-100'
                }`}></div>
                <div className={`h-3 rounded w-2/3 ${
                  i % 4 === 0 ? 'bg-purple-100' :
                  i % 4 === 1 ? 'bg-blue-100' :
                  i % 4 === 2 ? 'bg-green-100' :
                  'bg-orange-100'
                }`}></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Forms</h1>
            <p className="text-purple-100 mt-2 text-lg">Manage your forms and view submissions</p>
          </div>
          <Button asChild className="bg-white/20 border-white/30 text-white hover:bg-white/30 shadow-lg">
            <Link to="/forms/new">Create New Form</Link>
          </Button>
        </div>
      </div>

      {(!Array.isArray(forms) || forms.length === 0) && !loading ? (
        <Card className="text-center py-12 border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
              <Eye className="w-12 h-12 text-purple-500" />
            </div>
            <h3 className="text-lg font-medium text-purple-900 mb-2">No forms yet</h3>
            <p className="text-purple-600 mb-6">Create your first form to get started</p>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Link to="/forms/new">Create New Form</Link>
            </Button>
          </CardContent>
        </Card>
      ) : Array.isArray(forms) && forms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form, index) => (
            <Card key={form.id} className={`hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:scale-105 ${
              index % 4 === 0 ? 'bg-gradient-to-br from-purple-50 to-purple-100' :
              index % 4 === 1 ? 'bg-gradient-to-br from-blue-50 to-blue-100' :
              index % 4 === 2 ? 'bg-gradient-to-br from-green-50 to-green-100' :
              'bg-gradient-to-br from-orange-50 to-orange-100'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className={`text-lg font-semibold mb-1 ${
                      index % 4 === 0 ? 'text-purple-900' :
                      index % 4 === 1 ? 'text-blue-900' :
                      index % 4 === 2 ? 'text-green-900' :
                      'text-orange-900'
                    }`}>
                      {form.title}
                    </CardTitle>
                    <p className={`text-sm line-clamp-2 ${
                      index % 4 === 0 ? 'text-purple-600' :
                      index % 4 === 1 ? 'text-blue-600' :
                      index % 4 === 2 ? 'text-green-600' :
                      'text-orange-600'
                    }`}>
                      {form.description}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${
                        index % 4 === 0 ? 'hover:bg-purple-200 text-purple-600' :
                        index % 4 === 1 ? 'hover:bg-blue-200 text-blue-600' :
                        index % 4 === 2 ? 'hover:bg-green-200 text-green-600' :
                        'hover:bg-orange-200 text-orange-600'
                      }`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-0 shadow-xl">
                      <DropdownMenuItem asChild className="hover:bg-purple-50">
                        <Link 
                          to={`/f/${form.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="mr-2 h-4 w-4 text-purple-500" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="hover:bg-blue-50">
                        <Link to={`/forms/${form.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4 text-blue-500" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(form.id)} className="hover:bg-green-50">
                        <Copy className="mr-2 h-4 w-4 text-green-500" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(form.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-3">
                  <Badge 
                    variant={form.status === 'published' ? 'default' : 'secondary'}
                    className={`${
                      form.status === 'published' 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {form.status}
                  </Badge>
                  <span className={`text-sm font-medium ${
                    index % 4 === 0 ? 'text-purple-600' :
                    index % 4 === 1 ? 'text-blue-600' :
                    index % 4 === 2 ? 'text-green-600' :
                    'text-orange-600'
                  }`}>
                    {form.submissionCount} submissions
                  </span>
                </div>
                <div className={`text-xs ${
                  index % 4 === 0 ? 'text-purple-400' :
                  index % 4 === 1 ? 'text-blue-400' :
                  index % 4 === 2 ? 'text-green-400' :
                  'text-orange-400'
                }`}>
                  Created {new Date(form.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}