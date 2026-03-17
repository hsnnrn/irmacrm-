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
      customers: {
        Row: {
          id: string
          company_name: string
          tax_id: string | null
          contact_person: string | null
          email: string | null
          phone: string | null
          risk_limit: number
          current_balance: number
          previous_year_balance: number
          account_currency: string
          created_at: string
        }
        Insert: {
          id?: string
          company_name: string
          tax_id?: string | null
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          risk_limit?: number
          current_balance?: number
          previous_year_balance?: number
          account_currency?: string
          created_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          tax_id?: string | null
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          risk_limit?: number
          current_balance?: number
          previous_year_balance?: number
          account_currency?: string
          created_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          company_name: string
          tax_id: string | null
          payment_term_days: number
          is_blacklisted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          company_name: string
          tax_id?: string | null
          payment_term_days?: number
          is_blacklisted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          tax_id?: string | null
          payment_term_days?: number
          is_blacklisted?: boolean
          created_at?: string
        }
      }
      positions: {
        Row: {
          id: string
          position_no: number
          customer_id: string | null
          supplier_id: string | null
          loading_point: string
          unloading_point: string
          cargo_description: string | null
          sales_price: number | null
          sales_currency: string
          cost_price: number | null
          cost_currency: string
          estimated_profit: number | null
          exchange_rates_snapshot: Json | null
          sales_exchange_rate?: number | null
          cost_exchange_rate?: number | null
          status: string
          supplier_ref_no: string | null
          departure_date: string | null
          delivery_date: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          position_no?: number
          customer_id?: string | null
          supplier_id?: string | null
          loading_point: string
          unloading_point: string
          cargo_description?: string | null
          sales_price?: number | null
          sales_currency?: string
          cost_price?: number | null
          cost_currency?: string
          estimated_profit?: number | null
          exchange_rates_snapshot?: Json | null
          status?: string
          supplier_ref_no?: string | null
          departure_date?: string | null
          delivery_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          position_no?: number
          customer_id?: string | null
          supplier_id?: string | null
          loading_point?: string
          unloading_point?: string
          cargo_description?: string | null
          sales_price?: number | null
          sales_currency?: string
          cost_price?: number | null
          cost_currency?: string
          estimated_profit?: number | null
          exchange_rates_snapshot?: Json | null
          status?: string
          supplier_ref_no?: string | null
          departure_date?: string | null
          delivery_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      route_stops: {
        Row: {
          id: string
          position_id: string
          location_name: string
          stop_order: number
          stop_type: string
          created_at: string
        }
        Insert: {
          id?: string
          position_id: string
          location_name: string
          stop_order: number
          stop_type: string
          created_at?: string
        }
        Update: {
          id?: string
          position_id?: string
          location_name?: string
          stop_order?: number
          stop_type?: string
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          position_id: string
          type: string
          file_url: string
          file_path: string | null
          uploaded_by: string | null
          is_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          position_id: string
          type: string
          file_url: string
          file_path?: string | null
          uploaded_by?: string | null
          is_verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          position_id?: string
          type?: string
          file_url?: string
          file_path?: string | null
          uploaded_by?: string | null
          is_verified?: boolean
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          position_id: string
          invoice_type: string
          amount: number
          currency: string
          invoice_date: string
          due_date: string | null
          is_paid: boolean
          created_at: string
        }
        Insert: {
          id?: string
          position_id: string
          invoice_type: string
          amount: number
          currency: string
          invoice_date: string
          due_date?: string | null
          is_paid?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          position_id?: string
          invoice_type?: string
          amount?: number
          currency?: string
          invoice_date?: string
          due_date?: string | null
          is_paid?: boolean
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          created_at?: string
        }
      }
      position_trips: {
        Row: {
          id: string
          position_id: string
          trip_no: number
          loading_point: string
          unloading_point: string
          cargo_description: string | null
          departure_date: string | null
          delivery_date: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          position_id: string
          trip_no?: number
          loading_point: string
          unloading_point: string
          cargo_description?: string | null
          departure_date?: string | null
          delivery_date?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          position_id?: string
          trip_no?: number
          loading_point?: string
          unloading_point?: string
          cargo_description?: string | null
          departure_date?: string | null
          delivery_date?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customer_payments: {
        Row: {
          id: string
          customer_id: string
          movement_type: 'BORC' | 'ALACAK'
          description: string | null
          invoice_no: string | null
          amount: number
          currency: string
          payment_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          movement_type?: 'BORC' | 'ALACAK'
          description?: string | null
          invoice_no?: string | null
          amount: number
          currency?: string
          payment_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          movement_type?: 'BORC' | 'ALACAK'
          description?: string | null
          invoice_no?: string | null
          amount?: number
          currency?: string
          payment_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Enums: {
      user_role: "SUPER_ADMIN" | "EMPLOYEE" | "READ_ONLY"
      position_status:
        | "DRAFT"
        | "READY_TO_DEPART"
        | "IN_TRANSIT"
        | "DELIVERED"
        | "COMPLETED"
        | "CANCELLED"
      currency_code: "TRY" | "USD" | "EUR" | "RUB"
      doc_type:
        | "DRIVER_LICENSE"
        | "VEHICLE_LICENSE"
        | "INSURANCE"
        | "TRANSPORT_CONTRACT"
        | "CMR"
        | "SALES_INVOICE"
        | "PURCHASE_INVOICE"
    }
  }
}

