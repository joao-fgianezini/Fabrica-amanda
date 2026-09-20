import type { ConversationWithLead, Message, VehiclePhoto } from '@/lib/supabase';
import type { VehicleInterestInfo } from '@/components/VehicleChatHeader';

export type ChatCommercialStatus =
  | 'novo'
  | 'em_atendimento'
  | 'aguardando_cliente'
  | 'proposta_enviada'
  | 'ganho'
  | 'perdido';

export const CHAT_STATUS_CONFIG: Record<
  ChatCommercialStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  novo: {
    label: 'Novo Lead',
    badgeClass: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
    dotClass: 'bg-accent-400',
  },
  em_atendimento: {
    label: 'Em Atendimento',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dotClass: 'bg-amber-400',
  },
  aguardando_cliente: {
    label: 'Aguardando Cliente',
    badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    dotClass: 'bg-orange-400',
  },
  proposta_enviada: {
    label: 'Proposta Enviada',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    dotClass: 'bg-purple-400',
  },
  ganho: {
    label: 'Venda Concluída',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
  },
  perdido: {
    label: 'Perdido',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    dotClass: 'bg-rose-400',
  },
};

export type UnifiedConversation = ConversationWithLead & {
  commercial_status?: ChatCommercialStatus;
  vehicle?: VehicleInterestInfo | null;
};

// Key storage for local demo / sandbox conversations
const DEMO_STORAGE_KEY = 'rede_auto_unified_chat_demo_v1';
const DEMO_MESSAGES_KEY = 'rede_auto_unified_chat_messages_v1';

export function getLocalDemoConversations(): UnifiedConversation[] {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalDemoConversations(conversations: UnifiedConversation[]) {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.error('Erro ao salvar no localStorage:', e);
  }
}

