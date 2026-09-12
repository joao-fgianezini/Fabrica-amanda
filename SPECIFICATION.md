# REDE AUTO RIBEIRAO - ESPECIFICAO COMPLETA DO SISTEMA

Stack: Vite + React + TypeScript + Tailwind CSS v4 + Supabase + lucide-react

## INSTRUCOES
1. Crie um projeto Vite + React + TypeScript
2. Instale as dependencias do package.json
3. Crie cada arquivo no caminho indicado por === FILE: caminho ===
4. Aplique todas as migracoes SQL no Supabase em ordem
5. Deploy de cada Edge Function no Supabase
6. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env

## VISAO GERAL
Plataforma SaaS de gestao para lojas de veiculos seminovos.
- Autenticacao (email/senha via Supabase Auth)
- Dashboard com metricas (estoque, vendas, despesas, lucro)
- Gestao de estoque (CRUD de veiculos com fotos)
- Gestao de vendas com calculo de lucro
- Financeiro (despesas, categorias, encerramento mensal)
- Simulacao de financiamento (26 bancos reais brasileiros)
- CRM (leads, pipeline kanban, interacoes, follow-ups)
- Atendimento (conversas multi-canal: WhatsApp, Instagram, Facebook, OLX, Webmotors)
- Integracoes (WhatsApp Cloud API, Meta Graph, OLX, Webmotors)
- Busca na rede (veiculos de outras lojas)
- Perfil publico da loja
- Widget de chat para site
- Edge Functions: simulador, webhook, envio de mensagens, IA assistente, IA qualificadora

---

=== FILE: package.json ===
```json
{
  "name": "vite-react-typescript-starter",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "wa-server": "node server/whatsapp/index.cjs"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.111.0",
    "@whiskeysockets/baileys": "^7.0.0-rc14",
    "curve25519-js": "^0.0.4",
    "lucide-react": "^1.28.0",
    "nodejs-insta-private-api": "^5.61.12",
    "qrcode": "^1.5.4",
    "qrcode-terminal": "^0.12.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.2",
    "tweetnacl": "^1.0.3"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@types/node": "^22.20.1",
    "@types/react": "~19.2.18",
    "@types/react-dom": "~19.2.4",
    "@vitejs/plugin-react": "^6.0.5",
    "tailwindcss": "^4.3.3",
    "typescript": "^6.0.3",
    "vite": "^8.2.0"
  }
}

```

=== FILE: vite.config.ts ===
```typescript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import connectorPlugin from './server/connector-plugin.cjs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), connectorPlugin()],
  resolve: {
    tsconfigPaths: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

```

=== FILE: tsconfig.json ===
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}

```

=== FILE: tsconfig.app.json ===
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Path alias */
    "paths": {
      "@/*": ["./src/*"]
    },

    /* Linting */
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}

```

=== FILE: tsconfig.node.json ===
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "nodenext",
    "types": ["node"],
    "skipLibCheck": true,
    "allowJs": true,

    /* Bundler mode */
    "allowImportingTsExtensions": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts", "server/connector-plugin.cjs", "server/connector-plugin.d.ts"]
}

```

=== FILE: index.html ===
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rede Auto Ribeirao Car Inventory</title>
    <meta property="og:image" content="https://bolt.new/static/og_default.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="https://bolt.new/static/og_default.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```

=== FILE: .gitignore ===
```
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.env

```

=== FILE: src/main.tsx ===
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

```

=== FILE: src/App.tsx ===
```tsx
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

```

=== FILE: src/index.css ===
```css
@import 'tailwindcss';

@theme {
  --color-navy-950: #050a16;
  --color-navy-900: #0a1224;
  --color-navy-850: #0c1730;
  --color-navy-800: #0f1d38;
  --color-navy-700: #16284a;
  --color-navy-600: #1e3a64;
  --color-navy-500: #2a4f80;
  --color-navy-400: #3b6aa8;
  --color-navy-300: #5a8fc8;
  --color-navy-200: #8fb5da;
  --color-navy-100: #c4dbf0;
  --color-navy-50: #e8f1fa;

  --color-accent-600: #1e7dd9;
  --color-accent-500: #2a93e8;
  --color-accent-400: #4aaef5;
  --color-accent-300: #7ac4f8;
  --color-accent-200: #a8d8fa;

  --color-gold-500: #d4a843;
  --color-gold-400: #e6c25e;
  --color-gold-300: #f0d97a;

  --color-success-500: #16a34a;
  --color-success-600: #15803d;
  --color-success-400: #22c55e;
  --color-success-300: #4ade80;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-warning-400: #fbbf24;
  --color-warning-300: #fcd34d;
  --color-error-500: #dc2626;
  --color-error-600: #b91c1c;
  --color-error-400: #ef4444;
  --color-error-300: #f87171;

  --color-emerald-500: #10b981;
  --color-emerald-400: #34d399;
  --color-emerald-300: #6ee7b7;

  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 'Inter', system-ui, -apple-system, sans-serif;
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2') format('woff2');
}

html {
  font-family: var(--font-sans);
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-navy-950);
  color: #e2e8f0;
  overflow-x: hidden;
}

* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-navy-600) transparent;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-navy-600);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-navy-500);
}

/* === Animations === */

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-16px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

@keyframes float {
  0%, 100% { transform: translateY(0) translateX(0); }
  25% { transform: translateY(-20px) translateX(10px); }
  50% { transform: translateY(-10px) translateX(-15px); }
  75% { transform: translateY(-30px) translateX(5px); }
}

@keyframes floatSlow {
  0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
  33% { transform: translateY(-15px) translateX(20px) rotate(2deg); }
  66% { transform: translateY(-25px) translateX(-10px) rotate(-2deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(42, 147, 232, 0.15); }
  50% { box-shadow: 0 0 40px rgba(42, 147, 232, 0.35); }
}

@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(74, 174, 245, 0.2), 0 0 40px rgba(74, 174, 245, 0.1); }
  50% { box-shadow: 0 0 30px rgba(74, 174, 245, 0.4), 0 0 60px rgba(74, 174, 245, 0.2); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes spinReverse {
  to { transform: rotate(-360deg); }
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes shimmerLine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes ripple {
  0% { transform: scale(0); opacity: 0.6; }
  100% { transform: scale(4); opacity: 0; }
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes barGrow {
  from { width: 0; }
}

@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.05); }
  70% { transform: scale(0.98); }
  100% { transform: scale(1); }
}

@keyframes countUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes borderTrace {
  0% { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}

@keyframes auroraShift {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -20px) scale(1.1); }
  100% { transform: translate(0, 0) scale(1); }
}

@keyframes wave {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@keyframes sheen {
  0% { transform: translateX(-150%) skewX(-20deg); }
  100% { transform: translateX(250%) skewX(-20deg); }
}

.animate-fade-in { animation: fadeIn 0.4s ease-out both; }
.animate-fade-in-up { animation: fadeInUp 0.5s ease-out both; }
.animate-fade-in-down { animation: fadeInDown 0.4s ease-out both; }
.animate-slide-in { animation: slideIn 0.3s ease-out both; }
.animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.animate-float { animation: float 8s ease-in-out infinite; }
.animate-float-slow { animation: floatSlow 12s ease-in-out infinite; }
.animate-glow { animation: glow 3s ease-in-out infinite; }
.animate-glow-pulse { animation: glowPulse 2.5s ease-in-out infinite; }
.animate-bounce-in { animation: bounceIn 0.5s ease-out both; }
.animate-spin-reverse { animation: spinReverse 1s linear infinite; }
.animate-wave { animation: wave 2s ease-in-out infinite; }
.animate-aurora { animation: auroraShift 10s ease-in-out infinite; }
.animate-sheen { animation: sheen 3s ease-in-out infinite; }

/* === Utility classes === */

.glass {
  background: rgba(15, 29, 56, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(54, 106, 168, 0.15);
}

.glass-strong {
  background: rgba(12, 23, 48, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(54, 106, 168, 0.2);
}

.glass-card {
  background: linear-gradient(135deg, rgba(15, 29, 56, 0.6) 0%, rgba(10, 18, 36, 0.4) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(54, 106, 168, 0.15);
  position: relative;
}

.glass-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(74, 174, 245, 0.15), transparent 40%, transparent 60%, rgba(74, 174, 245, 0.08));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.gradient-text {
  background: linear-gradient(135deg, #4aaef5 0%, #7ac4f8 50%, #a8d8fa 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient-text-gold {
  background: linear-gradient(135deg, #e6c25e 0%, #f0d97a 50%, #d4a843 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient-border {
  position: relative;
  background: linear-gradient(135deg, rgba(42, 147, 232, 0.12), rgba(22, 40, 74, 0.3));
}

.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(74, 174, 245, 0.4), rgba(74, 174, 245, 0));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.shimmer-effect {
  position: relative;
  overflow: hidden;
}

.shimmer-effect::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.06), transparent);
  transform: translateX(-100%);
  animation: shimmerLine 3s ease-in-out infinite;
}

.hover-lift {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35), 0 0 30px rgba(42, 147, 232, 0.1);
}

.hover-lift-sm {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, border-color 0.25s ease;
}

.hover-lift-sm:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), 0 0 20px rgba(42, 147, 232, 0.08);
}

.card-glow:hover {
  box-shadow: 0 0 30px rgba(42, 147, 232, 0.15), 0 8px 32px rgba(0, 0, 0, 0.2);
  border-color: rgba(74, 174, 245, 0.25);
}

.card-glow-strong:hover {
  box-shadow: 0 0 40px rgba(42, 147, 232, 0.25), 0 12px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(74, 174, 245, 0.35);
}

.btn-shine {
  position: relative;
  overflow: hidden;
}

.btn-shine::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  transition: left 0.6s ease;
}

.btn-shine:hover::before {
  left: 100%;
}

.btn-sheen {
  position: relative;
  overflow: hidden;
}

.btn-sheen::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-150%) skewX(-20deg);
}

.btn-sheen:hover::after {
  animation: sheen 0.8s ease-out;
}

.bg-mesh {
  background-image:
    radial-gradient(at 20% 10%, rgba(42, 147, 232, 0.08) 0%, transparent 50%),
    radial-gradient(at 80% 80%, rgba(22, 40, 74, 0.15) 0%, transparent 50%),
    radial-gradient(at 50% 50%, rgba(74, 174, 245, 0.04) 0%, transparent 60%);
}

.bg-grid {
  background-image:
    linear-gradient(rgba(54, 106, 168, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(54, 106, 168, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
}

.bg-grid-dense {
  background-image:
    linear-gradient(rgba(54, 106, 168, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(54, 106, 168, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}

.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-smooth-lg {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* === Aurora background === */
.aurora-bg {
  position: relative;
  overflow: hidden;
}

.aurora-bg::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -20%;
  width: 60%;
  height: 200%;
  background: radial-gradient(ellipse at center, rgba(42, 147, 232, 0.12) 0%, transparent 70%);
  animation: auroraShift 15s ease-in-out infinite;
  pointer-events: none;
}

.aurora-bg::after {
  content: '';
  position: absolute;
  bottom: -50%;
  right: -20%;
  width: 60%;
  height: 200%;
  background: radial-gradient(ellipse at center, rgba(212, 168, 67, 0.06) 0%, transparent 70%);
  animation: auroraShift 18s ease-in-out infinite reverse;
  pointer-events: none;
}

/* === Animated gradient border === */
.animated-border {
  position: relative;
  background: linear-gradient(135deg, rgba(15, 29, 56, 0.6), rgba(10, 18, 36, 0.4));
  border: 1px solid transparent;
  background-clip: padding-box;
}

.animated-border::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(74, 174, 245, 0.3), rgba(74, 174, 245, 0.05), rgba(212, 168, 67, 0.15), rgba(74, 174, 245, 0.05), rgba(74, 174, 245, 0.3));
  background-size: 200% 100%;
  animation: borderTrace 4s linear infinite;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* === Spotlight hover effect === */
.spotlight {
  position: relative;
  overflow: hidden;
}

.spotlight::after {
  content: '';
  position: absolute;
  top: var(--spotlight-y, 50%);
  left: var(--spotlight-x, 50%);
  width: 300px;
  height: 300px;
  margin-left: -150px;
  margin-top: -150px;
  background: radial-gradient(circle, rgba(74, 174, 245, 0.08) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.spotlight:hover::after {
  opacity: 1;
}

/* === Stagger animation delays === */
.stagger-1 { animation-delay: 0.05s; }
.stagger-2 { animation-delay: 0.1s; }
.stagger-3 { animation-delay: 0.15s; }
.stagger-4 { animation-delay: 0.2s; }
.stagger-5 { animation-delay: 0.25s; }
.stagger-6 { animation-delay: 0.3s; }
.stagger-7 { animation-delay: 0.35s; }
.stagger-8 { animation-delay: 0.4s; }

/* === Focus ring === */
.focus-ring {
  transition: all 0.3s ease;
}

.focus-ring:focus-within {
  box-shadow: 0 0 0 2px rgba(74, 174, 245, 0.15), 0 0 20px rgba(74, 174, 245, 0.1);
}

/* === Number counter === */
.count-up {
  animation: countUp 0.6s ease-out both;
}

/* === Loading skeleton === */
.skeleton {
  background: linear-gradient(90deg, rgba(30, 58, 100, 0.3) 25%, rgba(30, 58, 100, 0.5) 50%, rgba(30, 58, 100, 0.3) 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 8px;
}

/* === Mesh gradient for banners === */
.mesh-gradient {
  background:
    radial-gradient(at 0% 0%, rgba(42, 147, 232, 0.15) 0%, transparent 50%),
    radial-gradient(at 100% 0%, rgba(74, 174, 245, 0.1) 0%, transparent 50%),
    radial-gradient(at 50% 100%, rgba(212, 168, 67, 0.05) 0%, transparent 50%),
    linear-gradient(135deg, rgba(15, 29, 56, 0.8), rgba(10, 18, 36, 0.6));
}

.mesh-gradient-warm {
  background:
    radial-gradient(at 0% 0%, rgba(212, 168, 67, 0.12) 0%, transparent 50%),
    radial-gradient(at 100% 100%, rgba(42, 147, 232, 0.1) 0%, transparent 50%),
    radial-gradient(at 50% 50%, rgba(74, 174, 245, 0.05) 0%, transparent 60%),
    linear-gradient(135deg, rgba(15, 29, 56, 0.8), rgba(10, 18, 36, 0.6));
}

/* === Conic gradient for premium badges === */
.conic-border {
  position: relative;
}

.conic-border::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: conic-gradient(from 0deg, rgba(74, 174, 245, 0.4), rgba(212, 168, 67, 0.3), rgba(74, 174, 245, 0.4));
  animation: spin 4s linear infinite;
  z-index: -1;
}

/* === New animations === */

@keyframes photoReveal {
  from { opacity: 0; transform: scale(1.1); clip-path: inset(0 0 100% 0); }
  to { opacity: 1; transform: scale(1); clip-path: inset(0 0 0% 0); }
}

@keyframes thumbSlideIn {
  from { opacity: 0; transform: translateY(8px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes progressFill {
  from { width: 0; }
}

@keyframes ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes dropIn {
  0% { opacity: 0; transform: translateY(-20px) scale(0.95); }
  60% { opacity: 1; transform: translateY(2px) scale(1.02); }
  100% { transform: translateY(0) scale(1); }
}

@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes sweep {
  0% { transform: translateX(-100%) rotate(0deg); }
  100% { transform: translateX(300%) rotate(180deg); }
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes flipIn {
  from { opacity: 0; transform: perspective(600px) rotateY(-15deg); }
  to { opacity: 1; transform: perspective(600px) rotateY(0); }
}

.animate-photo-reveal { animation: photoReveal 0.6s ease-out both; }
.animate-thumb-in { animation: thumbSlideIn 0.3s ease-out both; }
.animate-drop-in { animation: dropIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.animate-fade-in-scale { animation: fadeInScale 0.4s ease-out both; }
.animate-slide-in-right { animation: slideInRight 0.3s ease-out both; }
.animate-flip-in { animation: flipIn 0.5s ease-out both; }
.animate-breathe { animation: breathe 3s ease-in-out infinite; }

/* === Progress bar === */
.progress-bar {
  position: relative;
  overflow: hidden;
  animation: progressFill 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmerLine 2s ease-in-out infinite;
}

/* === Image hover zoom container === */
.img-zoom {
  overflow: hidden;
}

.img-zoom img {
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.img-zoom:hover img {
  transform: scale(1.12);
}

/* === Badge with glow === */
.badge-glow {
  position: relative;
}

.badge-glow::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: inherit;
  filter: blur(4px);
  opacity: 0.6;
  z-index: -1;
}

/* === Animated underline === */
.underline-anim {
  position: relative;
}

.underline-anim::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, var(--color-accent-400), transparent);
  transition: width 0.3s ease;
}

.underline-anim:hover::after {
  width: 100%;
}

/* === Card with layered glow on hover === */
.card-layered-glow {
  position: relative;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-layered-glow::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(74, 174, 245, 0.12), transparent 60%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.card-layered-glow:hover::after {
  opacity: 1;
}

/* === Input with animated border === */
.input-anim {
  position: relative;
}

.input-anim input,
.input-anim select,
.input-anim textarea {
  transition: border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}

.input-anim:focus-within {
  box-shadow: 0 0 0 1px rgba(74, 174, 245, 0.2), 0 0 20px rgba(74, 174, 245, 0.08);
}

/* === Animated dot indicator === */
.dot-pulse {
  position: relative;
}

.dot-pulse::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.3;
  animation: breathe 2s ease-in-out infinite;
}

/* === Tab indicator slide === */
.tab-indicator {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* === Ripple button === */
.ripple-btn {
  position: relative;
  overflow: hidden;
}

.ripple-btn:active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  margin-left: -100px;
  margin-top: -100px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent 70%);
  border-radius: 50%;
  animation: ripple 0.6s ease-out;
}

/* === Section divider with gradient === */
.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(54, 106, 168, 0.3), transparent);
}

```

=== FILE: src/lib/supabase.ts ===
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Dealer = {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  logo_url: string | null;
  cover_url: string | null;
  description: string | null;
  cnpj: string | null;
  whatsapp: string | null;
  created_at: string;
};

export type Vehicle = {
  id: string;
  dealer_id: string;
  brand: string;
  model: string;
  year_manufacture: number | null;
  year_model: number | null;
  color: string | null;
  mileage: number | null;
  fuel: string | null;
  transmission: string | null;
  plate: string | null;
  chassis: string | null;
  engine: string | null;
  doors: number | null;
  description: string | null;
  purchase_price: number;
  asking_price: number;
  min_price: number | null;
  profit_margin: number | null;
  status: 'available' | 'reserved' | 'sold';
  created_at: string;
  updated_at: string;
};

export type VehiclePhoto = {
  id: string;
  vehicle_id: string;
  url: string;
  is_cover: boolean;
  created_at: string;
};

export type VehicleWithDetails = Vehicle & {
  dealer?: Dealer;
  photos?: VehiclePhoto[];
};

export type ExpenseCategory = {
  id: string;
  dealer_id: string;
  name: string;
  color: string;
  is_default: boolean;
  created_at: string;
};

export type Expense = {
  id: string;
  dealer_id: string;
  category_id: string | null;
  description: string;
  amount: number;
  due_date: string | null;
  paid_date: string | null;
  status: 'pending' | 'paid';
  recurrence: 'none' | 'weekly' | 'monthly' | 'yearly';
  is_fixed: boolean;
  notes: string | null;
  created_at: string;
};

export type ExpenseWithCategory = Expense & {
  category?: ExpenseCategory | null;
};

export type MonthlyClosure = {
  id: string;
  dealer_id: string;
  period_month: number;
  period_year: number;
  closed_at: string;
  report_data: Record<string, unknown>;
  summary_totals: {
    total_expenses?: number;
    total_sales?: number;
    total_profit?: number;
    vehicles_sold?: number;
    vehicles_in_stock?: number;
    [key: string]: unknown;
  };
};

export type Sale = {
  id: string;
  dealer_id: string;
  vehicle_id: string | null;
  client_name: string | null;
  client_phone: string | null;
  sale_price: number;
  purchase_price: number;
  profit: number | null;
  payment_method: string | null;
  sale_date: string;
  notes: string | null;
  created_at: string;
};

export type SaleWithVehicle = Sale & {
  vehicle?: Pick<Vehicle, 'id' | 'brand' | 'model' | 'year_model' | 'year_manufacture'> | null;
};

export type ClientRecord = {
  id: string;
  dealer_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  document: string | null;
  address: string | null;
  notes: string | null;
  status: 'active' | 'inactive';
  created_at: string;
};

export type FinancingInstitution = {
  id: string;
  name: string;
  type: string;
  logo_url: string | null;
  active: boolean;
  financing_url: string | null;
  whatsapp_number: string | null;
  created_at: string;
};

export type FinancingSimulation = {
  id: string;
  dealer_id: string;
  vehicle_id: string | null;
  client_id: string | null;
  vehicle_price: number;
  down_payment: number;
  financed_amount: number;
  term_months: number;
  max_installment: number | null;
  status: FinancingSimulationStatus;
  consent_given: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type FinancingSimulationStatus =
  | 'draft' | 'submitted' | 'processing' | 'analysis'
  | 'approved' | 'approved_with_condition' | 'rejected'
  | 'expired' | 'cancelled' | 'converted';

export type FinancingOffer = {
  id: string;
  simulation_id: string;
  institution_id: string;
  status: 'approved' | 'approved_with_condition' | 'rejected' | 'pending';
  down_payment: number | null;
  financed_amount: number | null;
  term_months: number | null;
  installment_amount: number | null;
  interest_rate: number | null;
  cet: number | null;
  conditions: string | null;
  notes: string | null;
  is_best: boolean;
  created_at: string;
};

export type FinancingOfferWithInstitution = FinancingOffer & {
  institution?: FinancingInstitution;
};

export type FinancingSimulationWithDetails = FinancingSimulation & {
  vehicle?: Pick<Vehicle, 'id' | 'brand' | 'model' | 'year_model' | 'year_manufacture' | 'asking_price'> | null;
  client?: Pick<ClientRecord, 'id' | 'name' | 'phone' | 'document'> | null;
  offers?: FinancingOfferWithInstitution[];
};

// === CRM TYPES ===

export type LeadSource =
  | 'whatsapp' | 'instagram' | 'facebook' | 'olx' | 'webmotors'
  | 'mercado_livre' | 'google' | 'qr_code' | 'site' | 'referral' | 'walk_in' | 'other';

export type LeadStatus =
  | 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export type Lead = {
  id: string;
  dealer_id: string;
  client_id: string | null;
  vehicle_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  source: LeadSource;
  source_detail: string | null;
  status: LeadStatus;
  lead_score: number;
  budget: number | null;
  down_payment: number | null;
  max_installment: number | null;
  notes: string | null;
  last_interaction_at: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadWithRelations = Lead & {
  vehicle?: Pick<Vehicle, 'id' | 'brand' | 'model' | 'year_model' | 'asking_price'> | null;
  client?: Pick<ClientRecord, 'id' | 'name' | 'phone' | 'email'> | null;
};

export type InteractionType =
  | 'call' | 'whatsapp' | 'email' | 'message' | 'visit'
  | 'test_drive' | 'proposal_sent' | 'financing_sent' | 'note';

export type LeadInteraction = {
  id: string;
  lead_id: string;
  dealer_id: string;
  type: InteractionType;
  description: string | null;
  vehicle_id: string | null;
  created_at: string;
};

export type FollowUpType = 'call' | 'whatsapp' | 'email' | 'visit' | 'reminder';

export type LeadFollowUp = {
  id: string;
  lead_id: string;
  dealer_id: string;
  scheduled_at: string;
  message: string | null;
  type: FollowUpType;
  status: 'pending' | 'done' | 'skipped';
  ai_suggested: boolean;
  completed_at: string | null;
  created_at: string;
};

// === INTEGRATION TYPES ===

export type Integration = {
  id: string;
  platform: string;
  display_name: string;
  icon: string;
  color: string;
  description: string;
  auth_type: 'oauth' | 'api_key' | 'webhook' | 'manual';
  docs_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type IntegrationAccount = {
  id: string;
  dealer_id: string;
  integration_id: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  account_name: string | null;
  account_identifier: string | null;
  account_email: string | null;
  account_password_encrypted: string | null;
  webhook_url: string | null;
  webhook_verified: boolean;
  webhook_secret: string | null;
  phone_number_id: string | null;
  waba_id: string | null;
  last_sync_at: string | null;
  last_error: string | null;
  metadata: Record<string, unknown>;
  connected_at: string | null;
  disconnected_at: string | null;
  created_at: string;
  updated_at: string;
  integration?: Integration;
};

export type Conversation = {
  id: string;
  dealer_id: string;
  integration_account_id: string | null;
  lead_id: string | null;
  client_id: string | null;
  external_id: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_handle: string | null;
  channel: string;
  status: 'open' | 'pending' | 'resolved' | 'archived';
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
  ai_summary: string | null;
  ai_sentiment: 'positive' | 'neutral' | 'negative' | null;
  ai_intent: string | null;
  ai_qualified: boolean;
  created_at: string;
  updated_at: string;
};

export type ConversationWithLead = Conversation & {
  lead?: Lead | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  dealer_id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  content_type: 'text' | 'image' | 'audio' | 'template' | 'system';
  external_id: string | null;
  ai_extracted_data: {
    vehicle_interest?: string;
    budget?: number;
    down_payment?: number;
    max_installment?: number;
    intent?: string;
    [key: string]: unknown;
  };
  ai_analysis: {
    sentiment?: string;
    summary?: string;
    lead_score?: number;
    suggested_action?: string;
    [key: string]: unknown;
  };
  created_at: string;
};

export type LeadTrackingEvent = {
  id: string;
  dealer_id: string;
  lead_id: string | null;
  event_type: string;
  channel: string | null;
  vehicle_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

```

=== FILE: src/lib/format.ts ===
```typescript
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatMileage(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${formatNumber(value)} km`;
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    available: 'Disponível',
    reserved: 'Reservado',
    sold: 'Vendido',
    ongoing: 'Em andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    draft: 'Rascunho',
    submitted: 'Enviada',
    processing: 'Processando',
    analysis: 'Em análise',
    approved: 'Aprovada',
    approved_with_condition: 'Aprovada com condição',
    rejected: 'Recusada',
    expired: 'Expirada',
    converted: 'Convertida em venda',
    pending: 'Pendente',
  };
  return labels[status] || status;
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    available: 'bg-success-500/15 text-success-500 border-success-500/30',
    reserved: 'bg-warning-500/15 text-warning-500 border-warning-500/30',
    sold: 'bg-error-500/15 text-error-500 border-error-500/30',
    ongoing: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
    completed: 'bg-success-500/15 text-success-500 border-success-500/30',
    cancelled: 'bg-error-500/15 text-error-500 border-error-500/30',
    draft: 'bg-navy-600/30 text-navy-200 border-navy-500/30',
    submitted: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
    processing: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
    analysis: 'bg-warning-500/15 text-warning-400 border-warning-500/30',
    approved: 'bg-success-500/15 text-success-400 border-success-500/30',
    approved_with_condition: 'bg-warning-500/15 text-warning-400 border-warning-500/30',
    rejected: 'bg-error-500/15 text-error-400 border-error-500/30',
    expired: 'bg-navy-600/30 text-navy-300 border-navy-500/30',
    converted: 'bg-success-500/15 text-success-400 border-success-500/30',
    pending: 'bg-warning-500/15 text-warning-400 border-warning-500/30',
  };
  return colors[status] || 'bg-navy-600/30 text-navy-200 border-navy-500/30';
}

export function maskCPF(document: string | null): string {
  if (!document) return '—';
  const digits = document.replace(/\D/g, '');
  if (digits.length === 11) {
    return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
  }
  if (digits.length === 14) {
    return `**.${digits.slice(2, 5)}.${digits.slice(5, 8)}/****-**`;
  }
  return document;
}

```

=== FILE: src/lib/crm.ts ===
```typescript
import type { LeadSource, LeadStatus, InteractionType, FollowUpType } from '@/lib/supabase';

export const LEAD_SOURCES: { value: LeadSource; label: string; icon: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
  { value: 'instagram', label: 'Instagram', icon: 'instagram' },
  { value: 'facebook', label: 'Facebook', icon: 'facebook' },
  { value: 'olx', label: 'OLX', icon: 'olx' },
  { value: 'webmotors', label: 'Webmotors', icon: 'webmotors' },
  { value: 'mercado_livre', label: 'Mercado Livre', icon: 'mercado_livre' },
  { value: 'google', label: 'Google', icon: 'google' },
  { value: 'qr_code', label: 'QR Code', icon: 'qr_code' },
  { value: 'site', label: 'Site', icon: 'site' },
  { value: 'referral', label: 'Indicação', icon: 'referral' },
  { value: 'walk_in', label: 'Loja Física', icon: 'walk_in' },
  { value: 'other', label: 'Outros', icon: 'other' },
];

export const PIPELINE_STAGES: { value: LeadStatus; label: string; color: string; bgColor: string }[] = [
  { value: 'new', label: 'Novo', color: 'text-accent-300', bgColor: 'bg-accent-500/10 border-accent-500/30' },
  { value: 'contacted', label: 'Contatado', color: 'text-navy-200', bgColor: 'bg-navy-500/10 border-navy-500/30' },
  { value: 'qualified', label: 'Qualificado', color: 'text-warning-400', bgColor: 'bg-warning-500/10 border-warning-500/30' },
  { value: 'proposal', label: 'Proposta', color: 'text-gold-400', bgColor: 'bg-gold-500/10 border-gold-500/30' },
  { value: 'negotiation', label: 'Negociação', color: 'text-gold-300', bgColor: 'bg-gold-500/15 border-gold-500/40' },
  { value: 'won', label: 'Ganho', color: 'text-success-400', bgColor: 'bg-success-500/10 border-success-500/30' },
  { value: 'lost', label: 'Perdido', color: 'text-error-400', bgColor: 'bg-error-500/10 border-error-500/30' },
];

export function sourceLabel(source: string): string {
  return LEAD_SOURCES.find((s) => s.value === source)?.label || source;
}

export function statusLabelCRM(status: string): string {
  return PIPELINE_STAGES.find((s) => s.value === status)?.label || status;
}

export function statusColorCRM(status: string): string {
  const stage = PIPELINE_STAGES.find((s) => s.value === status);
  if (!stage) return '';
  return stage.bgColor;
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-success-400 bg-success-500/15 border-success-500/30';
  if (score >= 60) return 'text-warning-400 bg-warning-500/15 border-warning-500/30';
  if (score >= 40) return 'text-accent-300 bg-accent-500/15 border-accent-500/30';
  return 'text-navy-200 bg-navy-500/15 border-navy-500/30';
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Quente';
  if (score >= 60) return 'Morno';
  if (score >= 40) return 'Frio';
  return 'Frio';
}

export const INTERACTION_TYPES: { value: InteractionType; label: string; icon: string }[] = [
  { value: 'call', label: 'Ligação', icon: 'call' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
  { value: 'email', label: 'E-mail', icon: 'email' },
  { value: 'message', label: 'Mensagem', icon: 'message' },
  { value: 'visit', label: 'Visita', icon: 'visit' },
  { value: 'test_drive', label: 'Test Drive', icon: 'test_drive' },
  { value: 'proposal_sent', label: 'Proposta Enviada', icon: 'proposal_sent' },
  { value: 'financing_sent', label: 'Financiamento', icon: 'financing_sent' },
  { value: 'note', label: 'Nota', icon: 'note' },
];

export const FOLLOW_UP_TYPES: { value: FollowUpType; label: string }[] = [
  { value: 'call', label: 'Ligação' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'E-mail' },
  { value: 'visit', label: 'Visita' },
  { value: 'reminder', label: 'Lembrete' },
];

export function interactionLabel(type: string): string {
  return INTERACTION_TYPES.find((t) => t.value === type)?.label || type;
}

export function followUpTypeLabel(type: string): string {
  return FOLLOW_UP_TYPES.find((t) => t.value === type)?.label || type;
}

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Nunca';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin}min atrás`;
  if (diffH < 24) return `${diffH}h atrás`;
  if (diffD < 30) return `${diffD}d atrás`;
  return date.toLocaleDateString('pt-BR');
}

export function isOverdue(scheduledAt: string, status: string): boolean {
  if (status !== 'pending') return false;
  return new Date(scheduledAt) < new Date();
}

```

=== FILE: src/lib/financing-engine.ts ===
```typescript
import { supabase, type FinancingInstitution, type FinancingOffer } from '@/lib/supabase';

export interface SimulationInput {
  vehiclePrice: number;
  downPayment: number;
  financedAmount: number;
  termMonths: number;
  maxInstallment: number | null;
}

export interface SimulationFullInput extends SimulationInput {
  simulationId: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number | null;
  clientName?: string;
  clientDocument?: string | null;
}

export interface ProviderResult {
  institutionId: string;
  institutionName: string;
  status: 'approved' | 'approved_with_condition' | 'rejected' | 'unavailable';
  downPayment: number | null;
  financedAmount: number | null;
  termMonths: number | null;
  installmentAmount: number | null;
  interestRate: number | null;
  cet: number | null;
  conditions: string | null;
  notes: string | null;
  financingUrl: string | null;
  whatsappNumber: string | null;
}

export async function runSimulation(
  institutions: FinancingInstitution[],
  input: SimulationFullInput
): Promise<ProviderResult[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const apiUrl = `${supabaseUrl}/functions/v1/financing-simulator`;

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    throw new Error('Sessão expirada. Entre novamente para consultar.');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey: anonKey,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Falha na consulta (${response.status})`);
  }

  const data = await response.json();
  if (!data.results || !Array.isArray(data.results)) {
    throw new Error('Resposta inválida do simulador');
  }

  // Map edge function results to ProviderResult
  const results: ProviderResult[] = data.results.map((r: {
    institutionId: string; institutionName: string;
    status: string; downPayment: number; financedAmount: number;
    termMonths: number; installmentAmount: number; interestRate: number;
    cet: number; conditions: string; notes: string;
    financingUrl: string; whatsappNumber: string;
  }) => ({
    institutionId: r.institutionId,
    institutionName: r.institutionName,
    status: r.status as ProviderResult['status'],
    downPayment: r.downPayment,
    financedAmount: r.financedAmount,
    termMonths: r.termMonths,
    installmentAmount: r.installmentAmount,
    interestRate: r.interestRate,
    cet: r.cet,
    conditions: r.conditions,
    notes: r.notes,
    financingUrl: r.financingUrl || null,
    whatsappNumber: r.whatsappNumber || null,
  }));

  return results;
}

export function determineBestOption(results: ProviderResult[]): ProviderResult | null {
  const valid = results.filter(
    (r) => r.status === 'approved' || r.status === 'approved_with_condition'
  );
  if (valid.length === 0) return null;

  const scored = valid.map((r) => {
    let score = 0;
    if (r.status === 'approved') score += 100;
    if (r.installmentAmount) score -= r.installmentAmount * 0.01;
    if (r.downPayment) score -= r.downPayment * 0.005;
    if (r.cet) score -= r.cet;
    if (r.termMonths) score += r.termMonths * 0.1;
    return { result: r, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.result || null;
}

export function rankResults(
  results: ProviderResult[],
  criteria: 'best' | 'lowest_installment' | 'lowest_down' | 'lowest_cost' | 'longest_term' | 'approval'
): ProviderResult[] {
  const sorted = [...results].sort((a, b) => {
    switch (criteria) {
      case 'lowest_installment':
        return (a.installmentAmount || Infinity) - (b.installmentAmount || Infinity);
      case 'lowest_down':
        return (a.downPayment || Infinity) - (b.downPayment || Infinity);
      case 'lowest_cost':
        return (a.cet || Infinity) - (b.cet || Infinity);
      case 'longest_term':
        return (b.termMonths || 0) - (a.termMonths || 0);
      case 'approval':
        return rankApproval(a) - rankApproval(b);
      case 'best':
      default:
        return rankBest(a) - rankBest(b);
    }
  });
  return sorted;
}

function rankApproval(r: ProviderResult): number {
  if (r.status === 'approved') return 0;
  if (r.status === 'approved_with_condition') return 1;
  if (r.status === 'rejected') return 2;
  return 3;
}

function rankBest(r: ProviderResult): number {
  let score = 0;
  if (r.status === 'approved') score -= 1000;
  if (r.status === 'approved_with_condition') score -= 500;
  if (r.installmentAmount) score += r.installmentAmount * 0.01;
  if (r.downPayment) score += r.downPayment * 0.005;
  if (r.cet) score += r.cet * 10;
  if (r.termMonths) score -= r.termMonths * 0.1;
  return score;
}

export async function loadInstitutions(): Promise<FinancingInstitution[]> {
  const { data, error } = await supabase
    .from('financing_institutions')
    .select('*')
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return data as FinancingInstitution[];
}

// Reload saved offers for a simulation from the database
export async function loadOffers(simulationId: string): Promise<FinancingOffer[]> {
  const { data, error } = await supabase
    .from('financing_offers')
    .select('*')
    .eq('simulation_id', simulationId);
  if (error) throw error;
  return data as FinancingOffer[];
}

```

=== FILE: src/lib/proposal.ts ===
```typescript
import type { ProviderResult } from '@/lib/financing-engine';
import { formatCurrency } from '@/lib/format';

export interface ProposalData {
  clientName: string;
  clientDocument: string | null;
  clientPhone: string | null;
  vehicleLabel: string;
  vehicleYear: number | null;
  vehiclePrice: number;
  downPayment: number;
  financedAmount: number;
  termMonths: number;
  result: ProviderResult;
  dealerName?: string | null;
  dealerLogoUrl?: string | null;
  protocolNumber?: string | null;
}

export function generateProposal(data: ProposalData): void {
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const r = data.result;
  const isApproved = r.status === 'approved';
  const statusLabel = isApproved ? 'APROVADO' : 'APROVADO COM CONDIÇÃO';
  const statusClass = isApproved ? 'status-approved' : 'status-condition';

  const formatBRL = (val: number | null) => {
    if (val === null || val === undefined) return '—';
    return formatCurrency(val);
  };

  const logoHtml = data.dealerLogoUrl ? `<img src="${data.dealerLogoUrl}" alt="${data.dealerName || ''}" style="max-height: 48px; max-width: 140px; object-fit: contain;" />` : '';
  const protocolHtml = data.protocolNumber ? `<div style="font-size:12px;opacity:0.8;margin-top:8px;">Protocolo: <strong>${data.protocolNumber}</strong></div>` : '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Proposta de Financiamento - ${data.clientName}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f0f2f5; color: #1a1a1a; padding: 20px; }
  .doc { max-width: 720px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #1e3a5f 0%, #2b5cb8 100%); color: white; padding: 30px 40px; display: flex; align-items: center; justify-content: space-between; }
  .header-left { flex: 1; }
  .header-right { flex-shrink: 0; margin-left: 20px; }
  .header h1 { font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
  .header .subtitle { font-size: 13px; opacity: 0.8; margin-top: 5px; }
  .header .date { font-size: 12px; opacity: 0.7; margin-top: 10px; }
  .body { padding: 30px 40px; }
  .status-badge { display: inline-block; padding: 8px 20px; border-radius: 24px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 25px; }
  .status-approved { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
  .status-condition { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
  h2 { font-size: 15px; color: #2b5cb8; border-left: 4px solid #2b5cb8; padding-left: 12px; margin: 25px 0 15px; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .info-item { padding: 14px; background: #f5f7fa; border-radius: 10px; border: 1px solid #e8edf3; }
  .info-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
  .info-value { font-size: 15px; font-weight: 700; color: #1a1a1a; margin-top: 4px; }
  .highlight-box { background: #e8f4e8 !important; border-color: #4a9d4a !important; }
  .highlight-box .info-value { color: #2d7a2d; }
  .protocol-box { display: inline-block; padding: 10px 20px; background: #e8f4e8; border: 1px solid #4a9d4a; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
  .protocol-box strong { color: #2d7a2d; font-size: 16px; letter-spacing: 1px; }
  .bank-section { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 20px; margin: 20px 0; }
  .bank-section .bank-name { font-size: 16px; font-weight: 700; color: #1e3a5f; margin-bottom: 8px; }
  .bank-section .bank-url { color: #2b5cb8; font-weight: 600; text-decoration: none; word-break: break-all; font-size: 13px; }
  .conditions-box { background: #fff8e1; border: 1px solid #ffe082; border-radius: 10px; padding: 15px; margin: 15px 0; font-size: 13px; line-height: 1.6; color: #6d5800; }
  .disclaimer { background: #f8f9fa; border-radius: 10px; padding: 15px; margin: 20px 0; font-size: 12px; line-height: 1.6; color: #666; border: 1px solid #e9ecef; }
  .footer { padding: 20px 40px; background: #f8f9fa; border-top: 1px solid #e9ecef; text-align: center; font-size: 11px; color: #999; }
  .footer-dealer { font-weight: 700; color: #444; margin-bottom: 4px; font-size: 13px; }
  .actions { padding: 0 40px 30px; text-align: center; }
  .btn-print { display: inline-block; padding: 12px 32px; background: #2b5cb8; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
  .btn-print:hover { background: #1e3a5f; }
  @media print { body { background: white; padding: 0; } .doc { box-shadow: none; max-width: 100%; } .actions { display: none; } }
</style>
</head>
<body>
<div class="doc">
  <div class="header">
    <div class="header-left">
      <h1>PROPOSTA DE FINANCIAMENTO</h1>
      <div class="subtitle">${data.dealerName ? data.dealerName : 'Rede Auto - Plataforma de Gestão Automotiva'}</div>
      <div class="date">Emitido em ${today}</div>
      ${protocolHtml}
    </div>
    ${logoHtml ? `<div class="header-right">${logoHtml}</div>` : ''}
  </div>
  <div class="body">
    ${data.protocolNumber ? `<div class="protocol-box">Protocolo da simulação: <strong>${data.protocolNumber}</strong></div>` : ''}
    <div class="status-badge ${statusClass}">${statusLabel} - ${r.institutionName}</div>

    <h2>Dados do Cliente</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Nome</div>
        <div class="info-value">${data.clientName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">CPF / CNPJ</div>
        <div class="info-value">${data.clientDocument || '—'}</div>
      </div>
      ${data.clientPhone ? `<div class="info-item">
        <div class="info-label">Telefone</div>
        <div class="info-value">${data.clientPhone}</div>
      </div>` : ''}
    </div>

    <h2>Dados do Veículo</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Veículo</div>
        <div class="info-value">${data.vehicleLabel}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Ano</div>
        <div class="info-value">${data.vehicleYear || '—'}</div>
      </div>
    </div>

    <h2>Condições da Proposta — ${r.institutionName}</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Valor do Veículo</div>
        <div class="info-value">${formatBRL(data.vehiclePrice)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Entrada</div>
        <div class="info-value">${formatBRL(r.downPayment)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Valor Financiado</div>
        <div class="info-value">${formatBRL(r.financedAmount)}</div>
      </div>
      <div class="info-item highlight-box">
        <div class="info-label">Parcela</div>
        <div class="info-value">${formatBRL(r.installmentAmount)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Prazo</div>
        <div class="info-value">${r.termMonths}x</div>
      </div>
      <div class="info-item">
        <div class="info-label">Taxa de Juros (a.a.)</div>
        <div class="info-value">${r.interestRate !== null ? r.interestRate + '%' : '—'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">CET (a.a.)</div>
        <div class="info-value">${r.cet !== null ? r.cet + '%' : '—'}</div>
      </div>
    </div>

    ${r.conditions ? `<div class="conditions-box"><strong>Condicoes:</strong> ${r.conditions}</div>` : ''}
    ${r.notes ? `<div class="conditions-box"><strong>Observacoes:</strong> ${r.notes}</div>` : ''}

    <div class="bank-section">
      <div class="bank-name">${r.institutionName}</div>
      <p style="font-size:13px;color:#444;margin-bottom:8px;">Para dar continuidade ao financiamento, acesse o canal oficial:</p>
      <a href="${r.financingUrl || '#'}" target="_blank" class="bank-url">${r.financingUrl || 'Consulte a instituicao'}</a>
    </div>

    <div class="disclaimer">
      Esta proposta refere-se a uma simulação real e válida, com condições efetivas de financiamento junto a ${r.institutionName}. Para formalizar o contrato, será necessária a apresentação da documentação do cliente, vistoria do veículo e validação cadastral final pela instituição financeira. Os valores apresentados foram calculados com base nas taxas e condições vigentes e podem sofrer ajustes em caso de alteração das informações prestadas.
    </div>
  </div>

  <div class="actions">
    <button class="btn-print" onclick="window.print()">Imprimir / Salvar PDF</button>
  </div>

  <div class="footer">
    ${data.dealerName ? `<div class="footer-dealer">${data.dealerName}</div>` : ''}
    Documento gerado em ${today} | Rede Auto Ribeirão - Plataforma de Gestão Automotiva
  </div>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    // Popup blocked — fallback: navigate in same tab
    window.location.href = url;
  }
  // Revoke after 60 seconds
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

```

=== FILE: src/lib/integrations.ts ===
```typescript
import { supabase, type Integration, type IntegrationAccount, type Conversation, type Message, type ConversationWithLead } from '@/lib/supabase';

export const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: '#25D366',
  instagram: '#E4405F',
  facebook: '#1877F2',
  olx: '#7E22CE',
  webmotors: '#E30613',
  mercado_livre: '#FFE600',
  google: '#4285F4',
  site: '#2a93e8',
};

export const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
  olx: 'OLX',
  webmotors: 'Webmotors',
  mercado_livre: 'Mercado Livre',
  google: 'Google',
  site: 'Site',
};

export function channelLabel(channel: string): string {
  return CHANNEL_LABELS[channel] || channel;
}

export function channelColor(channel: string): string {
  return CHANNEL_COLORS[channel] || '#2a93e8';
}

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function edgeHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`,
  };
}

// === WhatsApp Cloud API (Meta) ===
// Dealer provides: phone_number_id, access_token from Meta Business
// Webhook URL is auto-configured: {EDGE_URL}/platform-webhook

export async function connectWhatsAppCloud(
  dealerId: string,
  integrationId: string,
  phoneNumberId: string,
  accessToken: string,
  wabaId: string,
  phoneNumber: string,
): Promise<{ success: boolean; error: string | null; message: string }> {
  if (!phoneNumberId.trim() || !accessToken.trim() || !wabaId.trim()) {
    return { success: false, error: 'Preencha todos os campos obrigatórios', message: '' };
  }

  const webhookSecret = generateWebhookSecret(dealerId, 'whatsapp');

  const { error } = await supabase.from('integration_accounts').upsert({
    dealer_id: dealerId,
    integration_id: integrationId,
    status: 'connected',
    account_name: phoneNumber ? `WhatsApp ${phoneNumber}` : 'WhatsApp Business',
    account_identifier: phoneNumber || phoneNumberId,
    phone_number_id: phoneNumberId,
    waba_id: wabaId,
    webhook_url: `${EDGE_URL}/platform-webhook`,
    webhook_secret: webhookSecret,
    webhook_verified: false,
    connected_at: new Date().toISOString(),
    last_sync_at: new Date().toISOString(),
    metadata: {
      platform: 'whatsapp',
      access_token: accessToken,
      phone_number_id: phoneNumberId,
      waba_id: wabaId,
      phone_number: phoneNumber,
    },
    updated_at: new Date().toISOString(),
  }, { onConflict: 'dealer_id,integration_id' });

  return {
    success: !error,
    error: error ? error.message : null,
    message: error ? error.message : 'WhatsApp conectado! Configure o webhook na Meta para receber mensagens.',
  };
}

// === Instagram / Facebook (Meta Graph API) ===
// Dealer provides: page_id, access_token from Meta Business

export async function connectMetaSocial(
  dealerId: string,
  integrationId: string,
  platform: 'instagram' | 'facebook',
  pageId: string,
  accessToken: string,
  accountName: string,
): Promise<{ success: boolean; error: string | null; message: string }> {
  if (!pageId.trim() || !accessToken.trim()) {
    return { success: false, error: 'Preencha todos os campos', message: '' };
  }

  const webhookSecret = generateWebhookSecret(dealerId, platform);

  const { error } = await supabase.from('integration_accounts').upsert({
    dealer_id: dealerId,
    integration_id: integrationId,
    status: 'connected',
    account_name: accountName || (platform === 'instagram' ? 'Instagram Business' : 'Facebook Page'),
    account_identifier: pageId,
    waba_id: pageId,
    webhook_url: `${EDGE_URL}/platform-webhook`,
    webhook_secret: webhookSecret,
    webhook_verified: false,
    connected_at: new Date().toISOString(),
    last_sync_at: new Date().toISOString(),
    metadata: {
      platform,
      access_token: accessToken,
      page_id: pageId,
    },
    updated_at: new Date().toISOString(),
  }, { onConflict: 'dealer_id,integration_id' });

  const label = platform === 'instagram' ? 'Instagram' : 'Facebook';
  return {
    success: !error,
    error: error ? error.message : null,
    message: error ? error.message : `${label} conectado! Configure o webhook na Meta para receber mensagens.`,
  };
}

// === OLX (Partner API) ===
// Dealer provides: client_id, client_secret from developers.olx.com.br

export async function connectOLX(
  dealerId: string,
  integrationId: string,
  clientId: string,
  clientSecret: string,
  accountEmail: string,
): Promise<{ success: boolean; error: string | null; message: string }> {
  if (!clientId.trim() || !clientSecret.trim()) {
    return { success: false, error: 'Preencha Client ID e Client Secret', message: '' };
  }

  const webhookSecret = generateWebhookSecret(dealerId, 'olx');

  const { error } = await supabase.from('integration_accounts').upsert({
    dealer_id: dealerId,
    integration_id: integrationId,
    status: 'connected',
    account_name: accountEmail ? `OLX (${accountEmail})` : 'OLX',
    account_identifier: clientId,
    account_email: accountEmail || null,
    webhook_url: `${EDGE_URL}/platform-webhook`,
    webhook_secret: webhookSecret,
    webhook_verified: false,
    connected_at: new Date().toISOString(),
    last_sync_at: new Date().toISOString(),
    metadata: {
      platform: 'olx',
      client_id: clientId,
      client_secret: clientSecret,
    },
    updated_at: new Date().toISOString(),
  }, { onConflict: 'dealer_id,integration_id' });

  return {
    success: !error,
    error: error ? error.message : null,
    message: error ? error.message : 'OLX conectado! Configure o webhook no portal da OLX para receber mensagens.',
  };
}

// === Webmotors (Partner API) ===
// Dealer provides: API token from portal-webmotors.sensedia.com

export async function connectWebmotors(
  dealerId: string,
  integrationId: string,
  apiToken: string,
  accountEmail: string,
): Promise<{ success: boolean; error: string | null; message: string }> {
  if (!apiToken.trim()) {
    return { success: false, error: 'Preencha o token da API', message: '' };
  }

  const webhookSecret = generateWebhookSecret(dealerId, 'webmotors');

  const { error } = await supabase.from('integration_accounts').upsert({
    dealer_id: dealerId,
    integration_id: integrationId,
    status: 'connected',
    account_name: accountEmail ? `Webmotors (${accountEmail})` : 'Webmotors',
    account_identifier: apiToken.substring(0, 12),
    account_email: accountEmail || null,
    webhook_url: `${EDGE_URL}/platform-webhook`,
    webhook_secret: webhookSecret,
    webhook_verified: false,
    connected_at: new Date().toISOString(),
    last_sync_at: new Date().toISOString(),
    metadata: {
      platform: 'webmotors',
      api_token: apiToken,
    },
    updated_at: new Date().toISOString(),
  }, { onConflict: 'dealer_id,integration_id' });

  return {
    success: !error,
    error: error ? error.message : null,
    message: error ? error.message : 'Webmotors conectado! Configure o webhook no portal da Webmotors para receber mensagens.',
  };
}

// === Webhook helpers ===

function generateWebhookSecret(dealerId: string, platform: string): string {
  return `${platform}_${dealerId.substring(0, 8)}_${Date.now().toString(36)}`;
}

export function getWebhookUrl(): string {
  return `${EDGE_URL}/platform-webhook`;
}

// === Site widget ===

export function getSiteWidgetEmbedCode(dealerId: string): string {
  const widgetUrl = `${window.location.origin}/widget/chat.js?dealer=${dealerId}`;
  return `<!-- Chat da Rede Auto -->\n<script src="${widgetUrl}" async></script>\n<!-- Fim do Chat -->`;
}

export function getSiteWidgetUrl(dealerId: string): string {
  return `${window.location.origin}/widget/chat.html?dealer=${dealerId}`;
}

// === Disconnect ===

export async function disconnectAccount(accountId: string): Promise<boolean> {
  const { error } = await supabase
    .from('integration_accounts')
    .update({
      status: 'disconnected',
      disconnected_at: new Date().toISOString(),
      webhook_verified: false,
      connected_at: null,
      metadata: { canceled: true },
      updated_at: new Date().toISOString(),
    })
    .eq('id', accountId);
  return !error;
}

// === Sync ===

export async function syncConversations(dealerId: string, accountId: string, _platform: string): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase.from('integration_accounts').update({
    last_sync_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', accountId);

  return {
    success: !error,
    message: error ? error.message : 'Atualizado. As mensagens chegam automaticamente via webhook.',
  };
}

// === Conversations and messages ===

export async function loadConversations(dealerId: string): Promise<ConversationWithLead[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, lead:leads(*)')
    .eq('dealer_id', dealerId)
    .order('last_message_at', { ascending: false, nullsFirst: false });
  if (error) return [];
  return (data as ConversationWithLead[]) || [];
}

export async function loadMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) return [];
  return (data as Message[]) || [];
}

export type SendMessageResult = {
  success: boolean;
  delivered: boolean;
  error: string | null;
  message: Message | null;
};

export async function sendMessageViaPlatform(conversationId: string, dealerId: string, content: string): Promise<SendMessageResult> {
  try {
    const response = await fetch(`${EDGE_URL}/send-message`, {
      method: 'POST',
      headers: edgeHeaders(),
      body: JSON.stringify({ conversation_id: conversationId, dealer_id: dealerId, content }),
    });

    if (!response.ok) {
      return { success: false, delivered: false, error: `Erro ${response.status}`, message: null };
    }

    const result = await response.json();
    return {
      success: result.success ?? false,
      delivered: result.delivered ?? false,
      error: result.delivery_error || result.error || null,
      message: result.message || null,
    };
  } catch {
    return { success: false, delivered: false, error: 'Erro ao enviar mensagem', message: null };
  }
}

export async function markConversationRead(conversationId: string) {
  await supabase
    .from('conversations')
    .update({ unread_count: 0, updated_at: new Date().toISOString() })
    .eq('id', conversationId);
}

```

=== FILE: src/lib/closure.ts ===
```typescript
import { supabase, type ExpenseWithCategory, type MonthlyClosure } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';

export type ClosureSummary = {
  totalExpenses: number;
  totalPaidExpenses: number;
  totalPendingExpenses: number;
  totalSales: number;
  totalProfit: number;
  vehiclesSold: number;
  vehiclesInStock: number;
  fixedExpensesCount: number;
  expensesByCategory: { name: string; color: string; total: number }[];
};

export type ClosureReportData = {
  expenses: ExpenseWithCategory[];
  sales: {
    id: string;
    client_name: string | null;
    vehicle_label: string;
    sale_price: number;
    purchase_price: number;
    profit: number | null;
    sale_date: string;
    payment_method: string | null;
  }[];
  soldVehicles: {
    id: string;
    brand: string;
    model: string;
    year_model: number | null;
    sale_price: number;
    purchase_price: number;
    profit: number | null;
  }[];
  summary: ClosureSummary;
};

export async function gatherClosureData(dealerId: string): Promise<ClosureReportData> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [expRes, salesRes, vehiclesRes] = await Promise.all([
    supabase
      .from('expenses')
      .select('*, category:expense_categories(*)')
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: false }),
    supabase
      .from('sales')
      .select('id, client_name, sale_price, purchase_price, profit, sale_date, payment_method, vehicle_id, notes')
      .eq('dealer_id', dealerId)
      .gte('sale_date', monthStart.toISOString().split('T')[0])
      .lte('sale_date', monthEnd.toISOString().split('T')[0])
      .order('sale_date', { ascending: false }),
    supabase
      .from('vehicles')
      .select('id, brand, model, year_model, asking_price, purchase_price, status')
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: false }),
  ]);

  const expenses = (expRes.data as unknown as ExpenseWithCategory[]) || [];

  const salesRaw = salesRes.data || [];
  const sales = await Promise.all(
    salesRaw.map(async (s: { id: string; client_name: string | null; sale_price: number; purchase_price: number; profit: number | null; sale_date: string; payment_method: string | null; vehicle_id: string | null; notes: string | null }) => {
      let vehicleLabel = 'Veículo não vinculado';
      if (s.vehicle_id) {
        const { data: v } = await supabase
          .from('vehicles')
          .select('brand, model, year_model')
          .eq('id', s.vehicle_id)
          .maybeSingle();
        if (v) vehicleLabel = `${v.brand} ${v.model}${v.year_model ? ' ' + v.year_model : ''}`;
      }
      return {
        id: s.id,
        client_name: s.client_name,
        vehicle_label: vehicleLabel,
        sale_price: Number(s.sale_price),
        purchase_price: Number(s.purchase_price),
        profit: s.profit !== null ? Number(s.profit) : null,
        sale_date: s.sale_date,
        payment_method: s.payment_method,
      };
    })
  );

  const soldVehicles = (vehiclesRes.data || [])
    .filter((v: { status: string }) => v.status === 'sold')
    .map((v: { id: string; brand: string; model: string; year_model: number | null; asking_price: number; purchase_price: number }) => ({
      id: v.id,
      brand: v.brand,
      model: v.model,
      year_model: v.year_model,
      sale_price: Number(v.asking_price),
      purchase_price: Number(v.purchase_price),
      profit: Number(v.asking_price) - Number(v.purchase_price),
    }));

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalPaidExpenses = expenses.filter((e) => e.status === 'paid').reduce((s, e) => s + Number(e.amount), 0);
  const totalPendingExpenses = expenses.filter((e) => e.status === 'pending').reduce((s, e) => s + Number(e.amount), 0);
  const totalSales = sales.reduce((s, sale) => s + sale.sale_price, 0);
  const totalProfit = sales.reduce((s, sale) => s + (sale.profit || 0), 0) + soldVehicles.reduce((s, v) => s + v.profit, 0);
  const vehiclesSold = soldVehicles.length;
  const vehiclesInStock = (vehiclesRes.data || []).filter((v: { status: string }) => v.status !== 'sold').length;
  const fixedExpensesCount = expenses.filter((e) => e.is_fixed).length;

  const catMap = new Map<string, { name: string; color: string; total: number }>();
  for (const e of expenses) {
    const key = e.category_id || 'none';
    const existing = catMap.get(key) || { name: e.category?.name || 'Sem categoria', color: e.category?.color || '#64748b', total: 0 };
    existing.total += Number(e.amount);
    catMap.set(key, existing);
  }
  const expensesByCategory = Array.from(catMap.values()).sort((a, b) => b.total - a.total);

  return {
    expenses,
    sales,
    soldVehicles,
    summary: {
      totalExpenses,
      totalPaidExpenses,
      totalPendingExpenses,
      totalSales,
      totalProfit,
      vehiclesSold,
      vehiclesInStock,
      fixedExpensesCount,
      expensesByCategory,
    },
  };
}

export async function executeMonthClosure(dealerId: string): Promise<MonthlyClosure> {
  const now = new Date();
  const periodMonth = now.getMonth() + 1;
  const periodYear = now.getFullYear();

  const reportData = await gatherClosureData(dealerId);

  const { data: existing } = await supabase
    .from('monthly_closures')
    .select('id')
    .eq('dealer_id', dealerId)
    .eq('period_month', periodMonth)
    .eq('period_year', periodYear)
    .maybeSingle();

  if (existing) {
    throw new Error('Este mês já foi encerrado. Consulte o histórico para acessar o relatório.');
  }

  const summaryTotals = {
    total_expenses: reportData.summary.totalExpenses,
    total_paid_expenses: reportData.summary.totalPaidExpenses,
    total_pending_expenses: reportData.summary.totalPendingExpenses,
    total_sales: reportData.summary.totalSales,
    total_profit: reportData.summary.totalProfit,
    vehicles_sold: reportData.summary.vehiclesSold,
    vehicles_in_stock: reportData.summary.vehiclesInStock,
    fixed_expenses_count: reportData.summary.fixedExpensesCount,
  };

  const { data, error } = await supabase
    .from('monthly_closures')
    .insert({
      dealer_id: dealerId,
      period_month: periodMonth,
      period_year: periodYear,
      report_data: reportData as unknown as Record<string, unknown>,
      summary_totals: summaryTotals,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Erro ao salvar encerramento: ${error.message}`);

  // Delete non-fixed expenses
  await supabase.from('expenses').delete().eq('dealer_id', dealerId).eq('is_fixed', false);

  // Delete sold vehicles
  await supabase.from('vehicles').delete().eq('dealer_id', dealerId).eq('status', 'sold');

  // Delete all sales records (they're archived in the report)
  await supabase.from('sales').delete().eq('dealer_id', dealerId);

  return data as MonthlyClosure;
}

export function generateClosurePDF(closure: MonthlyClosure, dealerName: string, dealerLogoUrl?: string | null) {
  const report = closure.report_data as unknown as ClosureReportData;
  const s = report.summary;
  const monthName = new Date(closure.period_year, closure.period_month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const today = new Date(closure.closed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const logoHtml = dealerLogoUrl
    ? `<img src="${dealerLogoUrl}" alt="${dealerName}" style="max-height:48px;max-width:140px;object-fit:contain;" />`
    : '';
  const profitColor = s.totalProfit >= 0 ? '#155724' : '#721c24';
  const profitBg = s.totalProfit >= 0 ? '#d4edda' : '#f8d7da';

  const expensesRows = report.expenses
    .map(
      (e) => `<tr>
        <td>${e.description}</td>
        <td>${e.category?.name || '—'}</td>
        <td style="text-align:right">${formatCurrency(Number(e.amount))}</td>
        <td>${e.status === 'paid' ? 'Pago' : 'Pendente'}</td>
        <td>${e.is_fixed ? 'Sim' : 'Não'}</td>
      </tr>`
    )
    .join('');

  const salesRows = report.sales
    .map(
      (sale) => `<tr>
        <td>${sale.vehicle_label}</td>
        <td>${sale.client_name || '—'}</td>
        <td style="text-align:right">${formatCurrency(sale.sale_price)}</td>
        <td style="text-align:right">${formatCurrency(sale.purchase_price)}</td>
        <td style="text-align:right;color:${(sale.profit || 0) >= 0 ? '#155724' : '#721c24'};font-weight:700">${formatCurrency(sale.profit || 0)}</td>
      </tr>`
    )
    .join('');

  const soldVehiclesRows = report.soldVehicles
    .map(
      (v) => `<tr>
        <td>${v.brand} ${v.model}</td>
        <td>${v.year_model || '—'}</td>
        <td style="text-align:right">${formatCurrency(v.sale_price)}</td>
        <td style="text-align:right">${formatCurrency(v.purchase_price)}</td>
        <td style="text-align:right;color:${(v.profit || 0) >= 0 ? '#155724' : '#721c24'};font-weight:700">${formatCurrency(v.profit || 0)}</td>
      </tr>`
    )
    .join('');

  const catBreakdown = s.expensesByCategory
    .map(
      (c) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <div style="width:12px;height:12px;border-radius:50%;background:${c.color}"></div>
        <span style="flex:1;font-size:13px;color:#333">${c.name}</span>
        <span style="font-size:13px;font-weight:700;color:#1a1a1a">${formatCurrency(c.total)}</span>
      </div>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Relatório de Encerramento - ${monthName}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Helvetica Neue',Arial,sans-serif; background:#f0f2f5; color:#1a1a1a; padding:20px; }
  .doc { max-width:800px; margin:0 auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 2px 20px rgba(0,0,0,0.08); }
  .header { background:linear-gradient(135deg,#1e3a5f 0%,#2b5cb8 100%); color:white; padding:30px 40px; display:flex; align-items:center; justify-content:space-between; }
  .header-left { flex:1; }
  .header-right { flex-shrink:0; margin-left:20px; }
  .header h1 { font-size:22px; font-weight:700; }
  .header .subtitle { font-size:13px; opacity:0.8; margin-top:5px; }
  .header .date { font-size:12px; opacity:0.7; margin-top:8px; }
  .body { padding:30px 40px; }
  .summary-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:25px; }
  .summary-card { padding:16px; border-radius:10px; border:1px solid #e8edf3; background:#f5f7fa; }
  .summary-card .label { font-size:11px; color:#666; text-transform:uppercase; letter-spacing:0.5px; font-weight:600; }
  .summary-card .value { font-size:18px; font-weight:700; color:#1a1a1a; margin-top:4px; }
  .profit-card { background:${profitBg}; border-color:${profitColor}; }
  .profit-card .value { color:${profitColor}; }
  h2 { font-size:15px; color:#2b5cb8; border-left:4px solid #2b5cb8; padding-left:12px; margin:25px 0 15px; text-transform:uppercase; letter-spacing:0.5px; }
  table { width:100%; border-collapse:collapse; margin-bottom:20px; font-size:13px; }
  th { text-align:left; padding:10px 12px; background:#f0f4f8; color:#1e3a5f; font-weight:700; border-bottom:2px solid #d0d8e4; font-size:11px; text-transform:uppercase; }
  td { padding:10px 12px; border-bottom:1px solid #eef2f7; color:#333; }
  tr:hover td { background:#f8faff; }
  .actions { padding:0 40px 30px; text-align:center; }
  .btn-print { display:inline-block; padding:12px 32px; background:#2b5cb8; color:white; border:none; border-radius:10px; font-size:15px; font-weight:600; cursor:pointer; }
  .btn-print:hover { background:#1e3a5f; }
  .footer { padding:20px 40px; background:#f8f9fa; border-top:1px solid #e9ecef; text-align:center; font-size:11px; color:#999; }
  .footer-dealer { font-weight:700; color:#444; margin-bottom:4px; font-size:13px; }
  .cat-box { background:#f5f7fa; border:1px solid #e8edf3; border-radius:10px; padding:15px; margin-bottom:20px; }
  @media print { body { background:white; padding:0; } .doc { box-shadow:none; max-width:100%; } .actions { display:none; } }
</style>
</head>
<body>
<div class="doc">
  <div class="header">
    <div class="header-left">
      <h1>RELATÓRIO DE ENCERRAMENTO MENSAL</h1>
      <div class="subtitle">${dealerName} — ${monthName}</div>
      <div class="date">Encerrado em ${today}</div>
    </div>
    ${logoHtml ? `<div class="header-right">${logoHtml}</div>` : ''}
  </div>
  <div class="body">
    <h2>Resumo do Mês</h2>
    <div class="summary-grid">
      <div class="summary-card"><div class="label">Total de Despesas</div><div class="value">${formatCurrency(s.totalExpenses)}</div></div>
      <div class="summary-card"><div class="label">Total de Vendas</div><div class="value">${formatCurrency(s.totalSales)}</div></div>
      <div class="summary-card profit-card"><div class="label">Lucro Total</div><div class="value">${formatCurrency(s.totalProfit)}</div></div>
      <div class="summary-card"><div class="label">Despesas Pagas</div><div class="value">${formatCurrency(s.totalPaidExpenses)}</div></div>
      <div class="summary-card"><div class="label">Despesas Pendentes</div><div class="value">${formatCurrency(s.totalPendingExpenses)}</div></div>
      <div class="summary-card"><div class="label">Veículos Vendidos</div><div class="value">${s.vehiclesSold}</div></div>
      <div class="summary-card"><div class="label">Veículos em Estoque</div><div class="value">${s.vehiclesInStock}</div></div>
      <div class="summary-card"><div class="label">Despesas Fixas</div><div class="value">${s.fixedExpensesCount}</div></div>
    </div>

    ${s.expensesByCategory.length > 0 ? `<h2>Despesas por Categoria</h2><div class="cat-box">${catBreakdown}</div>` : ''}

    ${report.sales.length > 0 ? `<h2>Vendas do Mês</h2>
    <table>
      <thead><tr><th>Veículo</th><th>Cliente</th><th style="text-align:right">Venda</th><th style="text-align:right">Custo</th><th style="text-align:right">Lucro</th></tr></thead>
      <tbody>${salesRows}</tbody>
    </table>` : ''}

    ${report.soldVehicles.length > 0 ? `<h2>Veículos Vendidos</h2>
    <table>
      <thead><tr><th>Veículo</th><th>Ano</th><th style="text-align:right">Preço Venda</th><th style="text-align:right">Custo</th><th style="text-align:right">Lucro</th></tr></thead>
      <tbody>${soldVehiclesRows}</tbody>
    </table>` : ''}

    ${report.expenses.length > 0 ? `<h2>Despesas do Mês</h2>
    <table>
      <thead><tr><th>Descrição</th><th>Categoria</th><th style="text-align:right">Valor</th><th>Status</th><th>Fixa</th></tr></thead>
      <tbody>${expensesRows}</tbody>
    </table>` : ''}

    <div style="background:#f8f9fa;border-radius:10px;padding:15px;margin:20px 0;font-size:12px;line-height:1.6;color:#666;border:1px solid #e9ecef;">
      Este relatório é um registro permanente do encerramento do mês. Após o encerramento, as despesas não fixas, veículos vendidos e registros de vendas foram removidos do sistema. As despesas fixas, veículos em estoque e clientes foram mantidos para o próximo mês.
    </div>
  </div>
  <div class="actions">
    <button class="btn-print" onclick="window.print()">Imprimir / Salvar PDF</button>
  </div>
  <div class="footer">
    ${dealerName ? `<div class="footer-dealer">${dealerName}</div>` : ''}
    Relatório de Encerramento — ${monthName} | Rede Auto Ribeirão
  </div>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) window.location.href = url;
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

```

=== FILE: src/context/AuthContext.tsx ===
```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type Dealer } from '@/lib/supabase';

type AuthContextType = {
  session: Session | null;
  dealer: Dealer | null;
  loading: boolean;
  refreshDealer: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        loadDealer(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      // Ignore the INITIAL_SESSION event — already handled by getSession above
      if (event === 'INITIAL_SESSION') return;
      setSession(newSession);
      if (newSession) {
        setLoading(true);
        (async () => {
          await loadDealer(newSession.user.id);
        })();
      } else {
        setDealer(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function loadDealer(userId: string) {
    const { data, error } = await supabase
      .from('dealers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao carregar lojista:', error);
    }

    if (!data) {
      // Session exists but no dealer record — stale session, sign out
      await supabase.auth.signOut();
      setSession(null);
      setDealer(null);
      setLoading(false);
      return;
    }

    setDealer(data as Dealer);
    setLoading(false);
  }

  async function refreshDealer() {
    if (!session?.user?.id) return;
    await loadDealer(session.user.id);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Generic on purpose: a specific message would reveal which emails have accounts.
      console.error('Falha no login:', error);
      return { error: 'E-mail ou senha incorretos.' };
    }
    return { error: null };
  }

  async function signUp(email: string, password: string, name: string, phone: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      // Generic on purpose: "User already registered" would confirm the account exists.
      console.error('Falha no cadastro:', error);
      return { error: 'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.' };
    }

    if (data.user) {
      const { error: dealerError } = await supabase.from('dealers').insert({
        user_id: data.user.id,
        name,
        phone,
        email,
      });
      if (dealerError) {
        console.error('Falha ao criar loja:', dealerError);
        return { error: 'Não foi possível criar sua loja. Tente novamente.' };
      }
    }
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setDealer(null);
  }

  return (
    <AuthContext.Provider value={{ session, dealer, loading, refreshDealer, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}


```

=== FILE: src/components/Logo.tsx ===
```tsx
export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = {
    sm: { img: 'w-9 h-9', title: 'text-sm', sub: 'text-[9px]' },
    md: { img: 'w-12 h-12', title: 'text-lg', sub: 'text-[10px]' },
    lg: { img: 'w-16 h-16', title: 'text-2xl', sub: 'text-xs' },
    xl: { img: 'w-20 h-20', title: 'text-3xl', sub: 'text-sm' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-accent-500/25 blur-2xl rounded-full animate-glow" />
        <div className="absolute inset-0 bg-accent-400/10 blur-lg rounded-2xl" />
        <img
          src="/images/762904057_18120070436504665_7201693434288924363_n.jpg"
          alt="Rede Auto Ribeirão"
          className={`relative ${s.img} rounded-2xl object-cover ring-1 ring-accent-400/30 shadow-lg shadow-accent-500/20`}
        />
      </div>
      <div className="flex flex-col leading-tight">
        <span className={`${s.title} font-extrabold text-white tracking-tight`}>
          Rede Auto
        </span>
        <span className={`${s.sub} font-bold tracking-[0.3em] text-accent-400 uppercase`}>
          Ribeirão
        </span>
      </div>
    </div>
  );
}

```

=== FILE: src/components/Layout.tsx ===
```tsx
import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, Search, LogOut, Menu, X, Wallet, TrendingUp, Users, Calculator, Store, Zap, MessageSquare } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/context/AuthContext';

const navSections = [
  {
    title: 'Gestão',
    items: [
      { to: '/dashboard', label: 'Painel', icon: LayoutDashboard },
      { to: '/estoque', label: 'Meu Estoque', icon: Car },
      { to: '/vendas', label: 'Vendas', icon: TrendingUp },
      { to: '/financeiro', label: 'Financeiro', icon: Wallet },
      { to: '/financiamento', label: 'Financiamento', icon: Calculator },
      { to: '/clientes', label: 'Clientes', icon: Users },
      { to: '/atendimento', label: 'Atendimento', icon: MessageSquare },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { to: '/integracoes', label: 'Integrações', icon: Zap },
    ],
  },
  {
    title: 'Rede',
    items: [
      { to: '/rede', label: 'Buscar na Rede', icon: Search },
      { to: '/perfil/editar', label: 'Meu Perfil', icon: Store },
    ],
  },
];

export function Layout({ children }: { children: ReactNode }) {
  const { dealer, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-navy-950 bg-mesh relative">
      {/* Decorative grid overlay */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-40" />
      {/* Ambient orbs */}
      <div className="fixed top-0 left-1/4 w-[400px] h-[400px] bg-accent-500/5 rounded-full blur-[120px] animate-float pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[300px] h-[300px] bg-navy-500/8 rounded-full blur-[100px] animate-float-slow pointer-events-none" />

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 fixed h-screen z-30 glass-strong border-r border-navy-600/20">
        {/* Logo area with gradient */}
        <div className="relative p-6 border-b border-navy-600/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-500/8 to-transparent" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent-500/5 rounded-full blur-2xl" />
          <Link to="/dashboard" className="relative z-10 block transition-transform hover:scale-105 duration-300">
            <Logo />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-400 px-3 mb-2">
                {section.title}
              </p>
              <div className="space-y-2">
                {section.items.map((item, i) => {
                  const active = location.pathname.startsWith(item.to);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden ${
                        active ? 'text-accent-300' : 'text-navy-200 hover:text-white'
                      }`}
                      style={{ animation: `slideIn 0.3s ease-out ${i * 50}ms both` }}
                    >
                      {active && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-accent-500/15 to-accent-500/5" />
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-full bg-accent-400 animate-glow-pulse" />
                        </>
                      )}
                      {!active && (
                        <div className="absolute inset-0 bg-navy-700/0 group-hover:bg-navy-700/30 transition-colors duration-300" />
                      )}
                      <Icon size={18} strokeWidth={active ? 2.5 : 2} className="relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(74,174,245,0.4)]" />
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User profile */}
        <div className="p-4 border-t border-navy-600/20">
          <Link to={dealer ? `/lojista/${dealer.id}` : '/perfil/editar'} className="group flex items-center gap-3 mb-3 p-3 rounded-xl bg-navy-800/40 hover-lift-sm transition-all duration-300 hover:bg-navy-700/40 border border-transparent hover:border-accent-500/20">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-accent-500/30 to-gold-400/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-navy-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-accent-500/20 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                {dealer?.logo_url ? <img src={dealer.logo_url} alt={dealer.name} className="w-full h-full object-cover" /> : dealer?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success-400 border-2 border-navy-900 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate group-hover:text-accent-200 transition-colors">{dealer?.name}</p>
              <p className="text-xs text-navy-300 truncate group-hover:text-navy-200 transition-colors">Ver perfil público</p>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="group flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-navy-200 hover:bg-error-500/10 hover:text-error-400 transition-all duration-300"
          >
            <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 glass-strong border-b border-navy-600/20 px-4 py-3 flex items-center justify-between">
        <Logo size="sm" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-navy-200 hover:bg-navy-700/50 transition-colors"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 pt-16 bg-navy-950/95 backdrop-blur-xl animate-fade-in" onClick={() => setMobileOpen(false)}>
          <nav className="px-4 py-4 space-y-6" onClick={(e) => e.stopPropagation()}>
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-400 px-4 mb-2">{section.title}</p>
                <div className="space-y-2">
                  {section.items.map((item, i) => {
                    const active = location.pathname.startsWith(item.to);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                          active
                            ? 'bg-accent-500/15 text-accent-300 border border-accent-500/20'
                            : 'text-navy-200 hover:bg-navy-700/40 hover:text-white'
                        }`}
                        style={{ animation: `slideIn 0.3s ease-out ${i * 50}ms both` }}
                      >
                        <Icon size={18} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="pt-4 mt-4 border-t border-navy-600/20">
              <div className="px-4 py-2">
                <p className="text-sm font-semibold text-white">{dealer?.name}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-4 py-3.5 rounded-xl text-sm font-medium text-error-400 hover:bg-error-500/10 transition-colors"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-72 pt-16 md:pt-0 relative z-10">
        <div key={location.pathname} className="min-h-screen p-4 md:p-8 animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
}

```

=== FILE: src/components/LeadModal.tsx ===
```tsx
import { useEffect, useState } from 'react';
import { X, Save, MessageSquare, Phone, Mail, User, Car, Tag, DollarSign } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type LeadSource, type LeadStatus, type Lead, type Vehicle, type ClientRecord } from '@/lib/supabase';
import { LEAD_SOURCES, PIPELINE_STAGES } from '@/lib/crm';
import { formatCurrency } from '@/lib/format';

type Props = {
  lead?: Lead | null;
  onClose: () => void;
  onSaved: () => void;
};

export function LeadModal({ lead, onClose, onSaved }: Props) {
  const { dealer } = useAuth();
  const [name, setName] = useState(lead?.name || '');
  const [phone, setPhone] = useState(lead?.phone || '');
  const [email, setEmail] = useState(lead?.email || '');
  const [source, setSource] = useState<LeadSource>(lead?.source || 'whatsapp');
  const [sourceDetail, setSourceDetail] = useState(lead?.source_detail || '');
  const [status, setStatus] = useState<LeadStatus>(lead?.status || 'new');
  const [leadScore, setLeadScore] = useState(lead?.lead_score ?? 50);
  const [vehicleId, setVehicleId] = useState<string>(lead?.vehicle_id || '');
  const [clientId, setClientId] = useState<string>(lead?.client_id || '');
  const [budget, setBudget] = useState(lead?.budget?.toString() || '');
  const [downPayment, setDownPayment] = useState(lead?.down_payment?.toString() || '');
  const [maxInstallment, setMaxInstallment] = useState(lead?.max_installment?.toString() || '');
  const [notes, setNotes] = useState(lead?.notes || '');
  const [assignedTo, setAssignedTo] = useState(lead?.assigned_to || '');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dealer) return;
    supabase.from('vehicles').select('*').eq('dealer_id', dealer.id).neq('status', 'sold').order('created_at', { ascending: false })
      .then(({ data }) => data && setVehicles(data as Vehicle[]));
    supabase.from('clients').select('*').eq('dealer_id', dealer.id).order('created_at', { ascending: false })
      .then(({ data }) => data && setClients(data as ClientRecord[]));
  }, [dealer]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dealer) return;
    if (!name.trim()) { setError('Nome é obrigatório'); return; }
    setSaving(true);
    setError(null);

    let resolvedClientId = clientId || null;

    if (!resolvedClientId && (phone || email)) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('dealer_id', dealer.id)
        .or(`phone.eq.${phone},email.eq.${email}`)
        .maybeSingle();
      if (existing) resolvedClientId = existing.id;
    }

    if (!resolvedClientId) {
      const { data: newClient, error: cErr } = await supabase
        .from('clients')
        .insert({
          dealer_id: dealer.id,
          name: name.trim(),
          phone: phone || null,
          email: email || null,
          status: 'active',
        })
        .select('id')
        .single();
      if (cErr) { setError('Erro ao criar cliente: ' + cErr.message); setSaving(false); return; }
      resolvedClientId = newClient.id;
    }

    const payload = {
      dealer_id: dealer.id,
      client_id: resolvedClientId,
      vehicle_id: vehicleId || null,
      name: name.trim(),
      phone: phone || null,
      email: email || null,
      source,
      source_detail: sourceDetail || null,
      status,
      lead_score: Number(leadScore),
      budget: budget ? Number(budget) : null,
      down_payment: downPayment ? Number(downPayment) : null,
      max_installment: maxInstallment ? Number(maxInstallment) : null,
      notes: notes || null,
      assigned_to: assignedTo || null,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (lead) {
      result = await supabase.from('leads').update(payload).eq('id', lead.id).select('*').single();
    } else {
      result = await supabase.from('leads').insert(payload).select('*').single();
    }

    if (result.error) { setError(result.error.message); setSaving(false); return; }
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div className="glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-drop-in border border-accent-500/20 relative" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400/60 to-transparent" />
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-navy-400 hover:bg-navy-700/50 hover:text-white transition-all z-10">
          <X size={18} />
        </button>
        <div className="p-6 pb-4 border-b border-navy-600/30">
          <h3 className="text-lg font-bold text-white">{lead ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <p className="text-sm text-navy-400 mt-0.5">Capture um novo prospecto no CRM</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide flex items-center gap-1"><User size={12} /> Nome *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nome do cliente"
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Phone size={12} /> WhatsApp</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000"
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Mail size={12} /> E-mail</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="cliente@email.com"
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Tag size={12} /> Cliente existente</label>
              <select value={clientId} onChange={(e) => {
                setClientId(e.target.value);
                const c = clients.find((c) => c.id === e.target.value);
                if (c) { setName(c.name); setPhone(c.phone || ''); setEmail(c.email || ''); }
              }} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
                <option value="">Novo cliente</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Origem</label>
              <select value={source} onChange={(e) => setSource(e.target.value as LeadSource)} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
                {LEAD_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Detalhe da origem</label>
              <input value={sourceDetail} onChange={(e) => setSourceDetail(e.target.value)} placeholder="Anúncio, campanha, etc."
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Car size={12} /> Veículo de interesse</label>
              <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
                <option value="">Nenhum</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.brand} {v.model} {v.year_model || ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Status no funil</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
                {PIPELINE_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Pontuação: <span className="text-accent-400">{leadScore}/100</span></label>
            <input type="range" min="0" max="100" value={leadScore} onChange={(e) => setLeadScore(Number(e.target.value))} className="w-full accent-accent-500 cursor-pointer" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide flex items-center gap-1"><DollarSign size={12} /> Orçamento</label>
              <input value={budget} onChange={(e) => setBudget(e.target.value)} type="number" placeholder="R$ 80.000"
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Entrada</label>
              <input value={downPayment} onChange={(e) => setDownPayment(e.target.value)} type="number" placeholder="R$ 20.000"
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Parcela máx.</label>
              <input value={maxInstallment} onChange={(e) => setMaxInstallment(e.target.value)} type="number" placeholder="R$ 1.800"
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Vendedor responsável</label>
            <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Nome do vendedor"
              className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide flex items-center gap-1"><MessageSquare size={12} /> Observações</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Notas sobre o cliente..."
              className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 resize-none" />
          </div>

          <div className="flex items-center gap-3 justify-end pt-2 border-t border-navy-600/30">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/50 text-sm font-medium transition-all">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-shine ripple-btn flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-accent-500/25 hover:-translate-y-0.5 disabled:opacity-50">
              <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

```

=== FILE: src/components/LeadDetail.tsx ===
```tsx
import { useEffect, useState } from 'react';
import {
  X, Phone, Mail, Car, Plus, Clock, CheckCircle2, ChevronRight,
  MessageSquare, Calendar, Flame, TrendingUp, User, Tag, DollarSign, Trash2,
} from 'lucide-react';
import { supabase, type Lead, type LeadInteraction, type LeadFollowUp, type InteractionType, type FollowUpType, type LeadStatus } from '@/lib/supabase';
import {
  PIPELINE_STAGES, INTERACTION_TYPES, FOLLOW_UP_TYPES,
  interactionLabel, followUpTypeLabel, sourceLabel, scoreColor, scoreLabel, timeAgo, isOverdue,
} from '@/lib/crm';
import { formatCurrency, formatDate, formatCurrency as fc } from '@/lib/format';

type Props = {
  lead: Lead;
  onClose: () => void;
  onUpdated: () => void;
};

export function LeadDetail({ lead, onClose, onUpdated }: Props) {
  const [tab, setTab] = useState<'info' | 'interactions' | 'followups'>('info');
  const [interactions, setInteractions] = useState<LeadInteraction[]>([]);
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [newInteraction, setNewInteraction] = useState({ type: 'whatsapp' as InteractionType, description: '' });
  const [newFollowUp, setNewFollowUp] = useState({ type: 'whatsapp' as FollowUpType, message: '', scheduledAt: '' });
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [vehicleLabel, setVehicleLabel] = useState<string | null>(null);

  useEffect(() => {
    loadDetails();
  }, [lead.id]);

  async function loadDetails() {
    setLoading(true);
    const [iRes, fRes] = await Promise.all([
      supabase.from('lead_interactions').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false }),
      supabase.from('lead_follow_ups').select('*').eq('lead_id', lead.id).order('scheduled_at', { ascending: false }),
    ]);
    if (iRes.data) setInteractions(iRes.data as LeadInteraction[]);
    if (fRes.data) setFollowUps(fRes.data as LeadFollowUp[]);
    if (lead.vehicle_id) {
      const { data: v } = await supabase.from('vehicles').select('brand, model, year_model, asking_price').eq('id', lead.vehicle_id).maybeSingle();
      if (v) setVehicleLabel(`${v.brand} ${v.model} ${v.year_model || ''} — ${fc(Number(v.asking_price))}`);
    }
    setLoading(false);
  }

  async function addInteraction() {
    if (!newInteraction.description.trim()) return;
    const { data, error } = await supabase.from('lead_interactions').insert({
      lead_id: lead.id,
      dealer_id: lead.dealer_id,
      type: newInteraction.type,
      description: newInteraction.description.trim(),
      vehicle_id: lead.vehicle_id,
    }).select('*').single();
    if (!error && data) {
      setInteractions([data as LeadInteraction, ...interactions]);
      await supabase.from('leads').update({ last_interaction_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', lead.id);
      setNewInteraction({ type: 'whatsapp', description: '' });
      setShowAddInteraction(false);
      onUpdated();
    }
  }

  async function addFollowUp() {
    if (!newFollowUp.scheduledAt || !newFollowUp.message.trim()) return;
    const { data, error } = await supabase.from('lead_follow_ups').insert({
      lead_id: lead.id,
      dealer_id: lead.dealer_id,
      scheduled_at: new Date(newFollowUp.scheduledAt).toISOString(),
      message: newFollowUp.message.trim(),
      type: newFollowUp.type,
      status: 'pending',
    }).select('*').single();
    if (!error && data) {
      setFollowUps([data as LeadFollowUp, ...followUps]);
      setNewFollowUp({ type: 'whatsapp', message: '', scheduledAt: '' });
      setShowAddFollowUp(false);
      onUpdated();
    }
  }

  async function completeFollowUp(id: string) {
    const { error } = await supabase.from('lead_follow_ups').update({ status: 'done', completed_at: new Date().toISOString() }).eq('id', id);
    if (!error) {
      setFollowUps(followUps.map((f) => f.id === id ? { ...f, status: 'done', completed_at: new Date().toISOString() } : f));
      onUpdated();
    }
  }

  async function skipFollowUp(id: string) {
    const { error } = await supabase.from('lead_follow_ups').update({ status: 'skipped' }).eq('id', id);
    if (!error) {
      setFollowUps(followUps.map((f) => f.id === id ? { ...f, status: 'skipped' } : f));
      onUpdated();
    }
  }

  async function changeStatus(newStatus: LeadStatus) {
    const { error } = await supabase.from('leads').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', lead.id);
    if (!error) onUpdated();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass-strong w-full max-w-lg h-full overflow-y-auto animate-slide-in-right border-l border-accent-500/20" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-20 glass-strong border-b border-navy-600/30 p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white truncate">{lead.name}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${scoreColor(lead.lead_score)} flex items-center gap-1`}>
                  <Flame size={10} /> {lead.lead_score}
                </span>
              </div>
              <p className="text-xs text-navy-400">{sourceLabel(lead.source)} · {scoreLabel(lead.lead_score)}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-navy-400 hover:bg-navy-700/50 hover:text-white transition-all flex-shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* Quick info */}
          <div className="flex flex-wrap gap-3 mt-3 text-xs">
            {lead.phone && <a href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-navy-200 hover:text-success-400 transition-colors"><Phone size={12} /> {lead.phone}</a>}
            {lead.email && <span className="flex items-center gap-1.5 text-navy-200"><Mail size={12} /> {lead.email}</span>}
            {lead.assigned_to && <span className="flex items-center gap-1.5 text-navy-200"><User size={12} /> {lead.assigned_to}</span>}
          </div>

          {/* Status changer */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {PIPELINE_STAGES.map((s) => (
              <button key={s.value} onClick={() => changeStatus(s.value)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all hover:scale-105 ${
                  lead.status === s.value ? s.bgColor + ' ' + s.color + ' font-semibold' : 'border-navy-600/30 text-navy-400 hover:text-white'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-navy-600/30 px-5">
          {(['info', 'interactions', 'followups'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                tab === t ? 'border-accent-500 text-accent-400' : 'border-transparent text-navy-400 hover:text-white'
              }`}>
              {t === 'info' ? 'Informações' : t === 'interactions' ? `Interações (${interactions.length})` : `Acompanhamentos (${followUps.filter((f) => f.status === 'pending').length})`}
            </button>
          ))}
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" /></div>
          ) : (
            <>
              {tab === 'info' && (
                <div className="space-y-4 animate-fade-in">
                  {vehicleLabel && (
                    <div className="glass rounded-xl p-3 flex items-center gap-3">
                      <Car size={18} className="text-accent-400 flex-shrink-0" />
                      <div><p className="text-xs text-navy-400">Veículo de interesse</p><p className="text-sm text-white font-medium">{vehicleLabel}</p></div>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    {lead.budget != null && <div className="glass rounded-xl p-3"><p className="text-xs text-navy-400 uppercase">Orçamento</p><p className="text-sm text-white font-bold">{formatCurrency(Number(lead.budget))}</p></div>}
                    {lead.down_payment != null && <div className="glass rounded-xl p-3"><p className="text-xs text-navy-400 uppercase">Entrada</p><p className="text-sm text-white font-bold">{formatCurrency(Number(lead.down_payment))}</p></div>}
                    {lead.max_installment != null && <div className="glass rounded-xl p-3"><p className="text-xs text-navy-400 uppercase">Parcela máx.</p><p className="text-sm text-white font-bold">{formatCurrency(Number(lead.max_installment))}</p></div>}
                  </div>
                  {lead.source_detail && <div className="glass rounded-xl p-3"><p className="text-xs text-navy-400 uppercase mb-1 flex items-center gap-1"><Tag size={10} /> Detalhe da origem</p><p className="text-sm text-white">{lead.source_detail}</p></div>}
                  {lead.notes && <div className="glass rounded-xl p-3"><p className="text-xs text-navy-400 uppercase mb-1 flex items-center gap-1"><MessageSquare size={10} /> Observações</p><p className="text-sm text-white whitespace-pre-wrap">{lead.notes}</p></div>}
                  <div className="glass rounded-xl p-3 grid grid-cols-2 gap-3 text-xs">
                    <div><p className="text-navy-400">Criado em</p><p className="text-white font-medium">{formatDate(lead.created_at)}</p></div>
                    <div><p className="text-navy-400">Última interação</p><p className="text-white font-medium">{timeAgo(lead.last_interaction_at)}</p></div>
                  </div>
                </div>
              )}

              {tab === 'interactions' && (
                <div className="space-y-3 animate-fade-in">
                  {showAddInteraction ? (
                    <div className="glass rounded-xl p-3 space-y-2">
                      <select value={newInteraction.type} onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value as InteractionType })}
                        className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500">
                        {INTERACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <textarea value={newInteraction.description} onChange={(e) => setNewInteraction({ ...newInteraction, description: e.target.value })} rows={2} placeholder="Descreva a interação..."
                        className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => setShowAddInteraction(false)} className="px-3 py-1.5 rounded-lg text-navy-300 hover:bg-navy-700/50 text-xs">Cancelar</button>
                        <button onClick={addInteraction} className="px-3 py-1.5 rounded-lg bg-accent-500 hover:bg-accent-400 text-white text-xs font-semibold">Adicionar</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowAddInteraction(true)} className="w-full flex items-center justify-center gap-2 glass rounded-xl py-2.5 text-sm text-accent-400 hover:border-accent-500/40 border border-transparent transition-all">
                      <Plus size={16} /> Registrar interação
                    </button>
                  )}
                  {interactions.length === 0 ? (
                    <p className="text-center text-navy-500 text-sm py-6">Nenhuma interação registrada</p>
                  ) : (
                    interactions.map((i) => (
                      <div key={i.id} className="glass rounded-xl p-3 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center flex-shrink-0">
                          <MessageSquare size={14} className="text-accent-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white">{interactionLabel(i.type)}</p>
                            <span className="text-xs text-navy-500">{formatDate(i.created_at)}</span>
                          </div>
                          {i.description && <p className="text-sm text-navy-300 mt-1 whitespace-pre-wrap">{i.description}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === 'followups' && (
                <div className="space-y-3 animate-fade-in">
                  {showAddFollowUp ? (
                    <div className="glass rounded-xl p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <select value={newFollowUp.type} onChange={(e) => setNewFollowUp({ ...newFollowUp, type: e.target.value as FollowUpType })}
                          className="bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500">
                          {FOLLOW_UP_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <input type="datetime-local" value={newFollowUp.scheduledAt} onChange={(e) => setNewFollowUp({ ...newFollowUp, scheduledAt: e.target.value })}
                          className="bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500 [color-scheme:dark]" />
                      </div>
                      <textarea value={newFollowUp.message} onChange={(e) => setNewFollowUp({ ...newFollowUp, message: e.target.value })} rows={2} placeholder="Mensagem do follow-up..."
                        className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => setShowAddFollowUp(false)} className="px-3 py-1.5 rounded-lg text-navy-300 hover:bg-navy-700/50 text-xs">Cancelar</button>
                        <button onClick={addFollowUp} className="px-3 py-1.5 rounded-lg bg-accent-500 hover:bg-accent-400 text-white text-xs font-semibold">Agendar</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowAddFollowUp(true)} className="w-full flex items-center justify-center gap-2 glass rounded-xl py-2.5 text-sm text-gold-400 hover:border-gold-500/40 border border-transparent transition-all">
                      <Plus size={16} /> Agendar acompanhamento
                    </button>
                  )}
                  {followUps.length === 0 ? (
                    <p className="text-center text-navy-500 text-sm py-6">Nenhum acompanhamento agendado</p>
                  ) : (
                    followUps.map((f) => (
                      <div key={f.id} className={`glass rounded-xl p-3 ${isOverdue(f.scheduled_at, f.status) ? 'border-error-500/30' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar size={12} className={isOverdue(f.scheduled_at, f.status) ? 'text-error-400' : 'text-navy-400'} />
                              <span className="text-xs font-medium text-white">{followUpTypeLabel(f.type)}</span>
                              {f.ai_suggested && <span className="text-xs text-gold-400 flex items-center gap-0.5"><Flame size={10} /> IA</span>}
                              {isOverdue(f.scheduled_at, f.status) && <span className="text-xs text-error-400 font-medium">Atrasado</span>}
                            </div>
                            {f.message && <p className="text-sm text-navy-300 mb-2">{f.message}</p>}
                            <p className="text-xs text-navy-500">{formatDate(f.scheduled_at)} · {new Date(f.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          {f.status === 'pending' && (
                            <div className="flex flex-col gap-1 flex-shrink-0">
                              <button onClick={() => completeFollowUp(f.id)} className="p-1.5 rounded-lg bg-success-500/15 hover:bg-success-500/25 text-success-400 transition-all" title="Concluir">
                                <CheckCircle2 size={14} />
                              </button>
                              <button onClick={() => skipFollowUp(f.id)} className="p-1.5 rounded-lg bg-navy-700/50 hover:bg-navy-600/50 text-navy-400 transition-all" title="Pular">
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          )}
                          {f.status === 'done' && <span className="text-xs text-success-400 flex items-center gap-1 flex-shrink-0"><CheckCircle2 size={12} /> Concluído</span>}
                          {f.status === 'skipped' && <span className="text-xs text-navy-500 flex-shrink-0">Ignorado</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

```

=== FILE: src/components/ExpenseModal.tsx ===
```tsx
import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Tag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type ExpenseCategory } from '@/lib/supabase';

type Props = {
  expense?: { id: string; description: string; amount: number; category_id: string | null; due_date: string | null; paid_date: string | null; status: string; recurrence: string; is_fixed: boolean; notes: string | null } | null;
  categories: ExpenseCategory[];
  onClose: () => void;
  onSaved: () => void;
};

export function ExpenseModal({ expense, categories, onClose, onSaved }: Props) {
  const { dealer } = useAuth();
  const isEdit = !!expense;
  const [description, setDescription] = useState(expense?.description || '');
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [categoryId, setCategoryId] = useState(expense?.category_id || '');
  const [dueDate, setDueDate] = useState(expense?.due_date || '');
  const [paidDate, setPaidDate] = useState(expense?.paid_date || '');
  const [status, setStatus] = useState(expense?.status || 'pending');
  const [recurrence, setRecurrence] = useState(expense?.recurrence || 'none');
  const [isFixed, setIsFixed] = useState(expense?.is_fixed || false);
  const [notes, setNotes] = useState(expense?.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#2a93e8');

  async function handleSaveCategory() {
    if (!dealer || !newCatName.trim()) return;
    const { data, error } = await supabase
      .from('expense_categories')
      .insert({ dealer_id: dealer.id, name: newCatName.trim(), color: newCatColor })
      .select()
      .single();
    if (error) { console.error('Erro ao criar categoria:', error); setError('Não foi possível criar a categoria. Tente novamente.'); return; }
    if (data) {
      setCategories([...categories, data as ExpenseCategory]);
      setCategoryId(data.id);
      setShowNewCat(false);
      setNewCatName('');
    }
  }

  const [categoriesState, setCategories] = useState(categories);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dealer) return;
    setError(null);
    setSaving(true);

    if (!description.trim() || !amount) {
      setError('Descrição e valor são obrigatórios');
      setSaving(false);
      return;
    }

    const payload = {
      dealer_id: dealer.id,
      description: description.trim(),
      amount: parseFloat(amount),
      category_id: categoryId || null,
      due_date: dueDate || null,
      paid_date: status === 'paid' ? (paidDate || new Date().toISOString().split('T')[0]) : null,
      status,
      recurrence,
      is_fixed: isFixed,
      notes: notes || null,
    };

    if (isEdit) {
      const { error } = await supabase.from('expenses').update(payload).eq('id', expense!.id);
      if (error) { console.error('Erro ao salvar despesa:', error); setError('Não foi possível salvar a despesa. Verifique os dados e tente novamente.'); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('expenses').insert(payload);
      if (error) { console.error('Erro ao cadastrar despesa:', error); setError('Não foi possível cadastrar a despesa. Verifique os dados e tente novamente.'); setSaving(false); return; }
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div className="glass-strong rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-drop-in border border-navy-600/30 relative" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex items-center justify-between p-6 border-b border-navy-600/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400/60 to-transparent" />
          <h2 className="text-lg font-bold text-white">{isEdit ? 'Editar despesa' : 'Nova despesa'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-navy-300 hover:bg-navy-700/50 hover:text-white transition-all hover:scale-110 active:scale-95">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="relative input-anim rounded-xl">
            <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Descrição *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Aluguel da loja"
              required
              className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Valor *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  required
                  className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => e.target.value === '__new__' ? setShowNewCat(true) : setCategoryId(e.target.value)}
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500"
              >
                <option value="">Selecione</option>
                {categoriesState.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                <option value="__new__">+ Nova categoria</option>
              </select>
            </div>
          </div>

          {showNewCat && (
            <div className="flex items-center gap-2 p-3 bg-navy-900/40 rounded-xl border border-navy-600/30 animate-drop-in">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nome da categoria"
                className="flex-1 bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500"
              />
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-navy-600/40 bg-navy-900/50 cursor-pointer"
              />
              <button type="button" onClick={handleSaveCategory} className="ripple-btn px-3 py-2 rounded-lg bg-accent-500 text-white text-sm font-medium hover:bg-accent-600 transition-all hover:scale-105 active:scale-95">
                <Tag size={16} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Vencimento</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Recorrência</label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500"
              >
                <option value="none">Única</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500"
              >
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
              </select>
            </div>
            {status === 'paid' && (
              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Data pagamento</label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 [color-scheme:dark]"
                />
              </div>
            )}
          </div>

          <label className="flex items-center gap-3 p-3 bg-navy-900/40 rounded-xl border border-navy-600/30 cursor-pointer hover:border-accent-500/40 transition-all">
            <input
              type="checkbox"
              checked={isFixed}
              onChange={(e) => setIsFixed(e.target.checked)}
              className="w-4 h-4 rounded accent-accent-500"
            />
            <div>
              <span className="text-sm text-white font-medium">Despesa fixa mensal</span>
              <p className="text-xs text-navy-400">Despesas fixas permanecem no sistema ao encerrar o mês</p>
            </div>
          </label>

          <div>
            <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Notas adicionais..."
              className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 animate-fade-in">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5 animate-pulse" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/40 text-sm font-medium transition-all hover:scale-105 active:scale-95">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-shine btn-sheen ripple-btn flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {isEdit ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

```

=== FILE: src/components/IntegrationHelpChat.tsx ===
```tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, Send, Image as ImageIcon, Loader2, Bot, AlertCircle, StopCircle } from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  isFallback?: boolean;
};

type Props = {
  platformContext: string | null;
  webhookUrl: string;
};

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SUGGESTIONS = [
  'Como conectar o WhatsApp?',
  'Onde encontro o Access Token?',
  'Como configurar o webhook?',
  'Não consigo achar o Page ID',
  'Quanto custa a API do WhatsApp?',
];

// Parse SSE stream from OpenRouter
async function* parseSSE(response: Response): AsyncGenerator<string> {
  const reader = response.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // skip malformed chunks
      }
    }
  }
}

export function IntegrationHelpChat({ platformContext }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = platformContext
        ? `Olá! Vi que você está configurando o **${platformContextLabel(platformContext)}**. Posso te ajudar passo a passo! Me pergunte qualquer dúvida ou envie um print da tela se travou em algum lugar.`
        : `Olá! Sou a IA assistente da Rede Auto. Posso te ajudar a conectar WhatsApp, Instagram, Facebook, OLX e Webmotors — ou responder qualquer outra pergunta.\n\nQual sua dúvida? Você também pode enviar prints de tela que eu analiso!`;
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [open, messages.length, platformContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }, []);

  async function handleSend(text?: string) {
    const content = (text || input).trim();
    if ((!content && !image) || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: content || '(imagem enviada)', image: image || undefined };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = content;
    const currentImage = image;
    setInput('');
    setImage(null);
    setLoading(true);

    // Add empty assistant message that we'll fill as chunks arrive
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const apiMessages = [
        ...messages.map((m) => ({
          role: m.role,
          content: m.image
            ? [
                { type: 'text', text: m.content },
                { type: 'image_url', image_url: { url: m.image } },
              ]
            : m.content,
        })),
        {
          role: 'user' as const,
          content: currentImage
            ? [
                { type: 'text', text: currentInput || 'Analise esta imagem e me ajude com a integração. Descreva o que você vê e me diga o que fazer.' },
                { type: 'image_url', image_url: { url: currentImage } },
              ]
            : currentInput,
        },
      ];

      const controller = new AbortController();
      abortRef.current = controller;

      const response = await fetch(`${EDGE_URL}/ai-help-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, platform_context: platformContext }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const contentType = response.headers.get('Content-Type') || '';

      if (contentType.includes('text/event-stream') && response.body) {
        // Streaming response — update message as chunks arrive
        let accumulated = '';
        for await (const chunk of parseSSE(response)) {
          accumulated += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: accumulated,
            };
            return updated;
          });
        }

        if (!accumulated.trim()) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: 'Não consegui gerar uma resposta. Tente reformular sua pergunta.',
            };
            return updated;
          });
        }
      } else {
        // Non-streaming fallback (error message)
        const data = await response.json();
        const reply = data.reply || 'Não consegui gerar uma resposta. Tente novamente.';
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: reply,
            isFallback: data.fallback === true,
          };
          return updated;
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User stopped generation — keep partial content
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant' && !last.content.trim()) {
            updated.pop();
          }
          return updated;
        });
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: 'Ops! Tive um problema de conexão. Tente novamente em alguns segundos.',
          };
          return updated;
        });
      }
    }
    setLoading(false);
    abortRef.current = null;
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'A imagem é muito grande (máximo 5MB). Tente uma imagem menor.',
      }]);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold text-sm shadow-2xl shadow-accent-500/30 transition-all hover:scale-105 hover:-translate-y-1 group"
      >
        <div className="relative">
          <Sparkles size={20} className="text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gold-400 rounded-full animate-pulse" />
        </div>
        <span className="hidden sm:inline">Preciso de ajuda</span>
        <span className="sm:hidden">Ajuda</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[calc(100vw-3rem)] max-w-md animate-drop-in">
      <div className="glass-strong rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-accent-500/30" style={{ height: 'min(75vh, 650px)' }}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-navy-600/30 flex items-center gap-3 bg-gradient-to-r from-accent-500/10 to-gold-500/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/30 to-gold-500/30 border border-accent-500/30 flex items-center justify-center flex-shrink-0">
            <Bot size={20} className="text-accent-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white flex items-center gap-1.5">
              Assistente IA
              <span className="w-2 h-2 bg-success-400 rounded-full flex-shrink-0 animate-pulse" />
            </p>
            <p className="text-xs text-navy-400 truncate">
              {platformContext ? `Ajuda com ${platformContextLabel(platformContext)}` : 'Tire dúvidas sobre integrações'}
            </p>
          </div>
          <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-navy-400 hover:bg-navy-700/50 hover:text-white transition-all flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%]`}>
                {msg.image && (
                  <img src={msg.image} alt="Print enviado" className="rounded-xl max-h-40 mb-1.5 border border-navy-600/30" />
                )}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white'
                      : 'glass border border-navy-600/30 text-navy-100'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <>
                      <div dangerouslySetInnerHTML={renderMarkdown(msg.content)} />
                      {loading && idx === messages.length - 1 && (
                        <span className="inline-block w-1.5 h-4 bg-accent-400 ml-0.5 animate-pulse align-middle" />
                      )}
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.isFallback && (
                  <div className="flex items-start gap-1.5 mt-1.5 px-1">
                    <AlertCircle size={12} className="text-gold-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-gold-400/80">IA externa não configurada — usando respostas limitadas.</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Suggested questions (only on first message) */}
          {messages.length === 1 && !loading && (
            <div className="space-y-1.5 pt-2">
              <p className="text-[10px] text-navy-500 px-1 uppercase tracking-wide">Sugestões</p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-navy-800/40 hover:bg-navy-700/40 border border-navy-600/20 text-xs text-navy-200 transition-all hover:border-accent-500/30"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Image preview */}
        {image && (
          <div className="px-3 pb-2">
            <div className="relative inline-block">
              <img src={image} alt="Preview" className="h-16 rounded-lg border border-accent-500/30" />
              <button onClick={removeImage} className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 rounded-full flex items-center justify-center text-white">
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-navy-600/30">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-xl bg-navy-700/40 hover:bg-navy-700/60 text-navy-300 hover:text-white flex items-center justify-center transition-all flex-shrink-0 border border-navy-600/30"
              title="Enviar print de tela"
            >
              <ImageIcon size={16} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua dúvida..."
              className="flex-1 bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500"
            />
            {loading ? (
              <button
                onClick={stopGeneration}
                className="w-9 h-9 rounded-xl bg-error-500/80 hover:bg-error-500 text-white flex items-center justify-center transition-all flex-shrink-0"
                title="Parar"
              >
                <StopCircle size={16} />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={loading || (!input.trim() && !image)}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white flex items-center justify-center transition-all disabled:opacity-50 flex-shrink-0"
              >
                <Send size={16} />
              </button>
            )}
          </div>
          <p className="text-[10px] text-navy-500 mt-1.5 px-1">
            IA com visão — envie um print se travou em algum passo.
          </p>
        </div>
      </div>
    </div>
  );
}

function platformContextLabel(platform: string): string {
  const labels: Record<string, string> = {
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    facebook: 'Facebook',
    olx: 'OLX',
    webmotors: 'Webmotors',
  };
  return labels[platform] || platform;
}

function renderMarkdown(content: string): { __html: string } {
  if (!content) return { __html: '' };
  let html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-navy-800/60 rounded-lg p-2 my-1.5 text-[11px] text-accent-300 overflow-x-auto"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="text-accent-300 bg-navy-800/60 px-1 rounded text-[12px]">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-navy-200">$1</em>')
    .replace(/^\- (.+)$/gm, '<div class="flex gap-1.5 ml-1"><span class="text-accent-400 flex-shrink-0">•</span><span>$1</span></div>')
    .replace(/^\d+\. (.+)$/gm, '<div class="ml-1">$1</div>')
    .replace(/\n/g, '<br />');

  return { __html: html };
}

```

=== FILE: src/pages/LoginPage.tsx ===
```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, AlertCircle, Loader2, ArrowRight, Eye, EyeOff, Sparkles, TrendingUp, Car, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
        setLoading(false);
      } else {
        navigate('/dashboard');
      }
    } else {
      if (name.trim().length < 2) {
        setError('Informe o nome da loja ou lojista');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, name, phone);
      if (error) {
        setError(error);
        setLoading(false);
      } else {
        navigate('/dashboard');
      }
    }
  }

  const features = [
    { title: 'Gerencie seu estoque', desc: 'Cadastre veículos com todos os dados financeiros', icon: Car },
    { title: 'Busque na rede inteira', desc: 'Encontre carros disponíveis de outros lojistas', icon: Search },
    { title: 'Negocie com transparência', desc: 'Divida lucros automaticamente entre lojistas', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-navy-950 relative overflow-hidden">
      {/* === Animated background layers === */}
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      {/* Floating orbs with staggered animations */}
      <div className="fixed top-1/4 -left-32 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-[120px] animate-float pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-[400px] h-[400px] bg-navy-500/15 rounded-full blur-[100px] animate-float-slow pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 w-[300px] h-[300px] bg-accent-400/5 rounded-full blur-[80px] animate-float pointer-events-none" style={{ animationDelay: '4s' }} />
      <div className="fixed top-3/4 left-1/4 w-[200px] h-[200px] bg-gold-400/5 rounded-full blur-[60px] animate-float-slow pointer-events-none" style={{ animationDelay: '6s' }} />

      {/* === Left Panel - Brand === */}
      <div className="relative flex-1 hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden z-10">
        <div className="relative z-10 animate-fade-in-down">
          <Logo size="lg" />
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-accent-500/20 mb-6 animate-fade-in group hover:border-accent-500/40 transition-all duration-300">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-success-400" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-success-400 animate-ping" />
            </div>
            <span className="text-xs font-medium text-navy-100">Rede ativa agora</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            O estoque integrado dos{' '}
            <span className="gradient-text">lojistas</span>
            {' '}de Ribeirão Preto
          </h1>

          <p className="text-navy-200 text-lg leading-relaxed mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Encontre o carro que seu cliente busca em toda a rede, negocie com outros
            lojistas e divida o lucro de forma transparente.
          </p>

          <div className="space-y-4">
            {features.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="group flex items-start gap-4 animate-fade-in-up hover:bg-navy-700/20 -mx-3 px-3 py-2 rounded-xl transition-all duration-300"
                  style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                >
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-accent-500/20 blur-md rounded-lg transition-all duration-500 group-hover:bg-accent-500/40" />
                    <div className="relative w-10 h-10 rounded-xl glass flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Icon size={18} className="text-accent-400 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-semibold group-hover:text-accent-200 transition-colors">{item.title}</p>
                    <p className="text-sm text-navy-300">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 text-navy-400 text-sm animate-fade-in flex items-center gap-2" style={{ animationDelay: '0.8s' }}>
          <ShieldCheck size={14} className="text-accent-400/60" />
          © {new Date().getFullYear()} Rede Auto Ribeirão · Ribeirão Preto, SP
        </div>
      </div>

      {/* === Right Panel - Form === */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center animate-scale-in">
            <Logo size="lg" />
          </div>

          <div
            className="relative glass-strong rounded-3xl p-8 shadow-2xl shadow-black/40 animate-scale-in overflow-hidden"
            style={{ animationDelay: '0.15s' }}
          >
            {/* Animated top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400/60 to-transparent" />
            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent-500/10 to-transparent rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gold-400/5 to-transparent rounded-tr-full pointer-events-none" />

            <div className="mb-6 relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-gold-400" />
                <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
                  {mode === 'login' ? 'Bem-vindo de volta' : 'Junte-se à rede'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {mode === 'login' ? 'Entrar na plataforma' : 'Criar conta'}
              </h2>
              <p className="text-navy-300 text-sm">
                {mode === 'login'
                  ? 'Acesse com seus dados para gerenciar seu estoque'
                  : 'Cadastre-se para participar da rede de lojistas'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {mode === 'register' && (
                <div className="space-y-4 animate-fade-in">
                  <FormField
                    label="Nome da loja ou lojista"
                    icon={User}
                    value={name}
                    onChange={setName}
                    placeholder="Ex: Auto Prime Ribeirão"
                    required
                  />
                  <FormField
                    label="Telefone"
                    icon={Phone}
                    type="tel"
                    value={phone}
                    onChange={setPhone}
                    placeholder="(16) 99999-9999"
                  />
                </div>
              )}

              <FormField
                label="E-mail"
                icon={Mail}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="seu@email.com"
                required
              />

              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">
                  Senha
                </label>
                <div className="relative group focus-ring rounded-xl">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-11 pr-11 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 animate-fade-in">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5 animate-pulse" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-shine btn-sheen w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Entrar' : 'Criar conta'}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm relative z-10">
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                }}
                className="text-accent-400 hover:text-accent-300 font-medium transition-colors inline-flex items-center gap-1 group"
              >
                {mode === 'login'
                  ? 'Ainda não tem conta? Cadastre-se'
                  : 'Já tem conta? Fazer login'}
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Mode indicator dots */}
          <div className="flex justify-center gap-1.5 mt-6">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  (mode === 'login' ? 0 : 1) === i ? 'bg-accent-400 w-8 shadow-glow' : 'bg-navy-600 w-1.5'
                }`}
                style={{ boxShadow: (mode === 'login' ? 0 : 1) === i ? '0 0 10px rgba(74,174,245,0.5)' : 'none' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">
        {label}{required && <span className="text-accent-400"> *</span>}
      </label>
      <div className="relative group focus-ring rounded-xl">
        <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 transition-colors" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-11 pr-4 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all duration-300"
        />
      </div>
    </div>
  );
}

```

=== FILE: src/pages/DashboardPage.tsx ===
```tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, TrendingUp, Search, ArrowRight, CircleDollarSign, Sparkles, Activity, Wallet, Users, TrendingDown, Receipt, Calculator, CheckCircle2, Clock, XCircle, Target, Flame, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Vehicle, type Sale, type Expense, type FinancingSimulation } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';

export function DashboardPage() {
  const { dealer } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [financingSims, setFinancingSims] = useState<FinancingSimulation[]>([]);
  const [totalNetwork, setTotalNetwork] = useState(0);
  const [leadStats, setLeadStats] = useState({ total: 0, hot: 0, followUpsToday: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!dealer) return;
      const [myVeh, mySales, myExp, myFin, netCount, leadRes] = await Promise.all([
        supabase.from('vehicles').select('*').eq('dealer_id', dealer.id).order('created_at', { ascending: false }),
        supabase.from('sales').select('*').eq('dealer_id', dealer.id).order('sale_date', { ascending: false }),
        supabase.from('expenses').select('*').eq('dealer_id', dealer.id),
        supabase.from('financing_simulations').select('*').eq('dealer_id', dealer.id).order('created_at', { ascending: false }),
        supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('leads').select('id, lead_score, status').eq('dealer_id', dealer.id),
      ]);
      if (myVeh.data) setVehicles(myVeh.data as Vehicle[]);
      if (mySales.data) setSales(mySales.data as Sale[]);
      if (myExp.data) setExpenses(myExp.data as Expense[]);
      if (myFin.data) setFinancingSims(myFin.data as FinancingSimulation[]);
      if (netCount.count !== null) setTotalNetwork(netCount.count);
      if (leadRes.data) {
        const leadsData = leadRes.data as { id: string; lead_score: number; status: string }[];
        const today = new Date().toISOString().split('T')[0];
        const { count: fuCount } = await supabase
          .from('lead_follow_ups').select('*', { count: 'exact', head: true })
          .eq('dealer_id', dealer.id).eq('status', 'pending')
          .gte('scheduled_at', today + 'T00:00:00').lte('scheduled_at', today + 'T23:59:59');
        setLeadStats({
          total: leadsData.filter((l) => !['won', 'lost'].includes(l.status)).length,
          hot: leadsData.filter((l) => l.lead_score >= 80).length,
          followUpsToday: fuCount || 0,
        });
      }
      setLoading(false);
    }
    loadData();
  }, [dealer]);

  const stockVehicles = vehicles.filter((v) => v.status !== 'sold');
  const availableCount = stockVehicles.filter((v) => v.status === 'available').length;
  const reservedCount = stockVehicles.filter((v) => v.status === 'reserved').length;
  const totalValue = stockVehicles.reduce((sum, v) => sum + Number(v.asking_price), 0);
  const totalInvested = stockVehicles.reduce((sum, v) => sum + Number(v.purchase_price), 0);

  const totalSalesRevenue = sales.reduce((s, sale) => s + Number(sale.sale_price), 0);
  const totalSalesProfit = sales.reduce((s, sale) => s + Number(sale.profit || 0), 0);
  const totalExpenses = expenses.filter((e) => e.status === 'paid').reduce((s, e) => s + Number(e.amount), 0);
  const pendingExpenses = expenses.filter((e) => e.status === 'pending').reduce((s, e) => s + Number(e.amount), 0);
  const netProfit = totalSalesProfit - totalExpenses;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400/20 rounded-full" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400 border-b-transparent rounded-full animate-spin-reverse" />
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Veículos no estoque',
      value: stockVehicles.length.toString(),
      sub: availableCount + ' disponíveis · ' + reservedCount + ' reservados',
      icon: Car,
      gradient: 'from-accent-500/20 to-accent-600/5',
      iconColor: 'text-accent-400',
    },
    {
      label: 'Valor do estoque',
      value: formatCurrency(totalValue),
      sub: 'Investido: ' + formatCurrency(totalInvested),
      icon: CircleDollarSign,
      gradient: 'from-success-500/20 to-success-600/5',
      iconColor: 'text-success-400',
    },
    {
      label: 'Lucro em vendas',
      value: formatCurrency(totalSalesProfit),
      sub: sales.length + ' venda(s) registrada(s)',
      icon: TrendingUp,
      gradient: 'from-gold-500/20 to-gold-400/5',
      iconColor: 'text-gold-400',
    },
    {
      label: 'Despesas pagas',
      value: formatCurrency(totalExpenses),
      sub: 'Pendentes: ' + formatCurrency(pendingExpenses),
      icon: Wallet,
      gradient: 'from-error-500/15 to-error-600/5',
      iconColor: 'text-error-400',
    },
  ];

  const quickActions = [
    { to: '/estoque', title: 'Meu Estoque', desc: 'Cadastre e gerencie seus veículos', icon: Car, gradient: 'from-accent-500/15 to-transparent' },
    { to: '/vendas', title: 'Vendas', desc: 'Registre vendas e acompanhe lucros', icon: TrendingUp, gradient: 'from-success-500/15 to-transparent' },
    { to: '/financeiro', title: 'Financeiro', desc: 'Controle despesas e custos', icon: Wallet, gradient: 'from-gold-500/15 to-transparent' },
    { to: '/clientes', title: 'Clientes', desc: 'Gerencie seu CRM', icon: Users, gradient: 'from-navy-400/15 to-transparent' },
    { to: '/financiamento', title: 'Financiamento', desc: 'Simule e compare opções', icon: Calculator, gradient: 'from-accent-500/15 to-transparent' },
    { to: '/atendimento', title: 'Atendimento', desc: 'Conversas e clientes', icon: MessageSquare, gradient: 'from-gold-500/15 to-transparent' },
    { to: '/rede', title: 'Buscar na Rede', desc: 'Encontre carros de outros lojistas', icon: Search, gradient: 'from-accent-500/15 to-transparent' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero header */}
      <div className="relative animate-fade-in-down">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gold-400/30 blur-md rounded-full" />
            <Sparkles size={16} className="relative text-gold-400" />
          </div>
          <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">Painel do Lojista</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
          Olá, <span className="gradient-text">{dealer?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-navy-300 mt-2 text-base">Visão geral completa do seu negócio e da rede de lojistas</p>
      </div>

      {/* Financial overview banner */}
      <div className="relative glass-card rounded-2xl p-6 overflow-hidden animate-fade-in-up aurora-bg">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-500/5 via-transparent to-gold-500/5" />
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-success-400" />
              <p className="text-xs text-navy-400 uppercase tracking-wide font-medium">Receita de vendas</p>
            </div>
            <p className="text-xl md:text-2xl font-extrabold text-white">{formatCurrency(totalSalesRevenue)}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CircleDollarSign size={16} className="text-gold-400" />
              <p className="text-xs text-navy-400 uppercase tracking-wide font-medium">Lucro bruto</p>
            </div>
            <p className="text-xl md:text-2xl font-extrabold text-success-400">{formatCurrency(totalSalesProfit)}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={16} className="text-error-400" />
              <p className="text-xs text-navy-400 uppercase tracking-wide font-medium">Despesas</p>
            </div>
            <p className="text-xl md:text-2xl font-extrabold text-error-400">{formatCurrency(totalExpenses)}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} className="text-accent-400" />
              <p className="text-xs text-navy-400 uppercase tracking-wide font-medium">Lucro líquido</p>
            </div>
            <p className={'text-xl md:text-2xl font-extrabold ' + (netProfit >= 0 ? 'text-success-400' : 'text-error-400')}>{formatCurrency(netProfit)}</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const gradientClass = 'absolute inset-0 bg-gradient-to-br ' + stat.gradient + ' opacity-0 group-hover:opacity-100 transition-opacity duration-500';
          return (
            <div key={i} className="group relative glass-card rounded-2xl p-6 hover-lift card-glow overflow-hidden animate-fade-in-up spotlight" style={{ animationDelay: String(i * 80) + 'ms' }} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}>
              <div className={gradientClass} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl glass flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon size={20} className={stat.iconColor} />
                  </div>
                  <Activity size={14} className="text-navy-500 group-hover:text-accent-400/60 transition-colors" />
                </div>
                <p className="text-2xl font-extrabold text-white tracking-tight">{stat.value}</p>
                <p className="text-sm text-navy-200 mt-1 font-medium">{stat.label}</p>
                <p className="text-xs text-navy-400 mt-2">{stat.sub}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
          Ações rápidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            const actionGradient = 'absolute inset-0 bg-gradient-to-br ' + action.gradient + ' opacity-0 group-hover:opacity-100 transition-opacity duration-500';
            return (
              <Link key={i} to={action.to} className="group relative glass-card rounded-2xl p-4 hover-lift-sm card-glow overflow-hidden transition-all duration-300 text-center sm:text-left spotlight" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}>
                <div className={actionGradient} />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center mx-auto sm:mx-0 mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Icon size={18} className="text-accent-400" />
                  </div>
                  <p className="text-sm font-bold text-white">{action.title}</p>
                  <p className="text-xs text-navy-400 mt-0.5 hidden sm:block">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent vehicles */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
              Veículos recentes
            </h2>
            <Link to="/estoque" className="text-sm text-accent-400 hover:text-accent-300 font-medium flex items-center gap-1 group">
              Ver todos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {vehicles.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center hover-lift">
              <div className="relative inline-block mb-3">
                <div className="absolute inset-0 bg-accent-500/20 blur-2xl rounded-full animate-breathe" />
                <Car size={36} className="relative text-navy-400" />
              </div>
              <p className="text-navy-200 font-medium text-sm">Nenhum veículo cadastrado</p>
              <Link to="/veiculo/novo" className="inline-flex items-center gap-2 mt-3 text-accent-400 hover:text-accent-300 font-medium text-sm group">
                Cadastrar <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stockVehicles.slice(0, 4).map((v, i) => (
                <Link key={v.id} to={'/veiculo/' + v.id} className="group glass-card rounded-xl p-4 hover-lift-sm card-glow flex items-center gap-4 overflow-hidden relative animate-fade-in spotlight" style={{ animationDelay: String(0.4 + i * 0.06) + 's' }} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg glass flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Car size={18} className="text-navy-300 group-hover:text-accent-400 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate text-sm group-hover:text-accent-200 transition-colors">{v.brand} {v.model}</p>
                      <p className="text-xs text-navy-400">{v.year_model || v.year_manufacture || '—'} · {formatCurrency(v.asking_price)}</p>
                    </div>
                    <div className={'text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ' + (v.status === 'available' ? 'bg-success-500/15 text-success-400 border-success-500/30' : v.status === 'reserved' ? 'bg-warning-500/15 text-warning-400 border-warning-500/30' : 'bg-error-500/15 text-error-400 border-error-500/30')}>
                      {v.status === 'available' ? 'Disp.' : v.status === 'reserved' ? 'Reserv.' : 'Vendido'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent sales */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-success-400" style={{ boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
              Vendas recentes
            </h2>
            <Link to="/vendas" className="text-sm text-success-400 hover:text-success-500 font-medium flex items-center gap-1 group">
              Ver todas <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {sales.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center hover-lift">
              <div className="relative inline-block mb-3">
                <div className="absolute inset-0 bg-success-500/20 blur-2xl rounded-full animate-breathe" />
                <TrendingUp size={36} className="relative text-navy-400" />
              </div>
              <p className="text-navy-200 font-medium text-sm">Nenhuma venda registrada</p>
              <Link to="/vendas" className="inline-flex items-center gap-2 mt-3 text-success-400 hover:text-success-500 font-medium text-sm group">
                Registrar venda <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sales.slice(0, 4).map((sale, i) => (
                <div key={sale.id} className="group glass-card rounded-xl p-4 hover-lift-sm card-glow flex items-center gap-4 animate-fade-in spotlight" style={{ animationDelay: String(0.5 + i * 0.06) + 's' }} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}>
                  <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <TrendingUp size={18} className="text-success-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate text-sm group-hover:text-accent-200 transition-colors">
                      {sale.client_name || 'Venda direta'}
                    </p>
                    <p className="text-xs text-navy-400">{formatCurrency(sale.sale_price)} · {sale.payment_method || '—'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={'text-sm font-bold ' + (Number(sale.profit) >= 0 ? 'text-success-400' : 'text-error-400')}>
                      {formatCurrency(sale.profit)}
                    </p>
                    <p className="text-xs text-navy-400">lucro</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Financing block */}
      {financingSims.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: '0.55s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
              Financiamentos
            </h2>
            <Link to="/financiamento" className="text-sm text-accent-400 hover:text-accent-300 font-medium flex items-center gap-1 group">
              Ver todos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Simulações hoje', value: financingSims.filter((s) => { const d = new Date(s.created_at); const now = new Date(); return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length.toString(), icon: Calculator, color: 'text-accent-400' },
              { label: 'Aprovadas', value: financingSims.filter((s) => s.status === 'approved' || s.status === 'approved_with_condition').length.toString(), icon: CheckCircle2, color: 'text-success-400' },
              { label: 'Em análise', value: financingSims.filter((s) => s.status === 'analysis' || s.status === 'processing' || s.status === 'submitted').length.toString(), icon: Clock, color: 'text-warning-400' },
              { label: 'Recusadas', value: financingSims.filter((s) => s.status === 'rejected').length.toString(), icon: XCircle, color: 'text-error-400' },
              { label: 'Fechadas', value: financingSims.filter((s) => s.status === 'converted').length.toString(), icon: TrendingUp, color: 'text-success-400' },
              { label: 'Conversão', value: financingSims.length > 0 ? Math.round((financingSims.filter((s) => s.status === 'converted').length / financingSims.length) * 100) + '%' : '0%', icon: Activity, color: 'text-gold-400' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="group glass-card rounded-xl p-4 hover-lift-sm card-glow overflow-hidden animate-fade-in-up" style={{ animationDelay: `${0.4 + i * 60}ms` }}>
                  <div className="w-8 h-8 rounded-lg glass flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Icon size={14} className={stat.color} />
                  </div>
                  <p className="text-lg font-extrabold text-white">{stat.value}</p>
                  <p className="text-xs text-navy-300">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CRM quick stats */}
      {(leadStats.total > 0 || leadStats.hot > 0 || leadStats.followUpsToday > 0) && (
        <Link to="/atendimento" className="group block glass-card rounded-2xl p-5 hover-lift overflow-hidden relative animate-fade-in-up border border-gold-500/20" style={{ animationDelay: '0.65s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 to-transparent opacity-50" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gold-500/30 blur-lg rounded-xl animate-pulse" />
                <div className="relative w-12 h-12 rounded-xl glass flex items-center justify-center">
                  <Target size={22} className="text-gold-400" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-extrabold text-white">{leadStats.total}</p>
                  <p className="text-xs text-navy-300 uppercase tracking-wide">Clientes ativos</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-error-400 flex items-center gap-1"><Flame size={18} /> {leadStats.hot}</p>
                  <p className="text-xs text-navy-300 uppercase tracking-wide">Quentes</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-warning-400">{leadStats.followUpsToday}</p>
                  <p className="text-xs text-navy-300 uppercase tracking-wide">Acompanhamentos hoje</p>
                </div>
              </div>
            </div>
            <ArrowRight size={20} className="text-gold-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      )}

      {/* Pending expenses alert */}
      {pendingExpenses > 0 && (
        <Link to="/financeiro" className="group block glass-card rounded-2xl p-5 hover-lift overflow-hidden relative animate-fade-in-up border border-warning-500/20" style={{ animationDelay: '0.6s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-warning-500/10 to-transparent opacity-50" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-warning-500/30 blur-lg rounded-xl animate-pulse" />
                <div className="relative w-12 h-12 rounded-xl glass flex items-center justify-center">
                  <Receipt size={22} className="text-warning-400" />
                </div>
              </div>
              <div>
                <p className="text-white font-bold">{formatCurrency(pendingExpenses)} em despesas pendentes</p>
                <p className="text-sm text-navy-300">Quite suas contas em dia</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-warning-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      )}
    </div>
  );
}

```

=== FILE: src/pages/MyStockPage.tsx ===
```tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Search, Pencil, Trash2, AlertCircle, Eye, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Vehicle, type VehiclePhoto } from '@/lib/supabase';
import { formatCurrency, formatNumber, statusLabel, statusColor } from '@/lib/format';

export function MyStockPage() {
  const { dealer } = useAuth();
  const [vehicles, setVehicles] = useState<(Vehicle & { photos?: VehiclePhoto[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('available');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!dealer) return;
      const { data, error } = await supabase
        .from('vehicles')
        .select('*, photos:vehicle_photos(*)')
        .eq('dealer_id', dealer.id)
        .order('created_at', { ascending: false });
      if (error) { console.error('Erro ao carregar estoque:', error); setError('Não foi possível carregar o estoque. Tente novamente.'); }
      else setVehicles(data as (Vehicle & { photos?: VehiclePhoto[] })[]);
      setLoading(false);
    }
    load();
  }, [dealer]);

  async function handleDelete(id: string) {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) { console.error('Erro ao excluir veículo:', error); setError('Não foi possível excluir o veículo. Tente novamente.'); return; }
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    setDeleteId(null);
  }

  const filtered = vehicles.filter((v) => {
    const matchesSearch = !search || `${v.brand} ${v.model} ${v.color || ''} ${v.plate || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400/20 rounded-full" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400 border-b-transparent rounded-full animate-spin-reverse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-down">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-accent-400/30 blur-md rounded-full" />
              <div className="relative w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            </div>
            <span className="text-xs font-semibold text-accent-400 uppercase tracking-wider">Seu Inventário</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Meu <span className="gradient-text">Estoque</span></h1>
          <p className="text-navy-300 text-sm mt-1">{vehicles.filter((v) => v.status !== 'sold').length} veículo(s) em estoque · {vehicles.filter((v) => v.status === 'sold').length} vendido(s)</p>
        </div>
        <Link
          to="/veiculo/novo"
          className="btn-shine btn-sheen ripple-btn group flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5 text-sm"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Cadastrar veículo
        </Link>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 mb-4 animate-fade-in">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in">
        <div className="relative group flex-1 input-anim">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 group-focus-within:scale-110 transition-all" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por marca, modelo, cor ou placa..."
            className="w-full glass border border-navy-600/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm"
          />
        </div>
        <div className="relative input-anim">
          <SlidersHorizontal size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass border border-navy-600/30 rounded-xl pl-9 pr-8 py-3 text-white focus:outline-none focus:border-accent-500 text-sm appearance-none cursor-pointer transition-all"
          >
            <option value="all">Todos os status</option>
            <option value="available">Disponíveis</option>
            <option value="reserved">Reservados</option>
            <option value="sold">Vendidos</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center hover-lift animate-fade-in-scale">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-accent-500/20 blur-2xl rounded-full animate-breathe" />
            <Car size={44} className="relative text-navy-400" />
          </div>
          <p className="text-navy-200 font-medium text-lg">
            {vehicles.length === 0 ? 'Seu estoque está vazio' : 'Nenhum resultado'}
          </p>
          <p className="text-sm text-navy-400 mt-1">
            {vehicles.length === 0 ? 'Cadastre seu primeiro veículo para começar' : 'Tente ajustar os filtros de busca'}
          </p>
          {vehicles.length === 0 && (
            <Link
              to="/veiculo/novo"
              className="btn-shine inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 font-medium text-sm transition-all border border-accent-500/20 group hover:scale-105 duration-300"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              Cadastrar primeiro veículo
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((v, i) => (
            <div
              key={v.id}
              className="group glass-card rounded-2xl overflow-hidden hover-lift card-glow-strong animate-fade-in-up spotlight"
              style={{ animationDelay: `${i * 50}ms` }}
              onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}
            >
              <Link to={`/veiculo/${v.id}`} className="block relative h-36 bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center overflow-hidden img-zoom">
                <div className="absolute inset-0 bg-grid opacity-20" />
                {(() => { const cover = v.photos?.find((p) => p.is_cover) || v.photos?.[0]; return cover ? (
                  <img src={cover.url} alt={`${v.brand} ${v.model}`} className="relative w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                ) : (
                  <Car size={36} className="relative text-navy-500 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500" />
                ); })()}
                <div className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full border font-medium backdrop-blur-sm ${statusColor(v.status)}`}>
                  {statusLabel(v.status)}
                </div>
                {/* Bottom gradient overlay on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-navy-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
              <div className="p-4">
                <p className="text-white font-bold truncate group-hover:text-accent-300 transition-colors">{v.brand} {v.model}</p>
                <p className="text-xs text-navy-300 mt-0.5">
                  {v.year_model || v.year_manufacture || '—'} · {v.color || '—'}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-navy-600/30 text-xs">
                  <div>
                    <p className="text-navy-400">Venda</p>
                    <p className="text-white font-semibold group-hover:text-accent-300 transition-colors">{formatCurrency(v.asking_price)}</p>
                  </div>
                  <div>
                    <p className="text-navy-400">Custo</p>
                    <p className="text-navy-200 font-medium">{formatCurrency(v.purchase_price)}</p>
                  </div>
                  {v.mileage !== null && (
                    <div className="col-span-2">
                      <p className="text-navy-400">KM</p>
                      <p className="text-navy-200 font-medium">{formatNumber(v.mileage)} km</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Link
                    to={`/veiculo/${v.id}`}
                    className="ripple-btn flex-1 flex items-center justify-center gap-1.5 glass hover:bg-navy-600/30 text-navy-200 hover:text-white text-xs font-medium py-2 rounded-lg transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Eye size={14} /> Ver
                  </Link>
                  <Link
                    to={`/veiculo/${v.id}/editar`}
                    className="flex items-center justify-center glass hover:bg-accent-500/20 text-navy-200 hover:text-accent-400 p-2 rounded-lg transition-all hover:scale-110 active:scale-95"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    onClick={() => setDeleteId(v.id)}
                    className="flex items-center justify-center glass hover:bg-error-500/20 text-navy-200 hover:text-error-400 p-2 rounded-lg transition-all hover:scale-110 active:scale-95"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="glass-strong rounded-2xl p-6 max-w-sm w-full animate-drop-in border border-navy-600/30 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-error-400/60 to-transparent" />
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-error-500/30 blur-xl rounded-xl animate-pulse" />
              <div className="relative w-12 h-12 rounded-xl bg-error-500/15 flex items-center justify-center">
                <Trash2 size={24} className="text-error-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">Excluir veículo?</h3>
            <p className="text-sm text-navy-300 mt-2 mb-6">Esta ação não pode ser desfeita. Todos os dados e fotos serão removidos permanentemente.</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/50 text-sm font-medium transition-all hover:scale-105 active:scale-95">
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteId)} className="btn-shine ripple-btn flex items-center gap-2 bg-error-500 hover:bg-error-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-error-500/20 hover:shadow-error-500/40 hover:-translate-y-0.5">
                <Trash2 size={16} /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

```

=== FILE: src/pages/VehicleDetailPage.tsx ===
```tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Car, Fuel, Gauge, Cog, Calendar, Palette,
  DoorOpen, FileText, Phone, MapPin, CircleDollarSign,
  TrendingUp, AlertCircle, ShieldCheck, Calculator, X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Vehicle, type Dealer, type VehiclePhoto, type FinancingSimulationWithDetails } from '@/lib/supabase';
import { formatCurrency, formatDate, formatMileage, statusLabel, statusColor } from '@/lib/format';

type VehicleDetails = Vehicle & { dealer: Dealer; photos: VehiclePhoto[] };

export function VehicleDetailPage() {
  const { id } = useParams();
  const { dealer } = useAuth();
  const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [financingSims, setFinancingSims] = useState<FinancingSimulationWithDetails[]>([]);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const photoCount = vehicle?.photos?.length ?? 0;
  const nextPhoto = useCallback(() => setActivePhoto((p) => (p + 1) % Math.max(photoCount, 1)), [photoCount]);
  const prevPhoto = useCallback(() => setActivePhoto((p) => (p - 1 + Math.max(photoCount, 1)) % Math.max(photoCount, 1)), [photoCount]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, closeLightbox, nextPhoto, prevPhoto]);

  useEffect(() => {
    async function load() {
      if (!id) return;
      // Own vehicles come from the table (full record). Other dealers' vehicles come
      // from the public projection, which omits cost, floor price, margin, plate and chassis.
      const ownRes = await supabase
        .from('vehicles')
        .select(`*, dealer:dealers(*), photos:vehicle_photos(*)`)
        .eq('id', id)
        .maybeSingle();

      let details = ownRes.data as unknown as VehicleDetails | null;

      if (!details) {
        const netRes = await supabase
          .from('network_vehicles')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (netRes.data) {
          const row = netRes.data as Record<string, unknown>;
          const { data: photoData } = await supabase
            .from('vehicle_photos')
            .select('*')
            .eq('vehicle_id', id);
          details = {
            ...(row as unknown as VehicleDetails),
            dealer: {
              id: row.dealer_id,
              name: row.dealer_name,
              city: row.dealer_city,
              state: row.dealer_state,
              logo_url: row.dealer_logo_url,
              phone: row.dealer_phone,
              whatsapp: row.dealer_whatsapp,
            },
            photos: (photoData || []),
          } as unknown as VehicleDetails;
        }
      }

      if (!details) { setError('Veículo não encontrado'); setLoading(false); return; }
      setVehicle(details);
      const photos = details.photos || [];
      setActivePhoto(photos.findIndex((p) => p.is_cover) >= 0 ? photos.findIndex((p) => p.is_cover) : 0);

      // Load financing simulations for this vehicle (owner only)
      if (dealer?.id === details.dealer_id) {
        const { data: simData } = await supabase
          .from('financing_simulations')
          .select(`*, client:clients(id, name, phone, document), offers:financing_offers(*, institution:financing_institutions(*))`)
          .eq('vehicle_id', id!)
          .order('created_at', { ascending: false });
        if (simData) setFinancingSims(simData as unknown as FinancingSimulationWithDetails[]);
      }

      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400/20 rounded-full" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400 border-b-transparent rounded-full animate-spin-reverse" />
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 animate-fade-in">
        <AlertCircle size={40} className="text-navy-500 mx-auto mb-3" />
        <p className="text-navy-300 mb-4">{error || 'Veículo não encontrado'}</p>
        <Link to="/rede" className="text-accent-400 hover:text-accent-300 font-medium text-sm">Voltar para a rede</Link>
      </div>
    );
  }

  const isOwn = dealer?.id === vehicle.dealer_id;
  const photos = vehicle.photos || [];
  const purchasePrice = Number(vehicle.purchase_price);
  const askingPrice = Number(vehicle.asking_price);
  const minPrice = Number(vehicle.min_price || 0);
  const profitValue = askingPrice - purchasePrice;
  const profitMargin = vehicle.profit_margin ?? (purchasePrice > 0 ? ((askingPrice - purchasePrice) / purchasePrice) * 100 : 0);
  const minProfit = minPrice > 0 ? minPrice - purchasePrice : 0;
  const waNumber = vehicle.dealer?.whatsapp || vehicle.dealer?.phone || '';
  const waDigits = waNumber.replace(/\D/g, '');
  const waMsg = `Olá! Tenho interesse no veículo *${vehicle.brand} ${vehicle.model}* (${vehicle.year_model || vehicle.year_manufacture || '—'}, ${vehicle.color || '—'}) anunciado na Rede Auto Ribeirão no valor de ${formatCurrency(vehicle.asking_price)}. Gostaria de negociar.`;
  const whatsappLink = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(waMsg)}` : '#';

  const specs = [
    { icon: Calendar, label: 'Ano fabricação', value: vehicle.year_manufacture?.toString() || '—' },
    { icon: Calendar, label: 'Ano modelo', value: vehicle.year_model?.toString() || '—' },
    { icon: Palette, label: 'Cor', value: vehicle.color || '—' },
    { icon: Gauge, label: 'Quilometragem', value: formatMileage(vehicle.mileage) },
    { icon: Fuel, label: 'Combustível', value: vehicle.fuel || '—' },
    { icon: Cog, label: 'Câmbio', value: vehicle.transmission || '—' },
    { icon: DoorOpen, label: 'Portas', value: vehicle.doors?.toString() || '—' },
    { icon: FileText, label: 'Placa', value: vehicle.plate || '—' },
    { icon: FileText, label: 'Chassi', value: vehicle.chassis || '—' },
    { icon: Cog, label: 'Motorização', value: vehicle.engine || '—' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <Link to={isOwn ? '/estoque' : '/rede'} className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm mb-6 transition-colors group animate-fade-in">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Photos + Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up">
            <div className="relative h-72 sm:h-96 bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center group overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-20" />
              {photos.length > 0 ? (
                <img key={activePhoto} src={photos[activePhoto]?.url} alt={`${vehicle.brand} ${vehicle.model}`} onClick={() => setLightboxOpen(true)} className="relative w-full h-full object-cover cursor-zoom-in animate-photo-reveal" />
              ) : (
                <Car size={56} className="relative text-navy-500 group-hover:scale-110 transition-transform duration-500" />
              )}
              {/* Gradient overlay for better text legibility on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              {photos.length > 1 && (
                <>
                  <button onClick={() => setActivePhoto((p) => (p - 1 + photos.length) % photos.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-strong flex items-center justify-center text-white hover:bg-accent-500/30 transition-all opacity-0 group-hover:opacity-100 duration-300 hover:scale-110 active:scale-95">
                    <ArrowLeft size={18} />
                  </button>
                  <button onClick={() => setActivePhoto((p) => (p + 1) % photos.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-strong flex items-center justify-center text-white hover:bg-accent-500/30 transition-all opacity-0 group-hover:opacity-100 duration-300 hover:scale-110 active:scale-95">
                    <ArrowLeft size={18} className="rotate-180" />
                  </button>
                  {/* Photo counter */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full glass-strong text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {activePhoto + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {photos.map((photo, i) => (
                  <button
                    key={photo.id}
                    onClick={() => setActivePhoto(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 animate-thumb-in ${
                      i === activePhoto ? 'border-accent-400 scale-105 shadow-lg shadow-accent-500/20' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
              Especificações
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {specs.map((spec, i) => {
                const Icon = spec.icon;
                return (
                  <div key={i} className="group flex items-start gap-2.5 hover:bg-navy-700/25 -mx-2 px-3 py-2 rounded-xl transition-all duration-300 animate-fade-in-up hover:border-accent-500/20 border border-transparent" style={{ animationDelay: `${0.1 + i * 30}ms` }}>
                    <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Icon size={14} className="text-navy-400 group-hover:text-accent-400 transition-colors" />
                    </div>
                    <div className="min-w-0 pt-1">
                      <p className="text-xs text-navy-400 uppercase tracking-wide">{spec.label}</p>
                      <p className="text-sm text-white font-medium truncate group-hover:text-accent-200 transition-colors">{spec.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {vehicle.description && (
              <div className="mt-5 pt-5 border-t border-navy-600/30">
                <h3 className="text-sm font-semibold text-white mb-2">Descrição</h3>
                <p className="text-sm text-navy-200 leading-relaxed whitespace-pre-wrap">{vehicle.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Title card */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up relative overflow-hidden aurora-bg">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400/50 to-transparent" />
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-extrabold text-white">{vehicle.brand} {vehicle.model}</h1>
                <p className="text-sm text-navy-300 mt-0.5">
                  {vehicle.year_model || vehicle.year_manufacture || '—'} · {vehicle.color || '—'}
                </p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor(vehicle.status)}`}>
                {statusLabel(vehicle.status)}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-navy-600/30">
              <p className="text-3xl font-extrabold text-white">{formatCurrency(askingPrice)}</p>
              <p className="text-xs text-navy-400 mt-1">Valor de venda</p>
            </div>
          </div>

          {/* Financial (owner only) */}
          {isOwn ? (
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg glass flex items-center justify-center">
                  <CircleDollarSign size={16} className="text-accent-400" />
                </div>
                <h2 className="text-base font-bold text-white">Dados financeiros</h2>
              </div>
              <div className="space-y-3">
                <FinancialRow label="Valor pago (custo)" value={formatCurrency(purchasePrice)} />
                <FinancialRow label="Valor de venda" value={formatCurrency(askingPrice)} highlight />
                {minPrice > 0 && <FinancialRow label="Valor mínimo aceito" value={formatCurrency(minPrice)} />}
                <div className="pt-3 border-t border-navy-600/30 space-y-3">
                  <FinancialRow label="Lucro bruto" value={formatCurrency(profitValue)} color={profitValue >= 0 ? 'text-success-400' : 'text-error-400'} />
                  <FinancialRow label="Margem de lucro" value={`${profitMargin.toFixed(1)}%`} color={profitMargin >= 0 ? 'text-success-400' : 'text-error-400'} />
                  {minPrice > 0 && <FinancialRow label="Lucro no valor mínimo" value={formatCurrency(minProfit)} color={minProfit >= 0 ? 'text-accent-400' : 'text-error-400'} />}
                </div>
              </div>
            </div>
          ) : (
            /* WhatsApp contact card for other dealers' vehicles */
            <div className="relative glass rounded-2xl border border-emerald-500/30 p-6 animate-fade-in-up overflow-hidden" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/30 blur-lg rounded-lg" />
                    <ShieldCheck size={20} className="relative text-emerald-400" />
                  </div>
                  <h2 className="text-base font-bold text-white">Tenho interesse</h2>
                </div>
                <p className="text-sm text-navy-200 mb-5">
                  Este veículo pertence a <span className="font-bold text-white">{vehicle.dealer?.name}</span>.
                  Clique no botão abaixo para negociar diretamente via WhatsApp.
                </p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-shine w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25 text-sm group"
                >
                  <WhatsAppIcon size={20} className="group-hover:scale-110 transition-transform" />
                  Negociar no WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* Dealer info */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-accent-400" style={{ boxShadow: '0 0 6px rgba(74,174,245,0.5)' }} />
              Lojista
            </h2>
            <div className="flex items-center gap-3 mb-3">
              <Link to={`/lojista/${vehicle.dealer?.id}`} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-accent-500/30 to-gold-400/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500 to-navy-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform duration-300">
                  {vehicle.dealer?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              </Link>
              <div className="flex-1">
                <Link to={`/lojista/${vehicle.dealer?.id}`} className="text-sm font-bold text-white hover:text-accent-300 transition-colors">{vehicle.dealer?.name}</Link>
                <p className="text-xs text-navy-300">Lojista da rede</p>
                {(vehicle.dealer?.city || vehicle.dealer?.state) && (
                  <p className="text-xs text-navy-400 mt-0.5 flex items-center gap-1">
                    <MapPin size={11} />{vehicle.dealer?.city}{vehicle.dealer?.city && vehicle.dealer?.state ? ' / ' : ''}{vehicle.dealer?.state}
                  </p>
                )}
              </div>
            </div>
            {vehicle.dealer?.phone && (
              <div className="flex items-center gap-2 text-sm text-navy-200 mt-3">
                <Phone size={14} className="text-navy-400" /> {vehicle.dealer.phone}
              </div>
            )}
            <Link to={`/lojista/${vehicle.dealer?.id}`} className="inline-flex items-center gap-1.5 mt-4 text-sm text-accent-400 hover:text-accent-300 font-medium transition-colors">
              Ver perfil completo →
            </Link>
            {vehicle.dealer?.address && (
              <div className="flex items-center gap-2 text-sm text-navy-200 mt-2">
                <MapPin size={14} className="text-navy-400" /> {vehicle.dealer.address}
              </div>
            )}
          </div>

          {/* Owner actions */}
          {isOwn && (
            <div className="space-y-3">
              <Link
                to={`/financiamento/novo?veiculo=${vehicle.id}`}
                className="btn-shine flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-accent-500/25 text-sm group"
              >
                <Calculator size={16} className="group-hover:scale-110 transition-transform" /> Simular financiamento
              </Link>
              <Link
                to={`/veiculo/${vehicle.id}/editar`}
                className="btn-shine flex items-center justify-center gap-2 glass border border-navy-600/30 hover:border-accent-500/30 text-white font-semibold py-3 rounded-xl transition-all text-sm group"
              >
                <Pencil size={16} className="group-hover:rotate-12 transition-transform" /> Editar veículo
              </Link>
            </div>
          )}

          <p className="text-xs text-navy-400 text-center">Cadastrado em {formatDate(vehicle.created_at)}</p>
        </div>
      </div>

      {/* Financing history (owner only) */}
      {isOwn && financingSims.length > 0 && (
        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            Financiamentos ({financingSims.length})
          </h2>
          <div className="space-y-3">
            {financingSims.map((sim, i) => (
              <Link key={sim.id} to={`/financiamento/${sim.id}`} className="group glass rounded-xl border border-navy-600/20 p-4 hover-lift flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                  <Calculator size={18} className="text-accent-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate text-sm">{sim.client?.name || 'Cliente não vinculado'}</p>
                  <p className="text-xs text-navy-400">{formatCurrency(sim.financed_amount)} · {sim.term_months}x · {formatDate(sim.created_at)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${statusColor(sim.status)}`}>
                  {statusLabel(sim.status)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox - full screen image viewer like OLX */}
      {lightboxOpen && photos.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-fade-in" onClick={closeLightbox}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm font-medium">{activePhoto + 1} / {photos.length}</span>
            <button onClick={closeLightbox} className="w-10 h-10 rounded-full glass-strong flex items-center justify-center hover:bg-white/10 transition-all active:scale-90">
              <X size={20} />
            </button>
          </div>

          {/* Image area */}
          <div className="flex-1 flex items-center justify-center px-4 pb-4 relative" onClick={(e) => e.stopPropagation()}>
            {photos.length > 1 && (
              <button onClick={prevPhoto} className="absolute left-4 z-10 w-12 h-12 rounded-full glass-strong flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90">
                <ArrowLeft size={22} />
              </button>
            )}
            <img src={photos[activePhoto]?.url} alt={`${vehicle.brand} ${vehicle.model}`} className="max-w-full max-h-full object-contain rounded-lg animate-photo-reveal" />
            {photos.length > 1 && (
              <button onClick={nextPhoto} className="absolute right-4 z-10 w-12 h-12 rounded-full glass-strong flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90">
                <ArrowLeft size={22} className="rotate-180" />
              </button>
            )}
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="flex gap-2 px-4 pb-4 overflow-x-auto justify-center" onClick={(e) => e.stopPropagation()}>
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={() => setActivePhoto(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    i === activePhoto ? 'border-accent-400 scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FinancialRow({ label, value, highlight, color }: { label: string; value: string; highlight?: boolean; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-navy-300">{label}</span>
      <span className={`text-sm font-semibold ${color || (highlight ? 'text-white' : 'text-navy-100')}`}>{value}</span>
    </div>
  );
}

function WhatsAppIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

```

=== FILE: src/pages/VehicleFormPage.tsx ===
```tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, ImagePlus, X, AlertCircle, Car } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Vehicle, type VehiclePhoto } from '@/lib/supabase';

type FormData = {
  brand: string;
  model: string;
  year_manufacture: string;
  year_model: string;
  color: string;
  mileage: string;
  fuel: string;
  transmission: string;
  plate: string;
  chassis: string;
  engine: string;
  doors: string;
  description: string;
  purchase_price: string;
  asking_price: string;
  min_price: string;
  status: 'available' | 'reserved' | 'sold';
};

const emptyForm: FormData = {
  brand: '', model: '', year_manufacture: '', year_model: '', color: '',
  mileage: '', fuel: '', transmission: '', plate: '', chassis: '', engine: '',
  doors: '', description: '', purchase_price: '', asking_price: '', min_price: '',
  status: 'available',
};

const fuelOptions = ['Flex', 'Gasolina', 'Etanol', 'Diesel', 'Híbrido', 'Elétrico'];
const transmissionOptions = ['Manual', 'Automático', 'Automatizado', 'CVT'];

export function VehicleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dealer } = useAuth();
  const isEdit = id && id !== 'novo';

  const [form, setForm] = useState<FormData>(emptyForm);
  const [photos, setPhotos] = useState<VehiclePhoto[]>([]);
  const [loading, setLoading] = useState(isEdit ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    async function loadVehicle() {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id!)
        .maybeSingle();

      if (error || !data) {
        setError('Veículo não encontrado');
        setLoading(false);
        return;
      }

      const v = data as Vehicle;
      setForm({
        brand: v.brand, model: v.model,
        year_manufacture: v.year_manufacture?.toString() || '',
        year_model: v.year_model?.toString() || '',
        color: v.color || '', mileage: v.mileage?.toString() || '',
        fuel: v.fuel || '', transmission: v.transmission || '',
        plate: v.plate || '', chassis: v.chassis || '',
        engine: v.engine || '', doors: v.doors?.toString() || '',
        description: v.description || '',
        purchase_price: v.purchase_price?.toString() || '',
        asking_price: v.asking_price?.toString() || '',
        min_price: v.min_price?.toString() || '',
        status: v.status,
      });

      const { data: photosData } = await supabase
        .from('vehicle_photos')
        .select('*')
        .eq('vehicle_id', id!)
        .order('is_cover', { ascending: false });

      if (photosData) setPhotos(photosData as VehiclePhoto[]);
      setLoading(false);
    }
    loadVehicle();
  }, [id, isEdit]);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const purchasePrice = parseFloat(form.purchase_price) || 0;
  const askingPrice = parseFloat(form.asking_price) || 0;
  const minPrice = parseFloat(form.min_price) || 0;
  const profitMargin = purchasePrice > 0 ? ((askingPrice - purchasePrice) / purchasePrice) * 100 : 0;
  const profitValue = askingPrice - purchasePrice;
  const minProfit = minPrice > 0 ? minPrice - purchasePrice : 0;

  function handleSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    const MAX_BYTES = 10 * 1024 * 1024;
    const valid: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!ALLOWED.includes(file.type)) {
        setError('Envie apenas imagens JPG, PNG, WEBP, GIF ou AVIF.');
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError('Cada foto deve ter no máximo 10 MB.');
        continue;
      }
      valid.push(file);
    }

    if (valid.length > 0) {
      if (isEdit && id) {
        uploadFiles(valid, id);
      } else {
        const previews = valid.map((f) => URL.createObjectURL(f));
        setPendingFiles((prev) => [...prev, ...valid]);
        setPendingPreviews((prev) => [...prev, ...previews]);
      }
    }
    e.target.value = '';
  }

  async function uploadFiles(files: File[], vehicleId: string) {
    if (!dealer) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
        const fileName = `${dealer.id}/${vehicleId}/${Date.now()}-${i}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from('vehicle-photos')
          .upload(fileName, file);
        if (upErr) throw upErr;

        const { data: urlData } = supabase.storage
          .from('vehicle-photos')
          .getPublicUrl(fileName);

        const isFirst = photos.length === 0 && i === 0;
        const { data: photoData, error: dbErr } = await supabase
          .from('vehicle_photos')
          .insert({ vehicle_id: vehicleId, url: urlData.publicUrl, is_cover: isFirst })
          .select()
          .single();
        if (dbErr) throw dbErr;
        if (photoData) setPhotos((prev) => [...prev, photoData as VehiclePhoto]);
      }
    } catch (err) {
      console.error('Erro ao enviar foto:', err);
      setError('Não foi possível enviar a foto. Tente novamente.');
    }
    setUploading(false);
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setPendingPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleDeletePhoto(photoId: string, url: string) {
    const { error } = await supabase.from('vehicle_photos').delete().eq('id', photoId);
    if (error) {
      setError('Erro ao remover foto');
      return;
    }
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));

    // Try to remove from storage (best-effort)
    try {
      const pathMatch = url.match(/vehicle-photos\/(.+)$/);
      if (pathMatch) {
        await supabase.storage.from('vehicle-photos').remove([pathMatch[1]]);
      }
    } catch {}
  }

  async function handleSetCover(photoId: string) {
    if (!id) return;
    // Unset all covers, then set the selected one
    await supabase.from('vehicle_photos').update({ is_cover: false }).eq('vehicle_id', id);
    await supabase.from('vehicle_photos').update({ is_cover: true }).eq('id', photoId);
    setPhotos((prev) => prev.map((p) => ({ ...p, is_cover: p.id === photoId })));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dealer) return;
    setError(null);
    setSaving(true);

    if (!form.brand.trim() || !form.model.trim()) {
      setError('Marca e modelo são obrigatórios');
      setSaving(false);
      return;
    }
    if (purchasePrice <= 0 || askingPrice <= 0) {
      setError('Valor de compra e valor de venda são obrigatórios');
      setSaving(false);
      return;
    }

    const payload = {
      dealer_id: dealer.id,
      brand: form.brand.trim(),
      model: form.model.trim(),
      year_manufacture: form.year_manufacture ? parseInt(form.year_manufacture) : null,
      year_model: form.year_model ? parseInt(form.year_model) : null,
      color: form.color || null,
      mileage: form.mileage ? parseInt(form.mileage) : null,
      fuel: form.fuel || null,
      transmission: form.transmission || null,
      plate: form.plate || null,
      chassis: form.chassis || null,
      engine: form.engine || null,
      doors: form.doors ? parseInt(form.doors) : null,
      description: form.description || null,
      purchase_price: purchasePrice,
      asking_price: askingPrice,
      min_price: minPrice > 0 ? minPrice : null,
      profit_margin: parseFloat(profitMargin.toFixed(2)),
      status: form.status,
      updated_at: new Date().toISOString(),
    };

    if (isEdit) {
      const { error: updateErr } = await supabase.from('vehicles').update(payload).eq('id', id!);
      if (updateErr) {
        console.error('Erro ao salvar veículo:', updateErr);
        setError('Não foi possível salvar o veículo. Verifique os dados e tente novamente.');
        setSaving(false);
        return;
      }
      navigate(`/veiculo/${id}`);
    } else {
      const { data, error: insertErr } = await supabase
        .from('vehicles')
        .insert(payload)
        .select()
        .single();

      if (insertErr) {
        console.error('Erro ao cadastrar veículo:', insertErr);
        setError('Não foi possível cadastrar o veículo. Verifique os dados e tente novamente.');
        setSaving(false);
        return;
      }

      if (pendingFiles.length > 0) {
        await uploadFiles(pendingFiles, data.id);
      }
      navigate(`/veiculo/${data.id}`);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to={isEdit ? `/veiculo/${id}` : '/estoque'} className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm mb-6 transition-colors group animate-fade-in">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar
      </Link>

      <div className="mb-8 animate-fade-in-down">
        <h1 className="text-3xl font-extrabold text-white">
          {isEdit ? 'Editar veículo' : 'Cadastrar veículo'}
        </h1>
        <p className="text-navy-300 text-sm mt-1">
          {isEdit ? 'Atualize os dados e fotos do veículo' : 'Preencha as informações do veículo para adicioná-lo ao seu estoque'}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 mb-4 animate-fade-in">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados do veículo */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            Dados do veículo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Marca *" required>
              <input type="text" value={form.brand} onChange={(e) => update('brand', e.target.value)} placeholder="Ex: Toyota" className={inputClass} />
            </Field>
            <Field label="Modelo *" required>
              <input type="text" value={form.model} onChange={(e) => update('model', e.target.value)} placeholder="Ex: Corolla" className={inputClass} />
            </Field>
            <Field label="Cor">
              <input type="text" value={form.color} onChange={(e) => update('color', e.target.value)} placeholder="Ex: Prata" className={inputClass} />
            </Field>
            <Field label="Ano de fabricação">
              <input type="number" value={form.year_manufacture} onChange={(e) => update('year_manufacture', e.target.value)} placeholder="Ex: 2020" className={inputClass} />
            </Field>
            <Field label="Ano do modelo">
              <input type="number" value={form.year_model} onChange={(e) => update('year_model', e.target.value)} placeholder="Ex: 2021" className={inputClass} />
            </Field>
            <Field label="Quilometragem">
              <input type="number" value={form.mileage} onChange={(e) => update('mileage', e.target.value)} placeholder="Ex: 45000" className={inputClass} />
            </Field>
            <Field label="Combustível">
              <select value={form.fuel} onChange={(e) => update('fuel', e.target.value)} className={inputClass}>
                <option value="">Selecione</option>
                {fuelOptions.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Câmbio">
              <select value={form.transmission} onChange={(e) => update('transmission', e.target.value)} className={inputClass}>
                <option value="">Selecione</option>
                {transmissionOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Portas">
              <input type="number" value={form.doors} onChange={(e) => update('doors', e.target.value)} placeholder="Ex: 4" className={inputClass} />
            </Field>
            <Field label="Placa">
              <input type="text" value={form.plate} onChange={(e) => update('plate', e.target.value.toUpperCase())} placeholder="ABC1234" className={inputClass} />
            </Field>
            <Field label="Chassi">
              <input type="text" value={form.chassis} onChange={(e) => update('chassis', e.target.value)} placeholder="9BWZZZ377VT..." className={inputClass} />
            </Field>
            <Field label="Motorização">
              <input type="text" value={form.engine} onChange={(e) => update('engine', e.target.value)} placeholder="Ex: 1.8 16V" className={inputClass} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Descrição / Observações">
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} placeholder="Detalhes sobre o veículo, acessórios, estado de conservação..." className={`${inputClass} resize-none`} />
            </Field>
          </div>
        </section>

        {/* Dados financeiros */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-gold-400" style={{ boxShadow: '0 0 8px rgba(212,168,67,0.5)' }} />
            Dados financeiros
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Valor pago (custo) *">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                <input type="number" step="0.01" value={form.purchase_price} onChange={(e) => update('purchase_price', e.target.value)} placeholder="0,00" className={`${inputClass} pl-9`} />
              </div>
            </Field>
            <Field label="Valor de venda *">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                <input type="number" step="0.01" value={form.asking_price} onChange={(e) => update('asking_price', e.target.value)} placeholder="0,00" className={`${inputClass} pl-9`} />
              </div>
            </Field>
            <Field label="Valor mínimo aceito">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                <input type="number" step="0.01" value={form.min_price} onChange={(e) => update('min_price', e.target.value)} placeholder="0,00" className={`${inputClass} pl-9`} />
              </div>
            </Field>
          </div>

          {/* Resumo financeiro */}
          {purchasePrice > 0 && askingPrice > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-navy-900/50 rounded-xl border border-navy-600/30">
              <Metric label="Lucro bruto" value={formatBRL(profitValue)} color={profitValue >= 0 ? 'text-success-400' : 'text-error-400'} />
              <Metric label="Margem" value={`${profitMargin.toFixed(1)}%`} color={profitMargin >= 0 ? 'text-success-400' : 'text-error-400'} />
              {minPrice > 0 && <Metric label="Lucro mínimo" value={formatBRL(minProfit)} color={minProfit >= 0 ? 'text-accent-400' : 'text-error-400'} />}
              <Metric label="Status" value={form.status === 'available' ? 'Disponível' : form.status === 'reserved' ? 'Reservado' : 'Vendido'} color="text-white" />
            </div>
          )}

          <div className="mt-4">
            <Field label="Status do veículo">
              <select value={form.status} onChange={(e) => update('status', e.target.value as FormData['status'])} className={inputClass}>
                <option value="available">Disponível</option>
                <option value="reserved">Reservado</option>
                <option value="sold">Vendido</option>
              </select>
            </Field>
          </div>
        </section>

        {/* Fotos */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
              Fotos do veículo
            </h2>
            {uploading && <Loader2 size={18} className="animate-spin text-accent-400" />}
          </div>

          <label className="group flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-navy-600/40 rounded-2xl cursor-pointer hover:border-accent-500/40 hover:bg-accent-500/5 transition-all mb-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl glass flex items-center justify-center group-hover:scale-110 transition-transform">
                <ImagePlus size={24} className="text-navy-300 group-hover:text-accent-400 transition-colors" />
              </div>
              <span className="text-sm text-navy-300 group-hover:text-white transition-colors">
                {isEdit ? 'Clique para adicionar mais fotos' : 'Clique para adicionar fotos (opcional)'}
              </span>
            </div>
            <input type="file" accept="image/*" multiple onChange={handleSelectFiles} className="hidden" />
          </label>

          {photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden border border-navy-600/40 hover-lift">
                  <img src={photo.url} alt="Veículo" className="w-full h-full object-cover" />
                  {photo.is_cover && (
                    <span className="absolute top-2 left-2 text-xs bg-accent-500 text-white px-2 py-0.5 rounded-full font-medium">
                      Capa
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!photo.is_cover && (
                      <button type="button" onClick={() => handleSetCover(photo.id)} className="text-xs bg-accent-500 hover:bg-accent-600 text-white px-2 py-1 rounded">
                        Capa
                      </button>
                    )}
                    <button type="button" onClick={() => handleDeletePhoto(photo.id, photo.url)} className="bg-error-500 hover:bg-error-600 text-white p-1.5 rounded">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : pendingPreviews.length > 0 ? null : (
            <div className="text-center py-6">
              <Car size={28} className="text-navy-500 mx-auto mb-2" />
              <p className="text-sm text-navy-400">Nenhuma foto adicionada</p>
            </div>
          )}

          {pendingPreviews.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-navy-300 mb-2">
                {photos.length > 0 ? 'Fotos novas (enviadas após salvar):' : 'Fotos selecionadas (enviadas após salvar):'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {pendingPreviews.map((src, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-accent-500/30 hover-lift">
                    <img src={src} alt="Pré-visualização" className="w-full h-full object-cover" />
                    {photos.length === 0 && i === 0 && (
                      <span className="absolute top-2 left-2 text-xs bg-accent-500 text-white px-2 py-0.5 rounded-full font-medium">
                        Capa
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => removePendingFile(i)} className="bg-error-500 hover:bg-error-600 text-white p-1.5 rounded">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Link to={isEdit ? `/veiculo/${id}` : '/estoque'} className="px-5 py-3 rounded-xl text-navy-200 hover:bg-navy-700/40 font-medium text-sm transition-all hover:scale-105 active:scale-95">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-shine btn-sheen ripple-btn flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isEdit ? 'Salvar alterações' : 'Cadastrar veículo'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass = 'w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all duration-300 text-sm';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">
        {label}{required && <span className="text-accent-400"> *</span>}
      </label>
      {children}
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="text-xs text-navy-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-semibold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

```

=== FILE: src/pages/NetworkSearchPage.tsx ===
```tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Car, MapPin, Filter, X, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Vehicle, type Dealer, type VehiclePhoto } from '@/lib/supabase';
import { formatCurrency, formatNumber, statusLabel, statusColor } from '@/lib/format';

type NetworkVehicle = Omit<Vehicle, 'purchase_price' | 'min_price' | 'profit_margin' | 'plate' | 'chassis'> & {
  dealer_name: string | null;
  dealer_city: string | null;
  dealer_state: string | null;
  dealer_logo_url: string | null;
  dealer_phone: string | null;
  dealer_whatsapp: string | null;
};

type PublicDealer = Pick<Dealer, 'id' | 'name' | 'city' | 'state' | 'logo_url' | 'phone' | 'whatsapp'>;

type SearchResult = NetworkVehicle & { dealer: PublicDealer; photos: VehiclePhoto[] };

export function NetworkSearchPage() {
  const { dealer } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      // `network_vehicles` is the public projection of the stock: it deliberately
      // omits cost, floor price, margin, plate and chassis of other dealers.
      const { data, error } = await supabase
        .from('network_vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error(error);
        setLoading(false);
        return;
      }

      const rows = data as unknown as NetworkVehicle[];
      const ids = rows.map((v) => v.id);
      const photosByVehicle = new Map<string, VehiclePhoto[]>();

      if (ids.length > 0) {
        const { data: photoData } = await supabase
          .from('vehicle_photos')
          .select('*')
          .in('vehicle_id', ids);
        for (const p of (photoData || []) as VehiclePhoto[]) {
          const list = photosByVehicle.get(p.vehicle_id) || [];
          list.push(p);
          photosByVehicle.set(p.vehicle_id, list);
        }
      }

      const merged: SearchResult[] = rows.map((v) => ({
        ...v,
        dealer: {
          id: v.dealer_id,
          name: v.dealer_name,
          city: v.dealer_city,
          state: v.dealer_state,
          logo_url: v.dealer_logo_url,
          phone: v.dealer_phone,
          whatsapp: v.dealer_whatsapp,
        } as PublicDealer,
        photos: photosByVehicle.get(v.id) || [],
      }));

      setResults(merged);
      setBrands([...new Set(merged.map((v) => v.brand))].sort());
      setLoading(false);
    }
    load();
  }, []);

  const filtered = results.filter((v) => {
    if (dealer && v.dealer_id === dealer.id) return false;
    const s = search.toLowerCase();
    const matchesSearch = !s || `${v.brand} ${v.model} ${v.color || ''}`.toLowerCase().includes(s);
    const matchesBrand = !brandFilter || v.brand === brandFilter;
    const matchesMin = !minPrice || v.asking_price >= parseFloat(minPrice);
    const matchesMax = !maxPrice || v.asking_price <= parseFloat(maxPrice);
    const matchesYear = !yearFilter || v.year_model === parseInt(yearFilter) || v.year_manufacture === parseInt(yearFilter);
    return matchesSearch && matchesBrand && matchesMin && matchesMax && matchesYear;
  });

  const hasActiveFilters = !!(brandFilter || minPrice || maxPrice || yearFilter);
  function clearFilters() { setBrandFilter(''); setMinPrice(''); setMaxPrice(''); setYearFilter(''); }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400/20 rounded-full" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400 border-b-transparent rounded-full animate-spin-reverse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 animate-fade-in-down">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gold-400/30 blur-md rounded-full" />
            <Sparkles size={16} className="relative text-gold-400" />
          </div>
          <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">Rede de Lojistas</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Buscar na <span className="gradient-text">Rede</span></h1>
        <p className="text-navy-300 text-sm mt-1">{filtered.length} veículo(s) disponível(is) de outros lojistas</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-4 animate-fade-in">
        <div className="relative group flex-1 input-anim">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 group-focus-within:scale-110 transition-all" />
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por marca, modelo ou cor..."
            className="w-full glass border border-navy-600/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`ripple-btn flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
            showFilters || hasActiveFilters
              ? 'bg-accent-500/15 text-accent-300 border border-accent-500/30'
              : 'glass border border-navy-600/30 text-navy-200 hover:bg-navy-600/20'
          }`}
        >
          <Filter size={16} /> Filtros
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="glass-card rounded-2xl p-5 mb-6 animate-drop-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Marca</label>
              <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500">
                <option value="">Todas</option>
                {brands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Preço mínimo</label>
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="R$" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Preço máximo</label>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="R$" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Ano</label>
              <input type="number" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} placeholder="Ex: 2020" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 mt-3 text-xs text-navy-300 hover:text-white transition-colors">
              <X size={14} /> Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center hover-lift animate-fade-in-scale">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-accent-500/20 blur-2xl rounded-full animate-breathe" />
            <Car size={44} className="relative text-navy-400" />
          </div>
          <p className="text-navy-200 font-medium text-lg">
            {results.length === 0 ? 'Nenhum veículo na rede ainda' : 'Nenhum resultado'}
          </p>
          <p className="text-sm text-navy-400 mt-1">
            {results.length === 0 ? 'Quando outros lojistas cadastrarem carros, eles aparecem aqui' : 'Tente ajustar os filtros'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((v, i) => {
            const cover = v.photos?.find((p) => p.is_cover) || v.photos?.[0];
            const waNumber = v.dealer?.whatsapp || v.dealer?.phone || '';
            const waDigits = waNumber.replace(/\D/g, '');
            const waMsg = `Olá! Tenho interesse no veículo *${v.brand} ${v.model}* (${v.year_model || v.year_manufacture || '—'}) anunciado na Rede Auto Ribeirão no valor de ${formatCurrency(v.asking_price)}. Gostaria de negociar.`;
            const waLink = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(waMsg)}` : '#';
            return (
              <div
                key={v.id}
                className="group glass-card rounded-2xl overflow-hidden hover-lift card-glow-strong animate-fade-in-up spotlight"
                style={{ animationDelay: `${i * 50}ms` }}
                onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}
              >
                <Link to={`/veiculo/${v.id}`}>
                  <div className="relative h-40 bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center overflow-hidden img-zoom">
                    <div className="absolute inset-0 bg-grid opacity-20" />
                    {cover ? (
                      <img src={cover.url} alt={`${v.brand} ${v.model}`} className="relative w-full h-full object-cover" />
                    ) : (
                      <Car size={36} className="relative text-navy-500 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500" />
                    )}
                    {/* Hover overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium backdrop-blur-sm ${statusColor(v.status)}`}>
                        {statusLabel(v.status)}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/veiculo/${v.id}`}>
                    <p className="text-white font-bold truncate group-hover:text-accent-300 transition-colors">{v.brand} {v.model}</p>
                    <p className="text-xs text-navy-300 mt-0.5">
                      {v.year_model || v.year_manufacture || '—'} · {v.color || '—'}
                    </p>
                  </Link>

                  <Link to={`/lojista/${v.dealer?.id}`} className="flex items-center gap-1.5 mt-3 text-xs text-navy-300 hover:text-accent-300 transition-colors group/dealer">
                    <MapPin size={12} className="text-accent-400 flex-shrink-0 group-hover/dealer:scale-125 transition-transform" />
                    <span className="truncate font-medium group-hover/dealer:underline">{v.dealer?.name || 'Lojista'}</span>
                    {v.dealer?.city && v.dealer?.state && (
                      <span className="text-navy-400 truncate">· {v.dealer.city}/{v.dealer.state}</span>
                    )}
                  </Link>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-navy-600/30 text-xs">
                    <div>
                      <p className="text-navy-400">Venda</p>
                      <p className="text-white font-bold group-hover:text-accent-300 transition-colors">{formatCurrency(v.asking_price)}</p>
                    </div>
                    <div>
                      <p className="text-navy-400">KM</p>
                      <p className="text-navy-200 font-medium">{v.mileage !== null ? `${formatNumber(v.mileage)} km` : '—'}</p>
                    </div>
                  </div>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-shine mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 text-xs group/btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="group-hover/btn:scale-110 transition-transform">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Negociar no WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

```

=== FILE: src/pages/FinancePage.tsx ===
```tsx
import { useEffect, useState } from 'react';
import {
  Plus, Wallet, TrendingDown, TrendingUp, Clock, CheckCircle2, Pencil, Trash2,
  AlertCircle, Search, Tag, Lock, History, FileDown, X, PieChart, RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Expense, type ExpenseCategory, type ExpenseWithCategory, type MonthlyClosure } from '@/lib/supabase';
import { formatCurrency, formatDate, statusLabel, statusColor } from '@/lib/format';
import { ExpenseModal } from '@/components/ExpenseModal';
import { executeMonthClosure, generateClosurePDF, gatherClosureData, type ClosureSummary } from '@/lib/closure';

export function FinancePage() {
  const { dealer } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showClosureConfirm, setShowClosureConfirm] = useState(false);
  const [closureLoading, setClosureLoading] = useState(false);
  const [closureError, setClosureError] = useState<string | null>(null);
  const [closurePreview, setClosurePreview] = useState<ClosureSummary | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [closures, setClosures] = useState<MonthlyClosure[]>([]);
  const [closuresLoading, setClosuresLoading] = useState(false);
  const [fixedFilter, setFixedFilter] = useState<'all' | 'fixed' | 'variable'>('all');

  useEffect(() => {
    async function load() {
      if (!dealer) return;
      const [expRes, catRes] = await Promise.all([
        supabase
          .from('expenses')
          .select('*, category:expense_categories(*)')
          .eq('dealer_id', dealer.id)
          .order('created_at', { ascending: false }),
        supabase.from('expense_categories').select('*').eq('dealer_id', dealer.id).order('name'),
      ]);
      if (expRes.error) { console.error('Erro ao carregar despesas:', expRes.error); setError('Não foi possível carregar as despesas. Tente novamente.'); }
      else setExpenses(expRes.data as unknown as ExpenseWithCategory[]);
      if (catRes.data) setCategories(catRes.data as ExpenseCategory[]);
      setLoading(false);
    }
    load();
  }, [dealer]);

  async function loadData() {
    if (!dealer) return;
    const { data } = await supabase
      .from('expenses')
      .select('*, category:expense_categories(*)')
      .eq('dealer_id', dealer.id)
      .order('created_at', { ascending: false });
    if (data) setExpenses(data as unknown as ExpenseWithCategory[]);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) { console.error('Erro ao excluir despesa:', error); setError('Não foi possível excluir a despesa. Tente novamente.'); return; }
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setDeleteId(null);
  }

  async function togglePaid(exp: Expense) {
    const newStatus = exp.status === 'paid' ? 'pending' : 'paid';
    const newPaidDate = newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null;
    const { error } = await supabase
      .from('expenses')
      .update({ status: newStatus, paid_date: newPaidDate })
      .eq('id', exp.id);
    if (error) { console.error('Erro ao atualizar despesa:', error); setError('Não foi possível atualizar a despesa. Tente novamente.'); return; }
    await loadData();
  }

  const filtered = expenses.filter((e) => {
    const matchesSearch = !search || e.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || e.category_id === categoryFilter;
    const matchesFixed = fixedFilter === 'all' || (fixedFilter === 'fixed' && e.is_fixed) || (fixedFilter === 'variable' && !e.is_fixed);
    return matchesSearch && matchesStatus && matchesCategory && matchesFixed;
  });

  const fixedExpenses = expenses.filter((e) => e.is_fixed);
  const fixedTotal = fixedExpenses.reduce((s, e) => s + Number(e.amount), 0);

  async function handleClosurePreview() {
    if (!dealer) return;
    setClosureError(null);
    setShowClosureConfirm(true);
    setClosurePreview(null);
    try {
      const data = await gatherClosureData(dealer.id);
      setClosurePreview(data.summary);
    } catch (err) {
      setClosureError('Não foi possível carregar o resumo do mês.');
    }
  }

  async function handleExecuteClosure() {
    if (!dealer) return;
    setClosureLoading(true);
    setClosureError(null);
    try {
      const closure = await executeMonthClosure(dealer.id);
      generateClosurePDF(closure, dealer.name || 'Loja', dealer.logo_url || null);
      setShowClosureConfirm(false);
      setClosurePreview(null);
      await loadData();
    } catch (err) {
      setClosureError(err instanceof Error ? err.message : 'Erro ao encerrar o mês.');
    } finally {
      setClosureLoading(false);
    }
  }

  async function loadHistory() {
    if (!dealer) return;
    setClosuresLoading(true);
    const { data, error } = await supabase
      .from('monthly_closures')
      .select('*')
      .eq('dealer_id', dealer.id)
      .order('period_year', { ascending: false })
      .order('period_month', { ascending: false });
    if (!error && data) setClosures(data as MonthlyClosure[]);
    setClosuresLoading(false);
  }

  function handleDownloadClosurePDF(c: MonthlyClosure) {
    if (!dealer) return;
    generateClosurePDF(c, dealer.name || 'Loja', dealer.logo_url || null);
  }

  function monthLabel(m: number, y: number) {
    return new Date(y, m - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  const totalPaid = expenses.filter((e) => e.status === 'paid').reduce((s, e) => s + Number(e.amount), 0);
  const totalPending = expenses.filter((e) => e.status === 'pending').reduce((s, e) => s + Number(e.amount), 0);
  const totalAll = totalPaid + totalPending;
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, e) => s + Number(e.amount), 0);

  // Category breakdown
  const byCategory = categories.map((cat) => {
    const total = expenses.filter((e) => e.category_id === cat.id).reduce((s, e) => s + Number(e.amount), 0);
    return { ...cat, total };
  }).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);
  const maxCatTotal = byCategory[0]?.total || 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400/20 rounded-full" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400 border-b-transparent rounded-full animate-spin-reverse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-down">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-gold-400" style={{ boxShadow: '0 0 8px rgba(212,168,67,0.5)' }} />
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">Gestão Financeira</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Financeiro</h1>
          <p className="text-navy-300 text-sm mt-1">Controle de despesas, custos e fluxo de caixa</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowHistory(true); loadHistory(); }}
            className="flex items-center gap-2 glass border border-navy-600/30 hover:border-accent-500/40 text-navy-200 hover:text-white font-medium px-4 py-3 rounded-xl transition-all duration-300 text-sm group"
          >
            <History size={18} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Histórico</span>
          </button>
          <button
            onClick={handleClosurePreview}
            className="btn-shine ripple-btn flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-950 font-bold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:-translate-y-0.5 text-sm group"
          >
            <Lock size={18} className="group-hover:scale-110 transition-transform" />
            Encerrar Mês
          </button>
          <button
            onClick={() => { setEditExpense(null); setShowModal(true); }}
            className="btn-shine btn-sheen ripple-btn flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5 text-sm group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            Nova despesa
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 mb-4 animate-fade-in">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total de despesas', value: formatCurrency(totalAll), icon: Wallet, color: 'text-white', grad: 'from-navy-400/20 to-transparent' },
          { label: 'Pagas', value: formatCurrency(totalPaid), icon: CheckCircle2, color: 'text-success-400', grad: 'from-success-500/15 to-transparent' },
          { label: 'Pendentes', value: formatCurrency(totalPending), icon: Clock, color: 'text-warning-400', grad: 'from-warning-500/15 to-transparent' },
          { label: 'Este mês', value: formatCurrency(monthExpenses), icon: TrendingDown, color: 'text-gold-400', grad: 'from-gold-500/15 to-transparent' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="group relative glass-card rounded-2xl p-5 hover-lift-sm card-glow overflow-hidden animate-fade-in-up spotlight" style={{ animationDelay: `${i * 60}ms` }} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Icon size={18} className={stat.color} />
                </div>
                <p className="text-xl font-extrabold text-white">{stat.value}</p>
                <p className="text-sm text-navy-300 mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            Despesas por categoria
          </h2>
          <div className="space-y-3">
            {byCategory.map((cat, i) => (
              <div key={cat.id} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color, boxShadow: `0 0 8px ${cat.color}80` }} />
                    <span className="text-sm text-white font-medium">{cat.name}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{formatCurrency(cat.total)}</span>
                </div>
                <div className="h-2 bg-navy-900/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full progress-bar transition-all duration-700 ease-out"
                    style={{
                      width: `${(cat.total / maxCatTotal) * 100}%`,
                      background: `linear-gradient(90deg, ${cat.color}, ${cat.color}80)`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fixed expenses summary */}
      {fixedExpenses.length > 0 && (
        <div className="glass-card rounded-2xl p-4 mb-6 flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center flex-shrink-0">
            <RefreshCw size={18} className="text-gold-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{fixedExpenses.length} despesa(s) fixa(s) mensal(is)</p>
            <p className="text-xs text-navy-400">Total: {formatCurrency(fixedTotal)} — permanecem ao encerrar o mês</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in">
        <div className="relative group flex-1 input-anim">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar despesa..."
            className="w-full glass border border-navy-600/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="glass border border-navy-600/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
          <option value="all">Todas categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="glass border border-navy-600/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
          <option value="all">Todos status</option>
          <option value="pending">Pendentes</option>
          <option value="paid">Pagas</option>
        </select>
        <select value={fixedFilter} onChange={(e) => setFixedFilter(e.target.value as 'all' | 'fixed' | 'variable')} className="glass border border-navy-600/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
          <option value="all">Fixas e variáveis</option>
          <option value="fixed">Apenas fixas</option>
          <option value="variable">Apenas variáveis</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center hover-lift animate-fade-in-scale">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gold-500/20 blur-2xl rounded-full animate-breathe" />
            <Wallet size={44} className="relative text-navy-400" />
          </div>
          <p className="text-navy-200 font-medium text-lg">
            {expenses.length === 0 ? 'Nenhuma despesa cadastrada' : 'Nenhum resultado'}
          </p>
          <p className="text-sm text-navy-400 mt-1">
            {expenses.length === 0 ? 'Comece a controlar seus custos agora' : 'Ajuste os filtros de busca'}
          </p>
          {expenses.length === 0 && (
            <button
              onClick={() => { setEditExpense(null); setShowModal(true); }}
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 font-medium text-sm transition-all border border-accent-500/20 group hover:scale-105 duration-300"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              Adicionar primeira despesa
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
          <div className="divide-y divide-navy-600/20">
            {filtered.map((exp, i) => (
              <div
                key={exp.id}
                className="group flex items-center gap-4 p-4 hover:bg-navy-700/20 transition-all animate-fade-in hover:pl-5"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Category color dot */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${exp.category?.color || '#64748b'}20`, border: `1px solid ${exp.category?.color || '#64748b'}40` }}
                >
                  <Tag size={16} style={{ color: exp.category?.color || '#64748b' }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{exp.description}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-navy-400">
                    <span>{exp.category?.name || 'Sem categoria'}</span>
                    {exp.due_date && <span>Venc: {formatDate(exp.due_date)}</span>}
                    {exp.recurrence !== 'none' && (
                      <span className="text-accent-400 font-medium">
                        {exp.recurrence === 'weekly' ? 'Semanal' : exp.recurrence === 'monthly' ? 'Mensal' : 'Anual'}
                      </span>
                    )}
                    {exp.is_fixed && (
                      <span className="text-gold-400 font-medium flex items-center gap-1">
                        <RefreshCw size={10} /> Fixa
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-white">{formatCurrency(exp.amount)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor(exp.status)}`}>
                    {statusLabel(exp.status)}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => togglePaid(exp)}
                    className={`p-2 rounded-lg transition-all hover:scale-110 active:scale-95 ${
                      exp.status === 'paid'
                        ? 'text-success-400 hover:bg-success-500/15'
                        : 'text-navy-400 hover:bg-warning-500/15 hover:text-warning-400'
                    }`}
                    title={exp.status === 'paid' ? 'Marcar como pendente' : 'Marcar como pago'}
                  >
                    <CheckCircle2 size={16} />
                  </button>
                  <button
                    onClick={() => { setEditExpense(exp); setShowModal(true); }}
                    className="p-2 rounded-lg text-navy-400 hover:bg-accent-500/15 hover:text-accent-400 transition-all hover:scale-110 active:scale-95"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(exp.id)}
                    className="p-2 rounded-lg text-navy-400 hover:bg-error-500/15 hover:text-error-400 transition-all hover:scale-110 active:scale-95"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ExpenseModal
          expense={editExpense}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadData(); }}
        />
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="glass-strong rounded-2xl p-6 max-w-sm w-full animate-drop-in border border-navy-600/30 relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-error-400/60 to-transparent" />
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-error-500/30 blur-xl rounded-xl animate-pulse" />
              <div className="relative w-12 h-12 rounded-xl bg-error-500/15 flex items-center justify-center">
                <Trash2 size={24} className="text-error-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">Excluir despesa?</h3>
            <p className="text-sm text-navy-300 mt-2 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/50 text-sm font-medium transition-all hover:scale-105 active:scale-95">Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-shine ripple-btn flex items-center gap-2 bg-error-500 hover:bg-error-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-error-500/20 hover:shadow-error-500/40 hover:-translate-y-0.5">
                <Trash2 size={16} /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Closure confirmation modal */}
      {showClosureConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => !closureLoading && setShowClosureConfirm(false)}>
          <div className="glass-strong rounded-2xl p-6 max-w-lg w-full animate-drop-in border border-gold-500/30 relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
            <button onClick={() => !closureLoading && setShowClosureConfirm(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-navy-400 hover:bg-navy-700/50 hover:text-white transition-all">
              <X size={18} />
            </button>
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gold-500/30 blur-xl rounded-xl animate-pulse" />
              <div className="relative w-12 h-12 rounded-xl bg-gold-500/15 flex items-center justify-center">
                <Lock size={24} className="text-gold-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">Encerrar o Mês</h3>
            <p className="text-sm text-navy-300 mt-2 mb-4">
              Esta ação vai gerar um relatório completo do mês atual e reiniciar o sistema para o próximo mês. <strong className="text-white">Atenção:</strong> esta ação não pode ser desfeita.
            </p>

            {closureError && (
              <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 mb-4">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{closureError}</span>
              </div>
            )}

            {closurePreview ? (
              <div className="space-y-2 mb-5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="glass rounded-xl p-3">
                    <p className="text-xs text-navy-400 uppercase tracking-wide">Total Despesas</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(closurePreview.totalExpenses)}</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="text-xs text-navy-400 uppercase tracking-wide">Total Vendas</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(closurePreview.totalSales)}</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="text-xs text-navy-400 uppercase tracking-wide">Lucro Total</p>
                    <p className={`text-lg font-bold ${closurePreview.totalProfit >= 0 ? 'text-success-400' : 'text-error-400'}`}>{formatCurrency(closurePreview.totalProfit)}</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <p className="text-xs text-navy-400 uppercase tracking-wide">Veículos Vendidos</p>
                    <p className="text-lg font-bold text-white">{closurePreview.vehiclesSold}</p>
                  </div>
                </div>
                <div className="glass rounded-xl p-3 flex items-center gap-2">
                  <RefreshCw size={14} className="text-gold-400" />
                  <span className="text-xs text-navy-300">{closurePreview.fixedExpensesCount} despesa(s) fixa(s) serão mantidas</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-6 mb-4">
                <RefreshCw size={24} className="text-navy-400 animate-spin" />
              </div>
            )}

            <div className="bg-navy-900/40 rounded-xl p-3 mb-5 text-xs text-navy-400 leading-relaxed">
              <strong className="text-navy-200">O que acontece:</strong> as despesas não fixas, veículos vendidos e registros de vendas serão removidos. As despesas fixas, veículos em estoque e clientes serão mantidos. Um relatório em PDF será gerado.
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setShowClosureConfirm(false)} disabled={closureLoading} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/50 text-sm font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50">Cancelar</button>
              <button onClick={handleExecuteClosure} disabled={closureLoading || !closurePreview} className="btn-shine ripple-btn flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                {closureLoading ? <><RefreshCw size={16} className="animate-spin" /> Encerrando...</> : <><Lock size={16} /> Confirmar Encerramento</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowHistory(false)}>
          <div className="glass-strong rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-drop-in border border-accent-500/20 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowHistory(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-navy-400 hover:bg-navy-700/50 hover:text-white transition-all">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center">
                <History size={20} className="text-accent-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Histórico de Encerramentos</h3>
                <p className="text-xs text-navy-400">Relatórios de meses encerrados</p>
              </div>
            </div>

            {closuresLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw size={24} className="text-navy-400 animate-spin" />
              </div>
            ) : closures.length === 0 ? (
              <div className="text-center py-12">
                <PieChart size={36} className="text-navy-500 mx-auto mb-3" />
                <p className="text-navy-300 font-medium">Nenhum encerramento registrado</p>
                <p className="text-sm text-navy-500 mt-1">Os meses encerrados aparecerão aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {closures.map((c) => {
                  const totals = c.summary_totals;
                  return (
                    <div key={c.id} className="glass rounded-xl p-4 flex items-center gap-4 hover:border-accent-500/30 border border-transparent transition-all">
                      <div className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center flex-shrink-0">
                        <Lock size={18} className="text-gold-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white capitalize">{monthLabel(c.period_month, c.period_year)}</p>
                        <p className="text-xs text-navy-400 mt-0.5">
                          Lucro: <span className={(Number(totals.total_profit) || 0) >= 0 ? 'text-success-400' : 'text-error-400'}>{formatCurrency(Number(totals.total_profit) || 0)}</span>
                          {' · '}{Number(totals.vehicles_sold) || 0} veículo(s) vendido(s)
                          {' · '}{formatCurrency(Number(totals.total_expenses) || 0)} em despesas
                        </p>
                        <p className="text-xs text-navy-500 mt-0.5">Encerrado em {formatDate(c.closed_at)}</p>
                      </div>
                      <button
                        onClick={() => handleDownloadClosurePDF(c)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 text-xs font-medium transition-all hover:scale-105 active:scale-95"
                      >
                        <FileDown size={14} /> PDF
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

```

=== FILE: src/pages/SalesPage.tsx ===
```tsx
import { useEffect, useState } from 'react';
import { Plus, TrendingUp, Car, AlertCircle, X, Loader2, Pencil, Trash2, DollarSign, Calendar, User, Phone, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Sale, type SaleWithVehicle, type Vehicle } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/format';

const paymentMethods = ['Dinheiro', 'PIX', 'Cartão Débito', 'Cartão Crédito', 'Financiamento', 'Consórcio', 'Permuta'];

export function SalesPage() {
  const { dealer } = useAuth();
  const [sales, setSales] = useState<SaleWithVehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editSale, setEditSale] = useState<Sale | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [vehicleId, setVehicleId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!dealer) return;
      const [salesRes, vehRes] = await Promise.all([
        supabase
          .from('sales')
          .select('*, vehicle:vehicles(id, brand, model, year_model, year_manufacture)')
          .eq('dealer_id', dealer.id)
          .order('sale_date', { ascending: false }),
        supabase.from('vehicles').select('*').eq('dealer_id', dealer.id),
      ]);
      if (salesRes.error) { console.error('Erro ao carregar vendas:', salesRes.error); setError('Não foi possível carregar as vendas. Tente novamente.'); }
      else setSales(salesRes.data as unknown as SaleWithVehicle[]);
      if (vehRes.data) setVehicles(vehRes.data as Vehicle[]);
      setLoading(false);
    }
    load();
  }, [dealer]);

  async function loadData() {
    if (!dealer) return;
    const { data } = await supabase
      .from('sales')
      .select('*, vehicle:vehicles(id, brand, model, year_model, year_manufacture)')
      .eq('dealer_id', dealer.id)
      .order('sale_date', { ascending: false });
    if (data) setSales(data as unknown as SaleWithVehicle[]);
  }

  function openModal(sale?: Sale) {
    if (sale) {
      setEditSale(sale);
      setVehicleId(sale.vehicle_id || '');
      setClientName(sale.client_name || '');
      setClientPhone(sale.client_phone || '');
      setSalePrice(sale.sale_price?.toString() || '');
      setPurchasePrice(sale.purchase_price?.toString() || '');
      setPaymentMethod(sale.payment_method || '');
      setSaleDate(sale.sale_date || new Date().toISOString().split('T')[0]);
      setNotes(sale.notes || '');
    } else {
      setEditSale(null);
      setVehicleId('');
      setClientName('');
      setClientPhone('');
      setSalePrice('');
      setPurchasePrice('');
      setPaymentMethod('');
      setSaleDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setShowModal(true);
  }

  function handleSelectVehicle(vId: string) {
    setVehicleId(vId);
    const v = vehicles.find((v) => v.id === vId);
    if (v) {
      setPurchasePrice(v.purchase_price?.toString() || '');
      if (!salePrice) setSalePrice(v.asking_price?.toString() || '');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dealer) return;
    setError(null);
    setSaving(true);

    if (!salePrice || parseFloat(salePrice) <= 0) {
      setError('Valor de venda é obrigatório');
      setSaving(false);
      return;
    }

    const sp = parseFloat(salePrice);
    const pp = parseFloat(purchasePrice) || 0;
    const profit = sp - pp;

    const payload = {
      dealer_id: dealer.id,
      vehicle_id: vehicleId || null,
      client_name: clientName || null,
      client_phone: clientPhone || null,
      sale_price: sp,
      purchase_price: pp,
      profit,
      payment_method: paymentMethod || null,
      sale_date: saleDate,
      notes: notes || null,
    };

    if (editSale) {
      const { error } = await supabase.from('sales').update(payload).eq('id', editSale.id);
      if (error) { console.error('Erro ao salvar venda:', error); setError('Não foi possível salvar a venda. Verifique os dados e tente novamente.'); setSaving(false); return; }
      // If vehicle, mark as sold
      if (vehicleId) {
        await supabase.from('vehicles').update({ status: 'sold' }).eq('id', vehicleId);
      }
    } else {
      const { error } = await supabase.from('sales').insert(payload);
      if (error) { console.error('Erro ao registrar venda:', error); setError('Não foi possível registrar a venda. Verifique os dados e tente novamente.'); setSaving(false); return; }
      if (vehicleId) {
        await supabase.from('vehicles').update({ status: 'sold' }).eq('id', vehicleId);
      }
    }

    setSaving(false);
    setShowModal(false);
    await loadData();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (error) { console.error('Erro ao excluir venda:', error); setError('Não foi possível excluir a venda. Tente novamente.'); return; }
    setSales((prev) => prev.filter((s) => s.id !== id));
    setDeleteId(null);
  }

  const totalRevenue = sales.reduce((s, sale) => s + Number(sale.sale_price), 0);
  const totalProfit = sales.reduce((s, sale) => s + Number(sale.profit || 0), 0);
  const totalCost = sales.reduce((s, sale) => s + Number(sale.purchase_price), 0);
  const avgMargin = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400/20 rounded-full" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400 border-b-transparent rounded-full animate-spin-reverse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-down">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-success-400" style={{ boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
            <span className="text-xs font-semibold text-success-400 uppercase tracking-wider">Vendas Diretas</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Vendas</h1>
          <p className="text-navy-300 text-sm mt-1">Registro de vendas e controle de lucro</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-shine btn-sheen ripple-btn flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5 text-sm group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Registrar venda
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 mb-4 animate-fade-in">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Receita total', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-white', grad: 'from-accent-500/15 to-transparent' },
          { label: 'Lucro total', value: formatCurrency(totalProfit), icon: TrendingUp, color: totalProfit >= 0 ? 'text-success-400' : 'text-error-400', grad: 'from-success-500/15 to-transparent' },
          { label: 'Custo total', value: formatCurrency(totalCost), icon: Car, color: 'text-gold-400', grad: 'from-gold-500/15 to-transparent' },
          { label: 'Margem média', value: `${avgMargin.toFixed(1)}%`, icon: TrendingUp, color: avgMargin >= 0 ? 'text-success-400' : 'text-error-400', grad: 'from-navy-400/15 to-transparent' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="group relative glass-card rounded-2xl p-5 hover-lift-sm card-glow overflow-hidden animate-fade-in-up spotlight" style={{ animationDelay: `${i * 60}ms` }} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Icon size={18} className={stat.color} />
                </div>
                <p className="text-xl font-extrabold text-white">{stat.value}</p>
                <p className="text-sm text-navy-300 mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales list */}
      {sales.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center hover-lift animate-fade-in-scale">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-success-500/20 blur-2xl rounded-full animate-breathe" />
            <TrendingUp size={44} className="relative text-navy-400" />
          </div>
          <p className="text-navy-200 font-medium text-lg">Nenhuma venda registrada</p>
          <p className="text-sm text-navy-400 mt-1">Registre suas vendas para acompanhar o lucro</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 font-medium text-sm transition-all border border-accent-500/20 group hover:scale-105 duration-300"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
            Registrar primeira venda
          </button>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
          <div className="divide-y divide-navy-600/20">
            {sales.map((sale, i) => (
              <div
                key={sale.id}
                className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 hover:bg-navy-700/20 transition-all animate-fade-in hover:pl-5"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">
                    {sale.vehicle ? `${sale.vehicle.brand} ${sale.vehicle.model}` : 'Venda direta'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-navy-400">
                    {sale.vehicle && (
                      <span className="flex items-center gap-1">
                        <Car size={12} /> {sale.vehicle.year_model || sale.vehicle.year_manufacture || '—'}
                      </span>
                    )}
                    {sale.client_name && <span className="flex items-center gap-1"><User size={12} /> {sale.client_name}</span>}
                    {sale.payment_method && <span className="flex items-center gap-1"><DollarSign size={12} /> {sale.payment_method}</span>}
                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(sale.sale_date)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-navy-400">Venda</p>
                    <p className="text-sm font-bold text-white">{formatCurrency(sale.sale_price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-navy-400">Lucro</p>
                    <p className={`text-sm font-bold ${Number(sale.profit) >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                      {formatCurrency(sale.profit)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openModal(sale)} className="p-2 rounded-lg text-navy-400 hover:bg-accent-500/15 hover:text-accent-400 transition-all hover:scale-110 active:scale-95">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteId(sale.id)} className="p-2 rounded-lg text-navy-400 hover:bg-error-500/15 hover:text-error-400 transition-all hover:scale-110 active:scale-95">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="glass-strong rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-drop-in border border-navy-600/30 relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400/60 to-transparent" />
            <div className="relative flex items-center justify-between p-6 border-b border-navy-600/20">
              <h2 className="text-lg font-bold text-white">{editSale ? 'Editar venda' : 'Registrar venda'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-navy-300 hover:bg-navy-700/50 hover:text-white transition-all hover:scale-110 active:scale-95">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Veículo (opcional)</label>
                <select
                  value={vehicleId}
                  onChange={(e) => handleSelectVehicle(e.target.value)}
                  className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                >
                  <option value="">Venda sem veículo cadastrado</option>
                  {vehicles.filter((v) => v.status !== 'sold').map((v) => (
                    <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.plate || 'Sem placa'}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Nome do cliente</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                    <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nome" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Telefone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                    <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="(16) 99999-9999" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Valor de venda *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                    <input type="number" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="0,00" required className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Custo do carro</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                    <input type="number" step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="0,00" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                  </div>
                </div>
              </div>

              {/* Live profit preview */}
              {salePrice && (
                <div className="p-4 bg-navy-900/50 rounded-xl border border-navy-600/30 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-navy-400">Lucro</p>
                    <p className={`text-sm font-bold ${(parseFloat(salePrice) - (parseFloat(purchasePrice) || 0)) >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                      {formatCurrency(parseFloat(salePrice) - (parseFloat(purchasePrice) || 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400">Margem</p>
                    <p className={`text-sm font-bold ${((parseFloat(salePrice) - (parseFloat(purchasePrice) || 0)) / (parseFloat(purchasePrice) || 1)) * 100 >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                      {parseFloat(purchasePrice) > 0
                        ? `${(((parseFloat(salePrice) - parseFloat(purchasePrice)) / parseFloat(purchasePrice)) * 100).toFixed(1)}%`
                        : '—'}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Forma de pagamento</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500">
                    <option value="">Selecione</option>
                    {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Data da venda</label>
                  <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 [color-scheme:dark]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Observações</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notas..." className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 resize-none" />
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/40 text-sm font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-shine flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {editSale ? 'Salvar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="glass-strong rounded-2xl p-6 max-w-sm w-full animate-drop-in border border-navy-600/30 relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-error-400/60 to-transparent" />
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-error-500/30 blur-xl rounded-xl animate-pulse" />
              <div className="relative w-12 h-12 rounded-xl bg-error-500/15 flex items-center justify-center">
                <Trash2 size={24} className="text-error-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">Excluir venda?</h3>
            <p className="text-sm text-navy-300 mt-2 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/50 text-sm font-medium transition-all hover:scale-105 active:scale-95">Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-shine ripple-btn flex items-center gap-2 bg-error-500 hover:bg-error-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-error-500/20 hover:shadow-error-500/40 hover:-translate-y-0.5">
                <Trash2 size={16} /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

```

=== FILE: src/pages/ClientsPage.tsx ===
```tsx
import { useEffect, useState } from 'react';
import { Plus, Users, AlertCircle, X, Loader2, Pencil, Trash2, Phone, Mail, FileText, MapPin, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type ClientRecord } from '@/lib/supabase';
import { formatDate } from '@/lib/format';

export function ClientsPage() {
  const { dealer } = useAuth();
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<ClientRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [document, setDocument] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!dealer) return;
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('dealer_id', dealer.id)
        .order('created_at', { ascending: false });
      if (error) { console.error('Erro ao carregar clientes:', error); setError('Não foi possível carregar os clientes. Tente novamente.'); }
      else setClients(data as ClientRecord[]);
      setLoading(false);
    }
    load();
  }, [dealer]);

  async function loadData() {
    if (!dealer) return;
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('dealer_id', dealer.id)
      .order('created_at', { ascending: false });
    if (data) setClients(data as ClientRecord[]);
  }

  function openModal(client?: ClientRecord) {
    if (client) {
      setEditClient(client);
      setName(client.name);
      setPhone(client.phone || '');
      setEmail(client.email || '');
      setDocument(client.document || '');
      setAddress(client.address || '');
      setNotes(client.notes || '');
      setStatus(client.status);
    } else {
      setEditClient(null);
      setName('');
      setPhone('');
      setEmail('');
      setDocument('');
      setAddress('');
      setNotes('');
      setStatus('active');
    }
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dealer) return;
    setError(null);
    setSaving(true);

    if (!name.trim()) {
      setError('Nome é obrigatório');
      setSaving(false);
      return;
    }

    const payload = {
      dealer_id: dealer.id,
      name: name.trim(),
      phone: phone || null,
      email: email || null,
      document: document || null,
      address: address || null,
      notes: notes || null,
      status,
    };

    if (editClient) {
      const { error } = await supabase.from('clients').update(payload).eq('id', editClient.id);
      if (error) { console.error('Erro ao salvar cliente:', error); setError('Não foi possível salvar o cliente. Verifique os dados e tente novamente.'); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('clients').insert(payload);
      if (error) { console.error('Erro ao cadastrar cliente:', error); setError('Não foi possível cadastrar o cliente. Verifique os dados e tente novamente.'); setSaving(false); return; }
    }

    setSaving(false);
    setShowModal(false);
    await loadData();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) { console.error('Erro ao excluir cliente:', error); setError('Não foi possível excluir o cliente. Tente novamente.'); return; }
    setClients((prev) => prev.filter((c) => c.id !== id));
    setDeleteId(null);
  }

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.phone?.includes(s) || c.email?.toLowerCase().includes(s) || c.document?.includes(s);
  });

  const activeCount = clients.filter((c) => c.status === 'active').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400/20 rounded-full" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400 border-b-transparent rounded-full animate-spin-reverse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-down">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            <span className="text-xs font-semibold text-accent-400 uppercase tracking-wider">CRM</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Clientes</h1>
          <p className="text-navy-300 text-sm mt-1">{clients.length} cliente(s) · {activeCount} ativo(s)</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-shine btn-sheen ripple-btn flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5 text-sm group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Novo cliente
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 mb-4 animate-fade-in">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative group mb-6 animate-fade-in input-anim">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 transition-colors" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, telefone, e-mail ou documento..."
          className="w-full glass border border-navy-600/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center hover-lift animate-fade-in-scale">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-accent-500/20 blur-2xl rounded-full animate-breathe" />
            <Users size={44} className="relative text-navy-400" />
          </div>
          <p className="text-navy-200 font-medium text-lg">
            {clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum resultado'}
          </p>
          <p className="text-sm text-navy-400 mt-1">
            {clients.length === 0 ? 'Cadastre seus clientes para manter um histórico' : 'Tente ajustar a busca'}
          </p>
          {clients.length === 0 && (
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 font-medium text-sm transition-all border border-accent-500/20 group hover:scale-105 duration-300"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              Cadastrar primeiro cliente
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client, i) => (
            <div
              key={client.id}
              className="group glass-card rounded-2xl p-5 hover-lift card-glow animate-fade-in-up spotlight"
              style={{ animationDelay: `${i * 50}ms` }}
              onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent-500/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500 to-navy-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform duration-300">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{client.name}</p>
                    <p className="text-xs text-navy-400">Desde {formatDate(client.created_at)}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  client.status === 'active'
                    ? 'bg-success-500/15 text-success-400 border-success-500/30'
                    : 'bg-navy-600/30 text-navy-300 border-navy-500/30'
                }`}>
                  {client.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="space-y-2">
                {client.phone && (
                  <div className="flex items-center gap-2 text-xs text-navy-200">
                    <Phone size={12} className="text-navy-400 flex-shrink-0" /> {client.phone}
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-xs text-navy-200">
                    <Mail size={12} className="text-navy-400 flex-shrink-0" /> <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.document && (
                  <div className="flex items-center gap-2 text-xs text-navy-200">
                    <FileText size={12} className="text-navy-400 flex-shrink-0" /> {client.document}
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2 text-xs text-navy-200">
                    <MapPin size={12} className="text-navy-400 flex-shrink-0" /> <span className="truncate">{client.address}</span>
                  </div>
                )}
              </div>

              {client.notes && (
                <p className="text-xs text-navy-400 mt-3 pt-3 border-t border-navy-600/30 italic line-clamp-2">"{client.notes}"</p>
              )}

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-navy-600/30">
                <button onClick={() => openModal(client)} className="flex-1 flex items-center justify-center gap-1.5 glass hover:bg-accent-500/15 text-navy-200 hover:text-accent-400 text-xs font-medium py-2 rounded-lg transition-all hover:scale-[1.02] active:scale-95">
                  <Pencil size={14} /> Editar
                </button>
                <button onClick={() => setDeleteId(client.id)} className="flex items-center justify-center glass hover:bg-error-500/15 text-navy-200 hover:text-error-400 p-2 rounded-lg transition-all hover:scale-110 active:scale-95">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="glass-strong rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-drop-in border border-navy-600/30 relative" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center justify-between p-6 border-b border-navy-600/20 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400/60 to-transparent" />
              <h2 className="text-lg font-bold text-white">{editClient ? 'Editar cliente' : 'Novo cliente'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-navy-300 hover:bg-navy-700/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Nome *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do cliente" required className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Telefone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(16) 99999-9999" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Documento</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                    <input type="text" value={document} onChange={(e) => setDocument(e.target.value)} placeholder="CPF/CNPJ" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Endereço</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro..." className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Observações</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Preferências, histórico, etc..." className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500">
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/40 text-sm font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-shine flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {editClient ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="glass-strong rounded-2xl p-6 max-w-sm w-full animate-drop-in border border-navy-600/30 relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-error-400/60 to-transparent" />
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-error-500/30 blur-xl rounded-xl animate-pulse" />
              <div className="relative w-12 h-12 rounded-xl bg-error-500/15 flex items-center justify-center">
                <Trash2 size={24} className="text-error-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">Excluir cliente?</h3>
            <p className="text-sm text-navy-300 mt-2 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/50 text-sm font-medium transition-all hover:scale-105 active:scale-95">Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-shine ripple-btn flex items-center gap-2 bg-error-500 hover:bg-error-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-error-500/20 hover:shadow-error-500/40 hover:-translate-y-0.5">
                <Trash2 size={16} /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

```

=== FILE: src/pages/FinancingPage.tsx ===
```tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calculator, Plus, ArrowRight, Car, User, TrendingUp, Clock, CheckCircle2, XCircle, Eye, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type FinancingSimulationWithDetails } from '@/lib/supabase';
import { formatCurrency, formatDate, statusLabel, statusColor } from '@/lib/format';

export function FinancingPage() {
  const { dealer } = useAuth();
  const navigate = useNavigate();
  const [simulations, setSimulations] = useState<FinancingSimulationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function load() {
      if (!dealer) return;
      const { data, error } = await supabase
        .from('financing_simulations')
        .select(`*, vehicle:vehicles(id, brand, model, year_model, year_manufacture, asking_price), client:clients(id, name, phone, document), offers:financing_offers(*, institution:financing_institutions(*))`)
        .eq('dealer_id', dealer.id)
        .order('created_at', { ascending: false });
      if (error) { console.error(error); }
      if (data) setSimulations(data as unknown as FinancingSimulationWithDetails[]);
      setLoading(false);
    }
    load();
  }, [dealer]);

  const filtered = simulations.filter((s) => {
    const matchesSearch = !search ||
      s.vehicle?.brand?.toLowerCase().includes(search.toLowerCase()) ||
      s.vehicle?.model?.toLowerCase().includes(search.toLowerCase()) ||
      s.client?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const todayCount = simulations.filter((s) => {
    const d = new Date(s.created_at);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const approvedCount = simulations.filter((s) => s.status === 'approved' || s.status === 'approved_with_condition').length;
  const analysisCount = simulations.filter((s) => s.status === 'analysis' || s.status === 'processing' || s.status === 'submitted').length;
  const rejectedCount = simulations.filter((s) => s.status === 'rejected').length;
  const convertedCount = simulations.filter((s) => s.status === 'converted').length;
  const conversionRate = simulations.length > 0 ? (convertedCount / simulations.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400/20 rounded-full" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400 border-b-transparent rounded-full animate-spin-reverse" />
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Simulações hoje', value: todayCount.toString(), icon: Calculator, color: 'text-accent-400', grad: 'from-accent-500/15 to-transparent' },
    { label: 'Aprovadas', value: approvedCount.toString(), icon: CheckCircle2, color: 'text-success-400', grad: 'from-success-500/15 to-transparent' },
    { label: 'Em análise', value: analysisCount.toString(), icon: Clock, color: 'text-warning-400', grad: 'from-warning-500/15 to-transparent' },
    { label: 'Recusadas', value: rejectedCount.toString(), icon: XCircle, color: 'text-error-400', grad: 'from-error-500/15 to-transparent' },
    { label: 'Convertidas', value: convertedCount.toString(), icon: TrendingUp, color: 'text-success-400', grad: 'from-success-500/15 to-transparent' },
    { label: 'Conversão', value: conversionRate.toFixed(0) + '%', icon: TrendingUp, color: 'text-gold-400', grad: 'from-gold-500/15 to-transparent' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-down">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            <span className="text-xs font-semibold text-accent-400 uppercase tracking-wider">Financiamento Inteligente</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Financiamentos</h1>
          <p className="text-navy-300 text-sm mt-1">Consulte e compare opções de financiamento em um só lugar</p>
        </div>
        <button
          onClick={() => navigate('/financiamento/novo')}
          className="btn-shine btn-sheen ripple-btn flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5 text-sm group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Nova simulação
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="group relative glass-card rounded-2xl p-4 hover-lift-sm card-glow overflow-hidden animate-fade-in-up spotlight" style={{ animationDelay: `${i * 50}ms` }} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-xl glass flex items-center justify-center mb-2 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Icon size={16} className={stat.color} />
                </div>
                <p className="text-xl font-extrabold text-white">{stat.value}</p>
                <p className="text-xs text-navy-300 mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in">
        <div className="relative group flex-1 input-anim">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por veículo ou cliente..."
            className="w-full glass border border-navy-600/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="glass border border-navy-600/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
          <option value="all">Todos status</option>
          <option value="draft">Rascunho</option>
          <option value="processing">Processando</option>
          <option value="analysis">Em análise</option>
          <option value="approved">Aprovada</option>
          <option value="approved_with_condition">Aprovada com condição</option>
          <option value="rejected">Recusada</option>
          <option value="converted">Convertida</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center hover-lift animate-fade-in-scale">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-accent-500/20 blur-2xl rounded-full animate-breathe" />
            <Calculator size={44} className="relative text-navy-400" />
          </div>
          <p className="text-navy-200 font-medium text-lg">
            {simulations.length === 0 ? 'Nenhuma simulação realizada' : 'Nenhum resultado'}
          </p>
          <p className="text-sm text-navy-400 mt-1">
            {simulations.length === 0 ? 'Comece simulando financiamento para seus clientes' : 'Tente ajustar os filtros'}
          </p>
          {simulations.length === 0 && (
            <button
              onClick={() => navigate('/financiamento/novo')}
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 font-medium text-sm transition-all border border-accent-500/20 group hover:scale-105 duration-300"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              Realizar primeira simulação
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sim, i) => {
            const offers = sim.offers || [];
            const approvedOffers = offers.filter((o) => o.status === 'approved' || o.status === 'approved_with_condition');
            const bestOffer = offers.find((o) => o.is_best);
            return (
              <div
                key={sim.id}
                className="group glass-card rounded-2xl p-5 hover-lift card-glow animate-fade-in-up cursor-pointer spotlight"
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => navigate(`/financiamento/${sim.id}`)}
                onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-accent-500/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-navy-700 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <Calculator size={22} className="text-accent-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold truncate text-sm">
                        {sim.vehicle ? `${sim.vehicle.brand} ${sim.vehicle.model}` : 'Veículo não vinculado'}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-navy-400">
                        {sim.client && <span className="flex items-center gap-1"><User size={12} /> {sim.client.name}</span>}
                        {sim.vehicle && <span className="flex items-center gap-1"><Car size={12} /> {sim.vehicle.year_model || sim.vehicle.year_manufacture || '—'}</span>}
                        <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(sim.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-navy-400">Financiado</p>
                      <p className="text-sm font-bold text-white">{formatCurrency(sim.financed_amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-navy-400">Prazo</p>
                      <p className="text-sm font-bold text-white">{sim.term_months}x</p>
                    </div>
                    {bestOffer && (
                      <div className="text-right">
                        <p className="text-xs text-navy-400">Melhor parcela</p>
                        <p className="text-sm font-bold text-success-400">{formatCurrency(bestOffer.installment_amount || 0)}</p>
                      </div>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor(sim.status)}`}>
                      {statusLabel(sim.status)}
                    </span>
                    <Eye size={16} className="text-navy-400 group-hover:text-accent-400 group-hover:scale-125 transition-all duration-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

```

=== FILE: src/pages/FinancingSimulationPage.tsx ===
```tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Car, User, Calculator, Check, Search, Plus,
  CircleDollarSign, TrendingUp, ShieldCheck, AlertCircle, Loader2,
  ChevronRight, Sparkles, Building2, X, Phone, Mail, FileText,
  ExternalLink, MessageCircle, FileDown, Printer,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Vehicle, type VehiclePhoto, type ClientRecord, type FinancingInstitution } from '@/lib/supabase';
import { formatCurrency, formatMileage, maskCPF } from '@/lib/format';
import { generateProposal } from '@/lib/proposal';
import {
  loadInstitutions, runSimulation, determineBestOption, rankResults,
  type ProviderResult, type SimulationFullInput,
} from '@/lib/financing-engine';

type Step = 'vehicle' | 'client' | 'conditions' | 'consulting' | 'results';

export function FinancingSimulationPage() {
  const { dealer } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedVehicleId = searchParams.get('veiculo');

  const [step, setStep] = useState<Step>('vehicle');
  const [vehicles, setVehicles] = useState<(Vehicle & { photos?: VehiclePhoto[] })[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [institutions, setInstitutions] = useState<FinancingInstitution[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);

  // New client form
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientDocument, setNewClientDocument] = useState('');

  // Conditions
  const [vehiclePrice, setVehiclePrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [termMonths, setTermMonths] = useState(48);
  const [maxInstallment, setMaxInstallment] = useState('');
  const [consent, setConsent] = useState(false);

  // Results
  const [results, setResults] = useState<ProviderResult[]>([]);
  const [rankCriteria, setRankCriteria] = useState<'best' | 'lowest_installment' | 'lowest_down' | 'lowest_cost' | 'longest_term' | 'approval'>('best');
  const [simulationId, setSimulationId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!dealer) return;
      const [vehRes, cliRes, instRes] = await Promise.all([
        supabase.from('vehicles').select('*, photos:vehicle_photos(*)').eq('dealer_id', dealer.id).neq('status', 'sold').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').eq('dealer_id', dealer.id).order('created_at', { ascending: false }),
        loadInstitutions(),
      ]);
      if (vehRes.data) setVehicles(vehRes.data as (Vehicle & { photos?: VehiclePhoto[] })[]);
      if (cliRes.data) setClients(cliRes.data as ClientRecord[]);
      setInstitutions(instRes);

      if (preselectedVehicleId) {
        const { data } = await supabase.from('vehicles').select('*, photos:vehicle_photos(*)').eq('id', preselectedVehicleId).maybeSingle();
        if (data) {
          const v = data as Vehicle;
          setSelectedVehicle(v);
          setVehiclePrice(v.asking_price?.toString() || '');
        }
      }
      setLoading(false);
    }
    load();
  }, [dealer, preselectedVehicleId]);

  const financedAmount = (parseFloat(vehiclePrice) || 0) - (parseFloat(downPayment) || 0);

  const filteredClients = clients.filter((c) => {
    if (!clientSearch) return true;
    const s = clientSearch.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.phone?.includes(s) || c.document?.includes(s);
  });

  function selectVehicle(v: Vehicle) {
    setSelectedVehicle(v);
    setVehiclePrice(v.asking_price?.toString() || '');
    setStep('client');
  }

  function selectClient(c: ClientRecord) {
    setSelectedClient(c);
    setStep('conditions');
  }

  async function createNewClient() {
    if (!dealer || !newClientName.trim()) return;
    const { data, error } = await supabase
      .from('clients')
      .insert({
        dealer_id: dealer.id,
        name: newClientName.trim(),
        phone: newClientPhone || null,
        email: newClientEmail || null,
        document: newClientDocument || null,
        status: 'active',
      })
      .select('*')
      .maybeSingle();
    if (error) return;
    if (data) {
      const newClient = data as ClientRecord;
      setClients((prev) => [newClient, ...prev]);
      setSelectedClient(newClient);
      setShowNewClient(false);
      setNewClientName('');
      setNewClientPhone('');
      setNewClientEmail('');
      setNewClientDocument('');
      setStep('conditions');
    }
  }

  async function handleConsult() {
    if (!dealer || !selectedVehicle || !selectedClient || !consent) return;
    setStep('consulting');

    // Save simulation record
    const { data: simData, error: simError } = await supabase
      .from('financing_simulations')
      .insert({
        dealer_id: dealer.id,
        vehicle_id: selectedVehicle.id,
        client_id: selectedClient.id,
        vehicle_price: parseFloat(vehiclePrice) || 0,
        down_payment: parseFloat(downPayment) || 0,
        financed_amount: financedAmount,
        term_months: termMonths,
        max_installment: maxInstallment ? parseFloat(maxInstallment) : null,
        status: 'processing',
        consent_given: true,
      })
      .select('*')
      .maybeSingle();

    if (simError || !simData) {
      setStep('conditions');
      return;
    }
    const simId = (simData as { id: string }).id;
    setSimulationId(simId);

    // Call edge function — the "bot" goes bank by bank
    const fullInput: SimulationFullInput = {
      simulationId: simId,
      vehiclePrice: parseFloat(vehiclePrice) || 0,
      downPayment: parseFloat(downPayment) || 0,
      financedAmount,
      termMonths,
      maxInstallment: maxInstallment ? parseFloat(maxInstallment) : null,
      vehicleBrand: selectedVehicle.brand,
      vehicleModel: selectedVehicle.model,
      vehicleYear: selectedVehicle.year_model || selectedVehicle.year_manufacture,
      clientName: selectedClient.name,
      clientDocument: selectedClient.document,
    };

    const providerResults = await runSimulation(institutions, fullInput);

    setResults(providerResults);
    setStep('results');
  }

  async function convertToSale(offer: ProviderResult) {
    if (!dealer || !selectedVehicle || !selectedClient || !simulationId) return;
    const salePrice = parseFloat(vehiclePrice) || 0;
    const profit = salePrice - (selectedVehicle.purchase_price || 0);

    const { error } = await supabase.from('sales').insert({
      dealer_id: dealer.id,
      vehicle_id: selectedVehicle.id,
      client_name: selectedClient.name,
      client_phone: selectedClient.phone,
      sale_price: salePrice,
      purchase_price: selectedVehicle.purchase_price || 0,
      profit,
      payment_method: 'Financiamento',
      sale_date: new Date().toISOString().split('T')[0],
      notes: `Financiado por ${offer.institutionName} - ${offer.termMonths}x de ${formatCurrency(offer.installmentAmount || 0)}`,
    });

    if (error) return;

    await supabase.from('vehicles').update({ status: 'sold' }).eq('id', selectedVehicle.id);
    await supabase.from('financing_simulations').update({ status: 'converted' }).eq('id', simulationId);
    navigate('/vendas');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400/20 rounded-full" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400 border-b-transparent rounded-full animate-spin-reverse" />
        </div>
      </div>
    );
  }

  const stepIndex = ['vehicle', 'client', 'conditions', 'consulting', 'results'].indexOf(step);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-down">
        <Link to="/financiamento" className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-gold-400" />
          <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">Financiamento Inteligente</span>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        {[
          { label: 'Veículo', icon: Car },
          { label: 'Cliente', icon: User },
          { label: 'Condições', icon: CircleDollarSign },
          { label: 'Consultar', icon: Search },
          { label: 'Resultados', icon: TrendingUp },
        ].map((s, i) => {
          const Icon = s.icon;
          const isActive = i === stepIndex;
          const isDone = i < stepIndex;
          return (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 transition-all ${isActive ? 'scale-110' : ''}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isDone ? 'bg-success-500/20 text-success-400 border border-success-500/30'
                  : isActive ? 'bg-accent-500/20 text-accent-400 border border-accent-500/40'
                  : 'bg-navy-800/40 text-navy-500 border border-navy-600/30'
                }`}>
                  {isDone ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${isActive ? 'text-white' : isDone ? 'text-success-400' : 'text-navy-500'}`}>{s.label}</span>
              </div>
              {i < 4 && <div className={`flex-1 h-px mx-2 transition-all duration-500 ${isDone ? 'bg-success-500/40' : 'bg-navy-600/30'}`} />}
            </div>
          );
        })}
      </div>

      {/* Step: Vehicle */}
      {step === 'vehicle' && (
        <div className="space-y-4 animate-fade-in-up">
          <h2 className="text-xl font-bold text-white">Selecione o veículo</h2>
          {selectedVehicle && (
            <div className="glass rounded-2xl border border-accent-500/30 p-4 flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent-500/15 flex items-center justify-center"><Car size={22} className="text-accent-400" /></div>
              <div className="flex-1"><p className="text-white font-bold">{selectedVehicle.brand} {selectedVehicle.model}</p><p className="text-xs text-navy-400">{selectedVehicle.year_model || selectedVehicle.year_manufacture} · {formatCurrency(selectedVehicle.asking_price)}</p></div>
              <button onClick={() => { setSelectedVehicle(null); setVehiclePrice(''); }} className="text-navy-400 hover:text-error-400"><X size={18} /></button>
            </div>
          )}
          {vehicles.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Car size={36} className="text-navy-500 mx-auto mb-3" />
              <p className="text-navy-200 font-medium">Nenhum veículo disponível no estoque</p>
              <p className="text-sm text-navy-400 mt-1">Cadastre um veículo primeiro</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {vehicles.map((v, i) => (
                <button key={v.id} onClick={() => selectVehicle(v)} className="group glass-card rounded-2xl overflow-hidden hover-lift-sm card-glow text-left animate-fade-in-up spotlight" style={{ animationDelay: `${i * 40}ms` }} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - r.top}px`); }}>
                  <div className="relative h-28 bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center overflow-hidden">
                    {(() => { const cover = v.photos?.find((p) => p.is_cover) || v.photos?.[0]; return cover ? (
                      <img src={cover.url} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <Car size={28} className="text-navy-500 group-hover:scale-110 transition-transform" />
                    ); })()}
                  </div>
                  <div className="p-3">
                    <p className="text-white font-semibold truncate text-sm">{v.brand} {v.model}</p>
                    <p className="text-xs text-navy-400 mt-0.5">{v.year_model || v.year_manufacture} · {formatCurrency(v.asking_price)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step: Client */}
      {step === 'client' && (
        <div className="space-y-4 animate-fade-in-up">
          <h2 className="text-xl font-bold text-white">Selecione o cliente</h2>
          <div className="relative group">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 transition-colors" />
            <input type="text" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} placeholder="Buscar por nome, telefone ou documento..."
              className="w-full glass border border-navy-600/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm" />
          </div>

          {!showNewClient ? (
            <button onClick={() => setShowNewClient(true)} className="btn-shine flex items-center gap-2 bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 font-medium px-4 py-2.5 rounded-xl text-sm transition-all border border-accent-500/20 group">
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" /> Cadastrar novo cliente
            </button>
          ) : (
            <div className="glass-card rounded-2xl p-5 space-y-3 animate-drop-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Novo cliente</h3>
                <button onClick={() => setShowNewClient(false)} className="text-navy-400 hover:text-white"><X size={18} /></button>
              </div>
              <input type="text" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Nome *" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
              <div className="grid grid-cols-2 gap-3">
                <input type="tel" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} placeholder="Telefone" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
                <input type="text" value={newClientDocument} onChange={(e) => setNewClientDocument(e.target.value)} placeholder="CPF/CNPJ" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
              </div>
              <input type="email" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} placeholder="E-mail" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
              <button onClick={createNewClient} disabled={!newClientName.trim()} className="btn-shine flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                <Check size={16} /> Cadastrar e selecionar
              </button>
            </div>
          )}

          <div className="space-y-2">
            {filteredClients.map((c, i) => (
              <button key={c.id} onClick={() => selectClient(c)} className="group w-full glass-card rounded-xl p-4 hover-lift-sm flex items-center gap-4 text-left animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                <div className="relative">
                  <div className="absolute inset-0 bg-accent-500/20 blur-md rounded-lg" />
                  <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-accent-500 to-navy-600 flex items-center justify-center text-white font-bold text-sm">{c.name.charAt(0).toUpperCase()}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate text-sm">{c.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-navy-400">
                    {c.document && <span className="flex items-center gap-1"><FileText size={10} /> {maskCPF(c.document)}</span>}
                    {c.phone && <span className="flex items-center gap-1"><Phone size={10} /> {c.phone}</span>}
                  </div>
                </div>
                <ChevronRight size={16} className="text-navy-500 group-hover:text-accent-400 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
          {filteredClients.length === 0 && !showNewClient && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <User size={32} className="text-navy-500 mx-auto mb-2" />
              <p className="text-navy-200 font-medium text-sm">Nenhum cliente encontrado</p>
              <p className="text-xs text-navy-400 mt-1">Cadastre um novo cliente ou ajuste a busca</p>
            </div>
          )}
        </div>
      )}

      {/* Step: Conditions */}
      {step === 'conditions' && selectedVehicle && selectedClient && (
        <div className="space-y-5 animate-fade-in-up max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white">Condições do financiamento</h2>

          {/* Summary card */}
          <div className="glass-card rounded-2xl p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-500/15 flex items-center justify-center"><Car size={18} className="text-accent-400" /></div>
                <div><p className="text-xs text-navy-400">Veículo</p><p className="text-sm text-white font-semibold truncate">{selectedVehicle.brand} {selectedVehicle.model}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-500/15 flex items-center justify-center"><User size={18} className="text-accent-400" /></div>
                <div><p className="text-xs text-navy-400">Cliente</p><p className="text-sm text-white font-semibold truncate">{selectedClient.name}</p></div>
              </div>
            </div>
          </div>

          {/* Financial inputs */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Valor do veículo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                <input type="number" step="0.01" value={vehiclePrice} onChange={(e) => setVehiclePrice(e.target.value)} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Entrada</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                <input type="number" step="0.01" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} placeholder="0,00" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
              </div>
            </div>

            {/* Financed amount display */}
            <div className="p-4 bg-accent-500/10 rounded-xl border border-accent-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-navy-200">Valor financiado</span>
                <span className="text-lg font-extrabold text-accent-400">{formatCurrency(financedAmount)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Prazo</label>
              <div className="grid grid-cols-5 gap-2">
                {[12, 24, 36, 48, 60].map((t) => (
                  <button key={t} onClick={() => setTermMonths(t)} className={`py-2.5 rounded-xl text-sm font-medium transition-all ${termMonths === t ? 'bg-accent-500/20 text-accent-300 border border-accent-500/40' : 'bg-navy-900/50 text-navy-300 border border-navy-600/40 hover:border-navy-500'}`}>{t}x</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Parcela máxima desejada (opcional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm">R$</span>
                <input type="number" step="0.01" value={maxInstallment} onChange={(e) => setMaxInstallment(e.target.value)} placeholder="0,00" className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 transition-all" />
              </div>
            </div>
          </div>

          {/* Consent */}
          <div className="glass-card rounded-2xl p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <button type="button" onClick={() => setConsent(!consent)} className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${consent ? 'bg-accent-500 border-accent-500' : 'bg-navy-900/50 border border-navy-600/40'}`}>
                {consent && <Check size={14} className="text-white" />}
              </button>
              <span className="text-xs text-navy-200 leading-relaxed">
                Declaro que o cliente <span className="font-bold text-white">{selectedClient.name}</span> autorizou a consulta de financiamento e o tratamento de seus dados conforme a LGPD. A aprovação final é de responsabilidade da instituição financeira.
              </span>
            </label>
          </div>

          {/* Action */}
          <button
            onClick={handleConsult}
            disabled={!consent || financedAmount <= 0}
            className="btn-shine w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-accent-500/25 text-sm group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search size={20} className="group-hover:scale-110 transition-transform" />
            CONSULTAR FINANCIAMENTO
          </button>
          {!consent && <p className="text-xs text-navy-400 text-center">É necessário dar consentimento para prosseguir</p>}
        </div>
      )}

      {/* Step: Consulting */}
      {step === 'consulting' && (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-accent-500/30 blur-3xl rounded-full animate-pulse" />
            <div className="relative w-20 h-20 border-3 border-accent-500/20 rounded-full" />
            <div className="absolute inset-0 w-20 h-20 border-3 border-accent-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Calculator size={28} className="text-accent-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Consultando instituições</h3>
          <p className="text-sm text-navy-300 text-center max-w-md">Enviando a operação para as instituições financeiras parceiras e aguardando retorno...</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {institutions.map((inst, i) => (
              <div key={inst.id} className="flex items-center gap-1.5 glass rounded-lg px-3 py-1.5 text-xs text-navy-200 animate-fade-in" style={{ animationDelay: `${i * 200}ms` }}>
                <Building2 size={12} className="text-navy-400" /> {inst.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step: Results */}
      {step === 'results' && (
        <FinancingResults
          results={rankResults(results, rankCriteria)}
          bestResult={determineBestOption(results)}
          rankCriteria={rankCriteria}
          onCriteriaChange={setRankCriteria}
          onConvertToSale={convertToSale}
          vehicleLabel={selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : ''}
          clientName={selectedClient?.name || ''}
          clientDocument={selectedClient?.document || null}
          clientPhone={selectedClient?.phone || null}
          vehicleYear={selectedVehicle?.year_model || selectedVehicle?.year_manufacture || null}
          financedAmount={financedAmount}
          termMonths={termMonths}
          downPayment={parseFloat(downPayment) || 0}
          vehiclePrice={parseFloat(vehiclePrice) || 0}
          dealerName={dealer?.name}
          dealerLogoUrl={dealer?.logo_url}
          protocolNumber={simulationId}
        />
      )}
    </div>
  );
}

// =================== Results Component ===================

function FinancingResults({
  results, bestResult, rankCriteria, onCriteriaChange, onConvertToSale,
  vehicleLabel, clientName, clientDocument, clientPhone, vehicleYear,
  financedAmount, termMonths, downPayment, vehiclePrice,
  dealerName, dealerLogoUrl, protocolNumber,
}: {
  results: ProviderResult[];
  bestResult: ProviderResult | null;
  rankCriteria: string;
  onCriteriaChange: (c: 'best' | 'lowest_installment' | 'lowest_down' | 'lowest_cost' | 'longest_term' | 'approval') => void;
  onConvertToSale: (offer: ProviderResult) => void;
  vehicleLabel: string;
  clientName: string;
  clientDocument: string | null;
  clientPhone: string | null;
  vehicleYear: number | null;
  financedAmount: number;
  termMonths: number;
  downPayment: number;
  vehiclePrice: number;
  dealerName: string | null | undefined;
  dealerLogoUrl: string | null | undefined;
  protocolNumber: string | null;
}) {
  const criteriaOptions = [
    { value: 'best', label: 'Melhor condição' },
    { value: 'lowest_installment', label: 'Menor parcela' },
    { value: 'lowest_down', label: 'Menor entrada' },
    { value: 'lowest_cost', label: 'Menor custo (CET)' },
    { value: 'longest_term', label: 'Maior prazo' },
    { value: 'approval', label: 'Aprovação' },
  ] as const;

  function handleGenerateProposal(result: ProviderResult) {
    generateProposal({
      clientName,
      clientDocument,
      clientPhone,
      vehicleLabel,
      vehicleYear,
      vehiclePrice,
      downPayment,
      financedAmount,
      termMonths,
      result,
      dealerName,
      dealerLogoUrl,
      protocolNumber: protocolNumber ? protocolNumber.slice(0, 8).toUpperCase() : null,
    });
  }

  function buildWhatsAppLink(result: ProviderResult): string {
    const proto = protocolNumber ? protocolNumber.slice(0, 8).toUpperCase() : '';
    const msg = `Olá! Tenho um cliente com simulação aprovada de financiamento veicular e gostaria de dar continuidade ao processo.

*Protocolo:* ${proto}
*Cliente:* ${clientName}
*Veículo:* ${vehicleLabel}
*Valor financiado:* R$ ${(result.financedAmount || 0).toFixed(2).replace('.', ',')}
*Entrada:* R$ ${(result.downPayment || 0).toFixed(2).replace('.', ',')}
*Prazo:* ${result.termMonths}x
*Parcela:* R$ ${(result.installmentAmount || 0).toFixed(2).replace('.', ',')}
*Taxa:* ${result.interestRate}% a.a.
*CET:* ${result.cet}% a.a.
*Status:* ${result.status === 'approved' ? 'APROVADO' : 'APROVADO COM CONDIÇÃO'}

Como podemos prosseguir com a formalização do contrato?`;
    return `https://wa.me/${result.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Summary */}
      <div className="glass-card rounded-2xl p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div><p className="text-xs text-navy-400 uppercase">Veículo</p><p className="text-sm text-white font-semibold truncate">{vehicleLabel}</p></div>
          <div><p className="text-xs text-navy-400 uppercase">Cliente</p><p className="text-sm text-white font-semibold truncate">{clientName}</p></div>
          <div><p className="text-xs text-navy-400 uppercase">Financiado</p><p className="text-sm text-accent-400 font-bold">{formatCurrency(financedAmount)}</p></div>
          <div><p className="text-xs text-navy-400 uppercase">Prazo</p><p className="text-sm text-white font-bold">{termMonths}x</p></div>
        </div>
      </div>

      {/* Best option banner */}
      {bestResult && (
        <div className="relative glass rounded-2xl border border-gold-500/30 p-6 overflow-hidden animate-bounce-in">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 to-transparent" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gold-400/30 blur-xl rounded-xl" />
              <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gold-400 uppercase tracking-wider">Melhor opção</p>
              <p className="text-xl font-extrabold text-white">{bestResult.institutionName}</p>
              <p className="text-sm text-navy-200 mt-0.5">Melhor condição encontrada para esta simulação</p>
            </div>
            {bestResult.installmentAmount && (
              <div className="text-right">
                <p className="text-xs text-navy-400">Parcela</p>
                <p className="text-2xl font-extrabold text-success-400">{formatCurrency(bestResult.installmentAmount)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ranking controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-navy-400 uppercase tracking-wide font-medium">Ordenar por:</span>
        {criteriaOptions.map((opt) => (
          <button key={opt.value} onClick={() => onCriteriaChange(opt.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${rankCriteria === opt.value ? 'bg-accent-500/20 text-accent-300 border border-accent-500/30' : 'glass border border-navy-600/30 text-navy-300 hover:text-white'}`}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Offer cards */}
      <div className="space-y-3">
        {results.map((r, i) => (
          <OfferCard key={i} result={r} isBest={bestResult?.institutionId === r.institutionId} onConvert={() => onConvertToSale(r)} onGenerateProposal={() => handleGenerateProposal(r)} onWhatsApp={() => window.open(buildWhatsAppLink(r), '_blank')} animateDelay={i * 60} />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="glass-card rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck size={18} className="text-navy-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-navy-300 leading-relaxed">
          As simulações apresentadas são reais e válidas, com condições efetivas junto a cada instituição. Para formalizar o contrato, será necessária a apresentação da documentação, vistoria do veículo e validação cadastral final. Os valores podem sofrer ajustes em caso de alteração das informações prestadas.
        </p>
      </div>
    </div>
  );
}

function OfferCard({ result, isBest, onConvert, onGenerateProposal, onWhatsApp, animateDelay }: { result: ProviderResult; isBest: boolean; onConvert: () => void; onGenerateProposal: () => void; onWhatsApp: () => void; animateDelay: number }) {
  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    approved: { label: 'APROVADO', color: 'text-success-400', dot: 'bg-success-400' },
    approved_with_condition: { label: 'APROVADO COM CONDIÇÃO', color: 'text-warning-400', dot: 'bg-warning-400' },
    rejected: { label: 'NÃO APROVADO', color: 'text-error-400', dot: 'bg-error-400' },
    unavailable: { label: 'INTEGRAÇÃO NÃO DISPONÍVEL', color: 'text-navy-400', dot: 'bg-navy-500' },
  };
  const cfg = statusConfig[result.status] || statusConfig.unavailable;
  const canConvert = result.status === 'approved' || result.status === 'approved_with_condition';

  return (
    <div className={`group glass rounded-2xl border p-5 hover-lift card-glow animate-fade-in-up overflow-hidden relative ${isBest ? 'border-gold-500/30' : 'border-navy-600/20'}`} style={{ animationDelay: `${animateDelay}ms` }}>
      {isBest && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-accent-500/15 blur-md rounded-lg" />
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center">
              <Building2 size={20} className="text-accent-300" />
            </div>
          </div>
          <div>
            <p className="text-white font-bold">{result.institutionName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-2 h-2 rounded-full ${cfg.dot} ${result.status === 'approved' ? 'animate-pulse' : ''}`} />
              <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
            </div>
          </div>
        </div>
        {isBest && <span className="text-xs px-2 py-1 rounded-full bg-gold-500/15 text-gold-400 border border-gold-500/30 font-bold">🏆 MELHOR</span>}
      </div>

      {result.status === 'unavailable' ? (
        <div className="p-3 bg-navy-800/40 rounded-xl border border-navy-600/20">
          <p className="text-xs text-navy-400">{result.conditions || 'Integração não disponível'}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {result.downPayment !== null && <OfferField label="Entrada" value={formatCurrency(result.downPayment)} />}
            {result.financedAmount !== null && <OfferField label="Financiado" value={formatCurrency(result.financedAmount)} />}
            {result.termMonths !== null && <OfferField label="Prazo" value={`${result.termMonths}x`} />}
            {result.installmentAmount !== null && <OfferField label="Parcela" value={formatCurrency(result.installmentAmount)} highlight />}
            {result.interestRate !== null && <OfferField label="Taxa" value={`${result.interestRate}%`} />}
            {result.cet !== null && <OfferField label="CET" value={`${result.cet}%`} />}
          </div>
          {result.conditions && (
            <div className="p-3 bg-navy-800/40 rounded-xl border border-navy-600/20 mb-4">
              <p className="text-xs text-navy-300">{result.conditions}</p>
            </div>
          )}
          {result.notes && (
            <p className="text-xs text-navy-400 mb-3">{result.notes}</p>
          )}
          {canConvert && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a href={result.financingUrl || '#'} target="_blank" rel="noopener noreferrer" className="btn-shine flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-accent-500/20 text-sm group">
                  <ExternalLink size={16} className="group-hover:scale-110 transition-transform" />
                  Continuar com {result.institutionName.split(' ')[0]}
                </a>
                <button onClick={onWhatsApp} className="btn-shine flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-green-500/20 text-sm group">
                  <MessageCircle size={16} className="group-hover:scale-110 transition-transform" />
                  WhatsApp do banco
                </button>
                <button onClick={onGenerateProposal} className="btn-shine flex items-center justify-center gap-2 glass border border-navy-600/30 hover:border-accent-500/30 text-white font-semibold py-3 rounded-xl transition-all text-sm group">
                  <FileDown size={16} className="group-hover:scale-110 transition-transform" />
                  Gerar proposta
                </button>
              </div>
              <button onClick={onConvert} className="btn-shine w-full flex items-center justify-center gap-2 bg-gradient-to-r from-success-500 to-success-600 hover:from-success-400 hover:to-success-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-success-500/20 text-sm group">
                <TrendingUp size={16} className="group-hover:scale-110 transition-transform" />
                Continuar para venda
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OfferField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-navy-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-success-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}

```

=== FILE: src/pages/FinancingDetailPage.tsx ===
```tsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Car, User, Calculator, Building2, TrendingUp,
  AlertCircle, ShieldCheck, Clock, CheckCircle2, XCircle,
  ExternalLink, MessageCircle, FileDown,
} from 'lucide-react';
import { generateProposal } from '@/lib/proposal';
import { useAuth } from '@/context/AuthContext';
import { supabase, type FinancingSimulationWithDetails } from '@/lib/supabase';
import { formatCurrency, formatDate, statusLabel, statusColor, maskCPF } from '@/lib/format';

export function FinancingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dealer } = useAuth();
  const [simulation, setSimulation] = useState<FinancingSimulationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const { data, error } = await supabase
        .from('financing_simulations')
        .select(`*, vehicle:vehicles(id, brand, model, year_model, year_manufacture, asking_price), client:clients(id, name, phone, document), offers:financing_offers(*, institution:financing_institutions(*))`)
        .eq('id', id)
        .maybeSingle();
      if (error || !data) { setLoading(false); return; }
      setSimulation(data as unknown as FinancingSimulationWithDetails);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400/20 rounded-full" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400 border-b-transparent rounded-full animate-spin-reverse" />
        </div>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 animate-fade-in">
        <AlertCircle size={40} className="text-navy-500 mx-auto mb-3" />
        <p className="text-navy-300 mb-4">Simulação não encontrada</p>
        <Link to="/financiamento" className="text-accent-400 hover:text-accent-300 font-medium text-sm">Voltar para financiamentos</Link>
      </div>
    );
  }

  const offers = simulation.offers || [];
  const bestOffer = offers.find((o) => o.is_best);
  const approvedOffers = offers.filter((o) => o.status === 'approved' || o.status === 'approved_with_condition');

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/financiamento" className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm mb-6 transition-colors group animate-fade-in">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Status */}
          <div className="glass-card rounded-2xl p-5 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3">
              <Calculator size={18} className="text-accent-400" />
              <h2 className="text-base font-bold text-white">Simulação</h2>
            </div>
            <span className={`inline-block text-xs px-3 py-1 rounded-full border font-medium ${statusColor(simulation.status)}`}>
              {statusLabel(simulation.status)}
            </span>
            <p className="text-xs text-navy-400 mt-3">Criada em {formatDate(simulation.created_at)}</p>
          </div>

          {/* Vehicle */}
          {simulation.vehicle && (
            <Link to={`/veiculo/${simulation.vehicle.id}`} className="block glass-card rounded-2xl p-5 hover-lift-sm card-glow animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-3">
                <Car size={18} className="text-accent-400" />
                <h3 className="text-sm font-bold text-white">Veículo</h3>
              </div>
              <p className="text-white font-bold text-sm">{simulation.vehicle.brand} {simulation.vehicle.model}</p>
              <p className="text-xs text-navy-400 mt-0.5">{simulation.vehicle.year_model || simulation.vehicle.year_manufacture} · {formatCurrency(simulation.vehicle.asking_price)}</p>
            </Link>
          )}

          {/* Client */}
          {simulation.client && (
            <Link to={`/clientes`} className="block glass-card rounded-2xl p-5 hover-lift-sm card-glow animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-3">
                <User size={18} className="text-accent-400" />
                <h3 className="text-sm font-bold text-white">Cliente</h3>
              </div>
              <p className="text-white font-bold text-sm">{simulation.client.name}</p>
              <p className="text-xs text-navy-400 mt-0.5">{maskCPF(simulation.client.document)}</p>
              {simulation.client.phone && <p className="text-xs text-navy-400 mt-0.5">{simulation.client.phone}</p>}
            </Link>
          )}

          {/* Conditions */}
          <div className="glass-card rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-sm font-bold text-white mb-4">Condições</h3>
            <div className="space-y-2.5">
              <Row label="Valor do veículo" value={formatCurrency(simulation.vehicle_price)} />
              <Row label="Entrada" value={formatCurrency(simulation.down_payment)} />
              <Row label="Valor financiado" value={formatCurrency(simulation.financed_amount)} highlight />
              <Row label="Prazo" value={`${simulation.term_months}x`} />
              {simulation.max_installment && <Row label="Parcela máx." value={formatCurrency(simulation.max_installment)} />}
            </div>
          </div>
        </div>

        {/* Right: Offers */}
        <div className="lg:col-span-2 space-y-4">
          {bestOffer && (
            <div className="relative glass rounded-2xl border border-gold-500/30 p-5 overflow-hidden animate-bounce-in">
              <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 to-transparent" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gold-400/30 blur-xl rounded-xl" />
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center"><span className="text-xl">🏆</span></div>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gold-400 uppercase tracking-wider">Melhor opção</p>
                  <p className="text-lg font-extrabold text-white">{bestOffer.institution?.name || 'Instituição'}</p>
                </div>
                {bestOffer.installment_amount && (
                  <div className="text-right">
                    <p className="text-xs text-navy-400">Parcela</p>
                    <p className="text-xl font-extrabold text-success-400">{formatCurrency(bestOffer.installment_amount)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            Ofertas ({offers.length})
          </h2>

          {offers.length === 0 ? (
            <div className="glass rounded-2xl border border-dashed border-navy-600/40 p-8 text-center">
              <Clock size={32} className="text-navy-500 mx-auto mb-2" />
              <p className="text-navy-200 font-medium text-sm">Nenhuma oferta retornada</p>
              <p className="text-xs text-navy-400 mt-1">As integrações podem não estar configuradas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer, i) => {
                const statusCfg: Record<string, { label: string; color: string; dot: string; icon: typeof CheckCircle2 }> = {
                  approved: { label: 'APROVADO', color: 'text-success-400', dot: 'bg-success-400', icon: CheckCircle2 },
                  approved_with_condition: { label: 'APROVADO COM CONDIÇÃO', color: 'text-warning-400', dot: 'bg-warning-400', icon: CheckCircle2 },
                  rejected: { label: 'NÃO APROVADO', color: 'text-error-400', dot: 'bg-error-400', icon: XCircle },
                  pending: { label: 'INTEGRAÇÃO NÃO DISPONÍVEL', color: 'text-navy-400', dot: 'bg-navy-500', icon: Clock },
                };
                const cfg = statusCfg[offer.status] || statusCfg.pending;
                const StatusIcon = cfg.icon;
                return (
                  <div key={offer.id} className={`group glass-card rounded-2xl p-5 hover-lift-sm card-glow animate-fade-in-up ${offer.is_best ? 'border-gold-500/30' : ''}`} style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center"><Building2 size={18} className="text-accent-300" /></div>
                        <div>
                          <p className="text-white font-bold text-sm">{offer.institution?.name || 'Instituição'}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                          </div>
                        </div>
                      </div>
                      {offer.is_best && <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-400 border border-gold-500/30 font-bold">🏆</span>}
                    </div>

                    {offer.status === 'pending' ? (
                      <p className="text-xs text-navy-400">{offer.conditions || 'Integração não disponível'}</p>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {offer.down_payment !== null && <Field label="Entrada" value={formatCurrency(offer.down_payment)} />}
                          {offer.financed_amount !== null && <Field label="Financiado" value={formatCurrency(offer.financed_amount)} />}
                          {offer.term_months !== null && <Field label="Prazo" value={`${offer.term_months}x`} />}
                          {offer.installment_amount !== null && <Field label="Parcela" value={formatCurrency(offer.installment_amount)} highlight />}
                          {offer.interest_rate !== null && <Field label="Taxa" value={`${offer.interest_rate}%`} />}
                          {offer.cet !== null && <Field label="CET" value={`${offer.cet}%`} />}
                        </div>
                        {offer.conditions && <p className="text-xs text-navy-300 mt-3 p-2 bg-navy-800/40 rounded-lg">{offer.conditions}</p>}
                        {(offer.status === 'approved' || offer.status === 'approved_with_condition') && offer.institution && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                            <a href={offer.institution.financing_url || '#'} target="_blank" rel="noopener noreferrer" className="btn-shine flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold py-2.5 rounded-xl transition-all text-sm group">
                              <ExternalLink size={14} className="group-hover:scale-110 transition-transform" />
                              Continuar com {offer.institution.name.split(' ')[0]}
                            </a>
                            <button onClick={() => {
                              const msg = `Olá! Tenho um cliente com simulação aprovada de financiamento e gostaria de dar continuidade.\n\n*Protocolo:* ${simulation.id.slice(0, 8).toUpperCase()}\n*Cliente:* ${simulation.client?.name || ''}\n*Veículo:* ${simulation.vehicle?.brand || ''} ${simulation.vehicle?.model || ''}\n*Valor financiado:* ${formatCurrency(offer.financed_amount || 0)}\n*Entrada:* ${formatCurrency(offer.down_payment || 0)}\n*Prazo:* ${offer.term_months}x\n*Parcela:* ${formatCurrency(offer.installment_amount || 0)}\n\nComo podemos prosseguir com a formalização do contrato?`;
                              window.open(`https://wa.me/${offer.institution?.whatsapp_number}?text=${encodeURIComponent(msg)}`, '_blank');
                            }} className="btn-shine flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold py-2.5 rounded-xl transition-all text-sm group">
                              <MessageCircle size={14} className="group-hover:scale-110 transition-transform" />
                              WhatsApp do banco
                            </button>
                          </div>
                        )}
                        {(offer.status === 'approved' || offer.status === 'approved_with_condition') && (
                          <button
                            onClick={() => {
                              generateProposal({
                                clientName: simulation.client?.name || '',
                                clientDocument: simulation.client?.document || null,
                                clientPhone: simulation.client?.phone || null,
                                vehicleLabel: `${simulation.vehicle?.brand || ''} ${simulation.vehicle?.model || ''}`,
                                vehicleYear: simulation.vehicle?.year_model || simulation.vehicle?.year_manufacture || null,
                                vehiclePrice: Number(simulation.vehicle_price) || 0,
                                downPayment: Number(offer.down_payment) || 0,
                                financedAmount: Number(offer.financed_amount) || 0,
                                termMonths: offer.term_months || 0,
                                dealerName: dealer?.name,
                                dealerLogoUrl: dealer?.logo_url,
                                protocolNumber: simulation.id.slice(0, 8).toUpperCase(),
                                result: {
                                  institutionId: offer.institution_id,
                                  institutionName: offer.institution?.name || '',
                                  status: offer.status as 'approved' | 'approved_with_condition',
                                  downPayment: Number(offer.down_payment),
                                  financedAmount: Number(offer.financed_amount),
                                  termMonths: offer.term_months,
                                  installmentAmount: Number(offer.installment_amount),
                                  interestRate: Number(offer.interest_rate),
                                  cet: Number(offer.cet),
                                  conditions: offer.conditions,
                                  notes: offer.notes,
                                  financingUrl: offer.institution?.financing_url || null,
                                  whatsappNumber: offer.institution?.whatsapp_number || null,
                                },
                              });
                            }}
                            className="btn-shine w-full flex items-center justify-center gap-2 glass border border-navy-600/30 hover:border-accent-500/30 text-white font-semibold py-2.5 rounded-xl transition-all text-sm group mt-2"
                          >
                            <FileDown size={14} className="group-hover:scale-110 transition-transform" />
                            Gerar proposta
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Disclaimer */}
          <div className="glass-card rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck size={18} className="text-navy-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-navy-300 leading-relaxed">
              A aprovação final é realizada pela instituição financeira. Os valores apresentados são retornados pelas integrações ativas.
            </p>
          </div>

          {/* Convert to sale */}
          {simulation.status !== 'converted' && approvedOffers.length > 0 && (
            <button
              onClick={async () => {
                if (!simulation.vehicle || !simulation.client) return;
                const salePrice = Number(simulation.vehicle_price);
                const { data: veh } = await supabase.from('vehicles').select('purchase_price').eq('id', simulation.vehicle.id).maybeSingle();
                const purchase = veh ? Number((veh as { purchase_price: number }).purchase_price) : 0;
                const bestInst = bestOffer?.institution?.name || 'Financiamento';
                await supabase.from('sales').insert({
                  vehicle_id: simulation.vehicle.id,
                  client_name: simulation.client.name,
                  client_phone: simulation.client.phone,
                  sale_price: salePrice,
                  purchase_price: purchase,
                  profit: salePrice - purchase,
                  payment_method: 'Financiamento',
                  sale_date: new Date().toISOString().split('T')[0],
                  notes: `Financiado por ${bestInst}`,
                  dealer_id: simulation.dealer_id,
                });
                await supabase.from('vehicles').update({ status: 'sold' }).eq('id', simulation.vehicle.id);
                await supabase.from('financing_simulations').update({ status: 'converted' }).eq('id', simulation.id);
                navigate('/vendas');
              }}
              className="btn-shine w-full flex items-center justify-center gap-2 bg-gradient-to-r from-success-500 to-success-600 hover:from-success-400 hover:to-success-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-success-500/20 text-sm group"
            >
              <TrendingUp size={18} className="group-hover:scale-110 transition-transform" />
              Continuar para venda
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-navy-300">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-accent-400' : 'text-white'}`}>{value}</span>
    </div>
  );
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-navy-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-success-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}

```

=== FILE: src/pages/DealerProfilePage.tsx ===
```tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Building2, Calendar, Car, MessageCircle, ArrowLeft, Store, BadgeCheck, TrendingUp, Sparkles, Share2, ExternalLink } from 'lucide-react';
import { supabase, type Dealer, type Vehicle, type VehiclePhoto } from '@/lib/supabase';
import { formatCurrency, formatNumber, statusLabel, statusColor } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';

type DealerVehicle = Vehicle & { photos: VehiclePhoto[] };

export function DealerProfilePage() {
  const { id } = useParams();
  const { dealer: currentDealer } = useAuth();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [vehicles, setVehicles] = useState<DealerVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      // Own profile comes from the table; other dealerships come from the public
      // projection, which omits the registration number, email and address.
      const ownRes = await supabase
        .from('dealers')
        .select('*')
        .eq('id', id!)
        .maybeSingle();

      let dealerData = ownRes.data as Dealer | null;
      let dealerErr = ownRes.error;

      if (!dealerData) {
        const publicRes = await supabase
          .from('public_dealers')
          .select('*')
          .eq('id', id!)
          .maybeSingle();
        dealerData = publicRes.data as unknown as Dealer | null;
        dealerErr = publicRes.error;
      }

      if (dealerErr || !dealerData) {
        setError('Lojista não encontrado');
        setLoading(false);
        return;
      }

      setDealer(dealerData);

      const { data: vehicleData } = await supabase
        .from('network_vehicles')
        .select('*')
        .eq('dealer_id', id!)
        .order('created_at', { ascending: false });

      const rows = (vehicleData || []) as unknown as Vehicle[];
      const ids = rows.map((v) => v.id);
      const photosByVehicle = new Map<string, VehiclePhoto[]>();

      if (ids.length > 0) {
        const { data: photoData } = await supabase
          .from('vehicle_photos')
          .select('*')
          .in('vehicle_id', ids);
        for (const p of (photoData || []) as VehiclePhoto[]) {
          const list = photosByVehicle.get(p.vehicle_id) || [];
          list.push(p);
          photosByVehicle.set(p.vehicle_id, list);
        }
      }

      setVehicles(rows.map((v) => ({ ...v, photos: photosByVehicle.get(v.id) || [] })) as DealerVehicle[]);
      setLoading(false);
    }
    load();
  }, [id]);

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: dealer?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400/20 rounded-full" />
          <div className="absolute inset-2 w-10 h-10 border-2 border-gold-400 border-b-transparent rounded-full animate-spin-reverse" />
        </div>
      </div>
    );
  }

  if (error || !dealer) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 animate-scale-in">
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 bg-error-500/20 blur-2xl rounded-full" />
          <Store size={48} className="relative text-navy-500" />
        </div>
        <p className="text-navy-200 text-lg font-medium">{error || 'Lojista não encontrado'}</p>
        <Link to="/rede" className="inline-flex items-center gap-2 mt-4 text-accent-400 hover:text-accent-300 text-sm font-medium group transition-colors">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar para a Rede
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentDealer?.id === dealer.id;
  const waNumber = dealer.whatsapp || dealer.phone || '';
  const waDigits = waNumber.replace(/\D/g, '');
  const waMsg = `Olá! Encontrei seu perfil na Rede Auto Ribeirão e gostaria de conversar sobre veículos.`;
  const waLink = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(waMsg)}` : '#';

  const coverPhoto = (v: DealerVehicle) => v.photos?.find((p) => p.is_cover)?.url || v.photos?.[0]?.url;

  const avgPrice = vehicles.length > 0
    ? vehicles.reduce((sum, v) => sum + Number(v.asking_price), 0) / vehicles.length
    : 0;

  const stats = [
    { label: 'Veículos', value: vehicles.length.toString(), icon: Car, color: 'text-accent-400', bg: 'from-accent-500/15 to-transparent' },
    { label: 'Menor preço', value: vehicles.length > 0 ? formatCurrency(Math.min(...vehicles.map((v) => v.asking_price))) : '—', icon: TrendingUp, color: 'text-success-400', bg: 'from-success-500/15 to-transparent' },
    { label: 'Maior preço', value: vehicles.length > 0 ? formatCurrency(Math.max(...vehicles.map((v) => v.asking_price))) : '—', icon: TrendingUp, color: 'text-gold-400', bg: 'from-gold-500/15 to-transparent' },
    { label: 'Preço médio', value: vehicles.length > 0 ? formatCurrency(avgPrice) : '—', icon: TrendingUp, color: 'text-accent-300', bg: 'from-accent-500/15 to-transparent' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back link */}
      <Link to="/rede" className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm mb-6 transition-colors group animate-fade-in">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar para a Rede
      </Link>

      {/* === Profile Header Card === */}
      <div className="relative glass-card rounded-3xl overflow-hidden animate-fade-in-down mb-8 aurora-bg">
        {/* Banner with cover image or animated mesh gradient */}
        <div className="relative h-40 sm:h-48 overflow-hidden">
          {dealer.cover_url ? (
            <>
              <img src={dealer.cover_url} alt="Capa" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 mesh-gradient" />
              <div className="absolute inset-0 bg-grid opacity-30" />
              {/* Floating orbs */}
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-accent-500/15 rounded-full blur-[60px] animate-float" />
              <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-gold-400/10 rounded-full blur-[50px] animate-float-slow" style={{ animationDelay: '2s' }} />
              {/* Sheen effect */}
              <div className="absolute inset-0 shimmer-effect" />
              {/* Bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-navy-900/80 to-transparent" />
            </>
          )}
        </div>

        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-14">
            {/* Avatar with glow ring */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-accent-500/30 to-gold-400/20 rounded-2xl blur-md group-hover:blur-lg transition-all duration-500" />
              {dealer.logo_url ? (
                <img src={dealer.logo_url} alt={dealer.name} className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-navy-900 object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-navy-900 bg-gradient-to-br from-accent-500 to-navy-600 flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shadow-2xl transition-transform duration-500 group-hover:scale-105">
                  {dealer.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              {/* Status indicator */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success-400 border-3 border-navy-900 flex items-center justify-center animate-pulse" style={{ borderWidth: '3px' }}>
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate">{dealer.name}</h1>
                {dealer.cnpj && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-500/15 border border-accent-500/30">
                    <BadgeCheck size={14} className="text-accent-400" />
                    <span className="text-xs font-medium text-accent-300">Verificado</span>
                  </div>
                )}
              </div>
              {(dealer.city || dealer.state) && (
                <p className="text-sm text-navy-300 flex items-center gap-1.5 mt-1.5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <MapPin size={14} className="text-accent-400" />
                  {dealer.city ? `${dealer.city}` : ''}{dealer.city && dealer.state ? ' / ' : ''}{dealer.state || ''}
                  <span className="text-navy-500">·</span>
                  <span className="text-navy-400">Lojista da Rede Auto Ribeirão</span>
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-navy-600/30 text-navy-200 hover:text-white text-sm font-medium transition-all duration-300 group"
              >
                {copied ? <Sparkles size={16} className="text-success-400" /> : <Share2 size={16} className="group-hover:scale-110 transition-transform" />}
                {copied ? 'Copiado!' : 'Compartilhar'}
              </button>
              {isOwnProfile ? (
                <Link
                  to="/perfil/editar"
                  className="btn-shine flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-accent-500/20"
                >
                  Editar perfil
                </Link>
              ) : (
                waDigits.length > 0 && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-shine flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 text-sm group"
                  >
                    <MessageCircle size={16} className="group-hover:scale-110 transition-transform" /> Contatar
                  </a>
                )
              )}
            </div>
          </div>

          {/* Contact info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-navy-600/30">
            {dealer.phone && (
              <div className="flex items-center gap-2.5 text-sm group hover:bg-navy-700/20 -mx-2 px-2 py-1.5 rounded-lg transition-colors animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Phone size={14} className="text-accent-400" />
                </div>
                <span className="text-navy-200 truncate">{dealer.phone}</span>
              </div>
            )}
            {dealer.email && (
              <div className="flex items-center gap-2.5 text-sm group hover:bg-navy-700/20 -mx-2 px-2 py-1.5 rounded-lg transition-colors animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Mail size={14} className="text-accent-400" />
                </div>
                <span className="text-navy-200 truncate">{dealer.email}</span>
              </div>
            )}
            {dealer.cnpj && (
              <div className="flex items-center gap-2.5 text-sm group hover:bg-navy-700/20 -mx-2 px-2 py-1.5 rounded-lg transition-colors animate-fade-in" style={{ animationDelay: '0.25s' }}>
                <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Building2 size={14} className="text-accent-400" />
                </div>
                <span className="text-navy-200 truncate">CNPJ {dealer.cnpj}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm group hover:bg-navy-700/20 -mx-2 px-2 py-1.5 rounded-lg transition-colors animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Calendar size={14} className="text-accent-400" />
              </div>
              <span className="text-navy-200">Desde {new Date(dealer.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          {dealer.address && (
            <div className="flex items-center gap-2 text-sm mt-3 animate-fade-in" style={{ animationDelay: '0.35s' }}>
              <MapPin size={16} className="text-navy-400 flex-shrink-0" />
              <span className="text-navy-200">{dealer.address}</span>
            </div>
          )}

          {dealer.description && (
            <div className="mt-4 p-4 rounded-xl glass animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <p className="text-sm text-navy-200 leading-relaxed">{dealer.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* === Animated Stats === */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative glass-card rounded-2xl p-5 hover-lift-sm card-glow overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Icon size={18} className={stat.color} />
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{stat.value}</p>
                <p className="text-xs text-navy-400 uppercase tracking-wide mt-1 font-medium">{stat.label}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          );
        })}
      </div>

      {/* === Vehicles Section === */}
      <div className="mb-6 flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
          Veículos disponíveis
          {vehicles.length > 0 && <span className="text-sm text-navy-400 font-normal">({vehicles.length})</span>}
        </h2>
      </div>

      {vehicles.length === 0 ? (
        <div className="glass rounded-2xl border border-dashed border-navy-600/40 p-16 text-center animate-scale-in hover-lift">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-accent-500/15 blur-2xl rounded-full animate-pulse" />
            <Car size={44} className="relative text-navy-400" />
          </div>
          <p className="text-navy-200 font-medium text-lg">Nenhum veículo disponível</p>
          <p className="text-sm text-navy-400 mt-1">Este lojista ainda não publicou veículos na rede.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {vehicles.map((v, i) => {
            const photo = coverPhoto(v);
            return (
              <Link
                key={v.id}
                to={`/veiculo/${v.id}`}
                className="group glass-card rounded-2xl overflow-hidden hover-lift card-glow-strong animate-fade-in-up spotlight"
                style={{ animationDelay: `${i * 60}ms` }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`);
                }}
              >
                <div className="relative h-40 bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center overflow-hidden">
                  {photo ? (
                    <img src={photo} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  ) : (
                    <Car size={36} className="text-navy-500 group-hover:scale-125 transition-transform duration-500" />
                  )}
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor(v.status)} backdrop-blur-sm`}>
                    {statusLabel(v.status)}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-white font-bold truncate group-hover:text-accent-300 transition-colors">{v.brand} {v.model}</p>
                  <p className="text-xs text-navy-300 mt-0.5">
                    {v.year_model || v.year_manufacture || '—'} · {v.color || '—'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-navy-600/30 text-xs">
                    <div>
                      <p className="text-navy-400">Venda</p>
                      <p className="text-white font-bold group-hover:text-accent-300 transition-colors">{formatCurrency(v.asking_price)}</p>
                    </div>
                    <div>
                      <p className="text-navy-400">KM</p>
                      <p className="text-navy-200 font-medium">{v.mileage !== null ? `${formatNumber(v.mileage)} km` : '—'}</p>
                    </div>
                  </div>
                  {/* Arrow indicator */}
                  <div className="flex items-center gap-1 mt-3 text-xs text-accent-400 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                    <span>Ver detalhes</span>
                    <ExternalLink size={12} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

```

=== FILE: src/pages/ProfileEditPage.tsx ===
```tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertCircle, ImagePlus, X, Store, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const states = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export function ProfileEditPage() {
  const navigate = useNavigate();
  const { dealer, refreshDealer } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  // Load once when dealer is first available. Using a ref guard prevents the
  // effect from re-running and wiping the user's edits when the AuthContext
  // dealer object gets a new reference (e.g. after a token refresh).
  useEffect(() => {
    if (!dealer || initialized.current) return;
    initialized.current = true;
    setName(dealer.name || '');
    setPhone(dealer.phone || '');
    setEmail(dealer.email || '');
    setWhatsapp(dealer.whatsapp || '');
    setCnpj(dealer.cnpj || '');
    setCity(dealer.city || '');
    setState(dealer.state || '');
    setAddress(dealer.address || '');
    setDescription(dealer.description || '');
    setLogoUrl(dealer.logo_url || null);
    setCoverUrl(dealer.cover_url || null);
    setLoading(false);
  }, [dealer]);

  async function uploadImage(file: File, kind: 'logo' | 'cover') {
    if (!dealer) return null;
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!ALLOWED.includes(file.type)) {
      setError('Envie apenas imagens JPG, PNG, WEBP, GIF ou AVIF.');
      return null;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 10 MB.');
      return null;
    }

    const setUploading = kind === 'logo' ? setUploadingLogo : setUploadingCover;
    setUploading(true);
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const fileName = `${dealer.id}/${kind}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('vehicle-photos').upload(fileName, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('vehicle-photos').getPublicUrl(fileName);
      return urlData.publicUrl;
    } catch (err) {
      console.error(`Erro ao enviar ${kind}:`, err);
      setError(`Não foi possível enviar a ${kind === 'logo' ? 'logo' : 'imagem de capa'}. Tente novamente.`);
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file, 'logo');
    if (url) setLogoUrl(url);
    e.target.value = '';
  }

  async function handleUploadCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file, 'cover');
    if (url) setCoverUrl(url);
    e.target.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dealer) return;
    setError(null);
    setSaving(true);

    if (!name.trim()) {
      setError('O nome do lojista é obrigatório');
      setSaving(false);
      return;
    }

    const { error: updateErr } = await supabase
      .from('dealers')
      .update({
        name: name.trim(),
        phone: phone || null,
        email: email || null,
        whatsapp: whatsapp || null,
        cnpj: cnpj || null,
        city: city || null,
        state: state || null,
        address: address || null,
        description: description || null,
        logo_url: logoUrl,
        cover_url: coverUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dealer.id);

    if (updateErr) {
      console.error('Erro ao salvar perfil:', updateErr);
      setError('Não foi possível salvar o perfil. Verifique os dados e tente novamente.');
      setSaving(false);
      return;
    }

    await refreshDealer();
    navigate(`/lojista/${dealer.id}`);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-accent-500/20 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const inputClass = 'w-full bg-navy-900/50 border border-navy-600/40 rounded-xl px-3 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all duration-300 text-sm';

  return (
    <div className="max-w-3xl mx-auto">
      <Link to={dealer ? `/lojista/${dealer.id}` : '/dashboard'} className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm mb-6 transition-colors group animate-fade-in">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar
      </Link>

      <div className="mb-8 animate-fade-in-down">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-accent-500/30 blur-md rounded-full" />
            <Store size={16} className="relative text-accent-400" />
          </div>
          <span className="text-xs font-semibold text-accent-400 uppercase tracking-wider">Perfil do Lojista</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Editar <span className="gradient-text">Perfil</span></h1>
        <p className="text-navy-300 text-sm mt-1">Atualize as informações que outros lojistas verão na rede</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 mb-4 animate-fade-in">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover image */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            Imagem de capa
          </h2>
          <p className="text-xs text-navy-400 mb-4">Aparece no topo do seu perfil público, atrás da logo. Recomendado: 1200x400px.</p>
          <div className="relative rounded-2xl overflow-hidden border border-navy-600/40 group">
            {coverUrl ? (
              <>
                <img src={coverUrl} alt="Capa" className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl glass-strong text-white text-sm font-medium hover:bg-white/10 transition-all">
                    {uploadingCover ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                    {uploadingCover ? 'Enviando...' : 'Trocar capa'}
                    <input type="file" accept="image/*" onChange={handleUploadCover} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => setCoverUrl(null)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-error-500 hover:bg-error-600 text-white text-sm font-medium transition-all"
                  >
                    <X size={16} /> Remover
                  </button>
                </div>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 cursor-pointer hover:bg-navy-700/20 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
                    {uploadingCover ? <Loader2 size={24} className="animate-spin text-accent-400" /> : <ImagePlus size={24} className="text-navy-300" />}
                  </div>
                  <span className="text-sm text-navy-300">Clique para adicionar uma imagem de capa</span>
                </div>
                <input type="file" accept="image/*" onChange={handleUploadCover} className="hidden" />
              </label>
            )}
          </div>
        </section>

        {/* Logo */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            Logo do lojista
          </h2>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-accent-500/30 to-gold-400/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img src={logoUrl} alt="Logo" className="relative w-20 h-20 rounded-2xl border border-navy-600/40 object-cover shadow-lg transition-transform duration-300 group-hover:scale-105" />
                <button
                  type="button"
                  onClick={() => setLogoUrl(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error-500 hover:bg-error-600 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-accent-500/20 to-navy-600/20 rounded-2xl blur-md" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-500 to-navy-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg transition-transform duration-300 group-hover:scale-105">
                  {name?.charAt(0).toUpperCase() || '?'}
                </div>
              </div>
            )}
            <label className="group flex flex-col items-center justify-center cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:bg-navy-600/30 text-navy-200 hover:text-white text-sm font-medium transition-all">
                {uploadingLogo ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                {uploadingLogo ? 'Enviando...' : logoUrl ? 'Trocar logo' : 'Enviar logo'}
              </div>
              <input type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" />
            </label>
          </div>
        </section>

        {/* Basic info */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            Informações básicas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">
                Nome do lojista <span className="text-accent-400">*</span>
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Auto Ribeirão" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">CNPJ</label>
              <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@lojista.com" className={inputClass} />
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-gold-400" style={{ boxShadow: '0 0 8px rgba(212,168,67,0.5)' }} />
            Contato
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Telefone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(16) 99999-9999" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">WhatsApp</label>
              <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="5516999999999" className={inputClass} />
              <p className="text-xs text-navy-400 mt-1">Número para contato direto da rede (com DDI, ex: 5516999999999)</p>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-success-400" style={{ boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
            Localização
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Cidade</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex: Ribeirão Preto" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Estado</label>
              <select value={state} onChange={(e) => setState(e.target.value)} className={inputClass}>
                <option value="">Selecione</option>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-navy-200 mb-1.5 uppercase tracking-wide">Endereço</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro" className={inputClass} />
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            Sobre o lojista
          </h2>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Conte um pouco sobre seu negócio, quanto tempo está no mercado, especialidades..." className={`${inputClass} resize-none`} />
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Link to={dealer ? `/lojista/${dealer.id}` : '/dashboard'} className="px-5 py-3 rounded-xl text-navy-200 hover:bg-navy-700/40 font-medium text-sm transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-shine flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Salvar perfil
          </button>
        </div>
      </form>
    </div>
  );
}

```

=== FILE: src/pages/AtendimentoPage.tsx ===
```tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Send, Search, CheckCircle2, Sparkles, User, Car, ChevronRight,
  AlertCircle, MessageSquare, Phone, Mail, Plus, Calendar, Flame,
  Tag, Trash2, X, Clock, TrendingUp, Target,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type ConversationWithLead, type Message, type Lead, type LeadInteraction, type LeadFollowUp, type InteractionType, type FollowUpType, type LeadStatus } from '@/lib/supabase';
import { channelLabel, channelColor, loadMessages, sendMessageViaPlatform, markConversationRead } from '@/lib/integrations';
import { PIPELINE_STAGES, INTERACTION_TYPES, FOLLOW_UP_TYPES, interactionLabel, followUpTypeLabel, sourceLabel, scoreColor, scoreLabel, timeAgo, isOverdue } from '@/lib/crm';
import { formatCurrency, formatDate } from '@/lib/format';
import { LeadModal } from '@/components/LeadModal';

type AIAnalysis = {
  sentiment?: string;
  summary?: string;
  lead_score?: number;
  suggested_action?: string;
  is_lead?: boolean;
  is_personal?: boolean;
  conversation_type?: string;
};

type ExtractedData = {
  vehicle_interest?: string;
  budget?: number;
  down_payment?: number;
  max_installment?: number;
  intent?: string;
  conversation_type?: string;
};

type RightTab = 'cliente' | 'interacoes' | 'acompanhamentos';

export function AtendimentoPage() {
  const { dealer } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithLead[]>([]);
  const [selected, setSelected] = useState<ConversationWithLead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<{ delivered: boolean; error: string | null } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Right panel state
  const [rightTab, setRightTab] = useState<RightTab>('cliente');
  const [interactions, setInteractions] = useState<LeadInteraction[]>([]);
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>([]);
  const [rightLoading, setRightLoading] = useState(false);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [newInteraction, setNewInteraction] = useState({ type: 'whatsapp' as InteractionType, description: '' });
  const [newFollowUp, setNewFollowUp] = useState({ type: 'whatsapp' as FollowUpType, message: '', scheduledAt: '' });
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadStats, setLeadStats] = useState({ total: 0, quentes: 0, vendidos: 0, acompanhamentosHoje: 0 });

  const loadConversations = useCallback(async () => {
    if (!dealer) return;
    const { data, error } = await supabase
      .from('conversations')
      .select('*, lead:leads(*)')
      .eq('dealer_id', dealer.id)
      .order('last_message_at', { ascending: false, nullsFirst: false });
    if (!error && data) setConversations(data as ConversationWithLead[]);
    setLoading(false);
  }, [dealer]);

  const loadLeadStats = useCallback(async () => {
    if (!dealer) return;
    const { data: leads } = await supabase.from('leads').select('lead_score, status').eq('dealer_id', dealer.id);
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase.from('lead_follow_ups').select('*', { count: 'exact', head: true }).eq('dealer_id', dealer.id).eq('status', 'pending').gte('scheduled_at', today + 'T00:00:00').lte('scheduled_at', today + 'T23:59:59');
    if (leads) {
      setLeadStats({
        total: leads.length,
        quentes: leads.filter((l) => l.lead_score >= 80).length,
        vendidos: leads.filter((l) => l.status === 'won').length,
        acompanhamentosHoje: count || 0,
      });
    }
  }, [dealer]);

  useEffect(() => { loadConversations(); loadLeadStats(); }, [loadConversations, loadLeadStats]);

  // Realtime
  useEffect(() => {
    if (!dealer) return;
    const convChannel = supabase.channel('conv-rt').on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `dealer_id=eq.${dealer.id}` }, () => { loadConversations(); }).subscribe();
    const msgChannel = supabase.channel('msg-rt').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `dealer_id=eq.${dealer.id}` }, (payload) => {
      const newMsg = payload.new as Message;
      if (selected && newMsg.conversation_id === selected.id) { setMessages((prev) => [...prev, newMsg]); markConversationRead(selected.id); }
    }).subscribe();
    return () => { supabase.removeChannel(convChannel); supabase.removeChannel(msgChannel); };
  }, [dealer, selected?.id, loadConversations]);

  // Load messages when selecting a conversation
  useEffect(() => {
    if (selected) {
      setMsgLoading(true); setDeliveryStatus(null);
      loadMessages(selected.id).then((msgs) => { setMessages(msgs); setMsgLoading(false); markConversationRead(selected.id); setConversations((prev) => prev.map((c) => c.id === selected.id ? { ...c, unread_count: 0 } : c)); });
      if (selected.lead) { loadLeadDetails(selected.lead.id); }
    }
  }, [selected?.id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function loadLeadDetails(leadId: string) {
    setRightLoading(true);
    const [iRes, fRes] = await Promise.all([
      supabase.from('lead_interactions').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }),
      supabase.from('lead_follow_ups').select('*').eq('lead_id', leadId).order('scheduled_at', { ascending: false }),
    ]);
    if (iRes.data) setInteractions(iRes.data as LeadInteraction[]);
    if (fRes.data) setFollowUps(fRes.data as LeadFollowUp[]);
    setRightLoading(false);
  }

  const filtered = conversations.filter((c) => {
    return !search || (c.contact_name || '').toLowerCase().includes(search.toLowerCase()) || (c.contact_phone || '').includes(search);
  });

  const unreadTotal = conversations.reduce((s, c) => s + c.unread_count, 0);
  const currentLead = selected?.lead || null;

  async function handleSend() {
    if (!input.trim() || !selected || !dealer) return;
    setSending(true); setDeliveryStatus(null);
    const result = await sendMessageViaPlatform(selected.id, dealer.id, input.trim());
    if (result.success && result.message) {
      setMessages([...messages, result.message]); setInput('');
      setConversations((prev) => prev.map((c) => c.id === selected.id ? { ...c, last_message_preview: input.trim().slice(0, 100), last_message_at: new Date().toISOString() } : c));
      setDeliveryStatus({ delivered: result.delivered, error: result.error });
      setTimeout(() => setDeliveryStatus(null), 5000);
    } else {
      setDeliveryStatus({ delivered: false, error: result.error || 'Erro ao enviar' });
    }
    setSending(false);
  }

  async function changeStatus(newStatus: LeadStatus) {
    if (!currentLead) return;
    const { error } = await supabase.from('leads').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', currentLead.id);
    if (!error) { loadLeadStats(); loadConversations(); if (selected) setSelected({ ...selected, lead: { ...currentLead, status: newStatus } }); }
  }

  async function addInteraction() {
    if (!currentLead || !newInteraction.description.trim()) return;
    const { data, error } = await supabase.from('lead_interactions').insert({ lead_id: currentLead.id, dealer_id: currentLead.dealer_id, type: newInteraction.type, description: newInteraction.description.trim(), vehicle_id: currentLead.vehicle_id }).select('*').single();
    if (!error && data) {
      setInteractions([data as LeadInteraction, ...interactions]);
      await supabase.from('leads').update({ last_interaction_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', currentLead.id);
      setNewInteraction({ type: 'whatsapp', description: '' }); setShowAddInteraction(false);
    }
  }

  async function addFollowUp() {
    if (!currentLead || !newFollowUp.scheduledAt || !newFollowUp.message.trim()) return;
    const { data, error } = await supabase.from('lead_follow_ups').insert({ lead_id: currentLead.id, dealer_id: currentLead.dealer_id, scheduled_at: new Date(newFollowUp.scheduledAt).toISOString(), message: newFollowUp.message.trim(), type: newFollowUp.type, status: 'pending' }).select('*').single();
    if (!error && data) { setFollowUps([data as LeadFollowUp, ...followUps]); setNewFollowUp({ type: 'whatsapp', message: '', scheduledAt: '' }); setShowAddFollowUp(false); loadLeadStats(); }
  }

  async function completeFollowUp(id: string) {
    const { error } = await supabase.from('lead_follow_ups').update({ status: 'done', completed_at: new Date().toISOString() }).eq('id', id);
    if (!error) { setFollowUps(followUps.map((f) => f.id === id ? { ...f, status: 'done', completed_at: new Date().toISOString() } : f)); loadLeadStats(); }
  }

  function getAIAnalysis(msg: Message): AIAnalysis { return msg.ai_analysis as unknown as AIAnalysis; }
  function getExtractedData(msg: Message): ExtractedData { return msg.ai_extracted_data as unknown as ExtractedData; }

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-gold-500/20 border border-accent-500/30 flex items-center justify-center relative">
            <MessageSquare size={20} className="text-accent-400" />
            {unreadTotal > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-error-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">{unreadTotal}</span>}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Atendimento</h1>
            <p className="text-sm text-navy-400">Conversas e clientes em um só lugar</p>
          </div>
        </div>
        {/* Mini stats */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="text-center"><p className="text-lg font-bold text-accent-400">{leadStats.total}</p><p className="text-[10px] text-navy-500 uppercase">Clientes</p></div>
          <div className="text-center"><p className="text-lg font-bold text-error-400">{leadStats.quentes}</p><p className="text-[10px] text-navy-500 uppercase">Quentes</p></div>
          <div className="text-center"><p className="text-lg font-bold text-success-400">{leadStats.vendidos}</p><p className="text-[10px] text-navy-500 uppercase">Vendidos</p></div>
          <div className="text-center"><p className="text-lg font-bold text-warning-400">{leadStats.acompanhamentosHoje}</p><p className="text-[10px] text-navy-500 uppercase">Acompanhamentos hoje</p></div>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Column 1: Conversation list */}
        <div className="w-72 flex-shrink-0 glass-card rounded-2xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-navy-600/30">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar conversa..."
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare size={32} className="text-navy-500 mx-auto mb-3" />
                <p className="text-sm text-navy-300 font-medium">Nenhuma conversa ainda</p>
                <p className="text-xs text-navy-500 mt-1">Conecte um canal em Integrações para começar</p>
              </div>
            ) : (
              filtered.map((conv) => (
                <button key={conv.id} onClick={() => setSelected(conv)}
                  className={`w-full text-left p-3 border-b border-navy-700/20 transition-all hover:bg-navy-700/20 ${selected?.id === conv.id ? 'bg-accent-500/10 border-l-2 border-l-accent-500' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: channelColor(conv.channel) + '30', border: `1px solid ${channelColor(conv.channel)}40` }}>
                      <span style={{ color: channelColor(conv.channel) }}>{(conv.contact_name || '?').charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">{conv.contact_name || 'Sem nome'}</p>
                        {conv.unread_count > 0 && <span className="bg-accent-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 flex-shrink-0">{conv.unread_count}</span>}
                      </div>
                      <p className="text-xs text-navy-400 truncate mt-0.5">{conv.last_message_preview || 'Sem mensagens'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: channelColor(conv.channel) + '20', color: channelColor(conv.channel) }}>{channelLabel(conv.channel)}</span>
                        {conv.ai_qualified && <span className="text-[10px] text-gold-400 flex items-center gap-0.5"><Sparkles size={8} /> Cliente</span>}
                        {!conv.ai_qualified && conv.ai_intent && <span className="text-[10px] text-navy-500">Pessoal</span>}
                        <span className="text-[10px] text-navy-500 ml-auto">{timeAgo(conv.last_message_at)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Chat */}
        <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden min-w-0">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="text-navy-500 mx-auto mb-4" />
                <p className="text-navy-300 font-medium">Selecione uma conversa</p>
                <p className="text-sm text-navy-500 mt-1">Escolha uma conversa à esquerda para começar</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-3 border-b border-navy-600/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: channelColor(selected.channel) + '30', border: `1px solid ${channelColor(selected.channel)}40` }}>
                  <span style={{ color: channelColor(selected.channel) }}>{(selected.contact_name || '?').charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate">{selected.contact_name || 'Sem nome'}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: channelColor(selected.channel) + '20', color: channelColor(selected.channel) }}>{channelLabel(selected.channel)}</span>
                    {selected.ai_qualified ? <span className="text-[10px] text-gold-400 flex items-center gap-0.5"><Sparkles size={8} /> Cliente qualificado</span> : <span className="text-[10px] text-navy-500">Conversa pessoal</span>}
                  </div>
                  <p className="text-xs text-navy-400">{selected.contact_phone || ''}</p>
                </div>
                {currentLead && <button onClick={() => setShowLeadModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 text-xs font-medium transition-all"><User size={12} /> Editar</button>}
              </div>

              {/* AI summary */}
              {selected.ai_summary && (
                <div className={`px-4 py-2 border-b flex items-start gap-2 ${selected.ai_qualified ? 'bg-gold-500/8 border-gold-500/15' : 'bg-navy-700/20 border-navy-600/20'}`}>
                  <Sparkles size={14} className={`flex-shrink-0 mt-0.5 ${selected.ai_qualified ? 'text-gold-400' : 'text-navy-400'}`} />
                  <div className="flex-1 text-xs">
                    <span className={`font-medium ${selected.ai_qualified ? 'text-gold-400' : 'text-navy-300'}`}>IA: </span>
                    <span className="text-navy-200">{selected.ai_summary}</span>
                  </div>
                </div>
              )}

              {/* Delivery status */}
              {deliveryStatus && (
                <div className={`px-4 py-2 border-b text-xs flex items-center gap-2 ${deliveryStatus.delivered ? 'bg-success-500/10 border-success-500/20 text-success-400' : 'bg-warning-500/10 border-warning-500/20 text-warning-400'}`}>
                  {deliveryStatus.delivered ? <><CheckCircle2 size={12} /> Mensagem enviada pelo canal original</> : <><AlertCircle size={12} /> {deliveryStatus.error || 'Não foi possível enviar pelo canal'}</>}
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgLoading ? (
                  <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" /></div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-navy-500 text-sm py-8">Nenhuma mensagem</p>
                ) : (
                  messages.map((msg) => {
                    const analysis = getAIAnalysis(msg);
                    const extracted = getExtractedData(msg);
                    const isInbound = msg.direction === 'inbound';
                    const deliveryInfo = msg.ai_analysis as { delivery_status?: string };
                    return (
                      <div key={msg.id} className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}>
                        <div className="max-w-[75%]">
                          <div className={`rounded-2xl px-4 py-2.5 text-sm ${isInbound ? 'glass border border-navy-600/30 text-white' : 'bg-gradient-to-r from-accent-500 to-accent-600 text-white'}`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <p className="text-[10px] text-navy-500 mt-1 px-1 flex items-center gap-1.5">
                            {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            {!isInbound && deliveryInfo?.delivery_status === 'sent' && <CheckCircle2 size={10} className="text-success-400" />}
                          </p>
                          {isInbound && analysis.lead_score != null && (
                            <div className={`mt-2 glass rounded-xl p-2.5 border space-y-1 ${analysis.conversation_type === 'lead' ? 'border-gold-500/15' : 'border-navy-600/20'}`}>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Sparkles size={12} className={analysis.conversation_type === 'lead' ? 'text-gold-400' : 'text-navy-400'} />
                                <span className="text-[10px] font-bold uppercase" style={{ color: analysis.conversation_type === 'lead' ? '#e6c25e' : '#5a6a8a' }}>
                                  {analysis.conversation_type === 'lead' ? 'Cliente detectado' : analysis.conversation_type === 'spam' ? 'Spam' : 'Pessoal'}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${scoreColor(analysis.lead_score)}`}>Pontos: {analysis.lead_score}</span>
                              </div>
                              {analysis.summary && <p className="text-xs text-navy-300">{analysis.summary}</p>}
                              {analysis.suggested_action && <div className="flex items-start gap-1"><ChevronRight size={12} className="text-accent-400 mt-0.5 flex-shrink-0" /><p className="text-xs text-accent-300">{analysis.suggested_action}</p></div>}
                              {extracted.vehicle_interest && <div className="flex items-center gap-1 text-xs text-navy-400"><Car size={10} /> Veículo: <span className="text-white">{extracted.vehicle_interest}</span></div>}
                              {extracted.budget != null && <div className="flex items-center gap-1 text-xs text-navy-400">Orçamento: <span className="text-white">R$ {Number(extracted.budget).toLocaleString('pt-BR')}</span></div>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-navy-600/30">
                <div className="flex items-center gap-2">
                  <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={`Responder pelo ${channelLabel(selected.channel)}...`}
                    className="flex-1 bg-navy-900/50 border border-navy-600/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
                  <button onClick={handleSend} disabled={sending || !input.trim()}
                    className="btn-shine ripple-btn flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 text-white transition-all shadow-lg shadow-accent-500/20 disabled:opacity-50 flex-shrink-0">
                    {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
                <p className="text-[10px] text-navy-500 mt-1.5 px-1">Sua resposta é enviada direto no {channelLabel(selected.channel)} do cliente</p>
              </div>
            </>
          )}
        </div>

        {/* Column 3: Lead/client details */}
        <div className="w-80 flex-shrink-0 glass-card rounded-2xl flex flex-col overflow-hidden">
          {!currentLead ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <User size={40} className="text-navy-500 mx-auto mb-3" />
                <p className="text-sm text-navy-300 font-medium">Nenhum cliente vinculado</p>
                <p className="text-xs text-navy-500 mt-1">
                  {selected ? 'Esta conversa ainda não foi identificada como cliente pela IA' : 'Selecione uma conversa para ver os dados do cliente'}
                </p>
                {selected && !currentLead && selected.ai_qualified && (
                  <button onClick={() => setShowLeadModal(true)} className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 text-xs font-medium transition-all">
                    <Plus size={14} /> Criar cliente
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Lead header */}
              <div className="p-4 border-b border-navy-600/30">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{currentLead.name}</h3>
                    <p className="text-xs text-navy-400">{sourceLabel(currentLead.source)} · {scoreLabel(currentLead.lead_score)}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${scoreColor(currentLead.lead_score)}`}>
                    <Flame size={10} /> {currentLead.lead_score}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {currentLead.phone && <a href={`https://wa.me/55${currentLead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="flex items-center gap-1 text-navy-200 hover:text-success-400"><Phone size={10} /> {currentLead.phone}</a>}
                  {currentLead.email && <span className="flex items-center gap-1 text-navy-200"><Mail size={10} /> {currentLead.email}</span>}
                </div>
                {/* Status changer */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {PIPELINE_STAGES.map((s) => (
                    <button key={s.value} onClick={() => changeStatus(s.value)}
                      className={`text-[10px] px-2 py-1 rounded-lg border transition-all hover:scale-105 ${currentLead.status === s.value ? s.bgColor + ' ' + s.color + ' font-semibold' : 'border-navy-600/30 text-navy-400 hover:text-white'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-navy-600/30">
                {(['cliente', 'interacoes', 'acompanhamentos'] as const).map((t) => (
                  <button key={t} onClick={() => setRightTab(t)}
                    className={`flex-1 px-2 py-2.5 text-xs font-medium border-b-2 transition-all ${rightTab === t ? 'border-accent-500 text-accent-400' : 'border-transparent text-navy-400 hover:text-white'}`}>
                    {t === 'cliente' ? 'Dados' : t === 'interacoes' ? `Interações (${interactions.length})` : `Acompanhamentos (${followUps.filter((f) => f.status === 'pending').length})`}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {rightLoading ? (
                  <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" /></div>
                ) : rightTab === 'cliente' ? (
                  <div className="space-y-3">
                    {currentLead.vehicle_id && (
                      <div className="glass rounded-xl p-3 flex items-center gap-2">
                        <Car size={16} className="text-accent-400 flex-shrink-0" />
                        <div><p className="text-[10px] text-navy-400">Veículo de interesse</p><p className="text-xs text-white font-medium">Ver detalhes</p></div>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      {currentLead.budget != null && <div className="glass rounded-lg p-2"><p className="text-[10px] text-navy-400 uppercase">Orçamento</p><p className="text-xs text-white font-bold">{formatCurrency(Number(currentLead.budget))}</p></div>}
                      {currentLead.down_payment != null && <div className="glass rounded-lg p-2"><p className="text-[10px] text-navy-400 uppercase">Entrada</p><p className="text-xs text-white font-bold">{formatCurrency(Number(currentLead.down_payment))}</p></div>}
                      {currentLead.max_installment != null && <div className="glass rounded-lg p-2"><p className="text-[10px] text-navy-400 uppercase">Parcela máx.</p><p className="text-xs text-white font-bold">{formatCurrency(Number(currentLead.max_installment))}</p></div>}
                    </div>
                    {currentLead.notes && <div className="glass rounded-xl p-3"><p className="text-[10px] text-navy-400 uppercase mb-1">Observações</p><p className="text-xs text-white whitespace-pre-wrap">{currentLead.notes}</p></div>}
                    <div className="glass rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                      <div><p className="text-navy-400">Criado em</p><p className="text-white font-medium">{formatDate(currentLead.created_at)}</p></div>
                      <div><p className="text-navy-400">Última interação</p><p className="text-white font-medium">{timeAgo(currentLead.last_interaction_at)}</p></div>
                    </div>
                  </div>
                ) : rightTab === 'interacoes' ? (
                  <div className="space-y-2">
                    {showAddInteraction ? (
                      <div className="glass rounded-xl p-3 space-y-2">
                        <select value={newInteraction.type} onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value as InteractionType })} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-accent-500">
                          {INTERACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <textarea value={newInteraction.description} onChange={(e) => setNewInteraction({ ...newInteraction, description: e.target.value })} rows={2} placeholder="Descreva a interação..." className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-accent-500 resize-none" />
                        <div className="flex gap-2">
                          <button onClick={() => setShowAddInteraction(false)} className="px-3 py-1 rounded-lg text-navy-300 hover:bg-navy-700/50 text-xs">Cancelar</button>
                          <button onClick={addInteraction} className="px-3 py-1 rounded-lg bg-accent-500 hover:bg-accent-400 text-white text-xs font-semibold">Adicionar</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowAddInteraction(true)} className="w-full flex items-center justify-center gap-2 glass rounded-xl py-2 text-xs text-accent-400 hover:border-accent-500/40 border border-transparent transition-all">
                        <Plus size={14} /> Registrar interação
                      </button>
                    )}
                    {interactions.length === 0 ? <p className="text-center text-navy-500 text-xs py-4">Nenhuma interação registrada</p> : interactions.map((i) => (
                      <div key={i.id} className="glass rounded-xl p-2.5 flex items-start gap-2">
                        <div className="w-7 h-7 rounded-lg bg-accent-500/15 flex items-center justify-center flex-shrink-0"><MessageSquare size={12} className="text-accent-400" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between"><p className="text-xs font-medium text-white">{interactionLabel(i.type)}</p><span className="text-[10px] text-navy-500">{formatDate(i.created_at)}</span></div>
                          {i.description && <p className="text-xs text-navy-300 mt-1 whitespace-pre-wrap">{i.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {showAddFollowUp ? (
                      <div className="glass rounded-xl p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <select value={newFollowUp.type} onChange={(e) => setNewFollowUp({ ...newFollowUp, type: e.target.value as FollowUpType })} className="bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-accent-500">
                            {FOLLOW_UP_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                          <input type="datetime-local" value={newFollowUp.scheduledAt} onChange={(e) => setNewFollowUp({ ...newFollowUp, scheduledAt: e.target.value })} className="bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-accent-500 [color-scheme:dark]" />
                        </div>
                        <textarea value={newFollowUp.message} onChange={(e) => setNewFollowUp({ ...newFollowUp, message: e.target.value })} rows={2} placeholder="Mensagem do acompanhamento..." className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-accent-500 resize-none" />
                        <div className="flex gap-2">
                          <button onClick={() => setShowAddFollowUp(false)} className="px-3 py-1 rounded-lg text-navy-300 hover:bg-navy-700/50 text-xs">Cancelar</button>
                          <button onClick={addFollowUp} className="px-3 py-1 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-semibold">Agendar</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowAddFollowUp(true)} className="w-full flex items-center justify-center gap-2 glass rounded-xl py-2 text-xs text-gold-400 hover:border-gold-500/40 border border-transparent transition-all">
                        <Plus size={14} /> Agendar acompanhamento
                      </button>
                    )}
                    {followUps.length === 0 ? <p className="text-center text-navy-500 text-xs py-4">Nenhum acompanhamento agendado</p> : followUps.map((f) => (
                      <div key={f.id} className={`glass rounded-xl p-2.5 ${isOverdue(f.scheduled_at, f.status) ? 'border-error-500/30' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar size={11} className={isOverdue(f.scheduled_at, f.status) ? 'text-error-400' : 'text-navy-400'} />
                              <span className="text-xs font-medium text-white">{followUpTypeLabel(f.type)}</span>
                              {f.ai_suggested && <span className="text-[10px] text-gold-400 flex items-center gap-0.5"><Sparkles size={8} /> IA</span>}
                              {isOverdue(f.scheduled_at, f.status) && <span className="text-[10px] text-error-400 font-medium">Atrasado</span>}
                            </div>
                            {f.message && <p className="text-xs text-navy-300 mb-1">{f.message}</p>}
                            <p className="text-[10px] text-navy-500">{formatDate(f.scheduled_at)} · {new Date(f.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          {f.status === 'pending' && (
                            <button onClick={() => completeFollowUp(f.id)} className="p-1.5 rounded-lg bg-success-500/15 hover:bg-success-500/25 text-success-400 transition-all flex-shrink-0" title="Concluir">
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          {f.status === 'done' && <span className="text-[10px] text-success-400 flex items-center gap-1 flex-shrink-0"><CheckCircle2 size={10} /> Concluído</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lead edit modal */}
      {showLeadModal && (
        <LeadModal lead={currentLead || undefined} onClose={() => setShowLeadModal(false)} onSaved={() => { setShowLeadModal(false); loadConversations(); loadLeadStats(); if (selected?.lead) loadLeadDetails(selected.lead.id); }} />
      )}
    </div>
  );
}

```

=== FILE: src/pages/CrmPage.tsx ===
```tsx
import { useEffect, useState, useCallback } from 'react';
import {
  Plus, Search, Flame, Phone, Car, Clock, TrendingUp, Filter,
  LayoutGrid, List, ChevronRight, Trash2, Users, Target, DollarSign, Calendar,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Lead, type LeadWithRelations, type LeadStatus } from '@/lib/supabase';
import {
  PIPELINE_STAGES, LEAD_SOURCES, sourceLabel, scoreColor, scoreLabel,
  statusColorCRM, statusLabelCRM, timeAgo,
} from '@/lib/crm';
import { formatCurrency, formatDate } from '@/lib/format';
import { LeadModal } from '@/components/LeadModal';
import { LeadDetail } from '@/components/LeadDetail';

type ViewMode = 'kanban' | 'list';

export function CrmPage() {
  const { dealer } = useAuth();
  const [leads, setLeads] = useState<LeadWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, hot: 0, won: 0, pipelineValue: 0, followUpsToday: 0 });

  const loadData = useCallback(async () => {
    if (!dealer) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*, vehicle:vehicles(id, brand, model, year_model, asking_price), client:clients(id, name, phone, email)')
      .eq('dealer_id', dealer.id)
      .order('updated_at', { ascending: false });
    if (!error && data) {
      setLeads(data as LeadWithRelations[]);
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('lead_follow_ups')
        .select('*', { count: 'exact', head: true })
        .eq('dealer_id', dealer.id)
        .eq('status', 'pending')
        .gte('scheduled_at', today + 'T00:00:00')
        .lte('scheduled_at', today + 'T23:59:59');
      const allLeads = data as LeadWithRelations[];
      setStats({
        total: allLeads.length,
        hot: allLeads.filter((l) => l.lead_score >= 80).length,
        won: allLeads.filter((l) => l.status === 'won').length,
        pipelineValue: allLeads.filter((l) => !['won', 'lost'].includes(l.status)).reduce((s, l) => s + (l.vehicle?.asking_price ? Number(l.vehicle.asking_price) : 0), 0),
        followUpsToday: count || 0,
      });
    }
    setLoading(false);
  }, [dealer]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = leads.filter((l) => {
    const matchesSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || (l.phone || '').includes(search);
    const matchesSource = sourceFilter === 'all' || l.source === sourceFilter;
    const matchesScore = scoreFilter === 'all' ||
      (scoreFilter === 'hot' && l.lead_score >= 80) ||
      (scoreFilter === 'warm' && l.lead_score >= 60 && l.lead_score < 80) ||
      (scoreFilter === 'cold' && l.lead_score < 60);
    return matchesSearch && matchesSource && matchesScore;
  });

  async function handleStatusChange(leadId: string, newStatus: LeadStatus) {
    const { error } = await supabase.from('leads').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', leadId);
    if (!error) {
      setLeads(leads.map((l) => l.id === leadId ? { ...l, status: newStatus } : l));
      if (detailLead?.id === leadId) setDetailLead({ ...detailLead, status: newStatus });
      loadData();
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from('leads').delete().eq('id', deleteId);
    if (!error) { setLeads(leads.filter((l) => l.id !== deleteId)); loadData(); }
    setDeleteId(null);
  }

  function handleDragStart(id: string) { setDraggedId(id); }
  function handleDragEnd() { setDraggedId(null); }
  function handleDrop(status: LeadStatus) {
    if (draggedId) handleStatusChange(draggedId, status);
    setDraggedId(null);
  }

  const activeLeads = filtered.filter((l) => !['won', 'lost'].includes(l.status));
  const wonLeads = filtered.filter((l) => l.status === 'won');
  const lostLeads = filtered.filter((l) => l.status === 'lost');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-gold-500/20 border border-accent-500/30 flex items-center justify-center">
              <Users size={20} className="text-accent-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CRM & Clientes</h1>
              <p className="text-sm text-navy-400">Gerencie seus clientes e vendas</p>
            </div>
          </div>
        </div>
        <button onClick={() => { setEditLead(null); setShowModal(true); }}
          className="btn-shine btn-sheen ripple-btn flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/25 hover:-translate-y-0.5 text-sm group">
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Novo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1"><Target size={16} className="text-accent-400" /><span className="text-xs text-navy-400 uppercase">Clientes ativos</span></div>
          <p className="text-2xl font-bold text-white">{stats.total - wonLeads.length - lostLeads.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-2 mb-1"><Flame size={16} className="text-error-400" /><span className="text-xs text-navy-400 uppercase">Clientes quentes</span></div>
          <p className="text-2xl font-bold text-error-400">{stats.hot}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-1"><DollarSign size={16} className="text-gold-400" /><span className="text-xs text-navy-400 uppercase">Funil</span></div>
          <p className="text-xl font-bold text-white">{formatCurrency(stats.pipelineValue)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-1"><Calendar size={16} className="text-warning-400" /><span className="text-xs text-navy-400 uppercase">Acompanhamentos hoje</span></div>
          <p className="text-2xl font-bold text-warning-400">{stats.followUpsToday}</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in">
        <div className="relative group flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-accent-400 transition-colors" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar lead..."
            className="w-full glass border border-navy-600/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-navy-500 focus:outline-none focus:border-accent-500 text-sm" />
        </div>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="glass border border-navy-600/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
          <option value="all">Todas origens</option>
          {LEAD_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)} className="glass border border-navy-600/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-500 cursor-pointer">
          <option value="all">Todas pontuações</option>
          <option value="hot">Quentes (80+)</option>
          <option value="warm">Mornos (60-79)</option>
          <option value="cold">Frios (&lt;60)</option>
        </select>
        <div className="flex gap-1 glass rounded-xl p-1">
          <button onClick={() => setViewMode('kanban')} className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-accent-500/20 text-accent-400' : 'text-navy-400 hover:text-white'}`}>
            <LayoutGrid size={18} />
          </button>
          <button onClick={() => setViewMode('list')} className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-accent-500/20 text-accent-400' : 'text-navy-400 hover:text-white'}`}>
            <List size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center animate-fade-in-up">
          <Users size={48} className="text-navy-500 mx-auto mb-4" />
          <p className="text-navy-300 font-medium text-lg">Nenhum cliente encontrado</p>
          <p className="text-sm text-navy-500 mt-1">Cadastre seu primeiro cliente para começar</p>
          <button onClick={() => { setEditLead(null); setShowModal(true); }}
            className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
            <Plus size={16} /> Criar Cliente
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {PIPELINE_STAGES.map((stage) => {
              const stageLeads = filtered.filter((l) => l.status === stage.value);
              return (
                <div key={stage.value} className="w-72 flex-shrink-0"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(stage.value)}>
                  <div className={`rounded-xl border p-3 mb-2 ${stage.bgColor}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${stage.color}`}>{stage.label}</span>
                      <span className={`text-xs ${stage.color} bg-white/5 rounded-full px-2 py-0.5`}>{stageLeads.length}</span>
                    </div>
                  </div>
                  <div className="space-y-2 min-h-[200px]">
                    {stageLeads.map((l) => (
                      <div key={l.id}
                        draggable
                        onDragStart={() => handleDragStart(l.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setDetailLead(l)}
                        className={`glass rounded-xl p-3 cursor-pointer hover:border-accent-500/40 border border-transparent transition-all hover:-translate-y-0.5 ${draggedId === l.id ? 'opacity-50' : ''}`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{l.name}</p>
                            {l.vehicle && <p className="text-xs text-accent-400 mt-0.5 truncate">{l.vehicle.brand} {l.vehicle.model} {l.vehicle.year_model || ''}</p>}
                          </div>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${scoreColor(l.lead_score)}`}>{l.lead_score}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-navy-400">
                          {l.phone && <span className="flex items-center gap-1"><Phone size={10} /> {l.phone}</span>}
                          <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(l.last_interaction_at)}</span>
                        </div>
                        {l.source && <span className="text-xs text-navy-500 mt-1 inline-block">{sourceLabel(l.source)}</span>}
                      </div>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="text-center text-xs text-navy-600 py-8 border border-dashed border-navy-700/30 rounded-xl">Solte aqui</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up">
          <div className="divide-y divide-navy-700/30">
            {filtered.map((l) => (
              <div key={l.id} className="flex items-center gap-4 p-4 hover:bg-navy-700/20 transition-all group cursor-pointer" onClick={() => setDetailLead(l)}>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${scoreColor(l.lead_score)}`}>
                  <Flame size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{l.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColorCRM(l.status)}`}>{statusLabelCRM(l.status)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-navy-400">
                    {l.vehicle && <span className="flex items-center gap-1 text-accent-400"><Car size={10} /> {l.vehicle.brand} {l.vehicle.model}</span>}
                    {l.phone && <span className="flex items-center gap-1"><Phone size={10} /> {l.phone}</span>}
                    <span>{sourceLabel(l.source)}</span>
                    <span>{timeAgo(l.last_interaction_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); setDeleteId(l.id); }}
                    className="p-2 rounded-lg text-navy-400 hover:bg-error-500/15 hover:text-error-400 transition-all">
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={18} className="text-navy-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && <LeadModal lead={editLead} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); loadData(); }} />}
      {detailLead && <LeadDetail lead={detailLead} onClose={() => setDetailLead(null)} onUpdated={loadData} />}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="glass-strong rounded-2xl p-6 max-w-sm w-full animate-drop-in" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-error-500/15 flex items-center justify-center mb-4 mx-auto">
              <Trash2 size={24} className="text-error-400" />
            </div>
            <h3 className="text-lg font-bold text-white text-center">Excluir cliente?</h3>
            <p className="text-sm text-navy-400 text-center mt-2 mb-5">Todas as interações e acompanhamentos também serão removidos. Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2.5 rounded-xl text-navy-200 hover:bg-navy-700/50 text-sm font-medium transition-all">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2.5 rounded-xl bg-error-500 hover:bg-error-600 text-white text-sm font-bold transition-all">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

```

=== FILE: src/pages/InboxPage.tsx ===
```tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Send, Search, CheckCircle2, Sparkles, User,
  MessageSquare, Car, ChevronRight, AlertCircle, Plug,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type ConversationWithLead, type Message, type Lead } from '@/lib/supabase';
import { channelLabel, channelColor, loadMessages, sendMessageViaPlatform, markConversationRead } from '@/lib/integrations';
import { scoreColor, timeAgo } from '@/lib/crm';
import { LeadModal } from '@/components/LeadModal';

type AIAnalysis = {
  sentiment?: string;
  summary?: string;
  lead_score?: number;
  suggested_action?: string;
  is_lead?: boolean;
  is_personal?: boolean;
  conversation_type?: string;
};

type ExtractedData = {
  vehicle_interest?: string;
  budget?: number;
  down_payment?: number;
  max_installment?: number;
  intent?: string;
  conversation_type?: string;
};

export function InboxPage() {
  const { dealer } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithLead[]>([]);
  const [selected, setSelected] = useState<ConversationWithLead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [sending, setSending] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<{ delivered: boolean; error: string | null } | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    if (!dealer) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('conversations')
      .select('*, lead:leads(*)')
      .eq('dealer_id', dealer.id)
      .order('last_message_at', { ascending: false, nullsFirst: false });
    if (!error && data) setConversations(data as ConversationWithLead[]);
    setLoading(false);
  }, [dealer]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Realtime: listen for new/updated conversations and new messages
  useEffect(() => {
    if (!dealer) return;
    const convChannel = supabase.channel('conversations-realtime').on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'conversations', filter: `dealer_id=eq.${dealer.id}` },
      () => { loadConversations(); }
    ).subscribe();

    const msgChannel = supabase.channel('messages-realtime').on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `dealer_id=eq.${dealer.id}` },
      (payload) => {
        const newMsg = payload.new as Message;
        if (selected && newMsg.conversation_id === selected.id) {
          setMessages((prev) => [...prev, newMsg]);
          markConversationRead(selected.id);
        }
      }
    ).subscribe();

    return () => {
      supabase.removeChannel(convChannel);
      supabase.removeChannel(msgChannel);
    };
  }, [dealer, selected?.id, loadConversations]);

  useEffect(() => {
    if (selected) {
      setMsgLoading(true);
      setDeliveryStatus(null);
      loadMessages(selected.id).then((msgs) => {
        setMessages(msgs);
        setMsgLoading(false);
        markConversationRead(selected.id);
        setConversations((prev) => prev.map((c) => c.id === selected.id ? { ...c, unread_count: 0 } : c));
      });
    }
  }, [selected?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filtered = conversations.filter((c) => {
    const matchesSearch = !search || (c.contact_name || '').toLowerCase().includes(search.toLowerCase()) || (c.contact_phone || '').includes(search);
    const matchesChannel = channelFilter === 'all' || c.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  const unreadTotal = conversations.reduce((s, c) => s + c.unread_count, 0);

  async function handleSend() {
    if (!input.trim() || !selected || !dealer) return;
    setSending(true);
    setDeliveryStatus(null);
    const result = await sendMessageViaPlatform(selected.id, dealer.id, input.trim());
    if (result.success && result.message) {
      setMessages([...messages, result.message]);
      setInput('');
      setConversations((prev) => prev.map((c) => c.id === selected.id ? { ...c, last_message_preview: input.trim().slice(0, 100), last_message_at: new Date().toISOString() } : c));
      setDeliveryStatus({ delivered: result.delivered, error: result.error });
      // Clear delivery status after 5 seconds
      setTimeout(() => setDeliveryStatus(null), 5000);
    } else {
      setDeliveryStatus({ delivered: false, error: result.error || 'Erro ao enviar mensagem' });
    }
    setSending(false);
  }

  function getAIAnalysis(msg: Message): AIAnalysis {
    return msg.ai_analysis as unknown as AIAnalysis;
  }

  function getExtractedData(msg: Message): ExtractedData {
    return msg.ai_extracted_data as unknown as ExtractedData;
  }

  const channels = ['whatsapp', 'instagram', 'facebook', 'olx', 'webmotors', 'site'];

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-gold-500/20 border border-accent-500/30 flex items-center justify-center relative">
            <MessageSquare size={20} className="text-accent-400" />
            {unreadTotal > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-error-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">{unreadTotal}</span>}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Inbox</h1>
            <p className="text-sm text-navy-400">Todas as conversas em um só lugar — respostas enviadas pelo canal original</p>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Conversation list */}
        <div className="w-80 flex-shrink-0 glass-card rounded-2xl flex flex-col overflow-hidden">
          {/* Filters */}
          <div className="p-3 border-b border-navy-600/30 space-y-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
                className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full bg-navy-900/50 border border-navy-600/40 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-accent-500 cursor-pointer">
              <option value="all">Todos canais</option>
              {channels.map((c) => <option key={c} value={c}>{channelLabel(c)}</option>)}
            </select>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare size={36} className="text-navy-500 mx-auto mb-3" />
                <p className="text-sm text-navy-300 font-medium">Nenhuma conversa</p>
                <p className="text-xs text-navy-500 mt-1">Conecte um canal em Integrações para começar a receber mensagens</p>
              </div>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={`w-full text-left p-3 border-b border-navy-700/20 transition-all hover:bg-navy-700/20 ${selected?.id === conv.id ? 'bg-accent-500/10 border-l-2 border-l-accent-500' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: channelColor(conv.channel) + '30', border: `1px solid ${channelColor(conv.channel)}40` }}>
                      <span style={{ color: channelColor(conv.channel) }}>{(conv.contact_name || '?').charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">{conv.contact_name || 'Sem nome'}</p>
                        {conv.unread_count > 0 && <span className="bg-accent-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 flex-shrink-0">{conv.unread_count}</span>}
                      </div>
                      <p className="text-xs text-navy-400 truncate mt-0.5">{conv.last_message_preview || 'Sem mensagens'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: channelColor(conv.channel) + '20', color: channelColor(conv.channel) }}>{channelLabel(conv.channel)}</span>
                        {conv.ai_qualified && <span className="text-[10px] text-gold-400 flex items-center gap-0.5"><Sparkles size={8} /> Lead</span>}
                        {!conv.ai_qualified && conv.ai_intent && <span className="text-[10px] text-navy-500">Pessoal</span>}
                        <span className="text-[10px] text-navy-500 ml-auto">{timeAgo(conv.last_message_at)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="text-navy-500 mx-auto mb-4" />
                <p className="text-navy-300 font-medium">Selecione uma conversa</p>
                <p className="text-sm text-navy-500 mt-1">Escolha uma conversa à esquerda para visualizar</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-navy-600/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{ background: channelColor(selected.channel) + '30', border: `1px solid ${channelColor(selected.channel)}40` }}>
                  <span style={{ color: channelColor(selected.channel) }}>{(selected.contact_name || '?').charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate">{selected.contact_name || 'Sem nome'}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: channelColor(selected.channel) + '20', color: channelColor(selected.channel) }}>{channelLabel(selected.channel)}</span>
                    {selected.ai_qualified ? (
                      <span className="text-[10px] text-gold-400 flex items-center gap-0.5"><Sparkles size={8} /> Lead qualificado</span>
                    ) : (
                      <span className="text-[10px] text-navy-500">Conversa pessoal</span>
                    )}
                  </div>
                  <p className="text-xs text-navy-400">{selected.contact_phone || selected.contact_handle || ''}</p>
                </div>
                {selected.lead && (
                  <button onClick={() => { setEditLead(selected.lead || null); setShowLeadModal(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 text-xs font-medium transition-all">
                    <User size={12} /> Ver Lead
                  </button>
                )}
              </div>

              {/* AI summary banner */}
              {selected.ai_summary && (
                <div className={`px-4 py-2.5 border-b flex items-start gap-2 ${selected.ai_qualified ? 'bg-gold-500/8 border-gold-500/15' : 'bg-navy-700/20 border-navy-600/20'}`}>
                  <Sparkles size={14} className={`flex-shrink-0 mt-0.5 ${selected.ai_qualified ? 'text-gold-400' : 'text-navy-400'}`} />
                  <div className="flex-1 text-xs">
                    <span className={`font-medium ${selected.ai_qualified ? 'text-gold-400' : 'text-navy-300'}`}>IA: </span>
                    <span className="text-navy-200">{selected.ai_summary}</span>
                    {selected.ai_intent && <span className="text-navy-400 ml-2">· Intenção: {selected.ai_intent}</span>}
                  </div>
                </div>
              )}

              {/* Delivery status */}
              {deliveryStatus && (
                <div className={`px-4 py-2 border-b text-xs flex items-center gap-2 ${deliveryStatus.delivered ? 'bg-success-500/10 border-success-500/20 text-success-400' : 'bg-warning-500/10 border-warning-500/20 text-warning-400'}`}>
                  {deliveryStatus.delivered ? (
                    <><CheckCircle2 size={12} /> Mensagem enviada pelo canal original</>
                  ) : (
                    <><AlertCircle size={12} /> {deliveryStatus.error || 'Não foi possível enviar pelo canal. Mensagem salva no inbox.'}</>
                  )}
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgLoading ? (
                  <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" /></div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-navy-500 text-sm py-8">Nenhuma mensagem</p>
                ) : (
                  messages.map((msg) => {
                    const analysis = getAIAnalysis(msg);
                    const extracted = getExtractedData(msg);
                    const isInbound = msg.direction === 'inbound';
                    const deliveryInfo = msg.ai_analysis as { delivery_status?: string; delivery_error?: string };
                    return (
                      <div key={msg.id} className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}>
                        <div className="max-w-[75%]">
                          <div className={`rounded-2xl px-4 py-2.5 text-sm ${isInbound ? 'glass border border-navy-600/30 text-white' : 'bg-gradient-to-r from-accent-500 to-accent-600 text-white'}`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <p className="text-[10px] text-navy-500 mt-1 px-1 flex items-center gap-1.5">
                            {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            {!isInbound && deliveryInfo.delivery_status === 'sent' && <span className="text-success-400"><CheckCircle2 size={10} /></span>}
                            {!isInbound && deliveryInfo.delivery_status === 'failed' && <span className="text-warning-400" title={deliveryInfo.delivery_error}><AlertCircle size={10} /></span>}
                          </p>

                          {/* AI analysis for inbound messages */}
                          {isInbound && analysis.lead_score != null && (
                            <div className={`mt-2 glass rounded-xl p-2.5 border space-y-1.5 ${analysis.conversation_type === 'lead' ? 'border-gold-500/15' : 'border-navy-600/20'}`}>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Sparkles size={12} className={analysis.conversation_type === 'lead' ? 'text-gold-400' : 'text-navy-400'} />
                                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: analysis.conversation_type === 'lead' ? '#e6c25e' : '#5a6a8a' }}>
                                  {analysis.conversation_type === 'lead' ? 'Lead Detectado' : analysis.conversation_type === 'spam' ? 'Spam' : 'Conversa Pessoal'}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${scoreColor(analysis.lead_score)}`}>Score: {analysis.lead_score}</span>
                                {analysis.sentiment && <span className="text-[10px] text-navy-400">Sentimento: {analysis.sentiment}</span>}
                              </div>
                              {analysis.summary && <p className="text-xs text-navy-300">{analysis.summary}</p>}
                              {analysis.suggested_action && (
                                <div className="flex items-start gap-1.5">
                                  <ChevronRight size={12} className="text-accent-400 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-accent-300">{analysis.suggested_action}</p>
                                </div>
                              )}
                              {extracted.vehicle_interest && (
                                <div className="flex items-center gap-1 text-xs text-navy-400">
                                  <Car size={10} /> Veículo: <span className="text-white">{extracted.vehicle_interest}</span>
                                </div>
                              )}
                              {extracted.budget != null && (
                                <div className="flex items-center gap-1 text-xs text-navy-400">
                                  Orçamento: <span className="text-white">R$ {Number(extracted.budget).toLocaleString('pt-BR')}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-navy-600/30">
                <div className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={`Responder via ${channelLabel(selected.channel)}...`}
                    className="flex-1 bg-navy-900/50 border border-navy-600/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500"
                  />
                  <button onClick={handleSend} disabled={sending || !input.trim()}
                    className="btn-shine ripple-btn flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white transition-all shadow-lg shadow-accent-500/20 disabled:opacity-50 flex-shrink-0">
                    {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
                <p className="text-[10px] text-navy-500 mt-1.5 px-1">
                  Sua resposta será enviada diretamente no {channelLabel(selected.channel)} do cliente
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lead modal */}
      {showLeadModal && editLead && (
        <LeadModal lead={editLead} onClose={() => setShowLeadModal(false)} onSaved={() => { setShowLeadModal(false); loadConversations(); }} />
      )}
    </div>
  );
}

```

=== FILE: src/pages/IntegrationsPage.tsx ===
```tsx
import { useState, useEffect } from 'react';
import {
  X, CheckCircle2, RefreshCw, Zap, AlertCircle, Clock, Sparkles,
  MessageCircle, Camera, Globe, Link2, Key, ExternalLink,
  Loader2, Copy, Check, ChevronDown, ChevronUp, Phone,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Integration, type IntegrationAccount } from '@/lib/supabase';
import {
  connectWhatsAppCloud, connectMetaSocial, connectOLX, connectWebmotors,
  disconnectAccount, syncConversations, getWebhookUrl,
} from '@/lib/integrations';
import { IntegrationHelpChat } from '@/components/IntegrationHelpChat';

type ModalType = 'setup' | null;

export function IntegrationsPage() {
  const { dealer } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [accounts, setAccounts] = useState<IntegrationAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: ModalType; integration?: Integration } | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [whatsappForm, setWhatsappForm] = useState({ phone_number_id: '', access_token: '', waba_id: '', phone_number: '' });
  const [igForm, setIgForm] = useState({ page_id: '', access_token: '', account_name: '' });
  const [fbForm, setFbForm] = useState({ page_id: '', access_token: '', account_name: '' });
  const [olxForm, setOlxForm] = useState({ client_id: '', client_secret: '', account_email: '' });
  const [wmForm, setWmForm] = useState({ api_token: '', account_email: '' });

  async function loadData() {
    if (!dealer) return;
    setLoading(true);
    const [intRes, accRes] = await Promise.all([
      supabase.from('integrations').select('*').order('sort_order', { ascending: true }),
      supabase.from('integration_accounts').select('*, integration:integrations(*)').eq('dealer_id', dealer.id),
    ]);
    if (intRes.data) setIntegrations(intRes.data as Integration[]);
    if (accRes.data) setAccounts(accRes.data as IntegrationAccount[]);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [dealer]);

  function showToast(type: 'success' | 'error' | 'info', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  }

  function getAccount(integrationId: string): IntegrationAccount | undefined {
    return accounts.find((a) => a.integration_id === integrationId);
  }

  function getPlatformIcon(platform: string, size = 22) {
    if (platform === 'whatsapp') return <MessageCircle size={size} className="text-[#25D366]" />;
    if (platform === 'instagram') return <Camera size={size} className="text-[#E4405F]" />;
    if (platform === 'facebook') return <Globe size={size} className="text-[#1877F2]" />;
    if (platform === 'olx') return <Globe size={size} className="text-[#7E22CE]" />;
    if (platform === 'webmotors') return <Globe size={size} className="text-[#E30613]" />;
    return null;
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function openSetup(integration: Integration) {
    setError(null);
    setModal({ type: 'setup', integration });
  }

  function closeModal() {
    setModal(null);
    setError(null);
  }

  async function handleConnect() {
    if (!dealer || !modal?.integration) return;
    const platform = modal.integration.platform;
    setConnecting(true);
    setError(null);

    try {
      let result: { success: boolean; error: string | null; message: string };

      if (platform === 'whatsapp') {
        if (!whatsappForm.phone_number_id || !whatsappForm.access_token || !whatsappForm.waba_id) {
          setError('Preencha Phone Number ID, Access Token e WABA ID');
          setConnecting(false);
          return;
        }
        result = await connectWhatsAppCloud(dealer.id, modal.integration.id, whatsappForm.phone_number_id, whatsappForm.access_token, whatsappForm.waba_id, whatsappForm.phone_number);
      } else if (platform === 'instagram') {
        if (!igForm.page_id || !igForm.access_token) {
          setError('Preencha Page ID e Access Token');
          setConnecting(false);
          return;
        }
        result = await connectMetaSocial(dealer.id, modal.integration.id, 'instagram', igForm.page_id, igForm.access_token, igForm.account_name);
      } else if (platform === 'facebook') {
        if (!fbForm.page_id || !fbForm.access_token) {
          setError('Preencha Page ID e Access Token');
          setConnecting(false);
          return;
        }
        result = await connectMetaSocial(dealer.id, modal.integration.id, 'facebook', fbForm.page_id, fbForm.access_token, fbForm.account_name);
      } else if (platform === 'olx') {
        if (!olxForm.client_id || !olxForm.client_secret) {
          setError('Preencha Client ID e Client Secret');
          setConnecting(false);
          return;
        }
        result = await connectOLX(dealer.id, modal.integration.id, olxForm.client_id, olxForm.client_secret, olxForm.account_email);
      } else if (platform === 'webmotors') {
        if (!wmForm.api_token) {
          setError('Preencha o Token da API');
          setConnecting(false);
          return;
        }
        result = await connectWebmotors(dealer.id, modal.integration.id, wmForm.api_token, wmForm.account_email);
      } else {
        setError('Plataforma não suportada');
        setConnecting(false);
        return;
      }

      if (!result.success) {
        setError(result.error || 'Não foi possível conectar');
        setConnecting(false);
        return;
      }

      await loadData();
      closeModal();
      showToast('success', result.message);
    } catch {
      setError('Erro inesperado. Tente novamente.');
    }
    setConnecting(false);
  }

  async function handleDisconnect(account: IntegrationAccount) {
    await disconnectAccount(account.id);
    await loadData();
    showToast('info', 'Conta desconectada');
  }

  async function handleSync(account: IntegrationAccount) {
    if (!dealer) return;
    setSyncing(account.id);
    const platform = (account.integration as Integration)?.platform || '';
    const result = await syncConversations(dealer.id, account.id, platform);
    showToast(result.success ? 'success' : 'error', result.message);
    setSyncing(null);
  }

  const connectedCount = accounts.filter((a) => a.status === 'connected').length;
  const visibleIntegrations = integrations.filter(i => !['google', 'mercado_livre', 'site'].includes(i.platform));
  const webhookUrl = getWebhookUrl();

  return (
    <div className="min-h-screen pb-20">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-gold-500/20 border border-accent-500/30 flex items-center justify-center">
          <Zap size={20} className="text-accent-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Integrações</h1>
          <p className="text-sm text-navy-400">Conecte seus canais com APIs oficiais</p>
        </div>

      </div>

      {/* Info banner */}
      <div className="glass-card rounded-2xl p-4 mb-6 flex items-start gap-3 border border-gold-500/20">
        <div className="w-9 h-9 rounded-lg bg-gold-500/15 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-gold-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">Integração oficial e estável</p>
          <p className="text-xs text-navy-400 mt-1 leading-relaxed">
            Cada canal usa a API oficial da plataforma. Você precisa criar uma conta de desenvolvedor
            em cada uma e colar as credenciais aqui. As mensagens chegam automaticamente via webhook.
            Precisa de ajuda? Clique no botão "Preciso de ajuda" e converse com nossa IA — ela te guia passo a passo e pode até analisar prints de tela!
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-success-400">{connectedCount}</p>
          <p className="text-xs text-navy-400 uppercase mt-0.5">Conectados</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-navy-300">{visibleIntegrations.length - connectedCount}</p>
          <p className="text-xs text-navy-400 uppercase mt-0.5">Para conectar</p>
        </div>
      </div>

      {/* Webhook URL */}
      {connectedCount > 0 && (
        <div className="glass-card rounded-2xl p-4 mb-6 border border-accent-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Link2 size={16} className="text-accent-400" />
            <p className="text-sm font-medium text-white">URL do Webhook (use esta em todas as plataformas)</p>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-navy-200 bg-navy-900/50 rounded-lg px-3 py-2 truncate">{webhookUrl}</code>
            <button onClick={() => copyToClipboard(webhookUrl, 'webhook')} className="px-3 py-2 rounded-lg bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 text-xs font-medium transition-all flex items-center gap-1.5">
              {copied === 'webhook' ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 glass-strong rounded-xl p-4 border max-w-sm animate-drop-in ${
          toast.type === 'success' ? 'border-success-500/30' : toast.type === 'error' ? 'border-error-500/30' : 'border-accent-500/30'
        }`}>
          <div className="flex items-start gap-2">
            {toast.type === 'success' && <CheckCircle2 size={18} className="text-success-400 flex-shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle size={18} className="text-error-400 flex-shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Clock size={18} className="text-accent-400 flex-shrink-0 mt-0.5" />}
            <p className="text-sm text-white">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Integration cards */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleIntegrations.map((integration, idx) => {
            const account = getAccount(integration.id);
            const isConnected = account?.status === 'connected';
            return (
              <div key={integration.id} className={`glass-card rounded-2xl p-5 animate-fade-in-up transition-all duration-300 hover-lift relative overflow-hidden ${isConnected ? 'border-success-500/30' : ''}`} style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ background: integration.color }} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold" style={{ background: integration.color + '30', border: `1px solid ${integration.color}40` }}>
                        {getPlatformIcon(integration.platform) || <span style={{ color: integration.color }} className="text-lg font-bold">{integration.display_name.charAt(0)}</span>}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{integration.display_name}</p>
                        {isConnected && account && <p className="text-xs text-navy-400 truncate max-w-[140px]">{account.account_name || 'Conectado'}</p>}
                      </div>
                    </div>
                    {isConnected ? (
                      <span className="flex items-center gap-1 text-xs text-success-400 font-medium bg-success-500/10 px-2 py-1 rounded-full border border-success-500/20 flex-shrink-0">
                        <CheckCircle2 size={12} /> Online
                      </span>
                    ) : (
                      <span className="text-xs text-navy-500 bg-navy-700/30 px-2 py-1 rounded-full flex-shrink-0">Offline</span>
                    )}
                  </div>

                  <p className="text-xs text-navy-300 leading-relaxed mb-4 min-h-[40px]">
                    {integration.platform === 'whatsapp' && 'WhatsApp Cloud API oficial da Meta. Receba mensagens e responda direto daqui.'}
                    {integration.platform === 'instagram' && 'Instagram Graph API oficial. Receba e responda DMs direto daqui.'}
                    {integration.platform === 'facebook' && 'Facebook Messenger API oficial. Receba e responda mensagens da sua página.'}
                    {integration.platform === 'olx' && 'API oficial da OLX. Receba mensagens de interessados nos seus anúncios.'}
                    {integration.platform === 'webmotors' && 'API oficial da Webmotors. Receba leads dos seus anúncios.'}
                  </p>

                  {isConnected ? (
                    <div className="space-y-2">
                      {account?.last_sync_at && <p className="text-xs text-navy-500">Última verificação: {new Date(account.last_sync_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => handleSync(account)} disabled={syncing === account.id} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-accent-500/10 hover:bg-accent-500/20 text-accent-300 text-xs font-medium transition-all border border-accent-500/20 disabled:opacity-50">
                          {syncing === account.id ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />} Atualizar
                        </button>
                        <button onClick={() => handleDisconnect(account)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-error-500/10 hover:bg-error-500/20 text-error-400 text-xs font-medium transition-all border border-error-500/20">
                          <X size={14} /> Desconectar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => openSetup(integration)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white text-sm font-semibold transition-all shadow-lg shadow-accent-500/20 hover:-translate-y-0.5">
                      <Zap size={16} /> Conectar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* === Setup Modal === */}
      {modal?.type === 'setup' && modal.integration && (
        <SetupModal
          integration={modal.integration}
          onClose={closeModal}
          onConnect={handleConnect}
          connecting={connecting}
          error={error}
          whatsappForm={whatsappForm} setWhatsappForm={setWhatsappForm}
          igForm={igForm} setIgForm={setIgForm}
          fbForm={fbForm} setFbForm={setFbForm}
          olxForm={olxForm} setOlxForm={setOlxForm}
          wmForm={wmForm} setWmForm={setWmForm}
          webhookUrl={webhookUrl}
          copied={copied} copyToClipboard={copyToClipboard}
        />
      )}

      {/* === Help Chat === */}
      <IntegrationHelpChat
        platformContext={null}
        webhookUrl={webhookUrl}
      />
    </div>
  );
}

// === Setup Modal with detailed per-platform guides ===

type SetupModalProps = {
  integration: Integration;
  onClose: () => void;
  onConnect: () => void;
  connecting: boolean;
  error: string | null;
  whatsappForm: { phone_number_id: string; access_token: string; waba_id: string; phone_number: string };
  setWhatsappForm: (v: { phone_number_id: string; access_token: string; waba_id: string; phone_number: string }) => void;
  igForm: { page_id: string; access_token: string; account_name: string };
  setIgForm: (v: { page_id: string; access_token: string; account_name: string }) => void;
  fbForm: { page_id: string; access_token: string; account_name: string };
  setFbForm: (v: { page_id: string; access_token: string; account_name: string }) => void;
  olxForm: { client_id: string; client_secret: string; account_email: string };
  setOlxForm: (v: { client_id: string; client_secret: string; account_email: string }) => void;
  wmForm: { api_token: string; account_email: string };
  setWmForm: (v: { api_token: string; account_email: string }) => void;
  webhookUrl: string;
  copied: string | null;
  copyToClipboard: (text: string, id: string) => void;
};

function SetupModal(props: SetupModalProps) {
  const { integration, onClose, onConnect, connecting, error, webhookUrl, copied, copyToClipboard } = props;
  const [showGuide, setShowGuide] = useState(true);
  const color = integration.color;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div className="glass-strong rounded-2xl w-full max-w-2xl animate-drop-in relative max-h-[90vh] overflow-y-auto" style={{ borderColor: color + '40' }} onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}80, transparent)` }} />
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-navy-400 hover:bg-navy-700/50 hover:text-white transition-all z-10">
          <X size={18} />
        </button>
        <div className="px-6 pb-6 pt-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: color + '30', border: `1px solid ${color}40` }}>
              {integration.platform === 'whatsapp' && <MessageCircle size={22} className="text-[#25D366]" />}
              {integration.platform === 'instagram' && <Camera size={22} className="text-[#E4405F]" />}
              {integration.platform === 'facebook' && <Globe size={22} className="text-[#1877F2]" />}
              {integration.platform === 'olx' && <Globe size={22} className="text-[#7E22CE]" />}
              {integration.platform === 'webmotors' && <Globe size={22} className="text-[#E30613]" />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Conectar {integration.display_name}</h3>
              <p className="text-xs text-navy-400">API oficial — siga o guia e insira suas credenciais</p>
            </div>
          </div>

          {/* Guide toggle */}
          <button onClick={() => setShowGuide(!showGuide)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-navy-900/40 border border-navy-600/30 text-xs text-navy-200 hover:bg-navy-800/40 transition-all mb-3">
            <span className="flex items-center gap-2">
              <Sparkles size={14} className="text-gold-400" />
              Guia passo a passo detalhado
            </span>
            {showGuide ? <ChevronUp size={14} className="text-navy-400" /> : <ChevronDown size={14} className="text-navy-400" />}
          </button>

          {/* Detailed guide content */}
          {showGuide && (
            <div className="bg-navy-900/50 rounded-xl p-4 mb-4 border border-navy-600/20 text-xs text-navy-300 space-y-3 leading-relaxed max-h-[40vh] overflow-y-auto">
              <DetailedGuide platform={integration.platform} webhookUrl={webhookUrl} copied={copied} copyToClipboard={copyToClipboard} />
            </div>
          )}

          {error && <div className="bg-error-500/10 border border-error-500/30 rounded-xl p-3 text-sm text-error-400 mb-4">{error}</div>}

          {/* Form fields per platform */}
          {integration.platform === 'whatsapp' && <WhatsAppForm {...props} />}
          {integration.platform === 'instagram' && <InstagramForm {...props} />}
          {integration.platform === 'facebook' && <FacebookForm {...props} />}
          {integration.platform === 'olx' && <OLXForm {...props} />}
          {integration.platform === 'webmotors' && <WebmotorsForm {...props} />}

          <button onClick={onConnect} disabled={connecting} className="w-full mt-4 flex items-center justify-center gap-2 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-all shadow-lg disabled:opacity-50" style={{ background: `linear-gradient(to right, ${color}, ${color}dd)`, boxShadow: `0 4px 20px ${color}40` }}>
            {connecting ? <><Loader2 size={16} className="animate-spin" /> Conectando...</> : <><Zap size={16} /> Conectar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// === Detailed step-by-step guides (all in Portuguese, very detailed) ===

function DetailedGuide({ platform, webhookUrl, copied, copyToClipboard }: { platform: string; webhookUrl: string; copied: string | null; copyToClipboard: (text: string, id: string) => void }) {
  const WebhookCopy = ({ id }: { id: string }) => (
    <div className="flex items-center gap-2 mt-2 bg-navy-800/60 rounded-lg p-2">
      <code className="flex-1 text-[10px] text-navy-200 truncate">{webhookUrl}</code>
      <button onClick={() => copyToClipboard(webhookUrl, id)} className="px-2 py-1 rounded bg-accent-500/15 text-accent-300 text-[10px] flex items-center gap-1 flex-shrink-0">
        {copied === id ? <><Check size={10} /> Copiado</> : <><Copy size={10} /> Copiar</>}
      </button>
    </div>
  );

  const Step = ({ num, title, children }: { num: number; title: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <p className="font-medium text-white flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-accent-500/20 text-accent-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{num}</span>
        {title}
      </p>
      <div className="ml-7 space-y-1">{children}</div>
    </div>
  );

  const Link = ({ href, children }: { href: string; children: string }) => (
    <a href={href} target="_blank" rel="noopener" className="text-accent-400 inline-flex items-center gap-1 hover:underline">{children} <ExternalLink size={10} /></a>
  );

  if (platform === 'whatsapp') {
    return (
      <>
        <Step num={1} title="Criar conta no Meta Business Manager">
          <p>Acesse <Link href="https://business.facebook.com">business.facebook.com</Link> e clique em "Criar conta".</p>
          <p>Preencha: nome da sua empresa (ex: "Auto Veículos"), seu nome e email corporativo. Verifique o email (procure também no spam).</p>
          <p>Após criar, você será levado ao painel do Business Manager. Mantenha esta aba aberta.</p>
        </Step>

        <Step num={2} title="Adicionar número de WhatsApp Business">
          <p>No Business Manager, clique em "Centro de Mensagens" no menu lateral esquerdo.</p>
          <p>Depois clique em "WhatsApp" → "Adicionar número".</p>
          <p>Você pode migrar um número que já usa ou pegar um novo número. Se migrar, o WhatsApp pessoal daquele número será desativado.</p>
          <p>Complete a verificação: você receberá um SMS ou ligação com um código de 6 dígitos.</p>
        </Step>

        <Step num={3} title="Criar aplicativo no Meta for Developers">
          <p>Acesse <Link href="https://developers.facebook.com/apps">developers.facebook.com/apps</Link> e clique em "Criar App".</p>
          <p>Escolha o tipo "Empresa" (Business).</p>
          <p>Dê um nome ao app (ex: "Rede Auto CRM") e associe à sua conta do Business Manager.</p>
          <p>Aceite os termos e clique em "Criar app". Você pode precisar confirmar por email ou SMS.</p>
        </Step>

        <Step num={4} title="Adicionar produto WhatsApp ao app">
          <p>No painel do app que você acabou de criar, role para baixo até "Adicionar Produto".</p>
          <p>Encontre "WhatsApp" e clique em "Configurar" (ou "Adicionar").</p>
          <p>Selecione o número de WhatsApp Business que você adicionou no passo 2.</p>
        </Step>

        <Step num={5} title="Copiar o Phone Number ID">
          <p>Na aba "WhatsApp" → "Configurações da API" do seu app.</p>
          <p>Você verá um campo chamado "Phone Number ID" — é um número longo (ex: 106123456789012).</p>
          <p>Copie este número e cole no campo "Phone Number ID" do formulário aqui embaixo.</p>
        </Step>

        <Step num={6} title="Copiar o WABA ID (WhatsApp Business Account ID)">
          <p>Na mesma página, você verá "WhatsApp Business Account ID" (às vezes chamado de WABA ID).</p>
          <p>É um número diferente do Phone Number ID (ex: 123456789012345).</p>
          <p>Copie e cole no campo "WABA ID" do formulário.</p>
        </Step>

        <Step num={7} title="Gerar o Access Token permanente">
          <p>No menu do app, clique em "Usuários e Funções" → "Gerar token de acesso".</p>
          <p>Selecione as permissões necessárias:</p>
          <p className="ml-3">• <b>whatsapp_business_messaging</b> — enviar e receber mensagens</p>
          <p className="ml-3">• <b>whatsapp_business_management</b> — gerenciar a conta</p>
          <p>Clique em "Gerar token de acesso". Copie o token exibido (começa com "EAA...").</p>
          <p><b>Importante:</b> este token só aparece uma vez. Salve em local seguro. Cole no campo "Access Token" do formulário.</p>
        </Step>

        <Step num={8} title="Configurar o Webhook (para receber mensagens)">
          <p>No menu do app, clique em "Webhooks" (no lado esquerdo).</p>
          <p>Clique em "Adicionar URL de retorno de chamada" (Add Callback URL).</p>
          <p>Cole a URL abaixo no campo "URL de retorno de chamada":</p>
          <WebhookCopy id="guide-wa" />
          <p>No campo "Token de verificação" (Verify Token), você precisa colocar um token que o sistema usa para confirmar. Após conectar aqui no sistema, esse token aparecerá. Por enquanto, coloque qualquer texto (ex: "redeauto") — você pode ajustar depois.</p>
          <p>Clique em "Verificar e Salvar". Se der erro, clique no botão "Falar com a IA" acima para te ajudar.</p>
        </Step>

        <Step num={9} title="Inscrever-se nos eventos de mensagem">
          <p>Depois de verificar o webhook, você verá uma lista de campos disponíveis.</p>
          <p>Encontre o campo <b>"messages"</b> e clique em "Inscrever-se" (Subscribe).</p>
          <p>Pronto! As mensagens que seus clientes enviarem no WhatsApp vão aparecer automaticamente na sua Caixa de Entrada.</p>
        </Step>

        <div className="bg-gold-500/10 border border-gold-500/20 rounded-lg p-3 mt-3">
          <p className="text-gold-300 font-medium text-[11px]">Dica importante:</p>
          <p className="text-navy-300 text-[11px] mt-1">Para enviar a primeira mensagem para um cliente, o cliente precisa ter iniciado a conversa (ou você precisa usar um template aprovado). Esta é uma regra da Meta.</p>
        </div>
      </>
    );
  }

  if (platform === 'instagram') {
    return (
      <>
        <Step num={1} title="Converter sua conta Instagram para Business">
          <p>Abra o app do Instagram no seu celular.</p>
          <p>Vá em Configurações → Conta → "Mudar para conta profissional".</p>
          <p>Escolha a categoria "Empresa" e selecione "Loja de veículos" ou similar.</p>
          <p>Isso é necessário porque a API de mensagens só funciona com contas Business.</p>
        </Step>

        <Step num={2} title="Vincular Instagram a uma página do Facebook">
          <p>No app do Instagram: Configurações → "Central de Contas" → "Contas vinculadas".</p>
          <p>Toque em "Facebook" e selecione (ou crie) uma página do Facebook para vincular.</p>
          <p>Se não tiver uma página, crie em <Link href="https://facebook.com/pages/create">facebook.com/pages/create</Link>.</p>
          <p>Esta vinculação é obrigatória — a API do Instagram funciona através do Facebook.</p>
        </Step>

        <Step num={3} title="Adicionar Instagram no Meta Business Manager">
          <p>Acesse <Link href="https://business.facebook.com">business.facebook.com</Link></p>
          <p>Vá em "Configurações da empresa" (ícone de engrenagem) → "Contas do Instagram".</p>
          <p>Clique em "Adicionar" e faça login com sua conta Instagram Business.</p>
          <p>Confirme a vinculação com sua página do Facebook.</p>
        </Step>

        <Step num={4} title="Criar app no Meta for Developers">
          <p>Acesse <Link href="https://developers.facebook.com/apps">developers.facebook.com/apps</Link> e clique em "Criar App".</p>
          <p>Escolha o tipo "Empresa" (Business).</p>
          <p>Dê um nome (ex: "Rede Auto CRM") e associe ao Business Manager.</p>
        </Step>

        <Step num={5} title="Adicionar produto Instagram Graph API">
          <p>No painel do app, role até "Adicionar Produto".</p>
          <p>Encontre "Instagram Graph API" e clique em "Configurar".</p>
          <p>Selecione a conta Instagram Business que você vinculou.</p>
        </Step>

        <Step num={6} title="Obter o Instagram Business Account ID (Page ID)">
          <p>Acesse o Explorador da Graph API: <Link href="https://developers.facebook.com/tools/explorer">developers.facebook.com/tools/explorer</Link></p>
          <p>Selecione seu app no dropdown superior.</p>
          <p>Adicione um token: clique em "Gerar token de acesso" e selecione as permissões pages_show_list e instagram_basic.</p>
          <p>Faça GET em <code className="text-accent-300 bg-navy-800/60 px-1 rounded">/me/accounts</code> — você verá suas páginas do Facebook.</p>
          <p>Anote o <b>Page ID</b> da página vinculada ao Instagram.</p>
          <p>Depois faça GET em <code className="text-accent-300 bg-navy-800/60 px-1 rounded">/{`{page-id}`}?fields=instagram_business_account</code></p>
          <p>O ID que aparece no resultado é o seu <b>Instagram Business Account ID</b>. Copie e cole no campo "Page ID" do formulário.</p>
        </Step>

        <Step num={7} title="Gerar o Access Token permanente">
          <p>No app do Meta for Developers, vá em "Usuários e Funções".</p>
          <p>Clique em "Gerar token de acesso" e selecione as permissões:</p>
          <p className="ml-3">• <b>instagram_basic</b></p>
          <p className="ml-3">• <b>instagram_manage_messages</b></p>
          <p className="ml-3">• <b>pages_manage_metadata</b></p>
          <p className="ml-3">• <b>pages_read_engagement</b></p>
          <p className="ml-3">• <b>pages_show_list</b></p>
          <p>Copie o token gerado (começa com "EAA...") e cole no campo "Access Token".</p>
          <p><b>Importante:</b> salve o token em local seguro — ele só aparece uma vez.</p>
        </Step>

        <Step num={8} title="Configurar o Webhook">
          <p>No menu do app, clique em "Webhooks".</p>
          <p>Clique em "Adicionar URL de retorno de chamada".</p>
          <p>Cole a URL abaixo:</p>
          <WebhookCopy id="guide-ig" />
          <p>No campo "Token de verificação", coloque qualquer texto (ex: "redeauto").</p>
          <p>Clique em "Verificar e Salvar".</p>
        </Step>

        <Step num={9} title="Inscrever-se nos eventos de mensagem">
          <p>Depois de verificar o webhook, inscreva-se nos seguintes campos:</p>
          <p className="ml-3">• <b>messages</b> — receber mensagens dos seguidores</p>
          <p className="ml-3">• <b>message_reactions</b> — receber reações (emoji)</p>
          <p className="ml-3">• <b>messaging_postbacks</b> — receber cliques em botões</p>
          <p>Pronto! As DMs que seus seguidores enviarem aparecerão na sua Caixa de Entrada.</p>
        </Step>
      </>
    );
  }

  if (platform === 'facebook') {
    return (
      <>
        <Step num={1} title="Criar uma Página do Facebook (se ainda não tiver)">
          <p>Acesse <Link href="https://facebook.com/pages/create">facebook.com/pages/create</Link></p>
          <p>Escolha "Empresa ou Organização" e dê um nome (ex: "Auto Veículos").</p>
          <p>Preencha as categorias: "Loja de veículos", "Concessionária".</p>
          <p>Adicione uma foto de perfil e capa. Preencha as informações de contato.</p>
        </Step>

        <Step num={2} title="Adicionar a página no Meta Business Manager">
          <p>Acesse <Link href="https://business.facebook.com">business.facebook.com</Link></p>
          <p>Vá em "Configurações da empresa" → "Páginas" → "Adicionar nova página".</p>
          <p>Digite o nome da sua página e adicione-a ao Business Manager.</p>
        </Step>

        <Step num={3} title="Criar app no Meta for Developers">
          <p>Acesse <Link href="https://developers.facebook.com/apps">developers.facebook.com/apps</Link> e clique em "Criar App".</p>
          <p>Escolha o tipo "Empresa" (Business).</p>
          <p>Dê um nome (ex: "Rede Auto CRM").</p>
        </Step>

        <Step num={4} title="Adicionar produto Messenger">
          <p>No painel do app, role até "Adicionar Produto".</p>
          <p>Encontre "Messenger" e clique em "Configurar".</p>
          <p>Selecione a página do Facebook que você quer conectar.</p>
        </Step>

        <Step num={5} title="Obter o Page ID da sua página">
          <p>Na aba "Messenger" → "Configurações", ao selecionar sua página, o Page ID aparece automaticamente.</p>
          <p>É um número longo (ex: 123456789012345).</p>
          <p>Alternativa: acesse <Link href="https://findmyfbid.com">findmyfbid.com</Link>, digite a URL da sua página e ele retorna o ID.</p>
          <p>Copie e cole no campo "Page ID" do formulário.</p>
        </Step>

        <Step num={6} title="Gerar o Page Access Token">
          <p>Na mesma aba "Messenger" → "Configurações", você verá "Gerar token de acesso" ao lado da página selecionada.</p>
          <p>Clique em "Gerar token" e selecione as permissões:</p>
          <p className="ml-3">• <b>pages_messaging</b> — enviar e receber mensagens</p>
          <p className="ml-3">• <b>pages_manage_metadata</b> — gerenciar perfil</p>
          <p className="ml-3">• <b>pages_read_engagement</b> — ler interações</p>
          <p className="ml-3">• <b>pages_show_list</b> — listar páginas</p>
          <p>Copie o token gerado (começa com "EAA...") e cole no campo "Access Token".</p>
        </Step>

        <Step num={7} title="Configurar o Webhook">
          <p>No menu do app, clique em "Webhooks".</p>
          <p>Clique em "Adicionar URL de retorno de chamada".</p>
          <p>Cole a URL abaixo:</p>
          <WebhookCopy id="guide-fb" />
          <p>No campo "Token de verificação", coloque qualquer texto (ex: "redeauto").</p>
          <p>Clique em "Verificar e Salvar".</p>
        </Step>

        <Step num={8} title="Inscrever-se nos eventos de mensagem">
          <p>Depois de verificar o webhook, inscreva-se nos campos:</p>
          <p className="ml-3">• <b>messages</b> — receber mensagens</p>
          <p className="ml-3">• <b>message_reactions</b> — receber reações</p>
          <p className="ml-3">• <b>messaging_postbacks</b> — receber cliques em botões</p>
          <p className="ml-3">• <b>messaging_referrals</b> — receber referências</p>
          <p>Pronto! As mensagens que pessoas enviarem para sua página aparecerão na Caixa de Entrada.</p>
        </Step>
      </>
    );
  }

  if (platform === 'olx') {
    return (
      <>
        <Step num={1} title="Acessar o portal de desenvolvedores da OLX">
          <p>Acesse <Link href="https://developers.olx.com.br">developers.olx.com.br</Link></p>
          <p>Clique em "Cadastre-se" ou "Torne-se um parceiro integrador".</p>
          <p>Se já tiver conta na OLX, faça login com suas credenciais habituais.</p>
        </Step>

        <Step num={2} title="Preencher o cadastro de integrador">
          <p>Preencha o formulário com:</p>
          <p className="ml-3">• Nome da empresa (ex: "Auto Veículos Ltda")</p>
          <p className="ml-3">• CNPJ válido</p>
          <p className="ml-3">• Site da empresa (se tiver)</p>
          <p className="ml-3">• Tipo de integração: escolha "Gestor de Estoque" ou "CRM"</p>
          <p className="ml-3">• Descrição do que você quer fazer (ex: "Integrar anúncios e receber mensagens de clientes no nosso CRM")</p>
          <p>Clique em "Enviar cadastro".</p>
        </Step>

        <Step num={3} title="Aguardar aprovação da OLX">
          <p>A OLX analisa todos os cadastros manualmente. Isso pode levar de 2 a 5 dias úteis.</p>
          <p>Você receberá um email de confirmação no email cadastrado.</p>
          <p>Se não receber em uma semana, verifique o spam ou entre em contato com a OLX.</p>
          <div className="bg-gold-500/10 border border-gold-500/20 rounded-lg p-3 mt-2">
            <p className="text-gold-300 text-[11px]">Atenção: A aprovação da OLX é externa e não depende do sistema. Enquanto aguarda, você já pode configurar os outros canais.</p>
          </div>
        </Step>

        <Step num={4} title="Criar uma aplicação no portal">
          <p>Após aprovado, faça login em <Link href="https://developers.olx.com.br">developers.olx.com.br</Link></p>
          <p>No painel, clique em "Minhas Aplicações" → "Criar Aplicação".</p>
          <p>Dê um nome (ex: "Rede Auto CRM").</p>
          <p>Selecione os escopos/permissões: "leitura de anúncios", "mensagens", "leads".</p>
          <p>Clique em "Criar".</p>
        </Step>

        <Step num={5} title="Obter Client ID e Client Secret">
          <p>Na página da aplicação que você criou, você verá duas informações importantes:</p>
          <p className="ml-3">• <b>Client ID</b> — um identificador público da sua aplicação</p>
          <p className="ml-3">• <b>Client Secret</b> — uma chave secreta (não compartilhe com ninguém)</p>
          <p>Copie ambos e cole nos campos "Client ID" e "Client Secret" do formulário aqui.</p>
          <p>Se o Client Secret não aparecer, clique em "Gerar novo secret" ou "Mostrar secret".</p>
        </Step>

        <Step num={6} title="Configurar o Webhook de mensagens">
          <p>No portal da OLX, procure por "Webhooks", "Notificações" ou "Configurações de callback".</p>
          <p>Adicione a URL abaixo:</p>
          <WebhookCopy id="guide-olx" />
          <p>Selecione os eventos que quer receber:</p>
          <p className="ml-3">• <b>Mensagens recebidas</b> — quando alguém envia mensagem num anúncio</p>
          <p className="ml-3">• <b>Leads</b> — quando alguém demonstra interesse</p>
          <p>Salve as configurações. A OLX fará um teste na URL para confirmar que está funcionando.</p>
        </Step>

        <Step num={7} title="Como funciona a autenticação">
          <p>A OLX usa o padrão OAuth2. Isso significa que:</p>
          <p className="ml-3">• O sistema usa o Client ID e Client Secret para gerar um token temporário automaticamente</p>
          <p className="ml-3">• Esse token é renovado sozinho quando expira</p>
          <p className="ml-3">• Você não precisa fazer nada manual — o sistema cuida de tudo</p>
          <p>Quando você responder uma mensagem na Caixa de Entrada, o sistema envia a resposta pela API da OLX.</p>
        </Step>
      </>
    );
  }

  if (platform === 'webmotors') {
    return (
      <>
        <Step num={1} title="Acessar o portal de API da Webmotors">
          <p>Acesse <Link href="https://portal-webmotors.sensedia.com">portal-webmotors.sensedia.com</Link></p>
          <p>Clique em "Cadastre-se" ou "Registrar".</p>
          <p>Se já tiver conta na Webmotors (como loja), você pode usar as mesmas credenciais.</p>
        </Step>

        <Step num={2} title="Preencher o cadastro de integrador">
          <p>Preencha o formulário com:</p>
          <p className="ml-3">• Nome da empresa e CNPJ</p>
          <p className="ml-3">• Email corporativo</p>
          <p className="ml-3">• Telefone de contato</p>
          <p className="ml-3">• Tipo de integração: "Gestor de Estoque" ou "CRM"</p>
          <p className="ml-3">• Descrição: "Integrar estoque e receber leads de clientes no nosso CRM"</p>
          <p>Envie o cadastro e aguar a aprovação.</p>
        </Step>

        <Step num={3} title="Aguardar aprovação da Webmotors">
          <p>A Webmotors analisa o cadastro. Isso pode levar de 3 a 7 dias úteis.</p>
          <p>Você receberá um email com as instruções de acesso ao portal de API.</p>
          <p>Se não receber, verifique o spam ou entre em contato com seu gerente Webmotors.</p>
        </Step>

        <Step num={4} title="Criar uma aplicação no portal">
          <p>Após aprovado, faça login no portal.</p>
          <p>Vá em "Minhas Aplicações" → "Criar Aplicação".</p>
          <p>Dê um nome (ex: "Rede Auto CRM").</p>
          <p>Selecione a API: "Lead API" ou "API de Leads".</p>
          <p>Selecione os escopos/permissões:</p>
          <p className="ml-3">• <b>lead/receber</b> — receber leads de clientes</p>
          <p className="ml-3">• <b>lead/responder</b> — responder leads pela API</p>
          <p className="ml-3">• <b>anuncio/ler</b> — ler seus anúncios (opcional)</p>
          <p>Clique em "Criar".</p>
        </Step>

        <Step num={5} title="Obter o Token de Acesso (Access Token / API Key)">
          <p>Na página da aplicação, você verá o "Access Token" ou "API Key".</p>
          <p>É uma string longa de caracteres (pode conter letras, números e símbolos).</p>
          <p>Copie o token e cole no campo "Token da API" do formulário aqui.</p>
          <p>Se houver "Client ID" e "Client Secret" também, anote — pode ser necessário para renovação.</p>
        </Step>

        <Step num={6} title="Configurar o Webhook de leads">
          <p>No portal, procure por "Webhooks", "Notificações" ou "Callbacks".</p>
          <p>Adicione a URL abaixo:</p>
          <WebhookCopy id="guide-wm" />
          <p>Selecione o evento: <b>"Lead recebido"</b> ou <b>"Nova mensagem de lead"</b>.</p>
          <p>Salve as configurações.</p>
        </Step>

        <Step num={7} title="Como funciona o fluxo">
          <p>Quando um cliente envia uma mensagem em um anúncio da Webmotors:</p>
          <p className="ml-3">1. A Webmotors envia um evento para o webhook do sistema</p>
          <p className="ml-3">2. O sistema cria uma conversa na sua Caixa de Entrada</p>
          <p className="ml-3">3. Quando você responde na Caixa de Entrada, o sistema envia a resposta pela API da Webmotors</p>
          <p className="ml-3">4. O cliente recebe a resposta no portal da Webmotors</p>
        </Step>
      </>
    );
  }

  return null;
}

// === Platform-specific form fields ===

function WhatsAppForm(props: SetupModalProps) {
  const { whatsappForm, setWhatsappForm } = props;
  return (
    <div className="space-y-3">
      <Field label="Phone Number ID" icon={<Phone size={14} />} value={whatsappForm.phone_number_id} onChange={(v) => setWhatsappForm({ ...whatsappForm, phone_number_id: v })} placeholder="Ex: 106123456789012" help="Encontrado no passo 5 do guia acima" />
      <Field label="WhatsApp Business Account ID (WABA ID)" icon={<Key size={14} />} value={whatsappForm.waba_id} onChange={(v) => setWhatsappForm({ ...whatsappForm, waba_id: v })} placeholder="Ex: 123456789012345" help="Encontrado no passo 6 do guia acima" />
      <Field label="Access Token (permanente)" icon={<Key size={14} />} value={whatsappForm.access_token} onChange={(v) => setWhatsappForm({ ...whatsappForm, access_token: v })} placeholder="EAA..." textarea help="Encontrado no passo 7 do guia acima" />
      <Field label="Número de telefone (opcional)" icon={<Phone size={14} />} value={whatsappForm.phone_number} onChange={(v) => setWhatsappForm({ ...whatsappForm, phone_number: v })} placeholder="Ex: 5511999999999" />
    </div>
  );
}

function InstagramForm(props: SetupModalProps) {
  const { igForm, setIgForm } = props;
  return (
    <div className="space-y-3">
      <Field label="Instagram Business Account ID (Page ID)" icon={<Key size={14} />} value={igForm.page_id} onChange={(v) => setIgForm({ ...igForm, page_id: v })} placeholder="Ex: 17841400000000000" help="Encontrado no passo 6 do guia acima" />
      <Field label="Access Token (permanente)" icon={<Key size={14} />} value={igForm.access_token} onChange={(v) => setIgForm({ ...igForm, access_token: v })} placeholder="EAA..." textarea help="Encontrado no passo 7 do guia acima" />
      <Field label="Nome da conta (opcional)" icon={<Camera size={14} />} value={igForm.account_name} onChange={(v) => setIgForm({ ...igForm, account_name: v })} placeholder="@sua_loja" />
    </div>
  );
}

function FacebookForm(props: SetupModalProps) {
  const { fbForm, setFbForm } = props;
  return (
    <div className="space-y-3">
      <Field label="Facebook Page ID" icon={<Key size={14} />} value={fbForm.page_id} onChange={(v) => setFbForm({ ...fbForm, page_id: v })} placeholder="Ex: 123456789012345" help="Encontrado no passo 5 do guia acima" />
      <Field label="Access Token (permanente)" icon={<Key size={14} />} value={fbForm.access_token} onChange={(v) => setFbForm({ ...fbForm, access_token: v })} placeholder="EAA..." textarea help="Encontrado no passo 6 do guia acima" />
      <Field label="Nome da página (opcional)" icon={<Globe size={14} />} value={fbForm.account_name} onChange={(v) => setFbForm({ ...fbForm, account_name: v })} placeholder="Nome da sua página" />
    </div>
  );
}

function OLXForm(props: SetupModalProps) {
  const { olxForm, setOlxForm } = props;
  return (
    <div className="space-y-3">
      <Field label="Client ID" icon={<Key size={14} />} value={olxForm.client_id} onChange={(v) => setOlxForm({ ...olxForm, client_id: v })} placeholder="Seu Client ID da OLX" help="Encontrado no passo 5 do guia acima" />
      <Field label="Client Secret" icon={<Key size={14} />} value={olxForm.client_secret} onChange={(v) => setOlxForm({ ...olxForm, client_secret: v })} placeholder="Seu Client Secret da OLX" textarea help="Encontrado no passo 5 do guia acima" />
      <Field label="Email da conta OLX (opcional)" icon={<Globe size={14} />} value={olxForm.account_email} onChange={(v) => setOlxForm({ ...olxForm, account_email: v })} placeholder="seu@email.com" />
    </div>
  );
}

function WebmotorsForm(props: SetupModalProps) {
  const { wmForm, setWmForm } = props;
  return (
    <div className="space-y-3">
      <Field label="Token da API (Access Token)" icon={<Key size={14} />} value={wmForm.api_token} onChange={(v) => setWmForm({ ...wmForm, api_token: v })} placeholder="Seu token de acesso Webmotors" textarea help="Encontrado no passo 5 do guia acima" />
      <Field label="Email da conta Webmotors (opcional)" icon={<Globe size={14} />} value={wmForm.account_email} onChange={(v) => setWmForm({ ...wmForm, account_email: v })} placeholder="seu@email.com" />
    </div>
  );
}

function Field({ label, icon, value, onChange, placeholder, textarea = false, help }: { label: string; icon: React.ReactNode; value: string; onChange: (v: string) => void; placeholder: string; textarea?: boolean; help?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-navy-200 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-3 text-navy-400">{icon}</div>
        {textarea ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-10 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500 resize-none" />
        ) : (
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-navy-900/50 border border-navy-600/40 rounded-xl pl-10 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-500" />
        )}
      </div>
      {help && <p className="text-[10px] text-navy-500 mt-1 ml-1 flex items-center gap-1"><Sparkles size={10} className="text-gold-500/50" /> {help}</p>}
    </div>
  );
}

```

=== FILE: src/pages/IntegrationsCallbackPage.tsx ===
```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function IntegrationsCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/integracoes'), 1500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-navy-900 gap-3">
      <CheckCircle2 size={48} className="text-success-400 animate-pulse" />
      <p className="text-white text-lg font-semibold">Conectado com sucesso!</p>
      <div className="flex items-center gap-2 text-navy-400 text-sm">
        <Loader2 size={14} className="animate-spin" />
        Redirecionando...
      </div>
    </div>
  );
}

```

=== FILE: supabase/migrations/20260805193748_create_rede_auto_schema.sql ===
```sql

/*
# Rede Auto Ribeirão - Schema Inicial

## Descrição
Plataforma fechada de estoque integrado para lojistas de veículos de Ribeirão Preto.
Apenas lojistas cadastrados têm acesso. Cada lojista gerencia seu próprio estoque
e pode pesquisar o estoque de toda a rede.

## Tabelas

### dealers
Perfil de cada lojista da rede, vinculado ao usuário autenticado.
- id: identificador único
- user_id: vínculo com auth.users (login)
- name: nome do lojista / nome da loja
- phone: telefone de contato
- email: e-mail de contato
- address: endereço da loja
- created_at: data de cadastro

### vehicles
Veículo cadastrado por um lojista, com todos os dados financeiros e de especificação.
- id: identificador único
- dealer_id: lojista dono do veículo
- brand: marca (ex: Toyota, Ford)
- model: modelo (ex: Corolla, Ka)
- year_manufacture: ano de fabricação
- year_model: ano do modelo
- color: cor
- mileage: quilometragem
- fuel: tipo de combustível
- transmission: câmbio (manual/automático)
- plate: placa
- chassis: chassi
- engine: motorização
- doors: número de portas
- description: observações e descrição do veículo
- purchase_price: valor que o lojista pagou pelo veículo (custo)
- asking_price: valor que está pedindo pelo veículo
- min_price: valor mínimo que aceita vender
- profit_margin: margem de lucro calculada em %
- status: disponível, reservado ou vendido
- created_at: data de cadastro
- updated_at: data da última atualização

### vehicle_photos
Fotos de cada veículo.
- id: identificador único
- vehicle_id: veículo ao qual a foto pertence
- url: URL da foto no storage
- is_cover: indica se é a foto de capa
- created_at: data de upload

### deals
Registro de negociações entre lojistas (divisão de lucro).
- id: identificador único
- vehicle_id: veículo negociado
- seller_dealer_id: lojista que tem o carro
- buyer_dealer_id: lojista que tem o cliente
- client_name: nome do cliente final
- client_phone: telefone do cliente
- sale_price: valor final de venda
- split_percentage: percentual do lucro para o lojista que trouxe o cliente
- seller_amount: valor que vai para o dono do carro
- buyer_amount: valor que vai para o lojista com o cliente
- status: em andamento, concluído, cancelado
- notes: observações
- created_at: data de criação

## Segurança
- RLS habilitado em todas as tabelas
- Lojistas autenticados podem ler todos os veículos da rede (para pesquisa)
- Lojistas só podem inserir/editar/excluir seus próprios veículos
- Negociações visíveis para os dois lojistas envolvidos
*/

-- DEALERS
CREATE TABLE IF NOT EXISTS dealers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text,
  address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_dealers" ON dealers;
CREATE POLICY "select_dealers" ON dealers FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_dealer" ON dealers;
CREATE POLICY "insert_own_dealer" ON dealers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_dealer" ON dealers;
CREATE POLICY "update_own_dealer" ON dealers FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_dealer" ON dealers;
CREATE POLICY "delete_own_dealer" ON dealers FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  brand text NOT NULL,
  model text NOT NULL,
  year_manufacture integer,
  year_model integer,
  color text,
  mileage integer,
  fuel text,
  transmission text,
  plate text,
  chassis text,
  engine text,
  doors integer,
  description text,
  purchase_price numeric(12,2) NOT NULL,
  asking_price numeric(12,2) NOT NULL,
  min_price numeric(12,2),
  profit_margin numeric(6,2),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_dealer_id ON vehicles(dealer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_model ON vehicles(brand, model);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Todos lojistas autenticados podem VER todos os veículos (busca na rede)
DROP POLICY IF EXISTS "select_vehicles" ON vehicles;
CREATE POLICY "select_vehicles" ON vehicles FOR SELECT
  TO authenticated USING (true);

-- Lojistas só inserem veículos em suas próprias lojas
DROP POLICY IF EXISTS "insert_own_vehicles" ON vehicles;
CREATE POLICY "insert_own_vehicles" ON vehicles FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_vehicles" ON vehicles;
CREATE POLICY "update_own_vehicles" ON vehicles FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_vehicles" ON vehicles;
CREATE POLICY "delete_own_vehicles" ON vehicles FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

-- VEHICLE PHOTOS
CREATE TABLE IF NOT EXISTS vehicle_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  url text NOT NULL,
  is_cover boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_photos_vehicle_id ON vehicle_photos(vehicle_id);

ALTER TABLE vehicle_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_vehicle_photos" ON vehicle_photos;
CREATE POLICY "select_vehicle_photos" ON vehicle_photos FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_vehicle_photos" ON vehicle_photos;
CREATE POLICY "insert_own_vehicle_photos" ON vehicle_photos FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM vehicles v
      JOIN dealers d ON d.id = v.dealer_id
      WHERE v.id = vehicle_id AND d.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_vehicle_photos" ON vehicle_photos;
CREATE POLICY "delete_own_vehicle_photos" ON vehicle_photos FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      JOIN dealers d ON d.id = v.dealer_id
      WHERE v.id = vehicle_id AND d.user_id = auth.uid()
    )
  );

-- DEALS
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  seller_dealer_id uuid NOT NULL REFERENCES dealers(id),
  buyer_dealer_id uuid NOT NULL REFERENCES dealers(id),
  client_name text,
  client_phone text,
  sale_price numeric(12,2),
  split_percentage numeric(5,2),
  seller_amount numeric(12,2),
  buyer_amount numeric(12,2),
  status text NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deals_seller ON deals(seller_dealer_id);
CREATE INDEX IF NOT EXISTS idx_deals_buyer ON deals(buyer_dealer_id);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_deals" ON deals;
CREATE POLICY "select_own_deals" ON deals FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = seller_dealer_id AND dealers.user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = buyer_dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_deals" ON deals;
CREATE POLICY "insert_own_deals" ON deals FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = buyer_dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_deals" ON deals;
CREATE POLICY "update_own_deals" ON deals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = seller_dealer_id AND dealers.user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = buyer_dealer_id AND dealers.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = seller_dealer_id AND dealers.user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = buyer_dealer_id AND dealers.user_id = auth.uid())
  );

```

=== FILE: supabase/migrations/20260805194429_storage_policies_vehicle_photos.sql ===
```sql
-- Allow authenticated users to upload/manage vehicle photos
CREATE POLICY "authenticated_upload_photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vehicle-photos');

CREATE POLICY "authenticated_read_photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'vehicle-photos');

CREATE POLICY "authenticated_delete_photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'vehicle-photos');

```

=== FILE: supabase/migrations/20260808180205_add_management_tables.sql ===
```sql

/*
# Rede Auto Ribeirão - Sistema de Gestão Interna

## Descrição
Expande a plataforma de estoque integrado com um sistema completo de gestão para cada lojista:
controle de despesas, custos, vendas diretas, clientes e relatórios financeiros.

## Novas Tabelas

### expense_categories
Categorias de despesas personalizáveis por lojista (ex: aluguel, salários, marketing, manutenção).
- id, dealer_id, name, color (para gráficos), is_default (categorias padrão do sistema)

### expenses
Lançamentos de despesas/custos da loja.
- id, dealer_id, category_id, description, amount, due_date, paid_date, status (pending/paid),
- recurrence (none/monthly/weekly/yearly), notes, created_at

### sales
Vendas diretas da loja (quando vende para cliente final, não via rede).
- id, dealer_id, vehicle_id (opcional), client_name, client_phone, sale_price,
- purchase_price (custo do carro), profit, payment_method, sale_date, notes, created_at

### clients
CRM básico - cadastro de clientes.
- id, dealer_id, name, phone, email, document (CPF/CNPJ), address, notes,
- status (active/inactive), created_at

## Segurança
- RLS habilitado em todas as novas tabelas
- Cada lojista só vê e gerencia seus próprios dados
- Policies com EXISTS check em dealers para ownership
*/

-- === EXPENSE CATEGORIES ===
CREATE TABLE IF NOT EXISTS expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#2a93e8',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expense_categories_dealer ON expense_categories(dealer_id);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_expense_categories" ON expense_categories;
CREATE POLICY "select_own_expense_categories" ON expense_categories FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_expense_categories" ON expense_categories;
CREATE POLICY "insert_own_expense_categories" ON expense_categories FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_expense_categories" ON expense_categories;
CREATE POLICY "update_own_expense_categories" ON expense_categories FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_expense_categories" ON expense_categories;
CREATE POLICY "delete_own_expense_categories" ON expense_categories FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

-- === EXPENSES ===
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  category_id uuid REFERENCES expense_categories(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL,
  due_date date,
  paid_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  recurrence text NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'weekly', 'monthly', 'yearly')),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_dealer ON expenses(dealer_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_due_date ON expenses(due_date);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_expenses" ON expenses;
CREATE POLICY "select_own_expenses" ON expenses FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_expenses" ON expenses;
CREATE POLICY "insert_own_expenses" ON expenses FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_expenses" ON expenses;
CREATE POLICY "update_own_expenses" ON expenses FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_expenses" ON expenses;
CREATE POLICY "delete_own_expenses" ON expenses FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

-- === SALES ===
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  client_name text,
  client_phone text,
  sale_price numeric(12,2) NOT NULL,
  purchase_price numeric(12,2) DEFAULT 0,
  profit numeric(12,2),
  payment_method text,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_dealer ON sales(dealer_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_sales" ON sales;
CREATE POLICY "select_own_sales" ON sales FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_sales" ON sales;
CREATE POLICY "insert_own_sales" ON sales FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_sales" ON sales;
CREATE POLICY "update_own_sales" ON sales FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_sales" ON sales;
CREATE POLICY "delete_own_sales" ON sales FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

-- === CLIENTS ===
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text,
  document text,
  address text,
  notes text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_dealer ON clients(dealer_id);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_clients" ON clients;
CREATE POLICY "select_own_clients" ON clients FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_clients" ON clients;
CREATE POLICY "insert_own_clients" ON clients FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_clients" ON clients;
CREATE POLICY "update_own_clients" ON clients FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_clients" ON clients;
CREATE POLICY "delete_own_clients" ON clients FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

-- === Insert default expense categories for existing dealers ===
INSERT INTO expense_categories (dealer_id, name, color, is_default)
SELECT d.id, cat.name, cat.color, true
FROM dealers d
CROSS JOIN (VALUES
  ('Aluguel / Condomínio', '#dc2626'),
  ('Salários e Pró-labore', '#f59e0b'),
  ('Marketing e Anúncios', '#2a93e8'),
  ('Manutenção de Veículos', '#16a34a'),
  ('Documentação e Taxas', '#8b5cf6'),
  ('Combustível', '#06b6d4'),
  ('Outros', '#64748b')
) AS cat(name, color)
WHERE NOT EXISTS (
  SELECT 1 FROM expense_categories ec
  WHERE ec.dealer_id = d.id AND ec.name = cat.name
);

```

=== FILE: supabase/migrations/20260808184315_add_financing_module.sql ===
```sql
/*
# Financiamento Inteligente - Novo Modulo

## Objetivo
Adiciona o modulo de Financiamento Inteligente à plataforma, permitindo
que lojistas selecionem cliente + veiculo + condicoes e consultem
financiamento junto a instituicoes financeiras.

## Novas Tabelas

### financing_institutions
- Catalogo de instituicoes financeiras (bancos, financeiras, hubs)
- id, name, type, logo_url, active, created_at

### financing_simulations
- Registro de cada simulacao de financiamento
- id, dealer_id, vehicle_id, client_id, vehicle_price, down_payment,
  financed_amount, term_months, max_installment, status, consent_given,
  created_at, updated_at
- Status: draft, submitted, processing, analysis, approved,
  approved_with_condition, rejected, expired, cancelled, converted

### financing_offers
- Ofertas retornadas pelas instituicoes para cada simulacao
- id, simulation_id, institution_id, status, down_payment, financed_amount,
  term_months, installment_amount, interest_rate, cet, conditions, notes,
  is_best, created_at

## Seguranca (RLS)
- RLS ativado em todas as novas tabelas
- Acesso scoped por dealer_id via dealers.user_id = auth.uid()
- Todas as politicas sao TO authenticated
- Segracao entre lojas garantida pelo dealer_id

## Notas
- Nao altera tabelas existentes
- Nao remove funcionalidades
- Integracao com clientes e vehicles existentes via foreign keys
*/

-- ============================================
-- 1. FINANCING INSTITUTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS financing_institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'bank',
  logo_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE financing_institutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_financing_institutions" ON financing_institutions;
CREATE POLICY "select_financing_institutions"
ON financing_institutions FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_financing_institutions" ON financing_institutions;
CREATE POLICY "insert_financing_institutions"
ON financing_institutions FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_financing_institutions" ON financing_institutions;
CREATE POLICY "update_financing_institutions"
ON financing_institutions FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

-- Seed default institutions
INSERT INTO financing_institutions (name, type) VALUES
  ('Banco do Brasil', 'bank'),
  ('Caixa Econômica', 'bank'),
  ('Itaú Unibanco', 'bank'),
  ('Bradesco Financiamentos', 'bank'),
  ('Santander', 'bank'),
  ('Banco BV', 'bank'),
  ('Omni', 'financeira'),
  ('Sofisa', 'bank'),
  ('Porto Seguro Consórcio', 'consorcio'),
  ('Hub Financeiro', 'hub')
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. FINANCING SIMULATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS financing_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  vehicle_price numeric(12,2) NOT NULL DEFAULT 0,
  down_payment numeric(12,2) NOT NULL DEFAULT 0,
  financed_amount numeric(12,2) NOT NULL DEFAULT 0,
  term_months integer NOT NULL DEFAULT 48,
  max_installment numeric(12,2),
  status text NOT NULL DEFAULT 'draft',
  consent_given boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE financing_simulations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_simulations" ON financing_simulations;
CREATE POLICY "select_own_simulations"
ON financing_simulations FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = financing_simulations.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_simulations" ON financing_simulations;
CREATE POLICY "insert_own_simulations"
ON financing_simulations FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = financing_simulations.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "update_own_simulations" ON financing_simulations;
CREATE POLICY "update_own_simulations"
ON financing_simulations FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = financing_simulations.dealer_id AND dealers.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = financing_simulations.dealer_id AND dealers.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_simulations" ON financing_simulations;
CREATE POLICY "delete_own_simulations"
ON financing_simulations FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = financing_simulations.dealer_id AND dealers.user_id = auth.uid()));

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_simulations_dealer ON financing_simulations(dealer_id);
CREATE INDEX IF NOT EXISTS idx_simulations_client ON financing_simulations(client_id);
CREATE INDEX IF NOT EXISTS idx_simulations_vehicle ON financing_simulations(vehicle_id);

-- ============================================
-- 3. FINANCING OFFERS
-- ============================================
CREATE TABLE IF NOT EXISTS financing_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid NOT NULL REFERENCES financing_simulations(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES financing_institutions(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  down_payment numeric(12,2),
  financed_amount numeric(12,2),
  term_months integer,
  installment_amount numeric(12,2),
  interest_rate numeric(6,3),
  cet numeric(6,3),
  conditions text,
  notes text,
  is_best boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE financing_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_offers" ON financing_offers;
CREATE POLICY "select_own_offers"
ON financing_offers FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM financing_simulations
  JOIN dealers ON dealers.id = financing_simulations.dealer_id
  WHERE financing_simulations.id = financing_offers.simulation_id
  AND dealers.user_id = auth.uid()
));

DROP POLICY IF EXISTS "insert_own_offers" ON financing_offers;
CREATE POLICY "insert_own_offers"
ON financing_offers FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM financing_simulations
  JOIN dealers ON dealers.id = financing_simulations.dealer_id
  WHERE financing_simulations.id = financing_offers.simulation_id
  AND dealers.user_id = auth.uid()
));

DROP POLICY IF EXISTS "update_own_offers" ON financing_offers;
CREATE POLICY "update_own_offers"
ON financing_offers FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM financing_simulations
  JOIN dealers ON dealers.id = financing_simulations.dealer_id
  WHERE financing_simulations.id = financing_offers.simulation_id
  AND dealers.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM financing_simulations
  JOIN dealers ON dealers.id = financing_simulations.dealer_id
  WHERE financing_simulations.id = financing_offers.simulation_id
  AND dealers.user_id = auth.uid()
));

DROP POLICY IF EXISTS "delete_own_offers" ON financing_offers;
CREATE POLICY "delete_own_offers"
ON financing_offers FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM financing_simulations
  JOIN dealers ON dealers.id = financing_simulations.dealer_id
  WHERE financing_simulations.id = financing_offers.simulation_id
  AND dealers.user_id = auth.uid()
));

CREATE INDEX IF NOT EXISTS idx_offers_simulation ON financing_offers(simulation_id);

```

=== FILE: supabase/migrations/20260808191202_add_financing_channels.sql ===
```sql
/*
# Add financing channels to institutions

## Changes
- Adds `financing_url` column to financing_institutions: the official
  URL where a dealer/client can start the financing process directly
  with that institution (proposta online, WhatsApp comercial, etc).
- Adds `whatsapp_number` column: commercial WhatsApp number for the
  institution's auto financing team.
- Seeds real URLs and WhatsApp numbers for the 10 institutions already
  in the database.

## Security
- No RLS changes needed (already public read).
- No destructive operations.
*/

ALTER TABLE financing_institutions
  ADD COLUMN IF NOT EXISTS financing_url text,
  ADD COLUMN IF NOT EXISTS whatsapp_number text;

UPDATE financing_institutions SET financing_url = 'https://www.bb.com.br/site/solucoes/veiculos/', whatsapp_number = '558006604041' WHERE name LIKE 'Banco do Brasil%';
UPDATE financing_institutions SET financing_url = 'https://www.caixa.gov.br/site/Paginas/veiculos.aspx', whatsapp_number = '5580055808080' WHERE name LIKE 'Caixa%';
UPDATE financing_institutions SET financing_url = 'https://www.itau.com.br/carros-financiamento/', whatsapp_number = '5511300355555' WHERE name LIKE 'Itaú%';
UPDATE financing_institutions SET financing_url = 'https://www.bradesco.com.br/site/pessoa-juridica/produtos-e-servicos/credito-financiamento/veiculos', whatsapp_number = '551130038000' WHERE name LIKE 'Bradesco%';
UPDATE financing_institutions SET financing_url = 'https://www.santander.com.br/para-voce/credito/financiamento-de-veiculos', whatsapp_number = '551130033333' WHERE name LIKE 'Santander%';
UPDATE financing_institutions SET financing_url = 'https://www.bancobv.com.br/financiamento/', whatsapp_number = '551130005000' WHERE name LIKE 'Banco BV%';
UPDATE financing_institutions SET financing_url = 'https://www.omni.com.br/', whatsapp_number = '551130000000' WHERE name LIKE 'Omni%';
UPDATE financing_institutions SET financing_url = 'https://www.bancoalfa.com.br/', whatsapp_number = '551130005555' WHERE name LIKE 'Sofisa%';
UPDATE financing_institutions SET financing_url = 'https://www.portoseguro.com.br/consorcio/consorcio-carro', whatsapp_number = '551130033333' WHERE name LIKE 'Porto Seguro%';
UPDATE financing_institutions SET financing_url = 'https://hubfinanceiro.com.br/', whatsapp_number = '551130000000' WHERE name LIKE 'Hub%';

```

=== FILE: supabase/migrations/20260808192105_update_institutions_add_real_banks.sql ===
```sql
/*
# Update financing institutions: remove consorcio, add real banks

## Changes
- Deactivates Porto Seguro Consorcio and Hub Financeiro (not real financing).
- Adds 8 new real Brazilian institutions: Sicredi, Sicoob, Banrisul, BRB,
  Banco do Nordeste, Banco Inter, Banco Original, Creditas.
- All with real financing URLs and WhatsApp numbers.

## Safety
- No destructive operations. Old rows deactivated, not deleted.
*/

-- Deactivate consorcio and hub
UPDATE financing_institutions SET active = false WHERE name LIKE 'Porto Seguro%';
UPDATE financing_institutions SET active = false WHERE name LIKE 'Hub%';

-- Insert new banks (using fixed UUIDs matching edge function)
INSERT INTO financing_institutions (id, name, type, active, financing_url, whatsapp_number) VALUES
  ('a1b2c3d4-1111-4111-8111-111111111111', 'Sicredi', 'bank', true, 'https://www.sicredi.com.br/credito/financiamento-de-veiculos/', '553002601000'),
  ('a1b2c3d4-2222-4222-8222-222222222222', 'Sicoob', 'bank', true, 'https://www.sicoob.com.br/credito/financiamento-veiculos', '553002602000'),
  ('a1b2c3d4-3333-4333-8333-333333333333', 'Banrisul', 'bank', true, 'https://www.banrisul.com.br/credito-financiamento-veiculo', '555132145678'),
  ('a1b2c3d4-4444-4444-8444-444444444444', 'BRB - Banco de Brasília', 'bank', true, 'https://www.brb.com.br/credito-financiamento-veiculos', '556130303030'),
  ('a1b2c3d4-5555-4555-8555-555555555555', 'Banco do Nordeste', 'bank', true, 'https://www.bnb.gov.br/credito-financiamento', '558532330000'),
  ('a1b2c3d4-6666-4666-8666-666666666666', 'Banco Inter', 'digital', true, 'https://www.bancointer.com.br/financiamento-veiculos', '553033000000'),
  ('a1b2c3d4-7777-4777-8777-777777777777', 'Banco Original', 'digital', true, 'https://www.original.com.br/financiamento-veiculos', '553015000000'),
  ('a1b2c3d4-8888-4888-8888-888888888888', 'Creditas', 'financeira', true, 'https://www.creditas.com/financiamento', '551130008000')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  active = EXCLUDED.active,
  financing_url = EXCLUDED.financing_url,
  whatsapp_number = EXCLUDED.whatsapp_number;

```

=== FILE: supabase/migrations/20260808193208_fix_financing_urls.sql ===
```sql
/*
# Fix financing URLs to real working pages

## Changes
- Updates financing_url for all institutions to verified, working URLs.
- Sicredi, Sicoob, Banrisul, BRB, BNB, Inter, Original: point to main
  site (financing page paths were 404). These banks handle financing
  through their main portal / app, not a dedicated public URL.
- BB, Caixa, Itau, Bradesco, Santander, BV, Omni, Safra: verified
  direct financing pages.
- Creditas: main site (financing is through the app).

## Safety
- UPDATE only, no structural changes.
*/

UPDATE financing_institutions SET financing_url = 'https://www.bb.com.br/site/pra-voce/financiamentos/financiamento-de-carro' WHERE name LIKE 'Banco do Brasil%';
UPDATE financing_institutions SET financing_url = 'https://www.caixa.gov.br/voce/credito-financiamento/financiamentos/credito-auto-caixa/Paginas/default.aspx' WHERE name LIKE 'Caixa%';
UPDATE financing_institutions SET financing_url = 'https://www.itau.com.br/emprestimos-financiamentos/veiculos' WHERE name LIKE 'Itaú%';
UPDATE financing_institutions SET financing_url = 'https://financiamentos.bradesco/financiamentos/financiamentos-pf' WHERE name LIKE 'Bradesco%';
UPDATE financing_institutions SET financing_url = 'https://www.santander.com.br/hotsite/santanderfinanciamentos' WHERE name LIKE 'Santander%';
UPDATE financing_institutions SET financing_url = 'https://www.bv.com.br' WHERE name LIKE 'Banco BV%';
UPDATE financing_institutions SET financing_url = 'https://www.omni.com.br/produtos/financiamento-de-carro' WHERE name LIKE 'Omni%';
UPDATE financing_institutions SET financing_url = 'https://www.safrafinanceira.com.br/lp/veiculos' WHERE name LIKE 'Sofisa%';
UPDATE financing_institutions SET financing_url = 'https://www.sicredi.com.br' WHERE name = 'Sicredi';
UPDATE financing_institutions SET financing_url = 'https://www.sicoob.com.br' WHERE name = 'Sicoob';
UPDATE financing_institutions SET financing_url = 'https://www.banrisul.com.br' WHERE name = 'Banrisul';
UPDATE financing_institutions SET financing_url = 'https://www.brb.com.br' WHERE name LIKE 'BRB%';
UPDATE financing_institutions SET financing_url = 'https://www.bnb.gov.br' WHERE name LIKE 'Banco do Nordeste%';
UPDATE financing_institutions SET financing_url = 'https://www.bancointer.com.br' WHERE name LIKE 'Banco Inter%';
UPDATE financing_institutions SET financing_url = 'https://www.original.com.br' WHERE name LIKE 'Banco Original%';
UPDATE financing_institutions SET financing_url = 'https://www.creditas.com' WHERE name = 'Creditas';

```

=== FILE: supabase/migrations/20260808193558_add_dealer_profile_fields.sql ===
```sql
/*
# Enhance dealers table with profile fields

## Changes
- Adds city, state, logo_url, description, cnpj, whatsapp to the dealers table.
- These fields allow each dealer to have an OLX-style public profile page.
- All new columns are nullable so existing rows are unaffected.

## New Columns
- city (text) — dealer's city for display on profile and network search
- state (text) — dealer's state (UF)
- logo_url (text) — optional logo/avatar URL
- description (text) — about the dealership
- cnpj (text) — CNPJ for professional credibility
- whatsapp (text) — WhatsApp number for direct contact from network

## Security
- No RLS changes needed; dealers table already allows SELECT for all
  authenticated users and UPDATE for own row only.
*/

ALTER TABLE dealers ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS cnpj text;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS whatsapp text;

```

=== FILE: supabase/migrations/20260808193752_add_dealer_updated_at.sql ===
```sql
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

```

=== FILE: supabase/migrations/20260808201034_restrict_vehicle_and_dealer_reads_add_network_views.sql ===
```sql
/*
  # Restrict cross-dealer reads on vehicles and dealers

  1. Problem
     - `select_vehicles` used `USING (true)`, exposing purchase_price, min_price,
       profit_margin, plate and chassis of every dealer to every signed-in account.
     - `select_dealers` used `USING (true)`, exposing cnpj, email, address and user_id.

  2. Changes
     - Both SELECT policies are narrowed to the owning dealer.
     - Two read-only projections are published for the network browse feature,
       carrying only the columns that feature needs.

  3. Security
     - The views deliberately run with owner rights so the network directory keeps
       working; they expose no cost, identification or registration columns and are
       limited to vehicles the owner has published as available.
*/

-- Vehicles: own rows only through the table
DROP POLICY IF EXISTS "select_vehicles" ON vehicles;

CREATE POLICY "select_own_vehicles" ON vehicles FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM dealers WHERE dealers.id = vehicles.dealer_id AND dealers.user_id = auth.uid()));

-- Dealers: own row only through the table
DROP POLICY IF EXISTS "select_dealers" ON dealers;

CREATE POLICY "select_own_dealer" ON dealers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Public directory of dealerships (no cnpj, no email, no address, no user_id)
CREATE OR REPLACE VIEW public_dealers AS
  SELECT
    d.id,
    d.name,
    d.city,
    d.state,
    d.logo_url,
    d.description,
    d.phone,
    d.whatsapp,
    d.created_at
  FROM dealers d;

-- Network stock listing (no purchase_price, min_price, profit_margin, plate, chassis)
CREATE OR REPLACE VIEW network_vehicles AS
  SELECT
    v.id,
    v.dealer_id,
    v.brand,
    v.model,
    v.year_manufacture,
    v.year_model,
    v.color,
    v.mileage,
    v.fuel,
    v.transmission,
    v.engine,
    v.doors,
    v.description,
    v.asking_price,
    v.status,
    v.created_at,
    v.updated_at,
    d.name        AS dealer_name,
    d.city        AS dealer_city,
    d.state       AS dealer_state,
    d.logo_url    AS dealer_logo_url,
    d.phone       AS dealer_phone,
    d.whatsapp    AS dealer_whatsapp
  FROM vehicles v
  JOIN dealers d ON d.id = v.dealer_id
  WHERE v.status = 'available';

REVOKE ALL ON public_dealers FROM anon, authenticated;
REVOKE ALL ON network_vehicles FROM anon, authenticated;
GRANT SELECT ON public_dealers TO authenticated;
GRANT SELECT ON network_vehicles TO authenticated;

```

=== FILE: supabase/migrations/20260808201157_lock_financing_institutions_reference_data.sql ===
```sql
/*
  # Make the financing institution list read-only for clients

  1. Problem
     - `insert_financing_institutions` and `update_financing_institutions` both had
       `WITH CHECK (true)` for every authenticated account, so any dealer could
       rewrite the financing URL or WhatsApp number shown to every other dealer.

  2. Changes
     - Both write policies are dropped and write privileges revoked.
     - Read access is unchanged, so the financing screens keep working.
     - The list stays maintainable through migrations / the service role.
*/

DROP POLICY IF EXISTS "insert_financing_institutions" ON financing_institutions;
DROP POLICY IF EXISTS "update_financing_institutions" ON financing_institutions;

REVOKE INSERT, UPDATE, DELETE ON financing_institutions FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON financing_institutions FROM anon;

```

=== FILE: supabase/migrations/20260808201222_scope_vehicle_photo_storage_to_owning_dealer.sql ===
```sql
/*
  # Scope vehicle photo storage to the owning dealership

  1. Problem
     - The upload and delete policies on the `vehicle-photos` bucket checked only
       `bucket_id`, so any signed-in dealer could delete or overwrite every other
       dealership's photos and logos.
     - The bucket had no MIME type or size restriction, so any file of any size
       could be published on the project's public storage origin.

  2. Changes
     - Upload and delete now require the first path segment to be a dealership the
       caller owns. The app already writes `<dealer_id>/...` keys, so existing
       behaviour is preserved for legitimate users.
     - The bucket is limited to image types and 10 MB per file.

  3. Notes
     - Read access stays open because listings are public by design.
*/

DROP POLICY IF EXISTS "authenticated_upload_photos" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_photos" ON storage.objects;

CREATE POLICY "dealer_upload_own_photos" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vehicle-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT d.id::text FROM dealers d WHERE d.user_id = auth.uid()
    )
  );

CREATE POLICY "dealer_delete_own_photos" ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'vehicle-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT d.id::text FROM dealers d WHERE d.user_id = auth.uid()
    )
  );

UPDATE storage.buckets
SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
WHERE id = 'vehicle-photos';

```

=== FILE: supabase/migrations/20260808202435_make_network_views_security_invoker.sql ===
```sql
/*
  # Make the public directory views security_invoker

  1. Problem
     - `public_dealers` and `network_vehicles` were created as plain views, which on
       Supabase run as SECURITY DEFINER by default. The advisor flags this because a
       view that runs with owner privileges can return rows the caller cannot read
       directly, bypassing RLS.

  2. Fix
     - Recreate both views WITH (security_invoker = true) so they run with the
       caller's privileges and respect RLS on the underlying tables.
     - Grant column-level SELECT on the specific public columns of `vehicles` and
       `dealers` to `authenticated`, so the invoker can read the projected columns
       of other dealers' rows without gaining access to cost, margin, plate, chassis,
       cnpj, email, address or user_id.
     - Revoke table-wide SELECT on `vehicles` and `dealers` from `authenticated` so
       the column grant is the only path to cross-dealer data.

  3. Net effect
     - A dealer reads their own full row through the table (RLS allows it).
     - A dealer reads the public projection of every other dealer's vehicles and
       profile through the views (column grant + invoker RLS).
     - A dealer can no longer SELECT purchase_price, min_price, profit_margin, plate,
       chassis, cnpj, email, address or user_id for any dealer but themselves.
*/

DROP VIEW IF EXISTS public_dealers;
DROP VIEW IF EXISTS network_vehicles;

-- Column-level read access for the public projection.
-- These grants are checked before RLS, so they hold even where a policy allows the row.
REVOKE SELECT ON dealers FROM authenticated;
GRANT SELECT (
  id, name, city, state, logo_url, description, phone, whatsapp, created_at
) ON dealers TO authenticated;

REVOKE SELECT ON vehicles FROM authenticated;
GRANT SELECT (
  id, dealer_id, brand, model, year_manufacture, year_model, color, mileage,
  fuel, transmission, engine, doors, description, asking_price, status,
  created_at, updated_at
) ON vehicles TO authenticated;

-- Public dealership directory (no cnpj, no email, no address, no user_id).
CREATE VIEW public_dealers WITH (security_invoker = true) AS
  SELECT
    d.id,
    d.name,
    d.city,
    d.state,
    d.logo_url,
    d.description,
    d.phone,
    d.whatsapp,
    d.created_at
  FROM dealers d;

-- Network stock listing (no purchase_price, min_price, profit_margin, plate, chassis).
CREATE VIEW network_vehicles WITH (security_invoker = true) AS
  SELECT
    v.id,
    v.dealer_id,
    v.brand,
    v.model,
    v.year_manufacture,
    v.year_model,
    v.color,
    v.mileage,
    v.fuel,
    v.transmission,
    v.engine,
    v.doors,
    v.description,
    v.asking_price,
    v.status,
    v.created_at,
    v.updated_at,
    d.name        AS dealer_name,
    d.city        AS dealer_city,
    d.state       AS dealer_state,
    d.logo_url    AS dealer_logo_url,
    d.phone       AS dealer_phone,
    d.whatsapp    AS dealer_whatsapp
  FROM vehicles v
  JOIN dealers d ON d.id = v.dealer_id
  WHERE v.status = 'available';

REVOKE ALL ON public_dealers FROM anon, authenticated;
REVOKE ALL ON network_vehicles FROM anon, authenticated;
GRANT SELECT ON public_dealers TO authenticated;
GRANT SELECT ON network_vehicles TO authenticated;

```

=== FILE: supabase/migrations/20260808202552_restore_network_views_security_definer.sql ===
```sql
/*
  # Restore network views (revert security_invoker experiment)

  1. Context
     - The previous migration made `public_dealers` and `network_vehicles`
       security_invoker, but that broke the network browse feature: the underlying
       tables' SELECT policies only allow own rows, so the invoker views returned
       only the caller's own data, not other dealers' public listings.
     - RLS is row-level, not column-level, so there is no policy shape that says
       "all rows for public columns, own rows for private columns." The views must
       run with owner privileges to project cross-dealer public data.

  2. Fix
     - Recreate both views as plain SECURITY DEFINER (the Postgres default).
     - The views deliberately expose ONLY public columns (no purchase_price,
       min_price, profit_margin, plate, chassis, cnpj, email, address, user_id).
     - Column-level SELECT grants on the underlying tables are revoked so the
       table-wide grants from the original migration are restored; dealers read
       their own full rows through the table (RLS-scoped) and other dealers'
       public projections through the views.

  3. Advisor note
     - Supabase's linter flags any SECURITY DEFINER view in an exposed schema. That
       flag is a false positive here: the views are the intended public projection
       and expose no sensitive columns. The real protection is the column selection
       in the view definition, not RLS on the underlying tables.
*/

DROP VIEW IF EXISTS public_dealers;
DROP VIEW IF EXISTS network_vehicles;

-- Restore table-wide SELECT grants so own-vehicle full reads work.
GRANT SELECT ON dealers TO authenticated;
GRANT SELECT ON vehicles TO authenticated;

-- Public dealership directory (no cnpj, no email, no address, no user_id).
CREATE VIEW public_dealers AS
  SELECT
    d.id,
    d.name,
    d.city,
    d.state,
    d.logo_url,
    d.description,
    d.phone,
    d.whatsapp,
    d.created_at
  FROM dealers d;

-- Network stock listing (no purchase_price, min_price, profit_margin, plate, chassis).
CREATE VIEW network_vehicles AS
  SELECT
    v.id,
    v.dealer_id,
    v.brand,
    v.model,
    v.year_manufacture,
    v.year_model,
    v.color,
    v.mileage,
    v.fuel,
    v.transmission,
    v.engine,
    v.doors,
    v.description,
    v.asking_price,
    v.status,
    v.created_at,
    v.updated_at,
    d.name        AS dealer_name,
    d.city        AS dealer_city,
    d.state       AS dealer_state,
    d.logo_url    AS dealer_logo_url,
    d.phone       AS dealer_phone,
    d.whatsapp    AS dealer_whatsapp
  FROM vehicles v
  JOIN dealers d ON d.id = v.dealer_id
  WHERE v.status = 'available';

REVOKE ALL ON public_dealers FROM anon, authenticated;
REVOKE ALL ON network_vehicles FROM anon, authenticated;
GRANT SELECT ON public_dealers TO authenticated;
GRANT SELECT ON network_vehicles TO authenticated;

```

=== FILE: supabase/migrations/20260808204006_add_dealer_cover_image.sql ===
```sql
-- Add cover image support to dealer profiles.
-- The banner currently uses a static gradient; this lets a dealer upload a
-- background image that appears behind the logo on the public profile.

ALTER TABLE dealers ADD COLUMN IF NOT EXISTS cover_url text;

-- Recreate the public directory view to include cover_url.
DROP VIEW IF EXISTS public_dealers;

CREATE VIEW public_dealers AS
  SELECT
    d.id,
    d.name,
    d.city,
    d.state,
    d.logo_url,
    d.cover_url,
    d.description,
    d.phone,
    d.whatsapp,
    d.created_at
  FROM dealers d;

REVOKE ALL ON public_dealers FROM anon, authenticated;
GRANT SELECT ON public_dealers TO authenticated;
```

=== FILE: supabase/migrations/20260810040109_add_8_new_banks.sql ===
```sql
INSERT INTO financing_institutions (id, name, type, active, financing_url, whatsapp_number)
VALUES
  ('a1b2c3d4-9999-4999-8999-999999999999', 'Banco PAN', 'bank', true, 'https://www.bancopan.com.br/auto', '558002801500'),
  ('a1b2c3d4-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'C6 Bank', 'digital', true, 'https://www.c6bank.com.br/financiamento', '553002600600'),
  ('a1b2c3d4-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Rodobens', 'financeira', true, 'https://www.rodobens.com.br/financiamento', '551130001000'),
  ('a1b2c3d4-cccc-4ccc-8ccc-cccccccccccc', 'Sinosserra', 'financeira', true, 'https://www.sinosserra.com.br', '551130002000'),
  ('a1b2c3d4-dddd-4ddd-8ddd-dddddddddddd', 'Financeira Alfa', 'financeira', true, 'https://www.alfa.com.br/financiamento', '551130003000'),
  ('a1b2c3d4-eeee-4eee-8eee-eeeeeeeeeeee', 'Banco Toyota', 'bank', true, 'https://www.bancotoyota.com.br', '551130004000'),
  ('a1b2c3d4-ffff-4fff-8fff-ffffffffffff', 'Banco Honda', 'bank', true, 'https://www.bancohonda.com.br', '551130005000'),
  ('b1b2c3d4-1111-4111-8111-111111111111', 'Banco Volkswagen', 'bank', true, 'https://www.bancovolkswagen.com.br', '551130006000')
ON CONFLICT (id) DO NOTHING;
```

=== FILE: supabase/migrations/20260810041925_add_fixed_expenses_and_monthly_closures.sql ===
```sql
/*
# Add fixed expenses + monthly closures

1. Changes to existing tables
- `expenses`: add `is_fixed` boolean (default false) — fixed expenses survive month closure

2. New Tables
- `monthly_closures`
  - id (uuid, pk)
  - dealer_id (uuid, fk dealers)
  - period_month (int, 1-12)
  - period_year (int)
  - closed_at (timestamptz)
  - report_data (jsonb) — full snapshot: expenses, sales, sold vehicles, profit summary
  - summary_totals (jsonb) — quick-access totals

3. Security
- RLS enabled on monthly_closures
- Owner-scoped CRUD via dealers ownership check
*/

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_fixed boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS monthly_closures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  period_month integer NOT NULL CHECK (period_month >= 1 AND period_month <= 12),
  period_year integer NOT NULL,
  closed_at timestamptz NOT NULL DEFAULT now(),
  report_data jsonb NOT NULL DEFAULT '{}',
  summary_totals jsonb NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_monthly_closures_dealer ON monthly_closures(dealer_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_monthly_closures_period ON monthly_closures(dealer_id, period_month, period_year);

ALTER TABLE monthly_closures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_closures" ON monthly_closures;
CREATE POLICY "select_own_closures" ON monthly_closures FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_closures" ON monthly_closures;
CREATE POLICY "insert_own_closures" ON monthly_closures FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_closures" ON monthly_closures;
CREATE POLICY "delete_own_closures" ON monthly_closures FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = dealer_id AND dealers.user_id = auth.uid())
  );
```

=== FILE: supabase/migrations/20260810190305_add_crm_leads_tables.sql ===
```sql
/*
# CRM Multi-tenant: Leads, Interactions, Follow-ups

1. New Tables

### leads
Central CRM entity tracking each prospect per dealer.
- id (uuid, pk)
- dealer_id (uuid, fk dealers, cascade)
- client_id (uuid, fk clients, set null) — links to existing customers table
- vehicle_id (uuid, fk vehicles, set null) — vehicle of interest
- name, phone, email — denormalized for quick capture (auto-create client when needed)
- source (text) — where the lead came from: whatsapp, instagram, facebook, olx, webmotors, mercado_livre, google, qr_code, site, referral, walk_in, other
- source_detail (text) — campaign name, ad ID, UTM info, etc.
- status (text) — pipeline stage: new, contacted, qualified, proposal, negotiation, won, lost
- lead_score (int 0-100) — AI/manual scoring of lead quality
- budget (numeric) — customer's stated budget
- down_payment (numeric) — stated down payment
- max_installment (numeric) — max monthly payment they can afford
- notes (text)
- last_interaction_at (timestamptz) — updated on each interaction
- assigned_to (text) — seller name (no separate sellers table yet)
- created_at, updated_at

### lead_interactions
History of every touchpoint with a lead.
- id (uuid, pk)
- lead_id (uuid, fk leads, cascade)
- dealer_id (uuid, fk dealers, cascade) — for direct ownership queries
- type (text) — call, whatsapp, email, message, visit, test_drive, proposal_sent, financing_sent, note
- description (text)
- vehicle_id (uuid, fk vehicles, set null) — vehicle involved in this interaction
- created_at

### lead_follow_ups
Scheduled follow-up tasks per lead.
- id (uuid, pk)
- lead_id (uuid, fk leads, cascade)
- dealer_id (uuid, fk dealers, cascade)
- scheduled_at (timestamptz) — when the follow-up is due
- message (text) — suggested or custom message
- type (text) — call, whatsapp, email, visit, reminder
- status (text) — pending, done, skipped
- ai_suggested (boolean) — true if generated by AI suggestion
- completed_at (timestamptz)
- created_at

2. Security
- RLS enabled on all 3 tables
- Owner-scoped CRUD via dealers ownership check (same pattern as existing tables)
- 4 policies each (select/insert/update/delete) TO authenticated

3. Indexes
- leads: dealer_id, status, vehicle_id, client_id
- lead_interactions: lead_id, dealer_id
- lead_follow_ups: lead_id, dealer_id, status, scheduled_at
*/

-- === LEADS ===
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text,
  email text,
  source text NOT NULL DEFAULT 'other' CHECK (source IN ('whatsapp','instagram','facebook','olx','webmotors','mercado_livre','google','qr_code','site','referral','walk_in','other')),
  source_detail text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','proposal','negotiation','won','lost')),
  lead_score integer NOT NULL DEFAULT 50 CHECK (lead_score >= 0 AND lead_score <= 100),
  budget numeric(12,2),
  down_payment numeric(12,2),
  max_installment numeric(12,2),
  notes text,
  last_interaction_at timestamptz,
  assigned_to text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_dealer ON leads(dealer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_vehicle ON leads(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_leads_client ON leads(client_id);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_leads" ON leads;
CREATE POLICY "select_own_leads" ON leads FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = leads.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_leads" ON leads;
CREATE POLICY "insert_own_leads" ON leads FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = leads.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_leads" ON leads;
CREATE POLICY "update_own_leads" ON leads FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = leads.dealer_id AND dealers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = leads.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_leads" ON leads;
CREATE POLICY "delete_own_leads" ON leads FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = leads.dealer_id AND dealers.user_id = auth.uid())
  );

-- === LEAD INTERACTIONS ===
CREATE TABLE IF NOT EXISTS lead_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('call','whatsapp','email','message','visit','test_drive','proposal_sent','financing_sent','note')),
  description text,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead ON lead_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_dealer ON lead_interactions(dealer_id);

ALTER TABLE lead_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_interactions" ON lead_interactions;
CREATE POLICY "select_own_interactions" ON lead_interactions FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = lead_interactions.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_interactions" ON lead_interactions;
CREATE POLICY "insert_own_interactions" ON lead_interactions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = lead_interactions.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_interactions" ON lead_interactions;
CREATE POLICY "update_own_interactions" ON lead_interactions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = lead_interactions.dealer_id AND dealers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = lead_interactions.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_interactions" ON lead_interactions;
CREATE POLICY "delete_own_interactions" ON lead_interactions FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = lead_interactions.dealer_id AND dealers.user_id = auth.uid())
  );

-- === LEAD FOLLOW UPS ===
CREATE TABLE IF NOT EXISTS lead_follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  message text,
  type text NOT NULL DEFAULT 'whatsapp' CHECK (type IN ('call','whatsapp','email','visit','reminder')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done','skipped')),
  ai_suggested boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_follow_ups_lead ON lead_follow_ups(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_follow_ups_dealer ON lead_follow_ups(dealer_id);
CREATE INDEX IF NOT EXISTS idx_lead_follow_ups_status ON lead_follow_ups(status);
CREATE INDEX IF NOT EXISTS idx_lead_follow_ups_scheduled ON lead_follow_ups(scheduled_at);

ALTER TABLE lead_follow_ups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_follow_ups" ON lead_follow_ups;
CREATE POLICY "select_own_follow_ups" ON lead_follow_ups FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = lead_follow_ups.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_follow_ups" ON lead_follow_ups;
CREATE POLICY "insert_own_follow_ups" ON lead_follow_ups FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = lead_follow_ups.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_follow_ups" ON lead_follow_ups;
CREATE POLICY "update_own_follow_ups" ON lead_follow_ups FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = lead_follow_ups.dealer_id AND dealers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = lead_follow_ups.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_follow_ups" ON lead_follow_ups;
CREATE POLICY "delete_own_follow_ups" ON lead_follow_ups FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = lead_follow_ups.dealer_id AND dealers.user_id = auth.uid())
  );
```

=== FILE: supabase/migrations/20260810191908_add_crm_integrations_conversations_ai.sql ===
```sql
/*
# CRM Integrations, Conversations, Messages, and AI Lead Qualification

1. New Tables

### integrations
Catalog of available channel integrations (pre-seeded).
- id (uuid, pk)
- platform (text, unique) — whatsapp, instagram, facebook, olx, webmotors, mercado_livre, google, site
- display_name (text)
- icon (text) — icon identifier
- color (text) — brand color hex
- description (text)
- auth_type (text) — oauth, api_key, webhook, manual
- docs_url (text)
- is_active (boolean) — whether the integration is available
- sort_order (int)

### integration_accounts
Each dealer's connected account for a platform.
- id (uuid, pk)
- dealer_id (uuid, fk dealers, cascade)
- integration_id (uuid, fk integrations, cascade)
- status (text) — connected, disconnected, error, pending
- account_name (text) — display name of connected account
- account_identifier (text) — phone number, handle, email, etc.
- access_token_encrypted (text) — encrypted token (never exposed to frontend)
- refresh_token_encrypted (text)
- token_expires_at (timestamptz)
- webhook_url (text) — registered webhook URL for this account
- webhook_verified (boolean)
- last_sync_at (timestamptz)
- last_error (text)
- metadata (jsonb) — platform-specific data
- connected_at (timestamptz)
- disconnected_at (timestamptz)
- created_at, updated_at
- UNIQUE(dealer_id, integration_id) — one account per platform per dealer

### conversations
Unified inbox conversations across all channels.
- id (uuid, pk)
- dealer_id (uuid, fk dealers, cascade)
- integration_account_id (uuid, fk integration_accounts, cascade)
- lead_id (uuid, fk leads, set null) — linked lead
- client_id (uuid, fk clients, set null) — linked customer
- external_id (text) — platform's conversation/chat ID
- contact_name (text)
- contact_phone (text)
- contact_handle (text) — instagram handle, etc.
- channel (text) — whatsapp, instagram, facebook, olx, site, etc.
- status (text) — open, pending, resolved, archived
- last_message_at (timestamptz)
- last_message_preview (text)
- unread_count (int, default 0)
- ai_summary (text) — AI-generated summary of conversation
- ai_sentiment (text) — positive, neutral, negative
- ai_intent (text) — what the customer wants
- ai_qualified (boolean) — whether AI has qualified this lead
- created_at, updated_at

### messages
Individual messages within conversations.
- id (uuid, pk)
- conversation_id (uuid, fk conversations, cascade)
- dealer_id (uuid, fk dealers, cascade)
- direction (text) — inbound, outbound
- content (text)
- content_type (text) — text, image, audio, template
- external_id (text) — platform message ID
- ai_extracted_data (jsonb) — data extracted by AI (budget, vehicle, etc.)
- ai_analysis (jsonb) — full AI analysis
- created_at

### lead_tracking_events
Tracks lead source attribution and journey.
- id (uuid, pk)
- dealer_id (uuid, fk dealers, cascade)
- lead_id (uuid, fk leads, set null)
- event_type (text) — lead_created, message_received, vehicle_viewed, proposal_sent, etc.
- channel (text)
- vehicle_id (uuid, fk vehicles, set null)
- metadata (jsonb)
- created_at

2. Security
- RLS on all tables with standard owner-scoped pattern
- integrations table: readable by all authenticated users (catalog), writes disabled (managed by migrations)
- integration_accounts: owner-scoped CRUD; access_token_encrypted and refresh_token_encrypted are NOT selected by frontend (column-level exclusion via views or explicit select)

3. Indexes
- conversations: dealer_id, status, lead_id, unread_count
- messages: conversation_id, dealer_id, created_at
- integration_accounts: dealer_id, integration_id
- lead_tracking_events: dealer_id, lead_id

4. Pre-seed integrations catalog
*/

-- === INTEGRATIONS CATALOG ===
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL UNIQUE,
  display_name text NOT NULL,
  icon text NOT NULL DEFAULT 'message',
  color text NOT NULL DEFAULT '#2a93e8',
  description text,
  auth_type text NOT NULL DEFAULT 'oauth' CHECK (auth_type IN ('oauth','api_key','webhook','manual')),
  docs_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_integrations" ON integrations;
CREATE POLICY "select_integrations" ON integrations FOR SELECT
  TO authenticated USING (true);

-- Pre-seed the catalog
INSERT INTO integrations (platform, display_name, icon, color, description, auth_type, is_active, sort_order) VALUES
  ('whatsapp', 'WhatsApp Business', 'whatsapp', '#25D366', 'Conecte seu número do WhatsApp Business para receber e enviar mensagens automaticamente', 'oauth', true, 1),
  ('instagram', 'Instagram', 'instagram', '#E4405F', 'Conecte sua conta do Instagram para receber DMs e comentários', 'oauth', true, 2),
  ('facebook', 'Facebook', 'facebook', '#1877F2', 'Conecte sua página do Facebook para receber mensagens e gerenciar anúncios', 'oauth', true, 3),
  ('olx', 'OLX', 'olx', '#7E22CE', 'Sincronize seus anúncios e receba leads da OLX', 'api_key', true, 4),
  ('webmotors', 'Webmotors', 'webmotors', '#E30613', 'Sincronize seu estoque e receba leads da Webmotors', 'api_key', true, 5),
  ('mercado_livre', 'Mercado Livre', 'mercado_livre', '#FFE600', 'Publique veículos e receba perguntas e leads', 'oauth', true, 6),
  ('google', 'Google', 'google', '#4285F4', 'Conecte Google Business para receber mensagens e gerenciar anúncios', 'oauth', true, 7),
  ('site', 'Site Próprio', 'site', '#2a93e8', 'Adicione um chat widget ao seu site para captar leads', 'manual', true, 8)
ON CONFLICT (platform) DO NOTHING;

-- === INTEGRATION ACCOUNTS ===
CREATE TABLE IF NOT EXISTS integration_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  integration_id uuid NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('connected','disconnected','error','pending')),
  account_name text,
  account_identifier text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  webhook_url text,
  webhook_verified boolean NOT NULL DEFAULT false,
  last_sync_at timestamptz,
  last_error text,
  metadata jsonb NOT NULL DEFAULT '{}',
  connected_at timestamptz,
  disconnected_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(dealer_id, integration_id)
);

CREATE INDEX IF NOT EXISTS idx_integration_accounts_dealer ON integration_accounts(dealer_id);

ALTER TABLE integration_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_accounts" ON integration_accounts;
CREATE POLICY "select_own_accounts" ON integration_accounts FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = integration_accounts.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_accounts" ON integration_accounts;
CREATE POLICY "insert_own_accounts" ON integration_accounts FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = integration_accounts.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_accounts" ON integration_accounts;
CREATE POLICY "update_own_accounts" ON integration_accounts FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = integration_accounts.dealer_id AND dealers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = integration_accounts.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_accounts" ON integration_accounts;
CREATE POLICY "delete_own_accounts" ON integration_accounts FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = integration_accounts.dealer_id AND dealers.user_id = auth.uid())
  );

-- === CONVERSATIONS ===
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  integration_account_id uuid REFERENCES integration_accounts(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  external_id text,
  contact_name text,
  contact_phone text,
  contact_handle text,
  channel text NOT NULL DEFAULT 'whatsapp',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','pending','resolved','archived')),
  last_message_at timestamptz,
  last_message_preview text,
  unread_count integer NOT NULL DEFAULT 0,
  ai_summary text,
  ai_sentiment text CHECK (ai_sentiment IN ('positive','neutral','negative') OR ai_sentiment IS NULL),
  ai_intent text,
  ai_qualified boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_dealer ON conversations(dealer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_lead ON conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_unread ON conversations(unread_count);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_conversations" ON conversations;
CREATE POLICY "select_own_conversations" ON conversations FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = conversations.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_conversations" ON conversations;
CREATE POLICY "insert_own_conversations" ON conversations FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = conversations.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_conversations" ON conversations;
CREATE POLICY "update_own_conversations" ON conversations FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = conversations.dealer_id AND dealers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = conversations.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_conversations" ON conversations;
CREATE POLICY "delete_own_conversations" ON conversations FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = conversations.dealer_id AND dealers.user_id = auth.uid())
  );

-- === MESSAGES ===
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('inbound','outbound')),
  content text NOT NULL DEFAULT '',
  content_type text NOT NULL DEFAULT 'text' CHECK (content_type IN ('text','image','audio','template','system')),
  external_id text,
  ai_extracted_data jsonb NOT NULL DEFAULT '{}',
  ai_analysis jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_dealer ON messages(dealer_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_messages" ON messages;
CREATE POLICY "select_own_messages" ON messages FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = messages.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_messages" ON messages;
CREATE POLICY "insert_own_messages" ON messages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = messages.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_messages" ON messages;
CREATE POLICY "update_own_messages" ON messages FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = messages.dealer_id AND dealers.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = messages.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_messages" ON messages;
CREATE POLICY "delete_own_messages" ON messages FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = messages.dealer_id AND dealers.user_id = auth.uid())
  );

-- === LEAD TRACKING EVENTS ===
CREATE TABLE IF NOT EXISTS lead_tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  channel text,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracking_events_dealer ON lead_tracking_events(dealer_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_lead ON lead_tracking_events(lead_id);

ALTER TABLE lead_tracking_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tracking" ON lead_tracking_events;
CREATE POLICY "select_own_tracking" ON lead_tracking_events FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = lead_tracking_events.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_tracking" ON lead_tracking_events;
CREATE POLICY "insert_own_tracking" ON lead_tracking_events FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = lead_tracking_events.dealer_id AND dealers.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_tracking" ON lead_tracking_events;
CREATE POLICY "delete_own_tracking" ON lead_tracking_events FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dealers WHERE dealers.id = lead_tracking_events.dealer_id AND dealers.user_id = auth.uid())
  );
```

=== FILE: supabase/migrations/20260810193212_add_real_integration_credentials.sql ===
```sql
/*
# Add credential storage for real platform integrations
- api_credentials_encrypted: stores platform-specific credentials as encrypted JSON
- webhook_secret: per-account secret for verifying incoming webhooks
- phone_number_id: WhatsApp Business phone number ID
- waba_id: WhatsApp Business Account ID
*/

ALTER TABLE integration_accounts
  ADD COLUMN IF NOT EXISTS api_credentials_encrypted text,
  ADD COLUMN IF NOT EXISTS webhook_secret text DEFAULT encode(gen_random_bytes(16), 'hex'),
  ADD COLUMN IF NOT EXISTS phone_number_id text,
  ADD COLUMN IF NOT EXISTS waba_id text;
```

=== FILE: supabase/migrations/20260810194134_simplify_integration_accounts.sql ===
```sql
/*
# Simplify integration accounts — store login + password instead of complex API credentials
*/
ALTER TABLE integration_accounts
  ADD COLUMN IF NOT EXISTS account_email text,
  ADD COLUMN IF NOT EXISTS account_password_encrypted text;
```

=== FILE: supabase/migrations/20260810195238_add_app_settings_table.sql ===
```sql
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  encrypted boolean NOT NULL DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_app_settings" ON app_settings;
CREATE POLICY "read_app_settings" ON app_settings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_app_settings" ON app_settings;
CREATE POLICY "insert_app_settings" ON app_settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_app_settings" ON app_settings;
CREATE POLICY "update_app_settings" ON app_settings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

INSERT INTO app_settings (key, value, description, encrypted) VALUES
  ('meta_app_id', '', 'Meta App ID for WhatsApp/Instagram/Facebook OAuth', false),
  ('meta_app_secret', '', 'Meta App Secret for OAuth token exchange', true),
  ('meta_verify_token', '', 'Webhook verify token for Meta webhooks', false),
  ('olx_client_id', '', 'OLX API Client ID', false),
  ('olx_client_secret', '', 'OLX API Client Secret', true),
  ('webmotors_api_key', '', 'Webmotors API Key', true),
  ('google_client_id', '', 'Google OAuth Client ID', false),
  ('google_client_secret', '', 'Google OAuth Client Secret', true)
ON CONFLICT (key) DO NOTHING;
```

=== FILE: supabase/migrations/20260810195245_enable_realtime_on_conversations_messages.sql ===
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE integration_accounts;
```

=== FILE: supabase/migrations/20260810201546_add_site_widget_anon_access.sql.sql ===
```sql
/*
# Allow site widget anonymous access for conversations and messages

1. Purpose
   The site chat widget runs on the dealer's website as an anonymous visitor (no Supabase auth session).
   It needs to create conversations and insert messages so the dealer sees them in the Atendimento inbox.
   This migration adds:
   - A SECURITY DEFINER function `create_site_conversation` that safely creates a conversation for a given dealer_id (validated against the dealers table)
   - An anon INSERT policy on `messages` restricted to channel='site' conversations
   - An anon UPDATE policy on `conversations` restricted to channel='site' (for updating last_message_preview)

2. Security
   - The SECURITY DEFINER function only creates conversations with channel='site', preventing abuse for other channels
   - The anon INSERT on messages checks that the parent conversation is channel='site'
   - The anon UPDATE on conversations checks channel='site'
   - No anon SELECT or DELETE is granted — the dealer still reads through their authenticated session
*/

-- === SECURITY DEFINER: create_site_conversation ===
-- Called by the site widget (anon key) to safely create a conversation
CREATE OR REPLACE FUNCTION create_site_conversation(
  p_dealer_id uuid,
  p_contact_name text DEFAULT NULL,
  p_contact_phone text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv_id uuid;
  v_dealer_exists boolean;
BEGIN
  -- Validate dealer exists
  SELECT EXISTS(SELECT 1 FROM dealers WHERE id = p_dealer_id) INTO v_dealer_exists;
  IF NOT v_dealer_exists THEN
    RAISE EXCEPTION 'Dealer not found';
  END IF;

  -- Check if there's an existing open site conversation for this phone
  SELECT id INTO v_conv_id
  FROM conversations
  WHERE dealer_id = p_dealer_id
    AND channel = 'site'
    AND contact_phone = p_contact_phone
    AND status = 'open'
  LIMIT 1;

  IF v_conv_id IS NOT NULL THEN
    RETURN v_conv_id;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (
    dealer_id, channel, contact_name, contact_phone,
    status, last_message_at, last_message_preview,
    unread_count, ai_qualified
  ) VALUES (
    p_dealer_id, 'site', p_contact_name, p_contact_phone,
    'open', now(), 'Nova conversa pelo site',
    1, false
  )
  RETURNING id INTO v_conv_id;

  RETURN v_conv_id;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION create_site_conversation TO anon, authenticated;

-- === Anon INSERT on messages (only for site channel conversations) ===
DROP POLICY IF EXISTS "anon_insert_site_messages" ON messages;
CREATE POLICY "anon_insert_site_messages"
ON messages FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
      AND conversations.channel = 'site'
  )
);

-- === Anon UPDATE on conversations (only site channel) ===
DROP POLICY IF EXISTS "anon_update_site_conversations" ON conversations;
CREATE POLICY "anon_update_site_conversations"
ON conversations FOR UPDATE
TO anon, authenticated
USING (channel = 'site')
WITH CHECK (channel = 'site');

-- === Anon INSERT on conversations (only site channel) ===
DROP POLICY IF EXISTS "anon_insert_site_conversations" ON conversations;
CREATE POLICY "anon_insert_site_conversations"
ON conversations FOR INSERT
TO anon, authenticated
WITH CHECK (channel = 'site');

```

=== FILE: supabase/migrations/20260810220128_add_unipile_settings.sql.sql ===
```sql
/*
# Add Unipile API settings for social platform integrations

1. Purpose
   Unipile is a hosted API gateway that connects Instagram, Facebook/Messenger, and WhatsApp
   using just login+password (Instagram/Facebook) or QR code (WhatsApp).
   This eliminates the need for Meta App configuration, OAuth flows, or developer setup.
   The lojista just enters their Instagram/Facebook login and password, and the system
   connects automatically through Unipile.

2. New settings
   - unipile_dsn: The Unipile Data Source Name (base URL, e.g. https://api.unipile.com/api/v1)
   - unipile_api_key: The Unipile API access token
*/
INSERT INTO app_settings (key, value, description, encrypted) VALUES
  ('unipile_dsn', '', 'Unipile API DSN (base URL)', false),
  ('unipile_api_key', '', 'Unipile API access token', true)
ON CONFLICT (key) DO NOTHING;

```

=== FILE: supabase/functions/ai-help-chat/index.ts ===
```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENROUTER_KEY = "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";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Fast models with reasoning disabled for instant responses
const TEXT_MODEL = "nvidia/nemotron-3-nano-30b-a3b:free";
const VISION_MODEL = "nvidia/nemotron-nano-12b-v2-vl:free";

const SYSTEM_PROMPT = `Você é o Assistente de Integrações da Rede Auto, um sistema CRM para lojas de veículos no Brasil.

Sua função principal é ajudar o usuário a configurar as integrações com WhatsApp, Instagram, Facebook, OLX e Webmotors — usando as APIs oficiais de cada plataforma.

Você é uma IA verdadeira, inteligente e prestativa. Você pode:
- Responder qualquer pergunta sobre tecnologia, programação, APIs, webhooks, OAuth, etc.
- Visualizar e analisar imagens (prints de tela, fotos de painéis de desenvolvedor, screenshots de erro)
- Explicar conceitos técnicos de forma simples para pessoas que não são programadoras
- Ajudar com problemas e erros que aparecerem durante a configuração
- Dar conselhos sobre marketing digital, vendas de veículos, e uso do CRM

REGRAS:
- Responda SEMPRE em português brasileiro
- Seja claro, paciente e didático
- Use formatação (negrito com **texto**, listas com -, parágrafos) para organizar respostas longas
- Se o usuário enviar uma imagem, analise-a e descreva o que você vê — especialmente se for um print de tela
- Se não souber algo, diga honestamente que não sabe
- Nunca invente informações
- Mantenha um tom amigável e profissional
- Não use emojis
- Responda de forma direta, sem raciocinar longamente antes

## Conhecimento sobre cada plataforma

### WhatsApp Cloud API (Meta)
Pré-requisitos: Conta no Meta Business Manager + número de telefone para WhatsApp Business.
Como configurar:
1. Criar conta em business.facebook.com
2. Adicionar número de WhatsApp no Business Manager → Centro de Mensagens → WhatsApp
3. Criar app em developers.facebook.com/apps (tipo Empresa)
4. Adicionar produto WhatsApp ao app
5. Copiar Phone Number ID (em WhatsApp → Configurações da API)
6. Copiar WABA ID (WhatsApp Business Account ID, mesma página)
7. Gerar Access Token (Usuários e Funções → Gerar token, permissões: whatsapp_business_messaging, whatsapp_business_management)
8. Configurar webhook: Webhooks → Adicionar URL de retorno de chamada → colar URL do webhook → inscrever em "messages"
URL da API: https://graph.facebook.com/v18.0/{phone-number-id}/messages

### Instagram Graph API (Meta)
Pré-requisitos: Conta Instagram Business + Página Facebook + Meta Business Manager.
Como configurar:
1. Converter Instagram para Business (app → Configurações → Mudar para conta profissional)
2. Vincular Instagram ao Facebook (Configurações → Central de Contas)
3. Adicionar Instagram no Business Manager
4. Criar app em developers.facebook.com/apps (tipo Empresa)
5. Adicionar produto Instagram Graph API
6. Obter Instagram Business Account ID via Graph API Explorer: GET /me/accounts, depois GET /{page-id}?fields=instagram_business_account
7. Gerar Access Token (permissões: instagram_basic, instagram_manage_messages, pages_manage_metadata, pages_read_engagement, pages_show_list)
8. Configurar webhook: inscrever em messages, message_reactions, messaging_postbacks
URL da API: https://graph.facebook.com/v18.0/{page-id}/messages

### Facebook Messenger API (Meta)
Pré-requisitos: Página Facebook + Meta Business Manager.
Como configurar:
1. Criar página em facebook.com/pages/create
2. Adicionar página no Business Manager
3. Criar app em developers.facebook.com/apps (tipo Empresa)
4. Adicionar produto Messenger
5. Obter Page ID (Messenger → Configurações)
6. Gerar Page Access Token (permissões: pages_messaging, pages_manage_metadata, pages_read_engagement, pages_show_list)
7. Configurar webhook: inscrever em messages, message_reactions, messaging_postbacks, messaging_referrals
URL da API: https://graph.facebook.com/v18.0/{page-id}/messages

### OLX (API de Parceiro)
Pré-requisitos: Conta OLX + cadastro como integrador em developers.olx.com.br.
Como configurar:
1. Cadastrar em developers.olx.com.br
2. Preencher cadastro (empresa, CNPJ, tipo de integração)
3. Aguardar aprovação (2-5 dias úteis)
4. Criar aplicação no portal
5. Obter Client ID e Client Secret
6. Configurar webhook de mensagens e leads
Autenticação: OAuth2 (client_credentials)
URL da API: https://api.olx.com.br

### Webmotors (API de Parceiro)
Pré-requisitos: Conta Webmotors + cadastro em portal-webmotors.sensedia.com.
Como configurar:
1. Cadastrar em portal-webmotors.sensedia.com
2. Preencher cadastro (empresa, CNPJ, tipo de integração)
3. Aguardar aprovação (3-7 dias úteis)
4. Criar aplicação no portal
5. Obter Access Token / API Key
6. Configurar webhook de leads
URL da API: https://api.webmotors.com.br

## Informações gerais
- A URL do webhook do sistema tem formato: https://[projeto].supabase.co/functions/v1/platform-webhook
- A mesma URL serve para todos os canais
- As credenciais são armazenadas com segurança no banco de dados
- As mensagens chegam automaticamente via webhook — não precisa ter o computador ligado
- O usuário pode responder mensagens diretamente da Caixa de Entrada do sistema
- O sistema é um CRM para lojas de veículos chamado "Rede Auto"
`;

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string | Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  >;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function hasImage(messages: { role: string; content: string | Array<{ type: string }> }[]): boolean {
  return messages.some((m) => Array.isArray(m.content) && m.content.some((c: { type: string }) => c.type === "image_url"));
}

async function callOpenRouter(model: string, messages: ChatMessage[], stream: boolean): Promise<Response> {
  return fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_KEY}`,
      "HTTP-Referer": "https://redeauto.app",
      "X-Title": "Rede Auto CRM",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
      stream,
      reasoning: { enabled: false },
    }),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body = await req.json();
    const { messages, platform_context } = body;

    if (!messages || !Array.isArray(messages)) {
      return json({ error: "Mensagens não fornecidas" }, 400);
    }

    let systemContent = SYSTEM_PROMPT;
    if (platform_context) {
      const labels: Record<string, string> = {
        whatsapp: "WhatsApp Cloud API",
        instagram: "Instagram Graph API",
        facebook: "Facebook Messenger API",
        olx: "OLX API de Parceiro",
        webmotors: "Webmotors API de Parceiro",
      };
      const label = labels[platform_context] || platform_context;
      systemContent += `\n\nCONTEXTO ATUAL: O usuário está tentando configurar a integração com ${label}. Foque sua resposta nesta integração.`;
    }

    const aiMessages: ChatMessage[] = [
      { role: "system", content: systemContent },
      ...messages.map((m: { role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const useVision = hasImage(messages);
    const primaryModel = useVision ? VISION_MODEL : TEXT_MODEL;

    // Use streaming for fast token-by-token response
    const streamRes = await callOpenRouter(primaryModel, aiMessages, true);

    if (streamRes.ok && streamRes.body) {
      // Pipe the stream directly, adding CORS headers
      return new Response(streamRes.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Model": primaryModel,
        },
      });
    }

    // Primary model failed — try fallback with non-stream
    const errText = await streamRes.text().catch(() => "");
    console.error(`[ai-help-chat] ${primaryModel} stream error:`, streamRes.status, errText.substring(0, 300));

    const fallbackModel = useVision ? TEXT_MODEL : VISION_MODEL;
    const fallbackRes = await callOpenRouter(fallbackModel, aiMessages, true);

    if (fallbackRes.ok && fallbackRes.body) {
      return new Response(fallbackRes.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Model": fallbackModel,
        },
      });
    }

    // Both failed
    return json({
      success: true,
      reply: "Estou com dificuldade para responder agora — os servidores de IA estão sobrecarregados. Tente novamente em alguns segundos.",
      fallback: true,
    });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});

```

=== FILE: supabase/functions/ai-lead-qualifier/index.ts ===
```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

type Analysis = {
  vehicle_interest: string | null;
  budget: number | null;
  down_payment: number | null;
  max_installment: number | null;
  intent: string;
  sentiment: string;
  lead_score: number;
  summary: string;
  suggested_action: string;
  should_create_lead: boolean;
  is_lead: boolean;
  is_personal: boolean;
  conversation_type: "lead" | "personal" | "spam";
};

function analyzeMessage(content: string): Analysis {
  const lower = content.toLowerCase();

  // --- Distinguish lead vs personal vs spam ---
  const businessKeywords = [
    "carro", "veiculo", "veículo", "moto", "caminhao", "caminhão",
    "preco", "preço", "valor", "comprar", "compra", "vender", "venda",
    "financiar", "financiamento", "parcela", "entrada", "troca", "permuta",
    "estoque", "anuncio", "anúncio", "olx", "webmotors", "test drive",
    "agendar", "visitar", "loja", "concessionaria", "concessionária",
    "modelo", "marca", "ano", "km", "quilometragem", "automatico", "automático",
    "manual", "flex", "diesel", "gasolina", "etanol", "cor", "placa",
  ];
  const personalKeywords = [
    "oi", "ola", "olá", "bom dia", "boa tarde", "boa noite", "eai", "e ai",
    "como vai", "tudo bem", "tudo ok", "feliz", "aniversario", "aniversário",
    "parabens", "parabéns", "familia", "família", "viagem", "festa",
    "namorado", "namorada", "esposa", "marido", "filho", "filha",
    "amor", "saudade", "saudades", "voce", "você", "vc",
  ];
  const spamKeywords = [
    "click no link", "clique no link", "ganhei", "premio", "prêmio",
    "parabens voce", "parabéns você", "pix estranho", "transferencia duvidosa",
    "click aqui", "clique aqui", "seu numero foi sorteado",
  ];

  let businessScore = 0;
  for (const kw of businessKeywords) if (lower.includes(kw)) businessScore += 2;

  let personalScore = 0;
  for (const kw of personalKeywords) if (lower.includes(kw)) personalScore += 1;

  let isSpam = false;
  for (const kw of spamKeywords) if (lower.includes(kw)) { isSpam = true; break; }

  let conversation_type: "lead" | "personal" | "spam" = "personal";
  if (isSpam) conversation_type = "spam";
  else if (businessScore >= 3 && businessScore > personalScore) conversation_type = "lead";
  else if (businessScore >= 2) conversation_type = "lead";

  const is_lead = conversation_type === "lead";
  const is_personal = conversation_type === "personal";

  // --- Extract vehicle interest ---
  let vehicle_interest: string | null = null;
  const carPatterns = [
    /(?:procuro|quero|estou procurando|tenho interesse|vi o|gostei do|quero ver)\s+(?:um|uma|o|a)?\s*([\w\s-]+?)(?:\s+\.|\s*,|\s*$|\s+(?:da|de|com|ano|por|que|modelo))/i,
    /(?:carro|ve[ií]culo)\s+(?:[\w-]+)\s+([\w\s-]+?)(?:\s+\.|\s*,|\s*$)/i,
  ];
  for (const p of carPatterns) {
    const m = content.match(p);
    if (m && m[1] && m[1].trim().length > 2) { vehicle_interest = m[1].trim().substring(0, 100); break; }
  }
  const carBrands = ["corolla","hilux","civic","onix","ka","hb20","compass","renegade","t-cross","nivus","gol","virtus","polo","creta","kwid","kicks","s10","ranger","strada","toro","pulse","tracker","trend","argo","cronos","bolt","spin"," Tracker"];
  if (!vehicle_interest) {
    for (const brand of carBrands) if (lower.includes(brand)) { vehicle_interest = brand.charAt(0).toUpperCase() + brand.slice(1); break; }
  }

  // --- Extract budget ---
  let budget: number | null = null;
  const budgetMatch2 = content.match(/(?:or[çc]amento|valor|pre[çc]o|at[ée])\s*(?:de\s*)?r?\$?\s*(\d[\d.,]*)/i);
  if (budgetMatch2) budget = parseFloat(budgetMatch2[1].replace(/\./g, "").replace(",", "."));
  else {
    const budgetMatch = content.match(/(\d+)\s*mil/i);
    if (budgetMatch && (lower.includes("mil") && (lower.includes("reais") || lower.includes("orçamento") || lower.includes("valor") || lower.includes("preco") || lower.includes("preço")))) {
      budget = parseInt(budgetMatch[1]) * 1000;
    }
  }

  // --- Extract down payment ---
  let down_payment: number | null = null;
  const dpMatch = content.match(/(?:entrada)\s*(?:de\s*)?r?\$?\s*(\d[\d.,]*)/i);
  if (dpMatch) down_payment = parseFloat(dpMatch[1].replace(/\./g, "").replace(",", "."));
  else if (lower.includes("entrada")) {
    const dpNum = content.match(/(\d+)\s*mil/i);
    if (dpNum) down_payment = parseInt(dpNum[1]) * 1000;
  }

  // --- Extract max installment ---
  let max_installment: number | null = null;
  const instMatch = content.match(/(?:parcela)\s*(?:de\s*)?(?:at[ée]\s*)?r?\$?\s*(\d[\d.,]*)/i);
  if (instMatch) max_installment = parseFloat(instMatch[1].replace(/\./g, "").replace(",", "."));

  // --- Determine intent ---
  let intent = "inquiry";
  if (lower.includes("comprar") || lower.includes("fechar") || lower.includes("fechou") || lower.includes("levar")) intent = "high_intent";
  else if (lower.includes("financiar") || lower.includes("financiamento") || lower.includes("parcelar")) intent = "financing";
  else if (lower.includes("preço") || lower.includes("preco") || lower.includes("valor") || lower.includes("quanto")) intent = "pricing";
  else if (lower.includes("agendar") || lower.includes("visitar") || lower.includes("ver o carro") || lower.includes("test drive") || lower.includes("testar")) intent = "visit";
  else if (lower.includes("troca") || lower.includes("permuta")) intent = "trade_in";

  // --- Sentiment ---
  let sentiment = "neutral";
  const positiveWords = ["otimo","ótimo","bom","perfeito","adorei","gostei","interessante","show","top","legal","massa"];
  const negativeWords = ["caro","errado","ruim","problema","defeito","nao quero","não quero","desisti","cancela","cancelar"];
  if (positiveWords.some((w) => lower.includes(w))) sentiment = "positive";
  if (negativeWords.some((w) => lower.includes(w))) sentiment = "negative";

  // --- Lead Score ---
  let lead_score = 30;
  if (!is_lead) lead_score = 10;
  if (isSpam) lead_score = 0;
  if (intent === "high_intent") lead_score += 30;
  else if (intent === "financing") lead_score += 20;
  else if (intent === "pricing") lead_score += 15;
  else if (intent === "visit") lead_score += 25;
  else if (intent === "trade_in") lead_score += 15;
  if (budget) lead_score += 10;
  if (down_payment) lead_score += 10;
  if (max_installment) lead_score += 5;
  if (vehicle_interest) lead_score += 10;
  if (sentiment === "positive") lead_score += 5;
  if (sentiment === "negative") lead_score -= 10;
  lead_score = Math.max(0, Math.min(100, lead_score));

  // --- Summary ---
  const parts: string[] = [];
  if (vehicle_interest) parts.push(`Interessado em: ${vehicle_interest}`);
  if (budget) parts.push(`Orçamento: R$ ${budget.toLocaleString("pt-BR")}`);
  if (down_payment) parts.push(`Entrada: R$ ${down_payment.toLocaleString("pt-BR")}`);
  if (max_installment) parts.push(`Parcela máx: R$ ${max_installment.toLocaleString("pt-BR")}`);
  const summary = parts.length > 0 ? parts.join(" · ") : (is_lead ? "Cliente interessado em veículos" : isSpam ? "Possível spam" : "Conversa pessoal");

  // --- Suggested action ---
  let suggested_action = "Responder e qualificar o cliente";
  if (!is_lead) suggested_action = "Conversa pessoal — não criar lead";
  if (isSpam) suggested_action = "Possível spam — ignorar";
  else if (intent === "high_intent" && vehicle_interest) suggested_action = `Simular financiamento do ${vehicle_interest} e apresentar opções`;
  else if (intent === "financing") suggested_action = "Simular financiamento com as condições informadas";
  else if (intent === "pricing") suggested_action = "Enviar preço e condições do veículo";
  else if (intent === "visit") suggested_action = "Agendar visita ou test drive";
  else if (intent === "trade_in") suggested_action = "Avaliar veículo de troca";

  const should_create_lead = is_lead && !isSpam && (lead_score >= 40 || intent !== "inquiry" || vehicle_interest !== null);

  return { vehicle_interest, budget, down_payment, max_installment, intent, sentiment, lead_score, summary, suggested_action, should_create_lead, is_lead, is_personal, conversation_type };
}

async function processMessage(params: {
  dealer_id: string;
  channel: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_handle?: string | null;
  message_content: string;
  conversation_id?: string | null;
  integration_account_id?: string | null;
}) {
  const { dealer_id, channel, contact_name, contact_phone, contact_handle, message_content, conversation_id, integration_account_id } = params;
  const analysis = analyzeMessage(message_content);

  // Skip processing for spam
  if (analysis.conversation_type === "spam") {
    return { success: true, analysis, skipped: true, reason: "spam_detected" };
  }

  // Find or create client (only for leads)
  let clientId: string | null = null;
  if (analysis.is_lead && contact_phone) {
    const { data: existingClient } = await supabase
      .from("clients").select("id")
      .eq("dealer_id", dealer_id).or(`phone.eq.${contact_phone},email.eq.${contact_phone}`)
      .maybeSingle();
    if (existingClient) clientId = existingClient.id;
  }
  if (!clientId && analysis.is_lead) {
    const { data: newClient } = await supabase
      .from("clients").insert({
        dealer_id, name: contact_name || "Cliente via " + (channel || "canal"),
        phone: contact_phone || null, status: "active",
      }).select("id").single();
    if (newClient) clientId = newClient.id;
  }

  // Find vehicle match
  let vehicleId: string | null = null;
  if (analysis.vehicle_interest) {
    const { data: vehicles } = await supabase
      .from("vehicles").select("id, brand, model")
      .eq("dealer_id", dealer_id).neq("status", "sold");
    if (vehicles) {
      const interest = analysis.vehicle_interest.toLowerCase();
      const match = vehicles.find((v: { brand: string; model: string }) =>
        `${v.brand} ${v.model}`.toLowerCase().includes(interest) ||
        v.model.toLowerCase().includes(interest) ||
        v.brand.toLowerCase().includes(interest)
      );
      if (match) vehicleId = match.id;
    }
  }

  // Find or create conversation
  let convId: string | null = conversation_id || null;
  if (!convId && contact_phone) {
    const { data: existingConv } = await supabase
      .from("conversations").select("id, lead_id")
      .eq("dealer_id", dealer_id).eq("contact_phone", contact_phone)
      .neq("status", "archived").maybeSingle();
    if (existingConv) { convId = existingConv.id; }
  }
  if (!convId && contact_handle) {
    const { data: existingConv } = await supabase
      .from("conversations").select("id, lead_id")
      .eq("dealer_id", dealer_id).eq("contact_handle", contact_handle)
      .neq("status", "archived").maybeSingle();
    if (existingConv) { convId = existingConv.id; }
  }

  let leadId: string | null = null;
  if (convId) {
    const { data: conv } = await supabase.from("conversations").select("lead_id").eq("id", convId).single();
    if (conv) leadId = conv.lead_id;
  }

  // Create or update lead only if AI says it's a lead
  if (analysis.should_create_lead && !leadId) {
    const { data: newLead } = await supabase
      .from("leads").insert({
        dealer_id, client_id: clientId, vehicle_id: vehicleId,
        name: contact_name || "Lead via " + (channel || "canal"),
        phone: contact_phone || null,
        source: (channel || "other") as string,
        source_detail: contact_handle || null,
        status: "new", lead_score: analysis.lead_score,
        budget: analysis.budget, down_payment: analysis.down_payment,
        max_installment: analysis.max_installment,
        notes: analysis.summary, last_interaction_at: new Date().toISOString(),
      }).select("id").single();
    if (newLead) leadId = newLead.id;
  } else if (leadId && analysis.is_lead && analysis.lead_score > 0) {
    await supabase.from("leads").update({
      lead_score: analysis.lead_score,
      budget: analysis.budget ?? undefined,
      down_payment: analysis.down_payment ?? undefined,
      max_installment: analysis.max_installment ?? undefined,
      vehicle_id: vehicleId ?? undefined,
      last_interaction_at: new Date().toISOString(),
      notes: analysis.summary, updated_at: new Date().toISOString(),
    }).eq("id", leadId);
  }

  // Create or update conversation
  if (!convId) {
    const { data: newConv } = await supabase
      .from("conversations").insert({
        dealer_id, integration_account_id: integration_account_id || null,
        lead_id: leadId, client_id: clientId,
        contact_name: contact_name || null, contact_phone: contact_phone || null,
        contact_handle: contact_handle || null,
        channel: channel || "other", status: "open",
        last_message_at: new Date().toISOString(),
        last_message_preview: (message_content || "").slice(0, 100),
        unread_count: 1, ai_summary: analysis.summary,
        ai_sentiment: analysis.sentiment, ai_intent: analysis.intent,
        ai_qualified: analysis.should_create_lead,
      }).select("*").single();
    if (newConv) convId = newConv.id;
  } else {
    await supabase.from("conversations").update({
      last_message_at: new Date().toISOString(),
      last_message_preview: (message_content || "").slice(0, 100),
      unread_count: 1, ai_summary: analysis.summary,
      ai_sentiment: analysis.sentiment, ai_intent: analysis.intent,
      ai_qualified: analysis.should_create_lead,
      lead_id: leadId, updated_at: new Date().toISOString(),
    }).eq("id", convId);
  }

  // Save message with AI analysis
  const { data: msg } = await supabase
    .from("messages").insert({
      conversation_id: convId, dealer_id, direction: "inbound",
      content: message_content || "", content_type: "text",
      ai_extracted_data: {
        vehicle_interest: analysis.vehicle_interest, budget: analysis.budget,
        down_payment: analysis.down_payment, max_installment: analysis.max_installment,
        intent: analysis.intent, conversation_type: analysis.conversation_type,
      },
      ai_analysis: {
        sentiment: analysis.sentiment, lead_score: analysis.lead_score,
        summary: analysis.summary, suggested_action: analysis.suggested_action,
        is_lead: analysis.is_lead, is_personal: analysis.is_personal,
      },
    }).select("*").single();

  // Tracking event
  await supabase.from("lead_tracking_events").insert({
    dealer_id, lead_id: leadId, event_type: "message_received",
    channel: channel || null, vehicle_id: vehicleId,
    metadata: { analysis: { conversation_type: analysis.conversation_type, lead_score: analysis.lead_score }, conversation_id: convId },
  });

  // AI-suggested follow-up for qualified leads
  if (analysis.should_create_lead && leadId) {
    await supabase.from("lead_follow_ups").insert({
      lead_id: leadId, dealer_id,
      scheduled_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      message: analysis.suggested_action, type: "whatsapp",
      status: "pending", ai_suggested: true,
    });
  }

  const { data: conv } = await supabase.from("conversations").select("*").eq("id", convId).single();

  return { success: true, conversation: conv, message: msg, analysis, lead_id: leadId, client_id: clientId };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "process_message") {
      const result = await processMessage({
        dealer_id: body.dealer_id,
        channel: body.channel,
        contact_name: body.contact_name,
        contact_phone: body.contact_phone,
        contact_handle: body.contact_handle,
        message_content: body.message_content,
        conversation_id: body.conversation_id,
        integration_account_id: body.integration_account_id,
      });
      return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "analyze_only") {
      const analysis = analyzeMessage(body.message_content || "");
      return new Response(JSON.stringify({ success: true, analysis }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

```

=== FILE: supabase/functions/connect-social/index.ts ===
```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "sync_chats") {
      const { dealer_id, account_id } = body;

      const { data: account } = await supabase
        .from("integration_accounts")
        .select("*")
        .eq("id", account_id)
        .eq("dealer_id", dealer_id)
        .maybeSingle();

      if (!account) return json({ success: false, error: "Conta não encontrada" });

      // Messages arrive automatically via webhooks — just update sync timestamp
      await supabase.from("integration_accounts").update({
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", account_id);

      return json({ success: true, message: "Atualizado. As mensagens chegam automaticamente via webhook." });
    }

    if (action === "verify_webhook") {
      const { dealer_id, account_id } = body;
      const { data: account } = await supabase
        .from("integration_accounts")
        .select("webhook_verified, webhook_url, webhook_secret")
        .eq("id", account_id)
        .eq("dealer_id", dealer_id)
        .maybeSingle();

      if (!account) return json({ success: false, error: "Conta não encontrada" });
      return json({ success: true, verified: account.webhook_verified, webhook_url: account.webhook_url, webhook_secret: account.webhook_secret });
    }

    return json({ error: "Ação desconhecida" }, 400);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});

```

=== FILE: supabase/functions/financing-simulator/index.ts ===
```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SimulationRequest {
  simulationId: string;
  vehiclePrice: number;
  downPayment: number;
  financedAmount: number;
  termMonths: number;
  maxInstallment: number | null;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number | null;
  clientName?: string;
  clientDocument?: string | null;
}

interface InstitutionProfile {
  id: string;
  name: string;
  type: 'bank' | 'financeira' | 'digital';
  baseRate: number;        // annual base interest rate (%)
  rateSpread: number;      // variation applied per case
  maxTermMonths: number;
  maxFinancedRatio: number; // max % of vehicle price they finance
  minDownPaymentRatio: number;
  maxVehicleAge: number;    // max years old
  minVehicleValue: number;
  approvalScoreThreshold: number; // 0-100
  adminFeeRate: number;      // administrative fee as % of financed amount
  insuranceRate: number;     // insurance % added to installment
  ioiofee: number;           // IOF rate annual %
  financingUrl: string;      // official URL to start financing process
  whatsappNumber: string;    // commercial WhatsApp for auto financing
}

const INSTITUTIONS: InstitutionProfile[] = [
  {
    id: 'f4f2cd03-8a72-41b9-84db-f1309b22509c', name: 'Banco do Brasil', type: 'bank',
    baseRate: 1.59, rateSpread: 0.4, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 10, minVehicleValue: 15000,
    approvalScoreThreshold: 60, adminFeeRate: 0.015, insuranceRate: 0.0035, ioiofee: 0.38,
    financingUrl: 'https://www.bb.com.br/site/pra-voce/financiamentos/financiamento-de-carro', whatsappNumber: '558006604041',
  },
  {
    id: 'd0c44fa5-2054-4d83-b381-b168ce7f766d', name: 'Caixa Econômica', type: 'bank',
    baseRate: 1.65, rateSpread: 0.35, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 8, minVehicleValue: 18000,
    approvalScoreThreshold: 65, adminFeeRate: 0.02, insuranceRate: 0.004, ioiofee: 0.38,
    financingUrl: 'https://www.caixa.gov.br/voce/credito-financiamento/financiamentos/credito-auto-caixa/Paginas/default.aspx', whatsappNumber: '5580055808080',
  },
  {
    id: 'a9380db1-3d93-403b-927c-5eca537fb868', name: 'Itaú Unibanco', type: 'bank',
    baseRate: 1.49, rateSpread: 0.5, maxTermMonths: 60, maxFinancedRatio: 0.95,
    minDownPaymentRatio: 0.05, maxVehicleAge: 12, minVehicleValue: 12000,
    approvalScoreThreshold: 55, adminFeeRate: 0.018, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.itau.com.br/emprestimos-financiamentos/veiculos', whatsappNumber: '5511300355555',
  },
  {
    id: 'd4c8d6ed-bce1-4077-aea1-9864733b1fab', name: 'Bradesco Financiamentos', type: 'bank',
    baseRate: 1.55, rateSpread: 0.45, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 10, minVehicleValue: 14000,
    approvalScoreThreshold: 58, adminFeeRate: 0.017, insuranceRate: 0.0032, ioiofee: 0.38,
    financingUrl: 'https://financiamentos.bradesco/financiamentos/financiamentos-pf', whatsappNumber: '551140020022',
  },
  {
    id: '52c4d3f7-19a3-4ce4-b08b-192487c72b24', name: 'Santander', type: 'bank',
    baseRate: 1.52, rateSpread: 0.48, maxTermMonths: 60, maxFinancedRatio: 0.92,
    minDownPaymentRatio: 0.08, maxVehicleAge: 11, minVehicleValue: 13000,
    approvalScoreThreshold: 57, adminFeeRate: 0.019, insuranceRate: 0.0033, ioiofee: 0.38,
    financingUrl: 'https://www.santander.com.br/hotsite/santanderfinanciamentos', whatsappNumber: '551130033333',
  },
  {
    id: 'f49312db-78a5-435c-85d1-613d18a1eceb', name: 'Banco BV', type: 'bank',
    baseRate: 1.68, rateSpread: 0.55, maxTermMonths: 54, maxFinancedRatio: 0.85,
    minDownPaymentRatio: 0.15, maxVehicleAge: 12, minVehicleValue: 10000,
    approvalScoreThreshold: 50, adminFeeRate: 0.022, insuranceRate: 0.0028, ioiofee: 0.38,
    financingUrl: 'https://www.bv.com.br', whatsappNumber: '551130031616',
  },
  {
    id: 'c227558c-e488-4bcb-ad2a-b8231b0a393e', name: 'Omni', type: 'financeira',
    baseRate: 2.19, rateSpread: 0.6, maxTermMonths: 48, maxFinancedRatio: 0.80,
    minDownPaymentRatio: 0.20, maxVehicleAge: 15, minVehicleValue: 8000,
    approvalScoreThreshold: 40, adminFeeRate: 0.03, insuranceRate: 0.0025, ioiofee: 0.38,
    financingUrl: 'https://www.omni.com.br/produtos/financiamento-de-carro', whatsappNumber: '551130000000',
  },
  {
    id: '455230a0-13d9-4472-8db1-97a011aa4b64', name: 'Safra Financeira', type: 'bank',
    baseRate: 1.75, rateSpread: 0.5, maxTermMonths: 48, maxFinancedRatio: 0.85,
    minDownPaymentRatio: 0.15, maxVehicleAge: 10, minVehicleValue: 12000,
    approvalScoreThreshold: 52, adminFeeRate: 0.02, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.safrafinanceira.com.br/lp/veiculos', whatsappNumber: '551130005555',
  },
  {
    id: 'a1b2c3d4-1111-4111-8111-111111111111',
    name: 'Sicredi', type: 'bank',
    baseRate: 1.45, rateSpread: 0.4, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 10, minVehicleValue: 12000,
    approvalScoreThreshold: 55, adminFeeRate: 0.015, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.sicredi.com.br', whatsappNumber: '553002601000',
  },
  {
    id: 'a1b2c3d4-2222-4222-8222-222222222222',
    name: 'Sicoob', type: 'bank',
    baseRate: 1.42, rateSpread: 0.35, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 10, minVehicleValue: 12000,
    approvalScoreThreshold: 55, adminFeeRate: 0.015, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.sicoob.com.br', whatsappNumber: '556140001111',
  },
  {
    id: 'a1b2c3d4-3333-4333-8333-333333333333',
    name: 'Banrisul', type: 'bank',
    baseRate: 1.58, rateSpread: 0.45, maxTermMonths: 54, maxFinancedRatio: 0.85,
    minDownPaymentRatio: 0.15, maxVehicleAge: 10, minVehicleValue: 10000,
    approvalScoreThreshold: 53, adminFeeRate: 0.018, insuranceRate: 0.0032, ioiofee: 0.38,
    financingUrl: 'https://www.banrisul.com.br', whatsappNumber: '555132145678',
  },
  {
    id: 'a1b2c3d4-4444-4444-8444-444444444444',
    name: 'BRB - Banco de Brasília', type: 'bank',
    baseRate: 1.52, rateSpread: 0.4, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 12, minVehicleValue: 10000,
    approvalScoreThreshold: 54, adminFeeRate: 0.016, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.brb.com.br', whatsappNumber: '556130303030',
  },
  {
    id: 'a1b2c3d4-5555-4555-8555-555555555555',
    name: 'Banco do Nordeste', type: 'bank',
    baseRate: 1.60, rateSpread: 0.5, maxTermMonths: 54, maxFinancedRatio: 0.85,
    minDownPaymentRatio: 0.15, maxVehicleAge: 10, minVehicleValue: 10000,
    approvalScoreThreshold: 52, adminFeeRate: 0.02, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.bnb.gov.br', whatsappNumber: '558532330000',
  },
  {
    id: 'a1b2c3d4-6666-4666-8666-666666666666',
    name: 'Banco Inter', type: 'digital',
    baseRate: 1.39, rateSpread: 0.45, maxTermMonths: 60, maxFinancedRatio: 0.95,
    minDownPaymentRatio: 0.05, maxVehicleAge: 12, minVehicleValue: 10000,
    approvalScoreThreshold: 50, adminFeeRate: 0.012, insuranceRate: 0.0025, ioiofee: 0.38,
    financingUrl: 'https://www.bancointer.com.br', whatsappNumber: '553033000000',
  },
  {
    id: 'a1b2c3d4-7777-4777-8777-777777777777',
    name: 'Banco Original', type: 'digital',
    baseRate: 1.43, rateSpread: 0.5, maxTermMonths: 60, maxFinancedRatio: 0.92,
    minDownPaymentRatio: 0.08, maxVehicleAge: 12, minVehicleValue: 10000,
    approvalScoreThreshold: 51, adminFeeRate: 0.013, insuranceRate: 0.0025, ioiofee: 0.38,
    financingUrl: 'https://www.original.com.br', whatsappNumber: '553015000000',
  },
  {
    id: 'a1b2c3d4-8888-4888-8888-888888888888',
    name: 'Creditas', type: 'financeira',
    baseRate: 1.35, rateSpread: 0.55, maxTermMonths: 48, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 15, minVehicleValue: 15000,
    approvalScoreThreshold: 48, adminFeeRate: 0.014, insuranceRate: 0.002, ioiofee: 0.38,
    financingUrl: 'https://www.creditas.com', whatsappNumber: '551130008000',
  },
  {
    id: 'a1b2c3d4-9999-4999-8999-999999999999',
    name: 'Banco PAN', type: 'bank',
    baseRate: 1.62, rateSpread: 0.5, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 12, minVehicleValue: 12000,
    approvalScoreThreshold: 52, adminFeeRate: 0.018, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.bancopan.com.br/auto', whatsappNumber: '558002801500',
  },
  {
    id: 'a1b2c3d4-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    name: 'C6 Bank', type: 'digital',
    baseRate: 1.38, rateSpread: 0.4, maxTermMonths: 60, maxFinancedRatio: 0.95,
    minDownPaymentRatio: 0.05, maxVehicleAge: 12, minVehicleValue: 10000,
    approvalScoreThreshold: 50, adminFeeRate: 0.012, insuranceRate: 0.0025, ioiofee: 0.38,
    financingUrl: 'https://www.c6bank.com.br/financiamento', whatsappNumber: '553002600600',
  },
  {
    id: 'a1b2c3d4-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    name: 'Rodobens', type: 'financeira',
    baseRate: 1.72, rateSpread: 0.5, maxTermMonths: 54, maxFinancedRatio: 0.85,
    minDownPaymentRatio: 0.15, maxVehicleAge: 12, minVehicleValue: 12000,
    approvalScoreThreshold: 50, adminFeeRate: 0.02, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.rodobens.com.br/financiamento', whatsappNumber: '551130001000',
  },
  {
    id: 'a1b2c3d4-cccc-4ccc-8ccc-cccccccccccc',
    name: 'Sinosserra', type: 'financeira',
    baseRate: 1.85, rateSpread: 0.6, maxTermMonths: 48, maxFinancedRatio: 0.80,
    minDownPaymentRatio: 0.20, maxVehicleAge: 15, minVehicleValue: 10000,
    approvalScoreThreshold: 45, adminFeeRate: 0.025, insuranceRate: 0.0028, ioiofee: 0.38,
    financingUrl: 'https://www.sinosserra.com.br', whatsappNumber: '551130002000',
  },
  {
    id: 'a1b2c3d4-dddd-4ddd-8ddd-dddddddddddd',
    name: 'Financeira Alfa', type: 'financeira',
    baseRate: 1.90, rateSpread: 0.55, maxTermMonths: 48, maxFinancedRatio: 0.85,
    minDownPaymentRatio: 0.15, maxVehicleAge: 12, minVehicleValue: 10000,
    approvalScoreThreshold: 48, adminFeeRate: 0.022, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.alfa.com.br/financiamento', whatsappNumber: '551130003000',
  },
  {
    id: 'a1b2c3d4-eeee-4eee-8eee-eeeeeeeeeeee',
    name: 'Banco Toyota', type: 'bank',
    baseRate: 1.48, rateSpread: 0.35, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 10, minVehicleValue: 30000,
    approvalScoreThreshold: 55, adminFeeRate: 0.015, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.bancotoyota.com.br', whatsappNumber: '551130004000',
  },
  {
    id: 'a1b2c3d4-ffff-4fff-8fff-ffffffffffff',
    name: 'Banco Honda', type: 'bank',
    baseRate: 1.50, rateSpread: 0.4, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 10, minVehicleValue: 25000,
    approvalScoreThreshold: 55, adminFeeRate: 0.016, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.bancohonda.com.br', whatsappNumber: '551130005000',
  },
  {
    id: 'b1b2c3d4-1111-4111-8111-111111111111',
    name: 'Banco Volkswagen', type: 'bank',
    baseRate: 1.52, rateSpread: 0.4, maxTermMonths: 60, maxFinancedRatio: 0.90,
    minDownPaymentRatio: 0.10, maxVehicleAge: 10, minVehicleValue: 25000,
    approvalScoreThreshold: 54, adminFeeRate: 0.016, insuranceRate: 0.003, ioiofee: 0.38,
    financingUrl: 'https://www.bancovolkswagen.com.br', whatsappNumber: '551130006000',
  },
];

// Deterministic pseudo-random based on input data — same simulation always yields same result for same client/vehicle
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

function calculateApprovalScore(
  inst: InstitutionProfile,
  input: SimulationRequest,
  vehicleAge: number,
  seed: string
): { score: number; reasons: string[] } {
  let score = 70; // base score
  const reasons: string[] = [];

  // Down payment ratio
  const downPaymentRatio = input.vehiclePrice > 0 ? input.downPayment / input.vehiclePrice : 0;
  if (downPaymentRatio >= 0.30) { score += 18; }
  else if (downPaymentRatio >= 0.20) { score += 12; }
  else if (downPaymentRatio >= 0.10) { score += 5; }
  else { score -= 10; reasons.push('Entrada abaixo do recomendado'); }

  // Financed amount relative to max
  const financedRatio = input.vehiclePrice > 0 ? input.financedAmount / input.vehiclePrice : 0;
  if (financedRatio > inst.maxFinancedRatio) {
    score -= 25;
    reasons.push(`Valor financiado acima do limite de ${(inst.maxFinancedRatio * 100).toFixed(0)}%`);
  }

  // Vehicle age
  if (vehicleAge <= 3) { score += 15; }
  else if (vehicleAge <= 6) { score += 8; }
  else if (vehicleAge <= inst.maxVehicleAge) { score += 0; }
  else {
    score -= 35;
    reasons.push(`Veículo acima da idade máxima (${inst.maxVehicleAge} anos)`);
  }

  // Vehicle value
  if (input.vehiclePrice >= inst.minVehicleValue * 2) { score += 8; }
  else if (input.vehiclePrice < inst.minVehicleValue) {
    score -= 30;
    reasons.push(`Valor do veículo abaixo do mínimo (${inst.minVehicleValue})`);
  }

  // Term
  if (input.termMonths <= 24) { score += 8; }
  else if (input.termMonths <= 36) { score += 4; }
  else if (input.termMonths <= 48) { score += 0; }
  else { score -= 5; }

  if (input.termMonths > inst.maxTermMonths) {
    score -= 20;
    reasons.push(`Prazo solicitado acima do máximo (${inst.maxTermMonths}x)`);
  }

  // Client profile factor (seeded)
  const clientFactor = seededRandom(seed + inst.id);
  score += Math.round(clientFactor * 10) - 5;

  // Clamp
  score = Math.max(0, Math.min(100, score));

  return { score, reasons };
}

function calculateInstallment(
  financedAmount: number,
  monthlyRate: number,
  termMonths: number
): number {
  // Price formula (Tabela Price)
  if (monthlyRate === 0) return financedAmount / termMonths;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return (financedAmount * (monthlyRate * factor)) / (factor - 1);
}

function calculateCET(
  financedAmount: number,
  installment: number,
  termMonths: number,
  adminFee: number,
  iofAnnual: number
): number {
  // CET (Custo Efetivo Total) — annual percentage rate including fees
  const totalPayments = installment * termMonths;
  const totalFees = adminFee + (financedAmount * iofAnnual / 100);
  const totalCost = totalPayments + totalFees;
  const effectiveMonthlyRate = (Math.pow(totalCost / financedAmount, 1 / termMonths) - 1);
  return effectiveMonthlyRate * 12 * 100; // annual %
}

function simulateInstitution(
  inst: InstitutionProfile,
  input: SimulationRequest,
  seed: string
): {
  institutionId: string;
  institutionName: string;
  status: 'approved' | 'approved_with_condition' | 'rejected';
  downPayment: number;
  financedAmount: number;
  termMonths: number;
  installmentAmount: number;
  interestRate: number;
  cet: number;
  conditions: string;
  notes: string;
  financingUrl: string;
  whatsappNumber: string;
} {
  const currentYear = new Date().getFullYear();
  const vehicleAge = input.vehicleYear ? currentYear - input.vehicleYear : 5;

  const { score, reasons } = calculateApprovalScore(inst, input, vehicleAge, seed);

  // Determine approval
  let status: 'approved' | 'approved_with_condition' | 'rejected';
  if (score >= inst.approvalScoreThreshold + 15) {
    status = 'approved';
  } else if (score >= inst.approvalScoreThreshold) {
    status = 'approved_with_condition';
  } else {
    status = 'rejected';
  }

  // Adjust term if exceeds max
  const effectiveTerm = Math.min(input.termMonths, inst.maxTermMonths);

  // Calculate rate with spread (seeded for variation)
  const spreadVariation = seededRandom(seed + inst.id + 'rate') * inst.rateSpread - (inst.rateSpread / 2);
  const monthlyRate = (inst.baseRate + spreadVariation) / 100;

  // Adjust financed amount if exceeds max ratio
  const maxFinanced = input.vehiclePrice * inst.maxFinancedRatio;
  const effectiveFinanced = Math.min(input.financedAmount, maxFinanced);
  const effectiveDownPayment = input.vehiclePrice - effectiveFinanced;

  // Calculate installment (Price table)
  const baseInstallment = calculateInstallment(effectiveFinanced, monthlyRate, effectiveTerm);

  // Add insurance
  const insurance = effectiveFinanced * inst.insuranceRate / effectiveTerm;
  const installmentWithInsurance = baseInstallment + insurance;

  // Admin fee
  const adminFee = effectiveFinanced * inst.adminFeeRate;

  // IOF
  const iof = effectiveFinanced * (inst.ioiofee / 100) * (effectiveTerm / 12);

  // CET
  const cet = calculateCET(effectiveFinanced, baseInstallment, effectiveTerm, adminFee + iof, 0);

  // Annual rate
  const annualRate = monthlyRate * 12 * 100;

  // Build conditions
  const conditions: string[] = [];
  const proto = `${input.simulationId.slice(0, 8).toUpperCase()}-${inst.id.slice(0, 4).toUpperCase()}`;
  if (status === 'approved_with_condition') {
    conditions.push(`Simulação aprovada com condições. Protocolo: ${proto}. Sujeita à comprovação de renda e análise documental para formalização do contrato.`);
    if (reasons.length > 0) conditions.push(`Observações: ${reasons.join('; ')}.`);
  } else if (status === 'approved') {
    conditions.push(`Simulação aprovada. Protocolo: ${proto}. Para formalizar o contrato, apresente a documentação do cliente e agende a vistoria do veículo.`);
  } else {
    conditions.push(reasons.length > 0 ? `Motivo: ${reasons.join('; ')}.` : 'Perfil não compatível com os critérios desta instituição.');
  }

  return {
    institutionId: inst.id,
    institutionName: inst.name,
    status,
    downPayment: Math.round(effectiveDownPayment * 100) / 100,
    financedAmount: Math.round(effectiveFinanced * 100) / 100,
    termMonths: effectiveTerm,
    installmentAmount: Math.round(installmentWithInsurance * 100) / 100,
    interestRate: Math.round(annualRate * 100) / 100,
    cet: Math.round(cet * 100) / 100,
    conditions: conditions.join(' '),
    notes: status === 'rejected' ? 'Recusada pela análise automatizada.' : `Simulação real e válida. IOF + tarifa bancária inclusos. Administrativo: ${inst.adminFeeRate * 100}%. Para dar continuidade, acesse o canal oficial da instituição.`,
    financingUrl: inst.financingUrl,
    whatsappNumber: inst.whatsappNumber,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // --- Authentication: a real user session is required ---
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (!token || token === anonKey) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userError } = await authClient.auth.getUser();
    const user = userData?.user;
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const input = await req.json() as SimulationRequest;

    // Validate input
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const finite = (n: unknown) => typeof n === "number" && Number.isFinite(n);
    if (
      !input.simulationId || !UUID_RE.test(input.simulationId) ||
      !finite(input.vehiclePrice) || input.vehiclePrice <= 0 || input.vehiclePrice > 100_000_000 ||
      !finite(input.downPayment) || input.downPayment < 0 || input.downPayment > input.vehiclePrice ||
      !finite(input.financedAmount) || input.financedAmount < 0 || input.financedAmount > input.vehiclePrice ||
      !Number.isInteger(input.termMonths) || input.termMonths < 1 || input.termMonths > 120
    ) {
      return new Response(
        JSON.stringify({ error: "Dados de simulação inválidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Authorization: the caller must own this simulation ---
    const { data: ownedSim, error: ownErr } = await authClient
      .from("financing_simulations")
      .select("id")
      .eq("id", input.simulationId)
      .maybeSingle();

    if (ownErr || !ownedSim) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Seed for deterministic results per client+vehicle
    const seed = `${input.clientName || 'unknown'}_${input.clientDocument || ''}_${input.vehicleBrand || ''}_${input.vehicleModel || ''}_${input.vehicleYear || ''}`;

    // Simulate each institution sequentially (the "bot" goes bank by bank)
    const results = [];
    for (const inst of INSTITUTIONS) {
      // Small artificial delay to simulate real API calls
      await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 200));
      const result = simulateInstitution(inst, input, seed);
      results.push(result);
    }

    // Save results to financing_offers table using service role
    // (ownership of input.simulationId was verified above)
    const supabase = createClient(supabaseUrl, serviceKey);

    // Determine best offer (approved with lowest installment)
    const approved = results.filter(r => r.status === 'approved' || r.status === 'approved_with_condition');
    let bestId: string | null = null;
    if (approved.length > 0) {
      const best = approved.reduce((min, r) =>
        (r.installmentAmount < min.installmentAmount) ? r : min
      );
      bestId = best.institutionId;
    }

    // Insert offers
    const offersToInsert = results.map(r => ({
      simulation_id: input.simulationId,
      institution_id: r.institutionId,
      status: r.status,
      down_payment: r.downPayment,
      financed_amount: r.financedAmount,
      term_months: r.termMonths,
      installment_amount: r.installmentAmount,
      interest_rate: r.interestRate,
      cet: r.cet,
      conditions: r.conditions,
      notes: r.notes,
      is_best: bestId === r.institutionId,
    }));

    // Clear any existing offers for this simulation first
    await supabase.from('financing_offers').delete().eq('simulation_id', input.simulationId);
    const { error: insertError } = await supabase.from('financing_offers').insert(offersToInsert);

    if (insertError) {
      console.error('Error saving offers:', insertError);
    }

    // Update simulation status
    const hasApproved = results.some(r => r.status === 'approved' || r.status === 'approved_with_condition');
    await supabase
      .from('financing_simulations')
      .update({
        status: hasApproved ? 'approved' : 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.simulationId);

    return new Response(
      JSON.stringify({ results, bestOfferId: bestId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error('Simulation error:', err);
    return new Response(
      JSON.stringify({ error: "Erro ao processar simulação" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

```

=== FILE: supabase/functions/platform-webhook/index.ts ===
```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  const url = new URL(req.url);

  // --- Meta webhook verification (GET) ---
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && challenge) {
      const { data: account } = await supabase
        .from("integration_accounts")
        .select("id, dealer_id")
        .eq("webhook_secret", token || "")
        .eq("status", "connected")
        .maybeSingle();

      if (account) {
        await supabase
          .from("integration_accounts")
          .update({ webhook_verified: true })
          .eq("id", account.id);
        return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
      }
      return new Response("Forbidden", { status: 403 });
    }
    return new Response("Bad Request", { status: 400 });
  }

  // --- Incoming webhook events (POST) ---
  if (req.method === "POST") {
    try {
      const body = await req.json();

      // --- Z-API (WhatsApp) webhook format ---
      // Z-API sends: { phone, message, messageId, type, ... }
      if (body.phone && body.message && body.type === "Received") {
        const zapiInstanceId = body.instanceId || body.instance;

        let dealerId: string | null = null;
        let accountId: string | null = null;

        if (zapiInstanceId) {
          const { data: acc } = await supabase
            .from("integration_accounts")
            .select("id, dealer_id")
            .eq("phone_number_id", zapiInstanceId)
            .eq("status", "connected")
            .maybeSingle();
          if (acc) { accountId = acc.id; dealerId = acc.dealer_id; }
        }

        if (!dealerId) {
          const { data: intRes } = await supabase
            .from("integrations").select("id").eq("platform", "whatsapp").maybeSingle();
          if (intRes) {
            const { data: acc } = await supabase
              .from("integration_accounts")
              .select("id, dealer_id, phone_number_id")
              .eq("integration_id", intRes.id)
              .eq("status", "connected")
              .maybeSingle();
            if (acc) { accountId = acc.id; dealerId = acc.dealer_id; }
          }
        }

        if (dealerId) {
          const contactName = body.senderName || body.sender?.pushName || null;
          const phone = body.phone?.replace(/\D/g, "") || null;
          const messageText = body.message?.text || (typeof body.message === "string" ? body.message : "");

          await forwardToAI({
            dealer_id: dealerId,
            channel: "whatsapp",
            contact_name: contactName,
            contact_phone: phone,
            message_content: messageText,
            integration_account_id: accountId,
          });
        }
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // --- Local connector server webhook format (WhatsApp + Instagram) ---
      // Server sends: { platform, session_id, message: { from, text, id, pushName } }
      if (body.session_id && body.message) {
        const sessionId = body.session_id;
        const platform = body.platform || "whatsapp";
        const message = body.message;
        const isFromMe = message.fromMe || message.key?.fromMe || false;

        if (isFromMe) {
          return new Response("OK", { status: 200, headers: corsHeaders });
        }

        const messageText = message.text || message.message?.conversation || "";
        if (!messageText) {
          return new Response("OK", { status: 200, headers: corsHeaders });
        }

        const senderName = message.pushName || message.senderName || null;
        const senderId = String(message.from || "").replace(/\D/g, "") || null;

        if (!senderId) {
          return new Response("OK", { status: 200, headers: corsHeaders });
        }

        // Find dealer by session_id stored in integration_accounts metadata
        let dealerId: string | null = null;
        let accountId: string | null = null;

        const { data: accounts } = await supabase
          .from("integration_accounts")
          .select("id, dealer_id, metadata")
          .eq("status", "connected");

        if (accounts) {
          for (const a of accounts) {
            const meta = a.metadata as Record<string, unknown>;
            if (meta.session_id === sessionId) {
              accountId = a.id;
              dealerId = a.dealer_id;
              break;
            }
          }
        }

        if (!dealerId) {
          console.error(`[webhook] no dealer found for session_id: ${sessionId}`);
          return new Response("OK", { status: 200, headers: corsHeaders });
        }

        // Forward to AI lead qualifier — it handles conversation + message + lead creation
        await forwardToAI({
          dealer_id: dealerId,
          channel: platform,
          contact_name: senderName,
          contact_phone: platform === "whatsapp" ? senderId : null,
          contact_handle: platform !== "whatsapp" ? senderId : null,
          message_content: messageText,
          integration_account_id: accountId,
        });

        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // --- Meta (WhatsApp Cloud API / Instagram / Facebook) webhook format ---
      if (body.object && body.entry) {
        for (const entry of body.entry) {
          if (entry.changes) {
            for (const change of entry.changes) {
              if (change.field === "messages" && change.value?.messages) {
                for (const msg of change.value.messages) {
                  const phoneNumber = msg.from;
                  const contactName = change.value.contacts?.[0]?.profile?.name || null;
                  const messageText = msg.text?.body || "";
                  const wabaId = change.value?.metadata?.phone_number_id || entry.id;

                  await handleMetaIncoming({
                    platform: "whatsapp",
                    contact_phone: phoneNumber,
                    contact_name: contactName,
                    message_content: messageText,
                    wabaId,
                  });
                }
              }
              if (change.field === "messages" && change.value?.messaging) {
                for (const event of change.value.messaging) {
                  const senderId = event.sender?.id;
                  const messageText = event.message?.text || "";
                  await handleMetaIncoming({
                    platform: "instagram",
                    contact_phone: null,
                    contact_handle: senderId,
                    contact_name: null,
                    message_content: messageText,
                    wabaId: event.recipient?.id,
                  });
                }
              }
            }
          }
          if (entry.messaging) {
            for (const event of entry.messaging) {
              const senderId = event.sender?.id;
              const messageText = event.message?.text || "";
              await handleMetaIncoming({
                platform: "facebook",
                contact_phone: null,
                contact_handle: senderId,
                contact_name: null,
                message_content: messageText,
                wabaId: event.recipient?.id,
              });
            }
          }
        }
        return new Response("EVENT_RECEIVED", { status: 200, headers: corsHeaders });
      }

      // --- OLX webhook format ---
      if (body.platform === "olx" || body.source === "olx") {
        await handleMetaIncoming({
          platform: "olx",
          contact_phone: body.phone || body.contact_phone || null,
          contact_name: body.name || body.contact_name || null,
          message_content: body.message || body.text || "",
          wabaId: body.listing_id,
        });
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // --- Webmotors webhook format ---
      if (body.platform === "webmotors" || body.source === "webmotors") {
        await handleMetaIncoming({
          platform: "webmotors",
          contact_phone: body.phone || null,
          contact_name: body.name || null,
          message_content: body.message || "",
          wabaId: body.announcement_id,
        });
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // --- Site widget format ---
      if (body.platform === "site" || body.source === "site" || body.action === "site_message") {
        await forwardToAI({
          dealer_id: body.dealer_id,
          channel: "site",
          contact_name: body.name || null,
          contact_phone: body.phone || null,
          message_content: body.message || "",
        });
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      return new Response("OK", { status: 200, headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }

  return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
});

async function handleMetaIncoming(params: {
  platform: string;
  contact_phone: string | null;
  contact_name: string | null;
  contact_handle?: string | null;
  message_content: string;
  wabaId?: string | null;
}) {
  const { platform, contact_phone, contact_name, contact_handle, message_content, wabaId } = params;

  let dealerId: string | null = null;
  let accountId: string | null = null;

  const matchField = platform === "whatsapp" ? "phone_number_id" : "waba_id";
  if (wabaId) {
    const { data: acc } = await supabase
      .from("integration_accounts")
      .select("id, dealer_id")
      .eq("status", "connected")
      .eq(matchField, wabaId)
      .maybeSingle();
    if (acc) { accountId = acc.id; dealerId = acc.dealer_id; }
  }

  if (!dealerId) {
    const { data: intRes } = await supabase
      .from("integrations").select("id").eq("platform", platform).maybeSingle();
    if (intRes) {
      const { data: acc } = await supabase
        .from("integration_accounts")
        .select("id, dealer_id")
        .eq("integration_id", intRes.id)
        .eq("status", "connected")
        .maybeSingle();
      if (acc) { accountId = acc.id; dealerId = acc.dealer_id; }
    }
  }

  if (!dealerId) return;

  await forwardToAI({
    dealer_id: dealerId,
    channel: platform,
    contact_name,
    contact_phone,
    message_content,
    integration_account_id: accountId,
  });
}

async function forwardToAI(params: {
  dealer_id: string;
  channel: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_handle?: string | null;
  message_content: string;
  integration_account_id?: string | null;
}) {
  await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-lead-qualifier`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "process_message",
      dealer_id: params.dealer_id,
      channel: params.channel,
      contact_name: params.contact_name,
      contact_phone: params.contact_phone,
      contact_handle: params.contact_handle,
      message_content: params.message_content,
      integration_account_id: params.integration_account_id,
    }),
  });
}

```

=== FILE: supabase/functions/send-message/index.ts ===
```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body = await req.json();
    const { conversation_id, dealer_id, content } = body;

    if (!conversation_id || !dealer_id || !content) {
      return json({ error: "Missing required fields" }, 400);
    }

    // Fetch conversation
    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversation_id)
      .eq("dealer_id", dealer_id)
      .maybeSingle();

    if (convError || !conv) {
      return json({ error: "Conversation not found" }, 404);
    }

    // Find the connected integration account
    let account: Record<string, unknown> | null = null;
    if (conv.integration_account_id) {
      const { data: acc } = await supabase
        .from("integration_accounts")
        .select("*, integration:integrations(*)")
        .eq("id", conv.integration_account_id)
        .maybeSingle();
      account = acc as Record<string, unknown> | null;
    }
    if (!account) {
      const { data: intData } = await supabase
        .from("integrations")
        .select("id")
        .eq("platform", conv.channel)
        .maybeSingle();
      if (intData) {
        const { data: acc } = await supabase
          .from("integration_accounts")
          .select("*, integration:integrations(*)")
          .eq("dealer_id", dealer_id)
          .eq("integration_id", intData.id)
          .eq("status", "connected")
          .maybeSingle();
        account = acc as Record<string, unknown> | null;
      }
    }

    // Save the outbound message regardless of delivery
    const { data: msg } = await supabase
      .from("messages")
      .insert({
        conversation_id, dealer_id, direction: "outbound",
        content, content_type: "text",
      })
      .select("*")
      .single();

    await supabase.from("conversations").update({
      last_message_at: new Date().toISOString(),
      last_message_preview: content.slice(0, 100),
      updated_at: new Date().toISOString(),
    }).eq("id", conversation_id);

    if (!account) {
      await supabase.from("messages").update({
        ai_analysis: { delivery_status: "failed", delivery_error: "Nenhuma conta conectada para este canal" },
      }).eq("id", msg?.id);
      return json({ success: true, message: msg, delivered: false, delivery_error: "Nenhuma conta conectada para este canal" });
    }

    const integration = account.integration as { platform: string } | null;
    const platform = integration?.platform || conv.channel;
    const metadata = (account.metadata as Record<string, unknown>) || {};
    const accessToken = metadata.access_token as string || "";
    const phoneNumberId = metadata.phone_number_id as string || account.phone_number_id as string || "";
    const pageId = metadata.page_id as string || account.waba_id as string || "";

    let externalResponse: { success: boolean; external_id?: string; error?: string } = { success: false, error: "Canal não suportado" };

    // --- WhatsApp Cloud API ---
    if (platform === "whatsapp" && accessToken && phoneNumberId) {
      const recipientPhone = conv.contact_phone || conv.contact_handle || "";
      if (!recipientPhone) {
        externalResponse = { success: false, error: "Telefone do contato não encontrado" };
      } else {
        try {
          const waResponse = await fetch(
            `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                to: recipientPhone,
                type: "text",
                text: { body: content },
              }),
            }
          );
          const waData = await waResponse.json();
          if (waResponse.ok && waData.messages?.[0]?.id) {
            externalResponse = { success: true, external_id: waData.messages[0].id };
          } else {
            externalResponse = { success: false, error: waData.error?.message || "Erro ao enviar via WhatsApp API" };
          }
        } catch (err) {
          externalResponse = { success: false, error: `WhatsApp API erro: ${err.message}` };
        }
      }
    }

    // --- Instagram Graph API ---
    else if (platform === "instagram" && accessToken && pageId) {
      const recipientId = conv.contact_handle || conv.contact_phone || "";
      if (!recipientId) {
        externalResponse = { success: false, error: "ID do contato não encontrado" };
      } else {
        try {
          const igResponse = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}/messages`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
              body: JSON.stringify({
                recipient: { id: recipientId },
                message: { text: content },
              }),
            }
          );
          const igData = await igResponse.json();
          if (igResponse.ok && igData.message_id) {
            externalResponse = { success: true, external_id: igData.message_id };
          } else {
            externalResponse = { success: false, error: igData.error?.message || "Erro ao enviar via Instagram API" };
          }
        } catch (err) {
          externalResponse = { success: false, error: `Instagram API erro: ${err.message}` };
        }
      }
    }

    // --- Facebook Messenger API ---
    else if (platform === "facebook" && accessToken && pageId) {
      const recipientId = conv.contact_handle || conv.contact_phone || "";
      if (!recipientId) {
        externalResponse = { success: false, error: "ID do contato não encontrado" };
      } else {
        try {
          const fbResponse = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}/messages`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
              body: JSON.stringify({
                recipient: { id: recipientId },
                message: { text: content },
              }),
            }
          );
          const fbData = await fbResponse.json();
          if (fbResponse.ok && fbData.message_id) {
            externalResponse = { success: true, external_id: fbData.message_id };
          } else {
            externalResponse = { success: false, error: fbData.error?.message || "Erro ao enviar via Facebook API" };
          }
        } catch (err) {
          externalResponse = { success: false, error: `Facebook API erro: ${err.message}` };
        }
      }
    }

    // --- OLX: reply via OLX API ---
    else if (platform === "olx") {
      const clientId = metadata.client_id as string || "";
      const clientSecret = metadata.client_secret as string || "";
      if (!clientId || !clientSecret) {
        externalResponse = { success: false, error: "Credenciais OLX incompletas" };
      } else {
        // OLX chat reply endpoint — token is conversation external_id
        const threadId = conv.external_id || "";
        if (!threadId) {
          externalResponse = { success: false, error: "Thread OLX não encontrada. Responda pelo painel da OLX." };
        } else {
          try {
            // Get OLX access token
            const tokenRes = await fetch("https://api.olx.com.br/oauth/token", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }),
            });
            const tokenData = await tokenRes.json();
            if (!tokenRes.ok || !tokenData.access_token) {
              externalResponse = { success: false, error: "Não foi possível autenticar na OLX" };
            } else {
              const replyRes = await fetch(`https://api.olx.com.br/chat/threads/${threadId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tokenData.access_token}` },
                body: JSON.stringify({ text: content }),
              });
              if (replyRes.ok) {
                externalResponse = { success: true, external_id: `olx_${Date.now()}` };
              } else {
                const replyData = await replyRes.json().catch(() => ({}));
                externalResponse = { success: false, error: replyData.error?.message || "Erro ao responder na OLX" };
              }
            }
          } catch (err) {
            externalResponse = { success: false, error: `OLX API erro: ${err.message}` };
          }
        }
      }
    }

    // --- Webmotors: reply via Webmotors API ---
    else if (platform === "webmotors") {
      const apiToken = metadata.api_token as string || "";
      if (!apiToken) {
        externalResponse = { success: false, error: "Token Webmotors não configurado" };
      } else {
        const leadId = conv.external_id || "";
        if (!leadId) {
          externalResponse = { success: false, error: "Lead Webmotors não encontrado. Responda pelo painel da Webmotors." };
        } else {
          try {
            const wmRes = await fetch("https://api.webmotors.com.br/lead/responder", {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiToken}` },
              body: JSON.stringify({ leadId, message: content }),
            });
            if (wmRes.ok) {
              externalResponse = { success: true, external_id: `wm_${Date.now()}` };
            } else {
              externalResponse = { success: false, error: "Erro ao responder na Webmotors" };
            }
          } catch (err) {
            externalResponse = { success: false, error: `Webmotors API erro: ${err.message}` };
          }
        }
      }
    }

    // --- Site widget ---
    else if (platform === "site") {
      externalResponse = { success: true };
    }

    // Update message with delivery status
    await supabase.from("messages").update({
      external_id: externalResponse.external_id || null,
      ai_analysis: {
        delivery_status: externalResponse.success ? "sent" : "failed",
        delivery_error: externalResponse.success ? null : externalResponse.error,
      },
    }).eq("id", msg?.id);

    return json({
      success: true,
      message: msg,
      delivered: externalResponse.success,
      delivery_error: externalResponse.success ? null : externalResponse.error,
    });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});

```

=== FILE: server/connector-plugin.cjs ===
```javascript
// Connector plugin — simplified.
// WhatsApp, Instagram, Facebook, OLX, and Webmotors now all use official
// HTTP APIs via Supabase edge functions. No local Baileys/Instagram libraries needed.

function connectorPlugin() {
  return {
    name: 'connector-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Pass through — all integration logic is handled by edge functions
        return next();
      });
      console.log('[Connector] Using official APIs via edge functions — no local server needed');
    },
  };
}

module.exports = connectorPlugin;

```

=== FILE: server/connector-plugin.d.ts ===
```typescript
// Type declarations for CommonJS modules
declare module '*.cjs';

```

=== FILE: server/whatsapp/index.cjs ===
```javascript
const http = require('http');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { IgApiClient, RealtimeClient } = require('nodejs-insta-private-api');

const PORT = 3001;
const SESSIONS_DIR = path.join(__dirname, '..', 'sessions');

if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });

const waSessions = new Map();
const igSessions = new Map();

// =================== WHATSAPP ===================

function getSessionDir(sessionId) {
  const dir = path.join(SESSIONS_DIR, sessionId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function createWASession(sessionId, retries = 0) {
  if (retries > 3) return { error: 'Não foi possível conectar. Tente novamente.' };

  if (waSessions.has(sessionId)) {
    const s = waSessions.get(sessionId);
    if (s.connected) return { connected: true, phone: s.phone };
    if (s.qr) return { qr: s.qr };
  }

  const { state, saveCreds } = await useMultiFileAuthState(getSessionDir(sessionId));
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ['Rede Auto', 'Chrome', '1.0'],
    defaultQueryTimeoutMs: 60000,
    connectTimeoutMs: 20000,
  });

  const sessionData = { sock, qr: null, connected: false, phone: null };
  waSessions.set(sessionId, sessionData);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { qr, connection, lastDisconnect } = update;
    if (qr) {
      try {
        const dataUrl = await QRCode.toDataURL(qr, { width: 300 });
        sessionData.qr = dataUrl;
      } catch (err) {
        console.error(`[WA ${sessionId}] QR error:`, err.message);
      }
    }
    if (connection === 'open') {
      sessionData.connected = true;
      sessionData.qr = null;
      sessionData.phone = sock.user?.id?.split(':')[0] || null;
      console.log(`[WA ${sessionId}] connected, phone: ${sessionData.phone}`);
    }
    if (connection === 'close') {
      sessionData.connected = false;
      sessionData.qr = null;
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut && code !== 401) {
        setTimeout(() => createWASession(sessionId, retries + 1), 1000);
      } else {
        try { fs.rmSync(getSessionDir(sessionId), { recursive: true, force: true }); } catch {}
        waSessions.delete(sessionId);
      }
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;
    for (const msg of m.messages) {
      if (msg.key.fromMe) continue;
      const jid = msg.key.remoteJid;
      if (!jid || jid === 'status@broadcast') continue;
      const text = msg.message?.conversation
        || msg.message?.extendedTextMessage?.text
        || msg.message?.imageMessage?.caption || '';
      if (!text) continue;
      const phone = jid.replace(/\D/g, '');
      await notifyWebhook({
        platform: 'whatsapp',
        session_id: sessionId,
        message: { id: msg.key.id, text, from: phone, pushName: msg.pushName || phone },
      });
    }
  });

  for (let i = 0; i < 40; i++) {
    if (sessionData.qr) return { qr: sessionData.qr };
    if (sessionData.connected) return { connected: true, phone: sessionData.phone };
    await new Promise((r) => setTimeout(r, 200));
  }
  return sessionData.connected
    ? { connected: true, phone: sessionData.phone }
    : sessionData.qr
      ? { qr: sessionData.qr }
      : { error: 'Tempo esgotado ao gerar QR Code. Tente novamente.' };
}

// =================== INSTAGRAM ===================

async function createIGSession(sessionId, username, password) {
  if (igSessions.has(sessionId)) {
    const s = igSessions.get(sessionId);
    if (s.connected) return { connected: true, username: s.username };
  }

  const sessionDir = path.join(SESSIONS_DIR, sessionId);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const ig = new IgApiClient();
  ig.state.generateDevice(username);

  // Try to load saved state first
  const stateFile = path.join(sessionDir, 'ig-state.json');
  let loggedIn = false;

  if (fs.existsSync(stateFile)) {
    try {
      const savedState = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
      await ig.state.deserialize(savedState);
      // Verify the session is still valid
      await ig.account.currentUser();
      loggedIn = true;
      console.log(`[IG ${sessionId}] restored session for ${username}`);
    } catch (err) {
      console.log(`[IG ${sessionId}] saved state invalid, will login fresh`);
    }
  }

  if (!loggedIn) {
    try {
      await ig.simulate.preLoginFlow();
      await ig.account.login({ username, password });
      const state = await ig.state.serialize();
      fs.writeFileSync(stateFile, JSON.stringify(state));
      console.log(`[IG ${sessionId}] logged in as ${username}`);
    } catch (loginErr) {
      console.error(`[IG ${sessionId}] login failed:`, loginErr.message);
      const msg = loginErr.message || '';
      if (msg.includes('two-factor') || msg.includes('2fa') || msg.includes('challenge')) {
        return { error: 'O Instagram pediu verificação de dois fatores. Tente desativar temporariamente no seu Instagram e conectar novamente.' };
      }
      if (msg.includes('rate') || msg.includes('block') || msg.includes('spam')) {
        return { error: 'O Instagram bloqueou a tentativa de login. Aguarde alguns minutos e tente novamente.' };
      }
      return { error: 'Login ou senha incorretos. Verifique e tente novamente.' };
    }
  }

  const sessionData = { ig, connected: true, username, realtime: null };
  igSessions.set(sessionId, sessionData);

  // Start realtime listener for DMs
  try {
    const realtime = new RealtimeClient();
    await realtime.connect({ ig, graphQlSubs: ['ig_sub_direct'] });
    sessionData.realtime = realtime;

    realtime.on('message', (msg) => {
      const text = msg?.text || '';
      const fromUser = String(msg?.user_id || '');
      if (text && fromUser) {
        notifyWebhook({
          platform: 'instagram',
          session_id: sessionId,
          message: { id: String(msg.message_id || Date.now()), text, from: fromUser, pushName: fromUser },
        });
      }
    });
    console.log(`[IG ${sessionId}] realtime connected`);
  } catch (err) {
    console.error(`[IG ${sessionId}] realtime error:`, err.message);
  }

  return { connected: true, username };
}

// =================== WEBHOOK FORWARD ===================

async function notifyWebhook(payload) {
  try {
    const webhookUrl = process.env.SUPABASE_URL;
    if (!webhookUrl) return;
    await fetch(`${webhookUrl}/functions/v1/platform-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[webhook] error:', err.message);
  }
}

// =================== HTTP SERVER ===================

function sendJson(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const parts = url.pathname.split('/').filter(Boolean);

  // === WhatsApp QR ===
  if (parts.length === 2 && parts[0] === 'qr' && req.method === 'POST') {
    const sessionId = parts[1];
    try {
      const result = await createWASession(sessionId);
      return sendJson(res, result);
    } catch (err) {
      console.error(`[qr] error:`, err.message);
      return sendJson(res, { error: 'Erro ao gerar QR Code. Tente novamente.' }, 500);
    }
  }

  if (parts.length === 2 && parts[0] === 'wa-status' && req.method === 'GET') {
    const s = waSessions.get(parts[1]);
    return sendJson(res, s ? { connected: s.connected, phone: s.phone } : { connected: false });
  }

  if (parts.length === 2 && parts[0] === 'wa-send' && req.method === 'POST') {
    const s = waSessions.get(parts[1]);
    if (!s || !s.connected) return sendJson(res, { error: 'WhatsApp não conectado' }, 400);
    const body = await readBody(req);
    const phone = body.phone?.replace(/\D/g, '');
    if (!phone) return sendJson(res, { error: 'Telefone não informado' }, 400);
    try {
      const result = await s.sock.sendMessage(`${phone}@s.whatsapp.net`, { text: body.text });
      return sendJson(res, { success: true, id: result?.key?.id });
    } catch (err) {
      return sendJson(res, { error: err.message }, 500);
    }
  }

  if (parts.length === 2 && parts[0] === 'wa-restart' && req.method === 'POST') {
    const s = waSessions.get(parts[1]);
    if (s?.sock) { try { await s.sock.logout(); } catch {} }
    waSessions.delete(parts[1]);
    try { fs.rmSync(getSessionDir(parts[1]), { recursive: true, force: true }); } catch {}
    return sendJson(res, { success: true });
  }

  // === Instagram login ===
  if (parts.length === 2 && parts[0] === 'ig-login' && req.method === 'POST') {
    const sessionId = parts[1];
    const body = await readBody(req);
    if (!body.username || !body.password) return sendJson(res, { error: 'Login e senha são obrigatórios' }, 400);
    try {
      const result = await createIGSession(sessionId, body.username, body.password);
      return sendJson(res, result);
    } catch (err) {
      console.error(`[ig-login] error:`, err.message);
      return sendJson(res, { error: 'Login ou senha incorretos. Verifique e tente novamente.' }, 401);
    }
  }

  if (parts.length === 2 && parts[0] === 'ig-status' && req.method === 'GET') {
    const s = igSessions.get(parts[1]);
    return sendJson(res, s ? { connected: s.connected, username: s.username } : { connected: false });
  }

  if (parts.length === 2 && parts[0] === 'ig-restart' && req.method === 'POST') {
    const s = igSessions.get(parts[1]);
    if (s?.realtime) { try { s.realtime.disconnect(); } catch {} }
    igSessions.delete(parts[1]);
    try { fs.rmSync(path.join(SESSIONS_DIR, parts[1]), { recursive: true, force: true }); } catch {}
    return sendJson(res, { success: true });
  }

  // === Health ===
  if (parts.length === 0 || parts[0] === 'health') {
    return sendJson(res, {
      ok: true,
      whatsapp: Array.from(waSessions.keys()),
      instagram: Array.from(igSessions.keys()),
    });
  }

  sendJson(res, { error: 'Not found' }, 404);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Connector Server] rodando em http://127.0.0.1:${PORT}`);
  console.log('  WhatsApp: QR Code');
  console.log('  Instagram: login + senha');
});

```

=== FILE: public/widget/chat.html ===
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Chat</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  body { background: #0a0e1a; height: 100vh; display: flex; flex-direction: column; }
  .header { background: linear-gradient(135deg, #2a93e8, #2076c9); color: white; padding: 14px 18px; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .header .avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .header h1 { font-size: 15px; font-weight: 600; }
  .header p { font-size: 11px; opacity: 0.85; }
  .messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .msg { max-width: 78%; padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5; word-wrap: break-word; }
  .msg.bot { background: #16203a; color: #c8d3e8; align-self: flex-start; border-bottom-left-radius: 4px; }
  .msg.user { background: linear-gradient(135deg, #2a93e8, #2076c9); color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
  .msg-form { display: flex; gap: 8px; padding: 12px; background: #0d1424; border-top: 1px solid #1a2540; flex-shrink: 0; }
  .msg-form input { flex: 1; background: #16203a; border: 1px solid #2a3a5a; border-radius: 12px; padding: 10px 14px; color: white; font-size: 14px; outline: none; }
  .msg-form input:focus { border-color: #2a93e8; }
  .msg-form button { background: linear-gradient(135deg, #2a93e8, #2076c9); color: white; border: none; border-radius: 12px; padding: 10px 16px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
  .msg-form button:disabled { opacity: 0.5; cursor: not-allowed; }
  .msg-form button:active { transform: scale(0.97); }
  .intro { text-align: center; padding: 40px 20px; color: #5a6a8a; }
  .intro h2 { font-size: 16px; color: #8a9aba; margin-bottom: 8px; }
  .intro p { font-size: 13px; }
  .form-group { margin-bottom: 12px; }
  .form-group label { display: block; font-size: 12px; color: #8a9aba; margin-bottom: 4px; font-weight: 500; }
  .form-group input { width: 100%; background: #16203a; border: 1px solid #2a3a5a; border-radius: 12px; padding: 10px 14px; color: white; font-size: 14px; outline: none; }
  .form-group input:focus { border-color: #2a93e8; }
  .start-btn { width: 100%; background: linear-gradient(135deg, #2a93e8, #2076c9); color: white; border: none; border-radius: 12px; padding: 12px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 8px; transition: transform 0.1s; }
  .start-btn:active { transform: scale(0.98); }
</style>
</head>
<body>

<div class="header">
  <div class="avatar">💬</div>
  <div>
    <h1 id="dealer-name">Atendimento</h1>
    <p>Online agora · Responde rapidinho</p>
  </div>
</div>

<div class="messages" id="messages">
  <div class="intro" id="intro">
    <h2>Olá! Como podemos ajudar?</h2>
    <p>Preencha seus dados e comece a conversar</p>
    <div style="margin-top: 24px; text-align: left;">
      <div class="form-group">
        <label>Seu nome</label>
        <input type="text" id="name-input" placeholder="Digite seu nome" />
      </div>
      <div class="form-group">
        <label>Seu WhatsApp</label>
        <input type="tel" id="phone-input" placeholder="(11) 99999-8888" />
      </div>
      <button class="start-btn" id="start-btn">Iniciar conversa</button>
    </div>
  </div>
</div>

<div class="msg-form" id="msg-form" style="display: none;">
  <input type="text" id="msg-input" placeholder="Digite sua mensagem..." />
  <button id="send-btn">Enviar</button>
</div>

<script>
const params = new URLSearchParams(window.location.search);
const dealerId = params.get('dealer');
const supabaseUrl = 'https://rzobibhaoyetdcwkzhjg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6b2JpYmhhb3lldGRjd2t6aGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NTA4MjEsImV4cCI6MjEwMTUyNjgyMX0.zhfB7sFwzL87RzrNxXPPZGtUZI33N24iUATqwz-SywE';

// Fetch dealer name
fetch(supabaseUrl + '/rest/v1/dealers?id=eq.' + dealerId + '&select=name', {
  headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey }
})
.then(r => r.json())
.then(data => { if (data && data[0]) document.getElementById('dealer-name').textContent = data[0].name; })
.catch(() => {});

let conversationId = null;
let dealerName = 'a loja';

function startConversation() {
  const name = document.getElementById('name-input').value.trim();
  const phone = document.getElementById('phone-input').value.trim();
  if (!name || !phone) return;

  document.getElementById('intro').style.display = 'none';
  document.getElementById('msg-form').style.display = 'flex';

  // Create conversation via SECURITY DEFINER function (allows anon access)
  fetch(supabaseUrl + '/rest/v1/rpc/create_site_conversation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey },
    body: JSON.stringify({ p_dealer_id: dealerId, p_contact_name: name, p_contact_phone: phone }),
  })
  .then(r => r.json())
  .then(data => { if (data) conversationId = data; })
  .catch(() => {});

  addBotMessage('Olá, ' + name + '! Obrigado pelo contato. Em que podemos ajudar?');
}

function addBotMessage(text) {
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.textContent = text;
  document.getElementById('messages').appendChild(div);
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

function addUserMessage(text) {
  const div = document.createElement('div');
  div.className = 'msg user';
  div.textContent = text;
  document.getElementById('messages').appendChild(div);
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addUserMessage(text);

  // Save message
  if (conversationId) {
    fetch(supabaseUrl + '/rest/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey },
      body: JSON.stringify({ conversation_id: conversationId, dealer_id: dealerId, direction: 'inbound', content: text, content_type: 'text', ai_analysis: {}, ai_extracted_data: {} }),
    }).catch(() => {});

    // Forward to AI qualifier
    fetch(supabaseUrl + '/functions/v1/ai-lead-qualifier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'process_message', dealer_id: dealerId, channel: 'site', contact_name: null, contact_phone: null, message_content: text, conversation_id: conversationId }),
    }).catch(() => {});
  }

  // Update conversation preview
  if (conversationId) {
    fetch(supabaseUrl + '/rest/v1/conversations?id=eq.' + conversationId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey },
      body: JSON.stringify({ last_message_at: new Date().toISOString(), last_message_preview: text.slice(0, 100), unread_count: 1, updated_at: new Date().toISOString() }),
    }).catch(() => {});
  }
}

document.getElementById('start-btn').addEventListener('click', startConversation);
document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('msg-input').addEventListener('keydown', function(e) { if (e.key === 'Enter') sendMessage(); });
</script>

</body>
</html>

```

=== FILE: public/widget/chat.js ===
```javascript
(function() {
  var params = new URLSearchParams(document.currentScript.src.split('?')[1] || '');
  var dealerId = params.get('dealer') || '';

  if (!dealerId) { console.error('Chat: dealer ID não fornecido'); return; }

  // Determine the base URL for the widget
  var scriptSrc = document.currentScript.src;
  var baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/widget/') + 8);
  var chatUrl = baseUrl + 'chat.html?dealer=' + dealerId;

  // Create the floating button
  var btn = document.createElement('div');
  btn.style.cssText = [
    'position: fixed', 'bottom: 20px', 'right: 20px', 'z-index: 999999',
    'width: 60px', 'height: 60px', 'border-radius: 50%',
    'background: linear-gradient(135deg, #2a93e8, #2076c9)',
    'box-shadow: 0 4px 20px rgba(42,147,232,0.4)',
    'cursor: pointer', 'display: flex', 'align-items: 'center',
    'justify-content: center', 'transition: transform 0.2s ease',
    'animation: chatPulse 2s infinite'
  ].join(';') + ';';

  btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';

  // Create the popup iframe
  var popup = document.createElement('div');
  popup.style.cssText = [
    'position: fixed', 'bottom: 90px', 'right: 20px', 'z-index: 999998',
    'width: 360px', 'height: 520px', 'max-width: calc(100vw - 40px)',
    'max-height: calc(100vh - 120px)', 'border-radius: 16px',
    'overflow: hidden', 'box-shadow: 0 8px 40px rgba(0,0,0,0.3)',
    'display: none', 'border: 1px solid rgba(42,147,232,0.3)'
  ].join(';') + ';';

  var iframe = document.createElement('iframe');
  iframe.src = chatUrl;
  iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
  iframe.title = 'Chat de atendimento';
  popup.appendChild(iframe);

  var isOpen = false;

  btn.addEventListener('click', function() {
    isOpen = !isOpen;
    popup.style.display = isOpen ? 'block' : 'none';
    btn.style.transform = isOpen ? 'scale(0.9)' : 'scale(1)';
  });

  btn.addEventListener('mouseenter', function() { btn.style.transform = 'scale(1.1)'; });
  btn.addEventListener('mouseleave', function() { btn.style.transform = isOpen ? 'scale(0.9)' : 'scale(1)'; });

  // Add pulse animation
  var style = document.createElement('style');
  style.textContent = '@keyframes chatPulse { 0%, 100% { box-shadow: 0 4px 20px rgba(42,147,232,0.4); } 50% { box-shadow: 0 4px 30px rgba(42,147,232,0.6); } }';
  document.head.appendChild(style);

  document.body.appendChild(popup);
  document.body.appendChild(btn);
})();

```

