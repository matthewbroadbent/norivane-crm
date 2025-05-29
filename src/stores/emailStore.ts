import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

type EmailTemplate = Database['public']['Tables']['email_templates']['Row'];
type EmailCampaign = Database['public']['Tables']['email_campaigns']['Row'];
type CampaignRecipient = Database['public']['Tables']['campaign_recipients']['Row'];

interface EmailState {
  templates: EmailTemplate[];
  campaigns: EmailCampaign[];
  recipients: CampaignRecipient[];
  loading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  fetchCampaigns: () => Promise<void>;
  fetchRecipients: (campaignId?: string) => Promise<void>;
  addTemplate: (template: Omit<EmailTemplate, 'id' | 'created_at'>) => Promise<EmailTemplate | null>;
  updateTemplate: (id: string, updates: Partial<EmailTemplate>) => Promise<EmailTemplate | null>;
  deleteTemplate: (id: string) => Promise<void>;
  addCampaign: (campaign: Omit<EmailCampaign, 'id' | 'created_at'>) => Promise<EmailCampaign | null>;
  updateCampaign: (id: string, updates: Partial<EmailCampaign>) => Promise<EmailCampaign | null>;
  deleteCampaign: (id: string) => Promise<void>;
  addRecipient: (recipient: Omit<CampaignRecipient, 'id' | 'created_at'>) => Promise<CampaignRecipient | null>;
  updateRecipientStatus: (id: string, status: string) => Promise<void>;
}

export const useEmailStore = create<EmailState>((set, get) => ({
  templates: [],
  campaigns: [],
  recipients: [],
  loading: false,
  error: null,
  
  fetchTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ templates: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchCampaigns: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ campaigns: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchRecipients: async (campaignId) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('campaign_recipients')
        .select('*');
      
      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      set({ recipients: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  addTemplate: async (template) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert([template])
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({
        templates: [data, ...state.templates],
        loading: false,
      }));
      
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },
  
  updateTemplate: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({
        templates: state.templates.map((template) => 
          template.id === id ? data : template
        ),
        loading: false,
      }));
      
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },
  
  deleteTemplate: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        templates: state.templates.filter((template) => template.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  addCampaign: async (campaign) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert([campaign])
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({
        campaigns: [data, ...state.campaigns],
        loading: false,
      }));
      
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },
  
  updateCampaign: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({
        campaigns: state.campaigns.map((campaign) => 
          campaign.id === id ? data : campaign
        ),
        loading: false,
      }));
      
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },
  
  deleteCampaign: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        campaigns: state.campaigns.filter((campaign) => campaign.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  addRecipient: async (recipient) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('campaign_recipients')
        .insert([recipient])
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({
        recipients: [...state.recipients, data],
        loading: false,
      }));
      
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },
  
  updateRecipientStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const updates: any = { status };
      
      if (status === 'opened') {
        updates.opened_at = new Date().toISOString();
      } else if (status === 'clicked') {
        updates.clicked_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('campaign_recipients')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      await get().fetchRecipients();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
