import { useState, useEffect } from 'react';
import type { Form } from '../../types/form';
import { formApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, Users, FileText, Calendar, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

export function AnalyticsDashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    if (selectedForm) {
      loadAnalytics(selectedForm);
    }
  }, [selectedForm]);

  const loadForms = async () => {
    try {
      const data = await formApi.getForms();
      
      // Ensure data is an array
      const formsArray = Array.isArray(data) ? data : [];
      const publishedForms = formsArray.filter(form => form.status === 'published');
      
      setForms(publishedForms);
      if (publishedForms.length > 0) {
        setSelectedForm(publishedForms[0].id);
      }
    } catch (error) {
      console.error('Analytics - Failed to load forms:', error);
      toast({
        title: "Error",
        description: "Failed to load forms",
        variant: "destructive",
      });
    }
  };

  const loadAnalytics = async (formId: string) => {
    setLoading(true);
    try {
      const data = await formApi.getAnalytics(formId);
      setAnalytics(data);
    } catch (error: any) {
      setAnalytics(null);
      toast({
        title: "Error",
        description: error.message || "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!selectedForm) return;

    try {
      const blob = await formApi.exportCSV(selectedForm);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `form-submissions-${selectedForm}-${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "CSV exported successfully with file links included",
      });
    } catch (error: any) {
      console.error('📊 CSV export failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to export CSV",
        variant: "destructive",
      });
    }
  };

  const selectedFormData = forms.find(form => form.id === selectedForm);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Analytics</h1>
            <p className="text-blue-100 mt-2 text-lg">View form submission analytics and insights</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedForm} onValueChange={setSelectedForm}>
              <SelectTrigger className="w-64 bg-white/20 border-white/30 text-white">
                <SelectValue placeholder="Select a form" />
              </SelectTrigger>
              <SelectContent className="border-purple-200 shadow-xl">
                {forms.map((form) => (
                  <SelectItem key={form.id} value={form.id} className="hover:bg-purple-50">
                    {form.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleExportCSV} disabled={!selectedForm} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : selectedFormData ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:scale-105">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
                  <div className="p-2 bg-blue-500 rounded-lg mr-3">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  Total Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800">
                  {analytics?.totalSubmissions || selectedFormData.submissionCount}
                </div>
                <div className="flex items-center text-sm text-blue-600 mt-2">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                  <span className="text-green-600 font-semibold">+12%</span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 hover:scale-105">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700 flex items-center">
                  <div className="p-2 bg-green-500 rounded-lg mr-3">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800">
                  {analytics?.thisWeek || 0}
                </div>
                <div className="flex items-center text-sm text-green-600 mt-2">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                  <span className="text-green-600 font-semibold">+23%</span>
                  <span className="ml-1">from last week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 hover:scale-105">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
                  <div className="p-2 bg-purple-500 rounded-lg mr-3">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-800">
                  {analytics?.completionRate || '85%'}
                </div>
                <div className="flex items-center text-sm text-purple-600 mt-2">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                  <span className="text-green-600 font-semibold">+5%</span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Avg. Time to Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {analytics?.avgTime || '0'}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  -15s from last month
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Submissions Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.submissionsOverTime || [
                    { date: '2024-01-01', submissions: 12 },
                    { date: '2024-01-02', submissions: 19 },
                    { date: '2024-01-03', submissions: 8 },
                    { date: '2024-01-04', submissions: 15 },
                    { date: '2024-01-05', submissions: 22 },
                    { date: '2024-01-06', submissions: 18 },
                    { date: '2024-01-07', submissions: 25 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="submissions" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.deviceTypes && analytics.deviceTypes.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.deviceTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.deviceTypes.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                    <p>No device data available</p>
                    <p className="text-sm">Device information will appear when submissions are received</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recentSubmissions && analytics.recentSubmissions.length > 0 ? 
                  analytics.recentSubmissions.map((submission: any) => (
                    <div key={submission.id || submission._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{Object.values(submission.data)[0] as string}</p>
                        <p className="text-sm text-gray-500">{Object.values(submission.data)[1] as string}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(submission.createdAt || submission.submittedAt).toLocaleString()}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No recent submissions</p>
                      <p className="text-sm">Submissions will appear here when users submit the form</p>
                    </div>
                  )
                }
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forms available</h3>
            <p className="text-gray-500">Create and publish a form to view analytics</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}