import { useState } from 'react';
import {
  FileText, ExternalLink, ArrowRight, Check, ChevronDown,
  ClipboardList, Globe, Wallet, CircleCheck, FileCheck, Car,
} from 'lucide-react';

const DETRAN_ATPV_URL = 'https://operacoes.sp.gov.br/DetranWeb/login?redirect=/DetranWeb/autorizacaoTransferenciaPropriedadeVeiculo&auth=false';

type Step = {
  id: number;
  title: string;
  icon: typeof Car;
  items: string[];
};

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Reúna os documentos',
    icon: ClipboardList,
    items: [
      'CNPJ da loja e documento do representante',
      'CPF/RG do comprador',
      'Veículo sem débitos ou multas pendentes',
    ],
  },
  {
    id: 2,
    title: 'Acesse o Detran SP',
    icon: Globe,
    items: [
      'Entre no Portal de Operações do Detran SP',
      'Faça login com CPF/CNPJ e senha',
      'Selecione "ATPV-e" no menu',
    ],
  },
  {
    id: 3,
    title: 'Preencha os dados',
    icon: FileText,
    items: [
      'Dados do veículo (placa, RENAVAM, chassi)',
      'Dados do comprador (CPF/CNPJ)',
      'Data e valor da venda',
      'Revise e confirme as informações',
    ],
  },
  {
    id: 4,
    title: 'Pague a taxa e envie',
    icon: Wallet,
    items: [
      'Sistema gera a guia (DUDA)',
      'Pague online via PIX, cartão ou boleto',
      'Confirme o envio da ATPV-e',
      'Guarde o número de protocolo',
    ],
  },
  {
    id: 5,
    title: 'Acompanhe a transferência',
    icon: CircleCheck,
    items: [
      'Processada em até 48 horas úteis',
      'Acompanhe pelo número de protocolo',
      'Concluída: veículo no nome do novo dono',
    ],
  },
];

export function AtpvEPage() {
  const [openStep, setOpenStep] = useState<number | null>(1);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 animate-fade-in-down">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-accent-400" style={{ boxShadow: '0 0 8px rgba(74,174,245,0.5)' }} />
            <span className="text-xs font-semibold text-accent-400 uppercase tracking-wider">Guia Oficial</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">ATPV-e</h1>
          <p className="text-navy-300 text-sm mt-1">Transferência digital pelo Detran SP — sem cartório, sem papel</p>
        </div>
        <a
          href={DETRAN_ATPV_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-shine ripple-btn flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:-translate-y-0.5 text-sm whitespace-nowrap group flex-shrink-0"
        >
          <ExternalLink size={18} className="group-hover:scale-110 transition-transform" />
          Emitir ATPV-e
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>

      {/* Steps */}
      <div className="space-y-3 mb-6">
        {STEPS.map((step, i) => {
          const isOpen = openStep === step.id;
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 animate-fade-in-up ${isOpen ? 'ring-1 ring-accent-500/20' : ''}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <button
                onClick={() => setOpenStep(isOpen ? null : step.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-navy-700/20 transition-colors"
              >
                <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? 'bg-gradient-to-br from-accent-500 to-accent-600' : 'bg-navy-800/60 border border-navy-600/40'}`}>
                  <Icon size={20} className={isOpen ? 'text-white' : 'text-accent-400'} />
                  {i < STEPS.length - 1 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-3 bg-navy-600/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-navy-400">{step.id}</span>
                    <h3 className={`text-sm font-bold transition-colors ${isOpen ? 'text-white' : 'text-navy-100'}`}>
                      {step.title}
                    </h3>
                  </div>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-navy-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 animate-fade-in">
                  <div className="ml-15 pl-2">
                    <ul className="space-y-2">
                      {step.items.map((item, ii) => (
                        <li key={ii} className="flex items-start gap-2.5 text-sm text-navy-200 leading-relaxed">
                          <div className="w-4 h-4 rounded-full bg-accent-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check size={10} className="text-accent-400" />
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 px-4 py-3 text-xs text-navy-400 leading-relaxed">
        <FileCheck size={14} className="flex-shrink-0 mt-0.5 text-navy-500" />
        <p>
          A ATPV-e é emitida oficialmente pelo Detran SP. O processo completo acontece no portal do governo.
        </p>
      </div>
    </div>
  );
}
