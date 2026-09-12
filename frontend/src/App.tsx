import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// i18n
import i18n from './i18n';

// Contexts & Route Protection
import { AuthProvider } from './contexts/AuthContext';
import { RoleProtectedRoute } from './routes/RoleProtectedRoute';

// Layout & Auth Pages
import AppLayout from './components/layout/AppLayout';
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

// Collector Pages
const CollectorDashboard = lazy(() => import('./pages/collector/Dashboard'));
const CreateLot = lazy(() => import('./pages/collector/CreateLot'));
const CollectorLots = lazy(() => import('./pages/collector/Lots'));
const CollectorTransactions = lazy(() => import('./pages/collector/Transactions'));
const Safety = lazy(() => import('./pages/collector/Safety'));

// Recycler Pages
const RecyclerDashboard = lazy(() => import('./pages/recycler/Dashboard'));
const RecyclerProfile = lazy(() => import('./pages/recycler/Profile'));
const RecyclerTransactions = lazy(() => import('./pages/recycler/Transactions'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

// Styles
import './index.css';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const Unauthorized = () => { const { t } = useTranslation(); return <div className="page-wrap"><div className="detail-placeholder"><h1>{t('errors.unauthorized')}</h1><p>{t('errors.unauthorizedDescription')}</p></div></div>; };
const NotFound = () => { const { t } = useTranslation(); return <div className="page-wrap"><div className="detail-placeholder"><h1>{t('errors.notFound')}</h1></div></div>; };

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="loading-state">{i18n.t('errors.loadingTranslations')}</div>}>
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
                  <Route path="/recycler/transactions" element={<RecyclerTransactions />} />
                </Route>

                {/* ADMIN specific routes */}
                <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Route>

              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
              
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
