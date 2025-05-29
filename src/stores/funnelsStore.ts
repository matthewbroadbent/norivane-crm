import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

type Funnel = Database['public']['Tables']['funnels']['Row'];
type FunnelStage = {
  id: string;
  funnel_id: string;
  name: string;
  order: number;
  created_at: string;
};

interface FunnelsState {
  funnels: Funnel[];
  stages: FunnelStage[];
  loading: boolean;
  error: string | null;
  fetchFunnels: () => Promise<void>;
  fetchStages: () => Promise<void>;
  addFunnel: (funnel: Omit<Funnel, 'id' | 'created_at'>) => Promise<Funnel | null>;
  updateFunnel: (id: string, funnel: Partial<Funnel>) => Promise<void>;
  deleteFunnel: (id: string) => Promise<void>;
}

export const useFunnelsStore = create<FunnelsState>((set, get) => ({
  funnels: [],
  stages: [],
  loading: false,
  error: null,
  
  fetchFunnels: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('funnels')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ funnels: data || [] });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchStages: async () => {
    try {
      const { data, error } = await supabase
        .from('funnel_stages')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) throw error;
      set({ stages: data || [] });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  addFunnel: async (funnel) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('funnels')
        .insert(funnel)
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({
        funnels: [data, ...state.funnels],
      }));
      
      return data;
    } catch (error: any) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  updateFunnel: async (id, funnel) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('funnels')
        .update(funnel)
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        funnels: state.funnels.map((f) => (f.id === id ? { ...f, ...funnel } : f)),
      }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  
  deleteFunnel: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('funnels')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        funnels: state.funnels.filter((f) => f.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
