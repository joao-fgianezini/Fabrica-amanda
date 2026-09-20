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
  credere_store_id: string | null;
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
  credere_lead_id: string | null;
  credere_synced_at: string | null;
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
  credere_simulation_uuid: string | null;
  provider: string | null;
  raw_response: Record<string, unknown> | null;
  licensing_uf: string | null;
  licensing_city: string | null;
  seller_cpf: string | null;
  created_at: string;
  updated_at: string;
};

export type FinancingSimulationStatus =
  | 'draft' | 'submitted' | 'processing' | 'analysis'
  | 'approved' | 'approved_with_condition' | 'rejected'
  | 'expired' | 'cancelled' | 'converted'
  | 'created' | 'completed' | 'failed' | 'no_results';

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
  credere_conditions?: CredereConditionRow[];
};

export type CredereConditionRow = {
  id: string;
  simulation_id: string;
  dealer_id: string;
  provider: string;
  bank_id: string | null;
  bank_name: string | null;
  bank_nickname: string | null;
  bank_febraban_code: string | null;
  provider_condition_id: string | null;
  installments: number | null;
  down_payment_cents: number | null;
  financed_amount_cents: number | null;
  amount_paid_in_financing_cents: number | null;
  bank_down_payment_suggestion_cents: number | null;
  expenses: Record<string, unknown> | null;
  reason: string | null;
  run_pre_approval: boolean;
  pre_approval_status: string | null;
  process_condition_payload: Record<string, unknown> | null;
  raw_response: Record<string, unknown> | null;
  is_selected: boolean;
  selected_at: string | null;
  created_at: string;
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

// === DEALER SITE TYPES ===

export type SiteTemplate = 'classic' | 'modern' | 'luxury' | 'sport' | 'minimal' | 'dark' | 'magazine' | 'highway';

export type SiteSocialLinks = {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  youtube?: string;
  tiktok?: string;
};

export type SiteData = {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  aboutTitle?: string;
  aboutText?: string;
  aboutImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  showAboutSection?: boolean;
  showStatsSection?: boolean;
  showContactSection?: boolean;
  showSocialLinks?: boolean;
  customFooterText?: string;
  social?: SiteSocialLinks;
};

export type DealerSite = {
  id: string;
  dealer_id: string;
  template: SiteTemplate;
  slug: string;
  is_published: boolean;
  site_data: SiteData;
  custom_domain: string | null;
  created_at: string;
  updated_at: string;
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

// === ATPV-E TYPES ===

export type AtpvEStatus = 'draft' | 'ready' | 'submitted' | 'completed' | 'cancelled';

export type AtpvERecord = {
  id: string;
  dealer_id: string;
  vehicle_id: string | null;
  sale_id: string | null;
  buyer_name: string;
  buyer_cpf_cnpj: string | null;
  buyer_phone: string | null;
  buyer_address: string | null;
  buyer_city: string | null;
  buyer_state: string | null;
  sale_price: number | null;
  sale_date: string | null;
  vehicle_plate: string | null;
  vehicle_chassis: string | null;
  vehicle_renavam: string | null;
  status: AtpvEStatus;
  detran_protocol: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AtpvEWithVehicle = AtpvERecord & {
  vehicle?: Pick<Vehicle, 'id' | 'brand' | 'model' | 'year_model' | 'year_manufacture' | 'plate' | 'chassis' | 'asking_price'> | null;
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
