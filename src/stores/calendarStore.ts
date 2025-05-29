import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];

interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  googleConnected: boolean;
  fetchEvents: (startDate?: Date, endDate?: Date) => Promise<void>;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'created_at'>) => Promise<CalendarEvent | null>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<CalendarEvent | null>;
  deleteEvent: (id: string) => Promise<void>;
  connectGoogle: () => Promise<boolean>;
  disconnectGoogle: () => void;
  syncWithGoogle: () => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  loading: false,
  error: null,
  googleConnected: false,
  
  fetchEvents: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('calendar_events')
        .select('*')
        .order('start_time');
      
      if (startDate) {
        query = query.gte('start_time', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('start_time', endDate.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      set({ events: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  addEvent: async (event) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([event])
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({
        events: [...state.events, data],
        loading: false,
      }));
      
      // If Google is connected, sync the event
      if (get().googleConnected) {
        // This would be implemented with the Google Calendar API
        // For now, we'll just set the google_event_id to a placeholder
        await supabase
          .from('calendar_events')
          .update({ google_event_id: `google_${data.id}` })
          .eq('id', data.id);
      }
      
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },
  
  updateEvent: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({
        events: state.events.map((event) => 
          event.id === id ? data : event
        ),
        loading: false,
      }));
      
      // If Google is connected and the event has a Google ID, update it there too
      if (get().googleConnected && data.google_event_id) {
        // This would be implemented with the Google Calendar API
      }
      
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },
  
  deleteEvent: async (id) => {
    set({ loading: true, error: null });
    try {
      // First, get the event to check if it has a Google ID
      const { data: eventData } = await supabase
        .from('calendar_events')
        .select('google_event_id')
        .eq('id', id)
        .single();
      
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        events: state.events.filter((event) => event.id !== id),
        loading: false,
      }));
      
      // If Google is connected and the event has a Google ID, delete it there too
      if (get().googleConnected && eventData?.google_event_id) {
        // This would be implemented with the Google Calendar API
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  connectGoogle: async () => {
    set({ loading: true, error: null });
    try {
      // This would be implemented with the Google OAuth flow
      // For now, we'll just simulate a successful connection
      set({ googleConnected: true, loading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },
  
  disconnectGoogle: () => {
    // This would be implemented with the Google OAuth flow
    // For now, we'll just simulate disconnecting
    set({ googleConnected: false });
  },
  
  syncWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      if (!get().googleConnected) {
        throw new Error('Google Calendar is not connected');
      }
      
      // This would be implemented with the Google Calendar API
      // For now, we'll just simulate a successful sync
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
