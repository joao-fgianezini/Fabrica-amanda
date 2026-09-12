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
