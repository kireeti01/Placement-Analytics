import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import RoleGate from './components/Auth/RoleGate';
import CollegeGate from './components/Auth/CollegeGate';
import MainLayout from './components/Layout/MainLayout';
import SuperAdminLayout from './components/Layout/SuperAdminLayout';
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import Branches from './pages/Branches';
import Companies from './pages/Companies';
import Offers from './pages/Offers';
import Career from './pages/Career';
import Prediction from './pages/Prediction';
import Students from './pages/Students';
import Reports from './pages/Reports';
import SuperAdmin from './pages/SuperAdmin';
import StudentManagement from './pages/StudentManagement';
import CollegeRegistration from './pages/CollegeRegistration';
import SuperAdminCollegeRequests from './pages/SuperAdminCollegeRequests';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<RoleGate />} />
          <Route path="/select-college" element={<CollegeGate />} />
          <Route path="/college-registration" element={<CollegeRegistration />} />
          
          <Route path="/app" element={<MainLayout />}>
            <Route index element={<Navigate to="/app/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="packages" element={<Packages />} />
            <Route path="branches" element={<Branches />} />
            <Route path="companies" element={<Companies />} />
            <Route path="offers" element={<Offers />} />
            <Route path="career" element={<Career />} />
            <Route path="prediction" element={<Prediction />} />
            <Route path="students" element={<Students />} />
            <Route path="student-management" element={<StudentManagement />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<Navigate to="/super-admin/colleges" />} />
            <Route path="colleges" element={<SuperAdmin />} />
            <Route path="admins" element={<SuperAdmin />} />
            <Route path="requests" element={<SuperAdminCollegeRequests />} />
            <Route path="stats" element={<SuperAdmin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
