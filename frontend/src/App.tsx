import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// i18n
import './i18n';

// Contexts & Route Protection
import { AuthProvider } from './contexts/AuthContext';
import { RoleProtectedRoute } from './routes/RoleProtectedRoute';

// Layout & Auth Pages
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Collector Pages
import CollectorDashboard from './pages/collector/Dashboard';
import CreateLot from './pages/collector/CreateLot';
import CollectorLots from './pages/collector/Lots';
import CollectorTransactions from './pages/collector/Transactions';
import Safety from './pages/collector/Safety';

// Recycler Pages
import RecyclerDashboard from './pages/recycler/Dashboard';
import RecyclerProfile from './pages/recycler/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

// Styles
import './index.css';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const Unauthorized = () => <div className="p-8 text-center text-red-600 font-bold text-xl">Unauthorized Access</div>;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading translations...</div>}>
            <Routes>
              
              {/* Public Auth Routes */}
              <Route path="/" element={<Navigate to="/auth/login" replace />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes wrapped in common AppLayout */}
              <Route element={<AppLayout />}>
                
                {/* COLLECTOR specific routes */}
                <Route element={<RoleProtectedRoute allowedRoles={['COLLECTOR']} />}>
                  <Route path="/collector/dashboard" element={<CollectorDashboard />} />
                  <Route path="/collector/lots/create" element={<CreateLot />} />
                  <Route path="/collector/lots" element={<CollectorLots />} />
                  <Route path="/collector/transactions" element={<CollectorTransactions />} />
                  <Route path="/collector/safety" element={<Safety />} />
                </Route>

                {/* RECYCLER specific routes */}
                <Route element={<RoleProtectedRoute allowedRoles={['RECYCLER']} />}>
                  <Route path="/recycler/dashboard" element={<RecyclerDashboard />} />
                  <Route path="/recycler/profile" element={<RecyclerProfile />} />
                </Route>

                {/* ADMIN specific routes */}
                <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Route>

              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<div className="p-8 text-center font-medium">404 - Page Not Found</div>} />
              
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;