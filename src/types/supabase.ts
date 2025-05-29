export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          phone: string | null
          company: string | null
          status: string
          tags: string[] | null
          notes: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email: string
          phone?: string | null
          company?: string | null
          status?: string
          tags?: string[] | null
          notes?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
          phone?: string | null
          company?: string | null
          status?: string
          tags?: string[] | null
          notes?: string | null
          user_id?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          created_at: string
          name: string
          subject: string
          content: string
          status: string
          scheduled_for: string | null
          sent_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          subject: string
          content: string
          status?: string
          scheduled_for?: string | null
          sent_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          subject?: string
          content?: string
          status?: string
          scheduled_for?: string | null
          sent_at?: string | null
          user_id?: string
        }
      }
      campaign_contacts: {
        Row: {
          id: string
          campaign_id: string
          contact_id: string
          status: string
          opened_at: string | null
          clicked_at: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          contact_id: string
          status?: string
          opened_at?: string | null
          clicked_at?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          contact_id?: string
          status?: string
          opened_at?: string | null
          clicked_at?: string | null
        }
      }
      funnels: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          stages: Json[]
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          stages?: Json[]
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          stages?: Json[]
          user_id?: string
        }
      }
      funnel_contacts: {
        Row: {
          id: string
          funnel_id: string
          contact_id: string
          stage: string
          entered_at: string
        }
        Insert: {
          id?: string
          funnel_id: string
          contact_id: string
          stage: string
          entered_at?: string
        }
        Update: {
          id?: string
          funnel_id?: string
          contact_id?: string
          stage?: string
          entered_at?: string
        }
      }
      events: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          contact_id: string | null
          user_id: string
          google_event_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          contact_id?: string | null
          user_id: string
          google_event_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          contact_id?: string | null
          user_id?: string
          google_event_id?: string | null
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          email_signature: string | null
          logo_url: string | null
          google_refresh_token: string | null
        }
        Insert: {
          id?: string
          user_id: string
          email_signature?: string | null
          logo_url?: string | null
          google_refresh_token?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          email_signature?: string | null
          logo_url?: string | null
          google_refresh_token?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
