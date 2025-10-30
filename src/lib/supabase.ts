import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          cpf: string
          role: 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          cpf: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          cpf?: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
      }
      applicants: {
        Row: {
          id: string
          name: string
          type: string
          cnpj: string | null
          cpf: string | null
          email: string
          phone: string
          address: string
          city: string
          state: string
          zip_code: string
          responsible_person: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          cnpj?: string | null
          cpf?: string | null
          email: string
          phone: string
          address: string
          city: string
          state: string
          zip_code: string
          responsible_person?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          cnpj?: string | null
          cpf?: string | null
          email?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          responsible_person?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      consent_requests: {
        Row: {
          id: string
          data_user: string
          data_user_type: string
          data_owner: string
          cpf: string
          data_types: string[]
          purpose: string
          legal_basis: string
          deadline: string
          controller: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          approved_at: string | null
          rejected_at: string | null
          revoked_at: string | null
          last_modified: string
          scopes: string[] | null
          token_id: string | null
        }
        Insert: {
          id?: string
          data_user: string
          data_user_type: string
          data_owner: string
          cpf: string
          data_types: string[]
          purpose: string
          legal_basis: string
          deadline: string
          controller: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          approved_at?: string | null
          rejected_at?: string | null
          revoked_at?: string | null
          last_modified?: string
          scopes?: string[] | null
          token_id?: string | null
        }
        Update: {
          id?: string
          data_user?: string
          data_user_type?: string
          data_owner?: string
          cpf?: string
          data_types?: string[]
          purpose?: string
          legal_basis?: string
          deadline?: string
          controller?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          approved_at?: string | null
          rejected_at?: string | null
          revoked_at?: string | null
          last_modified?: string
          scopes?: string[] | null
          token_id?: string | null
        }
      }
      consent_actions: {
        Row: {
          id: string
          consent_id: string
          action: 'created' | 'approved' | 'rejected' | 'revoked'
          timestamp: string
          performed_by: 'user' | 'system'
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          consent_id: string
          action: 'created' | 'approved' | 'rejected' | 'revoked'
          timestamp?: string
          performed_by: 'user' | 'system'
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          consent_id?: string
          action?: 'created' | 'approved' | 'rejected' | 'revoked'
          timestamp?: string
          performed_by?: 'user' | 'system'
          reason?: string | null
          created_at?: string
        }
      }
    }
  }
}