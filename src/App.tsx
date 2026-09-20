import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import { Layout } from '@/components/Layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { MyStockPage } from '@/pages/MyStockPage';
import { NetworkSearchPage } from '@/pages/NetworkSearchPage';
import { VehicleDetailPage } from '@/pages/VehicleDetailPage';
import { VehicleFormPage } from '@/pages/VehicleFormPage';
import { FinancePage } from '@/pages/FinancePage';
import { SalesPage } from '@/pages/SalesPage';
import { ClientsPage } from '@/pages/ClientsPage';
import { FinancingPage } from '@/pages/FinancingPage';
import { FinancingSimulationPage } from '@/pages/FinancingSimulationPage';
import { FinancingDetailPage } from '@/pages/FinancingDetailPage';
import { DealerProfilePage } from '@/pages/DealerProfilePage';
import { ProfileEditPage } from '@/pages/ProfileEditPage';
import { AtendimentoPage } from '@/pages/AtendimentoPage';
import { IntegrationsPage } from '@/pages/IntegrationsPage';
import { IntegrationsCallbackPage } from '@/pages/IntegrationsCallbackPage';
import { InboxPage } from '@/pages/InboxPage';
import { SiteBuilderPage } from '@/pages/SiteBuilderPage';
import { PublicSitePage } from '@/pages/PublicSitePage';
import { AtpvEPage } from '@/pages/AtpvEPage';
import { ConsultaInteligentePage } from '@/pages/ConsultaInteligentePage';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-navy-900">
        <Loader2 size={32} className="animate-spin text-accent-500" />
      </div>
    );
  }
  if (!session) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-navy-900">
        <Loader2 size={32} className="animate-spin text-accent-500" />
      </div>
    );
  }
  if (session) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/estoque" element={<ProtectedRoute><MyStockPage /></ProtectedRoute>} />
      <Route path="/veiculo/novo" element={<ProtectedRoute><VehicleFormPage /></ProtectedRoute>} />
      <Route path="/rede" element={<ProtectedRoute><NetworkSearchPage /></ProtectedRoute>} />
      <Route path="/veiculo/:id" element={<ProtectedRoute><VehicleDetailPage /></ProtectedRoute>} />
      <Route path="/veiculo/:id/editar" element={<ProtectedRoute><VehicleFormPage /></ProtectedRoute>} />
      <Route path="/financeiro" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
      <Route path="/vendas" element={<ProtectedRoute><SalesPage /></ProtectedRoute>} />
      <Route path="/clientes" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
      <Route path="/atendimento" element={<ProtectedRoute><AtendimentoPage /></ProtectedRoute>} />
      <Route path="/integracoes" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
      <Route path="/integracoes/callback" element={<ProtectedRoute><IntegrationsCallbackPage /></ProtectedRoute>} />
      <Route path="/financiamento" element={<ProtectedRoute><FinancingPage /></ProtectedRoute>} />
      <Route path="/financiamento/novo" element={<ProtectedRoute><FinancingSimulationPage /></ProtectedRoute>} />
      <Route path="/financiamento/:id" element={<ProtectedRoute><FinancingDetailPage /></ProtectedRoute>} />
      <Route path="/lojista/:id" element={<ProtectedRoute><DealerProfilePage /></ProtectedRoute>} />
      <Route path="/perfil/editar" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
      <Route path="/meu-site" element={<ProtectedRoute><SiteBuilderPage /></ProtectedRoute>} />
      <Route path="/atpv-e" element={<ProtectedRoute><AtpvEPage /></ProtectedRoute>} />
      <Route path="/consulta-inteligente" element={<ProtectedRoute><ConsultaInteligentePage /></ProtectedRoute>} />
      <Route path="/site/:slug" element={<PublicSitePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
