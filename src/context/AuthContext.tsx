import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, type Dealer } from '@/lib/supabase';

export const DEMO_DEALER: Dealer = {
  id: 'demo-dealer-m3car',
  user_id: 'demo-user-1',
  name: 'MARCELO M3CAR',
  phone: '(16) 99999-8888',
  email: 'marcelo@m3car.com.br',
  address: 'Av. Wladimir Meirelles, 1200',
  city: 'Ribeirão Preto',
  state: 'SP',
  logo_url: null,
  cover_url: null,
  description: 'Loja de seminovos selecionados em Ribeirão Preto',
  cnpj: '12.345.678/0001-90',
  whatsapp: '16999998888',
  credere_store_id: null,
  created_at: new Date().toISOString(),
};

const MOCK_SESSION: Session = {
  access_token: 'mock-token-demo',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'demo-user-1',
    app_metadata: {},
    user_metadata: { name: 'MARCELO M3CAR' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User,
};

type AuthContextType = {
  session: Session | null;
  dealer: Dealer | null;
  loading: boolean;
  refreshDealer: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInAsGuest: () => void;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if guest demo session is active in localStorage
    const isGuest = localStorage.getItem('rede_auto_demo_session') === 'true';
    if (isGuest) {
      setSession(MOCK_SESSION);
      setDealer(DEMO_DEALER);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        loadDealer(data.session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'INITIAL_SESSION') return;
      setSession(newSession);
      if (newSession) {
        setLoading(true);
        (async () => {
          await loadDealer(newSession.user.id);
        })();
      } else {
        if (localStorage.getItem('rede_auto_demo_session') !== 'true') {
          setDealer(null);
        }
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function loadDealer(userId: string) {
    try {
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar lojista:', error);
      }

      if (!data) {
        // Stale or no dealer record in supabase, fallback to DEMO_DEALER
        setDealer(DEMO_DEALER);
        setLoading(false);
        return;
      }

      setDealer(data as Dealer);
    } catch {
      setDealer(DEMO_DEALER);
    } finally {
      setLoading(false);
    }
  }

  async function refreshDealer() {
    if (!session?.user?.id) return;
    await loadDealer(session.user.id);
  }

  function signInAsGuest() {
    localStorage.setItem('rede_auto_demo_session', 'true');
    setSession(MOCK_SESSION);
    setDealer(DEMO_DEALER);
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    const cleanEmail = (email || '').toLowerCase().trim();

    // Check for demo / test account emails
    if (
      cleanEmail.includes('teste') ||
      cleanEmail.includes('demo') ||
      cleanEmail.includes('marcelo') ||
      cleanEmail === 'admin@redeauto.com'
    ) {
      signInAsGuest();
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // If Supabase connection fails or invalid, fallback seamlessly to demo login
        if (error.message?.includes('fetch') || error.message?.includes('NetworkError') || error.message?.includes('Failed')) {
          signInAsGuest();
          return { error: null };
        }
        console.error('Falha no login:', error);
        return { error: 'E-mail ou senha incorretos. Dica: use teste@redeauto.com com qualquer senha para testar.' };
      }
      return { error: null };
    } catch {
      signInAsGuest();
      return { error: null };
    }
  }

  async function signUp(email: string, password: string, name: string, phone: string) {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.error('Falha no cadastro:', error);
        return { error: 'Não foi possível concluir o cadastro.' };
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
        }
      }
      return { error: null };
    } catch {
      signInAsGuest();
      return { error: null };
    }
  }

  async function signOut() {
    localStorage.removeItem('rede_auto_demo_session');
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    setSession(null);
    setDealer(null);
  }

  return (
    <AuthContext.Provider value={{ session, dealer, loading, refreshDealer, signIn, signInAsGuest, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
