import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BulkUpload from './components/BulkUpload';
import Search from './pages/Search';
import EmployeeManagement from './pages/EmployeeManagement';
import CompanyManagement from './pages/CompanyManagement';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRestriction from './components/RoleRestriction';


const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/search" element={<Search />} /> 
            
            {/* Company User Routes */}
            <Route element={<RoleRestriction allowedRoles={['company_admin', 'company_staff', 'talent_verify_staff']} />}>
              <Route path="employees" element={<EmployeeManagement />} />
            </Route>

            {/* Talent Verify Staff Routes */}
            <Route element={<RoleRestriction allowedRoles={['talent_verify_staff']} />}>
              <Route path="companies" element={<CompanyManagement />} />
              <Route path="upload/companies" element={<BulkUpload type="companies" />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;