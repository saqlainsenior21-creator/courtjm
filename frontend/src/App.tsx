import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';
import Hearings from './pages/Hearings';
import Documents from './pages/Documents';
import MOJDashboard from './pages/MOJDashboard';
import PublicSearch from './pages/PublicSearch';
import Partner from './pages/Partner';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return localStorage.getItem('cj_token') ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<PublicSearch />} />
        <Route path="/partner" element={<Partner />} />
        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/cases" element={<PrivateRoute><Layout><Cases /></Layout></PrivateRoute>} />
        <Route path="/cases/:id" element={<PrivateRoute><Layout><CaseDetail /></Layout></PrivateRoute>} />
        <Route path="/hearings" element={<PrivateRoute><Layout><Hearings /></Layout></PrivateRoute>} />
        <Route path="/documents" element={<PrivateRoute><Layout><Documents /></Layout></PrivateRoute>} />
        <Route path="/moj" element={<PrivateRoute><Layout><MOJDashboard /></Layout></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
