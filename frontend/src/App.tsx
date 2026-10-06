import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';
import CustomerPortal from './pages/CustomerPortal';
import AIOperations from './pages/AIOperations';
import AuditList from './pages/AuditList';
import AuditDetail from './pages/AuditDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/portal" element={<CustomerPortal />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tickets" element={<TicketList />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="ai-ops" element={<AIOperations />} />
          <Route path="audit" element={<AuditList />} />
          <Route path="audit/:id" element={<AuditDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
