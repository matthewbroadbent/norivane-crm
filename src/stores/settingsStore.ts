import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

type UserSettings = Database['public']['Tables']['user_settings']['Row'];

interface SettingsState {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<UserSettings | null>;
  uploadLogo: (file: File) => Promise<string | null>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loading: false,
  error: null,
  
  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw error;
      }
      
      // If no settings exist yet, create default settings
      if (!data) {
        const newSettings = {
          user_id: userData.user.id,
          company_name: '',
          logo_url: null,
          email_signature: null,
        };
        
        const { data: createdData, error: createError } = await supabase
          .from('user_settings')
          .insert([newSettings])
          .select()
          .single();
        
        if (createError) throw createError;
        
        set({ settings: createdData, loading: false });
      } else {
        set({ settings: data, loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  updateSettings: async (updates) => {
    set({ loading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      // First check if settings exist
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();
      
      let result;
      
      if (existingSettings) {
        // Update existing settings
        const { data, error } = await supabase
          .from('user_settings')
          .update(updates)
          .eq('id', existingSettings.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new settings
        const newSettings = {
          user_id: userData.user.id,
          ...updates,
        };
        
        const { data, error } = await supabase
          .from('user_settings')
          .insert([newSettings])
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }
      
      set({ settings: result, loading: false });
      return result;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },
  
  uploadLogo: async (file) => {
    set({ loading: true, error: null });
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userData.user.id}-logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
      
      const publicUrl = urlData.publicUrl;
      
      // Update settings with new logo URL
      await supabase
        .from('user_settings')
        .update({ logo_url: publicUrl })
        .eq('user_id', userData.user.id);
      
      set((state) => ({
        settings: state.settings ? { ...state.settings, logo_url: publicUrl } : null,
        loading: false,
      }));
      
      return publicUrl;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },
}));
