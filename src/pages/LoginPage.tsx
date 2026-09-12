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
