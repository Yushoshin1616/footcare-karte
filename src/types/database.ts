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
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          memo: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          memo?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          memo?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      records: {
        Row: {
          id: string;
          customer_id: string;
          treatment_date: string;
          photo_paths: string[];
          memo: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          customer_id: string;
          treatment_date: string;
          photo_paths?: string[];
          memo?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          customer_id?: string;
          treatment_date?: string;
          photo_paths?: string[];
          memo?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      record_history: {
        Row: {
          id: string;
          record_id: string;
          treatment_date: string;
          photo_paths: string[];
          memo: string;
          snapshot_at: string;
          edited_by: string | null;
          reason: string;
        };
        Insert: {
          id?: string;
          record_id: string;
          treatment_date: string;
          photo_paths?: string[];
          memo?: string;
          snapshot_at?: string;
          edited_by?: string | null;
          reason?: string;
        };
        Update: {
          id?: string;
          record_id?: string;
          treatment_date?: string;
          photo_paths?: string[];
          memo?: string;
          snapshot_at?: string;
          edited_by?: string | null;
          reason?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
