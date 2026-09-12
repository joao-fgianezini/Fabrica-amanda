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

