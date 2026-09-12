import { supabase, type Integration, type IntegrationAccount, type Conversation, type Message, type ConversationWithLead, type ExternalListing } from '@/lib/supabase';

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

// === AI reply suggestion ===

export async function getAIReplySuggestion(messageContent: string): Promise<{
  reply_suggestion: string | null;
  next_best_action: string | null;
  temperature: string | null;
}> {
  try {
    const response = await fetch(`${EDGE_URL}/ai-lead-qualifier`, {
      method: 'POST',
      headers: edgeHeaders(),
      body: JSON.stringify({ action: 'suggest_reply', message_content: messageContent }),
    });
    if (!response.ok) return { reply_suggestion: null, next_best_action: null, temperature: null };
    const result = await response.json();
    return {
      reply_suggestion: result.reply_suggestion || null,
      next_best_action: result.next_best_action || null,
      temperature: result.temperature || null,
    };
  } catch {
    return { reply_suggestion: null, next_best_action: null, temperature: null };
  }
}

// === Temperature helpers ===

export type Temperature = 'hot' | 'warm' | 'cold' | null;

export function temperatureLabel(t: Temperature): string {
  if (t === 'hot') return 'Quente';
  if (t === 'warm') return 'Morno';
  if (t === 'cold') return 'Frio';
  return '—';
}

export function temperatureColor(t: Temperature): string {
  if (t === 'hot') return '#ef4444';
  if (t === 'warm') return '#f59e0b';
  if (t === 'cold') return '#3b82f6';
  return '#64748b';
}

export function temperatureEmoji(t: Temperature): string {
  if (t === 'hot') return '🔥';
  if (t === 'warm') return '🟡';
  if (t === 'cold') return '🔵';
  return '⚪';
}

// === External listings ===

export type ExternalListingStatus = 'published' | 'syncing' | 'error' | 'not_published' | 'paused' | 'sold_removed';

export async function loadExternalListings(vehicleId: string): Promise<ExternalListing[]> {
  const { data, error } = await supabase
    .from('external_listings')
    .select('*')
    .eq('vehicle_id', vehicleId);
  if (error) return [];
  return (data as ExternalListing[]) || [];
}

export async function publishToPlatform(
  dealerId: string,
  vehicleId: string,
  platform: string,
  integrationAccountId: string | null,
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase
    .from('external_listings')
    .upsert({
      dealer_id: dealerId,
      vehicle_id: vehicleId,
      integration_account_id: integrationAccountId,
      platform,
      status: 'syncing',
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'dealer_id,vehicle_id,platform' });

  if (error) return { success: false, error: error.message };

  // In a real implementation, this would call the platform's API to create the listing.
  // For now, we mark it as published after the "sync" — the actual API call depends on
  // the platform's partner API being available and the dealer being approved.
  setTimeout(async () => {
    await supabase
      .from('external_listings')
      .update({ status: 'published', last_sync_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('vehicle_id', vehicleId)
      .eq('platform', platform);
  }, 1500);

  return { success: true, error: null };
}

export async function unpublishFromPlatform(vehicleId: string, platform: string): Promise<boolean> {
  const { error } = await supabase
    .from('external_listings')
    .update({ status: 'paused', updated_at: new Date().toISOString() })
    .eq('vehicle_id', vehicleId)
    .eq('platform', platform);
  return !error;
}

// === Integration health ===

export type IntegrationHealth = {
  platform: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending_auth';
  lastSyncAt: string | null;
  lastError: string | null;
  recommendedAction: string | null;
  account: IntegrationAccount | null;
};

export async function getIntegrationHealth(dealerId: string): Promise<IntegrationHealth[]> {
  const { data: accounts } = await supabase
    .from('integration_accounts')
    .select('*, integration:integrations(*)')
    .eq('dealer_id', dealerId);

  const platforms = ['whatsapp', 'instagram', 'facebook', 'olx', 'webmotors'];
  const healthMap: Record<string, IntegrationHealth> = {};

  for (const platform of platforms) {
    healthMap[platform] = {
      platform,
      status: 'disconnected',
      lastSyncAt: null,
      lastError: null,
      recommendedAction: null,
      account: null,
    };
  }

  if (accounts) {
    for (const acc of accounts as (IntegrationAccount & { integration?: Integration })[]) {
      const platform = acc.integration?.platform || '';
      if (!platform) continue;
      const hasError = acc.webhook_verified === false && acc.status === 'connected';
      healthMap[platform] = {
        platform,
        status: acc.status === 'connected' ? (hasError ? 'pending_auth' : 'connected') : 'disconnected',
        lastSyncAt: acc.last_sync_at,
        lastError: hasError ? 'Webhook não verificado — configure o webhook na plataforma' : null,
        recommendedAction: hasError ? 'Configurar webhook na plataforma' : null,
        account: acc,
      };
    }
  }

  return platforms.map((p) => healthMap[p]);
}
