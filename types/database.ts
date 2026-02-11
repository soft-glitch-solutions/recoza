export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          full_name: string;
          phone_number: string | null;
          is_collector: boolean;
          collector_approved: boolean;
          invite_code: string | null;
          referred_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone_number?: string | null;
          is_collector?: boolean;
          collector_approved?: boolean;
          invite_code?: string | null;
          referred_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone_number?: string | null;
          is_collector?: boolean;
          collector_approved?: boolean;
          invite_code?: string | null;
          referred_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      collector_applications: {
        Row: {
          id: string;
          user_id: string;
          motivation: string;
          area: string;
          status: 'pending' | 'approved' | 'rejected';
          applied_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          motivation: string;
          area: string;
          status?: 'pending' | 'approved' | 'rejected';
          applied_at?: string;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          motivation?: string;
          area?: string;
          status?: 'pending' | 'approved' | 'rejected';
          applied_at?: string;
          reviewed_at?: string | null;
        };
      };
      recyclable_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          estimated_price_per_kg: number;
          icon_name: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          estimated_price_per_kg?: number;
          icon_name?: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          estimated_price_per_kg?: number;
          icon_name?: string;
          active?: boolean;
          created_at?: string;
        };
      };
      logged_items: {
        Row: {
          id: string;
          household_id: string;
          recyclable_type_id: string;
          quantity: number;
          estimated_weight_kg: number;
          notes: string | null;
          logged_at: string;
          collected: boolean;
          collection_id: string | null;
        };
        Insert: {
          id?: string;
          household_id: string;
          recyclable_type_id: string;
          quantity?: number;
          estimated_weight_kg?: number;
          notes?: string | null;
          logged_at?: string;
          collected?: boolean;
          collection_id?: string | null;
        };
        Update: {
          id?: string;
          household_id?: string;
          recyclable_type_id?: string;
          quantity?: number;
          estimated_weight_kg?: number;
          notes?: string | null;
          logged_at?: string;
          collected?: boolean;
          collection_id?: string | null;
        };
      };
      collections: {
        Row: {
          id: string;
          collector_id: string;
          household_id: string;
          scheduled_date: string;
          status: 'scheduled' | 'completed' | 'cancelled';
          total_weight_kg: number | null;
          estimated_earnings: number;
          actual_earnings: number | null;
          notes: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          collector_id: string;
          household_id: string;
          scheduled_date: string;
          status?: 'scheduled' | 'completed' | 'cancelled';
          total_weight_kg?: number | null;
          estimated_earnings?: number;
          actual_earnings?: number | null;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          collector_id?: string;
          household_id?: string;
          scheduled_date?: string;
          status?: 'scheduled' | 'completed' | 'cancelled';
          total_weight_kg?: number | null;
          estimated_earnings?: number;
          actual_earnings?: number | null;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type CollectorApplication =
  Database['public']['Tables']['collector_applications']['Row'];
export type RecyclableType =
  Database['public']['Tables']['recyclable_types']['Row'];
export type LoggedItem = Database['public']['Tables']['logged_items']['Row'];
export type Collection = Database['public']['Tables']['collections']['Row'];
