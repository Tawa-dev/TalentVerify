import React from 'react';
import ReactDOM from 'react-dom/client'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import BulkUpload from './pages/BulkUpload'
import Search from './pages/Search'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  return (
    
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="upload" element={<BulkUpload />} />
              <Route path="search" element={<Search />} />
            </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;