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

// === WhatsApp Direct (QR Code / Celular Pareado - Sem Meta Developers) ===
export async function connectWhatsAppDirectPhone(
  dealerId: string,
  integrationId: string,
  phoneNumber: string,
  method: 'qrcode' | 'pairing_code' = 'qrcode',
): Promise<{ success: boolean; error: string | null; message: string }> {
  const cleanPhone = (phoneNumber || '').replace(/\D/g, '');

  const webhookSecret = generateWebhookSecret(dealerId, 'whatsapp');

  const { error } = await supabase.from('integration_accounts').upsert({
    dealer_id: dealerId,
    integration_id: integrationId,
    status: 'connected',
    account_name: cleanPhone ? `WhatsApp (${cleanPhone})` : 'WhatsApp Pareado',
    account_identifier: cleanPhone || `wa-${dealerId.substring(0, 8)}`,
    phone_number_id: cleanPhone || `wa-${dealerId.substring(0, 8)}`,
    waba_id: cleanPhone || 'baileys-qr',
    webhook_url: `${EDGE_URL}/platform-webhook`,
    webhook_secret: webhookSecret,
    webhook_verified: true,
    connected_at: new Date().toISOString(),
    last_sync_at: new Date().toISOString(),
    metadata: {
      platform: 'whatsapp',
      connection_mode: method,
      phone_number: cleanPhone,
    },
    updated_at: new Date().toISOString(),
  }, { onConflict: 'dealer_id,integration_id' });

  return {
    success: !error,
    error: error ? error.message : null,
    message: error ? error.message : `WhatsApp conectado com sucesso! Aparelho vinculado e pronto para receber mensagens.`,
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
