import React from 'react';
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import BulkUpload from './pages/BulkUpload'
import Search from './pages/Search'

const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="upload" element={<BulkUpload />} />
        <Route path="search" element={<Search />} />
      </Route>
    </Routes>
  </BrowserRouter>
  );
};

export default App;