import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContactsState {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  fetchContacts: () => Promise<void>;
  addContact: (contact: Omit<Contact, 'id' | 'created_at'>) => Promise<Contact | null>;
  updateContact: (id: string, contact: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
}

export const useContactsStore = create<ContactsState>((set) => ({
  contacts: [],
  loading: false,
  error: null,
  
  fetchContacts: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ contacts: data || [] });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  
  addContact: async (contact) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert(contact)
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({
        contacts: [data, ...state.contacts],
      }));
      
      return data;
    } catch (error: any) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  updateContact: async (id, contact) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('contacts')
        .update(contact)
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...contact } : c)),
      }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  
  deleteContact: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        contacts: state.contacts.filter((c) => c.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
