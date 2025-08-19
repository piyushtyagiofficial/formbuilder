import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { FormsList } from './components/forms/FormsList';
import { FormEdit } from './pages/FormEdit';
import { FormView } from './pages/FormView';
import { Settings } from './pages/Settings';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public form route */}
          <Route path="/f/:id" element={<FormView />} />
          
          {/* Dashboard routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="forms" element={<FormsList />} />
            <Route path="forms/new" element={<FormEdit />} />
            <Route path="forms/:id" element={<FormView />} />
            <Route path="forms/:id/edit" element={<FormEdit />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;