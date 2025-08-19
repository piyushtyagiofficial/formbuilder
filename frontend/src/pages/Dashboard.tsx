import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Form } from '../types/form';
import { formApi } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Calendar,
  Plus,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardAnalytics, setDashboardAnalytics] = useState<{
    chartData: { name: string; submissions: number; date: string }[];
    totalThisWeek: number;
    previousWeek: number;
    growthPercentage: string;
  } | null>(null);

  useEffect(() => {
    loadForms();
    loadDashboardAnalytics();
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
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardAnalytics = async () => {
    try {
      const analytics = await formApi.getDashboardAnalytics();
      setDashboardAnalytics(analytics);
    } catch (error) {
      console.error('Failed to load dashboard analytics:', error);
    }
  };

  const stats = {
    totalForms: forms?.length || 0,
    totalSubmissions: Array.isArray(forms) ? forms.reduce((sum, form) => sum + (form.submissionCount || 0), 0) : 0,
    publishedForms: Array.isArray(forms) ? forms.filter(form => form.status === 'published').length : 0,
    draftForms: Array.isArray(forms) ? forms.filter(form => form.status === 'draft').length : 0,
  };

  // Use real analytics data if available, otherwise fallback to mock data
  const chartData = dashboardAnalytics?.chartData || [
    { name: 'Mon', submissions: 0 },
    { name: 'Tue', submissions: 0 },
    { name: 'Wed', submissions: 0 },
    { name: 'Thu', submissions: 0 },
    { name: 'Fri', submissions: 0 },
    { name: 'Sat', submissions: 0 },
    { name: 'Sun', submissions: 0 },
  ];

  const thisWeekSubmissions = dashboardAnalytics?.totalThisWeek || 0;
  const growthPercentage = dashboardAnalytics?.growthPercentage || '+0%';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-purple-100 mt-2 text-lg">
          Welcome back! Here's what's happening with your forms.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg mr-3">
                <FileText className="w-4 h-4 text-white" />
              </div>
              Total Forms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{stats.totalForms}</div>
            <div className="flex items-center text-sm text-blue-600 mt-2">
              <span className="text-green-600 font-semibold">+2</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center">
              <div className="p-2 bg-green-500 rounded-lg mr-3">
                <Users className="w-4 h-4 text-white" />
              </div>
              Total Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">{stats.totalSubmissions}</div>
            <div className="flex items-center text-sm text-green-600 mt-2">
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              <span className="text-green-600 font-semibold">+12%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg mr-3">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              Published Forms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800">{stats.publishedForms}</div>
            <div className="flex items-center text-sm text-purple-600 mt-2 p-2 rounded">
              <span className="font-semibold">{stats.draftForms} drafts</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center">
              <div className="p-2 bg-orange-500 rounded-lg mr-3">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-800">
              {thisWeekSubmissions}
            </div>
            <div className="flex items-center text-sm text-orange-600 mt-2">
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              <span className="text-green-600 font-semibold">{growthPercentage}</span>
              <span className="ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <Card className="lg:col-span-2 border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-xl">Submissions This Week</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="name" stroke="#6366f1" />
                <YAxis stroke="#6366f1" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="submissions" 
                  fill="url(#colorGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Forms */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="pb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Recent Forms</CardTitle>
              <Button asChild variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <Link to="/forms">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded w-1/2"></div>
                </div>
              ))
            ) : Array.isArray(forms) && forms.length > 0 ? forms.slice(0, 5).map((form) => (
              <div key={form.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200">
                <div className="flex-1">
                  <Link 
                    to={`/f/${form.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-purple-900 hover:text-purple-700 transition-colors"
                  >
                    {form.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={form.status === 'published' ? 'default' : 'secondary'}
                      className={`text-xs ${form.status === 'published' 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                    >
                      {form.status}
                    </Badge>
                    <span className="text-xs text-purple-600">
                      {form.submissionCount || 0} submissions
                    </span>
                  </div>
                </div>
              </div>
            )) : null}
            
            {(!Array.isArray(forms) || forms.length === 0) && !loading && (
              <div className="text-center py-8">
                <FileText className="mx-auto h-8 w-8 text-purple-400 mb-2" />
                <p className="text-sm text-purple-600 mb-4">No forms yet</p>
                <Button asChild size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Link to="/forms/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Form
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-cyan-50 to-blue-50">
        <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <Link to="/forms/new">
                <Plus className="w-4 h-4 mr-2" />
                Create New Form
              </Link>
            </Button>
            <Button variant="outline" asChild className="border-green-300 text-green-700 hover:bg-green-50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <Link to="/analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Link>
            </Button>
            <Button variant="outline" asChild className="border-orange-300 text-orange-700 hover:bg-orange-50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <Link to="/forms">
                <FileText className="w-4 h-4 mr-2" />
                Manage Forms
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}