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
      { to: '/atendimento', label: 'Atendimento 360°', icon: MessageSquare },
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