export function getLocalDemoMessages(conversationId: string): Message[] {
  try {
    const raw = localStorage.getItem(`${DEMO_MESSAGES_KEY}_${conversationId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalDemoMessages(conversationId: string, messages: Message[]) {
  try {
    localStorage.setItem(`${DEMO_MESSAGES_KEY}_${conversationId}`, JSON.stringify(messages));
  } catch (e) {
    console.error('Erro ao salvar mensagens:', e);
  }
}

export function clearLocalDemoData() {
  try {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    // Remove individual demo message keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(DEMO_MESSAGES_KEY)) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.error('Erro ao limpar demo:', e);
  }
}

// Generate rich sample conversations for all 5 platforms
export function generateMultichannelDemo(dealerId: string): {
  conversations: UnifiedConversation[];
  messagesMap: Record<string, Message[]>;
} {
  const now = new Date();

  const convWhatsAppId = 'demo-conv-whatsapp-1';
  const convInstagramId = 'demo-conv-instagram-2';
  const convFacebookId = 'demo-conv-facebook-3';
  const convOlxId = 'demo-conv-olx-4';
  const convWebmotorsId = 'demo-conv-webmotors-5';

  const conversations: UnifiedConversation[] = [
    {
      id: convWhatsAppId,
      dealer_id: dealerId,
      integration_account_id: 'acc-whatsapp',
      lead_id: 'lead-1',
      client_id: null,
      external_id: '5516997654321',
      contact_name: 'Marcos Vinícius Silveira',
      contact_phone: '(16) 99765-4321',
      contact_handle: null,
      channel: 'whatsapp',
      status: 'open',
      commercial_status: 'em_atendimento',
      last_message_at: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
      last_message_preview: 'Consigo dar 40 mil de entrada e financiar o restante?',
      unread_count: 1,
      ai_summary: 'Interessado na Hilux SRX. Possui R$ 40.000 de entrada e quer simular prazo em 48x.',
      ai_sentiment: 'positive',
      ai_intent: 'financing_quote',
      ai_qualified: true,
      created_at: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
      vehicle: {
        id: 'demo-veh-1',
        brand: 'Toyota',
        model: 'Hilux SRX 2.8 4x4 Diesel Aut.',
        year_model: 2023,
        year_manufacture: 2023,
        asking_price: 289900,
        color: 'Branco Pérola',
        plate: 'RDA2E33',
        mileage: 28500,
        transmission: 'Automático',
        fuel: 'Diesel',
        status: 'available',
      },
      lead: {
        id: 'lead-1',
        dealer_id: dealerId,
        client_id: null,
        vehicle_id: 'demo-veh-1',
        name: 'Marcos Vinícius Silveira',
        phone: '(16) 99765-4321',
        email: 'marcos.silveira@gmail.com',
        source: 'whatsapp',
        source_detail: 'Anúncio WhatsApp Direct',
        status: 'qualified',
        lead_score: 88,
        budget: 290000,
        down_payment: 40000,
        max_installment: 6500,
        notes: 'Cliente autônomo com bom histórico. Negociação prioritária.',
        last_interaction_at: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
        assigned_to: 'Vendedor Loja',
        created_at: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
      },
    },
    {
      id: convInstagramId,
      dealer_id: dealerId,
      integration_account_id: 'acc-instagram',
      lead_id: 'lead-2',
      client_id: null,
      external_id: 'ig_carol_mendes',
      contact_name: 'Carolina Mendes (@carolmendes.arq)',
      contact_phone: '(16) 98123-9988',
      contact_handle: '@carolmendes.arq',
      channel: 'instagram',
      status: 'open',
      commercial_status: 'novo',
      last_message_at: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      last_message_preview: 'Oi! Vi o post da BMW 320i. Ainda está na loja pra ver hoje à tarde?',
      unread_count: 1,
      ai_summary: 'Viu reels no Instagram e deseja agendar visita presencial hoje para test drive.',
      ai_sentiment: 'positive',
      ai_intent: 'visit_schedule',
      ai_qualified: true,
      created_at: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      vehicle: {
        id: 'demo-veh-2',
        brand: 'BMW',
        model: '320i M Sport 2.0 Turbo ActiveFlex',
        year_model: 2022,
        year_manufacture: 2021,
        asking_price: 245000,
        color: 'Azul Portimão',
        plate: 'BMW3M22',
        mileage: 31000,
        transmission: 'Automático',
        fuel: 'Flex',
        status: 'available',
      },
      lead: {
        id: 'lead-2',
        dealer_id: dealerId,
        client_id: null,
        vehicle_id: 'demo-veh-2',
        name: 'Carolina Mendes',
        phone: '(16) 98123-9988',
        email: 'carol.arquitetura@yahoo.com',
        source: 'instagram',
        source_detail: 'Direct via Stories BMW',
        status: 'new',
        lead_score: 92,
        budget: 250000,
        down_payment: 100000,
        max_installment: null,
        notes: 'Quer pagar parte à vista e avaliar um Corolla 2020 na troca.',
        last_interaction_at: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        assigned_to: null,
        created_at: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      },
    },
    {
      id: convFacebookId,
      dealer_id: dealerId,
      integration_account_id: 'acc-facebook',
      lead_id: 'lead-3',
      client_id: null,
      external_id: 'fb_joao_tcross',
      contact_name: 'João Pedro Faria',
      contact_phone: '(16) 99112-4455',
      contact_handle: 'joao.pedro.faria',
      channel: 'facebook',
      status: 'open',
      commercial_status: 'proposta_enviada',
      last_message_at: new Date(now.getTime() - 32 * 60 * 1000).toISOString(),
      last_message_preview: 'Recebi a proposta da financeira pelo e-mail, obrigado!',
      unread_count: 0,
      ai_summary: 'Proposta de R$ 118.900 enviada com aprovação no Santander.',
      ai_sentiment: 'positive',
      ai_intent: 'proposal_sent',
      ai_qualified: true,
      created_at: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 32 * 60 * 1000).toISOString(),
      vehicle: {
        id: 'demo-veh-3',
        brand: 'Volkswagen',
        model: 'T-Cross Highline 250 TSI',
        year_model: 2022,
        year_manufacture: 2022,
        asking_price: 118900,
        color: 'Cinza Platinum',
        plate: 'BRA2E19',
        mileage: 44000,
        transmission: 'Automático',
        fuel: 'Flex',
        status: 'reserved',
      },
      lead: {
        id: 'lead-3',
        dealer_id: dealerId,
        client_id: null,
        vehicle_id: 'demo-veh-3',
        name: 'João Pedro Faria',
        phone: '(16) 99112-4455',
        email: 'joaofaria@hotmail.com',
        source: 'facebook',
        source_detail: 'Facebook Marketplace - T-Cross 2022',
        status: 'proposal',
        lead_score: 95,
        budget: 120000,
        down_payment: 30000,
        max_installment: 2500,
        notes: 'Aguardando envio do comprovante de renda para fechar contrato.',
        last_interaction_at: new Date(now.getTime() - 32 * 60 * 1000).toISOString(),
        assigned_to: 'Vendedor Loja',
        created_at: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 32 * 60 * 1000).toISOString(),
      },
    },
    {
      id: convOlxId,
      dealer_id: dealerId,
      integration_account_id: 'acc-olx',
      lead_id: 'lead-4',
      client_id: null,
      external_id: 'olx_chat_hrv_772',
      contact_name: 'Roberto Alves (OLX)',
      contact_phone: '(16) 99345-0011',
      contact_handle: null,
      channel: 'olx',
      status: 'open',
      commercial_status: 'aguardando_cliente',
      last_message_at: new Date(now.getTime() - 55 * 60 * 1000).toISOString(),
      last_message_preview: 'Aceita troca por um Onix 2019 com volta?',
      unread_count: 1,
      ai_summary: 'Pergunta sobre avaliação de seminovo na troca (Chevrolet Onix 2019).',
      ai_sentiment: 'neutral',
      ai_intent: 'trade_in',
      ai_qualified: true,
      created_at: new Date(now.getTime() - 5 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 55 * 60 * 1000).toISOString(),
      vehicle: {
        id: 'demo-veh-4',
        brand: 'Honda',
        model: 'HR-V EXL 1.8 16V Flex Aut.',
        year_model: 2020,
        year_manufacture: 2020,
        asking_price: 106900,
        color: 'Prata Barium',
        plate: 'HRV4X20',
        mileage: 52000,
        transmission: 'Automático',
        fuel: 'Flex',
        status: 'available',
      },
      lead: {
        id: 'lead-4',
        dealer_id: dealerId,
        client_id: null,
        vehicle_id: 'demo-veh-4',
        name: 'Roberto Alves',
        phone: '(16) 99345-0011',
        email: 'roberto.alves.olx@gmail.com',
        source: 'olx',
        source_detail: 'Anúncio OLX Pro - HR-V EXL',
        status: 'contacted',
        lead_score: 74,
        budget: 110000,
        down_payment: null,
        max_installment: null,
        notes: 'Pediu para avaliar o Onix dele com fotos no WhatsApp.',
        last_interaction_at: new Date(now.getTime() - 55 * 60 * 1000).toISOString(),
        assigned_to: null,
        created_at: new Date(now.getTime() - 5 * 3600 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 55 * 60 * 1000).toISOString(),
      },
    },
    {
      id: convWebmotorsId,
      dealer_id: dealerId,
      integration_account_id: 'acc-webmotors',
      lead_id: 'lead-5',
      client_id: null,
      external_id: 'wm_lead_compass_9918',
      contact_name: 'Fernanda Barbosa (Webmotors Lead)',
      contact_phone: '(16) 98822-7744',
      contact_handle: null,
      channel: 'webmotors',
      status: 'open',
      commercial_status: 'em_atendimento',
      last_message_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      last_message_preview: 'Gostaria de agendar uma simulação com taxa especial da Webmotors.',
      unread_count: 0,
      ai_summary: 'Lead originado da Webmotors com dados cadastrais completos solicitando financiamento.',
      ai_sentiment: 'positive',
      ai_intent: 'webmotors_lead_cockpit',
      ai_qualified: true,
      created_at: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      vehicle: {
        id: 'demo-veh-5',
        brand: 'Jeep',
        model: 'Compass Limited 1.3 T270 Turbo Aut.',
        year_model: 2022,
        year_manufacture: 2022,
        asking_price: 149900,
        color: 'Preto Carbon',
        plate: 'JEP5L22',
        mileage: 38000,
        transmission: 'Automático',
        fuel: 'Flex',
        status: 'available',
      },
      lead: {
        id: 'lead-5',
        dealer_id: dealerId,
        client_id: null,
        vehicle_id: 'demo-veh-5',
        name: 'Fernanda Barbosa',
        phone: '(16) 98822-7744',
        email: 'fernanda.barbosa@outlook.com',
        source: 'webmotors',
        source_detail: 'Cockpit Webmotors Lead Qualificado',
        status: 'qualified',
        lead_score: 96,
        budget: 155000,
        down_payment: 50000,
        max_installment: 3200,
        notes: 'Score bancário alto. Cliente quer fechar ainda nesta semana.',
        last_interaction_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
        assigned_to: 'Vendedor Loja',
        created_at: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      },
    },
  ];

  const messagesMap: Record<string, Message[]> = {
    [convWhatsAppId]: [
      {
        id: 'msg-wa-1',
        conversation_id: convWhatsAppId,
        dealer_id: dealerId,
        direction: 'inbound',
        content: 'Boa tarde! Vi o anúncio da Hilux SRX 2023 no Instagram e cliquei no botão de WhatsApp. O carro ainda está disponível na loja de Ribeirão?',
        content_type: 'text',
        external_id: 'wa-msg-1',
        ai_extracted_data: { vehicle_interest: 'Toyota Hilux SRX 2023', intent: 'availability' },
        ai_analysis: {
          sentiment: 'positive',
          summary: 'Interessado na Hilux SRX 2023, pergunta se está na loja.',
          lead_score: 85,
          suggested_action: 'Confirmar disponibilidade e convidar para visita presencial.',
          conversation_type: 'lead',
        },
        created_at: new Date(now.getTime() - 35 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg-wa-2',
        conversation_id: convWhatsAppId,
        dealer_id: dealerId,
        direction: 'outbound',
        content: 'Olá Marcos, boa tarde! Tudo bem? Sim, a Hilux está aqui no nosso show room na Av. Wladimir Meirelles. Carro impecável, único dono e com revisões em dia!',
        content_type: 'text',
        external_id: 'wa-msg-2',
        ai_extracted_data: {},
        ai_analysis: { delivery_status: 'sent' },
        created_at: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg-wa-3',
        conversation_id: convWhatsAppId,
        dealer_id: dealerId,
        direction: 'inbound',
        content: 'Consigo dar 40 mil de entrada e financiar o restante?',
        content_type: 'text',
        external_id: 'wa-msg-3',
        ai_extracted_data: { vehicle_interest: 'Hilux SRX', down_payment: 40000, intent: 'financing' },
        ai_analysis: {
          sentiment: 'positive',
          summary: 'Tem R$ 40k de entrada e quer proposta de financiamento.',
          lead_score: 88,
          suggested_action: 'Fazer simulação de financiamento rápida nos bancos integrados (BV, Santander, Bradesco).',
          conversation_type: 'lead',
        },
        created_at: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
      },
    ],
    [convInstagramId]: [
      {
        id: 'msg-ig-1',
        conversation_id: convInstagramId,
        dealer_id: dealerId,
        direction: 'inbound',
        content: 'Oi! Vi o post da BMW 320i. Ainda está na loja pra ver hoje à tarde?',
        content_type: 'text',
        external_id: 'ig-msg-1',
        ai_extracted_data: { vehicle_interest: 'BMW 320i M Sport', intent: 'test_drive' },
        ai_analysis: {
          sentiment: 'positive',
          summary: 'Quer agendar visita presencial hoje para ver a BMW 320i.',
          lead_score: 92,
          suggested_action: 'Agendar horário e deixar o veículo posicionado para test-drive.',
          conversation_type: 'lead',
        },
        created_at: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      },
    ],
    [convFacebookId]: [
      {
        id: 'msg-fb-1',
        conversation_id: convFacebookId,
        dealer_id: dealerId,
        direction: 'inbound',
        content: 'Olá! Tenho interesse no anúncio do VW T-Cross Highline 2022 que você postou no Marketplace.',
        content_type: 'text',
        external_id: 'fb-msg-1',
        ai_extracted_data: { vehicle_interest: 'VW T-Cross Highline 2022' },
        ai_analysis: {
          sentiment: 'positive',
          summary: 'Lead do Facebook Marketplace interessado no T-Cross.',
          lead_score: 90,
          conversation_type: 'lead',
        },
        created_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      },
      {
        id: 'msg-fb-2',
        conversation_id: convFacebookId,
        dealer_id: dealerId,
        direction: 'outbound',
        content: 'Olá João Pedro! Excelente escolha. O T-Cross está reservado para nossa proposta. Acabei de lhe enviar as condições de taxa 1,29% a.m.',
        content_type: 'text',
        external_id: 'fb-msg-2',
        ai_extracted_data: {},
        ai_analysis: { delivery_status: 'sent' },
        created_at: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg-fb-3',
        conversation_id: convFacebookId,
        dealer_id: dealerId,
        direction: 'inbound',
        content: 'Recebi a proposta da financeira pelo e-mail, obrigado!',
        content_type: 'text',
        external_id: 'fb-msg-3',
        ai_extracted_data: {},
        ai_analysis: { sentiment: 'positive', summary: 'Cliente confirmou recebimento da proposta.', lead_score: 95 },
        created_at: new Date(now.getTime() - 32 * 60 * 1000).toISOString(),
      },
    ],
    [convOlxId]: [
      {
        id: 'msg-olx-1',
        conversation_id: convOlxId,
        dealer_id: dealerId,
        direction: 'inbound',
        content: 'Olá, vi o anúncio no chat da OLX do Honda HR-V 2020. Aceita troca por um Onix 2019 com volta?',
        content_type: 'text',
        external_id: 'olx-msg-1',
        ai_extracted_data: { vehicle_interest: 'Honda HR-V EXL', intent: 'trade_in' },
        ai_analysis: {
          sentiment: 'neutral',
          summary: 'Proposta de troca com Chevrolet Onix 2019 mais volta em dinheiro.',
          lead_score: 74,
          suggested_action: 'Pedir ano, modelo, km e fotos do Onix para pré-avaliação FIPE.',
          conversation_type: 'lead',
        },
        created_at: new Date(now.getTime() - 55 * 60 * 1000).toISOString(),
      },
    ],
    [convWebmotorsId]: [
      {
        id: 'msg-wm-1',
        conversation_id: convWebmotorsId,
        dealer_id: dealerId,
        direction: 'inbound',
        content: 'Lead Webmotors: Fernanda Barbosa demonstrou interesse no Jeep Compass Limited 2022 (Placa JEP5L22). Gostaria de agendar uma simulação com taxa especial da Webmotors.',
        content_type: 'text',
        external_id: 'wm-msg-1',
        ai_extracted_data: { vehicle_interest: 'Jeep Compass Limited', intent: 'financing' },
        ai_analysis: {
          sentiment: 'positive',
          summary: 'Lead qualificado direto do Cockpit Webmotors com interesse em financiamento.',
          lead_score: 96,
          suggested_action: 'Entrar em contato em até 10 minutos para garantir maior taxa de conversão.',
          conversation_type: 'lead',
        },
        created_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      },
    ],
  };

  return { conversations, messagesMap };
}
